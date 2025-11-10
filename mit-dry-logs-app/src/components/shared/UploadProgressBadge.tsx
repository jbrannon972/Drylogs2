import React from 'react';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { useUploadQueue } from '../../contexts/UploadQueueContext';

export const UploadProgressBadge: React.FC = () => {
  const { queue } = useUploadQueue();

  // Calculate stats
  const uploading = queue.filter(item => item.status === 'uploading' || item.status === 'pending');
  const completed = queue.filter(item => item.status === 'success');
  const failed = queue.filter(item => item.status === 'error');
  const total = queue.length;

  // Calculate overall progress
  const totalProgress = queue.reduce((sum, item) => sum + item.progress, 0);
  const overallProgress = total > 0 ? totalProgress / total : 0;

  // Don't show if no uploads
  if (total === 0) return null;

  // Show success state briefly
  const allComplete = uploading.length === 0 && failed.length === 0 && completed.length > 0;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        {/* Progress Ring */}
        <svg className="w-16 h-16 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={allComplete ? '#10b981' : failed.length > 0 ? '#ef4444' : '#f97316'}
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - overallProgress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            allComplete
              ? 'bg-green-500'
              : failed.length > 0
              ? 'bg-red-500'
              : 'bg-entrusted-orange'
          } shadow-lg`}>
            {allComplete ? (
              <CheckCircle className="w-7 h-7 text-white" />
            ) : failed.length > 0 ? (
              <AlertCircle className="w-7 h-7 text-white" />
            ) : (
              <div className="text-center">
                <div className="text-white font-bold text-xs leading-none">
                  {completed.length + uploading.length}/{total}
                </div>
                <Upload className="w-4 h-4 text-white mx-auto mt-0.5 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Percentage text below */}
        <div className="text-center mt-1">
          <div className="text-xs font-medium text-gray-700">
            {allComplete ? (
              <span className="text-green-600">✓ Done</span>
            ) : (
              <span>{Math.round(overallProgress)}%</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
