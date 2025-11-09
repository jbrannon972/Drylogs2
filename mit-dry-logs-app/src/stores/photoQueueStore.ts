/**
 * Photo Queue Store
 * Manages queued photos for batch upload
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PhotoStep } from '../types';

export interface QueuedPhoto {
  id: string;
  file: File;
  jobId: string;
  roomId: string;
  roomName: string;
  step: PhotoStep;
  userId: string;
  userName: string;
  timestamp: number;
  preview: string; // Data URL for preview
}

export interface UploadProgress {
  photoId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface PhotoQueueState {
  queue: QueuedPhoto[];
  uploadProgress: Record<string, UploadProgress>;
  isUploading: boolean;

  // Actions
  addToQueue: (photo: Omit<QueuedPhoto, 'id' | 'timestamp'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  updateProgress: (photoId: string, progress: Partial<UploadProgress>) => void;
  setUploading: (uploading: boolean) => void;
  getQueueCount: () => number;
  getPendingCount: () => number;
}

export const usePhotoQueueStore = create<PhotoQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      uploadProgress: {},
      isUploading: false,

      addToQueue: (photo) => {
        const id = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const queuedPhoto: QueuedPhoto = {
          ...photo,
          id,
          timestamp: Date.now(),
        };

        set((state) => ({
          queue: [...state.queue, queuedPhoto],
          uploadProgress: {
            ...state.uploadProgress,
            [id]: { photoId: id, progress: 0, status: 'pending' },
          },
        }));
      },

      removeFromQueue: (id) => {
        set((state) => {
          const newProgress = { ...state.uploadProgress };
          delete newProgress[id];

          return {
            queue: state.queue.filter((p) => p.id !== id),
            uploadProgress: newProgress,
          };
        });
      },

      clearQueue: () => {
        set({ queue: [], uploadProgress: {}, isUploading: false });
      },

      updateProgress: (photoId, progress) => {
        set((state) => ({
          uploadProgress: {
            ...state.uploadProgress,
            [photoId]: {
              ...state.uploadProgress[photoId],
              ...progress,
            },
          },
        }));
      },

      setUploading: (uploading) => {
        set({ isUploading: uploading });
      },

      getQueueCount: () => get().queue.length,

      getPendingCount: () => {
        const { uploadProgress } = get();
        return Object.values(uploadProgress).filter(
          (p) => p.status === 'pending' || p.status === 'uploading'
        ).length;
      },
    }),
    {
      name: 'photo-queue',
      // Don't persist files and previews (they're large)
      partialize: (state) => ({
        ...state,
        queue: state.queue.map((photo) => ({
          ...photo,
          file: undefined,
          preview: undefined,
        })),
      }),
    }
  )
);
