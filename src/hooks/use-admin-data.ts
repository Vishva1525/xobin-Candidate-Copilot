import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [profiles, roles, jobs, applications] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('role'),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }),
      ]);
      const roleList = roles.data || [];
      return {
        totalUsers: profiles.count || 0,
        students: roleList.filter(r => r.role === 'student').length,
        recruiters: roleList.filter(r => r.role === 'recruiter').length,
        admins: roleList.filter(r => r.role === 'admin').length,
        totalJobs: jobs.count || 0,
        totalApplications: applications.count || 0,
      };
    },
  });
}

export function useAdminProfiles() {
  return useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      const { data: recruiterProfiles } = await supabase
        .from('recruiter_profiles')
        .select('user_id, company_id, companies(name)');
      const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));
      const recruiterMap = new Map((recruiterProfiles || []).map(r => [r.user_id, r]));
      return (profiles || []).map(p => ({
        ...p,
        role: roleMap.get(p.id) || 'student',
        recruiter: recruiterMap.get(p.id),
      }));
    },
  });
}

export function useAdminCompanies() {
  return useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (company: { name: string; domain?: string }) => {
      const { data, error } = await supabase.from('companies').insert(company).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-companies'] }),
  });
}

export function usePromoteToAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('user_roles').update({ role: 'admin' }).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-profiles'] }),
  });
}

export function useCreateRecruiter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, companyId }: { userId: string; companyId: string }) => {
      // Update role to recruiter
      const { error: roleErr } = await supabase.from('user_roles').update({ role: 'recruiter' }).eq('user_id', userId);
      if (roleErr) throw roleErr;
      // Create recruiter profile
      const { error: rpErr } = await supabase.from('recruiter_profiles').insert({ user_id: userId, company_id: companyId });
      if (rpErr) throw rpErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-profiles'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}
