import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { Application, Stage, StageState } from '@/lib/types';
import { mockApplications } from '@/lib/mock-data';
import { generateDemoHiringPlan, createInitialStageState } from '@/lib/hiring-plan-templates';
import { callAI } from '@/lib/ai-service';

const DEMO_EMAIL = 'vishwa@demo.com';

function getStorageKey(email: string) {
  return `candidateOS:${email}:applications`;
}

function generateTimeline(stage: Stage) {
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

function addHiringPlanToMock(app: Application): Application {
  if (app.hiringPlan) return app;
  return {
    ...app,
    hiringPlan: generateDemoHiringPlan(app.role, app.jobDescription),
    stageState: createInitialStageState(app.stage),
  };
}

function getInitialApps(email: string): Application[] {
  try {
    const stored = window.localStorage.getItem(getStorageKey(email));
    if (stored) return JSON.parse(stored);
  } catch {}
  if (email === DEMO_EMAIL) {
    const apps = mockApplications.map(addHiringPlanToMock);
    window.localStorage.setItem(getStorageKey(email), JSON.stringify(apps));
    return apps;
  }
  return [];
}

export function useApplications() {
  const [email] = useLocalStorage<string | null>('candidateos_email', null);
  const key = email ? getStorageKey(email) : 'candidateOS:_none_:applications';
  const initial = email ? getInitialApps(email) : [];
  const [applications, setApplications] = useLocalStorage<Application[]>(key, initial);

  const persist = useCallback((apps: Application[]) => {
    if (email) {
      window.localStorage.setItem(getStorageKey(email), JSON.stringify(apps));
    }
  }, [email]);

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
    const hiringPlan = generateDemoHiringPlan(data.role, data.jobDescription);
    const stageState = createInitialStageState(data.stage);
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
      hiringPlan,
      stageState,
    };
    setApplications(prev => {
      const updated = [...prev, newApp];
      persist(updated);
      return updated;
    });

    // Try to generate AI hiring plan in background (non-blocking)
    if (data.jobDescription && data.jobDescription.length > 20) {
      callAI('generate_hiring_plan', {
        roleTitle: data.role,
        jobDescription: data.jobDescription,
      }).then(result => {
        if (result && result.stages && !result.error) {
          setApplications(prev => {
            const updated = prev.map(a => a.id === id ? { ...a, hiringPlan: result } : a);
            persist(updated);
            return updated;
          });
        }
      }).catch(() => {});
    }

    return newApp;
  }, [email, setApplications, persist]);

  const getApplication = useCallback((id: string) => {
    return applications.find(a => a.id === id) || null;
  }, [applications]);

  const updateApplication = useCallback((id: string, updates: Partial<Application>) => {
    setApplications(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      persist(updated);
      return updated;
    });
  }, [setApplications, persist]);

  const advanceStage = useCallback((appId: string, nextStage: Stage) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setApplications(prev => {
      const updated = prev.map(a => {
        if (a.id !== appId) return a;
        const currentStage = a.stageState?.currentStageKey || a.stage;
        const newTimeline = a.timeline.map(step => {
          if (step.stage === currentStage) return { ...step, completed: true, current: false, date: step.date || today };
          if (step.stage === nextStage) return { ...step, current: true, date: today };
          return step;
        });
        const newStatuses = { ...(a.stageState?.statuses || {}), [currentStage]: 'completed' as const, [nextStage]: 'in_progress' as const };
        return {
          ...a,
          stage: nextStage,
          timeline: newTimeline,
          stageState: {
            ...(a.stageState || createInitialStageState(a.stage)),
            currentStageKey: nextStage,
            statuses: newStatuses,
          },
        };
      });
      persist(updated);
      return updated;
    });
  }, [setApplications, persist]);

  return { applications, addApplication, getApplication, updateApplication, advanceStage };
}
