import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Eye, Send, ChevronRight, Code, BarChart3, Palette, Info } from 'lucide-react';
import { xobinRoles, XobinRole } from '@/lib/xobin-roles';
import { useRoleContext } from '@/hooks/use-role-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const roleTypeConfig: Record<string, { icon: typeof Code; label: string; className: string }> = {
  tech: { icon: Code, label: 'Tech', className: 'bg-info/15 text-info' },
  data: { icon: BarChart3, label: 'Data', className: 'bg-success/15 text-success' },
  design: { icon: Palette, label: 'Design', className: 'bg-warning/15 text-warning' },
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ExploreRolesModal({ open, onClose }: Props) {
  const [viewingJD, setViewingJD] = useState<XobinRole | null>(null);
  const { setExplorationRole, activeRole } = useRoleContext();

  const handleExplore = (role: XobinRole) => {
    setExplorationRole(role);
    toast.success(`Now exploring: ${role.title}`, {
      description: 'AI Copilot and Resume Lab will use this role context.',
    });
    onClose();
  };

  const handleApply = (role: XobinRole) => {
    setExplorationRole(role);
    toast.success(`Applied to ${role.title}!`, {
      description: 'This role is now your active context.',
    });
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Explore Other Roles at xobin</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Browse roles and tailor your resume instantly.</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 140px)' }}>
            {viewingJD ? (
              <div className="space-y-4">
                <button
                  onClick={() => setViewingJD(null)}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  ← Back to roles
                </button>
                <div>
                  <h3 className="text-base font-bold text-foreground">{viewingJD.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{viewingJD.level} · {viewingJD.location}</span>
                    <RoleTypeBadge type={viewingJD.roleType} />
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">{viewingJD.jdFull}</pre>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleExplore(viewingJD)}
                    className="flex-1 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    Explore This Role
                  </button>
                  <button
                    onClick={() => handleApply(viewingJD)}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Rules */}
                <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">How it works</span>
                  </div>
                  {[
                    'Exploring a role updates your AI Copilot context automatically.',
                    'You can tailor your resume before applying.',
                    'Applying creates a new application in your dashboard.',
                    'Resume drafts are saved per role so you can compare versions.',
                  ].map((rule, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground flex gap-1.5">
                      <span className="text-primary font-bold">{i + 1}.</span> {rule}
                    </p>
                  ))}
                </div>

                {/* Role tiles */}
                <div className="grid gap-3">
                  {xobinRoles.map(role => {
                    const isActive = activeRole.roleId === role.id;
                    return (
                      <div
                        key={role.id}
                        className={cn(
                          'rounded-xl border p-4 transition-all',
                          isActive
                            ? 'border-primary/40 bg-primary/5 glow-primary-sm'
                            : 'border-border bg-card hover:border-primary/20'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-foreground truncate">{role.title}</h3>
                              {isActive && (
                                <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">Active</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">{role.level} · {role.location}</span>
                              <RoleTypeBadge type={role.roleType} />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {role.keySkills.map((skill, i) => (
                                <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1.5 ml-3 shrink-0">
                            <button
                              onClick={() => setViewingJD(role)}
                              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/30 transition-colors flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" /> View JD
                            </button>
                            {!isActive && (
                              <button
                                onClick={() => handleApply(role)}
                                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all flex items-center gap-1"
                              >
                                <Send className="h-3 w-3" /> Apply
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function RoleTypeBadge({ type }: { type: string }) {
  const config = roleTypeConfig[type] || roleTypeConfig.tech;
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', config.className)}>
      <Icon className="h-2.5 w-2.5" /> {config.label}
    </span>
  );
}
