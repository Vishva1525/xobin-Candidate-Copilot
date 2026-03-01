import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const { role, company, stage, jobDescription } = context || {};

    const systemPrompt = `You are a friendly, professional AI recruiter assistant for ${company || 'the company'}. The candidate has applied for the "${role || 'the position'}" role and is currently at the "${stage || 'applied'}" stage.

Job Description:
${jobDescription || 'Not provided'}

Your responsibilities:
- Answer questions about the interview process, timeline, and what to expect at each stage
- Provide guidance on how to prepare for the current and upcoming stages
- Give honest, helpful advice about the role and company
- If asked something you don't know (like specific internal company policies), say so honestly
- Keep responses concise (2-4 sentences unless more detail is needed)
- Be encouraging but realistic — don't over-promise
- Never make up specific dates, salaries, or internal details you don't have

Stages in order: Applied → Assessment → AI Interview → Recruiter Screen → Offer
Current stage: ${stage || 'applied'}`;

    // Try Gemini direct first, fall back to Lovable AI
    let response: Response | null = null;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (GEMINI_API_KEY) {
      try {
        const geminiContents = [];
        geminiContents.push({ role: "user", parts: [{ text: systemPrompt }] });
        geminiContents.push({ role: "model", parts: [{ text: "Understood. I'll act as the AI recruiter assistant with those guidelines." }] });
        for (const msg of messages) {
          geminiContents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }

        const geminiResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: geminiContents,
              generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
          }
        );

        if (geminiResp.ok) {
          // Transform Gemini SSE to OpenAI-compatible SSE
          const transformStream = new TransformStream({
            transform(chunk, controller) {
              const text = new TextDecoder().decode(chunk);
              const lines = text.split('\n');
              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`));
                  }
                } catch { /* skip */ }
              }
            },
            flush(controller) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            }
          });
          response = new Response(geminiResp.body!.pipeThrough(transformStream), {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        } else {
          console.log("Gemini returned", geminiResp.status, "- falling back to Lovable AI");
        }
      } catch (e) {
        console.log("Gemini error, falling back:", (e as Error).message);
      }
    }

    // Fallback: Lovable AI Gateway
    if (!response) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "AI not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const lovableResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      });

      if (!lovableResp.ok) {
        const t = await lovableResp.text();
        console.error("Lovable AI error:", lovableResp.status, t);
        return new Response(JSON.stringify({ error: "AI service error" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      response = new Response(lovableResp.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return response;
  } catch (e) {
    console.error("recruiter-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
