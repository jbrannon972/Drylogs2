/**
 * Photo Upload Indicator
 * Unified upload progress for both batch photos and universal photo capture
 * Shows in top-left below header
 */

import React from 'react';
import { Upload } from 'lucide-react';
import { useBatchPhotos } from '../../hooks/useBatchPhotos';
import { useUploadQueue } from '../../contexts/UploadQueueContext';

export const PhotoUploadIndicator: React.FC = () => {
  const { queueCount: batchCount, uploadProgress: batchProgress } = useBatchPhotos();
  const { queue: universalQueue } = useUploadQueue();

  // Combine counts from both systems
  const totalCount = batchCount + universalQueue.length;

  // Don't show if no photos queued in either system
  if (totalCount === 0) {
    return null;
  }

  // Calculate combined progress
  // Batch photos progress
  const batchProgressValues = Object.values(batchProgress);
  const batchTotalProgress = batchProgressValues.reduce((sum, p) => sum + (p.progress || 0), 0);

  // Universal queue progress
  const universalTotalProgress = universalQueue.reduce((sum, item) => sum + item.progress, 0);

  // Average across all uploads
  const combinedProgress = totalCount > 0
    ? Math.round((batchTotalProgress + universalTotalProgress) / totalCount)
    : 0;

  // Check if any are currently uploading
  const isBatchUploading = batchProgressValues.some(p => p.status === 'uploading');
  const isUniversalUploading = universalQueue.some(item => item.status === 'uploading');
  const isUploading = isBatchUploading || isUniversalUploading;

  // Check completion status
  const batchComplete = batchProgressValues.every(p => p.status === 'completed');
  const universalComplete = universalQueue.every(item => item.status === 'success');
  const allComplete = batchComplete && universalComplete && totalCount > 0;

  return (
    <div className="fixed top-16 left-4 z-50">
      <div
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
          isUploading ? 'bg-blue-500' : allComplete ? 'bg-green-500' : 'bg-gray-400'
        } text-white font-bold text-sm transition-all`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Upload className="w-5 h-5 mb-0.5 animate-bounce" />
            <span className="text-xs">{combinedProgress}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-lg">✓</span>
            <span className="text-xs">{totalCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};
