/**
 * Header Upload Indicator
 * Compact upload progress for header integration
 * Shows: 📷 2/15 45% during upload, persists after complete
 */

import React, { useState, useEffect } from 'react';
import { useBatchPhotos } from '../../hooks/useBatchPhotos';
import { useUploadQueue } from '../../contexts/UploadQueueContext';

export const HeaderUploadIndicator: React.FC = () => {
  const { queueCount: batchCount, uploadProgress: batchProgress } = useBatchPhotos();
  const { queue: universalQueue } = useUploadQueue();

  // Track if we've ever had uploads (to keep indicator visible)
  const [hasHadUploads, setHasHadUploads] = useState(false);
  const [totalEverUploaded, setTotalEverUploaded] = useState(0);

  // Combine counts from both systems
  const totalCount = batchCount + universalQueue.length;

  // Update upload history
  useEffect(() => {
    if (totalCount > 0) {
      setHasHadUploads(true);
      setTotalEverUploaded(prev => Math.max(prev, totalCount));
    }
  }, [totalCount]);

  // Don't show if no photos have ever been queued
  if (!hasHadUploads && totalCount === 0) {
    return null;
  }

  // Calculate combined progress
  const batchProgressValues = Object.values(batchProgress);
  const batchTotalProgress = batchProgressValues.reduce((sum, p) => sum + (p.progress || 0), 0);

  const universalTotalProgress = universalQueue.reduce((sum, item) => sum + item.progress, 0);

  // Average across all uploads
  const combinedProgress = totalCount > 0
    ? Math.round((batchTotalProgress + universalTotalProgress) / totalCount)
    : 100;

  // Check if any are currently uploading
  const isBatchUploading = batchProgressValues.some(p => p.status === 'uploading');
  const isUniversalUploading = universalQueue.some(item => item.status === 'uploading');
  const isUploading = isBatchUploading || isUniversalUploading;

  // Calculate completed count
  const batchCompleted = batchProgressValues.filter(p => p.status === 'completed').length;
  const universalCompleted = universalQueue.filter(item => item.status === 'success').length;
  const completedCount = batchCompleted + universalCompleted;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
      <span className="text-lg">📷</span>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-bold text-gray-900">
          {isUploading ? `${completedCount}/${totalCount}` : totalEverUploaded}
        </span>
        {isUploading && (
          <span className="font-medium text-blue-600">
            {combinedProgress}%
          </span>
        )}
        {!isUploading && hasHadUploads && (
          <span className="text-green-600 font-medium">✓</span>
        )}
      </div>
    </div>
  );
};
