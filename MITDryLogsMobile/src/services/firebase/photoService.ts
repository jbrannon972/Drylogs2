/**
 * Firebase Photo Storage Service - React Native Version
 */

import storage from '@react-native-firebase/storage';
import { PhotoStep } from '../../types';

export interface PhotoUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export const photoService = {
  /**
   * Upload photo to Firebase Storage
   * @param uri - Local file URI (from camera or image picker)
   * @param jobId - Job identifier
   * @param roomId - Room identifier
   * @param step - Photo step (before, during, after, etc.)
   * @param userId - User identifier
   */
  async uploadPhoto(
    uri: string,
    jobId: string,
    roomId: string,
    step: PhotoStep,
    userId: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${jobId}/${roomId}/${step}_${timestamp}.jpg`;
      const storageRef = storage().ref(`photos/${fileName}`);

      await storageRef.putFile(uri);
      const downloadURL = await storageRef.getDownloadURL();

      return downloadURL;
    } catch (error: any) {
      console.error('Upload photo error:', error);
      throw new Error(error.message || 'Failed to upload photo');
    }
  },

  /**
   * Upload photo with progress tracking
   * @param uri - Local file URI (from camera or image picker)
   * @param jobId - Job identifier
   * @param roomId - Room identifier
   * @param step - Photo step
   * @param onProgress - Progress callback
   */
  uploadPhotoWithProgress(
    uri: string,
    jobId: string,
    roomId: string,
    step: PhotoStep,
    onProgress?: (progress: PhotoUploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const fileName = `${jobId}/${roomId}/${step}_${timestamp}.jpg`;
      const storageRef = storage().ref(`photos/${fileName}`);

      const uploadTask = storageRef.putFile(uri);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
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
            const downloadURL = await storageRef.getDownloadURL();
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
   * @param photoUrl - Full URL or storage path
   */
  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      // If photoUrl is a full URL, extract the path
      // If it's already a path, use it directly
      let path = photoUrl;
      if (photoUrl.includes('firebasestorage.googleapis.com')) {
        // Extract path from URL (simplified - may need more robust parsing)
        const matches = photoUrl.match(/photos%2F(.+?)\?/);
        if (matches && matches[1]) {
          path = `photos/${decodeURIComponent(matches[1])}`;
        }
      }

      const photoRef = storage().ref(path);
      await photoRef.delete();
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
   *
   * Example with expo-image-manipulator:
   * import * as ImageManipulator from 'expo-image-manipulator';
   *
   * const result = await ImageManipulator.manipulateAsync(
   *   uri,
   *   [{ resize: { width: maxWidth } }],
   *   { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
   * );
   * return result.uri;
   */
  async compressImage(uri: string, maxWidth: number = 1920, quality: number = 0.8): Promise<string> {
    // TODO: Implement React Native image compression using expo-image-manipulator
    // For now, return the original URI
    // Install: npx expo install expo-image-manipulator
    //
    // Uncomment when ready:
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
