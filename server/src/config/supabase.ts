import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import cfg from './index';

let supabaseClient: SupabaseClientType | null = null;

if (cfg.supabaseUrl && cfg.supabaseServiceKey) {
  supabaseClient = createClient(cfg.supabaseUrl, cfg.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as SupabaseClientType;
} else {
  console.warn('⚠️ Supabase credentials not configured in server config. Auth features will be disabled.');
}

export { supabaseClient };
