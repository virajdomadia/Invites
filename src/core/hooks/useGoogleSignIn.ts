import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { secureStorage } from '../storage/secure-storage';
import { initializeGoogleSignIn } from '@/core/auth/google-signin-init';

interface GoogleSignInResult {
  idToken: string;
  email: string;
  name: string;
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

      if (storedToken && storedEmail) {
        return {
          idToken: storedToken,
          email: storedEmail,
          name: storedName || 'User',
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to retrieve stored tokens:', err);
      return null;
    }
  }, []);

  const signIn = useCallback(async (): Promise<GoogleSignInResult> => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        return await signInWeb();
      } else {
        return await signInNative();
      }
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

      if (!idToken || !email) {
        throw new Error('Failed to get required user information from Google');
      }

      await secureStorage.setItem('google_id_token', idToken);
      await secureStorage.setItem('google_email', email);
      if (name) {
        await secureStorage.setItem('google_name', name);
      }

      return {
        idToken,
        email,
        name: name || 'User',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Native sign-in failed';
      throw new Error(message);
    }
  }, []);

  const signInWeb = useCallback(async (): Promise<GoogleSignInResult> => {
    try {
      const AuthSession = await import('expo-auth-session');
      const WebBrowser = await import('expo-web-browser');

      const discovery = await AuthSession.useAutoDiscovery('https://accounts.google.com');

      if (!discovery) {
        throw new Error('OAuth discovery failed');
      }

      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
        scopes: ['openid', 'profile', 'email'],
        redirectUrl: AuthSession.makeRedirectUri({
          useProxy: true,
        }),
      });

      if (!request) {
        throw new Error('Failed to create auth request');
      }

      const result = await request.promptAsync(discovery, {
        useProxy: true,
      });

      if (result?.type !== 'success') {
        throw new Error('OAuth authentication was cancelled or failed');
      }

      const tokens = result.params.access_token
        ? { idToken: result.params.id_token }
        : await AuthSession.fetchIdTokenAsync(
            {
              clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
            },
            discovery
          );

      if (!tokens?.idToken) {
        throw new Error('Failed to get ID token');
      }

      const decoded = decodeIdToken(tokens.idToken);
      const email = decoded.email;
      const name = decoded.name;

      if (!email) {
        throw new Error('Email not available in token');
      }

      await secureStorage.setItem('google_id_token', tokens.idToken);
      await secureStorage.setItem('google_email', email);
      if (name) {
        await secureStorage.setItem('google_name', name);
      }

      return {
        idToken: tokens.idToken,
        email,
        name: name || 'User',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Web sign-in failed';
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      if (Platform.OS !== 'web') {
        await initializeGoogleSignIn();

        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        await GoogleSignin.signOut();
      }

      await secureStorage.removeItem('google_id_token');
      await secureStorage.removeItem('google_email');
      await secureStorage.removeItem('google_name');

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

function decodeIdToken(token: string): { email: string; name: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    return {
      email: decoded.email || '',
      name: decoded.name || '',
    };
  } catch (err) {
    console.error('Failed to decode token:', err);
    return { email: '', name: '' };
  }
}
