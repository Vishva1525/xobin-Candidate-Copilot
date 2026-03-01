import { Layout } from '@/components/Layout';
import { ApplicationCard } from '@/components/ApplicationCard';
import { mockApplications } from '@/lib/mock-data';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { callAI } from '@/lib/ai-service';
import { AIActionButton } from '@/components/AIActionButton';
import { motion } from 'framer-motion';
import { Briefcase, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [email] = useLocalStorage<string | null>('candidateos_email', null);
  const firstName = email?.split('@')[0] || 'there';

  return (
    <Layout>
      <div className="flex h-full">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Welcome back, {firstName}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Here's what's happening with your applications.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Active Applications', value: '2', icon: Briefcase },
                { label: 'In Progress', value: '2', icon: Sparkles },
                { label: 'Response Rate', value: '100%', icon: Sparkles },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Applications */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Your Applications</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {mockApplications.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  >
                    <ApplicationCard application={app} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right panel — AI Copilot */}
        <div className="hidden lg:block w-80 border-l border-border bg-card/30 overflow-y-auto p-5">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">AI Co-pilot</h2>
          </div>

          <div className="space-y-3">
            <AIActionButton
              label="Tailor resume for Stripe"
              description="Optimize your resume for the Frontend Engineer role"
              onClick={() => callAI('tailor_resume_to_jd', { applicationId: 'stripe-sfe' })}
              variant="compact"
            >
              {(result) => (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">ATS Match</p>
                  <p className="text-lg font-bold text-success">{result.atsMatchPercentage}%</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.suggestedKeywords.length} keyword suggestions ready
                  </p>
                </div>
              )}
            </AIActionButton>

            <AIActionButton
              label="Likely interview questions"
              description="For your Linear Product Designer application"
              onClick={() => callAI('generate_interview_questions', { applicationId: 'linear-pd' })}
              variant="compact"
            >
              {(result) => (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-foreground">{result.behavioral.length + result.technical.length} questions generated</p>
                  <p className="text-xs text-muted-foreground">{result.behavioral.length} behavioral, {result.technical.length} technical</p>
                </div>
              )}
            </AIActionButton>

            <AIActionButton
              label="What to expect next"
              description="Understand your current stages"
              onClick={() => callAI('stage_explainer', { stage: 'assessment' })}
              variant="compact"
            >
              {(result) => (
                <div className="space-y-2">
                  <p className="text-xs text-foreground leading-relaxed">{result.explanation}</p>
                  <p className="text-xs text-muted-foreground">{result.typicalTimeline}</p>
                </div>
              )}
            </AIActionButton>

            <AIActionButton
              label="Draft follow-up email"
              description="Send a thoughtful follow-up to your recruiter"
              onClick={() => callAI('recruiter_followup_email', { company: 'Stripe', role: 'Senior Frontend Engineer', recruiterName: 'Sarah' })}
              variant="compact"
            >
              {(result) => (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Subject: {result.subject}</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-4">{result.body}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Copy to clipboard
                  </button>
                </div>
              )}
            </AIActionButton>
          </div>
        </div>
      </div>
    </Layout>
  );
}