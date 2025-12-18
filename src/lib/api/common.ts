import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export async function getUserDetails(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', id).single();

  if (error) throw error;
  return data;
}