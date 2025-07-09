import { useState, useEffect } from 'react';
import { authService, AuthState } from '../lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService)
  };
}