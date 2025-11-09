/**
 * Photo Upload Indicator
 * Tiny floating circle showing upload percentage
 */

import React from 'react';
import { Upload } from 'lucide-react';
import { useBatchPhotos } from '../../hooks/useBatchPhotos';

export const PhotoUploadIndicator: React.FC = () => {
  const { queueCount, uploadProgress } = useBatchPhotos();

  // Don't show if no photos queued
  if (queueCount === 0) {
    return null;
  }

  // Calculate overall progress
  const progressValues = Object.values(uploadProgress);
  const totalProgress = progressValues.reduce((sum, p) => sum + (p.progress || 0), 0);
  const averageProgress = progressValues.length > 0 ? Math.round(totalProgress / progressValues.length) : 0;

  const isUploading = progressValues.some(p => p.status === 'uploading');

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
          isUploading ? 'bg-blue-500' : 'bg-green-500'
        } text-white font-bold text-sm transition-all`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Upload className="w-5 h-5 mb-0.5 animate-bounce" />
            <span className="text-xs">{averageProgress}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-lg">✓</span>
            <span className="text-xs">{queueCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};
