/**
 * useAuth Hook
 * Manages authentication state and provides auth methods
 */

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { authService } from '../services/firebase/authService';

export function useAuth() {
  const {
    user,
    firebaseUser,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setFirebaseUser,
    setLoading,
    setError,
    logout: logoutStore,
  } = useAuthStore();

  const { addNotification } = useNotificationStore();

  // Listen to auth state changes
  useEffect(() => {
    console.log('🔐 useAuth: Initializing auth listener');
    setLoading(true);

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.error('⏱️ AUTH TIMEOUT: Firebase did not respond within 10 seconds');
      console.error('This usually means:');
      console.error('1. Environment variables are not set');
      console.error('2. Firebase configuration is incorrect');
      console.error('3. Network/firewall blocking Firebase');
      setLoading(false);
      setError('Authentication timeout - please refresh the page');
    }, 10000); // 10 second timeout

    try {
      console.log('🔐 useAuth: Setting up Firebase auth state listener');
      const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
        console.log('🔐 useAuth: Auth state changed:', firebaseUser ? 'User signed in' : 'No user');
        clearTimeout(timeout); // Clear timeout once auth state changes
        setFirebaseUser(firebaseUser);

        if (firebaseUser) {
          // User is signed in, get user data
          try {
            const userData = await authService.getCurrentUser(firebaseUser.uid);
            if (userData) {
              setUser(userData);
            } else {
              console.error('User data not found in database');
              setError('User profile not found');
              await authService.signOut();
            }
          } catch (error: any) {
            console.error('Error fetching user data:', error);
            setError(error.message);
          }
        } else {
          // User is signed out
          setUser(null);
        }

        setLoading(false);
      });

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error: any) {
      console.error('Firebase auth initialization error:', error);
      clearTimeout(timeout);
      setLoading(false);
      setError('Failed to initialize authentication');
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.signIn(email, password);
      setUser(user);
      addNotification('success', 'Welcome!', `Signed in as ${user.displayName}`);
    } catch (error: any) {
      setError(error.message);
      addNotification('error', 'Sign In Failed', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      logoutStore();
      addNotification('info', 'Signed Out', 'You have been signed out');
    } catch (error: any) {
      setError(error.message);
      addNotification('error', 'Sign Out Failed', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return;

    try {
      await authService.updateUserProfile(user.uid, updates);
      setUser({ ...user, ...updates });
      addNotification('success', 'Profile Updated', 'Your profile has been updated');
    } catch (error: any) {
      addNotification('error', 'Update Failed', error.message);
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    updateProfile,
  };
}
