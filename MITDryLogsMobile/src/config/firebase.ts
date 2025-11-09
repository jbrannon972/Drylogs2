/**
 * Firebase Configuration - React Native Version
 *
 * React Native Firebase uses native configuration files:
 * - iOS: GoogleService-Info.plist (in ios/ folder)
 * - Android: google-services.json (in android/app/ folder)
 *
 * No JavaScript initialization needed - the native SDKs handle everything.
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Export Firebase modules
// These are already initialized by the native SDK
export { auth, firestore, storage };

// For compatibility with existing code that expects 'db'
export const db = firestore();

// Enable offline persistence (optional, recommended for mobile)
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

console.log('🔥 React Native Firebase initialized');

export default { auth, firestore, storage };
