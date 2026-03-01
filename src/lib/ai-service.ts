// Demo mode AI service — returns realistic mocked results
// Connect Lovable Cloud + Gemini for real AI responses

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

type AITask =
  | 'parse_resume_feedback'
  | 'tailor_resume_to_jd'
  | 'skill_gap_analysis'
  | 'generate_interview_questions'
  | 'mock_interview_feedback'
  | 'stage_explainer'
  | 'recruiter_followup_email'
  | 'rewrite_bullets';

export async function callAI(task: AITask, payload: Record<string, any>): Promise<any> {
  // Simulate network delay
  await delay(1200 + Math.random() * 800);
  return getDemoResponse(task, payload);
}

// ---- Answer analysis helpers for realistic scoring ----

function analyzeAnswerQuality(answer: string, question: string) {
  const wordCount = answer.trim().split(/\s+/).length;
  const hasMetrics = /\d+%|\d+x|\$\d+|\d+\s*(users|customers|team|engineers|developers|projects|months|weeks|days|hours)/i.test(answer);
  const hasSpecificExample = /at\s+\w+|when\s+I|my\s+team|our\s+team|I\s+led|I\s+built|I\s+designed|I\s+implemented/i.test(answer);
  
  // STAR detection
  const hasSituation = /situation|context|background|at\s+\w+.*(?:we|our|the\s+team)|challenge|problem|issue/i.test(answer);
  const hasTask = /task|responsible|needed\s+to|had\s+to|goal|objective|my\s+role/i.test(answer);
  const hasAction = /I\s+(?:led|built|designed|implemented|created|developed|analyzed|collaborated|proposed|decided|chose|refactored|wrote|shipped|deployed)/i.test(answer);
  const hasResult = /result|outcome|increased|decreased|improved|reduced|achieved|led\s+to|saved|generated|\d+%/i.test(answer);

  const starParts = { situation: hasSituation, task: hasTask, action: hasAction, result: hasResult };
  const starCount = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length;

  // Relevance: does answer relate to the question keywords?
  const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  const answerLower = answer.toLowerCase();
  const relevantWords = questionWords.filter(w => answerLower.includes(w));
  const relevanceRatio = questionWords.length > 0 ? relevantWords.length / questionWords.length : 0;

  return { wordCount, hasMetrics, hasSpecificExample, starParts, starCount, relevanceRatio };
}

function computeRubricScores(answer: string, question: string) {
  const analysis = analyzeAnswerQuality(answer, question);
  const { wordCount, hasMetrics, hasSpecificExample, starCount, relevanceRatio } = analysis;

  // Relevance (0-25): based on word count, relevance to question
  let relevance = 5;
  if (wordCount > 20) relevance += 5;
  if (wordCount > 50) relevance += 5;
  if (relevanceRatio > 0.3) relevance += 5;
  if (relevanceRatio > 0.6) relevance += 5;
  relevance = Math.min(25, relevance);

  // STAR (0-25): based on STAR parts present
  let star = starCount * 6;
  star = Math.min(25, Math.max(0, star));

  // Evidence (0-25): metrics, specifics, examples
  let evidence = 3;
  if (hasMetrics) evidence += 10;
  if (hasSpecificExample) evidence += 7;
  if (wordCount > 80) evidence += 3;
  if (wordCount > 150) evidence += 2;
  evidence = Math.min(25, evidence);

  // Role alignment (0-15): use word count and specificity as proxy
  let roleAlignment = 3;
  if (hasSpecificExample) roleAlignment += 5;
  if (hasMetrics) roleAlignment += 4;
  if (wordCount > 60) roleAlignment += 3;
  roleAlignment = Math.min(15, roleAlignment);

  // Clarity (0-10): sentence structure, word count, not too short
  let clarity = 2;
  if (wordCount > 30) clarity += 3;
  if (wordCount > 60 && wordCount < 300) clarity += 3;
  if (wordCount > 300) clarity -= 1; // too verbose
  if (hasSpecificExample) clarity += 2;
  clarity = Math.min(10, Math.max(0, clarity));

  const total = relevance + star + evidence + roleAlignment + clarity;

  return {
    score: total,
    rubricBreakdown: { relevance, star, evidence, roleAlignment, clarity },
    analysis,
  };
}

