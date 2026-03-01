import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ContactHelpModal } from '@/components/ContactHelpModal';
import { AICompanion } from '@/components/AICompanion';
import { ExploreRolesModal } from '@/components/ExploreRolesModal';
import { getStageInfo } from '@/lib/mock-data';
import { callAI } from '@/lib/ai-service';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRoleContext } from '@/hooks/use-role-context';
import { useApplications } from '@/hooks/use-applications';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, Brain, MessageSquare, Clock, User, Activity, Shield,
  Check, Zap, ArrowRight, Loader2, Sparkles, HelpCircle, Compass, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

type UnifiedStageKey = 'applied' | 'screening' | 'assessment' | 'ai_interview' | 'recruiter_review' | 'offer';

const stageOrder: UnifiedStageKey[] = ['applied', 'screening', 'assessment', 'ai_interview', 'recruiter_review', 'offer'];
const stageLabels: Record<UnifiedStageKey, string> = {
  applied: 'Applied',
  screening: 'Screening',
  assessment: 'Assessment',
  ai_interview: 'AI Interview',
  recruiter_review: 'Recruiter Review',
  offer: 'Offer',
};

function formatTimeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function mapStageToKey(stage: string): string {
  const map: Record<string, string> = {
    applied: 'applied',
    assessment: 'assessment',
    'ai-interview': 'ai_interview',
    'recruiter-screen': 'recruiter_review',
    offer: 'offer',
  };
  return map[stage] || stage;
}

interface DashboardInsights {
  stageSummary: string;
  companyBackground: string;
  nextSteps: string[];
  recommendedActions: { label: string; actionKey: string }[];
  faqSuggestions: string[];
}

