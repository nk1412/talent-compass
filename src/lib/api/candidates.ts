import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Candidate = Database['public']['Tables']['candidates']['Row'];
type CandidateInsert = Database['public']['Tables']['candidates']['Insert'];
type CandidateUpdate = Database['public']['Tables']['candidates']['Update'];

export async function getCandidates() {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCandidate(id: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createCandidate(candidate: CandidateInsert) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('candidates')
    .insert({ ...candidate, created_by: user?.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCandidate(id: string, updates: CandidateUpdate) {
  const { data, error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCandidate(id: string) {
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadResume(file: File): Promise<{ path: string; fileName: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage
    .from('resumes')
    .upload(filePath, file);

  if (error) throw error;

  return { path: filePath, fileName: file.name };
}

export async function getResumeUrl(path: string) {
  const { data } = await supabase.storage
    .from('resumes')
    .createSignedUrl(path, 3600); // 1 hour expiry

  return data?.signedUrl;
}

export async function parseResumeWithAI(resumeText: string, fileName: string) {
  const { data, error } = await supabase.functions.invoke('parse-resume', {
    body: { resumeText, fileName }
  });

  if (error) throw error;
  return data;
}
