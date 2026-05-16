import { useEffect, useState } from 'react';
import { authService } from '../services/auth-service';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const current = authService.getState();
    return {
      isAuthenticated: current.isAuthenticated,
      user: current.user,
      loading: current.loading,
      error: current.error,
    };
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe((newState) => {
      setState({
        isAuthenticated: newState.isAuthenticated,
        user: newState.user,
        loading: newState.loading,
        error: newState.error,
      });
    });

    return unsubscribe;
  }, []);

  return state;
}
