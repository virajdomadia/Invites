# Project Structure - Feature-Based Architecture

This project uses a **feature-based folder structure** for better scalability and maintainability.

## Directory Tree

```
src/
├── app/                          # Expo Router entry points
│   ├── _layout.tsx               # Root layout (navigation)
│   ├── index.tsx                 # Home route
│   ├── login.tsx                 # Login route
│   └── phone-verify.tsx          # Phone verification route
│
├── core/                         # Shared utilities and services
│   ├── api/
│   │   └── api.ts                # API client (HTTP requests)
│   ├── hooks/
│   │   └── useApi.ts             # Hook for API calls
│   ├── constants/
│   │   └── index.ts              # App constants (colors, spacing, etc.)
│   └── index.ts                  # Core module exports
│
├── features/                     # Feature modules
│   ├── auth/                     # Authentication feature
│   │   ├── components/
│   │   │   └── google-sign-in-button.tsx    # Google Sign-In button
│   │   ├── screens/
│   │   │   ├── login.tsx         # Login screen
│   │   │   └── phone-verify.tsx  # Phone verification screen
│   │   ├── services/
│   │   │   ├── google-auth.ts    # Google OAuth hook
│   │   │   └── auth-service.ts   # Auth state management
│   │   ├── hooks/
│   │   │   └── useAuth.ts        # Auth state hook
│   │   └── index.ts              # Auth feature exports
│   │
│   ├── home/                     # Home/Dashboard feature
│   │   ├── screens/
│   │   │   └── index.tsx         # Home screen
│   │   └── index.ts              # Home feature exports
│   │
│   └── index.ts                  # Features module exports
│
├── global.css                    # Global styles
├── _layout.tsx                   # Root layout (moved to app/)
└── types/                        # TypeScript types (if needed)
```

## Feature-Based Architecture

### Why Feature-Based?
- **Better organization**: Each feature is self-contained
- **Easier scaling**: Add new features without cluttering existing code
- **Clear dependencies**: Easy to see what each feature depends on
- **Team-friendly**: Multiple developers can work on different features
- **Easy refactoring**: Move features around without breaking imports

### Core Module
The `core/` folder contains shared utilities used across multiple features:
- **API Client**: For all HTTP requests
- **Common Hooks**: Reusable React hooks
- **Constants**: App-wide configuration

### Feature Structure
Each feature folder follows this pattern:
```
feature-name/
├── components/       # Reusable UI components
├── screens/         # Screen components (full pages)
├── services/        # Business logic and state management
├── hooks/           # Feature-specific hooks
├── types/           # TypeScript types (optional)
└── index.ts         # Feature exports
```

## Importing

### From same feature:
```typescript
// Inside auth feature
import { useAuth } from './hooks/useAuth';
import { authService } from './services/auth-service';
```

### From another feature:
```typescript
// From home feature to auth feature
import { useAuth } from '../auth/hooks/useAuth';
```

### From core:
```typescript
// Access shared utilities
import { apiClient } from '../../core/api/api';
import { COLORS, SPACING } from '../../core/constants';
```

## Feature Exports

Each feature has an `index.ts` that exports all public APIs:

```typescript
// src/features/auth/index.ts
export { authService } from './services/auth-service';
export { useAuth } from './hooks/useAuth';
export { GoogleSignInButton } from './components/google-sign-in-button';
export { default as LoginScreen } from './screens/login';
```

This allows cleaner imports:
```typescript
import { useAuth, authService, GoogleSignInButton } from '../features/auth';
```

## Routes

Routes are defined in `src/app/` using Expo Router:
- `/` → Home screen
- `/login` → Login screen
- `/phone-verify` → Phone verification screen

Each route file imports and re-exports the actual screen from the features folder.

## Adding a New Feature

1. Create a new folder in `src/features/`:
   ```
   src/features/my-feature/
   ├── components/
   ├── screens/
   ├── services/
   ├── hooks/
   └── index.ts
   ```

2. Create your components, services, and screens

3. Export everything in `index.ts`:
   ```typescript
   export { MyComponent } from './components/my-component';
   export { useMyHook } from './hooks/useMyHook';
   ```

4. Use it from other features:
   ```typescript
   import { MyComponent, useMyHook } from '../my-feature';
   ```

## Benefits of This Structure

✅ **Scalable**: Easy to add features without complexity  
✅ **Maintainable**: Clear separation of concerns  
✅ **Testable**: Each feature can be tested independently  
✅ **Reusable**: Components/hooks can be shared across features  
✅ **Clean**: No circular dependencies or confusion  
✅ **Collaborative**: Multiple developers can work on different features

## Next Steps

1. Add more features by creating new folders in `src/features/`
2. Use the core utilities for API calls and constants
3. Keep feature dependencies to a minimum
4. Use the `index.ts` files for clean exports
