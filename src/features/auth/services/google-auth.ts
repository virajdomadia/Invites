import { useEffect, useState } from 'react';

let GoogleAuth: any = null;
let WebBrowser: any = null;

try {
  WebBrowser = require('expo-web-browser');
  GoogleAuth = require('expo-auth-session/providers/google');
  WebBrowser.maybeCompleteAuthSession?.();
} catch {
  console.warn('Using auth fallback for web environment');
  GoogleAuth = { useAuthRequest: null };
  WebBrowser = { maybeCompleteAuthSession: () => {} };
}

export const GOOGLE_CLIENT_IDS = {
  web: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '',
  android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',
  ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '',
};

export const useGoogleAuth = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const authRequest = GoogleAuth?.useAuthRequest
    ? GoogleAuth.useAuthRequest({
        clientId: GOOGLE_CLIENT_IDS.web,
        iosClientId: GOOGLE_CLIENT_IDS.ios,
        androidClientId: GOOGLE_CLIENT_IDS.android,
        scopes: ['profile', 'email'],
      })
    : [null, null, async () => ({ type: 'dismiss' })];

  const [request, response, promptAsync] = authRequest;
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
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

      // Use atob for base64 decoding (available in all JS environments)
      const decoded = JSON.parse(atob(parts[1]));

      setUserInfo({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
      });

      setLoading(false);
    } catch {
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
