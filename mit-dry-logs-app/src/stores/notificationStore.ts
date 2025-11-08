/**
 * Notification Store
 * Manages toast notifications and alerts
 */

import { create } from 'zustand';
import { Notification, NotificationType } from '../types';

interface NotificationState {
  notifications: Notification[];

  // Actions
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    duration?: number
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (type, title, message, duration = 5000) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      timestamp: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));