function generateFeedback(score: number, analysis: ReturnType<typeof analyzeAnswerQuality>, question: string, answer: string) {
  const { wordCount, hasMetrics, hasSpecificExample, starParts, starCount } = analysis;
  
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Strengths
  if (hasMetrics) strengths.push('Good use of quantifiable metrics to demonstrate impact');
  if (hasSpecificExample) strengths.push('Includes a specific example from your experience');
  if (starCount >= 3) strengths.push('Answer follows a structured format with clear components');
  if (wordCount > 80) strengths.push('Sufficient detail provided to understand the scenario');
  if (starParts.action) strengths.push('Clearly articulates the actions you personally took');
  if (starParts.result && hasMetrics) strengths.push('Results are backed by measurable outcomes');

  // Always add at least one strength
  if (strengths.length === 0) {
    if (wordCount > 20) strengths.push('Shows willingness to engage with the question');
    else strengths.push('Attempted to address the question topic');
  }

  // Improvements — be honest
  if (!hasMetrics) improvements.push('Add specific metrics or numbers — "improved performance" is weaker than "improved load time by 40%"');
  if (!hasSpecificExample) improvements.push('Ground your answer in a specific, real experience rather than speaking hypothetically');
  if (!starParts.situation) improvements.push('Start with the Situation — give context about when/where this happened and what the challenge was');
  if (!starParts.task) improvements.push('Clarify your specific Task or responsibility — what was expected of you personally?');
  if (!starParts.action) improvements.push('Describe the concrete Actions you took — use "I" not "we" to show ownership');
  if (!starParts.result) improvements.push('End with a clear Result — ideally quantified. What was the measurable outcome?');
  if (wordCount < 30) improvements.push('Your answer is too brief. Expand with a specific scenario and walk through what happened step by step');
  if (wordCount > 250) improvements.push('Your answer is quite lengthy. Try to be more concise — focus on the most impactful details');

  // Always at least one improvement
  if (improvements.length === 0) {
    improvements.push('Consider adding the business impact beyond just technical metrics');
  }

  // STAR analysis with extracted snippets or null
  const starAnalysis = {
    situation: starParts.situation ? 'Situation context detected' : null,
    task: starParts.task ? 'Task/responsibility identified' : null,
    action: starParts.action ? 'Specific actions described' : null,
    result: starParts.result ? 'Results/outcomes mentioned' : null,
    missing: [] as string[],
  };
  if (!starParts.situation) starAnalysis.missing.push('Situation');
  if (!starParts.task) starAnalysis.missing.push('Task');
  if (!starParts.action) starAnalysis.missing.push('Action');
  if (!starParts.result) starAnalysis.missing.push('Result');

  return { strengths: strengths.slice(0, 4), improvements: improvements.slice(0, 4), starAnalysis };
}

