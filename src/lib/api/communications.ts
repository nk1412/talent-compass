import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Communication = Database['public']['Tables']['communications']['Row'];

export async function getCommunications(candidateId: string) {
  const { data, error } = await supabase
    .from('communications')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('sent_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function sendEmail(
  candidateId: string, 
  candidateEmail: string, 
  candidateName: string,
  subject: string, 
  body: string
) {
  const { data: { user } } = await supabase.auth.getUser();

  // Call the email function
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: candidateEmail,
      candidateName,
      subject,
      body
    }
  });

  if (error) throw error;

  // Log the communication
  const { error: logError } = await supabase
    .from('communications')
    .insert({
      candidate_id: candidateId,
      subject,
      body,
      sent_by: user?.id,
      status: data.success ? 'sent' : 'failed'
    });

  if (logError) console.error('Failed to log communication:', logError);

  return data;
}
