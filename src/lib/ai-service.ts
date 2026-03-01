// AI service — calls Gemini API via edge function for real AI responses

const AI_TASKS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tasks`;

type AITask =
  | 'parse_resume_feedback'
  | 'tailor_resume_to_jd'
  | 'generate_interview_questions'
  | 'mock_interview_feedback'
  | 'interviewer_turn'
  | 'stage_explainer'
  | 'draft_follow_up_email';

export async function callAI(task: AITask, payload: Record<string, any>): Promise<any> {
  try {
    const resp = await fetch(AI_TASKS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ task, payload }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed (${resp.status})`);
    }

    return await resp.json();
  } catch (e: any) {
    console.error(`AI task "${task}" failed:`, e.message);
    // Return fallback so UI doesn't break
    return getFallbackResponse(task, payload);
  }
}

// Minimal fallback responses in case the API is unreachable
function getFallbackResponse(task: AITask, payload: Record<string, any>): any {
  switch (task) {
    case 'parse_resume_feedback':
      return {
        health: { clarity: 70, relevance: 65, atsFriendliness: 60, impact: 65 },
        suggestions: ['Unable to analyze — please check your connection and try again.'],
      };
    case 'tailor_resume_to_jd':
      return {
        summary: 'Unable to generate — please try again.',
        bullets: [],
        suggestedKeywords: [],
        atsMatchPercentage: 0,
      };
    case 'generate_interview_questions':
      return {
        behavioral: ['Tell me about a challenging project you worked on.'],
        technical: ['How would you approach designing a scalable system?'],
        roleSpecific: ['What interests you about this role?'],
      };
    case 'mock_interview_feedback':
      return {
        score: 50,
        rubricBreakdown: { relevance: 10, star: 10, evidence: 10, roleAlignment: 10, clarity: 10 },
        strengths: ['Unable to evaluate — please try again.'],
        improvements: [],
        starAnalysis: { situation: null, task: null, action: null, result: null, missing: ['Situation', 'Task', 'Action', 'Result'] },
        rewrittenAnswer: '',
        nextQuestion: 'Could you try answering again?',
        confidenceScore: 50,
        starCheck: { situation: false, task: false, action: false, result: false },
        suggestedAnswer: '',
      };
    case 'interviewer_turn':
      return {
        interviewerResponse: "I'd like to hear more about that.",
        followUpQuestion: 'Can you walk me through a specific example?',
        responseIntent: 'probe',
        referencedSnippet: '',
        nextQuestionOverride: null,
      };
    case 'stage_explainer':
      return {
        explanation: 'This stage involves evaluating your skills.',
        whatToExpect: 'You may receive an assessment or interview invitation.',
        typicalTimeline: '3-7 business days.',
        tips: ['Prepare thoroughly', 'Research the company', 'Practice common questions'],
      };
    case 'draft_follow_up_email':
      return {
        email: `Subject: Following Up — ${payload.role || 'Application'} at ${payload.company || 'Company'}\n\nDear Hiring Team,\n\nI hope this message finds you well. I wanted to follow up on my application for the ${payload.role || 'position'} role. I remain very enthusiastic about the opportunity and would love to learn about any updates regarding the process.\n\nPlease don't hesitate to reach out if you need any additional information from my end.\n\nBest regards`,
      };
    default:
      return { error: 'Unknown task' };
  }
}
