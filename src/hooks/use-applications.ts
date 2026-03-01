import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { Application, Stage, TimelineStep } from '@/lib/types';
import { mockApplications } from '@/lib/mock-data';

const DEMO_EMAIL = 'vishwa@demo.com';

function getStorageKey(email: string) {
  return `candidateOS:${email}:applications`;
}

function generateTimeline(stage: Stage): TimelineStep[] {
  const stages: { stage: Stage; label: string }[] = [
    { stage: 'applied', label: 'Applied' },
    { stage: 'assessment', label: 'Assessment' },
    { stage: 'ai-interview', label: 'AI Interview' },
    { stage: 'recruiter-screen', label: 'Recruiter Screen' },
    { stage: 'offer', label: 'Offer' },
  ];

  const currentIdx = stages.findIndex(s => s.stage === stage);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return stages.map((s, i) => ({
    ...s,
    completed: i < currentIdx,
    current: i === currentIdx,
    date: i <= currentIdx ? today : undefined,
  }));
}

function getInitialApps(email: string): Application[] {
  // Check localStorage first
  try {
    const stored = window.localStorage.getItem(getStorageKey(email));
    if (stored) return JSON.parse(stored);
  } catch {}

  // Seed demo user
  if (email === DEMO_EMAIL) {
    window.localStorage.setItem(getStorageKey(email), JSON.stringify(mockApplications));
    return mockApplications;
  }

  return [];
}

export function useApplications() {
  const [email] = useLocalStorage<string | null>('candidateos_email', null);
  const key = email ? getStorageKey(email) : 'candidateOS:_none_:applications';
  const initial = email ? getInitialApps(email) : [];
  const [applications, setApplications] = useLocalStorage<Application[]>(key, initial);

  const addApplication = useCallback((data: {
    role: string;
    company: string;
    location: string;
    stage: Stage;
    jobDescription: string;
    deadlineLabel?: string;
    deadlineDate?: string;
  }) => {
    const id = crypto.randomUUID();
    const newApp: Application = {
      id,
      role: data.role,
      company: data.company || 'Unknown Company',
      location: data.location || 'Remote',
      stage: data.stage,
      timeline: generateTimeline(data.stage),
      jobDescription: data.jobDescription || 'No description provided.',
      deadlines: data.deadlineLabel && data.deadlineDate
        ? [{ label: data.deadlineLabel, date: data.deadlineDate }]
        : [],
      messages: [],
    };

    setApplications(prev => {
      const updated = [...prev, newApp];
      if (email) {
        window.localStorage.setItem(getStorageKey(email), JSON.stringify(updated));
      }
      return updated;
    });

    return newApp;
  }, [email, setApplications]);

  const getApplication = useCallback((id: string) => {
    return applications.find(a => a.id === id) || null;
  }, [applications]);

  return { applications, addApplication, getApplication };
}
