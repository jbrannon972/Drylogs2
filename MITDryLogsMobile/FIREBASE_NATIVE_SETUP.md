# Firebase Native Configuration Setup

## Overview

This app now uses **React Native Firebase** instead of the web Firebase SDK. This requires native configuration files for iOS and Android.

## Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com)
- Firestore, Authentication, and Storage enabled
- iOS app registered in Firebase Console
- Android app registered in Firebase Console (optional, for future Android support)

---

## iOS Configuration

### 1. Download GoogleService-Info.plist

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon → Project Settings
4. Scroll to "Your apps" section
5. Click on your iOS app (bundle ID: `com.entrusted.mitdrylogs`)
6. Click "Download GoogleService-Info.plist"

### 2. Add to Expo Project

**For Expo with EAS Build:**

1. Create `ios/` directory in project root if it doesn't exist:
   ```bash
   mkdir -p MITDryLogsMobile/ios
   ```

2. Place `GoogleService-Info.plist` in `MITDryLogsMobile/ios/`:
   ```
   MITDryLogsMobile/
   ├── ios/
   │   └── GoogleService-Info.plist
   ├── src/
   ├── app.json
   └── package.json
   ```

3. Update `app.json` to reference the config file:
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.entrusted.mitdrylogs",
         "googleServicesFile": "./ios/GoogleService-Info.plist"
       }
     }
   }
   ```

**For Bare React Native (if you eject):**

1. Open Xcode workspace: `ios/MITDryLogsMobile.xcworkspace`
2. Right-click on project → Add Files to "MITDryLogsMobile"
3. Select `GoogleService-Info.plist`
4. Ensure "Copy items if needed" is checked
5. Ensure target is checked

### 3. Verify Installation

The `GoogleService-Info.plist` should contain:
- `GOOGLE_APP_ID`
- `GCM_SENDER_ID`
- `PROJECT_ID`
- `STORAGE_BUCKET`
- `API_KEY`
- `BUNDLE_ID` (must match `com.entrusted.mitdrylogs`)

---

## Android Configuration (Future)

### 1. Download google-services.json

1. Go to Firebase Console → Project Settings
2. Click on your Android app (package: `com.entrusted.mitdrylogs`)
3. Click "Download google-services.json"

### 2. Add to Expo Project

**For Expo with EAS Build:**

1. Create `android/` directory:
   ```bash
   mkdir -p MITDryLogsMobile/android
   ```

2. Place `google-services.json` in `MITDryLogsMobile/android/`:
   ```
   MITDryLogsMobile/
   ├── android/
   │   └── google-services.json
   ├── ios/
   │   └── GoogleService-Info.plist
   └── ...
   ```

3. Update `app.json`:
   ```json
   {
     "expo": {
       "android": {
         "package": "com.entrusted.mitdrylogs",
         "googleServicesFile": "./android/google-services.json"
       }
     }
   }
   ```

---

## Building with Native Firebase

### Development Build (Required)

**You CANNOT use Expo Go with React Native Firebase.** You must create a custom development build.

### Using EAS Build

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Configure EAS:
   ```bash
   eas build:configure
   ```

4. Build for iOS Simulator (development):
   ```bash
   eas build --profile development --platform ios
   ```

5. Build for iOS Device (development):
   ```bash
   eas build --profile development --platform ios --local
   ```

6. Download and install the `.app` or `.ipa` file

7. Run development server:
   ```bash
   npx expo start --dev-client
   ```

### Using Local Build (Expo Prebuild)

1. Generate native projects:
   ```bash
   npx expo prebuild
   ```

2. Install pods (iOS):
   ```bash
   cd ios && pod install && cd ..
   ```

3. Build with Xcode:
   - Open `ios/MITDryLogsMobile.xcworkspace`
   - Select simulator/device
   - Press Cmd+R to build and run

4. Or use command line:
   ```bash
   npx expo run:ios
   ```

---

## Firebase Security Rules

### Firestore Rules

Ensure your Firestore has proper security rules. Example for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Jobs - technicians can read assigned jobs
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Photos - authenticated users can upload
    match /photos/{photoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules

Ensure Firebase Storage has proper security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{jobId}/{roomId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Testing Firebase Connection

### 1. Check Console Logs

When app starts, you should see:
```
🛡️ Platform guards enabled - web APIs blocked
📱 Firebase initialized for React Native
```

### 2. Test Authentication

```typescript
import auth from '@react-native-firebase/auth';

