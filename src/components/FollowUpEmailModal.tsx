import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { callAI } from '@/lib/ai-service';

interface FollowUpEmailModalProps {
  open: boolean;
  onClose: () => void;
  role: string;
  company: string;
  stage: string;
}

export function FollowUpEmailModal({ open, onClose, role, company, stage }: FollowUpEmailModalProps) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callAI('draft_follow_up_email', { role, company, stage });
      setDraft(typeof result === 'string' ? result : result.email || result.draft || JSON.stringify(result));
    } catch {
      setError('Failed to generate draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setDraft('');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground">Draft Follow-up Email</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{role} at {company}</p>
              </div>
              <button onClick={handleClose} className="rounded-lg p-1.5 hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {!draft && !loading && (
                <div className="text-center py-6">
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    AI will generate a professional follow-up email tailored to your current stage.
                  </p>
                  <button
                    onClick={generateDraft}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Email Draft
                  </button>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Drafting your email...</p>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {draft && !loading && (
                <div className="space-y-3">
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    rows={12}
                    className="w-full rounded-lg border border-border bg-secondary/30 p-3 text-sm text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={generateDraft}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" />
                      Regenerate
                    </button>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
