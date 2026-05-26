import { Platform } from 'react-native';

let isConfigured = false;

export async function initializeGoogleSignIn(): Promise<void> {
  if (isConfigured) {
    return;
  }

  try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');

    const GoogleSignin = GoogleSigninModule.GoogleSignin || GoogleSigninModule.default;

    if (!GoogleSignin) {
      return;
    }

    const isIOS = Platform.OS === 'ios';
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';

    const config: any = {
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['profile', 'email'],
    };

    if (isIOS) {
      config.iosClientId = iosClientId;
    } else {
      config.androidClientId = androidClientId;
    }

    await GoogleSignin.configure(config);

    isConfigured = true;
  } catch (error) {
    // Silently fail - will retry on next sign-in attempt
  }
}
