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

    case 'mock_interview_feedback':
      return {
        strengths: [
          'Clear and structured communication',
          'Good use of specific examples with metrics',
          'Demonstrates ownership and impact',
        ],
        improvements: [
          'Could elaborate more on the "why" behind technical decisions',
          'Consider adding the business impact, not just technical metrics',
          'Try to be more concise in your opening — get to the key point faster',
        ],
        starCheck: {
          situation: true,
          task: true,
          action: true,
          result: payload.answer?.includes('%') || payload.answer?.length > 100,
        },
        suggestedAnswer: `In my previous role at Figma, our team faced a critical performance bottleneck in the canvas rendering engine (Situation). I was tasked with identifying the root cause and implementing optimizations without breaking existing functionality (Task). I profiled the rendering pipeline, identified redundant re-renders in the layer composition step, and implemented a caching strategy with incremental updates (Action). This resulted in a 28% improvement in frame rates for complex files, directly improving the experience for our enterprise customers and reducing support tickets by 15% (Result).`,
        confidenceScore: Math.floor(65 + Math.random() * 25),
      };

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