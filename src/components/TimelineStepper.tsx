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

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => (
        <div key={step.stage} className="flex items-center flex-1 last:flex-none">
          {/* Step node */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex items-center justify-center rounded-full border-2 transition-all duration-300',
                isLarge ? 'h-9 w-9' : 'h-6 w-6',
                step.completed
                  ? cn(stageColorMap[step.stage], 'border-transparent')
                  : step.current
                  ? cn('border-current', stageTextMap[step.stage], 'bg-transparent')
                  : 'border-border bg-transparent'
              )}
            >
              {step.completed && (
                <Check className={cn('text-background', isLarge ? 'h-4 w-4' : 'h-3 w-3')} />
              )}
              {step.current && (
                <div className={cn('rounded-full', stageColorMap[step.stage], isLarge ? 'h-3 w-3' : 'h-2 w-2')} />
              )}
            </div>
            <div className="text-center">
              <p className={cn(
                'font-medium whitespace-nowrap',
                isLarge ? 'text-xs' : 'text-[10px]',
                step.current ? stageTextMap[step.stage] : step.completed ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </p>
              {step.date && isLarge && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{step.date}</p>
              )}
            </div>
          </div>

          {/* Connector */}
          {i < steps.length - 1 && (
            <div className={cn(
              'flex-1 mx-1.5',
              isLarge ? 'h-0.5' : 'h-px',
              step.completed ? stageColorMap[step.stage] : 'bg-border'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}