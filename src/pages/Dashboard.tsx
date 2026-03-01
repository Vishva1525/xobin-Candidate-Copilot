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

      </div>
    </Layout>
  );
}