function getDemoResponse(task: AITask, payload: Record<string, any>): any {
  switch (task) {
    case 'parse_resume_feedback':
      return {
        health: {
          clarity: 82,
          relevance: 75,
          atsFriendliness: 68,
          impact: 79,
        },
        suggestions: [
          'Add more quantifiable metrics to your bullet points',
          'Include relevant keywords from target job descriptions',
          'Consider adding a "Projects" section for side work',
          'Your summary could be more targeted to specific roles',
        ],
      };

    case 'tailor_resume_to_jd':
      return {
        summary: `Results-driven frontend engineer with 6+ years building high-performance web applications at scale. Expert in React, TypeScript, and design systems with a proven track record of improving developer productivity and user experience. Passionate about clean architecture, accessibility, and pixel-perfect implementation.`,
        bullets: [
          {
            original: 'Led development of the Variables feature, used by 2M+ designers for design token management',
            improved: 'Architected and led development of the Variables feature — a design token management system adopted by 2M+ designers, directly supporting the design-to-code workflow central to modern frontend development',
          },
          {
            original: 'Built a component library with 40+ accessible components, reducing dev time by 35%',
            improved: 'Designed and built a comprehensive component library (40+ WCAG-compliant components) that reduced feature development time by 35% and established the foundation for a scalable design system',
          },
          {
            original: 'Optimized canvas rendering pipeline, improving frame rates by 28% on complex files',
            improved: 'Led performance optimization of the canvas rendering pipeline using profiling and algorithmic improvements, achieving 28% faster frame rates and significantly improving UX for enterprise users',
          },
          {
            original: 'Implemented real-time log streaming with WebSocket, reducing debugging time by 40%',
            improved: 'Engineered real-time log streaming using WebSocket architecture, reducing developer debugging time by 40% and supporting 100K+ daily active users on the deployment dashboard',
          },
          {
            original: 'Created automated visual regression testing suite, catching 95% of UI bugs pre-release',
            improved: 'Built an automated visual regression testing framework integrated into CI/CD, catching 95% of UI bugs before release and establishing quality gates adopted across 3 engineering teams',
          },
          {
            original: 'Reduced page load time from 4.2s to 1.8s through code splitting and lazy loading',
            improved: 'Achieved 57% improvement in page load times (4.2s → 1.8s) through strategic code splitting, lazy loading, and bundle optimization — directly improving user retention metrics',
          },
        ],
        suggestedKeywords: [
          'Design Systems', 'Accessibility (a11y)', 'Web Performance', 'React Architecture',
          'TypeScript', 'Component Libraries', 'CI/CD', 'Cross-functional Collaboration',
          'Mentorship', 'Figma Integration',
        ],
        atsMatchPercentage: 87,
      };

    case 'skill_gap_analysis':
      return {
        matchingSkills: ['React', 'TypeScript', 'Design Systems', 'Performance Optimization', 'Testing', 'Mentorship'],
        missingSkills: [
          { skill: 'GraphQL', priority: 'high', reason: 'Listed as a core requirement. Your REST API experience is transferable.' },
          { skill: 'Playwright', priority: 'medium', reason: 'Mentioned in testing requirements. Similar to your Cypress experience.' },
          { skill: 'Payments/Fintech', priority: 'low', reason: 'Listed as nice-to-have. Your Stripe integration experience partially covers this.' },
        ],
        recommendations: [
          'Complete a GraphQL fundamentals course (Apollo docs are excellent, ~4 hours)',
          'Build a small project with Playwright to demonstrate familiarity',
          'Highlight your Stripe integration experience more prominently',
        ],
        overallMatch: 78,
      };

    case 'generate_interview_questions':
      return {
        behavioral: [
          'Tell me about a time you had to make a difficult technical decision with incomplete information.',
          'Describe a situation where you disagreed with a design decision. How did you handle it?',
          'How do you approach mentoring junior engineers? Give a specific example.',
          'Tell me about a project that failed or didn\'t meet expectations. What did you learn?',
          'Describe your process for breaking down a large, ambiguous project into manageable pieces.',
        ],
        technical: [
          'How would you architect a component library that needs to support theming and accessibility?',
          'Walk me through how you\'d optimize a React application that\'s experiencing slow renders.',
          'How do you approach testing in a large frontend codebase? What\'s your testing strategy?',
          'Explain your understanding of React\'s rendering model and how you\'d debug performance issues.',
          'How would you design a real-time collaborative editing feature?',
        ],
        roleSpecific: [
          'What\'s your experience with design systems? How do you balance flexibility and consistency?',
          'How do you approach cross-browser compatibility and responsive design?',
          'Describe your ideal CI/CD pipeline for a frontend application.',
        ],
      };

    case 'mock_interview_feedback': {
      const answer = payload.answer || '';
      const question = payload.question || '';
      const { score, rubricBreakdown, analysis } = computeRubricScores(answer, question);
      const { strengths, improvements, starAnalysis } = generateFeedback(score, analysis, question, answer);

      // Generate a contextual rewritten answer
      const rewrittenAnswer = `In my previous role at [Company], our team faced a critical challenge with [specific problem related to the question] (Situation). I was responsible for [specific task] (Task). I took the initiative to [concrete actions: analyzed the problem, proposed a solution, implemented changes, collaborated with stakeholders] (Action). As a result, we achieved [specific measurable outcome, e.g., 30% improvement in key metric, reduced incidents by X, shipped Y weeks ahead of schedule] (Result). This experience taught me [key takeaway relevant to the role].`;

      const nextQuestion = score > 60
        ? 'Can you tell me more about the technical decisions you made and any tradeoffs you considered?'
        : 'Could you walk me through a more specific example where you personally drove the outcome?';

      return {
        score,
        rubricBreakdown,
        strengths,
        improvements,
        starAnalysis,
        rewrittenAnswer,
        nextQuestion,
        // Keep backward compat
        confidenceScore: score,
        starCheck: {
          situation: analysis.starParts.situation,
          task: analysis.starParts.task,
          action: analysis.starParts.action,
          result: analysis.starParts.result,
        },
        suggestedAnswer: rewrittenAnswer,
      };
    }

    case 'stage_explainer':
      return {
        explanation: 'This stage involves a structured evaluation of your technical skills and problem-solving abilities.',
        whatToExpect: 'You\'ll typically receive a take-home assignment or online assessment that tests relevant skills for the role.',
        typicalTimeline: '3–7 days to complete, with results within 5 business days.',
        tips: [
          'Read all instructions carefully before starting',
          'Focus on code quality over completeness',
          'Document your thought process and tradeoffs',
          'Test your solution thoroughly',
        ],
      };

    case 'recruiter_followup_email':
      return {
        subject: `Following up on ${payload.role || 'my application'} — ${payload.company || 'your team'}`,
        body: `Hi ${payload.recruiterName || 'there'},

Thank you for the update on my application for the ${payload.role || 'position'}. I'm very excited about the opportunity to contribute to ${payload.company || 'your team'}.

I wanted to follow up and express my continued interest in the role. I've been researching ${payload.company || 'the company'}'s recent work and am particularly excited about the potential to contribute to the team's goals.

Is there anything additional I can provide at this stage? I'm happy to share more about my experience or answer any questions.

Looking forward to hearing from you.

Best regards,
[Your Name]`,
      };

    case 'rewrite_bullets':
      return {
        bullets: [
          {
            original: payload.bullets?.[0] || 'Worked on frontend features',
            improved: 'Architected and delivered 12+ customer-facing features using React and TypeScript, improving user engagement by 23% as measured by session duration',
          },
          {
            original: payload.bullets?.[1] || 'Fixed bugs and improved code',
            improved: 'Reduced bug backlog by 40% through systematic refactoring and implementation of automated testing coverage (unit + integration), achieving 92% test coverage across core modules',
          },
          {
            original: payload.bullets?.[2] || 'Collaborated with team members',
            improved: 'Led cross-functional collaboration with design and product teams through weekly syncs and shared documentation, reducing feature handoff time by 30% and eliminating 85% of post-launch design discrepancies',
          },
        ],
      };

    default:
      return { error: 'Unknown task' };
  }
}
