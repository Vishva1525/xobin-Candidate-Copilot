import { StageTimelineEntry, UnifiedStageKey } from '@/lib/types';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle, ArrowRight, Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface UnifiedTimelineProps {
  stages: StageTimelineEntry[];
  applicationId: string;
  onDraftEmail: () => void;
}

const stageColorMap: Record<UnifiedStageKey, string> = {
  applied: 'stage-applied',
  screening: 'stage-screen',
  assessment: 'stage-assessment',
  ai_interview: 'stage-interview',
  recruiter_review: 'stage-screen',
  offer: 'stage-offer',
  rejected: 'stage-rejected',
};

const statusConfig = {
  completed: {
    badge: 'bg-success/15 text-success border-success/30',
    label: 'Completed',
    icon: Check,
  },
  active: {
    badge: 'bg-primary/15 text-primary border-primary/30',
    label: 'Active',
    icon: Zap,
  },
  upcoming: {
    badge: 'bg-muted text-muted-foreground border-border',
    label: 'Upcoming',
    icon: Clock,
  },
  rejected: {
    badge: 'bg-destructive/15 text-destructive border-destructive/30',
    label: 'Rejected',
    icon: AlertCircle,
  },
};

function getActionButton(
  stage: StageTimelineEntry,
  applicationId: string,
  onDraftEmail: () => void
) {
  if (stage.status !== 'active') return null;

  switch (stage.key) {
    case 'assessment':
      return (
        <Link
          to={`/prep-studio?app=${applicationId}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
        >
          Prep for Assessment
          <ArrowRight className="h-3 w-3" />
        </Link>
      );
    case 'ai_interview':
      return (
        <Link
          to={`/prep-studio?app=${applicationId}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
        >
          Start Interview Practice
          <ArrowRight className="h-3 w-3" />
        </Link>
      );
    case 'screening':
    case 'recruiter_review':
      return (
        <button
          onClick={onDraftEmail}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
        >
          Draft Follow-up Email
          <ChevronRight className="h-3 w-3" />
        </button>
      );
    default:
      return null;
  }
}

export function UnifiedTimeline({ stages, applicationId, onDraftEmail }: UnifiedTimelineProps) {
  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const config = statusConfig[stage.status];
        const StatusIcon = config.icon;
        const colorKey = stageColorMap[stage.key];
        const isActive = stage.status === 'active';
        const actionBtn = getActionButton(stage, applicationId, onDraftEmail);

        return (
          <motion.div
            key={stage.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={cn(
              'relative rounded-xl border p-4 transition-all duration-300',
              isActive
                ? `border-${colorKey}/40 bg-${colorKey}/5 glow-primary-sm`
                : stage.status === 'completed'
                ? 'border-border bg-card/60'
                : stage.status === 'rejected'
                ? 'border-destructive/20 bg-destructive/5'
                : 'border-border/50 bg-card/30'
            )}
            style={isActive ? {
              borderColor: `hsl(var(--primary) / 0.4)`,
              backgroundColor: `hsl(var(--primary) / 0.05)`,
            } : stage.status === 'rejected' ? {
              borderColor: `hsl(var(--destructive) / 0.2)`,
              backgroundColor: `hsl(var(--destructive) / 0.05)`,
            } : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full',
                  stage.status === 'completed' ? 'bg-success/15' :
                  isActive ? 'bg-primary/15' :
                  stage.status === 'rejected' ? 'bg-destructive/15' :
                  'bg-muted'
                )}>
                  <StatusIcon className={cn(
                    'h-3.5 w-3.5',
                    stage.status === 'completed' ? 'text-success' :
                    isActive ? 'text-primary' :
                    stage.status === 'rejected' ? 'text-destructive' :
                    'text-muted-foreground'
                  )} />
                </div>
                <h3 className={cn(
                  'text-sm font-semibold',
                  stage.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                )}>
                  {stage.label}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                  config.badge
                )}>
                  {config.label}
                </span>
              </div>
            </div>

            {/* ETA */}
            <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>ETA: {stage.etaText}</span>
            </div>

            {/* Two-column guidance */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  What we need from you
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                  {stage.candidateExpectation}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  What's happening on our side
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                  {stage.companyBackground}
                </p>
              </div>
            </div>

            {/* Footer: timestamp + action */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Updated {new Date(stage.lastUpdatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {actionBtn}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
