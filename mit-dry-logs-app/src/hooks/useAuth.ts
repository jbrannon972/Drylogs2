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
    setLoading(true);

    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // User is signed in, get user data
        try {
          const userData = await authService.getCurrentUser(firebaseUser.uid);
          setUser(userData);
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          setError(error.message);
          addNotification('error', 'Error', 'Failed to load user data');
        }
      } else {
        // User is signed out
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
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
