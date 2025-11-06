/**
 * Firebase Authentication Service
 */

import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { User, UserRole, Zone } from '../../types';

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data() as User;

      // Update last login
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLogin: serverTimestamp(),
        'metadata.lastActivityAt': serverTimestamp(),
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
      await signOut(auth);
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        uid: firebaseUser.uid,
        email,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        zone: userData.zone,
        assignedJobs: [],
        createdAt: serverTimestamp() as any,
        lastLogin: serverTimestamp() as any,
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
          lastActivityAt: serverTimestamp() as any,
        },
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

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
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (!userDoc.exists()) {
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
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        'metadata.lastActivityAt': serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Update user profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },
};
