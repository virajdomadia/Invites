import { create } from 'zustand';
import { Platform } from 'react-native';
import { secureStorage } from '@/core/storage/secure-storage';
import { apiClient } from '@/core/api/api';
import { googleOAuthService } from '@/core/auth/google-oauth-service';

export interface User {
  id: string;
  email: string;
  name: string;
  phone_number?: string;
  photo_url?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isNewUser: boolean;
  error: string | null;
  isAuthReady: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsNewUser: (isNew: boolean) => void;

  // Auth flows
  initializeAuth: () => Promise<void>;
  signInWithGoogle: (idToken: string, email?: string, name?: string, photoUrl?: string) => Promise<User>;
  refreshAccessToken: () => Promise<string | null>;
  verifyPhoneNumber: (phoneNumber: string, otp: string) => Promise<void>;
  mergePhoneAccount: (phoneNumber: string, otp: string) => Promise<User>;
  signOut: () => Promise<void>;
  isSignedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isNewUser: false,
  error: null,
  isAuthReady: false,

  setUser: (user: User | null) => {
    set({ user });
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    set({ accessToken, refreshToken });
    apiClient.setAuthToken(accessToken);
    apiClient.setRefreshToken(refreshToken);

    // Persist tokens to secure storage
    secureStorage.setItem('auth_access_token', accessToken);
    if (refreshToken) {
      secureStorage.setItem('auth_refresh_token', refreshToken);
    }

    // Register callback to update store when token is refreshed
    apiClient.setTokenRefreshCallback((newToken: string) => {
      set({ accessToken: newToken });
      secureStorage.setItem('auth_access_token', newToken);
    });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setIsNewUser: (isNew: boolean) => {
    set({ isNewUser: isNew });
  },

  initializeAuth: async () => {
    const { setUser, setTokens, setIsLoading } = get();

    try {
      setIsLoading(true);

      // Try to retrieve stored session
      const storedToken = await secureStorage.getItem('auth_access_token');
      const storedRefresh = await secureStorage.getItem('auth_refresh_token');
      const storedEmail = await secureStorage.getItem('google_email');
      const storedName = await secureStorage.getItem('google_name');
      const storedUserId = await secureStorage.getItem('google_user_id');
      const storedPhoneNumber = await secureStorage.getItem('google_phone_number');
      const storedPhotoUrl = await secureStorage.getItem('google_photo_url');

      if (storedToken && storedEmail) {
        setTokens(storedToken, storedRefresh || '');
        setUser({
          id: storedUserId || storedEmail,
          email: storedEmail,
          name: storedName || 'User',
          phone_number: storedPhoneNumber || undefined,
          photo_url: storedPhotoUrl || undefined,
        });
      }
    } catch (error) {
      // Silently continue - user will need to login
    } finally {
      setIsLoading(false);
      set({ isAuthReady: true });
    }
  },

  signInWithGoogle: async (idToken: string, email?: string, name?: string, photoUrl?: string) => {
    const { setUser, setTokens, setError, setIsNewUser } = get();

    try {
      set({ isLoading: true, error: null });

      const authResponse = await googleOAuthService.exchangeTokenForSession(idToken);

      setTokens(authResponse.access_token, authResponse.refresh_token || '');
      setIsNewUser(authResponse.is_new_user || false);

      // Use email/name from Google Sign-In response first, fall back to backend response
      const finalEmail = email || authResponse.user?.email || '';
      const finalName = name || authResponse.user?.name || 'User';
      const userId = authResponse.user?.id || authResponse.user_id || '';

      const user: User = {
        id: userId,
        email: finalEmail,
        name: finalName,
        photo_url: photoUrl,
      };

      // Persist user data to secure storage for session restoration
      await secureStorage.setItem('google_email', user.email);
      await secureStorage.setItem('google_name', user.name);
      if (user.id) {
        await secureStorage.setItem('google_user_id', user.id);
      }
      if (photoUrl) {
        await secureStorage.setItem('google_photo_url', photoUrl);
      }

      setUser(user);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed';
      setError(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshAccessToken: async () => {
    try {
      const newToken = await googleOAuthService.refreshAccessToken();
      if (newToken) {
        const refreshToken = await secureStorage.getItem('auth_refresh_token');
        get().setTokens(newToken, refreshToken || '');
      }
      return newToken;
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Token refresh failed');
      return null;
    }
  },

  verifyPhoneNumber: async (phoneNumber: string, otp: string) => {
    const { setError } = get();

    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.post(
        '/c56/auth/verify-phone',
        { phone_number: phoneNumber, otp }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Update user with phone number
      const user = get().user;
      if (user) {
        const updatedUser = {
          ...user,
          phone_number: phoneNumber,
        };
        set({ user: updatedUser });

        // Persist updated user data
        await secureStorage.setItem('google_email', updatedUser.email);
        await secureStorage.setItem('google_name', updatedUser.name);
        if (updatedUser.phone_number) {
          await secureStorage.setItem('google_phone_number', updatedUser.phone_number);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Phone verification failed';
      setError(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  mergePhoneAccount: async (phoneNumber: string, otp: string) => {
    const { setUser, setTokens, setError } = get();

    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user_id: string;
      }>('/c56/auth/merge-phone-account', {
        phone_number: phoneNumber,
        otp,
      });

      if (response.error || !response.data) {
        throw new Error(response.error || 'Account merge failed');
      }

      const { access_token, refresh_token, user_id } = response.data;

      setTokens(access_token, refresh_token);

      // Re-fetch user data or update from response
      const user: User = {
        id: user_id,
        email: get().user?.email || '',
        name: get().user?.name || 'User',
        phone_number: phoneNumber,
      };

      // Persist merged account data
      await secureStorage.setItem('google_email', user.email);
      await secureStorage.setItem('google_name', user.name);
      await secureStorage.setItem('google_user_id', user.id);
      if (user.phone_number) {
        await secureStorage.setItem('google_phone_number', user.phone_number);
      }

      setUser(user);
      set({ isNewUser: false });

      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account merge failed';
      setError(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    const { setUser, setError } = get();

    try {
      set({ isLoading: true });

      await googleOAuthService.logout();
      setUser(null);
      set({
        accessToken: null,
        refreshToken: null,
        isNewUser: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-out failed';
      setError(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  isSignedIn: () => {
    const { accessToken, user } = get();
    return !!accessToken && !!user;
  },
}));
