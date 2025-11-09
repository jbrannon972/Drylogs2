/**
 * Firebase Authentication Service - React Native Version
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User, UserRole, Zone } from '../../types';

// Type alias for compatibility
type FirebaseUser = FirebaseAuthTypes.User;

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .get();

      if (!userDoc.exists) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data() as User;

      // Update last login
      await firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .update({
          lastLogin: firestore.FieldValue.serverTimestamp(),
          'metadata.lastActivityAt': firestore.FieldValue.serverTimestamp(),
        });

      return userData;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  /**
   * Create new user account (Admin only)
   */
  async createUser(
    email: string,
    password: string,
    userData: {
      displayName: string;
      phoneNumber: string;
      role: UserRole;
      zone: Zone;
    }
  ): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        uid: firebaseUser.uid,
        email,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        zone: userData.zone,
        assignedJobs: [],
        createdAt: firestore.FieldValue.serverTimestamp() as any,
        lastLogin: firestore.FieldValue.serverTimestamp() as any,
        isActive: true,
        preferences: {
          notifications: true,
          darkMode: false,
          preferredTimeZone: 'America/New_York',
          language: 'en',
        },
        qualifications: {
          iicrcCertified: false,
          trainingLevel: 'junior',
        },
        metadata: {
          totalJobsCompleted: 0,
          totalEquipmentScans: 0,
          accuracyScore: 100,
          lastActivityAt: firestore.FieldValue.serverTimestamp() as any,
        },
      };

      await firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .set(newUser);

      return newUser;
    } catch (error: any) {
      console.error('Create user error:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  },

  /**
   * Get current user data
   */
  async getCurrentUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(uid)
        .get();

      if (!userDoc.exists) {
        return null;
      }

      return userDoc.data() as User;
    } catch (error: any) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (firebaseUser: FirebaseUser | null) => void) {
    return auth().onAuthStateChanged(callback);
  },

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .update({
          ...updates,
          'metadata.lastActivityAt': firestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      console.error('Update user profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },
};
