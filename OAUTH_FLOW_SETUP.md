# Google OAuth Flow Setup Guide

This guide explains how to use the Google OAuth modal and complete the OAuth flow in your application.

## Architecture Overview

The OAuth flow consists of:

1. **SignInModal** (`src/components/modals/SignInModal.tsx`) - UI component with state management
2. **useGoogleSignIn** (`src/core/hooks/useGoogleSignIn.ts`) - Hook for native (iOS/Android) and web OAuth
3. **GoogleOAuthService** (`src/core/auth/google-oauth-service.ts`) - Service for token exchange and session management
4. **Backend APIs** - Endpoints you need to implement

## OAuth Flow Steps

```
1. User opens SignInModal
   ↓
2. User clicks "Continue with Google"
   ↓
3. useGoogleSignIn.signIn() initiates OAuth
   ├─ Native: Uses @react-native-google-signin/google-signin
   └─ Web: Uses expo-auth-session
   ↓
4. Google returns ID token
   ↓
5. GoogleOAuthService.exchangeTokenForSession() verifies token
   ↓
6. Backend validates & returns session tokens
   ↓
7. Modal shows success state
   ↓
8. Modal closes & triggers onGoogleSignInSuccess callback
```

## Required Backend APIs

### 1. Token Verification Endpoint
**POST** `/auth/google/verify`

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response:**
```json
{
  "accessToken": "session_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id_from_google",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Backend Implementation Steps:**
- Verify the Google ID token using Google's token verification API
- Check token signature and expiration
- Extract user info (email, name, etc.)
- Create or fetch user in your database
- Generate session tokens (access & refresh)
- Return user data and tokens

### 2. Token Refresh Endpoint (Optional but Recommended)
**POST** `/auth/refresh`

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "accessToken": "new_session_token",
  "refreshToken": "new_refresh_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

## Implementation Steps

### Step 1: Setup Environment Variables

Add to your `.env` or `.env.local`:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Step 2: Initialize Google Sign-In (Native Only)

In your app's initialization code:
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'your_web_client_id.apps.googleusercontent.com',
  // For Android:
  scopes: ['openid', 'profile', 'email'],
});
```

### Step 3: Use the Modal

```typescript
import { useState } from 'react';
import SignInModal from '@/components/modals/SignInModal';
import { useGoogleSignIn } from '@/core';
import { googleOAuthService } from '@/core/auth/google-oauth-service';

export function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const { signIn: googleSignIn } = useGoogleSignIn();

  const handleGoogleSignInStart = async () => {
    // Get ID token from Google
    const tokens = await googleSignIn();

    // Exchange ID token for session token with backend
    const authResponse = await googleOAuthService.exchangeTokenForSession(
      tokens.idToken
    );

    return {
      idToken: tokens.idToken,
      email: authResponse.user.email,
      name: authResponse.user.name,
    };
  };

  const handleGoogleSignInSuccess = (tokens) => {
    setUser({
      email: tokens.email,
      name: tokens.name,
    });
    setModalVisible(false);
    // Navigate to authenticated screen
  };

  const handleGuestContinue = () => {
    setModalVisible(false);
    // Handle guest flow
  };

  return (
    <>
      <SignInModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onGoogleSignInStart={handleGoogleSignInStart}
        onGoogleSignInSuccess={handleGoogleSignInSuccess}
        onGuestContinue={handleGuestContinue}
      />
    </>
  );
}
```

### Step 4: Handle Stored Sessions on App Start

```typescript
import { useEffect, useState } from 'react';
import { googleOAuthService } from '@/core/auth/google-oauth-service';

export function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    async function initializeAuth() {
      try {
        const token = await googleOAuthService.retrieveStoredSession();
        setIsSignedIn(!!token);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsReady(true);
      }
    }

    initializeAuth();
  }, []);

  if (!isReady) {
    return null; // Show splash screen
  }

  // Render authenticated or guest layout based on isSignedIn
  return isSignedIn ? <AuthenticatedLayout /> : <GuestLayout />;
}
```

### Step 5: Handle Sign Out

```typescript
const handleSignOut = async () => {
  try {
    await googleOAuthService.clearSession();
    setUser(null);
    // Navigate to home/login screen
  } catch (error) {
    console.error('Sign-out failed:', error);
  }
};
```

## Modal Features

### Props

- **visible** (boolean) - Controls modal visibility
- **onClose** (function) - Called when modal closes
- **onGoogleSignInStart** (async function) - Called when user clicks Google button
  - Should return `{ idToken: string, email: string, name: string }`
  - Called before exchanging token with backend
- **onGoogleSignInSuccess** (function) - Called on successful sign-in
- **onGuestContinue** (function) - Called when user clicks "Continue as Guest"

### States

The modal automatically handles these states:
- **initial** - Default sign-in options shown
- **loading** - Processing sign-in, buttons disabled
- **success** - Checkmark shown, auto-closes after 1s
- **error** - Error message shown with retry button

### Error Handling

The modal displays error messages automatically. Common errors:
- "Network error" - Check API connectivity
- "OAuth authentication was cancelled" - User cancelled OAuth flow
- "Email not available in token" - Token missing email claim
- "Sign-in handler not configured" - onGoogleSignInStart not provided

## Token Storage

Tokens are stored securely in:
- **Native (Android/iOS)**: `expo-secure-store` - device secure storage
- **Web**: In-memory fallback (for development)

Stored keys:
- `google_id_token` - Google's ID token
- `google_email` - User email
- `google_name` - User name
- `auth_access_token` - Session access token
- `auth_refresh_token` - Session refresh token

## API Client Integration

The `apiClient` automatically includes the access token in all requests:

```typescript
// In API headers:
Authorization: Bearer {accessToken}
```

To manually set token:
```typescript
import { apiClient } from '@/core';

apiClient.setAuthToken(accessToken);
```

## Debugging

Enable logging for debugging:

```typescript
// In useGoogleSignIn or GoogleOAuthService
console.log('OAuth State:', {
  flowState,
  error,
  tokens,
});
```

Check stored credentials:
```typescript
import { secureStorage } from '@/core';

const storedEmail = await secureStorage.getItem('google_email');
const storedToken = await secureStorage.getItem('auth_access_token');
console.log('Stored:', { storedEmail, storedToken });
```

## Next Steps

1. Implement the backend API endpoints listed above
2. Set up Google OAuth credentials in Google Cloud Console
3. Add Google credentials to your app configuration
4. Test the OAuth flow on native and web platforms
5. Handle token refresh when access tokens expire
6. Implement guest user functionality if needed

## Testing

**Test Scenarios:**
- ✅ First-time user sign-in
- ✅ Returning user with stored tokens
- ✅ Token expiration and refresh
- ✅ Network error handling
- ✅ User cancels OAuth prompt
- ✅ Guest continue flow
- ✅ Sign-out and session clear
