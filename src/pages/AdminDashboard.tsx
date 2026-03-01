import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Users, Shield, Activity } from 'lucide-react';

interface ProfileRow {
  id: string;
  display_name: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('id, display_name, created_at').order('created_at', { ascending: false }).then(({ data }) => {
      setProfiles((data as ProfileRow[]) || []);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mb-8">Manage users, roles, and platform settings.</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Users', value: String(profiles.length), icon: Users },
              { label: 'Roles', value: '3', icon: Shield },
              { label: 'Status', value: 'Active', icon: Activity },
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

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : profiles.length > 0 ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3 text-foreground">{p.display_name || 'Unnamed'}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No users found.</p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
