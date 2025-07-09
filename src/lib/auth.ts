import { supabase } from './supabase';

export interface AuthState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: true
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.checkAuthState();
    supabase.auth.onAuthStateChange((event, session) => {
      this.authState = {
        isAuthenticated: !!session,
        user: session?.user || null,
        loading: false
      };
      this.notifyListeners();
    });
  }

  private async checkAuthState() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this.authState = {
        isAuthenticated: !!session,
        user: session?.user || null,
        loading: false
      };
      this.notifyListeners();
    } catch (error) {
      console.error('Error checking auth state:', error);
      
      // Clear invalid refresh tokens to prevent repeated failed attempts
      await supabase.auth.signOut();
      
      this.authState.loading = false;
      this.notifyListeners();
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }
}

export const authService = AuthService.getInstance();