import { ResumeHealth as ResumeHealthType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResumeHealthProps {
  health: ResumeHealthType;
}

const dimensions = [
  { key: 'clarity' as const, label: 'Clarity', description: 'How clear and readable' },
  { key: 'relevance' as const, label: 'Relevance', description: 'Match to target roles' },
  { key: 'atsFriendliness' as const, label: 'ATS Friendly', description: 'Parseable by systems' },
  { key: 'impact' as const, label: 'Impact', description: 'Metrics & results' },
];

function getScoreColor(score: number) {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
}

function getBarColor(score: number) {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-destructive';
}

export function ResumeHealthCard({ health }: ResumeHealthProps) {
  const average = Math.round(
    (health.clarity + health.relevance + health.atsFriendliness + health.impact) / 4
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-card-foreground">Resume Health</h3>
        <span className={cn('text-2xl font-bold', getScoreColor(average))}>
          {average}
        </span>
      </div>

      <div className="space-y-3">
        {dimensions.map(dim => {
          const score = health[dim.key];
          return (
            <div key={dim.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{dim.label}</span>
                <span className={cn('text-xs font-semibold', getScoreColor(score))}>{score}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', getBarColor(score))}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}