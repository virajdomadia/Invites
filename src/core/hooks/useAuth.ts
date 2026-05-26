import { useAuthStore } from '@/core/store/authStore';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAuth = () => {
  const store = useAuthStore();

  // Initialize auth on component mount
  useEffect(() => {
    store.initializeAuth();
  }, [store]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [store]);

  const handleAppStateChange = async (state: AppStateStatus) => {
    if (state === 'active') {
      // App came to foreground - refresh token if needed
      const refreshToken = await store.refreshAccessToken();
      if (!refreshToken) {
        // Token refresh failed, user needs to login again
        store.signOut();
      }
    }
  };

  // Google login mutation
  const googleLoginMutation = useMutation({
    mutationFn: async (data: {
      idToken: string;
      email?: string;
      name?: string;
      photoUrl?: string;
    }) => {
      const user = await store.signInWithGoogle(
        data.idToken,
        data.email,
        data.name,
        data.photoUrl
      );
      return { user, isNewUser: store.isNewUser };
    },
    onError: (error: Error) => {
      store.setError(error.message);
    },
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; phone_number?: string }) => {
      const user = store.user;
      if (!user) throw new Error('No user found');

      // For now, we just update the local store
      // In a real app, this would call an API endpoint
      store.setUser({
        ...user,
        name: data.name,
        phone_number: data.phone_number,
      });

      return store.user;
    },
    onError: (error: Error) => {
      store.setError(error.message);
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const newToken = await store.refreshAccessToken();
      if (!newToken) {
        throw new Error('Token refresh failed');
      }
      return newToken;
    },
    onError: () => {
      // If refresh fails, logout
      store.signOut();
    },
  });

  return {
    user: store.user,
    accessToken: store.accessToken,
    isLoading: store.isLoading,
    isNewUser: store.isNewUser,
    error: store.error,
    isAuthReady: store.isAuthReady,

    // Actions
    loginWithGoogle: googleLoginMutation.mutateAsync,
    updateUserProfile: updateProfileMutation.mutateAsync,
    refreshToken: refreshTokenMutation.mutateAsync,
    logout: store.signOut,
    verifyPhoneNumber: store.verifyPhoneNumber,
    mergePhoneAccount: store.mergePhoneAccount,

    // Loading states
    isLoggingIn: googleLoginMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isRefreshingToken: refreshTokenMutation.isPending,
  };
};
