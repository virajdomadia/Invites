# Folder Structure Verification Checklist ✅

Run this checklist to verify your folder structure is correct.

## File Structure Verification

### ✅ Routing Layer - `src/app/`

```
src/app/
├── ✓ _layout.tsx              ROOT NAVIGATION
├── ✓ (auth)/
│   ├── ✓ _layout.tsx          Auth layout
│   ├── ✓ login.tsx            Login route
│   └── ✓ phone-verify.tsx     Phone verify route
└── ✓ (home)/
    ├── ✓ _layout.tsx          Home layout
    └── ✓ index.tsx            Home route
```

**What to verify:**
- [ ] `src/app/_layout.tsx` exists
- [ ] `src/app/(auth)/` folder exists
- [ ] `src/app/(auth)/_layout.tsx` exists
- [ ] `src/app/(auth)/login.tsx` exists
- [ ] `src/app/(auth)/phone-verify.tsx` exists
- [ ] `src/app/(home)/` folder exists
- [ ] `src/app/(home)/_layout.tsx` exists
- [ ] `src/app/(home)/index.tsx` exists

### ✅ Features Layer - `src/features/`

```
src/features/
├── ✓ auth/
│   ├── ✓ components/
│   │   └── ✓ google-sign-in-button.tsx
│   ├── ✓ screens/
│   │   ├── ✓ login.tsx
│   │   └── ✓ phone-verify.tsx
│   ├── ✓ services/
│   │   ├── ✓ google-auth.ts
│   │   └── ✓ auth-service.ts
│   ├── ✓ hooks/
│   │   └── ✓ useAuth.ts
│   └── ✓ index.ts
├── ✓ home/
│   ├── ✓ screens/
│   │   └── ✓ index.tsx
│   └── ✓ index.ts
└── ✓ index.ts
```

**What to verify:**
- [ ] `src/features/auth/` folder exists
- [ ] Auth feature has: components/, screens/, services/, hooks/
- [ ] `src/features/auth/index.ts` exports all modules
- [ ] `src/features/home/` folder exists
- [ ] Home feature has: screens/
- [ ] `src/features/home/index.ts` exists
- [ ] `src/features/index.ts` exists (master exports)

### ✅ Core Layer - `src/core/`

```
src/core/
├── ✓ api/
│   └── ✓ api.ts
├── ✓ hooks/
│   └── ✓ useApi.ts
├── ✓ constants/
│   └── ✓ index.ts
└── ✓ index.ts
```

**What to verify:**
- [ ] `src/core/api/api.ts` exists
- [ ] `src/core/hooks/useApi.ts` exists
- [ ] `src/core/constants/index.ts` exists
- [ ] `src/core/index.ts` exists (core exports)

---

## Code Verification

### ✅ Root Layout Auth Check

**File:** `src/app/_layout.tsx`

```typescript
// Should have:
✓ import { useAuth } from '../features/auth/hooks/useAuth';
✓ const auth = useAuth();
✓ useEffect(() => {
✓   if (!auth.isAuthenticated) {
✓     router.replace('/login');
✓   } else {
✓     router.replace('/');
✓   }
✓ }, [auth.isAuthenticated]);
```

**Verify:**
- [ ] Imports useAuth from features/auth
- [ ] Has useEffect hook
- [ ] Routes to /login when not authenticated
- [ ] Routes to / when authenticated
- [ ] Uses Stack navigation

### ✅ Auth Layout

**File:** `src/app/(auth)/_layout.tsx`

```typescript
// Should have:
✓ import { Stack } from 'expo-router';
✓ return <Stack screenOptions={{ gestureEnabled: false }}>
✓ <Stack.Screen name="login" />
✓ <Stack.Screen name="phone-verify" />
```

**Verify:**
- [ ] Imports Stack from expo-router
- [ ] Disables gestures (secure auth screens)
- [ ] Has both login and phone-verify screens

### ✅ Auth Feature Exports

**File:** `src/features/auth/index.ts`

```typescript
// Should export:
✓ authService
✓ useGoogleAuth
✓ useAuth
✓ GoogleSignInButton
✓ LoginScreen
✓ PhoneVerifyScreen
```

