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
        // Silently continue - user will be prompted to login if needed
      } finally {
        setIsReady(true);
      }
    }

    init();
  }, [initializeAuth]);

  return { isReady, isLoading };
}
