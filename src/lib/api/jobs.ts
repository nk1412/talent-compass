import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getJob(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createJob(job: JobInsert) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...job, created_by: user?.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateJob(id: string, updates: JobUpdate) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteJob(id: string) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function matchCandidatesForJob(jobId: string) {
  // First get the job
  const job = await getJob(jobId);
  if (!job) throw new Error('Job not found');

  // Get all candidates
  const { data: candidates, error: candError } = await supabase
    .from('candidates')
    .select('id, full_name, skills, total_experience, location');

  if (candError) throw candError;

  // Call the matching function
  const { data, error } = await supabase.functions.invoke('match-candidates', {
    body: { job, candidates }
  });

  if (error) throw error;
  return data;
}
