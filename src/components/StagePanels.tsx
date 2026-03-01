import { useState } from 'react';
import { Application, AssessmentTask, StageStatus } from '@/lib/types';
import { callAI } from '@/lib/ai-service';
import { useApplications } from '@/hooks/use-applications';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, RotateCcw, ChevronDown, Send, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface StageGateResultProps {
  result: { decision: string; score: number; reasons: string[]; improvements: string[] };
}

function StageGateResult({ result }: StageGateResultProps) {
  const [expanded, setExpanded] = useState(false);
  const isPass = result.decision === 'pass';
  const isRetry = result.decision === 'retry';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-5',
        isPass ? 'border-success/30 bg-success/5' : isRetry ? 'border-warning/30 bg-warning/5' : 'border-destructive/30 bg-destructive/5'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isPass ? <CheckCircle2 className="h-5 w-5 text-success" /> :
           isRetry ? <RotateCcw className="h-5 w-5 text-warning" /> :
           <XCircle className="h-5 w-5 text-destructive" />}
          <span className={cn('text-sm font-semibold', isPass ? 'text-success' : isRetry ? 'text-warning' : 'text-destructive')}>
            {isPass ? 'Passed!' : isRetry ? 'Needs Improvement' : 'Not Passed'}
          </span>
        </div>
        <div className={cn(
          'rounded-full px-3 py-1 text-xs font-bold',
          isPass ? 'bg-success/15 text-success' : isRetry ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'
        )}>
          {result.score}/100
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {result.reasons.map((r, i) => (
          <p key={i} className="text-xs text-muted-foreground flex gap-2">
            <span className="text-primary shrink-0">•</span>{r}
          </p>
        ))}
      </div>

      {result.improvements.length > 0 && (
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
          {expanded ? 'Hide' : 'Show'} improvement tips
        </button>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              {result.improvements.map((imp, i) => (
                <p key={i} className="text-xs text-muted-foreground flex gap-2">
                  <Sparkles className="h-3 w-3 text-warning shrink-0 mt-0.5" />{imp}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Applied Stage ───
export function AppliedStagePanel({ app }: { app: Application }) {
  const planStage = app.hiringPlan?.stages.find(s => s.key === 'applied');
  return (
    <div className="space-y-4">
      {planStage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Stage Objective</h3>
          <p className="text-sm text-muted-foreground">{planStage.stageObjective}</p>
          {planStage.passingCriteria && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
              <FileText className="h-3 w-3" /> {planStage.passingCriteria}
            </p>
          )}
        </div>
      )}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">Your application is being reviewed. You'll be notified when there's an update.</p>
        <p className="text-xs text-muted-foreground mt-2">Expected: {planStage?.expectedDays || 5} business days</p>
      </div>
    </div>
  );
}

// ─── Assessment Stage ───
export function AssessmentStagePanel({ app }: { app: Application }) {
  const { updateStageState, advanceStage } = useApplications();
  const [resumeText] = useLocalStorage<string>('candidateos_resume', '');
  const planStage = app.hiringPlan?.stages.find(s => s.key === 'assessment');
  const tasks = planStage?.tasks || [];
  const [answers, setAnswers] = useState<Record<string, string>>(app.stageState?.artifacts?.assessment || {});
  const [submitting, setSubmitting] = useState(false);
  const gateResult = app.stageState?.gateResults?.assessment;
  const status = app.stageState?.statuses?.assessment || 'not_started';
  const attempts = app.stageState?.attempts?.assessment || 0;

  const handleChange = (taskId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [taskId]: value }));
  };

  const handleSubmit = async () => {
    const filled = tasks.filter(t => answers[t.id]?.trim());
    if (filled.length === 0) {
      toast({ title: 'Please answer at least one question', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    updateStageState(app.id, {
      statuses: { ...(app.stageState?.statuses || {}), assessment: 'submitted' },
      artifacts: { ...(app.stageState?.artifacts || {}), assessment: answers },
      attempts: { ...(app.stageState?.attempts || {}), assessment: attempts + 1 },
      lastSubmittedAt: { ...(app.stageState?.lastSubmittedAt || {}), assessment: new Date().toISOString() },
    });

    const result = await callAI('evaluate_stage_gate', {
      roleTitle: app.role,
      stageKey: 'assessment',
      jobDescription: app.jobDescription,
      resumeText,
      attemptNumber: attempts + 1,
      artifacts: answers,
      passingCriteria: planStage?.passingCriteria,
      previousResults: gateResult ? [gateResult] : [],
    });

    const newStatus: StageStatus = result.decision === 'pass' ? 'passed' : result.decision === 'retry' ? 'needs_retry' : 'failed';

    if (result.decision === 'pass') {
      advanceStage(app.id, 'ai-interview', result);
      toast({ title: '🎉 Assessment passed!', description: "You've advanced to the AI Interview stage." });
    } else if (result.decision === 'retry') {
      updateStageState(app.id, {
        statuses: { ...(app.stageState?.statuses || {}), assessment: newStatus },
        gateResults: { ...(app.stageState?.gateResults || {}), assessment: result },
      });
      toast({ title: 'Almost there!', description: 'Review the feedback and try again.' });
    } else {
      updateStageState(app.id, {
        statuses: { ...(app.stageState?.statuses || {}), assessment: newStatus },
        gateResults: { ...(app.stageState?.gateResults || {}), assessment: result },
      });
      toast({ title: 'Not passed', description: 'Review the feedback for improvement areas.', variant: 'destructive' });
    }

    setSubmitting(false);
  };

  const canRetry = status === 'needs_retry' || status === 'failed' || status === 'in_progress' || status === 'not_started';

  return (
    <div className="space-y-4">
      {planStage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Stage Objective</h3>
            {attempts > 0 && <span className="text-xs text-muted-foreground">Attempt #{attempts}</span>}
          </div>
          <p className="text-sm text-muted-foreground">{planStage.stageObjective}</p>
          <p className="text-xs text-muted-foreground mt-1">Assessment type: {planStage.assessmentType}</p>
        </div>
      )}

      {gateResult && <StageGateResult result={gateResult} />}

      {canRetry && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} value={answers[task.id] || ''} onChange={(v) => handleChange(task.id, v)} />
          ))}
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Evaluating...</> : <><Send className="h-4 w-4 mr-2" /> Submit for Evaluation</>}
          </Button>
        </div>
      )}

      {status === 'passed' && !canRetry && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-5 text-center">
          <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
          <p className="text-sm font-medium text-success">Assessment completed! Move to AI Interview.</p>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, index, value, onChange }: { task: AssessmentTask; index: number; value: string; onChange: (v: string) => void }) {
  const typeLabel = { mcq: 'Multiple Choice', short_answer: 'Short Answer', case_study: 'Case Study', coding: 'Code', portfolio: 'Portfolio', design_task: 'Design Task' };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{typeLabel[task.type] || task.type}</span>
      </div>
      <p className="text-sm text-foreground mb-3">{task.question}</p>

      {task.type === 'mcq' && task.options ? (
        <div className="space-y-2">
          {task.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onChange(opt)}
              className={cn(
                'w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-all',
                value === opt ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card hover:border-primary/30 text-muted-foreground'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : task.type === 'portfolio' ? (
        <Input placeholder="Paste your portfolio URL..." value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <Textarea
          placeholder={task.type === 'coding' ? 'Write your code here...' : 'Type your answer...'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn('min-h-[100px]', task.type === 'coding' && 'font-mono text-xs')}
        />
      )}
    </div>
  );
}

// ─── AI Interview Stage ───
export function AIInterviewStagePanel({ app }: { app: Application }) {
  const planStage = app.hiringPlan?.stages.find(s => s.key === 'ai-interview');
  const status = app.stageState?.statuses?.['ai-interview'] || 'not_started';
  const gateResult = app.stageState?.gateResults?.['ai-interview'];

  return (
    <div className="space-y-4">
      {planStage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Stage Objective</h3>
          <p className="text-sm text-muted-foreground">{planStage.stageObjective}</p>
          <p className="text-xs text-muted-foreground mt-1">Style: {planStage.interviewStyle}</p>
        </div>
      )}

      {gateResult && <StageGateResult result={gateResult} />}

      {(status === 'not_started' || status === 'in_progress' || status === 'needs_retry') && (
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
          <Sparkles className="h-6 w-6 text-primary mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Ready for your AI Interview</p>
          <p className="text-xs text-muted-foreground mb-4">Head to Prep Studio to complete your interview round.</p>
          <Button asChild size="sm">
            <a href="/prep-studio">Go to Prep Studio</a>
          </Button>
        </div>
      )}

      {status === 'passed' && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-5 text-center">
          <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
          <p className="text-sm font-medium text-success">Interview completed! Moving to Recruiter Screen.</p>
        </div>
      )}
    </div>
  );
}

