export type Stage = 'applied' | 'assessment' | 'ai-interview' | 'recruiter-screen' | 'offer' | 'rejected';

export type StageStatus = 'not_started' | 'in_progress' | 'submitted' | 'passed' | 'failed' | 'needs_retry';

export interface TimelineStep {
  stage: Stage;
  label: string;
  date?: string;
  completed: boolean;
  current: boolean;
}

export interface Deadline {
  label: string;
  date: string;
}

export interface Message {
  id: string;
  from: string;
  content: string;
  date: string;
  isRecruiter: boolean;
}

// Hiring Plan types
export interface AssessmentTask {
  id: string;
  type: 'mcq' | 'short_answer' | 'case_study' | 'coding' | 'portfolio' | 'design_task';
  question: string;
  options?: string[]; // for MCQ
  expectedFormat?: string;
}

export interface HiringPlanStage {
  key: Stage;
  label: string;
  description: string;
  expectedDays: number;
  gateType: 'ai_evaluated' | 'completion';
  assessmentType?: string;
  tasks?: AssessmentTask[];
  passingCriteria?: string;
  interviewStyle?: string;
  questionSet?: string[];
  screenFocusAreas?: string[];
  offerChecklist?: string[];
  stageObjective?: string;
}

export interface RoleRubric {
  weightedSkills: { skill: string; weight: number }[];
  thresholds: { pass: number; retry: number };
}

export interface HiringPlan {
  stages: HiringPlanStage[];
  roleRubric: RoleRubric;
}

export interface GateResult {
  decision: 'pass' | 'fail' | 'retry';
  score: number;
  reasons: string[];
  improvements: string[];
  nextStageKey: Stage | null;
}

export interface StageState {
  currentStageKey: Stage;
  statuses: Record<string, StageStatus>;
  attempts: Record<string, number>;
  artifacts: Record<string, Record<string, string>>; // stageKey -> { fieldId: value }
  gateResults: Record<string, GateResult>;
  lastSubmittedAt: Record<string, string>;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  stage: Stage;
  timeline: TimelineStep[];
  jobDescription: string;
  deadlines: Deadline[];
  messages: Message[];
  hiringPlan?: HiringPlan;
  stageState?: StageState;
}

export interface ResumeContact {
  name: string;
  email: string;
  phone: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}

export interface Education {
  school: string;
  degree: string;
  year: string;
}

export interface ResumeSections {
  contact: ResumeContact;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export interface ResumeHealth {
  clarity: number;
  relevance: number;
  atsFriendliness: number;
  impact: number;
}

export interface TailoredDraft {
  summary: string;
  bullets: { original: string; improved: string }[];
  suggestedKeywords: string[];
  atsMatchPercentage: number;
}

export interface User {
  email: string;
  resumeText: string;
  resumeSections: ResumeSections | null;
  resumeHealth: ResumeHealth | null;
  tailoredDrafts: Record<string, TailoredDraft>;
}
