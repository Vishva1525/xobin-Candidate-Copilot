import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ApplicationCard } from '@/components/ApplicationCard';
import { CreateApplicationWizard } from '@/components/CreateApplicationWizard';
import { useAuth } from '@/hooks/use-auth';
import { useApplications } from '@/hooks/use-applications';
import { motion } from 'framer-motion';
import { Briefcase, Sparkles, Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const { applications } = useApplications();
  const [wizardOpen, setWizardOpen] = useState(false);
  const firstName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there';

  const hasApps = applications.length > 0;
  const inProgress = applications.filter(a => a.stage !== 'rejected' && a.stage !== 'offer').length;
  const responseRate = applications.length > 0
    ? Math.round((applications.filter(a => a.stage !== 'applied').length / applications.length) * 100)
    : 0;

  return (
    <Layout>
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasApps
                    ? "Here's what's happening with your applications."
                    : 'Get started by creating your first application.'}
                </p>
              </div>
              {hasApps && (
                <Button onClick={() => setWizardOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Application
                </Button>
              )}
            </div>

            {hasApps ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Active Applications', value: String(applications.length), icon: Briefcase },
                    { label: 'In Progress', value: String(inProgress), icon: Sparkles },
                    { label: 'Response Rate', value: `${responseRate}%`, icon: Sparkles },
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
                    {applications.map((app, i) => (
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
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 px-8 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
                  <FolderOpen className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No applications yet</h2>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Create your first application to start tracking and prep with AI.
                </p>
                <Button onClick={() => setWizardOpen(true)} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Application
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <CreateApplicationWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </Layout>
  );
}
