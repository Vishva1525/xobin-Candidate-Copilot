import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { UnifiedTimeline } from '@/components/UnifiedTimeline';
import { FollowUpEmailModal } from '@/components/FollowUpEmailModal';
import { AIActionButton } from '@/components/AIActionButton';
import { RecruiterChat } from '@/components/RecruiterChat';
import { mockApplications, getStageInfo } from '@/lib/mock-data';
import { callAI } from '@/lib/ai-service';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, MessageSquare, Sparkles, Eye, Clock, User, Activity, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatTimeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const app = mockApplications.find(a => a.id === id);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  if (!app) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Application not found</p>
            <Link to="/dashboard" className="text-sm text-primary hover:underline mt-2 inline-block">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const stageInfo = getStageInfo(app.stage);

  return (
    <Layout>
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            {/* Back */}
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">{app.role}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{app.company}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{app.location}</span>
              </div>
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
                <p className="text-sm font-medium text-foreground">{app.handlerRole || 'Recruiting Coordinator'}</p>
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
                <p className="text-sm font-medium text-foreground">
                  ~{app.typicalResponseDays || 5} business days
                </p>
              </div>
            </div>

            {/* Unified Application Timeline */}
            <div className="rounded-xl border border-border bg-card p-6 mb-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-card-foreground">Application Timeline</h2>
                </div>
                <p className="text-xs text-muted-foreground">Full visibility into what's happening and what to do next.</p>
              </div>
              {app.stageTimeline && (
                <UnifiedTimeline
                  stages={app.stageTimeline}
                  applicationId={app.id}
                  onDraftEmail={() => setEmailModalOpen(true)}
                />
              )}
            </div>

            {/* Deadlines */}
            {app.deadlines.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-info" />
                  <h2 className="text-sm font-semibold text-card-foreground">Deadlines</h2>
                </div>
                <div className="space-y-2">
                  {app.deadlines.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-medium text-foreground">{d.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">Messages</h2>
              </div>
              <div className="space-y-4">
                {app.messages.map(msg => (
                  <div key={msg.id} className={cn('flex', !msg.isRecruiter && 'justify-end')}>
                    <div className={cn(
                      'max-w-[80%] rounded-xl px-4 py-3',
                      msg.isRecruiter
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-primary/10 text-foreground'
                    )}>
                      <p className="text-xs font-medium mb-1">{msg.from}</p>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1.5">{msg.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Actions panel */}
        <div className="hidden lg:block w-80 border-l border-border bg-card/30 overflow-y-auto p-5">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">AI Actions</h2>
          </div>

          <div className="space-y-3">
            <AIActionButton
              label="Likely interview topics"
              onClick={() => callAI('generate_interview_questions', { jd: app.jobDescription })}
              variant="compact"
            >
              {(result) => (
                <div className="space-y-2">
                  {result.behavioral?.slice(0, 3).map((q: string, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">• {q}</p>
                  ))}
                  <p className="text-xs text-primary">+{(result.behavioral?.length || 0) + (result.technical?.length || 0) - 3} more</p>
                </div>
              )}
            </AIActionButton>

            <AIActionButton
              label="Assessment tips"
              description="What to expect and how to prepare"
              onClick={() => callAI('stage_explainer', { stage: app.stage })}
              variant="compact"
            >
              {(result) => (
                <div className="space-y-2">
                  <p className="text-xs text-foreground leading-relaxed">{result.whatToExpect}</p>
                  <div className="space-y-1">
                    {result.tips?.map((tip: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">• {tip}</p>
                    ))}
                  </div>
                </div>
              )}
            </AIActionButton>
          </div>
        </div>
      </div>

      <FollowUpEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        role={app.role}
        company={app.company}
        stage={app.stage}
      />

      <RecruiterChat
        role={app.role}
        company={app.company}
        stage={app.stage}
        jobDescription={app.jobDescription}
      />
    </Layout>
  );
}
