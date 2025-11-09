/**
 * Photo Upload Indicator
 * Floating button showing queued photo count with upload action
 */

import React from 'react';
import { Upload, X, AlertCircle, Camera } from 'lucide-react';
import { useBatchPhotos } from '../../hooks/useBatchPhotos';

export const PhotoUploadIndicator: React.FC = () => {
  const {
    queueCount,
    pendingCount,
    isUploading,
    uploadAll,
    clearQueue,
    queue,
    uploadProgress,
  } = useBatchPhotos();

  // Don't show if no photos queued
  if (queueCount === 0) {
    return null;
  }

  const failedCount = Object.values(uploadProgress).filter(
    (p) => p.status === 'failed'
  ).length;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-entrusted-orange overflow-hidden">
        {/* Header */}
        <div className="bg-entrusted-orange text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="font-medium text-sm">
              {queueCount} Photo{queueCount !== 1 ? 's' : ''} Ready
            </span>
          </div>
          <button
            onClick={clearQueue}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        {isUploading && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </div>
          </div>
        )}

        {/* Failed indicator */}
        {failedCount > 0 && !isUploading && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span>{failedCount} failed</span>
            </div>
          </div>
        )}

        {/* Preview thumbnails */}
        <div className="p-2 max-h-32 overflow-y-auto">
          <div className="grid grid-cols-4 gap-1">
            {queue.slice(0, 8).map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded overflow-hidden bg-gray-100"
              >
                {photo.preview && (
                  <img
                    src={photo.preview}
                    alt="Queued"
                    className="w-full h-full object-cover"
                  />
                )}
                {uploadProgress[photo.id]?.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {uploadProgress[photo.id]?.status === 'completed' && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-70 flex items-center justify-center">
                    <div className="text-white text-xs">✓</div>
                  </div>
                )}
                {uploadProgress[photo.id]?.status === 'failed' && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-70 flex items-center justify-center">
                    <div className="text-white text-xs">✗</div>
                  </div>
                )}
              </div>
            ))}
            {queueCount > 8 && (
              <div className="aspect-square rounded bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">+{queueCount - 8}</span>
              </div>
            )}
          </div>
        </div>

        {/* Upload button */}
        <div className="p-3 border-t">
          <button
            onClick={uploadAll}
            disabled={isUploading || queueCount === 0}
            className={`w-full py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              isUploading || queueCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-entrusted-orange text-white hover:bg-orange-600'
            }`}
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : `Upload All (${queueCount})`}
          </button>
        </div>
      </div>
    </div>
  );
};
