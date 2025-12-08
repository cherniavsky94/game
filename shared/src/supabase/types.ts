export interface SupabaseUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  aud?: string;
  role?: string;
}

export interface SupabaseSession {
  access_token: string;
  expires_in?: number;
  expires_at?: number;
  refresh_token?: string;
  token_type?: string;
  user?: SupabaseUser | null;
}

export interface SupabaseAuthChangeEvent {
  event: string;
  session: SupabaseSession | null;
}
