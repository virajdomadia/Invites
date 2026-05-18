# EAS Build Setup

This project is now configured to use **EAS Build** - Expo's managed cloud build service for creating native Android and iOS apps.

## 🚀 Getting Started with EAS Build

### Prerequisites
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli` (already installed)
- Expo account (create at https://expo.dev)
- GitHub account (recommended for linking)

### Step 1: Login to EAS

```bash
eas login
```

This will open a browser to authenticate with your Expo account.

### Step 2: Initialize your project (if not already done)

```bash
eas project:create
```

Or if you've already created a project, you can link it:

```bash
eas project:info
```

### Step 3: Build for Android

#### Build for Internal Testing
```bash
eas build -p android --profile preview
```

This creates an APK that you can install directly on your Android device.

#### Build for Google Play Store (Production)
```bash
eas build -p android --profile production
```

This creates an AAB (Android App Bundle) for store submission.

### Step 4: Build for iOS

#### Build for Internal Testing
```bash
eas build -p ios --profile preview
```

#### Build for App Store (Production)
```bash
eas build -p ios --profile production
```

This requires:
- Apple Developer account ($99/year)
- Provisioning profiles and certificates (EAS can manage these)

## 📱 Installation Options

### From APK (Android - Development)
```bash
eas build -p android --profile preview
# Download and install: adb install invites.apk
```

### From App Store
- Android: Google Play Store
- iOS: Apple App Store

## ⚙️ Configuration Files

- `eas.json` - EAS build configurations
- `app.json` - App metadata and settings
- `package.json` - Dependencies

## 🔧 EAS Profiles

The project includes three build profiles:

1. **development** - For testing with development client
2. **preview** - For internal testing (APK/TestFlight)
3. **production** - For app store release

## 📊 Monitoring Builds

### View build status:
```bash
eas build:list
```

### View specific build details:
```bash
eas build:view <BUILD_ID>
```

### Download build logs:
```bash
eas build:log <BUILD_ID>
```

## 🔑 Credentials Management

EAS automatically manages:
- Android signing keys
- iOS certificates & provisioning profiles
- Code signing identities

To manage credentials manually:
```bash
eas credentials
```

## 📚 Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit (App Stores)](https://docs.expo.dev/submit/introduction/)
- [Android Build Guide](https://docs.expo.dev/build-reference/android-builds/)
- [iOS Build Guide](https://docs.expo.dev/build-reference/ios-builds/)

## 💡 Tips

1. Always use `eas build:list` to check build history
2. Keep your `eas.json` and `app.json` in version control
3. Test on preview/internal builds before production
4. Use `eas submit` to automatically submit to app stores
5. Monitor build times and optimize if needed

## ⚠️ Costs

- **Free tier**: Limited builds per month
- **Pro subscription**: Unlimited builds and priority queue
- See https://expo.dev/pricing for details
