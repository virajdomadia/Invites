# Expo Router Route Groups - App Folder Structure

Your `app/` folder now uses **Expo Router Route Groups** for better organization. Route Groups allow you to organize routes without affecting the URL structure.

## New App Structure

```
src/app/
├── _layout.tsx              ← Root navigation (authentication logic)
│
├── (auth)/                  ← Route Group: Authentication screens
│   ├── _layout.tsx          ← Auth layout & navigation
│   ├── login.tsx            → /login
│   └── phone-verify.tsx     → /phone-verify
│
└── (home)/                  ← Route Group: Home screens
    ├── _layout.tsx          ← Home layout & navigation
    └── index.tsx            → /
```

## How Route Groups Work

### Route Groups Syntax
- Folder names in parentheses: `(auth)`, `(home)`, `(settings)`
- **Don't affect URLs**: `(auth)/login.tsx` → `/login` (NOT `/(auth)/login`)
- **Organize code**: Group related screens together
- **Share layouts**: Each group can have its own `_layout.tsx`

### Before (without Route Groups)
```
src/app/
├── _layout.tsx
├── index.tsx          (home screen)
├── login.tsx
├── phone-verify.tsx
└── (scattered files)
```

### After (with Route Groups) ✨
```
src/app/
├── _layout.tsx
├── (auth)/
│   ├── login.tsx
│   ├── phone-verify.tsx
│   └── _layout.tsx
└── (home)/
    ├── index.tsx
    └── _layout.tsx
```

## URL Mapping

| File | URL | Group |
|------|-----|-------|
| `(auth)/login.tsx` | `/login` | auth |
| `(auth)/phone-verify.tsx` | `/phone-verify` | auth |
| `(home)/index.tsx` | `/` | home |

## Navigation Patterns

### Navigate to Login Screen
```typescript
import { router } from 'expo-router';

router.push('/login');        // ✅ Correct
router.push('/(auth)/login'); // ❌ Wrong - will not work
```

### Navigate to Home Screen
```typescript
router.push('/');             // ✅ Correct
router.replace('/');          // ✅ Also correct
```

### Navigate Between Auth Screens
```typescript
router.push('/phone-verify');
```

## Authentication Flow with Route Groups

### Root Layout (`src/app/_layout.tsx`)
- Checks if user is authenticated
- Conditionally renders auth or home screens
- Handles route transitions

```typescript
export default function RootLayout() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace('/login');      // Show login screen
    } else {
      router.replace('/');           // Show home screen
    }
  }, [auth.isAuthenticated]);

  return <Stack>{/* ... */}</Stack>;
}
```

### Auth Group Layout (`src/app/(auth)/_layout.tsx`)
- Manages auth-specific screens
- Prevents back gestures (secure screens)
- Handles auth transitions

```typescript
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ gestureEnabled: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="phone-verify" />
    </Stack>
  );
}
```

### Home Group Layout (`src/app/(home)/_layout.tsx`)
- Manages home screens
- Sets up header behavior
- Handles home transitions

```typescript
export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
```

## Route Screen Files

### Login Screen (`src/app/(auth)/login.tsx`)
```typescript
import { LoginScreen } from '../../features/auth';

export default LoginScreen;
```

### Phone Verification (`src/app/(auth)/phone-verify.tsx`)
```typescript
import { PhoneVerifyScreen } from '../../features/auth';

export default PhoneVerifyScreen;
```

### Home Screen (`src/app/(home)/index.tsx`)
```typescript
import { HomeScreen } from '../../features/home';

export default HomeScreen;
```

## Benefits of Route Groups

✅ **Better Organization**
- Group related screens together
- Easier to navigate codebase
- Clear logical separation

✅ **Cleaner URLs**
- URLs don't include group names
- `/login` instead of `/(auth)/login`
- Professional looking routes

✅ **Shared Layouts**
- Auth screens can have one layout
- Home screens can have another
- Each group controls its own navigation

✅ **Scalability**
- Easy to add new groups
- Easy to add new screens to groups
- No URL conflicts

✅ **Separation of Concerns**
- Auth logic in `(auth)/`
- Home logic in `(home)/`
- Settings in `(settings)/` (future)
- Etc.

## Adding New Route Groups

### Step 1: Create Group Folder
```bash
mkdir src/app/(settings)
```

### Step 2: Create Layout
```typescript
// src/app/(settings)/_layout.tsx
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
```

### Step 3: Add Screens
```typescript
// src/app/(settings)/index.tsx
export default function SettingsScreen() {
  return <View>{/* ... */}</View>;
}
```

