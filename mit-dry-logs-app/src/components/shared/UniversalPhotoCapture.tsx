import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, CheckCircle, X } from 'lucide-react';
import { useUploadQueue } from '../../contexts/UploadQueueContext';
import { photoService } from '../../services/firebase/photoService';
import { PhotoStep } from '../../types';

interface UniversalPhotoCaptureProps {
  jobId: string;
  location: string;
  category: PhotoStep;
  userId: string;
  onPhotosUploaded: (urls: string[]) => void;
  uploadedCount: number;
  label?: string;
  minimumPhotos?: number;
}

export const UniversalPhotoCapture: React.FC<UniversalPhotoCaptureProps> = ({
  jobId,
  location,
  category,
  userId,
  onPhotosUploaded,
  uploadedCount,
  label,
  minimumPhotos,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { addToQueue, queue, markSuccess, markError, updateProgress } = useUploadQueue();
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [pendingUploads, setPendingUploads] = useState<Set<string>>(new Set());

  // Track which uploads belong to this component
  const componentUploadsRef = useRef<Set<string>>(new Set());

  // Handle file selection
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const uploadIds = addToQueue(fileArray);

    // Track these uploads
    uploadIds.forEach(id => {
      componentUploadsRef.current.add(id);
      setPendingUploads(prev => new Set([...prev, id]));
    });

    // Start uploading in background
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const uploadId = uploadIds[i];

      try {
        // Simulate progress (photoService doesn't provide progress callback currently)
        updateProgress(uploadId, 30);

        const url = await photoService.uploadPhoto(file, jobId, location, category, userId);

        if (url) {
          updateProgress(uploadId, 100);
          markSuccess(uploadId, url);
          setUploadedUrls(prev => [...prev, url]);
          setPendingUploads(prev => {
            const next = new Set(prev);
            next.delete(uploadId);
            return next;
          });
        } else {
          markError(uploadId, 'Upload failed');
          setPendingUploads(prev => {
            const next = new Set(prev);
            next.delete(uploadId);
            return next;
          });
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        markError(uploadId, error instanceof Error ? error.message : 'Upload failed');
        setPendingUploads(prev => {
          const next = new Set(prev);
          next.delete(uploadId);
          return next;
        });
      }
    }
  };

  // Notify parent when uploads complete
  useEffect(() => {
    if (uploadedUrls.length > 0) {
      onPhotosUploaded(uploadedUrls);
      setUploadedUrls([]); // Clear after notifying
    }
  }, [uploadedUrls, onPhotosUploaded]);

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const showNeedMore = minimumPhotos && uploadedCount < minimumPhotos;

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {minimumPhotos && (
            <span className="ml-2 text-xs text-gray-500">
              (Minimum {minimumPhotos} required)
            </span>
          )}
        </label>
      )}

      {/* Photo Capture Options */}
      <div className="grid grid-cols-2 gap-3">
        {/* Camera Option */}
        <button
          type="button"
          onClick={handleCameraClick}
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-entrusted-orange hover:bg-orange-50 transition-all"
        >
          <Camera className="w-8 h-8 mb-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Take Photo</span>
        </button>

        {/* Gallery Option */}
        <button
          type="button"
          onClick={handleGalleryClick}
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-entrusted-orange hover:bg-orange-50 transition-all"
        >
          <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Choose from Gallery</span>
          <span className="text-xs text-gray-500 mt-1">Multiple selection</span>
        </button>
      </div>

      {/* Upload Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {uploadedCount >= (minimumPhotos || 0) ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {uploadedCount} photo{uploadedCount !== 1 ? 's' : ''} uploaded
              </span>
            </>
          ) : showNeedMore ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">
                {uploadedCount}/{minimumPhotos} uploaded (need {minimumPhotos - uploadedCount} more)
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {uploadedCount} photo{uploadedCount !== 1 ? 's' : ''} uploaded
              </span>
            </>
          )}
        </div>

        {pendingUploads.size > 0 && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-entrusted-orange"></div>
            <span className="text-xs text-gray-500">Uploading...</span>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
};