**Verify:**
- [ ] Exports authService
- [ ] Exports useAuth hook
- [ ] Exports GoogleSignInButton
- [ ] Exports LoginScreen
- [ ] Exports PhoneVerifyScreen

### ✅ Core Exports

**File:** `src/core/index.ts`

```typescript
// Should export:
✓ apiClient
✓ useApi
✓ COLORS
✓ SPACING
✓ TYPOGRAPHY
```

**Verify:**
- [ ] Exports apiClient
- [ ] Exports useApi
- [ ] Exports constants

---

## Runtime Verification

### ✅ Check TypeScript Compilation
```bash
npm run lint
```

**Should see:**
- [ ] ESLint configured ✅
- [ ] No major errors
- [ ] Only warnings (not errors)

### ✅ Start Dev Server
```bash
npm start
```

**Should see:**
- [ ] Expo CLI output
- [ ] No "Cannot find module" errors
- [ ] Dev server ready
- [ ] Option to run on web/android/ios

### ✅ Test the App (Choose one)

#### Option 1: Web
```bash
npm start
# Press 'w' for web
```

**Should see:**
- [ ] App loads
- [ ] Login screen shows
- [ ] Google Sign-In button visible
- [ ] No console errors

#### Option 2: Android
```bash
npm start
# Press 'a' for android (requires Android Studio)
```

**Should see:**
- [ ] App builds
- [ ] Emulator shows login screen
- [ ] Google Sign-In button visible

#### Option 3: iOS
```bash
npm start
# Press 'i' for ios (Mac only)
```

**Should see:**
- [ ] App builds
- [ ] Simulator shows login screen
- [ ] Google Sign-In button visible

---

## Navigation Verification

### ✅ Test Login Route
1. App should open on login screen
2. URL/route should be `/login`
3. No back button (gesture disabled)

### ✅ Test Phone Verification Route
1. From login, tap "Send OTP"
2. Should navigate to `/phone-verify`
3. Should show phone verification form

### ✅ Test Home Route
1. After login, should navigate to `/`
2. Should show home screen
3. Should show user info
4. Should have logout button

---

## File Count Verification

### Expected File Counts

| Layer | Expected | Actual |
|-------|----------|--------|
| app/ | 8 files | ✓ |
| features/ | 10 files | ✓ |
| core/ | 4 files | ✓ |
| **TOTAL** | **22 files** | ✓ |

