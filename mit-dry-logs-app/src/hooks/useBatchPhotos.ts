/**
 * Batch Photo Upload Hook
 * Queue photos and upload them in the background while user works
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePhotoQueueStore } from '../stores/photoQueueStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuth } from './useAuth';
import { photoService } from '../services/firebase/photoService';
import { PhotoStep } from '../types';

export function useBatchPhotos() {
  const { user } = useAuth();
  const { addNotification } = useNotificationStore();
  const {
    queue,
    uploadProgress,
    isUploading,
    addToQueue,
    removeFromQueue,
    clearQueue,
    updateProgress,
    setUploading,
    getQueueCount,
    getPendingCount,
  } = usePhotoQueueStore();

  const [currentJobContext, setCurrentJobContext] = useState<{
    jobId: string;
    roomName: string;
  } | null>(null);

  const uploadingRef = useRef(false);
  const uploadQueueRef = useRef<string[]>([]);

  /**
   * Background upload processor - automatically uploads queued photos
   */
  useEffect(() => {
    const processQueue = async () => {
      // Skip if already uploading or no queue
      if (uploadingRef.current || queue.length === 0) return;

      // Find pending photos
      const pendingPhotos = queue.filter(
        (photo) =>
          !uploadProgress[photo.id] ||
          uploadProgress[photo.id].status === 'pending'
      );

      if (pendingPhotos.length === 0) return;

      uploadingRef.current = true;
      setUploading(true);

      // Upload photos one at a time in background
      for (const photo of pendingPhotos) {
        try {
          updateProgress(photo.id, { status: 'uploading', progress: 0 });

          await photoService.uploadPhotoWithProgress(
            photo.file,
            photo.jobId,
            photo.roomId,
            photo.step,
            photo.userId,
            photo.userName,
            (progress) => {
              updateProgress(photo.id, {
                progress: progress.progress,
                status: 'uploading',
              });
            }
          );

          updateProgress(photo.id, { status: 'completed', progress: 100 });

          // Remove after successful upload
          setTimeout(() => removeFromQueue(photo.id), 1000);
        } catch (error: any) {
          console.error('Background upload error:', error);
          updateProgress(photo.id, {
            status: 'failed',
            error: error.message,
          });
        }
      }

      uploadingRef.current = false;
      setUploading(false);
    };

    // Process queue when it changes
    const timer = setTimeout(processQueue, 500);
    return () => clearTimeout(timer);
  }, [queue, uploadProgress, updateProgress, removeFromQueue, setUploading]);

  /**
   * Add photo to queue and start background upload
   */
  const queuePhoto = useCallback(
    async (
      file: File,
      jobId: string,
      roomId: string,
      roomName: string,
      step: PhotoStep
    ) => {
      if (!user) {
        addNotification('error', 'Error', 'You must be logged in to upload photos');
        return;
      }

      try {
        // Create preview
        const preview = await createPreview(file);

        // Compress if needed
        let fileToQueue = file;
        if (file.size > 1024 * 1024) {
          const compressed = await photoService.compressImage(file);
          fileToQueue = new File([compressed], file.name, { type: 'image/jpeg' });
        }

        // Add to queue (background upload will start automatically)
        addToQueue({
          file: fileToQueue,
          jobId,
          roomId,
          roomName,
          step,
          userId: user.uid,
          userName: user.displayName || 'Unknown User',
          preview,
        });

        // Set context for batch operations
        setCurrentJobContext({ jobId, roomName });

        // Show subtle confirmation - photo will upload in background
        // No intrusive notification needed
      } catch (error: any) {
        console.error('Error queueing photo:', error);
        addNotification('error', 'Error', 'Failed to queue photo');
      }
    },
    [user, addToQueue, addNotification]
  );

  /**
   * Upload all queued photos
   */
  const uploadAll = useCallback(async () => {
    const photosToUpload = [...queue];
    if (photosToUpload.length === 0) {
      addNotification('info', 'No Photos', 'No photos to upload');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    addNotification('info', '⬆️ Uploading', `Uploading ${photosToUpload.length} photos...`);

    for (const photo of photosToUpload) {
      try {
        updateProgress(photo.id, { status: 'uploading', progress: 0 });

        await photoService.uploadPhotoWithProgress(
          photo.file,
          photo.jobId,
          photo.roomId,
          photo.step,
          photo.userId,
          photo.userName,
          (progress) => {
            updateProgress(photo.id, {
              progress: progress.progress,
              status: 'uploading',
            });
          }
        );

        updateProgress(photo.id, { status: 'completed', progress: 100 });
        removeFromQueue(photo.id);
        successCount++;
      } catch (error: any) {
        console.error('Error uploading photo:', error);
        updateProgress(photo.id, {
          status: 'failed',
          error: error.message,
        });
        failCount++;
      }
    }

    setUploading(false);

    // Show result
    if (failCount === 0) {
      addNotification('success', '✅ Upload Complete', `${successCount} photos uploaded successfully`);
      clearQueue();
    } else if (successCount > 0) {
      addNotification('warning', '⚠️ Partial Upload', `${successCount} uploaded, ${failCount} failed`);
    } else {
      addNotification('error', '❌ Upload Failed', `Failed to upload ${failCount} photos`);
    }
  }, [queue, addNotification, setUploading, updateProgress, removeFromQueue, clearQueue]);

  /**
   * Clear failed uploads
   */
  const clearFailed = useCallback(() => {
    const failedIds = Object.entries(uploadProgress)
      .filter(([_, progress]) => progress.status === 'failed')
      .map(([id]) => id);

    failedIds.forEach((id) => removeFromQueue(id));
  }, [uploadProgress, removeFromQueue]);

  return {
    // Queue state
    queue,
    uploadProgress,
    isUploading,
    queueCount: getQueueCount(),
    pendingCount: getPendingCount(),

    // Actions
    queuePhoto,
    uploadAll,
    clearQueue,
    clearFailed,
    removeFromQueue,

    // Context
    currentJobContext,
  };
}

/**
 * Create image preview data URL
 */
function createPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
