-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'recruiter', 'hiring_manager');

-- Create pipeline stage enum
CREATE TYPE public.pipeline_stage AS ENUM ('screening', 'shortlisted', 'interview', 'offer', 'rejected', 'hired');

-- Create employment type enum
CREATE TYPE public.employment_type AS ENUM ('full-time', 'part-time', 'contract', 'internship');

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'recruiter',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  total_experience TEXT DEFAULT "0",
  relevant_experience INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  education JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  links JSONB DEFAULT '[]',
  employment_history JSONB DEFAULT '[]',
  resume_file_path TEXT,
  resume_file_name TEXT,
  parsed_resume_text TEXT,
  source TEXT,
  notes TEXT,
  stage pipeline_stage DEFAULT 'screening',
  tags TEXT[] DEFAULT '{}',
  current_salary INTEGER,
  expected_salary INTEGER,
  notice_period TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  required_skills TEXT[] DEFAULT '{}',
  min_experience INTEGER DEFAULT 0,
  max_experience INTEGER,
  location TEXT,
  employment_type employment_type DEFAULT 'full-time',
  salary_min INTEGER,
  salary_max INTEGER,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job applications / candidate-job matching
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  match_score INTEGER,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'rejected', 'hired')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- Communication history
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed'))
);

-- Storage bucket for CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user has any recruiting role
CREATE OR REPLACE FUNCTION public.is_recruiter_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'recruiter')
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies (only admins can manage roles)
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Candidates policies (recruiters and admins can CRUD)
CREATE POLICY "Recruiters can view all candidates"
ON public.candidates FOR SELECT
USING (public.is_recruiter_or_admin(auth.uid()));

CREATE POLICY "Recruiters can insert candidates"
ON public.candidates FOR INSERT
WITH CHECK (public.is_recruiter_or_admin(auth.uid()));

CREATE POLICY "Recruiters can update candidates"
ON public.candidates FOR UPDATE
USING (public.is_recruiter_or_admin(auth.uid()));

CREATE POLICY "Recruiters can delete candidates"
ON public.candidates FOR DELETE
USING (public.is_recruiter_or_admin(auth.uid()));

-- Jobs policies
CREATE POLICY "Anyone authenticated can view open jobs"
ON public.jobs FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Recruiters can manage jobs"
ON public.jobs FOR ALL
USING (public.is_recruiter_or_admin(auth.uid()));

-- Job applications policies
CREATE POLICY "Recruiters can view applications"
ON public.job_applications FOR SELECT
USING (public.is_recruiter_or_admin(auth.uid()));

CREATE POLICY "Recruiters can manage applications"
ON public.job_applications FOR ALL
USING (public.is_recruiter_or_admin(auth.uid()));

-- Communications policies
CREATE POLICY "Recruiters can view communications"
ON public.communications FOR SELECT
USING (public.is_recruiter_or_admin(auth.uid()));

CREATE POLICY "Recruiters can send communications"
ON public.communications FOR INSERT
WITH CHECK (public.is_recruiter_or_admin(auth.uid()));

-- Storage policies for resumes
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.uid() IS NOT NULL);

CREATE POLICY "Recruiters can view resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.uid() IS NOT NULL);

CREATE POLICY "Recruiters can delete resumes"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes' AND public.is_recruiter_or_admin(auth.uid()));

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default recruiter role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'recruiter');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();