**Verify:**
- [ ] Count matches (or more - that's okay)
- [ ] All structure files exist
- [ ] No duplicate files

---

## Import Path Verification

### ✅ Check Imports are Correct

**In app/ files:**
```typescript
✓ import { ... } from '../../features/auth';
✓ import { ... } from '../../features/home';
```

**In features/ files:**
```typescript
✓ import { apiClient } from '../../../core/api/api';
✓ import { COLORS } from '../../../core/constants';
```

**In core/ files:**
```typescript
✓ No imports from features/ (NEVER!)
```

### ✅ No Old Import Paths
Search for these (should NOT exist):
```
❌ from '../hooks/' (old)
❌ from '../services/' (old)
❌ from '../components/' (old)
❌ from '../api/' (old)
```

---

## Environment Variables

### ✅ Check `.env` File
**File:** `.env` (in project root)

Should contain:
```
✓ EXPO_PUBLIC_API_URL=http://localhost:8000
✓ EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=...
✓ EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=...
✓ EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=...
```

**Verify:**
- [ ] `.env` file exists
- [ ] Has all required variables
- [ ] Not in git (check .gitignore)

---

## Documentation Files

### ✅ Required Documentation

```
✓ PROJECT_STRUCTURE.md         - Structure overview
✓ FEATURE_STRUCTURE_GUIDE.md   - Feature patterns
✓ EXPO_ROUTER_GROUPS.md        - Route Groups guide
✓ BEST_APPROACH_ANALYSIS.md    - Architecture comparison
✓ MIGRATION_COMPLETE.md        - What changed
✓ CLEANUP_GUIDE.md             - Delete old files
✓ GOOGLE_AUTH_SETUP.md         - OAuth setup
✓ FINAL_STRUCTURE.txt          - Visual overview
✓ VERIFICATION_CHECKLIST.md    - This file!
```

**Verify:**
- [ ] All 9 documentation files exist
- [ ] Readable and comprehensive

---

## Quick Test Script

Run this to verify everything:

```bash
#!/bin/bash

echo "🔍 Checking folder structure..."

# Check app/ folder
[ -f "src/app/_layout.tsx" ] && echo "✓ src/app/_layout.tsx" || echo "✗ MISSING: src/app/_layout.tsx"
[ -f "src/app/(auth)/_layout.tsx" ] && echo "✓ src/app/(auth)/_layout.tsx" || echo "✗ MISSING"
[ -f "src/app/(home)/_layout.tsx" ] && echo "✓ src/app/(home)/_layout.tsx" || echo "✗ MISSING"

# Check features/ folder
[ -f "src/features/auth/index.ts" ] && echo "✓ src/features/auth/index.ts" || echo "✗ MISSING"
[ -f "src/features/home/index.ts" ] && echo "✓ src/features/home/index.ts" || echo "✗ MISSING"

# Check core/ folder
[ -f "src/core/index.ts" ] && echo "✓ src/core/index.ts" || echo "✗ MISSING"

# Check lint
echo ""
echo "🧹 Running linter..."
npm run lint --silent

echo ""
echo "✅ Verification complete!"
```

---

## Common Issues & Solutions

### Issue: "Cannot find module" error
**Solution:**
- Check import paths use new locations
- Update old imports: `../services/` → `../features/auth/services/`
- Restart dev server: `npm start -- --reset-cache`

### Issue: App crashes on startup
**Solution:**
- Check `src/app/_layout.tsx` has correct imports
- Verify `useAuth()` is imported from features/auth
- Check for circular imports

### Issue: Routes not working
**Solution:**
- Don't use parentheses in `router.push()`: ✗ `/(auth)/login` ✓ `/login`
- Make sure route files exist in correct folders
- Check `_layout.tsx` files exist in each group

### Issue: Files not found
**Solution:**
- Run `npm start -- --reset-cache` to clear cache
- Restart dev server
- Check file paths are correct

---

## Success Criteria

✅ Your structure is correct if:

- [ ] All 22 files are in correct locations
- [ ] App runs without "Cannot find module" errors
- [ ] Login screen appears when opening app
- [ ] Routes navigate correctly (/login, /phone-verify, /)
- [ ] Google Sign-In button renders
- [ ] TypeScript compilation successful (npm run lint)
- [ ] No warnings about circular dependencies
- [ ] All documentation files exist

---

## Next Steps After Verification

1. ✅ **Verify** structure (you're doing this!)
2. ⬜ **Test** the app flows
3. ⬜ **Setup** Google OAuth (see GOOGLE_AUTH_SETUP.md)
4. ⬜ **Start** backend (localhost:8000)
5. ⬜ **Delete** old files (see CLEANUP_GUIDE.md)
6. ⬜ **Build** new features using this pattern

---

## Final Checklist

### Structure
- [ ] `src/app/` has Route Groups (auth, home)
- [ ] `src/features/` has feature modules
- [ ] `src/core/` has shared utilities
- [ ] All files in correct locations

### Code
- [ ] Root layout has auth logic
- [ ] Imports use correct paths
- [ ] No old import paths exist
- [ ] All exports are clean

### Testing
- [ ] App runs: `npm start`
- [ ] No TypeScript errors
- [ ] ESLint passes: `npm run lint`
- [ ] Routes navigate correctly

### Documentation
- [ ] All 9 doc files exist
- [ ] You've read FINAL_STRUCTURE.txt
- [ ] You understand Route Groups
- [ ] You understand features

### Ready to Build
- [ ] Structure verified ✅
- [ ] App running ✅
- [ ] Backend setup ⬜ (next)
- [ ] Old files deleted ⬜ (next)
- [ ] Ready to add features ✅

---

**Status:** ✅ Ready for verification!  
**Architecture:** Route Groups + Feature-Based  
**Next:** Run `npm start` and test your app!

