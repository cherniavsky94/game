import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

export class SupabaseClient {
  private static instance: SupabaseClient;
  private client: SupabaseClientType;

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase credentials not configured');
    }
    
    this.client = createClient(supabaseUrl, supabaseKey);
    this.setupAuthListener();
  }

  static getInstance(): SupabaseClient {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = new SupabaseClient();
    }
    return SupabaseClient.instance;
  }

  private setupAuthListener() {
    this.client.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('auth-success', { detail: session }));
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        window.dispatchEvent(new CustomEvent('auth-signout'));
      }
    });
  }

  getClient(): SupabaseClientType {
    return this.client;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  async signInWithGoogle() {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async getUser() {
    const { data, error } = await this.client.auth.getUser();
    if (error) throw error;
    return data.user;
  }
}
