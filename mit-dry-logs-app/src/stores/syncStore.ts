/**
 * Sync Store
 * Manages offline sync queue and network status
 */

import { create } from 'zustand';
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

  // Selectors
  getPendingItems: () => SyncQueueItem[];
  getFailedItems: () => SyncQueueItem[];
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: navigator.onLine,
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

  getPendingItems: () =>
    get().queue.filter((item) => item.status === 'pending'),

  getFailedItems: () =>
    get().queue.filter((item) => item.status === 'failed'),
}));
