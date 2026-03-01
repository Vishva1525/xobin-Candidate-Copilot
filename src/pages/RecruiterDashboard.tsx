import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/use-auth';
import { useRecruiterProfile, useRecruiterJobs, useCreateJob } from '@/hooks/use-recruiter-data';
import { motion } from 'framer-motion';
import { Briefcase, Users, CheckCircle, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: recruiterProfile, isLoading: rpLoading } = useRecruiterProfile();
  const { data: jobs = [], isLoading: jobsLoading } = useRecruiterJobs(recruiterProfile?.company_id);
  const createJob = useCreateJob();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', role_type: 'tech' });

  const loading = rpLoading || jobsLoading;

  const handleCreate = async () => {
    if (!form.title.trim() || !recruiterProfile?.company_id || !user?.id) return;
    try {
      await createJob.mutateAsync({ ...form, company_id: recruiterProfile.company_id, created_by: user.id });
      toast.success('Job created');
      setShowCreate(false);
      setForm({ title: '', description: '', role_type: 'tech' });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // No recruiter profile
  if (!rpLoading && !recruiterProfile) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 px-12 text-center max-w-md">
            <Briefcase className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No Recruiter Profile</h2>
            <p className="text-sm text-muted-foreground">Ask an admin to assign you to a company to get started.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const openJobs = jobs.filter(j => j.status === 'open').length;

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Recruiter Console</h1>
              <p className="text-sm text-muted-foreground">
                {(recruiterProfile as any)?.companies?.name || 'Your Company'} — Manage jobs and candidates.
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Job
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Open Jobs', value: openJobs, icon: Briefcase },
              { label: 'Total Jobs', value: jobs.length, icon: Users },
              { label: 'Active', value: jobs.filter(j => j.status === 'open').length, icon: CheckCircle },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{loading ? '—' : stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Jobs Table */}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <h2 className="text-lg font-semibold text-foreground mb-1">No jobs yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Create your first job to start recruiting.</p>
              <Button onClick={() => setShowCreate(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create Job
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Job Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{job.title}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="capitalize">{job.role_type}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={job.status === 'open' ? 'default' : 'outline'} className="capitalize">{job.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(job.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/recruiter/job/${job.id}`)} className="gap-1.5">
                          <Eye className="h-3.5 w-3.5" /> Pipeline
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Job Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Job title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Select value={form.role_type} onValueChange={v => setForm(f => ({ ...f, role_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Job description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createJob.isPending || !form.title.trim()}>
              {createJob.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
