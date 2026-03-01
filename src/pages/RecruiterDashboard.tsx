import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { Briefcase, Users, TrendingUp } from 'lucide-react';

export default function RecruiterDashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Recruiter Dashboard</h1>
          <p className="text-sm text-muted-foreground mb-8">Manage your job listings and review candidates.</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Active Jobs', value: '0', icon: Briefcase },
              { label: 'Total Applicants', value: '0', icon: Users },
              { label: 'Conversion Rate', value: '0%', icon: TrendingUp },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-1">No jobs posted yet</h2>
            <p className="text-sm text-muted-foreground">Job management features coming soon.</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
