import { SupabaseClient } from './SupabaseClient';
import { AuthUI } from '../components/AuthUI';

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
    window.addEventListener('auth-success', () => {
      if (!this.isAuthenticated) {
        this.isAuthenticated = true;
        if (this.authUI) {
          this.authUI.hide();
        }
        console.log('🎮 User authenticated');
      }
    });

    window.addEventListener('auth-signout', () => {
      this.isAuthenticated = false;
      this.showAuthUI();
    });
  }

  async initialize(): Promise<boolean> {
    try {
      const session = await this.supabase.getSession();
      
      if (session) {
        this.isAuthenticated = true;
        console.log('✅ User already authenticated:', session.user.email);
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
      return await this.supabase.getUser();
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}