### Step 4: Navigate to Group
```typescript
import { router } from 'expo-router';

// Navigate to settings
router.push('/');
```

## Common Patterns

### Protected Routes (Auth Required)
```typescript
// src/app/_layout.tsx
export default function RootLayout() {
  const auth = useAuth();

  useEffect(() => {
    // Always check authentication
    if (!auth.isAuthenticated) {
      router.replace('/login');
    }
  }, [auth.isAuthenticated]);

  return <Stack>{/* ... */}</Stack>;
}
```

### Onboarding Flow
```
src/app/
├── _layout.tsx
├── (onboarding)/
│   ├── _layout.tsx
│   ├── welcome.tsx
│   ├── signup.tsx
│   └── setup.tsx
└── (home)/
    └── index.tsx
```

### Admin Routes
```
src/app/
├── (admin)/
│   ├── users.tsx
│   ├── settings.tsx
│   └── analytics.tsx
└── (home)/
    └── index.tsx
```

## Route Hierarchy

```
RootLayout (src/app/_layout.tsx)
│
├── (auth)Layout (src/app/(auth)/_layout.tsx)
│   ├── login.tsx
│   └── phone-verify.tsx
│
└── (home)Layout (src/app/(home)/_layout.tsx)
    └── index.tsx
```

## Important Notes

### ⚠️ Don't Use Parentheses in Routes
```typescript
// ❌ Wrong
router.push('/(auth)/login');
router.replace('/(home)');

// ✅ Correct
router.push('/login');
router.replace('/');
```

### ⚠️ Each Group Needs _layout.tsx
```typescript
// Every group folder needs this:
// src/app/(group-name)/_layout.tsx

import { Stack } from 'expo-router';

export default function GroupLayout() {
  return <Stack>{/* ... */}</Stack>;
}
```

### ⚠️ Route Group Syntax
- Must use lowercase letters and hyphens: `(auth)`, `(home)`, `(user-settings)`
- Not supported: `(Auth)`, `(HOME)`, `(user_settings)`

## File Organization Summary

```
src/app/                           ← Expo Router root
├── _layout.tsx                    ← Root navigation (controls auth flow)
├── (auth)/                        ← Auth route group
│   ├── _layout.tsx                ← Auth stack navigation
│   ├── login.tsx                  ← Login screen
│   └── phone-verify.tsx           ← Phone verification
├── (home)/                        ← Home route group
│   ├── _layout.tsx                ← Home stack navigation
│   └── index.tsx                  ← Home screen
└── [other groups]/
    ├── _layout.tsx
    └── [screen files].tsx

src/features/                      ← Feature modules (logic/ui)
├── auth/
│   ├── screens/
│   ├── components/
│   ├── services/
│   └── hooks/
└── home/
    └── screens/

src/core/                          ← Shared utilities
├── api/
├── hooks/
└── constants/
```

## Testing Routes

### Test Auth Flow
```bash
npm start
# Tap Sign In
# Should navigate from /login to /phone-verify to /
```

### Test Navigation
```typescript
// In your component
const nav = useNavigation();

// Navigate
nav.navigate('/(auth)', { screen: 'phone-verify' });

// Or use router
router.push('/phone-verify');
```

## Debugging Routes

### Check Current Route
```typescript
import { useRoute } from '@react-navigation/native';

const route = useRoute();
console.log('Current route:', route.name);
```

### Log All Routes
```typescript
import { useRootNavigationState } from 'expo-router';

const rootNavigationState = useRootNavigationState();
console.log('Routes:', rootNavigationState?.routes);
```

## Best Practices

✅ **DO**
- Use route groups to organize related screens
- Keep screen files in `app/` folder
- Keep logic in `features/` folder
- Use simple, descriptive route names
- Use relative imports from app to features

❌ **DON'T**
- Use parentheses in router.push() calls
- Mix logic with routing
- Create deeply nested route groups
- Use uppercase in group names
- Put feature logic in app/ folder

## Summary

Route Groups are a powerful Expo Router feature that:
- 📁 **Organize** screens without affecting URLs
- 🎯 **Group** related screens together
- 🔐 **Protect** routes with layouts
- 🚀 **Scale** easily as your app grows

Your app now uses this modern, professional structure!

---

See also:
- [Expo Router Docs](https://docs.expo.dev/routing/introduction/)
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- [FEATURE_STRUCTURE_GUIDE.md](./FEATURE_STRUCTURE_GUIDE.md)
