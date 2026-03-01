import { Application, StageTimelineEntry } from './types';

function generateStageTimeline(currentStage: string): StageTimelineEntry[] {
  const stageOrder = ['applied', 'screening', 'assessment', 'ai_interview', 'recruiter_review', 'offer'] as const;
  const stageLabels: Record<string, string> = {
    applied: 'Applied',
    screening: 'Screening',
    assessment: 'Assessment',
    ai_interview: 'AI Interview',
    recruiter_review: 'Recruiter Review',
    offer: 'Offer',
  };

  const stageKeyMap: Record<string, string> = {
    applied: 'applied',
    assessment: 'assessment',
    'ai-interview': 'ai_interview',
    'recruiter-screen': 'recruiter_review',
    offer: 'offer',
    rejected: 'rejected',
  };
  const mappedCurrent = stageKeyMap[currentStage] || currentStage;
  const currentIdx = stageOrder.indexOf(mappedCurrent as any);

  const guidance: Record<string, { candidate: string; company: string; eta: string }> = {
    applied: { candidate: 'No action needed — sit tight.', company: 'Reviewing your resume against role requirements.', eta: '3–5 days' },
    screening: { candidate: 'Be available for a quick call. Check your email for scheduling.', company: 'HR is reviewing your profile and may schedule a brief call.', eta: '2–4 days' },
    assessment: { candidate: 'Complete the coding challenge. Focus on clean code and edge cases.', company: 'Engineering team will review your submission against a rubric.', eta: '3–7 days' },
    ai_interview: { candidate: 'Practice STAR answers. Test your audio/video setup.', company: 'AI system evaluates communication and problem-solving.', eta: '1–2 days' },
    recruiter_review: { candidate: 'Prepare questions about team and role. Know your salary range.', company: 'Hiring manager reviews all scores and makes a recommendation.', eta: '3–5 days' },
    offer: { candidate: 'Review the full package. Take time to decide.', company: 'Drafting and sending your offer letter.', eta: '2–5 days' },
  };

  const now = new Date();

  return stageOrder.map((key, i) => {
    let status: StageTimelineEntry['status'] = 'upcoming';
    if (i < currentIdx) status = 'completed';
    else if (i === currentIdx) status = 'active';

    const g = guidance[key];
    const dayOffset = (i - currentIdx) * 3;
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);

    return {
      key,
      label: stageLabels[key],
      status,
      etaText: g.eta,
      candidateExpectation: g.candidate,
      companyBackground: g.company,
      lastUpdatedAt: date.toISOString(),
    };
  });
}

// Single application for Xobin SDE
export const xobinApplication: Application = {
  id: 'xobin-sde',
  company: 'Xobin',
  role: 'Software Development Engineer',
  location: 'Remote',
  stage: 'assessment',
  timeline: [
    { stage: 'applied', label: 'Applied', date: 'Feb 12', completed: true, current: false },
    { stage: 'assessment', label: 'Technical Assessment', date: 'Feb 18', completed: false, current: true },
    { stage: 'ai-interview', label: 'AI Interview', completed: false, current: false },
    { stage: 'recruiter-screen', label: 'Recruiter Review', completed: false, current: false },
    { stage: 'offer', label: 'Offer', completed: false, current: false },
  ],
  stageTimeline: generateStageTimeline('assessment'),
  lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  typicalResponseDays: 5,
  handlerRole: 'Recruiting Coordinator',
  jobDescription: `About the Role
We're looking for a Software Development Engineer to join our engineering team at Xobin. You'll build and enhance our AI-powered talent assessment platform used by 800+ companies worldwide.

Responsibilities
• Design and implement scalable backend services and APIs for the assessment platform
• Build interactive, accessible front-end interfaces for candidates and recruiters
• Collaborate with product and data science teams to deliver end-to-end features
• Write clean, testable code with comprehensive unit and integration tests
• Participate in architecture reviews, code reviews, and technical planning
• Optimize platform performance for high-concurrency assessment sessions

Requirements
• 2+ years of professional software development experience
• Strong proficiency in JavaScript/TypeScript, React, and Node.js
• Experience with relational databases (PostgreSQL preferred)
• Solid understanding of RESTful API design and microservices architecture
• Familiarity with cloud platforms (AWS/GCP) and CI/CD pipelines
• Excellent problem-solving skills and attention to detail

Nice to Have
• Experience with assessment/EdTech platforms
• Familiarity with AI/ML pipelines and natural language processing
• Contributions to open-source projects
• Experience with real-time systems (WebSocket, server-sent events)`,
  deadlines: [
    { label: 'Assessment due', date: 'Mar 8, 2026' },
    { label: 'Expected response by', date: 'Mar 15, 2026' },
  ],
  messages: [
    {
      id: 'm1',
      from: 'Xobin Hiring Support',
      content: 'Hi! Thanks for applying to the Software Development Engineer role at Xobin. We were impressed with your profile and would love to move forward with a technical assessment. You\'ll have 7 days to complete it.',
      date: 'Feb 18, 2026',
      isRecruiter: true,
    },
    {
      id: 'm2',
      from: 'You',
      content: 'Thank you! I\'m excited about this opportunity. I\'ll start the assessment this weekend. Is there anything specific I should focus on?',
      date: 'Feb 18, 2026',
      isRecruiter: false,
    },
    {
      id: 'm3',
      from: 'Xobin Hiring Support',
      content: 'Great to hear! The assessment focuses on building a small React + Node.js application. Focus on clean code, TypeScript usage, and component architecture. Good luck!',
      date: 'Feb 19, 2026',
      isRecruiter: true,
    },
  ],
};

