/**
 * useOfflineSync Hook
 * Manages offline functionality and sync queue
 */

import { useEffect } from 'react';
import { useSyncStore } from '../stores/syncStore';
import { useNotificationStore } from '../stores/notificationStore';

export function useOfflineSync() {
  const {
    isOnline,
    isSyncing,
    queue,
    setOnline,
    setSyncing,
    addToQueue,
    updateQueueItem,
    removeFromQueue,
    clearQueue,
    setLastSyncTime,
    getPendingItems,
    getFailedItems,
  } = useSyncStore();

  const { addNotification } = useNotificationStore();

  // Listen to online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      addNotification('success', 'Back Online', 'Connection restored. Syncing...');
      syncPendingChanges();
    };

    const handleOffline = () => {
      setOnline(false);
      addNotification('offline-mode', 'Offline Mode', 'Changes will sync when online', 0);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial state
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingChanges = async () => {
    const pendingItems = getPendingItems();

    if (pendingItems.length === 0) return;

    setSyncing(true);

    for (const item of pendingItems) {
      try {
        updateQueueItem(item.id, { status: 'syncing' });

        // TODO: Implement actual Firebase sync based on operation type
        // For now, simulate sync
        await new Promise((resolve) => setTimeout(resolve, 500));

        updateQueueItem(item.id, { status: 'completed' });
        removeFromQueue(item.id);
      } catch (error: any) {
        console.error('Sync error:', error);
        updateQueueItem(item.id, {
          status: 'failed',
          error: error.message,
          retryCount: item.retryCount + 1,
        });

        if (item.retryCount >= 3) {
          addNotification('error', 'Sync Failed', `Failed to sync after 3 attempts`);
        }
      }
    }

    setSyncing(false);
    setLastSyncTime(Date.now());

    const failedItems = getFailedItems();
    if (failedItems.length === 0) {
      addNotification('success', 'Sync Complete', 'All changes synced successfully');
    }
  };

  return {
    isOnline,
    isSyncing,
    queue,
    pendingCount: getPendingItems().length,
    failedCount: getFailedItems().length,
    addToQueue,
    syncNow: syncPendingChanges,
    clearQueue,
  };
}
