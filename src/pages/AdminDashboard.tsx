import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/use-auth';
import { useAdminStats, useAdminProfiles, useAdminCompanies, useCreateCompany, usePromoteToAdmin, useCreateRecruiter } from '@/hooks/use-admin-data';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Users, Briefcase, Shield, FileText, Plus, ArrowUp, Building2, UserPlus, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const roleBadge: Record<string, string> = {
  admin: 'destructive',
  recruiter: 'default',
  student: 'secondary',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: profiles = [], isLoading: profilesLoading } = useAdminProfiles();
  const { data: companies = [] } = useAdminCompanies();
  const createCompany = useCreateCompany();
  const promoteToAdmin = usePromoteToAdmin();
  const createRecruiter = useCreateRecruiter();

  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: '', domain: '' });
  const [showAssignRecruiter, setShowAssignRecruiter] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', companyId: '' });
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);

  const handleCreateCompany = async () => {
    if (!companyForm.name.trim()) return;
    try {
      await createCompany.mutateAsync(companyForm);
      toast.success('Company created');
      setShowCreateCompany(false);
      setCompanyForm({ name: '', domain: '' });
    } catch (e: any) { toast.error(e.message); }
  };

  const handlePromote = async (userId: string) => {
    try {
      await promoteToAdmin.mutateAsync(userId);
      toast.success('Promoted to admin');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAssignRecruiter = async () => {
    if (!assignForm.userId || !assignForm.companyId) return;
    try {
      await createRecruiter.mutateAsync({ userId: assignForm.userId, companyId: assignForm.companyId });
      toast.success('Recruiter assigned');
      setShowAssignRecruiter(false);
      setAssignForm({ userId: '', companyId: '' });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      // Create company
      const { data: co, error: coErr } = await supabase.from('companies').insert({ name: 'Acme Corp', domain: 'acme.com' }).select().single();
      if (coErr) throw coErr;

      // Create 2 jobs
      const { data: jobs, error: jErr } = await supabase.from('jobs').insert([
        { title: 'Frontend Engineer', role_type: 'tech', company_id: co.id, created_by: user!.id },
        { title: 'Data Analyst', role_type: 'data', company_id: co.id, created_by: user!.id },
      ]).select();
      if (jErr) throw jErr;

      toast.success('Demo data seeded: 1 company, 2 jobs');
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      qc.invalidateQueries({ queryKey: ['admin-companies'] });
      qc.invalidateQueries({ queryKey: ['admin-profiles'] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSeeding(false);
    }
  };

  const statCards = [
    { label: 'Students', value: stats?.students ?? '—', icon: Users },
    { label: 'Recruiters', value: stats?.recruiters ?? '—', icon: Briefcase },
    { label: 'Jobs', value: stats?.totalJobs ?? '—', icon: FileText },
    { label: 'Applications', value: stats?.totalApplications ?? '—', icon: FileText },
  ];

  const students = profiles.filter((p: any) => p.role === 'student');

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Admin Console</h1>
              <p className="text-sm text-muted-foreground">Manage users, companies, and platform data.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreateCompany(true)} className="gap-2">
                <Building2 className="h-4 w-4" /> Create Company
              </Button>
              <Button variant="outline" onClick={() => setShowAssignRecruiter(true)} className="gap-2">
                <UserPlus className="h-4 w-4" /> Assign Recruiter
              </Button>
              <Button onClick={handleSeedDemo} disabled={seeding} className="gap-2">
                <Wand2 className="h-4 w-4" /> {seeding ? 'Seeding...' : 'Seed Demo'}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{statsLoading ? '—' : stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs: People + Companies */}
          <Tabs defaultValue="people">
            <TabsList className="mb-4">
              <TabsTrigger value="people">People ({profiles.length})</TabsTrigger>
              <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="people">
              {profilesLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Joined</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((p: any) => (
                        <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => setSelectedProfile(p)}>
                          <td className="px-4 py-3 font-medium text-foreground">{p.display_name || 'Unnamed'}</td>
                          <td className="px-4 py-3">
                            <Badge variant={(roleBadge[p.role] as any) || 'secondary'} className="capitalize">{p.role}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {(p.recruiter?.companies as any)?.name || '—'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            {p.role !== 'admin' && (
                              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={(e) => { e.stopPropagation(); handlePromote(p.id); }}>
                                <ArrowUp className="h-3 w-3" /> Promote
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="companies">
              {companies.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No companies yet. Create one or seed demo data.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Domain</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c: any) => (
                        <tr key={c.id} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.domain || '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Create Company Dialog */}
      <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Company</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Company name" value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Domain (e.g. acme.com)" value={companyForm.domain} onChange={e => setCompanyForm(f => ({ ...f, domain: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCompany(false)}>Cancel</Button>
            <Button onClick={handleCreateCompany} disabled={createCompany.isPending || !companyForm.name.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Recruiter Dialog */}
      <Dialog open={showAssignRecruiter} onOpenChange={setShowAssignRecruiter}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Recruiter</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Select value={assignForm.userId} onValueChange={v => setAssignForm(f => ({ ...f, userId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
              <SelectContent>
                {students.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.display_name || p.id.slice(0, 8)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assignForm.companyId} onValueChange={v => setAssignForm(f => ({ ...f, companyId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {companies.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignRecruiter(false)}>Cancel</Button>
            <Button onClick={handleAssignRecruiter} disabled={createRecruiter.isPending || !assignForm.userId || !assignForm.companyId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile detail drawer */}
      <Sheet open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <SheetContent className="w-[380px] sm:max-w-[380px]">
          {selectedProfile && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedProfile.display_name || 'User'}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant={(roleBadge[selectedProfile.role] as any) || 'secondary'} className="capitalize">{selectedProfile.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs text-foreground">{selectedProfile.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="text-foreground">{new Date(selectedProfile.created_at).toLocaleDateString()}</span>
                </div>
                {selectedProfile.recruiter && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company</span>
                    <span className="text-foreground">{(selectedProfile.recruiter.companies as any)?.name || '—'}</span>
                  </div>
                )}
                {selectedProfile.bio && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Bio</span>
                    <p className="text-foreground">{selectedProfile.bio}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
