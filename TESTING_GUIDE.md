# Testing Guide - Google OAuth + Phone Verification

This guide walks you through testing the complete OAuth and phone verification flow.

## Prerequisites

- Backend running on `localhost:8000` with Google OAuth endpoints
- Frontend development server running
- Google OAuth credentials configured in your backend `.env`

## Quick Start

### 1. Start Frontend Dev Server

```bash
npm start
# or
expo start
```

### 2. Start Backend

```bash
cd Backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Test with the Example Screen

Navigate to `src/screens/AuthScreenExample.tsx` or integrate it into your app's routing.

---

## Test Scenarios

### Scenario 1: First-Time Google Sign-In

**Setup:**
- User has never signed in before
- Using a Google account not previously registered

**Steps:**
1. Open app
2. Tap "Sign In"
3. Choose "Continue with Google"
4. Complete Google OAuth flow
5. Should see "New or Returning?" prompt with `is_new_user: true`
6. Choose "No, Continue as New User"

**Expected Result:**
- ✅ User profile displayed with name and email
- ✅ Phone number shows "+ Add Phone Number"
- ✅ Access token stored in secure storage
- ✅ Backend logs show new user created

---

### Scenario 2: Returning User (Same Google Account)

**Setup:**
- Already signed in once before with this Google account

**Steps:**
1. Sign out
2. Tap "Sign In"
3. Choose "Continue with Google"
4. Complete Google OAuth with same account

**Expected Result:**
- ✅ Skips "New or Returning?" prompt
- ✅ Goes directly to signed-in state
- ✅ Shows previously saved phone number (if any)
- ✅ `is_new_user: false`

---

### Scenario 3: Account Linking (Email Match)

**Setup:**
- OTP user previously signed up with email `test@example.com`
- Now signing in with Google account using same email

**Steps:**
1. Sign up via OTP with phone `919876543210` and email `test@example.com`
2. Sign out
3. Sign in with Google using same email `test@example.com`

**Expected Result:**
- ✅ Google account auto-linked to existing OTP account
- ✅ `is_new_user: false` (not a new user)
- ✅ Phone number shows previously verified `919876543210`
- ✅ All events from OTP account accessible

---

### Scenario 4: Account Merge (Different Email)

**Setup:**
- OTP user: signed up via phone `919876543210`, email `old@example.com`
- Google user: signing in with email `new@example.com`

**Steps:**
1. Sign up via OTP with phone `919876543210`, email `old@example.com`
2. Sign out completely
3. Sign in with Google using email `new@example.com`
4. See "New or Returning?" prompt
5. Tap "Yes, Merge My Account"
6. Enter phone: `919876543210`
7. Enter OTP (check backend logs for OTP or use test OTP if available)

**Expected Result:**
- ✅ Shows "Merge Account" modal
- ✅ After successful OTP verification
- ✅ Returns tokens for old account (not new one)
- ✅ Old account now has `google_sub` linked
- ✅ All events transferred to merged account
- ✅ New empty account blocked

---

### Scenario 5: Phone Verification for Event Hosting

**Setup:**
- User is signed in without a phone number

**Steps:**
1. Sign in with Google
2. On profile screen, tap "+ Add Phone Number"
3. Enter phone: `919876543210`
4. Tap "Send OTP"
5. Wait for OTP (check backend logs)
6. Enter OTP: `1234` (or actual OTP from backend)
7. Tap "Verify OTP"

**Expected Result:**
- ✅ Phone verification modal appears
- ✅ OTP sent successfully
- ✅ "Resend OTP in 60s" countdown appears
- ✅ After OTP verification, shows "Verified!"
- ✅ Modal closes
- ✅ Profile updated with phone number
- ✅ User can now host events

---

### Scenario 6: Phone Already Taken (Active Google Account)

**Setup:**
- Phone `919876543210` already linked to active Google account

**Steps:**
1. Sign in as different user (new Google account)
2. Try to verify phone: `919876543210`
3. Send OTP

**Expected Result:**
- ✅ Backend returns `409 Conflict`
- ✅ Modal shows error: "This phone number is already registered to another account"
- ✅ User can tap "Try Again" to enter different phone

---

### Scenario 7: Token Refresh

**Setup:**
- User is signed in
- Access token expired (or simulate by shortening `JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1`)

**Steps:**
1. Sign in
2. Wait for token to expire (or manually call refresh)
3. Try to make API call (e.g., fetch user profile)
4. Auto-refresh should be triggered

**Expected Result:**
- ✅ New access token issued
- ✅ API call succeeds
- ✅ User session continues seamlessly

---

### Scenario 8: Sign Out

**Setup:**
- User is signed in

**Steps:**
1. On profile screen, tap "Sign Out"
2. Confirm

**Expected Result:**
- ✅ Tokens cleared from secure storage
- ✅ App returns to sign-in screen
- ✅ User data cleared from memory
- ✅ All auth headers removed from future API calls

---

## Debugging

### Check Stored Credentials

Add this temporary code to your app to inspect stored values:

```typescript
import { secureStorage } from '@/core';

