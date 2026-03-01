export type Stage = 'applied' | 'assessment' | 'ai-interview' | 'recruiter-screen' | 'offer' | 'rejected';

export type UnifiedStageKey = 'applied' | 'screening' | 'assessment' | 'ai_interview' | 'recruiter_review' | 'offer' | 'rejected';

export interface StageTimelineEntry {
  key: UnifiedStageKey;
  label: string;
  status: 'completed' | 'active' | 'upcoming' | 'rejected';
  etaText: string;
  candidateExpectation: string;
  companyBackground: string;
  lastUpdatedAt: string;
}

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
  stageTimeline?: StageTimelineEntry[];
  lastActivityAt?: string;
  typicalResponseDays?: number;
  handlerRole?: string;
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