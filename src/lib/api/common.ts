import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export async function getUserDetails(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}