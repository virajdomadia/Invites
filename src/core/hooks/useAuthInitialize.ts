import { useEffect, useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';

/**
 * Hook to initialize auth on app launch
 * Must be called in root layout to restore session from storage
 */
export function useAuthInitialize() {
  const { initializeAuth, isLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsReady(true);
      }
    }

    init();
  }, [initializeAuth]);

  return { isReady, isLoading };
}
