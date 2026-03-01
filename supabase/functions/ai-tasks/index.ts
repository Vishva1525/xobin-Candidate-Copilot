import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function buildPrompt(task: string, payload: Record<string, any>): string {
  switch (task) {
    case 'tailor_resume_to_jd':
      return `You are an expert resume consultant. Analyze this resume and tailor it for the given job description.

Resume text:
${payload.resumeText || ''}

Job Description:
${payload.jd || ''}

Return a JSON object with this exact structure:
{
  "summary": "A tailored professional summary (2-3 sentences)",
  "bullets": [
    { "original": "original bullet text", "improved": "improved bullet text" }
  ],
  "suggestedKeywords": ["keyword1", "keyword2"],
  "atsMatchPercentage": 85
}

Provide 4-6 improved bullets. Focus on quantifiable achievements, action verbs, and alignment with the job description. Return ONLY valid JSON, no markdown.`;

    case 'generate_interview_questions':
      return `You are a senior technical interviewer. Generate interview questions based on this job description.

Job Description:
${payload.jd || ''}

Return a JSON object with this exact structure:
{
  "behavioral": ["question1", "question2", "question3", "question4", "question5"],
  "technical": ["question1", "question2", "question3", "question4", "question5"],
  "roleSpecific": ["question1", "question2", "question3"]
}

Make questions specific to the role. Return ONLY valid JSON, no markdown.`;

    case 'mock_interview_feedback':
      return `You are an expert interview coach. Evaluate this interview answer.

Question: ${payload.question || ''}
Answer: ${payload.answer || ''}

Evaluate using this rubric:
- Relevance (0-25): Does the answer address the question?
- STAR format (0-25): Does it follow Situation, Task, Action, Result?
- Evidence (0-25): Are there specific metrics, examples, data?
- Role Alignment (0-15): Does it connect to the target role?
- Clarity (0-10): Is it well-structured and concise?

Return a JSON object with this exact structure:
{
  "score": 72,
  "rubricBreakdown": { "relevance": 20, "star": 15, "evidence": 18, "roleAlignment": 10, "clarity": 9 },
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "starAnalysis": {
    "situation": "detected text or null",
    "task": "detected text or null",
    "action": "detected text or null",
    "result": "detected text or null",
    "missing": ["Result"]
  },
  "rewrittenAnswer": "A model STAR answer for this question",
  "nextQuestion": "A follow-up question"
}

Be honest and constructive. Return ONLY valid JSON, no markdown.`;

    case 'interviewer_turn':
      return `You are a senior technical interviewer conducting a behavioral interview for a ${payload.application?.role || 'software engineer'} role.

Previous conversation:
${(payload.history || []).map((h: any) => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n')}

Current question: ${payload.question || ''}
Candidate's answer: ${payload.candidateAnswer || ''}

Evaluation scores: ${JSON.stringify(payload.evaluation || {})}

Respond naturally as an interviewer would. Reference something specific the candidate said. Then ask a follow-up that probes deeper based on the quality of their answer.

Return a JSON object with this exact structure:
{
  "interviewerResponse": "Your natural response acknowledging their answer",
  "followUpQuestion": "Your follow-up question",
  "responseIntent": "probe|deepen|challenge",
  "referencedSnippet": "a short quote from their answer you're referencing",
  "nextQuestionOverride": null
}

Return ONLY valid JSON, no markdown.`;

    case 'stage_explainer':
      return `You are a career coach. Explain what the "${payload.stage || 'assessment'}" stage means in a tech interview process.

Return a JSON object with this exact structure:
{
  "explanation": "Brief explanation of this stage",
  "whatToExpect": "What the candidate should expect",
  "typicalTimeline": "Expected timeline",
  "tips": ["tip1", "tip2", "tip3", "tip4"]
}

Be specific and actionable. Return ONLY valid JSON, no markdown.`;

    case 'parse_resume_feedback':
      return `You are a resume expert. Analyze this resume and provide a health assessment.

Resume text:
${payload.resumeText || ''}

Return a JSON object with this exact structure:
{
  "health": {
    "clarity": 82,
    "relevance": 75,
    "atsFriendliness": 68,
    "impact": 79
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"]
}

Score each dimension 0-100. Be honest. Return ONLY valid JSON, no markdown.`;

    case 'draft_follow_up_email':
      return `You are a career coach helping a candidate write a professional follow-up email.

Role: ${payload.role || 'the position'}
Company: ${payload.company || 'the company'}
Current Stage: ${payload.stage || 'screening'}

Write a concise, professional follow-up email that:
- Is warm but not desperate
- References the specific role
- Shows continued interest
- Is appropriate for the current hiring stage

Return a JSON object:
{
  "email": "Subject: ...\\n\\nDear ...\\n\\n..."
}

Return ONLY valid JSON, no markdown.`;

    case 'dashboard_insights':
      return `You are a career coach providing dashboard insights for a candidate.

Role: ${payload.roleTitle || 'Software Development Engineer'}
Company: ${payload.company || 'Xobin'}
Current Stage: ${payload.currentStage || 'assessment'}
Job Description: ${payload.jobDescription || ''}
Resume Summary: ${payload.resumeSummary || 'Not provided'}
Deadlines: ${JSON.stringify(payload.deadlines || [])}

Provide a concise dashboard overview for the candidate.

Return a JSON object:
{
  "stageSummary": "2-3 sentence explanation of the current stage",
  "companyBackground": "What the company is doing now (1-2 sentences)",
  "nextSteps": ["step1", "step2", "step3"],
  "recommendedActions": [{"label": "action label", "actionKey": "resume_lab|prep_studio|contact"}],
  "faqSuggestions": ["question1", "question2", "question3"]
}

Return ONLY valid JSON, no markdown.`;

    case 'ai_companion_answer':
      return `You are an AI career companion for a candidate applying to ${payload.company || 'Xobin'} for the ${payload.roleTitle || 'Software Development Engineer'} role.

Current Stage: ${payload.currentStage || 'assessment'}
Job Description: ${payload.jobDescription || ''}
Resume: ${payload.resumeText || 'Not provided'}

The candidate asks: "${payload.userQuestion || ''}"

Provide a helpful, concise answer (3-5 sentences) that is specific to their role and stage. Be encouraging but honest.

Return a JSON object:
{
  "answer": "Your concise helpful answer",
  "followUpSuggestions": ["follow-up question 1", "follow-up question 2"]
}

Return ONLY valid JSON, no markdown.`;

    default:
      return `Return: {"error": "Unknown task: ${task}"}`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, payload } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(task, payload || {});

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
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

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Extract JSON from the response (handle possible markdown wrapping)
    let jsonStr = text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse Gemini response as JSON:", jsonStr.slice(0, 200));
      result = { error: "Failed to parse AI response", raw: jsonStr.slice(0, 500) };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-tasks error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
