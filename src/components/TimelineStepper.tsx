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

export function TimelineStepper({ steps, size = 'sm' }: TimelineStepperProps) {
  const isLarge = size === 'lg';
  const iconPx = isLarge ? 36 : 28;

  return (
    <div className="relative w-full">
      {/* Connector line – absolutely positioned behind icons */}
      <div
        className="absolute left-0 right-0 flex items-center pointer-events-none"
        style={{ top: iconPx / 2, height: 0 }}
      >
        {steps.map((step, i) => (
          <div key={step.stage} className={cn('flex items-center', i < steps.length - 1 ? 'flex-1' : 'flex-none')}>
            {/* half-width spacer to center on icon */}
            <div style={{ width: iconPx / 2 }} className="shrink-0" />
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1',
                  isLarge ? 'h-[3px]' : 'h-[2px]',
                  step.completed ? stageColorMap[step.stage] : 'bg-border'
                )}
              />
            )}
            {/* other half on last item */}
            {i === steps.length - 1 && <div style={{ width: iconPx / 2 }} className="shrink-0" />}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="relative flex w-full">
        {steps.map((step) => (
          <div key={step.stage} className="flex-1 last:flex-none flex flex-col items-center text-center">
            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 shrink-0',
                isLarge ? 'h-9 w-9' : 'h-7 w-7',
                step.completed
                  ? cn(stageColorMap[step.stage], 'border-transparent')
                  : step.current
                  ? cn('border-current', stageTextMap[step.stage], 'bg-card')
                  : 'border-border bg-card'
              )}
            >
              {step.completed && (
                <Check className={cn('text-background', isLarge ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
              )}
              {step.current && (
                <div className={cn('rounded-full', stageColorMap[step.stage], isLarge ? 'h-3 w-3' : 'h-2.5 w-2.5')} />
              )}
            </div>

            {/* Label */}
            <p className={cn(
              'font-medium whitespace-nowrap mt-1.5',
              isLarge ? 'text-xs' : 'text-[10px]',
              step.current ? stageTextMap[step.stage] : step.completed ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {step.label}
            </p>

            {/* Status */}
            <span className={cn(
              'whitespace-nowrap mt-0.5',
              isLarge ? 'text-[10px]' : 'text-[9px]',
              step.completed
                ? 'text-success font-medium'
                : step.current
                ? cn(stageTextMap[step.stage], 'font-medium')
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
