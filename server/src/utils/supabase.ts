import type { SupabaseUser } from 'shared/src/supabase/types';
import { supabaseClient } from '../config/supabase';

export { supabaseClient };

export async function verifyToken(token: string) {
  if (!supabaseClient) {
    // For testing without Supabase, return mock user
    return { id: 'test-user-id', email: 'test@example.com' } as SupabaseUser;
  }

  const { data, error } = await supabaseClient.auth.getUser(token);

  if (error) {
    throw new Error('Invalid token');
  }

  return data.user as SupabaseUser | null;
}
