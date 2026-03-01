import { HiringPlan, AssessmentTask, StageState } from './types';

function detectRoleCategory(roleTitle: string): 'technical' | 'design' | 'data' {
  const lower = roleTitle.toLowerCase();
  if (/design|ux|ui|product design|visual|creative/i.test(lower)) return 'design';
  if (/data|analyst|scientist|machine learning|ml|analytics|bi\b/i.test(lower)) return 'data';
  return 'technical';
}

function technicalTasks(): AssessmentTask[] {
  return [
    { id: 't1', type: 'mcq', question: 'Which hook should you use to memoize expensive computations in React?', options: ['useEffect', 'useMemo', 'useCallback', 'useRef'] },
    { id: 't2', type: 'short_answer', question: 'Explain the difference between Server-Side Rendering and Static Site Generation. When would you use each?' },
    { id: 't3', type: 'coding', question: 'Write a function that debounces another function with a given delay. Include TypeScript types.', expectedFormat: 'code' },
    { id: 't4', type: 'short_answer', question: 'How would you optimize a React application that renders 10,000 items in a list?' },
    { id: 't5', type: 'case_study', question: 'A page takes 8 seconds to load. Walk through your debugging and optimization process step by step.' },
  ];
}

function designTasks(): AssessmentTask[] {
  return [
    { id: 'd1', type: 'portfolio', question: 'Share a link to your portfolio or case study that best demonstrates your design process.' },
    { id: 'd2', type: 'design_task', question: 'Redesign a checkout flow for a mobile e-commerce app. Describe your approach, key decisions, and tradeoffs.' },
    { id: 'd3', type: 'short_answer', question: 'How do you balance user needs with business goals when they conflict? Give a specific example.' },
    { id: 'd4', type: 'short_answer', question: 'Describe your process for conducting and synthesizing user research into actionable design changes.' },
  ];
}

function dataTasks(): AssessmentTask[] {
  return [
    { id: 'da1', type: 'coding', question: 'Write a SQL query to find the top 5 customers by total order value in the last 90 days, including their order count.', expectedFormat: 'sql' },
    { id: 'da2', type: 'case_study', question: 'A product manager asks why signups dropped 15% last week. How would you investigate?' },
    { id: 'da3', type: 'short_answer', question: 'Explain the difference between correlation and causation with a real-world example.' },
    { id: 'da4', type: 'short_answer', question: 'How would you design an A/B test to measure the impact of a new onboarding flow?' },
    { id: 'da5', type: 'mcq', question: 'Which metric best measures user engagement for a SaaS product?', options: ['Page views', 'DAU/MAU ratio', 'Total signups', 'Bounce rate'] },
  ];
}

export function generateDemoHiringPlan(roleTitle: string, _jobDescription?: string): HiringPlan {
  const category = detectRoleCategory(roleTitle);

  const assessmentTypeMap = {
    technical: 'Coding Challenge + System Design',
    design: 'Portfolio Review + Design Task',
    data: 'SQL + Analytics Case Study',
  };

  const interviewStyleMap = {
    technical: 'Technical + Behavioral (system design, code review, STAR)',
    design: 'Design Critique + Portfolio Walkthrough',
    data: 'Case Study Discussion + Metrics Deep-dive',
  };

  const screenFocusMap = {
    technical: ['Project discussion', 'System tradeoffs', 'Team collaboration', 'Compensation expectations'],
    design: ['Collaboration', 'Design process', 'Feedback handling', 'Compensation expectations'],
    data: ['Business impact', 'Stakeholder communication', 'Analytics storytelling', 'Compensation expectations'],
  };

  const taskMap = { technical: technicalTasks(), design: designTasks(), data: dataTasks() };

  const skillsMap = {
    technical: [
      { skill: 'Problem solving', weight: 30 },
      { skill: 'Code quality', weight: 25 },
      { skill: 'System design', weight: 20 },
      { skill: 'Communication', weight: 15 },
      { skill: 'Cultural fit', weight: 10 },
    ],
    design: [
      { skill: 'Visual craft', weight: 25 },
      { skill: 'UX thinking', weight: 25 },
      { skill: 'Process rigor', weight: 20 },
      { skill: 'Communication', weight: 15 },
      { skill: 'Collaboration', weight: 15 },
    ],
    data: [
      { skill: 'Analytical thinking', weight: 30 },
      { skill: 'SQL proficiency', weight: 20 },
      { skill: 'Business acumen', weight: 20 },
      { skill: 'Communication', weight: 15 },
      { skill: 'Tool proficiency', weight: 15 },
    ],
  };

  return {
    stages: [
      {
        key: 'applied',
        label: 'Applied',
        description: 'Application submitted and under review by the hiring team.',
        expectedDays: 5,
        stageObjective: 'Get your application noticed and move to evaluation.',
      },
      {
        key: 'assessment',
        label: 'Assessment',
        description: `Complete the ${assessmentTypeMap[category]} to demonstrate your skills.`,
        expectedDays: 7,
        assessmentType: assessmentTypeMap[category],
        tasks: taskMap[category],
        stageObjective: `Demonstrate your ${category === 'technical' ? 'technical' : category === 'design' ? 'design' : 'analytical'} capabilities.`,
      },
      {
        key: 'ai-interview',
        label: 'AI Interview',
        description: `${interviewStyleMap[category]} format interview.`,
        expectedDays: 3,
        interviewStyle: interviewStyleMap[category],
        stageObjective: 'Demonstrate communication, problem-solving, and role fit through conversation.',
      },
      {
        key: 'recruiter-screen',
        label: 'Recruiter Screen',
        description: 'Structured conversation covering role motivation, team fit, and logistics.',
        expectedDays: 5,
        screenFocusAreas: screenFocusMap[category],
        stageObjective: 'Demonstrate alignment with team culture and role expectations.',
      },
      {
        key: 'offer',
        label: 'Offer',
        description: 'Review and respond to your offer package.',
        expectedDays: 14,
        offerChecklist: ['Review compensation package', 'Confirm start date', 'Complete background check', 'Sign offer letter'],
        stageObjective: 'Finalize your acceptance and prepare for onboarding.',
      },
    ],
    roleRubric: {
      weightedSkills: skillsMap[category],
    },
  };
}

export function createInitialStageState(startStage: string = 'applied'): StageState {
  const allStages = ['applied', 'assessment', 'ai-interview', 'recruiter-screen', 'offer'];
  const statuses: Record<string, any> = {};
  allStages.forEach(s => {
    statuses[s] = s === startStage ? 'in_progress' : 'not_started';
  });

  return {
    currentStageKey: startStage as any,
    statuses,
  };
}