// ─── Recruiter Screen Stage ───
export function RecruiterScreenStagePanel({ app }: { app: Application }) {
  const { updateStageState, advanceStage } = useApplications();
  const [resumeText] = useLocalStorage<string>('candidateos_resume', '');
  const planStage = app.hiringPlan?.stages.find(s => s.key === 'recruiter-screen');
  const focusAreas = planStage?.screenFocusAreas || ['Motivation', 'Team fit', 'Availability', 'Compensation'];
  const [answers, setAnswers] = useState<Record<string, string>>(app.stageState?.artifacts?.['recruiter-screen'] || {});
  const [submitting, setSubmitting] = useState(false);
  const gateResult = app.stageState?.gateResults?.['recruiter-screen'];
  const status = app.stageState?.statuses?.['recruiter-screen'] || 'not_started';
  const attempts = app.stageState?.attempts?.['recruiter-screen'] || 0;

  const handleSubmit = async () => {
    const filled = Object.values(answers).filter(v => v.trim());
    if (filled.length === 0) {
      toast({ title: 'Please answer at least one question', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    updateStageState(app.id, {
      statuses: { ...(app.stageState?.statuses || {}), 'recruiter-screen': 'submitted' },
      artifacts: { ...(app.stageState?.artifacts || {}), 'recruiter-screen': answers },
      attempts: { ...(app.stageState?.attempts || {}), 'recruiter-screen': attempts + 1 },
    });

    const result = await callAI('evaluate_stage_gate', {
      roleTitle: app.role,
      stageKey: 'recruiter-screen',
      jobDescription: app.jobDescription,
      resumeText,
      attemptNumber: attempts + 1,
      artifacts: answers,
      passingCriteria: planStage?.passingCriteria,
    });

    if (result.decision === 'pass') {
      advanceStage(app.id, 'offer', result);
      toast({ title: '🎉 Recruiter Screen passed!', description: 'Congratulations — offer stage!' });
    } else {
      const newStatus: StageStatus = result.decision === 'retry' ? 'needs_retry' : 'failed';
      updateStageState(app.id, {
        statuses: { ...(app.stageState?.statuses || {}), 'recruiter-screen': newStatus },
        gateResults: { ...(app.stageState?.gateResults || {}), 'recruiter-screen': result },
      });
      toast({ title: result.decision === 'retry' ? 'Needs improvement' : 'Not passed', description: 'Review feedback below.' });
    }
    setSubmitting(false);
  };

  const canAnswer = status !== 'passed' && status !== 'submitted';

  return (
    <div className="space-y-4">
      {planStage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Stage Objective</h3>
          <p className="text-sm text-muted-foreground">{planStage.stageObjective}</p>
        </div>
      )}

      {gateResult && <StageGateResult result={gateResult} />}

      {canAnswer && (
        <div className="space-y-4">
          {focusAreas.map((area, i) => (
            <div key={area} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                <span className="text-xs font-medium text-foreground">{area}</span>
              </div>
              <Textarea
                placeholder={`Share your thoughts on ${area.toLowerCase()}...`}
                value={answers[area] || ''}
                onChange={e => setAnswers(prev => ({ ...prev, [area]: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          ))}
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Evaluating...</> : <><Send className="h-4 w-4 mr-2" /> Submit for Evaluation</>}
          </Button>
        </div>
      )}

      {status === 'passed' && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-5 text-center">
          <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
          <p className="text-sm font-medium text-success">Recruiter screen passed! 🎉</p>
        </div>
      )}
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
      {planStage && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">🎉 Congratulations!</h3>
          <p className="text-sm text-muted-foreground">{planStage.stageObjective || 'Review and finalize your offer.'}</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Offer Checklist</h3>
        <div className="space-y-2.5">
          {checklist.map(item => (
            <label key={item} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!checked[item]}
                onChange={() => setChecked(prev => ({ ...prev, [item]: !prev[item] }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className={cn('text-sm transition-colors', checked[item] ? 'text-muted-foreground line-through' : 'text-foreground')}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
