/**
 * Sync Store
 * Manages offline sync queue and network status
 *
 * REACT NATIVE VERSION - Uses NetInfo instead of navigator.onLine
 */

import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import { SyncQueueItem, SyncStatus } from '../types';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  queue: SyncQueueItem[];
  lastSyncTime: number | null;

  // Actions
  setOnline: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  addToQueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status' | 'retryCount'>) => void;
  updateQueueItem: (id: string, updates: Partial<SyncQueueItem>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  setLastSyncTime: (time: number) => void;
  initializeNetworkListener: () => () => void;

  // Selectors
  getPendingItems: () => SyncQueueItem[];
  getFailedItems: () => SyncQueueItem[];
}

export const useSyncStore = create<SyncState>((set, get) => ({
  // Default to true, will be updated by NetInfo listener
  isOnline: true,
  isSyncing: false,
  queue: [],
  lastSyncTime: null,

  setOnline: (isOnline) => set({ isOnline }),

  setSyncing: (isSyncing) => set({ isSyncing }),

  addToQueue: (item) =>
    set((state) => ({
      queue: [
        ...state.queue,
        {
          ...item,
          id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          status: 'pending' as SyncStatus,
          retryCount: 0,
        },
      ],
    })),

  updateQueueItem: (id, updates) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),

  clearQueue: () => set({ queue: [] }),

  setLastSyncTime: (time) => set({ lastSyncTime: time }),

  // Initialize network listener - call this when app starts
  initializeNetworkListener: () => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? true;
      set({ isOnline: isConnected });

      // Log network changes for debugging
      console.log('📡 Network status:', isConnected ? 'Online' : 'Offline');

      // Auto-sync when coming back online
      if (isConnected && get().queue.length > 0) {
        console.log('🔄 Network restored, pending sync items:', get().queue.length);
      }
    });

    // Fetch initial network state
    NetInfo.fetch().then(state => {
      const isConnected = state.isConnected ?? true;
      set({ isOnline: isConnected });
      console.log('📡 Initial network status:', isConnected ? 'Online' : 'Offline');
    });

    return unsubscribe;
  },

  getPendingItems: () =>
    get().queue.filter((item) => item.status === 'pending'),

  getFailedItems: () =>
    get().queue.filter((item) => item.status === 'failed'),
}));
