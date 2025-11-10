import React from 'react';
import { Upload, Check } from 'lucide-react';

export interface UploadProgressIndicatorProps {
  /**
   * Number of photos uploaded
   */
  uploaded: number;

  /**
   * Total number of photos to upload
   */
  total: number;

  /**
   * Is currently uploading?
   */
  isUploading?: boolean;
}

export const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({
  uploaded,
  total,
  isUploading = false,
}) => {
  if (total === 0) return null;

  const progress = (uploaded / total) * 100;
  const isComplete = uploaded === total && !isUploading;

  // SVG circle parameters
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed top-4 left-4 z-40">
      <div className={`relative ${isComplete ? 'bg-green-100' : 'bg-blue-100'} rounded-full p-2 shadow-lg`}>
        {/* Progress Circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isComplete ? '#d1fae5' : '#dbeafe'}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isComplete ? '#10b981' : '#3b82f6'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isComplete ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <div className="text-center">
              <div className="text-xs font-bold text-blue-900">
                {uploaded}/{total}
              </div>
            </div>
          )}
        </div>

        {/* Uploading indicator */}
        {isUploading && (
          <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
            <Upload className="w-3 h-3 text-white animate-pulse" />
          </div>
        )}
      </div>

      {/* Status text (appears on hover or always show on mobile) */}
      <div className="mt-2 bg-white rounded-lg px-3 py-1 shadow-md text-xs font-medium text-gray-700">
        {isComplete ? (
          <span className="text-green-600">✓ All photos uploaded</span>
        ) : isUploading ? (
          <span>Uploading...</span>
        ) : (
          <span>{uploaded} of {total} uploaded</span>
        )}
      </div>
    </div>
  );
};
