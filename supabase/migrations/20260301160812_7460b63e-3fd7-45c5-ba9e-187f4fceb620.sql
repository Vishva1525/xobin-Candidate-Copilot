
-- Companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recruiter profiles (links user to company)
CREATE TABLE public.recruiter_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can view own profile" ON public.recruiter_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage recruiter profiles" ON public.recruiter_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Jobs table
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  role_type text NOT NULL DEFAULT 'tech',
  status text NOT NULL DEFAULT 'open',
  threshold_resume numeric DEFAULT 60,
  threshold_assessment numeric DEFAULT 60,
  threshold_interview numeric DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters see own company jobs" ON public.jobs FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.user_id = auth.uid() AND rp.company_id = jobs.company_id
    )
    OR status = 'open'
  );
CREATE POLICY "Recruiters can insert jobs for own company" ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.user_id = auth.uid() AND rp.company_id = jobs.company_id
    )
  );
CREATE POLICY "Recruiters can update own company jobs" ON public.jobs FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.user_id = auth.uid() AND rp.company_id = jobs.company_id
    )
  );
CREATE POLICY "Admins can delete jobs" ON public.jobs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Applications table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage text NOT NULL DEFAULT 'applied',
  status text NOT NULL DEFAULT 'active',
  resume_score numeric,
  assessment_score numeric,
  interview_score numeric,
  resume_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own applications" ON public.applications FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.recruiter_profiles rp ON rp.company_id = j.company_id
      WHERE j.id = applications.job_id AND rp.user_id = auth.uid()
    )
  );
CREATE POLICY "Students can apply" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Recruiters and admins can update applications" ON public.applications FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.recruiter_profiles rp ON rp.company_id = j.company_id
      WHERE j.id = applications.job_id AND rp.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  sender_role text NOT NULL,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = messages.application_id AND a.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      JOIN public.recruiter_profiles rp ON rp.company_id = j.company_id
      WHERE a.id = messages.application_id AND rp.user_id = auth.uid()
    )
  );
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());
