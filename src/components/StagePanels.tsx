import { useState } from 'react';
import { Application, Stage } from '@/lib/types';
import { useApplications } from '@/hooks/use-applications';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Sparkles, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NEXT_STAGE: Record<string, Stage> = {
  'applied': 'assessment',
  'assessment': 'ai-interview',
  'ai-interview': 'recruiter-screen',
  'recruiter-screen': 'offer',
};

const STAGE_LABELS: Record<string, string> = {
  'applied': 'Assessment',
  'assessment': 'AI Interview',
  'ai-interview': 'Recruiter Screen',
  'recruiter-screen': 'Offer',
};

function AdvanceButton({ app, currentStage }: { app: Application; currentStage: string }) {
  const { advanceStage } = useApplications();
  const next = NEXT_STAGE[currentStage];
  if (!next) return null;

  const labels: Record<string, string> = {
    'applied': 'Simulate Move to Assessment',
    'assessment': 'Mark Assessment Complete',
    'ai-interview': 'Mark Interview Complete',
    'recruiter-screen': 'Mark Recruiter Screen Complete',
  };

  return (
    <Button
      onClick={() => {
        advanceStage(app.id, next);
        toast({ title: `Stage updated → ${STAGE_LABELS[currentStage]}` });
      }}
      className="w-full"
    >
      <ChevronRight className="h-4 w-4 mr-2" />
      {labels[currentStage] || 'Advance Stage'}
    </Button>
  );
}

// ─── Applied Stage ───
export function AppliedStagePanel({ app }: { app: Application }) {
  const planStage = app.hiringPlan?.stages.find(s => s.key === 'applied');
  const currentStage = app.stageState?.currentStageKey || app.stage;
  return (
    <div className="space-y-4">
      {planStage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Stage Objective</h3>
          <p className="text-sm text-muted-foreground">{planStage.stageObjective}</p>
        </div>
      )}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">Your application is being reviewed. You'll be notified when there's an update.</p>
        <p className="text-xs text-muted-foreground mt-2">Expected: {planStage?.expectedDays || 5} business days</p>
      </div>
      <AdvanceButton app={app} currentStage={currentStage} />
    </div>
  );
}

// ─── Assessment Stage ───
export function AssessmentStagePanel({ app }: { app: Application }) {
  const planStage = app.hiringPlan?.stages.find(s => s.key === 'assessment');
  const tasks = planStage?.tasks || [];
  const currentStage = app.stageState?.currentStageKey || app.stage;

  return (
    <div className="space-y-4">
      {planStage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Stage Objective</h3>
          <p className="text-sm text-muted-foreground">{planStage.stageObjective}</p>
          <p className="text-xs text-muted-foreground mt-1">Assessment type: {planStage.assessmentType}</p>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Assessment Tasks Preview
          </h3>
          <div className="space-y-2.5">
            {tasks.map((task, i) => (
              <div key={task.id} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0 mt-0.5">{i + 1}</span>
                <span>{task.question}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AdvanceButton app={app} currentStage={currentStage} />
    </div>
  );
}

// ─── AI Interview Stage ───
export function AIInterviewStagePanel({ app }: { app: Application }) {
  const planStage = app.hiringPlan?.stages.find(s => s.key === 'ai-interview');
  const currentStage = app.stageState?.currentStageKey || app.stage;

  return (
    <div className="space-y-4">
      {planStage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Stage Objective</h3>
          <p className="text-sm text-muted-foreground">{planStage.stageObjective}</p>
          <p className="text-xs text-muted-foreground mt-1">Style: {planStage.interviewStyle}</p>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
        <Sparkles className="h-6 w-6 text-primary mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Practice for your AI Interview</p>
        <p className="text-xs text-muted-foreground mb-4">Head to Prep Studio to run through mock interview questions.</p>
        <Button asChild size="sm" variant="outline">
          <a href="/prep-studio" className="inline-flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Go to Prep Studio
          </a>
        </Button>
      </div>

      <AdvanceButton app={app} currentStage={currentStage} />
    </div>
  );
}

// ─── Recruiter Screen Stage ───
export function RecruiterScreenStagePanel({ app }: { app: Application }) {
  const planStage = app.hiringPlan?.stages.find(s => s.key === 'recruiter-screen');
  const focusAreas = planStage?.screenFocusAreas || ['Motivation', 'Team fit', 'Availability', 'Compensation'];
  const currentStage = app.stageState?.currentStageKey || app.stage;

  return (
    <div className="space-y-4">
      {planStage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Stage Objective</h3>
          <p className="text-sm text-muted-foreground">{planStage.stageObjective}</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Focus Areas</h3>
        <div className="space-y-2">
          {focusAreas.map((area, i) => (
            <div key={area} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">{i + 1}</span>
              {area}
            </div>
          ))}
        </div>
      </div>

      <AdvanceButton app={app} currentStage={currentStage} />
    </div>
  );
}

// ─── Offer Stage ───
export function OfferStagePanel({ app }: { app: Application }) {
  const planStage = app.hiringPlan?.stages.find(s => s.key === 'offer');
  const checklist = planStage?.offerChecklist || ['Review compensation', 'Confirm start date', 'Sign offer'];
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">🎉 Congratulations!</h3>
        <p className="text-sm text-muted-foreground">{planStage?.stageObjective || 'Review and finalize your offer.'}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Offer Checklist</h3>
        <div className="space-y-2.5">
          {checklist.map(item => (
            <button
              key={item}
              onClick={() => setChecked(prev => ({ ...prev, [item]: !prev[item] }))}
              className="flex items-center gap-3 w-full text-left"
            >
              <div className={cn(
                'flex h-5 w-5 items-center justify-center rounded-md border transition-all',
                checked[item] ? 'bg-primary border-primary' : 'border-border'
              )}>
                {checked[item] && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
              </div>
              <span className={cn('text-sm', checked[item] ? 'text-muted-foreground line-through' : 'text-foreground')}>
                {item}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
