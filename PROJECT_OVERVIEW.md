# 🎯 Project Overview - Invites App

## Project Structure

```
invites/
│
├── 📁 src/                    [SOURCE CODE - 21 files]
│   ├── app/                   Routing with Route Groups (6 files)
│   │   ├── _layout.tsx
│   │   ├── (auth)/            Login & phone verification
│   │   └── (home)/            Home screen
│   │
│   ├── features/              Feature modules (10 files)
│   │   ├── auth/              Authentication feature
│   │   ├── home/              Home feature
│   │   └── index.ts
│   │
│   ├── core/                  Shared utilities (4 files)
│   │   ├── api/               HTTP client
│   │   ├── hooks/             Reusable hooks
│   │   └── constants/         App config
│   │
│   └── global.css
│
├── 📁 docs/                   [DOCUMENTATION - 19 files]
│   ├── INDEX.md               📚 Documentation index (START HERE!)
│   ├── README_START_HERE.md   Quick start guide
│   ├── FINAL_CLEAN_STRUCTURE.txt  Visual structure
│   ├── EXPO_ROUTER_GROUPS.md  Routing guide
│   ├── FEATURE_STRUCTURE_GUIDE.md  Feature patterns
│   ├── GOOGLE_AUTH_SETUP.md   OAuth setup
│   ├── AGENTS.md              Backend implementation
│   ├── EAS_BUILD_GUIDE.md     Build & deploy
│   ├── NATIVEWIND_GUIDE.md    Styling guide
│   └── [11 more guides...]
│
├── .env                       Environment variables
├── .env.example               Template
├── .gitignore
├── package.json               Dependencies
├── app.json                   Expo config
├── README.md                  Project readme
└── PROJECT_OVERVIEW.md        This file

```

---

## Quick Start

### 1. Start Development
```bash
npm install
npm start
```

### 2. Read Documentation
Start with: `docs/INDEX.md` or `docs/README_START_HERE.md`

### 3. Configure Google OAuth
Follow: `docs/GOOGLE_AUTH_SETUP.md`

### 4. Build Features
Follow pattern in: `docs/FEATURE_STRUCTURE_GUIDE.md`

---

## Key Features

✅ **Google OAuth Authentication**
- Sign in with Google
- Automatic account creation
- Secure token storage

✅ **Phone Verification**
- OTP-based verification
- Optional for new users
- Required for event hosting

✅ **Professional Architecture**
- Route Groups for organization
- Feature-based modules
- Shared core utilities
- Clean separation of concerns

✅ **Complete Documentation**
- 19 comprehensive guides
- Visual diagrams
- Code examples
- Setup instructions

---

## File Organization

### Source Code (`src/`)
```
src/
├── app/              Expo Router routes
├── features/         Feature modules
│   ├── auth/        Authentication
│   └── home/        Home/Dashboard
└── core/            Shared utilities
    ├── api/
    ├── hooks/
    └── constants/
```

### Documentation (`docs/`)
```
docs/
├── INDEX.md                           Main index
├── QUICK_START_GUIDES/
│   ├── README_START_HERE.md
│   ├── FINAL_CLEAN_STRUCTURE.txt
│   └── ...
├── ARCHITECTURE_GUIDES/
│   ├── EXPO_ROUTER_GROUPS.md
│   ├── FEATURE_STRUCTURE_GUIDE.md
│   └── ...
├── SETUP_GUIDES/
│   ├── GOOGLE_AUTH_SETUP.md
│   ├── EAS_BUILD_GUIDE.md
│   └── ...
└── REFERENCE/
    ├── PROJECT_STRUCTURE.md
    ├── AGENTS.md
    └── ...
```

---

## Technology Stack

### Frontend
- **Framework:** React Native 0.83.6
- **Routing:** Expo Router 55.0.14
- **Styling:** NativeWind (Tailwind CSS)
- **Authentication:** Google OAuth 2.0
- **State:** Custom AuthService with listeners
- **Storage:** expo-secure-store

### Build & Deploy
- **Build:** EAS Build
- **Development:** Expo Dev Client
- **Package Manager:** npm

### Backend Integration
- **API:** Custom FastAPI
- **Auth:** Google OAuth token verification
- **OTP:** MSG91 SMS service

---

## Architecture Highlights

### Route Groups Organization
```
app/
├── (auth)         ← Authentication routes
│   ├── login
│   └── phone-verify
└── (home)         ← Home routes
    └── /
```

