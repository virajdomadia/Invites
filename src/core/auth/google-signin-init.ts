import { Platform } from 'react-native';

let isConfigured = false;

export async function initializeGoogleSignIn(): Promise<void> {
  // Skip on web platform
  if (Platform.OS === 'web') {
    return;
  }

  // Skip if already configured
  if (isConfigured) {
    return;
  }

  try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');

    console.log('GoogleSignin module loaded:', !!GoogleSigninModule);
    console.log('GoogleSignin exports:', Object.keys(GoogleSigninModule));

    const GoogleSignin = GoogleSigninModule.GoogleSignin || GoogleSigninModule.default;

    if (!GoogleSignin) {
      console.error('GoogleSignin not found in module exports');
      return;
    }

    console.log('GoogleSignin object:', !!GoogleSignin);
    console.log('GoogleSignin methods:', Object.keys(GoogleSignin || {}));

    const isIOS = Platform.OS === 'ios';
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';

    console.log('Configuring GoogleSignin with IDs:', {
      webClientId: webClientId ? 'SET' : 'MISSING',
      androidClientId: androidClientId ? 'SET' : 'MISSING',
      iosClientId: iosClientId ? 'SET' : 'MISSING',
      platform: Platform.OS,
    });

    const config: any = {
      webClientId, // Required for all platforms
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['profile', 'email'],
    };

    if (isIOS) {
      config.iosClientId = iosClientId;
    }

    await GoogleSignin.configure(config);

    console.log('GoogleSignin configured successfully');
    isConfigured = true;
  } catch (error) {
    console.error('Failed to configure GoogleSignin:', error);
  }
}
