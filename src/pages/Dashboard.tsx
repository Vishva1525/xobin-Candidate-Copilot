import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ContactHelpModal } from '@/components/ContactHelpModal';
import { AICompanion } from '@/components/AICompanion';
import { ExploreRolesModal } from '@/components/ExploreRolesModal';
import { xobinApplication, getStageInfo } from '@/lib/mock-data';
import { callAI } from '@/lib/ai-service';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRoleContext } from '@/hooks/use-role-context';
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

  const app = xobinApplication;
  const stageInfo = getStageInfo(app.stage);
  const firstName = email?.split('@')[0] || 'there';

  // Determine active stage index for stepper
  const stageKeyMap: Record<string, string> = {
    applied: 'applied',
    assessment: 'assessment',
    'ai-interview': 'ai_interview',
    'recruiter-screen': 'recruiter_review',
    offer: 'offer',
  };
  const mappedStage = stageKeyMap[app.stage] || app.stage;
  const activeIdx = stageOrder.indexOf(mappedStage as UnifiedStageKey);

  // Load insights on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingInsights(true);
    callAI('dashboard_insights', {
      roleTitle: app.role,
      company: app.company,
      currentStage: app.stage,
      jobDescription: app.jobDescription,
      resumeSummary: resumeText ? resumeText.slice(0, 500) : '',
      deadlines: app.deadlines,
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
        <div className="flex-1 overflow-y-auto p-8">
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

            {/* Hero Header */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Your Xobin Application
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Role: <span className="font-medium text-foreground">{app.role}</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  <Zap className="h-3 w-3" />
                  {stageLabels[mappedStage as UnifiedStageKey] || 'In Progress'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                <Clock className="inline h-3 w-3 mr-1" />
                Next update typically in {app.typicalResponseDays || 5} business days
              </p>
            </div>

            {/* Trust & Transparency Widgets */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/15">
                    <User className="h-3.5 w-3.5 text-info" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Handler</span>
                </div>
                <p className="text-sm font-medium text-foreground">{app.handlerRole}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
                    <Activity className="h-3.5 w-3.5 text-success" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Last Activity</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {app.lastActivityAt ? formatTimeAgo(app.lastActivityAt) : 'Unknown'}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/15">
                    <Shield className="h-3.5 w-3.5 text-warning" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Response SLA</span>
                </div>
                <p className="text-sm font-medium text-foreground">~{app.typicalResponseDays} business days</p>
              </div>
            </div>

            {/* Compact Timeline Stepper */}
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <h2 className="text-sm font-semibold text-card-foreground mb-4">Application Progress</h2>
              <div className="flex items-center gap-1">
                {stageOrder.map((key, i) => {
                  const isCompleted = i < activeIdx;
                  const isActive = i === activeIdx;
                  return (
                    <div key={key} className="flex-1 flex items-center gap-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                          isCompleted ? 'bg-success/15 text-success' :
                          isActive ? 'bg-primary text-primary-foreground glow-primary-sm' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={cn(
                          'text-[10px] mt-1.5 text-center leading-tight',
                          isActive ? 'font-semibold text-primary' :
                          isCompleted ? 'text-success font-medium' :
                          'text-muted-foreground'
                        )}>
                          {stageLabels[key]}
                        </span>
                      </div>
                      {i < stageOrder.length - 1 && (
                        <div className={cn(
                          'h-0.5 flex-1 rounded-full mt-[-14px]',
                          i < activeIdx ? 'bg-success' : 'bg-border'
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* What's next */}
              <div className="mt-4 rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">What's Next</p>
                <p className="text-xs text-foreground leading-relaxed">{stageInfo.meaning.slice(0, 150)}</p>
              </div>
            </div>

            {/* Next Best Actions */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">Recommended Actions</h2>
              <div className="grid grid-cols-3 gap-3">
                <Link
                  to="/resume-lab"
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:glow-primary-sm transition-all"
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
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:glow-primary-sm transition-all"
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
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:glow-primary-sm transition-all text-left"
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
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">What Xobin is Doing Now</p>
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

            {/* Need Help */}
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-warning" />
                <h2 className="text-sm font-semibold text-card-foreground">Need Help?</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Questions about your application? Contact the Xobin Hiring Support Team.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
                >
                  <MessageSquare className="h-3 w-3" />
                  Draft Message with AI
                </button>
              </div>
            </div>

            {/* Explore Other Roles */}
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Compass className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-card-foreground">Explore Other Roles at Xobin</h2>
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

            {/* AI Companion */}
            <AICompanion
              role={activeRole.roleTitle}
              company={activeRole.company}
              stage={app.stage}
              jobDescription={activeRole.jdFull}
              resumeText={resumeText}
            />
          </motion.div>
        </div>
      </div>

      <ContactHelpModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        role={activeRole.roleTitle}
        company={activeRole.company}
        stage={app.stage}
      />

      <ExploreRolesModal
        open={exploreOpen}
        onClose={() => setExploreOpen(false)}
      />
    </Layout>
  );
}
