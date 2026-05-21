# Complete Integration Guide

This guide shows you how to integrate all the OAuth components into your app.

## What You Have

✅ **Frontend Components:**
- `SignInModal` - Google OAuth UI with loading/success/error states
- `PhoneVerificationModal` - OTP flow for phone verification and account merge
- `useGoogleSignIn` - Hook for native/web Google OAuth
- `useAuthStore` - Zustand store for global auth state
- `useRequireAuth` - Hook to protect authenticated routes
- `useAuthInitialize` - Hook to restore session on app launch
- `AuthGuard` - Component to guard content based on auth state

✅ **Services:**
- `googleOAuthService` - Handles token exchange and session management
- `apiClient` - Auto-includes auth headers in API calls

✅ **Backend:**
- `POST /c56/auth/login` - Google OAuth endpoint
- `POST /c56/auth/send-phone-otp` - Send OTP
- `POST /c56/auth/verify-phone` - Verify phone
- `POST /c56/auth/merge-phone-account` - Merge account
- `POST /c56/auth/refresh` - Refresh token

---

## Integration Steps

### Step 1: Initialize Auth in Root Layout

Your root layout should restore session on app launch:

```typescript
// app/_layout.tsx or App.tsx

import { useAuthInitialize } from '@/core';
import { ActivityIndicator, View } from 'react-native';
import { Palette } from '@/theme';

export default function RootLayout() {
  const { isReady, isLoading } = useAuthInitialize();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Palette.colorWhite,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render your app layout based on auth state
  return <AppRoutes />;
}
```

### Step 2: Create Sign-In Screen

```typescript
// screens/SignInScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import SignInModal from '@/components/modals/SignInModal';
import { useGoogleSignIn, useAuthStore } from '@/core';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const [modalVisible, setModalVisible] = useState(true);
  const router = useRouter();
  
  const { signIn: googleSignIn } = useGoogleSignIn();
  const { signInWithGoogle, isNewUser } = useAuthStore();

  const handleGoogleSignInStart = useCallback(async () => {
    const tokens = await googleSignIn();
    return tokens;
  }, [googleSignIn]);

  const handleGoogleSignInSuccess = useCallback(
    async (tokens: { idToken: string; email: string; name: string }) => {
      try {
        await signInWithGoogle(tokens.idToken);

        const store = useAuthStore.getState();
        if (store.isNewUser) {
          // Offer merge flow
          router.push('/(auth)/merge-account');
        } else {
          // Go to home
          router.replace('/(app)/home');
        }
      } catch (error) {
        console.error('Sign-in failed:', error);
      }
    },
    [signInWithGoogle, router]
  );

  return (
    <SignInModal
      visible={modalVisible}
      onClose={() => router.back()}
      onGoogleSignInStart={handleGoogleSignInStart}
      onGoogleSignInSuccess={handleGoogleSignInSuccess}
    />
  );
}
```

### Step 3: Create Merge Account Screen (Optional)

```typescript
// screens/MergeAccountScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PhoneVerificationModal from '@/components/modals/PhoneVerificationModal';
import { useAuthStore } from '@/core';
import { useRouter } from 'expo-router';
import { LightMode } from '@/theme';

export default function MergeAccountScreen() {
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const router = useRouter();
  const { mergePhoneAccount } = useAuthStore();

  const handleMergeOTP = useCallback(
    async (phoneNumber: string, otp: string) => {
      try {
        await mergePhoneAccount(phoneNumber, otp);
        router.replace('/(app)/home');
      } catch (error) {
        console.error('Merge failed:', error);
        throw error;
      }
    },
    [mergePhoneAccount, router]
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <PhoneVerificationModal
        visible={phoneModalVisible}
        onClose={() => setPhoneModalVisible(false)}
        onMergeAccount={handleMergeOTP}
        mode="merge"
      />

      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 24 }}>
        Have an Existing Account?
      </Text>

      <TouchableOpacity
        onPress={() => setPhoneModalVisible(true)}
        style={{
          backgroundColor: LightMode.colorTextPrimary,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Merge Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/(app)/home')}
        style={{ marginTop: 16 }}
      >
        <Text style={{ color: LightMode.colorTextSecondary, fontWeight: '600' }}>
          Continue as New User
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Step 4: Protect Routes with Route Guards

```typescript
// app/(app)/_layout.tsx

import { useRequireAuth } from '@/core';
import { Redirect, Stack } from 'expo-router';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) {
    return null; // Show splash screen
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Stack />;
}
```

### Step 5: Create Profile/Settings Screen

```typescript
// screens/ProfileScreen.tsx

import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import PhoneVerificationModal from '@/components/modals/PhoneVerificationModal';
import { useAuthStore } from '@/core';
import { useRouter } from 'expo-router';
import { LightMode, Palette } from '@/theme';

