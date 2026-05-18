# Google Sign-In Setup Guide

This guide walks you through setting up Google OAuth authentication for your Expo mobile app.

## Quick Summary

✅ **Installed packages:**
- `expo-auth-session` - OAuth 2.0 flow handling
- `expo-crypto` - Cryptographic utilities
- `expo-secure-store` - Secure token storage

✅ **Created files:**
- `src/services/google-auth.ts` - Google Sign-In hook
- `src/services/auth-service.ts` - Auth state management
- `src/hooks/useAuth.ts` - Auth state hook
- `src/components/google-sign-in-button.tsx` - Sign-in button component
- `src/app/login.tsx` - Login screen
- `src/app/phone-verify.tsx` - Phone verification screen

## Step 1: Get Google OAuth Client IDs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application" first

### For Web
- **Application type:** Web application
- **Authorized JavaScript origins:** 
  - `http://localhost:3000` (development)
  - `http://localhost:8081` (Expo dev server)
  - `https://your-domain.com` (production)
- **Authorized redirect URIs:** (leave empty for Expo)
- Copy the **Client ID** and paste into `.env`:
  ```
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your_web_client_id.apps.googleusercontent.com
  ```

### For Android (Optional)
- **Application type:** Android
- **Package name:** `com.virajdomadia06.invites` (from app.json)
- **SHA-1 certificate fingerprint:** Run:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```
  Copy the SHA-1 fingerprint
- Copy the **Client ID** and paste into `.env`:
  ```
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_android_client_id.apps.googleusercontent.com
  ```

### For iOS (Optional)
- **Application type:** iOS
- **Bundle ID:** `com.virajdomadia06.invites` (from app.json)
- Copy the **Client ID** and paste into `.env`:
  ```
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your_ios_client_id.apps.googleusercontent.com
  ```

## Step 2: Update Environment Variables

Open `.env` and add your Google Client IDs:

```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=yyy.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=zzz.apps.googleusercontent.com
```

## Step 3: Start Your Backend

Make sure your backend is running at `http://localhost:8000` with the Google OAuth endpoints:

- `POST /auth/login` - Exchange Google ID token for JWT tokens
- `POST /auth/send-phone-otp` - Send OTP to phone
- `POST /auth/verify-phone` - Verify phone with OTP
- `POST /auth/refresh` - Refresh access token

See the `AGENTS.md` file for the full backend implementation details.

## Step 4: Run Your App

```bash
npm start
```

Then choose your platform:
- Press `w` for web
- Press `a` for Android (if you have Android Studio)
- Press `i` for iOS (Mac only)

## Authentication Flow

### First-time User (Google Sign-In)
1. User taps "Sign in with Google"
2. Google login screen appears
3. User signs in with their Google account
4. App receives Google ID token
5. Backend verifies token and creates new user account
6. App receives JWT access & refresh tokens
7. User is redirected to phone verification screen (optional)

### Existing User
1. User taps "Sign in with Google"
2. Google login screen appears
3. User signs in with their Google account
4. Backend finds existing account by email or google_sub
5. App receives JWT tokens
6. User is redirected to home screen

### Phone Verification (Optional)
1. User enters phone number
2. App sends phone number to backend
3. Backend sends OTP via SMS (MSG91)
4. User enters OTP
5. Backend verifies OTP and links phone to account

## Component Overview

### `GoogleSignInButton`
Reusable button component that triggers Google Sign-In flow.

```tsx
<GoogleSignInButton
  onSuccess={(isNewUser) => console.log('Success!', isNewUser)}
  onError={(error) => console.log('Error:', error)}
/>
```

### `useAuth()` Hook
Get current authentication state throughout your app.

```tsx
const auth = useAuth();

if (!auth.isAuthenticated) {
  return <LoginScreen />;
}

return (
  <Text>Welcome, {auth.user?.name}!</Text>
);
```

### Auth Service
Manually call auth methods without hooks.

```tsx
import { authService } from '../services/auth-service';

// Login
const result = await authService.loginWithGoogle(idToken, userInfo);

// Logout
authService.logout();

// Verify phone
await authService.verifyPhoneOTP('919876543210', '1234');

// Get current state
const state = authService.getState();
```

## Security Notes

✅ **Secure Token Storage**
- Access and refresh tokens are stored in `expo-secure-store`
- Tokens are encrypted at the OS level
- Tokens are cleared on logout

✅ **Google ID Token Verification**
- Backend verifies Google ID token signature
- Uses Google's public keys
- Prevents token spoofing

✅ **HTTPS in Production**
- Update `EXPO_PUBLIC_API_URL` to use HTTPS in production
- Ensure your backend is running on HTTPS

## Troubleshooting

### "Google Sign-In button not showing"
- Make sure `EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB` is set in `.env`
- Restart the Expo dev server: `npm start` (press `r`)

### "Failed to verify ID token"
- Check that your backend has the correct Google Client IDs
- Check that backend is running and accessible
- Verify `EXPO_PUBLIC_API_URL` is correct

### "Phone OTP not being sent"
- Make sure backend has MSG91 credentials configured
- Check that phone number is in correct format (e.g., 919876543210)
- Verify backend logs for OTP service errors

### "Tokens not persisting"
- Make sure `expo-secure-store` is properly installed
- On Android, ensure app has `READ_EXTERNAL_STORAGE` permission
- On iOS, ensure app has Keychain access

## Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Add Google Client IDs to `.env`
3. ✅ Start backend at `http://localhost:8000`
4. ✅ Run Expo app with `npm start`
5. Test the full authentication flow:
   - Sign in with Google
   - Verify phone number
   - Logout and sign in again (to test token restoration)
   - Test refresh token flow (make request after token expires)

## Backend Implementation

For detailed backend setup, see:
- `AGENTS.md` - Complete Google OAuth migration guide
- Backend endpoints documentation
- Database schema changes

## Support

For issues or questions:
- Check the Expo documentation: https://docs.expo.dev/
- Check the backend implementation in `AGENTS.md`
- Review React Native best practices: https://reactnative.dev/docs/network
