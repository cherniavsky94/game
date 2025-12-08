import { SupabaseClient } from './SupabaseClient';
import { AuthUI } from '../components/AuthUI';
import { store } from '../store';

export class AuthManager {
  private static instance: AuthManager;
  private supabase: SupabaseClient;
  private authUI: AuthUI | null = null;
  private isAuthenticated: boolean = false;

  private constructor() {
    this.supabase = SupabaseClient.getInstance();
    this.setupEventListeners();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private setupEventListeners() {
    window.addEventListener('auth-success', async (ev: any) => {
      try {
        const session = ev?.detail;
        const user = await this.supabase.getUser();
        this.isAuthenticated = true;
        if (this.authUI) this.authUI.hide();
        // update central store
        store.setUser(user ?? null, session?.access_token ?? null);
        console.log('🎮 User authenticated');
      } catch (e) {
        console.error('Error handling auth-success', e);
      }
    });

    window.addEventListener('auth-signout', () => {
      this.isAuthenticated = false;
      store.clearAuth();
      this.showAuthUI();
    });
  }

  async initialize(): Promise<boolean> {
    try {
      const session = await this.supabase.getSession();
      
      if (session) {
        const user = await this.supabase.getUser();
        this.isAuthenticated = true;
        store.setUser(user ?? null, session.access_token ?? null);
        console.log('✅ User already authenticated:', session.user?.email);
        return true;
      } else {
        this.showAuthUI();
        return false;
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.showAuthUI();
      return false;
    }
  }

  private showAuthUI() {
    if (!this.authUI) {
      this.authUI = new AuthUI();
    } else {
      this.authUI.show();
    }
  }



  async signOut() {
    try {
      await this.supabase.signOut();
      this.isAuthenticated = false;
      store.clearAuth();
      this.showAuthUI();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }

  async getCurrentUser() {
    try {
      const user = await this.supabase.getUser();
      // keep store in sync
      if (user) store.setUser(user);
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}