export default function ProfileScreen() {
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const router = useRouter();

  const { user, verifyPhoneNumber, signOut } = useAuthStore();

  const handleVerifyPhone = useCallback(
    async (phoneNumber: string, otp: string) => {
      try {
        await verifyPhoneNumber(phoneNumber, otp);
        setPhoneModalVisible(false);
      } catch (error) {
        console.error('Phone verification failed:', error);
        throw error;
      }
    },
    [verifyPhoneNumber]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  }, [signOut, router]);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: Palette.colorWhite,
        paddingHorizontal: 20,
        paddingVertical: 32,
      }}
    >
      <PhoneVerificationModal
        visible={phoneModalVisible}
        onClose={() => setPhoneModalVisible(false)}
        onSendOTP={async () => {}} // Backend handles this
        onVerifyOTP={handleVerifyPhone}
        mode="verify"
      />

      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          marginBottom: 24,
          color: LightMode.colorTextPrimary,
        }}
      >
        Profile
      </Text>

      {/* User Info Card */}
      <View
        style={{
          backgroundColor: '#f5f5f5',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <InfoRow label="Name" value={user?.name || 'Loading...'} />
        <InfoRow label="Email" value={user?.email || 'Loading...'} />

        {user?.phone_number ? (
          <InfoRow label="Phone" value={user.phone_number} />
        ) : (
          <TouchableOpacity
            onPress={() => setPhoneModalVisible(true)}
            style={{ marginTop: 16 }}
          >
            <Text
              style={{
                color: LightMode.colorTextPrimary,
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              + Add Phone Number
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{
          backgroundColor: '#fee2e2',
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#991b1b', fontWeight: '600', fontSize: 16 }}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 12,
          color: LightMode.colorTextTertiary,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: LightMode.colorTextPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
```

### Step 6: Setup Router Configuration

```typescript
// app/_layout.tsx

import { useAuthInitialize, useAuthStore } from '@/core';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const { isReady } = useAuthInitialize();
  const { isSignedIn } = useAuthStore();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {isSignedIn() ? (
        // Authenticated routes
        <Stack.Screen
          name="(app)"
          options={{ animationEnabled: false }}
        />
      ) : (
        // Auth routes
        <Stack.Screen
          name="(auth)"
          options={{ animationEnabled: false }}
        />
      )}
    </Stack>
  );
}
```

---

## Usage Examples

### Example 1: Using AuthGuard Component

```typescript
import { AuthGuard } from '@/components/AuthGuard';

export default function MyScreen() {
  return (
    <AuthGuard requireAuth={true}>
      <YourProtectedContent />
    </AuthGuard>
  );
}
```

### Example 2: Manual Auth Check

```typescript
import { useAuthStore } from '@/core';

export default function MyScreen() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <SignInScreen />;

  return <UserContent />;
}
```

### Example 3: Making API Calls with Auth

```typescript
import { apiClient } from '@/core';

export default function EventsScreen() {
  const handleFetchEvents = async () => {
    // Auth token is automatically included in header
    const response = await apiClient.get('/events');
    
    if (response.error) {
      console.error('Failed to fetch events:', response.error);
      return;
    }

    console.log('Events:', response.data);
  };

  return (
    <TouchableOpacity onPress={handleFetchEvents}>
      <Text>Load Events</Text>
    </TouchableOpacity>
  );
}
```

### Example 4: Conditional Navigation

```typescript
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/core';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isNewUser } = useAuthStore();

  const handleHostEvent = () => {
    if (!user?.phone_number) {
      // Redirect to add phone
      router.push('/add-phone');
    } else {
      // Go to event creation
      router.push('/create-event');
    }
  };

  return (
    <TouchableOpacity onPress={handleHostEvent}>
      <Text>Host Event</Text>
    </TouchableOpacity>
  );
}
```

---

## Common Patterns

### Pattern 1: Phone Number Required

Certain features might require phone verification:

```typescript
function HostEventButton() {
  const { user } = useAuthStore();
  const router = useRouter();

  const handlePress = () => {
    if (!user?.phone_number) {
      router.push('/verify-phone');
    } else {
      router.push('/create-event');
    }
  };

  return <TouchableOpacity onPress={handlePress}>...</TouchableOpacity>;
}
```

### Pattern 2: Token Expiration Handling

Intercept 401 responses and refresh:

```typescript
// In apiClient.ts (add this to request method)
async request<T>(...) {
  const response = await fetch(url, { ... });
  
  if (response.status === 401) {
    // Token expired, try refresh
    const newToken = await googleOAuthService.refreshAccessToken();
    if (newToken) {
      // Retry request with new token
      return this.request<T>(endpoint, options, customHeaders);
    } else {
      // Redirect to sign-in
      useAuthStore.getState().signOut();
    }
  }
  
  return { ... };
}
```

### Pattern 3: User Data Persistence

Access auth state globally without prop drilling:

```typescript
// Anywhere in your app
import { useAuthStore } from '@/core';

export function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  return <Text>{user?.name}</Text>;
}
```

---

## Checklist: Before Going Live

- [ ] All auth components integrated
- [ ] Route guards protect sensitive screens
- [ ] Auth initializes on app launch
- [ ] Token refresh works on 401
- [ ] Phone verification flow tested
- [ ] Account merge tested
- [ ] Sign out clears all data
- [ ] Google OAuth credentials configured
- [ ] Backend running and accessible
- [ ] Test scenarios all pass (see TESTING_GUIDE.md)
- [ ] Error messages user-friendly
- [ ] Loading states show for long operations
- [ ] Secure storage fallback works

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/components/modals/SignInModal.tsx` | Google OAuth UI |
| `src/components/modals/PhoneVerificationModal.tsx` | Phone OTP UI |
| `src/core/hooks/useGoogleSignIn.ts` | Google OAuth logic |
| `src/core/hooks/useRequireAuth.ts` | Route protection |
| `src/core/hooks/useAuthInitialize.ts` | Session restore |
| `src/core/store/authStore.ts` | Global auth state |
| `src/core/auth/google-oauth-service.ts` | Backend communication |
| `src/core/api/api.ts` | HTTP client |
| `src/screens/AuthScreenExample.tsx` | Full flow example |

---

## Need Help?

Refer to:
- `OAUTH_FLOW_SETUP.md` - Architecture details
- `TESTING_GUIDE.md` - Test scenarios
- `BACKEND_IMPLEMENTATION_PHASE_5-7.md` - Backend code (if needed)
- Backend migration spec - API endpoint details