export default function Dashboard() {
  const [email] = useLocalStorage<string | null>('candidateos_email', null);
  const [resumeText] = useLocalStorage<string>('candidateos_resume', '');
  const [contactOpen, setContactOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { activeRole, isExploring, clearExploration } = useRoleContext();
  const { fullApplications } = useApplications();

  const primaryApp = fullApplications[0];
  const stageInfo = getStageInfo(primaryApp?.stage || 'applied');

  // Load insights on mount
  useEffect(() => {
    if (!primaryApp) return;
    let cancelled = false;
    setLoadingInsights(true);
    callAI('dashboard_insights', {
      roleTitle: primaryApp.role,
      company: primaryApp.company,
      currentStage: primaryApp.stage,
      jobDescription: primaryApp.jobDescription,
      resumeSummary: resumeText ? resumeText.slice(0, 500) : '',
      deadlines: primaryApp.deadlines,
    }).then(result => {
      if (!cancelled) setInsights(result);
    }).finally(() => {
      if (!cancelled) setLoadingInsights(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <Layout>
      <div className="flex h-full">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            {/* Exploration Context Banner */}
            {isExploring && (
              <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 mb-4 flex items-center justify-between">
                <p className="text-xs text-warning font-medium">
                  <Compass className="inline h-3 w-3 mr-1" />
                  Context: Exploring <span className="font-bold">{activeRole.roleTitle}</span>
                </p>
                <button
                  onClick={clearExploration}
                  className="text-xs text-warning hover:text-foreground font-medium flex items-center gap-1 transition-colors"
                >
                  <X className="h-3 w-3" /> Back to my application
                </button>
              </div>
            )}

            {/* Applications Section */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-4">
                Your Applications at xobin
              </h1>

              <div className="grid gap-3">
                {fullApplications.map(app => {
                  const mapped = mapStageToKey(app.stage);
                  const activeIdx = stageOrder.indexOf(mapped as UnifiedStageKey);
                  const isAssessmentOrLater = activeIdx >= 2;

                  return (
                    <Link
                      key={app.id}
                      to={`/application/${app.id}`}
                      className="group block rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {app.role}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {app.company} · {app.location}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                          <Zap className="h-3 w-3" />
                          {stageLabels[mapped as UnifiedStageKey] || 'In Progress'}
                        </span>
                      </div>

                      {/* Compact timeline */}
                      <div className="flex items-center gap-0.5 mb-3">
                        {stageOrder.map((key, i) => {
                          const isCompleted = i < activeIdx;
                          const isActive = i === activeIdx;
                          return (
                            <div key={key} className="flex items-center flex-1">
                              <div className={cn(
                                'h-1.5 flex-1 rounded-full transition-all',
                                isCompleted ? 'bg-success' :
                                isActive ? 'bg-primary' :
                                'bg-border'
                              )} />
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {app.lastActivityAt ? formatTimeAgo(app.lastActivityAt) : ''}
                        </span>
                        <div className="flex items-center gap-2">
                          {isAssessmentOrLater && (
                            <span className="text-[10px] text-muted-foreground">Prep Studio →</span>
                          )}
                          <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Details <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Trust & Transparency Widgets (for primary app) */}
            {primaryApp && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/15">
                      <User className="h-3.5 w-3.5 text-info" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Handler</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{primaryApp.handlerRole}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
                      <Activity className="h-3.5 w-3.5 text-success" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Last Activity</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {primaryApp.lastActivityAt ? formatTimeAgo(primaryApp.lastActivityAt) : 'Unknown'}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/15">
                      <Shield className="h-3.5 w-3.5 text-warning" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Response SLA</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">~{primaryApp.typicalResponseDays} business days</p>
                </div>
              </div>
            )}

            {/* Next Best Actions */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">Recommended Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <Link
                  to="/resume-lab"
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/15 mb-3">
                    <FileText className="h-4 w-4 text-info" />
                  </div>
                  <p className="text-sm font-semibold text-card-foreground mb-1">Resume Lab</p>
                  <p className="text-xs text-muted-foreground">Tailor your resume for this role</p>
                  <span className="text-xs font-medium text-primary flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
                <Link
                  to="/prep-studio"
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 mb-3">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-card-foreground mb-1">Prep Studio</p>
                  <p className="text-xs text-muted-foreground">Practice mock interviews</p>
                  <span className="text-xs font-medium text-primary flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
                <button
                  onClick={() => setContactOpen(true)}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all text-left"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15 mb-3">
                    <MessageSquare className="h-4 w-4 text-warning" />
                  </div>
                  <p className="text-sm font-semibold text-card-foreground mb-1">Draft a Message</p>
                  <p className="text-xs text-muted-foreground">Reach out to hiring support</p>
                  <span className="text-xs font-medium text-primary flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              </div>
            </div>

            {/* Application Insights */}
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">Application Insights</h2>
              </div>
              {loadingInsights ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading insights...</span>
                </div>
              ) : insights ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Current Stage Explained</p>
                    <p className="text-xs text-foreground leading-relaxed">{insights.stageSummary}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">What xobin is Doing Now</p>
                    <p className="text-xs text-foreground leading-relaxed">{insights.companyBackground}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">What You Should Do Now</p>
                    <ul className="space-y-1">
                      {insights.nextSteps.map((step, i) => (
                        <li key={i} className="text-xs text-foreground flex gap-2">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Explore Other Roles */}
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Compass className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-card-foreground">Explore Other Roles at xobin</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Curious about a better fit? Explore roles and tailor your resume instantly.</p>
                </div>
                <button
                  onClick={() => setExploreOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
                >
                  <Compass className="h-3 w-3" />
                  Explore Roles
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right panel — AI Companion */}
        <div className="hidden lg:flex lg:flex-col w-80 border-l border-border bg-card/30">
          <AICompanion
            role={activeRole.roleTitle}
            company={activeRole.company}
            stage={primaryApp?.stage || 'applied'}
            jobDescription={activeRole.jdFull}
            resumeText={resumeText}
          />
        </div>
      </div>

      <ContactHelpModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        role={activeRole.roleTitle}
        company={activeRole.company}
        stage={primaryApp?.stage || 'applied'}
      />

      <ExploreRolesModal
        open={exploreOpen}
        onClose={() => setExploreOpen(false)}
      />
    </Layout>
  );
}