// Keep backward compat — mockApplications is a single-item array
export const mockApplications: Application[] = [xobinApplication];

export const sampleResumeText = `JORDAN MITCHELL
jordan.mitchell@email.com | (555) 123-4567 | San Francisco, CA

PROFESSIONAL SUMMARY
Frontend engineer with 6 years of experience building scalable web applications. Passionate about design systems, performance optimization, and creating delightful user experiences. Previously at Figma and Vercel.

SKILLS
React, TypeScript, JavaScript, Next.js, Node.js, GraphQL, REST APIs, CSS/Tailwind, Figma, Git, CI/CD, Jest, Playwright, Webpack, Vite, Design Systems, Accessibility, Performance Optimization

EXPERIENCE

Senior Frontend Engineer | Figma | 2021 – Present
• Led development of the Variables feature, used by 2M+ designers for design token management
• Built a component library with 40+ accessible components, reducing dev time by 35%
• Optimized canvas rendering pipeline, improving frame rates by 28% on complex files
• Mentored 4 junior engineers through structured growth plans and code reviews

Frontend Engineer | Vercel | 2019 – 2021
• Developed the deployment dashboard used by 100K+ developers daily
• Implemented real-time log streaming with WebSocket, reducing debugging time by 40%
• Created automated visual regression testing suite, catching 95% of UI bugs pre-release
• Collaborated with design team to ship the v2 dashboard redesign in 8 weeks

Junior Developer | Startup Co | 2018 – 2019
• Built customer-facing React application from scratch, serving 10K monthly active users
• Integrated Stripe payments and subscription management
• Reduced page load time from 4.2s to 1.8s through code splitting and lazy loading

EDUCATION
B.S. Computer Science | UC Berkeley | 2018`;

export const getStageInfo = (stage: string) => {
  const info: Record<string, { meaning: string; timeline: string; tips: string[] }> = {
    applied: {
      meaning: 'Your application has been submitted and is in the review queue. The Xobin hiring team will review your profile against the role requirements.',
      timeline: 'Xobin typically responds within 3–5 business days.',
      tips: ['Keep an eye on your email for updates', 'Review the job description again', 'Prepare your portfolio or work samples'],
    },
    assessment: {
      meaning: 'You\'ve been selected for a technical assessment. This typically involves a coding challenge on the Xobin platform.',
      timeline: 'Assessments usually have a 7-day completion window. Results come within 3–5 business days after submission.',
      tips: ['Read all instructions carefully before starting', 'Focus on clean, well-documented code', 'Test edge cases', 'Submit early if possible'],
    },
    'ai-interview': {
      meaning: 'You\'ll have a structured interview powered by AI. This evaluates your communication skills, problem-solving approach, and cultural fit through conversational questions.',
      timeline: 'AI interviews typically take 30–45 minutes. Results are usually processed within 24–48 hours.',
      tips: ['Use the STAR method for behavioral questions', 'Speak clearly and take your time', 'Have specific examples ready', 'Test your audio/video setup beforehand'],
    },
    'recruiter-screen': {
      meaning: 'The Xobin hiring team is reviewing your combined scores and assessment results. A recruiter may reach out for a brief conversation.',
      timeline: 'Reviews are typically completed within 3–5 business days.',
      tips: ['Research Xobin thoroughly', 'Prepare questions about the team and role', 'Know your salary expectations', 'Be ready to discuss your timeline'],
    },
    offer: {
      meaning: 'Congratulations! Xobin wants to make you an offer. You\'ll receive details about compensation, benefits, and start date.',
      timeline: 'Offer letters are typically sent within 2–5 business days. You usually have 1–2 weeks to decide.',
      tips: ['Review the full compensation package', 'Don\'t rush your decision', 'It\'s okay to negotiate respectfully', 'Ask about team, growth, and culture'],
    },
    rejected: {
      meaning: 'Unfortunately, Xobin has decided not to move forward at this time. This doesn\'t reflect your worth — hiring is often about fit and timing.',
      timeline: 'Consider asking for feedback if none was provided.',
      tips: ['Request specific feedback for growth', 'Don\'t take it personally', 'Keep your momentum going', 'Each interview is practice for the next one'],
    },
  };
  return info[stage] || info.applied;
};
