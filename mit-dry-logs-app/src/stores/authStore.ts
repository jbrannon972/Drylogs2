/**
 * Authentication Store
 * Manages user authentication state, login/logout, and role-based access
 */

import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  firebaseUser: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean; // Prevent double initialization

  // Actions
  setUser: (user: User | null) => void;
  setFirebaseUser: (firebaseUser: any | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  initialized: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    }),

  setFirebaseUser: (firebaseUser) =>
    set({ firebaseUser }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error }),

  setInitialized: (initialized) =>
    set({ initialized }),

  logout: () =>
    set({
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      error: null,
    }),
}));