### Feature Module Pattern
```
features/auth/
├── components/    ← Reusable UI
├── screens/       ← Smart screens
├── services/      ← Business logic
├── hooks/         ← React hooks
└── index.ts       ← Clean exports
```

### Core Utilities
```
core/
├── api/           ← HTTP client
├── hooks/         ← Shared hooks
└── constants/     ← App config
```

---

## Getting Started Checklist

### Setup (30 minutes)
- [ ] Read `docs/README_START_HERE.md`
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] See login screen

### Configuration (30 minutes)
- [ ] Follow `docs/GOOGLE_AUTH_SETUP.md`
- [ ] Get Google Client IDs
- [ ] Create `.env` file
- [ ] Start backend at localhost:8000

### Development (Ongoing)
- [ ] Read `docs/FEATURE_STRUCTURE_GUIDE.md`
- [ ] Build new features
- [ ] Follow the patterns
- [ ] Add screens, components, services

### Deployment (When ready)
- [ ] Follow `docs/EAS_BUILD_GUIDE.md`
- [ ] Configure EAS
- [ ] Build for iOS/Android
- [ ] Submit to app stores

---

## Documentation Guide

All documentation is in the `docs/` folder. Start with:

1. **`docs/INDEX.md`** - Complete documentation index
2. **`docs/README_START_HERE.md`** - Quick start guide
3. **`docs/FINAL_CLEAN_STRUCTURE.txt`** - Visual structure
4. **`docs/EXPO_ROUTER_GROUPS.md`** - Learn routing
5. **`docs/FEATURE_STRUCTURE_GUIDE.md`** - Learn features

Then keep these handy:
- **`docs/PROJECT_STRUCTURE.md`** - Detailed reference
- **`docs/GOOGLE_AUTH_SETUP.md`** - OAuth setup
- **`docs/VERIFICATION_CHECKLIST.md`** - Setup verification

---

## Key Concepts

### Route Groups
Folders with parentheses organize routes without affecting URLs:
```
(auth)/login.tsx  →  /login (NOT /(auth)/login)
```

### Features
Self-contained modules with all their logic:
```
features/auth/
├── components/  (Reusable UI)
├── screens/     (Smart UI)
├── services/    (Logic)
└── hooks/       (State)
```

### Core
Shared utilities used by all features:
```
core/
├── api/         (HTTP client)
├── hooks/       (Reusable hooks)
└── constants/   (App config)
```

---

## Development Commands

### Run the App
```bash
npm start              # Start Expo dev server
npm start -- -w       # Web
npm start -- -a       # Android
npm start -- -i       # iOS
```

### Lint & Format
```bash
npm run lint          # Run ESLint
```

### Clean Cache
```bash
npm start -- --reset-cache
```

---

## Project Stats

| Metric | Count |
|--------|-------|
| **Source files** | 21 files |
| **Documentation** | 19 files |
| **Features** | 2 (auth, home) |
| **Routes** | 3 main routes |
| **Components** | 1 reusable |
| **Services** | 2 feature services |
| **Hooks** | 2 hooks |
| **Core utilities** | 3 modules |

---

## Environment Setup

### `.env` File
```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=...
```

See `docs/GOOGLE_AUTH_SETUP.md` for complete setup.

---

## Backend Requirements

The backend (localhost:8000) needs:
- `POST /auth/login` - Google OAuth login
- `POST /auth/refresh` - Token refresh
- `POST /auth/send-phone-otp` - Send OTP
- `POST /auth/verify-phone` - Verify OTP

See `docs/AGENTS.md` for implementation details.

---

## Resources

### Official Documentation
- [Expo Docs](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/routing/introduction/)
- [React Native](https://reactnative.dev/)

### Project Documentation
- All guides in `docs/` folder
- Start with `docs/INDEX.md`

---

## Status

✅ **Setup:** Complete  
✅ **Architecture:** Optimized  
✅ **Documentation:** Comprehensive  
✅ **Ready:** Yes!

---

## Next Steps

1. ✅ Read `docs/README_START_HERE.md`
2. ✅ Read `docs/FINAL_CLEAN_STRUCTURE.txt`
3. ✅ Run `npm start`
4. ✅ Follow `docs/GOOGLE_AUTH_SETUP.md`
5. ✅ Start building!

---

**Happy Building! 🚀**

*For questions, see the documentation in the `docs/` folder.*
