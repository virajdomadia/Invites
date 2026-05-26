import { useCallback, useState } from 'react';
import { secureStorage } from '../storage/secure-storage';
import { initializeGoogleSignIn } from '@/core/auth/google-signin-init';

interface GoogleSignInResult {
  idToken: string;
  email: string;
  name: string;
  photoUrl?: string;
}

interface UseGoogleSignInReturn {
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<GoogleSignInResult>;
  signOut: () => Promise<void>;
  getStoredTokens: () => Promise<GoogleSignInResult | null>;
}

export function useGoogleSignIn(): UseGoogleSignInReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStoredTokens = useCallback(async (): Promise<GoogleSignInResult | null> => {
    try {
      const storedToken = await secureStorage.getItem('google_id_token');
      const storedEmail = await secureStorage.getItem('google_email');
      const storedName = await secureStorage.getItem('google_name');
      const storedPhotoUrl = await secureStorage.getItem('google_photo_url');

      if (storedToken && storedEmail) {
        return {
          idToken: storedToken,
          email: storedEmail,
          name: storedName || 'User',
          photoUrl: storedPhotoUrl || undefined,
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  const signIn = useCallback(async (): Promise<GoogleSignInResult> => {
    try {
      setIsLoading(true);
      setError(null);
      return await signInNative();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInNative = useCallback(async (): Promise<GoogleSignInResult> => {
    try {
      await initializeGoogleSignIn();

      const { GoogleSignin } = require('@react-native-google-signin/google-signin');

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;
      const email = userInfo.data?.user?.email;
      const name = userInfo.data?.user?.name;
      const photoUrl = userInfo.data?.user?.photo;

      if (!idToken || !email) {
        throw new Error('Failed to get required user information from Google');
      }

      await secureStorage.setItem('google_id_token', idToken);
      await secureStorage.setItem('google_email', email);
      if (name) {
        await secureStorage.setItem('google_name', name);
      }
      if (photoUrl) {
        await secureStorage.setItem('google_photo_url', photoUrl);
      }

      return {
        idToken,
        email,
        name: name || 'User',
        photoUrl,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Native sign-in failed';
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await initializeGoogleSignIn();

      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut();

      await secureStorage.removeItem('google_id_token');
      await secureStorage.removeItem('google_email');
      await secureStorage.removeItem('google_name');
      await secureStorage.removeItem('google_photo_url');

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-out failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    signIn,
    signOut,
    getStoredTokens,
  };
}

