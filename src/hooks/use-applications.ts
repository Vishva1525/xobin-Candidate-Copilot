import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { xobinRoles, XobinRole } from '@/lib/xobin-roles';
import { xobinApplication } from '@/lib/mock-data';
import { Application, StageTimelineEntry } from '@/lib/types';

export interface LocalApplication {
  id: string;
  roleId: string;
  roleTitle: string;
  company: string;
  location: string;
  stage: string;
  status: 'active' | 'offered' | 'rejected';
  appliedAt: string;
  updatedAt: string;
}

function generateStageTimeline(currentStage: string): StageTimelineEntry[] {
  const stageOrder = ['applied', 'screening', 'assessment', 'ai_interview', 'recruiter_review', 'offer'] as const;
  const stageLabels: Record<string, string> = {
    applied: 'Applied', screening: 'Screening', assessment: 'Assessment',
    ai_interview: 'AI Interview', recruiter_review: 'Recruiter Review', offer: 'Offer',
  };
  const stageKeyMap: Record<string, string> = {
    applied: 'applied', assessment: 'assessment', 'ai-interview': 'ai_interview',
    'recruiter-screen': 'recruiter_review', offer: 'offer', rejected: 'rejected',
  };
  const mappedCurrent = stageKeyMap[currentStage] || currentStage;
  const currentIdx = stageOrder.indexOf(mappedCurrent as any);
  const now = new Date();

  return stageOrder.map((key, i) => {
    let status: StageTimelineEntry['status'] = 'upcoming';
    if (i < currentIdx) status = 'completed';
    else if (i === currentIdx) status = 'active';
    const dayOffset = (i - currentIdx) * 3;
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    return {
      key, label: stageLabels[key], status,
      etaText: '3–5 days',
      candidateExpectation: '', companyBackground: '',
      lastUpdatedAt: date.toISOString(),
    };
  });
}

function localAppToApplication(la: LocalApplication, role?: XobinRole): Application {
  // If it's the seed SDE application, return the rich mock data
  if (la.id === 'xobin-sde') return xobinApplication;

  return {
    id: la.id,
    company: la.company,
    role: la.roleTitle,
    location: la.location,
    stage: la.stage as any,
    timeline: [
      { stage: 'applied', label: 'Applied', completed: true, current: la.stage === 'applied' },
      { stage: 'assessment', label: 'Assessment', completed: false, current: la.stage === 'assessment' },
      { stage: 'ai-interview', label: 'AI Interview', completed: false, current: la.stage === 'ai-interview' },
      { stage: 'recruiter-screen', label: 'Recruiter Review', completed: false, current: la.stage === 'recruiter-screen' },
      { stage: 'offer', label: 'Offer', completed: false, current: la.stage === 'offer' },
    ],
    stageTimeline: generateStageTimeline(la.stage),
    lastActivityAt: la.updatedAt,
    typicalResponseDays: 5,
    handlerRole: 'Recruiting Coordinator',
    jobDescription: role?.jdFull || '',
    deadlines: [],
    messages: [],
  };
}

// Seed: the SDE application already exists
const SEED_APP: LocalApplication = {
  id: 'xobin-sde',
  roleId: 'xobin-sde',
  roleTitle: 'Software Development Engineer',
  company: 'xobin',
  location: 'Remote',
  stage: 'assessment',
  status: 'active',
  appliedAt: '2026-02-12T00:00:00Z',
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

export function useApplications() {
  const [apps, setApps] = useLocalStorage<LocalApplication[]>('candidateos_applications', [SEED_APP]);

  // Ensure the seed app always exists
  const allApps = apps.length === 0 || !apps.find(a => a.id === 'xobin-sde')
    ? [SEED_APP, ...apps]
    : apps;

  const isRoleApplied = useCallback((roleId: string) => {
    return allApps.some(a => a.roleId === roleId && a.status !== 'rejected');
  }, [allApps]);

  const getApplicationForRole = useCallback((roleId: string) => {
    return allApps.find(a => a.roleId === roleId && a.status !== 'rejected');
  }, [allApps]);

  const applyToRole = useCallback((role: XobinRole): LocalApplication => {
    const existing = allApps.find(a => a.roleId === role.id && a.status !== 'rejected');
    if (existing) return existing;

    const newApp: LocalApplication = {
      id: `app-${role.id}-${Date.now()}`,
      roleId: role.id,
      roleTitle: role.title,
      company: 'xobin',
      location: role.location,
      stage: 'applied',
      status: 'active',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApps(prev => [...prev, newApp]);
    return newApp;
  }, [allApps, setApps]);

  const getFullApplications = useCallback((): Application[] => {
    return allApps.map(la => {
      const role = xobinRoles.find(r => r.id === la.roleId);
      return localAppToApplication(la, role);
    });
  }, [allApps]);

  return {
    applications: allApps,
    fullApplications: getFullApplications(),
    isRoleApplied,
    getApplicationForRole,
    applyToRole,
  };
}
