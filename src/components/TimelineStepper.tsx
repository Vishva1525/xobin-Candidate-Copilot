import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { TimelineStep, Stage } from '@/lib/types';

interface TimelineStepperProps {
  steps: TimelineStep[];
  size?: 'sm' | 'lg';
}

const stageColorMap: Record<Stage, string> = {
  applied: 'bg-stage-applied',
  assessment: 'bg-stage-assessment',
  'ai-interview': 'bg-stage-interview',
  'recruiter-screen': 'bg-stage-screen',
  offer: 'bg-stage-offer',
  rejected: 'bg-stage-rejected',
};

const stageTextMap: Record<Stage, string> = {
  applied: 'text-stage-applied',
  assessment: 'text-stage-assessment',
  'ai-interview': 'text-stage-interview',
  'recruiter-screen': 'text-stage-screen',
  offer: 'text-stage-offer',
  rejected: 'text-stage-rejected',
};

const stageBadgeBgMap: Record<Stage, string> = {
  applied: 'bg-stage-applied/15',
  assessment: 'bg-stage-assessment/15',
  'ai-interview': 'bg-stage-interview/15',
  'recruiter-screen': 'bg-stage-screen/15',
  offer: 'bg-stage-offer/15',
  rejected: 'bg-stage-rejected/15',
};

export function TimelineStepper({ steps, size = 'sm' }: TimelineStepperProps) {
  const isLarge = size === 'lg';
  const iconPx = isLarge ? 36 : 32;

  return (
    <div className="relative w-full" style={{ paddingTop: 0 }}>
      {/* Connector line layer – horizontally centered through icons */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ top: iconPx / 2, transform: 'translateY(-50%)' }}
      >
        <div className="flex">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div key={step.stage} className="flex-1 flex items-center">
                {/* Left half (empty for first) */}
                {i === 0 ? (
                  <div className="flex-1" />
                ) : null}
                {/* Connector from previous center to this center */}
                {i > 0 ? null : <div className="flex-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Better approach: single absolute line from first icon center to last icon center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: iconPx / 2,
          left: `calc(${100 / (2 * steps.length)}%)`,
          right: `calc(${100 / (2 * steps.length)}%)`,
          transform: 'translateY(-50%)',
        }}
      >
        <div className="flex w-full h-[3px]">
          {steps.slice(0, -1).map((step, i) => (
            <div
              key={step.stage}
              className={cn(
                'flex-1',
                step.completed ? stageColorMap[step.stage] : 'bg-border'
              )}
            />
          ))}
        </div>
      </div>

      {/* Steps – equal width grid */}
      <div
        className="relative grid w-full"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
      >
        {steps.map((step) => (
          <div key={step.stage} className="flex flex-col items-center text-center">
            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 shrink-0',
                isLarge ? 'h-9 w-9' : 'h-8 w-8',
                step.completed
                  ? cn(stageColorMap[step.stage], 'border-transparent')
                  : step.current
                  ? cn('border-2', stageTextMap[step.stage], 'bg-card border-current')
                  : 'border-border bg-card'
              )}
            >
              {step.completed && (
                <Check className={cn('text-background', isLarge ? 'h-4 w-4' : 'h-4 w-4')} />
              )}
              {step.current && (
                <div className={cn('rounded-full', stageColorMap[step.stage], isLarge ? 'h-3 w-3' : 'h-2.5 w-2.5')} />
              )}
            </div>

            {/* Label */}
            <p className={cn(
              'font-semibold whitespace-nowrap mt-2',
              isLarge ? 'text-sm' : 'text-[11px]',
              step.current ? stageTextMap[step.stage] : step.completed ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {step.label}
            </p>

            {/* Status badge */}
            <span className={cn(
              'whitespace-nowrap mt-1 rounded-full px-2.5 py-0.5 font-medium',
              isLarge ? 'text-[11px]' : 'text-[10px]',
              step.completed
                ? 'bg-success/15 text-success'
                : step.current
                ? cn(stageBadgeBgMap[step.stage], stageTextMap[step.stage])
                : 'text-muted-foreground'
            )}>
              {step.completed ? '✓ Done' : step.current ? 'Active' : step.date || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
