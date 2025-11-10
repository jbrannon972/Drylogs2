/**
 * Firebase Photo Storage Service
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { storage, db } from '../../config/firebase';
import { Photo, PhotoStep } from '../../types';

export interface PhotoUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export const photoService = {
  /**
   * Upload photo to Firebase Storage
   */
  async uploadPhoto(
    file: Blob | File,
    jobId: string,
    roomId: string,
    step: PhotoStep,
    userId: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${jobId}/${roomId}/${step}_${timestamp}.jpg`;
      const storageRef = ref(storage, `photos/${fileName}`);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error: any) {
      console.error('Upload photo error:', error);
      throw new Error(error.message || 'Failed to upload photo');
    }
  },

  /**
   * Upload photo with progress tracking and save metadata to Firestore
   */
  uploadPhotoWithProgress(
    file: Blob | File,
    jobId: string,
    roomId: string,
    step: PhotoStep,
    userId: string,
    userName: string,
    onProgress?: (progress: PhotoUploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const fileName = `${jobId}/${roomId}/${step}_${timestamp}.jpg`;
      const storageRef = ref(storage, `photos/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          };

          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload photo error:', error);
          reject(new Error(error.message || 'Failed to upload photo'));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save photo metadata to Firestore
            await photoService.savePhotoMetadata({
              url: downloadURL,
              jobId,
              roomId,
              roomName: roomId, // Will be overridden if passed separately
              category: photoService.mapStepToCategory(step),
              timestamp: Timestamp.now(),
              uploadedBy: userId,
              uploadedByName: userName,
              step,
            });

            resolve(downloadURL);
          } catch (error: any) {
            reject(new Error(error.message || 'Failed to get download URL'));
          }
        }
      );
    });
  },

  /**
   * Save photo metadata to Firestore
   */
  async savePhotoMetadata(metadata: {
    url: string;
    jobId: string;
    roomId?: string;
    roomName: string;
    category: string;
    timestamp: Timestamp;
    uploadedBy: string;
    uploadedByName: string;
    step?: string;
    notes?: string;
  }): Promise<void> {
    try {
      const photosRef = collection(db, 'photos');
      const docRef = await addDoc(photosRef, metadata);
      console.log('✅ Photo metadata saved to Firestore:', docRef.id, metadata);
    } catch (error: any) {
      console.error('❌ Error saving photo metadata:', error);
      // Don't throw - we don't want to fail the upload if metadata save fails
    }
  },

  /**
   * Map PhotoStep to PhotoCategory
   */
  mapStepToCategory(step: PhotoStep): string {
    const categoryMap: Record<PhotoStep, string> = {
      'arrival': 'before',
      'assessment': 'before',
      'preexisting': 'before',
      'pre-demo': 'before',
      'demo': 'demo',
      'post-demo': 'progress',
      'daily-check': 'progress',
      'final': 'after',
      'overall': 'before', // Phase 1: Room overview photos
      'thermal': 'before', // Phase 1: Thermal imaging
      'containment': 'progress', // Phase 2: Containment setup
      'exposed-material': 'demo', // Phase 3: Exposed materials during demo
      'check-service': 'progress', // Phase 2: Environmental check
    };
    return categoryMap[step] || 'other';
  },

  /**
   * Delete photo from storage
   */
  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      const photoRef = ref(storage, photoUrl);
      await deleteObject(photoRef);
    } catch (error: any) {
      console.error('Delete photo error:', error);
      throw new Error(error.message || 'Failed to delete photo');
    }
  },

  /**
   * Compress image before upload (client-side)
   */
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  },
};
