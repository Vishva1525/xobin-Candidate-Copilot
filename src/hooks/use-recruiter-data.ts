import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export function useRecruiterProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['recruiter-profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('*, companies(*)')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
  });
}

export function useRecruiterJobs(companyId: string | undefined) {
  return useQuery({
    queryKey: ['recruiter-jobs', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });
}

export function useJobApplications(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-applications', jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const { data } = await supabase
        .from('applications')
        .select('*, profiles:student_id(id, display_name, avatar_url)')
        .eq('job_id', jobId!)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });
}

export function useApplicationMessages(applicationId: string | undefined) {
  return useQuery({
    queryKey: ['application-messages', applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('application_id', applicationId!)
        .order('created_at', { ascending: true });
      return data || [];
    },
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job: { title: string; description: string; role_type: string; company_id: string; created_by: string }) => {
      const { data, error } = await supabase.from('jobs').insert(job).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiter-jobs'] }),
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; stage?: string; status?: string; notes?: string }) => {
      const { data, error } = await supabase.from('applications').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-applications'] }),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (msg: { application_id: string; sender_role: string; sender_id: string; body: string }) => {
      const { data, error } = await supabase.from('messages').insert(msg).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['application-messages', vars.application_id] }),
  });
}