// Add to a test button
const handleDebugAuth = async () => {
  const token = await secureStorage.getItem('auth_access_token');
  const email = await secureStorage.getItem('google_email');
  const phone = await secureStorage.getItem('google_name');
  
  console.log('Stored Auth:', {
    token: token ? token.substring(0, 20) + '...' : null,
    email,
    phone,
  });
};
```

### Monitor API Calls

Open browser dev tools or use Proxyman/Charles to monitor:
- `POST /c56/auth/login` - Google sign-in
- `POST /c56/auth/send-phone-otp` - Send OTP
- `POST /c56/auth/verify-phone` - Verify OTP
- `POST /c56/auth/merge-phone-account` - Merge account
- `POST /c56/auth/refresh` - Refresh token

### Backend Logs

Monitor backend logs for:
```
INFO: User created with google_sub: google-xxxx
INFO: OTP sent to: 919876543210
INFO: Account merged: old_user_id -> new_user_id
ERROR: Phone number already registered
```

---

## Common Issues & Fixes

### Issue: "Invalid ID token"
**Cause:** Google Client ID mismatch
**Fix:** Ensure `GOOGLE_CLIENT_IDS` in backend includes the frontend's Client ID

### Issue: "Phone verification modal not appearing"
**Cause:** `PhoneVerificationModal` not passed correct props
**Fix:** Check `onSendOTP`, `onVerifyOTP` callbacks are implemented

### Issue: "Modal closes but user not updated"
**Cause:** Auth store not updated after successful verification
**Fix:** Ensure `useAuthStore` methods are called in success callbacks

### Issue: "OTP always invalid"
**Cause:** Backend OTP verification failing
**Fix:** Check `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID` in backend `.env`

### Issue: "Cannot read property 'phone_number' of null"
**Cause:** User object is null
**Fix:** Add null checks before accessing user properties

---

## Test Data

### Valid Test Phone Numbers

Indian numbers (for MSG91):
- `919876543210`
- `918765432109`
- `919999999999`

### Test OTPs

If backend supports test mode, use:
- `1234` - Always valid test OTP
- `0000` - Invalid OTP (for testing error states)

Check your backend configuration for test OTP settings.

---

## Performance Notes

### Token Storage
- **Secure Storage:** `expo-secure-store` (native)
- **Fallback:** In-memory (web/dev)
- Storage time: Immediate on sign-in

### API Response Times

| Endpoint | Typical Time |
|----------|-------------|
| POST /c56/auth/login | 2-3s (Google verification) |
| POST /c56/auth/send-phone-otp | 1-2s (MSG91 API) |
| POST /c56/auth/verify-phone | 1-2s (OTP verification) |
| POST /c56/auth/merge-phone-account | 2-3s (OTP + account merge) |

---

## Testing Checklist

- [ ] First-time Google sign-in works
- [ ] Returning user (same account) skips merge prompt
- [ ] Account linking by email works
- [ ] Account merge flow works
- [ ] Phone verification works
- [ ] OTP resend works
- [ ] Phone already taken shows 409 error
- [ ] Token refresh works
- [ ] Sign out clears credentials
- [ ] API calls include auth header
- [ ] Modals show proper error states
- [ ] Modals disable buttons during loading
- [ ] Secure storage persists tokens

---

## Next Steps

After successful testing:

1. **Integrate auth screens** into your app's router
2. **Add route guards** to protected screens using `useRequireAuth()`
3. **Initialize auth** in root layout with `useAuthInitialize()`
4. **Create user profile screen** using `useAuthStore()`
5. **Handle token refresh** on 401 responses
6. **Test on actual devices** (iOS/Android)

---

## Questions?

Refer to:
- `OAUTH_FLOW_SETUP.md` - Architecture and flow details
- `src/core/auth/` - Service implementations
- `src/components/modals/` - UI components
- Backend migration spec - API details
