/**
 * usePhotos Hook
 * Manages photo uploads and storage
 */

import { useState } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { useSyncStore } from '../stores/syncStore';
import { photoService, PhotoUploadProgress } from '../services/firebase/photoService';
import { PhotoStep } from '../types';

export function usePhotos() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<PhotoUploadProgress | null>(null);
  const { addNotification } = useNotificationStore();
  const { isOnline } = useSyncStore();

  const uploadPhoto = async (
    file: Blob | File,
    jobId: string,
    roomId: string,
    step: PhotoStep,
    userId: string
  ): Promise<string | null> => {
    if (!isOnline) {
      addNotification('warning', 'Offline Mode', 'Photo uploads require internet connection');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(null);

      // Compress image if it's a File
      let fileToUpload = file;
      if (file instanceof File && file.size > 1024 * 1024) {
        // Compress if > 1MB
        addNotification('info', 'Compressing...', 'Optimizing image for upload');
        fileToUpload = await photoService.compressImage(file);
      }

      // Upload with progress
      const photoUrl = await photoService.uploadPhotoWithProgress(
        fileToUpload,
        jobId,
        roomId,
        step,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      addNotification('success', 'Photo Uploaded', 'Photo saved successfully');
      return photoUrl;
    } catch (error: any) {
      console.error('Photo upload error:', error);
      addNotification('error', 'Upload Failed', error.message);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const captureAndUpload = async (
    jobId: string,
    roomId: string,
    step: PhotoStep,
    userId: string
  ): Promise<string | null> => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop camera
      stream.getTracks().forEach((track) => track.stop());

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to capture photo'));
        }, 'image/jpeg', 0.9);
      });

      // Upload
      return await uploadPhoto(blob, jobId, roomId, step, userId);
    } catch (error: any) {
      console.error('Camera capture error:', error);
      addNotification('error', 'Camera Error', error.message);
      return null;
    }
  };

  const deletePhoto = async (photoUrl: string) => {
    try {
      await photoService.deletePhoto(photoUrl);
      addNotification('success', 'Photo Deleted', 'Photo removed successfully');
    } catch (error: any) {
      console.error('Photo delete error:', error);
      addNotification('error', 'Delete Failed', error.message);
      throw error;
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadPhoto,
    captureAndUpload,
    deletePhoto,
  };
}
