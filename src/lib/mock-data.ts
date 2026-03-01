import { Application, StageTimelineEntry } from './types';

function generateStageTimeline(currentStage: string, roleType: 'tech' | 'design'): StageTimelineEntry[] {
  const stageOrder = ['applied', 'screening', 'assessment', 'ai_interview', 'recruiter_review', 'offer'] as const;
  const stageLabels: Record<string, string> = {
    applied: 'Applied',
    screening: 'Screening',
    assessment: 'Assessment',
    ai_interview: 'AI Interview',
    recruiter_review: 'Recruiter Review',
    offer: 'Offer',
  };
  
  // Map old stage keys to new unified keys
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

  const techGuidance: Record<string, { candidate: string; company: string; eta: string }> = {
    applied: { candidate: 'No action needed — sit tight.', company: 'Reviewing your resume against role requirements.', eta: '3–5 days' },
    screening: { candidate: 'Be available for a quick call. Check your email for scheduling.', company: 'HR is reviewing your profile and may schedule a brief call.', eta: '2–4 days' },
    assessment: { candidate: 'Complete the coding challenge. Focus on clean code and edge cases.', company: 'Engineering team will review your submission against a rubric.', eta: '3–7 days' },
    ai_interview: { candidate: 'Practice STAR answers. Test your audio/video setup.', company: 'AI system evaluates communication and problem-solving.', eta: '1–2 days' },
    recruiter_review: { candidate: 'Prepare questions about team and role. Know your salary range.', company: 'Hiring manager reviews all scores and makes a recommendation.', eta: '3–5 days' },
    offer: { candidate: 'Review the full package. Take time to decide.', company: 'Drafting and sending your offer letter.', eta: '2–5 days' },
  };

  const designGuidance: Record<string, { candidate: string; company: string; eta: string }> = {
    applied: { candidate: 'No action needed — your portfolio is being reviewed.', company: 'Design lead is reviewing your portfolio and case studies.', eta: '3–7 days' },
    screening: { candidate: 'Be ready for a culture-fit call. Prepare your "why" story.', company: 'Recruiter evaluating initial fit and communication.', eta: '2–4 days' },
    assessment: { candidate: 'Complete the design challenge. Show process, not just polish.', company: 'Design team reviews your challenge against craft standards.', eta: '5–7 days' },
    ai_interview: { candidate: 'Walk through a case study with clear structure. Test A/V.', company: 'AI evaluates design thinking and presentation skills.', eta: '1–2 days' },
    recruiter_review: { candidate: 'Prepare design critique talking points. Know your growth goals.', company: 'Design lead + hiring manager make a joint decision.', eta: '3–5 days' },
    offer: { candidate: 'Review leveling, scope, and team composition.', company: 'Preparing offer details and discussing start date.', eta: '2–5 days' },
  };

  const guidance = roleType === 'design' ? designGuidance : techGuidance;
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

export const mockApplications: Application[] = [
  {
    id: 'stripe-sfe',
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    location: 'San Francisco, CA · Remote',
    stage: 'assessment',
    timeline: [
      { stage: 'applied', label: 'Applied', date: 'Feb 12', completed: true, current: false },
      { stage: 'assessment', label: 'Technical Assessment', date: 'Feb 18', completed: false, current: true },
      { stage: 'ai-interview', label: 'AI Interview', completed: false, current: false },
      { stage: 'recruiter-screen', label: 'Recruiter Screen', completed: false, current: false },
      { stage: 'offer', label: 'Offer', completed: false, current: false },
    ],
    stageTimeline: generateStageTimeline('assessment', 'tech'),
    lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    typicalResponseDays: 5,
    handlerRole: 'Recruiting Coordinator',
    jobDescription: `About the Role
We're looking for a Senior Frontend Engineer to join our Dashboard team at Stripe. You'll build the tools that millions of businesses use to manage their payments infrastructure.

Responsibilities
• Design and implement complex, interactive UI components for the Stripe Dashboard
• Collaborate with product designers and backend engineers to deliver end-to-end features
• Improve frontend architecture, testing, and build tooling
• Mentor junior engineers and contribute to technical strategy
• Drive performance optimizations across the dashboard experience

Requirements
• 5+ years of professional frontend development experience
• Expert knowledge of React, TypeScript, and modern CSS
• Experience with design systems and component libraries
• Strong understanding of web performance, accessibility, and responsive design
• Experience with testing frameworks (Jest, Cypress, Playwright)
• Excellent communication skills and ability to work cross-functionally

Nice to Have
• Experience with payments or fintech products
• Familiarity with GraphQL and REST API design
• Contributions to open-source projects
• Experience building developer-facing tools`,
    deadlines: [
      { label: 'Assessment due', date: 'Feb 25, 2025' },
      { label: 'Expected response by', date: 'Mar 3, 2025' },
    ],
    messages: [
      {
        id: 'm1',
        from: 'Sarah Chen',
        content: 'Hi! Thanks for applying to the Senior Frontend Engineer role. We were impressed with your background and would love to move forward with a technical assessment. You\'ll have 7 days to complete it.',
        date: 'Feb 18, 2025',
        isRecruiter: true,
      },
      {
        id: 'm2',
        from: 'You',
        content: 'Thank you, Sarah! I\'m excited about this opportunity. I\'ll start the assessment this weekend. Is there anything specific I should focus on?',
        date: 'Feb 18, 2025',
        isRecruiter: false,
      },
      {
        id: 'm3',
        from: 'Sarah Chen',
        content: 'Great to hear! The assessment focuses on building a small React application. Focus on clean code, TypeScript usage, and component architecture. Good luck!',
        date: 'Feb 19, 2025',
        isRecruiter: true,
      },
    ],
  },
  {
    id: 'linear-pd',
    company: 'Linear',
    role: 'Product Designer',
    location: 'New York, NY · Hybrid',
    stage: 'ai-interview',
    timeline: [
      { stage: 'applied', label: 'Applied', date: 'Feb 5', completed: true, current: false },
      { stage: 'assessment', label: 'Portfolio Review', date: 'Feb 10', completed: true, current: false },
      { stage: 'ai-interview', label: 'AI Interview', date: 'Feb 20', completed: false, current: true },
      { stage: 'recruiter-screen', label: 'Design Lead Chat', completed: false, current: false },
      { stage: 'offer', label: 'Offer', completed: false, current: false },
    ],
    stageTimeline: generateStageTimeline('ai-interview', 'design'),
    lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    typicalResponseDays: 3,
    handlerRole: 'Hiring Manager',
    jobDescription: `About the Role
Linear is looking for a Product Designer who obsesses over craft and simplicity. You'll shape the future of how software teams plan and build products.

Responsibilities
• Design end-to-end product experiences from concept to pixel-perfect implementation
• Create interactive prototypes to validate design decisions quickly
• Work closely with engineering to ensure design fidelity in production
• Contribute to and evolve the Linear design system
• Conduct user research and synthesize findings into actionable insights

Requirements
• 4+ years of product design experience at a software company
• Exceptional visual design skills with strong typography and layout sense
• Proficiency in Figma and prototyping tools
• Portfolio demonstrating systematic thinking and attention to detail
• Experience designing developer tools or productivity software
• Strong written and verbal communication skills

Nice to Have
• Experience with motion design and micro-interactions
• Familiarity with CSS, React, or frontend development
• Background in design systems at scale
• Experience with B2B SaaS products`,
    deadlines: [
      { label: 'AI Interview scheduled', date: 'Feb 22, 2025' },
      { label: 'Design challenge due', date: 'Feb 28, 2025' },
    ],
    messages: [
      {
        id: 'm1',
        from: 'Alex Rivera',
        content: 'Hey! Your portfolio really stood out to us, especially the design system work. We\'d like to invite you to our AI-powered interview round. It\'s a conversational format — no trick questions.',
        date: 'Feb 15, 2025',
        isRecruiter: true,
      },
      {
        id: 'm2',
        from: 'You',
        content: 'Thanks Alex! That means a lot. I\'m available this week for the AI interview. Looking forward to discussing the role further.',
        date: 'Feb 15, 2025',
        isRecruiter: false,
      },
    ],
  },
];

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
      meaning: 'Your application has been submitted and is in the review queue. A recruiter or hiring manager will review your profile against the role requirements.',
      timeline: 'Most companies respond within 1–2 weeks. Some high-volume roles may take longer.',
      tips: ['Follow up after 1 week if you haven\'t heard back', 'Continue applying to other roles', 'Prepare your portfolio or work samples'],
    },
    assessment: {
      meaning: 'You\'ve been selected for a technical or skills assessment. This typically involves a take-home project, online coding challenge, or portfolio review.',
      timeline: 'Assessments usually have a 3–7 day completion window. Results come within 3–5 business days after submission.',
      tips: ['Read all instructions carefully before starting', 'Focus on clean, well-documented code', 'Test edge cases', 'Submit early if possible'],
    },
    'ai-interview': {
      meaning: 'You\'ll have a structured interview powered by AI. This evaluates your communication skills, problem-solving approach, and cultural fit through conversational questions.',
      timeline: 'AI interviews typically take 30–45 minutes. Results are usually processed within 24–48 hours.',
      tips: ['Use the STAR method for behavioral questions', 'Speak clearly and take your time', 'Have specific examples ready', 'Test your audio/video setup beforehand'],
    },
    'recruiter-screen': {
      meaning: 'A recruiter or hiring manager wants to have a live conversation with you. This is typically a 30-minute call covering your background, motivation, and logistics.',
      timeline: 'Recruiter screens are usually scheduled within 1 week. Decisions come within 2–3 business days after.',
      tips: ['Research the company thoroughly', 'Prepare questions about the team and role', 'Know your salary expectations', 'Be ready to discuss your timeline'],
    },
    offer: {
      meaning: 'Congratulations! The company wants to make you an offer. You\'ll receive details about compensation, benefits, and start date.',
      timeline: 'Offer letters are typically sent within 2–5 business days. You usually have 1–2 weeks to decide.',
      tips: ['Review the full compensation package', 'Don\'t rush your decision', 'It\'s okay to negotiate respectfully', 'Ask about team, growth, and culture'],
    },
    rejected: {
      meaning: 'Unfortunately, the company has decided not to move forward. This doesn\'t reflect your worth — hiring is often about fit and timing.',
      timeline: 'Consider asking for feedback if none was provided.',
      tips: ['Request specific feedback for growth', 'Don\'t take it personally', 'Keep your momentum going', 'Each interview is practice for the next one'],
    },
  };
  return info[stage] || info.applied;
};