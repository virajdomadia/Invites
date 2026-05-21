import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/core/store/authStore';

/**
 * Hook to protect routes - redirects to sign-in if not authenticated
 * Usage: Place at the top of any screen that requires authentication
 */
export function useRequireAuth() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (!user || !accessToken)) {
      router.replace('/(auth)/sign-in');
    }
  }, [user, accessToken, isLoading, router]);

  return {
    isAuthenticated: !!user && !!accessToken,
    isLoading,
  };
}
