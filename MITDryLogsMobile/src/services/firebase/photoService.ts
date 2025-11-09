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
import { storage } from '../../config/firebase';
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
   * Upload photo with progress tracking
   */
  uploadPhotoWithProgress(
    file: Blob | File,
    jobId: string,
    roomId: string,
    step: PhotoStep,
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
            resolve(downloadURL);
          } catch (error: any) {
            reject(new Error(error.message || 'Failed to get download URL'));
          }
        }
      );
    });
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
   * Compress image before upload (React Native version)
   *
   * NOTE: Web canvas API removed - React Native doesn't support it.
   * Image compression should be handled by:
   * - expo-image-picker: Set 'quality' option when picking images
   * - expo-image-manipulator: For manual compression/resizing
   * - expo-camera: Set quality in camera options
   *
   * Example with expo-image-picker:
   * const result = await ImagePicker.launchCameraAsync({
   *   quality: 0.8, // 0-1, lower = more compression
   *   allowsEditing: true,
   *   aspect: [4, 3],
   * });
   */
  async compressImage(uri: string, maxWidth: number = 1920, quality: number = 0.8): Promise<string> {
    // TODO: Implement React Native image compression using expo-image-manipulator
    // For now, return the original URI
    // Install: npm install expo-image-manipulator
    //
    // import * as ImageManipulator from 'expo-image-manipulator';
    //
    // const result = await ImageManipulator.manipulateAsync(
    //   uri,
    //   [{ resize: { width: maxWidth } }],
    //   { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    // );
    // return result.uri;

    console.warn('Image compression not yet implemented for React Native');
    return uri;
  },
};