// Test sign in
const userCredential = await auth().signInWithEmailAndPassword(
  'test@example.com',
  'password123'
);
console.log('Signed in:', userCredential.user.uid);
```

### 3. Test Firestore

```typescript
import firestore from '@react-native-firebase/firestore';

// Test read
const snapshot = await firestore().collection('jobs').limit(1).get();
console.log('Jobs found:', snapshot.size);
```

### 4. Test Storage

```typescript
import storage from '@react-native-firebase/storage';

// Test upload
const uri = 'file://path/to/image.jpg';
const ref = storage().ref('test/image.jpg');
await ref.putFile(uri);
console.log('Upload successful');
```

---

## Troubleshooting

### Error: "Default app has not been initialized"

**Solution**: Ensure `GoogleService-Info.plist` is correctly added to the project.

### Error: "No bundle URL present"

**Solution**: You're trying to use Expo Go. Build a custom development client instead.

### Error: "Module not found: @react-native-firebase/app"

**Solution**: Install native dependencies:
```bash
cd MITDryLogsMobile
npm install
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios
```

### Error: "Auth requires iOS 13.0 or higher"

**Solution**: Update `ios/Podfile` deployment target:
```ruby
platform :ios, '13.0'
```

### Build fails with "GoogleService-Info.plist not found"

**Solution**: Verify file is in correct location:
- For Expo: `MITDryLogsMobile/ios/GoogleService-Info.plist`
- For bare React Native: `ios/MITDryLogsMobile/GoogleService-Info.plist`
- Check `app.json` has `googleServicesFile` path set

---

## Migration Summary

### What Changed

| Web Firebase | React Native Firebase |
|--------------|----------------------|
| `firebase` package | `@react-native-firebase/app`, `auth`, `firestore`, `storage` |
| `signInWithEmailAndPassword(auth, email, pass)` | `auth().signInWithEmailAndPassword(email, pass)` |
| `getDoc(doc(db, 'users', uid))` | `firestore().collection('users').doc(uid).get()` |
| `uploadBytes(ref, blob)` | `ref.putFile(uri)` |
| `serverTimestamp()` | `firestore.FieldValue.serverTimestamp()` |
| Web config object | Native config files (plist/json) |

### Files Updated

1. ✅ `src/config/firebase.ts` - Rewritten for React Native
2. ✅ `src/services/firebase/authService.ts` - Native Firebase Auth
3. ✅ `src/services/firebase/jobsService.ts` - Native Firestore API
4. ✅ `src/services/firebase/photoService.ts` - Native Storage API (URIs)
5. ✅ `src/services/firebase/photosService.ts` - Native Firestore API
6. ✅ `src/utils/dateUtils.ts` - React Native Timestamp
7. ✅ `src/types/index.ts` - Removed Blob/File, updated Timestamp
8. ✅ `package.json` - Removed web `firebase` package

---

## Next Steps

1. Add `GoogleService-Info.plist` to `ios/` directory
2. Update `app.json` with `googleServicesFile` path
3. Build custom development client with EAS or expo prebuild
4. Test authentication, Firestore, and Storage
5. Deploy security rules to Firebase Console
6. Test on real iOS device

---

## Resources

- [React Native Firebase Docs](https://rnfirebase.io/)
- [Expo with React Native Firebase](https://docs.expo.dev/guides/using-firebase/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [Firebase Console](https://console.firebase.google.com)
