import { useState, ReactNode } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIActionButtonProps {
  label: string;
  description?: string;
  onClick: () => Promise<any>;
  children?: (result: any) => ReactNode;
  variant?: 'default' | 'compact';
}

export function AIActionButton({ label, description, onClick, children, variant = 'default' }: AIActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const handleClick = async () => {
    if (result) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await onClick();
      setResult(data);
      setExpanded(true);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg border transition-all duration-200 text-left',
          variant === 'compact' ? 'px-3 py-2.5' : 'px-4 py-3',
          result
            ? 'border-primary/20 bg-primary/5'
            : 'border-border bg-card hover:border-primary/30 hover:bg-card/80',
          loading && 'opacity-80 cursor-wait'
        )}
      >
        <div className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          result ? 'bg-primary/15' : 'bg-secondary group-hover:bg-primary/10'
        )}>
          {loading ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <Sparkles className={cn('h-4 w-4', result ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', result ? 'text-primary' : 'text-card-foreground')}>
            {label}
          </p>
          {description && !result && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {result && (
          expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {loading && (
        <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2 animate-pulse">
          <div className="h-3 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {result && expanded && children && (
        <div className="rounded-lg border border-border bg-card/50 p-4 animate-fade-in">
          {children(result)}
        </div>
      )}
    </div>
  );
}