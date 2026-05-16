import React, { useEffect, useState } from 'react';

let Google: any = null;
let WebBrowser: any = null;

try {
  // Try to import native modules
  WebBrowser = require('expo-web-browser');
  Google = require('expo-auth-session/providers/google');
  WebBrowser.maybeCompleteAuthSession?.();
} catch (e) {
  // Fallback for web/development
  console.warn('Using auth fallback for web environment');
  Google = { useAuthRequest: () => [null, null, async () => ({ type: 'dismiss' })] };
  WebBrowser = { maybeCompleteAuthSession: () => {} };
}

// Google OAuth Client IDs - update with your actual client IDs
export const GOOGLE_CLIENT_IDS = {
  web: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '',
  android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',
  ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '',
};

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google?.useAuthRequest
    ? Google.useAuthRequest({
        clientId: GOOGLE_CLIENT_IDS.web,
        iosClientId: GOOGLE_CLIENT_IDS.ios,
        androidClientId: GOOGLE_CLIENT_IDS.android,
        scopes: ['profile', 'email'],
      })
    : [null, null, async () => ({ type: 'dismiss' })];

  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      if (id_token) {
        setIdToken(id_token);
        decodeToken(id_token);
      }
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Authentication failed');
      setLoading(false);
    }
  }, [response]);

  const decodeToken = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const decoded = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );

      setUserInfo({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
      });

      setLoading(false);
    } catch (err) {
      setError('Failed to decode token');
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await promptAsync();
      if (result?.type !== 'success') {
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
      setLoading(false);
    }
  };

  const signOut = () => {
    setIdToken(null);
    setUserInfo(null);
    setError(null);
  };

  return {
    idToken,
    userInfo,
    loading,
    error,
    signIn,
    signOut,
    isReady: request !== null,
  };
};
