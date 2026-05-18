# Feature-Based Architecture Guide

## Visual Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT STRUCTURE                        │
└─────────────────────────────────────────────────────────────┘

src/
│
├── 🔄 app/
│   ├── _layout.tsx          ← Root navigation router
│   ├── index.tsx            ← Routes to Home feature
│   ├── login.tsx            ← Routes to Auth/Login feature
│   └── phone-verify.tsx     ← Routes to Auth/PhoneVerify feature
│
├── 🔧 core/                 ← SHARED UTILITIES
│   ├── api/
│   │   └── api.ts           ← HTTP client (used by all features)
│   ├── hooks/
│   │   └── useApi.ts        ← API hook (used by all features)
│   ├── constants/
│   │   └── index.ts         ← App-wide constants
│   └── index.ts             ← Core exports
│
├── ✨ features/             ← FEATURE MODULES
│   │
│   ├── auth/                ← AUTHENTICATION FEATURE
│   │   ├── components/
│   │   │   └── google-sign-in-button.tsx
│   │   ├── screens/
│   │   │   ├── login.tsx
│   │   │   └── phone-verify.tsx
│   │   ├── services/
│   │   │   ├── google-auth.ts       (Google OAuth logic)
│   │   │   └── auth-service.ts      (Auth state management)
│   │   ├── hooks/
│   │   │   └── useAuth.ts           (Auth state hook)
│   │   └── index.ts                 (Auth exports)
│   │
│   ├── home/                ← HOME/DASHBOARD FEATURE
│   │   ├── screens/
│   │   │   └── index.tsx            (Home screen)
│   │   └── index.ts                 (Home exports)
│   │
│   └── index.ts             ← Features exports
│
└── 📄 global.css            ← Global styles
```

## Data Flow

```
┌──────────────────────────────────────────────────────────┐
│           USER INTERACTION (UI Component)                │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│      features/auth/screens/login.tsx                     │
│      └─ Uses GoogleSignInButton component                │
│      └─ Calls authService.loginWithGoogle()              │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│      features/auth/services/auth-service.ts              │
│      └─ Manages auth state                               │
│      └─ Calls apiClient.post() for backend               │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│      core/api/api.ts                                     │
│      └─ Makes HTTP request to backend                    │
│      └─ Returns response                                 │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│           BACKEND API (localhost:8000)                   │
│           └─ POST /auth/login                            │
│           └─ Returns access_token, refresh_token         │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│      core/api/api.ts (receives response)                 │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│      features/auth/services/auth-service.ts              │
│      └─ Saves tokens to secure storage                   │
│      └─ Updates auth state                               │
│      └─ Notifies listeners                               │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│      features/auth/hooks/useAuth.ts                      │
│      └─ Receives state update                            │
│      └─ Updates component state                          │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│      Component re-renders with new state                 │
│      └─ User is logged in                                │
│      └─ Router navigates to home screen                  │
└──────────────────────────────────────────────────────────┘
```

## Feature Anatomy

Every feature has the same structure:

```
feature-name/
│
├── components/              ← Reusable UI components
│   ├── component1.tsx
│   └── component2.tsx
│
├── screens/                 ← Full screen components
│   ├── screen1.tsx
│   └── screen2.tsx
│
├── services/                ← Business logic
│   ├── service1.ts          (State management, API calls, etc.)
│   └── service2.ts
│
├── hooks/                   ← React hooks (optional)
│   ├── useHook1.ts
│   └── useHook2.ts
│
├── types/                   ← TypeScript types (optional)
│   └── index.ts
│
└── index.ts                 ← Feature exports
    ├── export services
    ├── export hooks
    ├── export components
    └── export screens
```

## Import Patterns

### From same feature:
```typescript
// In src/features/auth/screens/login.tsx
import { GoogleSignInButton } from '../components/google-sign-in-button';
import { authService } from '../services/auth-service';
```

### From different feature:
```typescript
// In src/features/home/screens/index.tsx
import { useAuth } from '../../auth/hooks/useAuth';
```

### From core:
```typescript
// Any feature
import { apiClient } from '../../../core/api/api';
import { COLORS, SPACING } from '../../../core/constants';
```

### Using index files (cleaner):
```typescript
// In src/features/auth/index.ts, export everything
export { useAuth } from './hooks/useAuth';

// In other files
import { useAuth } from '../../features/auth';
```

## Feature Dependencies Graph

```
┌─────────────┐
│   HOME      │
│ (Dashboard) │
└──────┬──────┘
       │
       │ depends on
       ▼
┌──────────────────┐      ┌──────────────────┐
│      AUTH        │ ───→ │      CORE        │
│ (Login, Signup)  │      │ (API, Constants) │
└──────────────────┘      └──────────────────┘
```

**Rules:**
- ✅ Features can depend on CORE
- ✅ Features can depend on OTHER FEATURES
- ❌ CORE should NEVER depend on features
- ❌ Avoid circular dependencies (A → B → A)

## When to Create a New Feature

Create a new feature folder when you have:
- ✅ Multiple related screens/pages
- ✅ Business logic (services)
- ✅ Reusable components
- ✅ Feature-specific hooks

Example new feature:

```
features/
├── auth/
├── home/
├── events/          ← NEW: Event management
│   ├── screens/
│   │   ├── list.tsx
│   │   ├── detail.tsx
│   │   └── create.tsx
│   ├── services/
│   │   ├── event-service.ts
│   │   └── event-api.ts
│   ├── components/
│   │   ├── event-card.tsx
│   │   └── event-form.tsx
│   ├── hooks/
│   │   └── useEvents.ts
│   └── index.ts
└── ...
```

## Benefits of This Architecture

| Benefit | Explanation |
|---------|-------------|
| **Scalability** | Easy to add new features without touching existing code |
| **Maintainability** | Each feature is self-contained and easy to understand |
| **Testability** | Features can be tested independently |
| **Reusability** | Components and hooks can be shared across features |
| **Clarity** | Clear separation of concerns and dependencies |
| **Collaboration** | Multiple developers can work on different features |
| **Refactoring** | Easier to refactor features without breaking the whole app |

## Next Steps

1. ✅ Understand the structure (you've done this!)
2. ⬜ Start using the new structure for new features
3. ⬜ Delete old files (see CLEANUP_GUIDE.md)
4. ⬜ Add more features as needed
5. ⬜ Keep the core folder focused on shared utilities

Happy coding! 🚀
