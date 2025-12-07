import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  console.warn('⚠️ Supabase credentials not configured. Auth features will be disabled.');
}

export { supabase };

export async function verifyToken(token: string) {
  if (!supabase) {
    // For testing without Supabase, return mock user
    return { id: 'test-user-id', email: 'test@example.com' };
  }

  const { data, error } = await supabase.auth.getUser(token);
  
  if (error) {
    throw new Error('Invalid token');
  }
  
  return data.user;
}
