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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Convert OpenAI-style messages to Gemini format
    const geminiContents = [];
    
    // Add system instruction as first user turn context
    geminiContents.push({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    geminiContents.push({
      role: "model",
      parts: [{ text: "Understood. I'll act as the AI recruiter assistant with those guidelines." }]
    });

    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE stream to OpenAI-compatible SSE stream for the frontend
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
              // Re-emit as OpenAI-compatible SSE
              const openAIChunk = {
                choices: [{ delta: { content } }]
              };
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
            }
          } catch {
            // skip unparseable chunks
          }
        }
      },
      flush(controller) {
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      }
    });

    const readable = response.body!.pipeThrough(transformStream);

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("recruiter-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
