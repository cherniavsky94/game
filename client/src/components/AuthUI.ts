import { SupabaseClient } from '../utils/SupabaseClient';

export class AuthUI {
  private container: HTMLDivElement;
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = SupabaseClient.getInstance();
    this.container = document.createElement('div');
    this.setupStyles();
    this.render();
    this.setupAuthListener();
  }

  private setupAuthListener() {
    window.addEventListener('auth-success', () => {
      this.onAuthSuccess();
    });
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .auth-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 1000;
      }

      .auth-box {
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        width: 100%;
        max-width: 400px;
      }

      .auth-title {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
        text-align: center;
      }

      .auth-subtitle {
        font-size: 14px;
        color: #666;
        margin-bottom: 30px;
        text-align: center;
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .auth-input {
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.3s;
      }

      .auth-input:focus {
        outline: none;
        border-color: #667eea;
      }

      .auth-button {
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .auth-button-primary {
        background: #667eea;
        color: white;
      }

      .auth-button-primary:hover {
        background: #5568d3;
        transform: translateY(-1px);
      }

      .auth-button-google {
        background: white;
        color: #333;
        border: 2px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .auth-button-google:hover {
        background: #f5f5f5;
      }

      .auth-divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 20px 0;
        color: #999;
        font-size: 12px;
      }

      .auth-divider::before,
      .auth-divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #e0e0e0;
      }

      .auth-divider span {
        padding: 0 10px;
      }

      .auth-toggle {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
      }

      .auth-toggle-link {
        color: #667eea;
        cursor: pointer;
        font-weight: 600;
      }

      .auth-toggle-link:hover {
        text-decoration: underline;
      }

      .auth-error {
        background: #fee;
        color: #c33;
        padding: 10px;
        border-radius: 6px;
        font-size: 13px;
        margin-bottom: 15px;
      }

      .auth-loading {
        text-align: center;
        color: #667eea;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  private render() {
    this.container.className = 'auth-container';
    this.container.innerHTML = `
      <div class="auth-box">
        <h1 class="auth-title">Isometric RPG</h1>
        <p class="auth-subtitle" id="auth-subtitle">Sign in to start playing</p>
        
        <div id="auth-error" class="auth-error" style="display: none;"></div>
        
        <form class="auth-form" id="auth-form">
          <input 
            type="email" 
            id="auth-email" 
            class="auth-input" 
            placeholder="Email" 
            required
          />
          <input 
            type="password" 
            id="auth-password" 
            class="auth-input" 
            placeholder="Password" 
            required
            minlength="6"
          />
          <button type="submit" class="auth-button auth-button-primary" id="auth-submit">
            Sign In
          </button>
        </form>

        <div class="auth-divider">
          <span>OR</span>
        </div>

        <button class="auth-button auth-button-google" id="google-signin">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div class="auth-toggle">
          <span id="auth-toggle-text">Don't have an account?</span>
          <span class="auth-toggle-link" id="auth-toggle-link">Sign Up</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.attachEventListeners();
  }

  private attachEventListeners() {
    const form = document.getElementById('auth-form') as HTMLFormElement;
    const toggleLink = document.getElementById('auth-toggle-link') as HTMLElement;
    const googleButton = document.getElementById('google-signin') as HTMLButtonElement;

    let isSignUp = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleEmailAuth(isSignUp);
    });

    toggleLink.addEventListener('click', () => {
      isSignUp = !isSignUp;
      this.updateFormMode(isSignUp);
    });

    googleButton.addEventListener('click', () => {
      this.handleGoogleAuth();
    });
  }

  private updateFormMode(isSignUp: boolean) {
    const subtitle = document.getElementById('auth-subtitle')!;
    const submitButton = document.getElementById('auth-submit')!;
    const toggleText = document.getElementById('auth-toggle-text')!;
    const toggleLink = document.getElementById('auth-toggle-link')!;

    if (isSignUp) {
      subtitle.textContent = 'Create your account';
      submitButton.textContent = 'Sign Up';
      toggleText.textContent = 'Already have an account?';
      toggleLink.textContent = 'Sign In';
    } else {
      subtitle.textContent = 'Sign in to start playing';
      submitButton.textContent = 'Sign In';
      toggleText.textContent = "Don't have an account?";
      toggleLink.textContent = 'Sign Up';
    }

    this.hideError();
  }

  private async handleEmailAuth(isSignUp: boolean) {
    const emailInput = document.getElementById('auth-email') as HTMLInputElement;
    const passwordInput = document.getElementById('auth-password') as HTMLInputElement;
    
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      this.showLoading();

      if (isSignUp) {
        await this.supabase.signUp(email, password);
        this.hideLoading();
        this.showError('Check your email to confirm your account!', false);
      } else {
        await this.supabase.signIn(email, password);
        // Auth state listener will trigger onAuthSuccess
        // Keep loading state until then
      }
    } catch (error: any) {
      this.hideLoading();
      this.showError(error.message || 'Authentication failed');
    }
  }

  private async handleGoogleAuth() {
    try {
      this.showLoading();
      await this.supabase.signInWithGoogle();
    } catch (error: any) {
      this.showError(error.message || 'Google sign-in failed');
      this.hideLoading();
    }
  }

  private showError(message: string, isError: boolean = true) {
    const errorDiv = document.getElementById('auth-error')!;
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.background = isError ? '#fee' : '#efe';
    errorDiv.style.color = isError ? '#c33' : '#3c3';
  }

  private hideError() {
    const errorDiv = document.getElementById('auth-error')!;
    errorDiv.style.display = 'none';
  }

  private showLoading() {
    const submitButton = document.getElementById('auth-submit') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Loading...';
    }
  }

  private hideLoading() {
    const submitButton = document.getElementById('auth-submit') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = false;
    }
  }

  private onAuthSuccess() {
    console.log('✅ Authentication successful');
    
    // Remove container immediately to prevent further interactions
    if (this.container && this.container.parentElement) {
      this.container.remove();
    }
    
    // Don't dispatch event here - SupabaseClient already does it
  }

  public show() {
    this.container.style.display = 'flex';
  }

  public hide() {
    this.container.style.display = 'none';
  }
}
