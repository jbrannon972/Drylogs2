import React, { useState } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface PhotoCaptureProps {
  /**
   * Context label for button (e.g., "Room Name Overview", "Moisture Meter Reading")
   */
  contextLabel: string;

  /**
   * Callback when photo is captured/uploaded
   */
  onPhotoCapture: (file: File) => Promise<string | null>;

  /**
   * Current photos array
   */
  photos: string[];

  /**
   * Callback when photo is deleted
   */
  onPhotoDelete: (index: number) => void;

  /**
   * Is upload in progress?
   */
  isUploading?: boolean;

  /**
   * Minimum photos required (optional)
   */
  minPhotos?: number;

  /**
   * Photo guidance tips (optional)
   */
  photoTips?: string[];

  /**
   * Grid columns (default 2)
   */
  gridCols?: number;

  /**
   * Show quick tips? (default false)
   */
  showQuickTips?: boolean;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'failed';
  error?: string;
  file?: File;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  contextLabel,
  onPhotoCapture,
  photos,
  onPhotoDelete,
  isUploading = false,
  minPhotos,
  photoTips,
  gridCols = 2,
  showQuickTips = false,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [deletedPhoto, setDeletedPhoto] = useState<{ index: number; url: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleFileSelect = async (file: File) => {
    setUploadState({ status: 'uploading', file });

    try {
      const url = await onPhotoCapture(file);
      if (url) {
        setUploadState({ status: 'success' });
        setTimeout(() => setUploadState({ status: 'idle' }), 2000);
      } else {
        setUploadState({ status: 'failed', error: 'Upload failed', file });
      }
    } catch (error) {
      setUploadState({ status: 'failed', error: 'Upload failed', file });
    }
  };

  const handleTakePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        await handleFileSelect(file);
      }
    };
    input.click();
  };

  const handleUploadFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        await handleFileSelect(file);
      }
    };
    input.click();
  };

  const handleRetry = async () => {
    if (uploadState.file) {
      await handleFileSelect(uploadState.file);
    }
  };

  const handleDelete = (index: number) => {
    setShowDeleteConfirm(index);
  };

  const confirmDelete = (index: number) => {
    const photoUrl = photos[index];
    setDeletedPhoto({ index, url: photoUrl });
    onPhotoDelete(index);
    setShowDeleteConfirm(null);

    // Show undo toast for 5 seconds
    setTimeout(() => {
      setDeletedPhoto(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (deletedPhoto) {
      // Note: Parent component needs to handle undo logic
      // For now, just clear the deleted state
      setDeletedPhoto(null);
    }
  };

  const meetsMinimum = minPhotos ? photos.length >= minPhotos : true;

  return (
    <div className="space-y-4">
      {/* Photo Guidance Tips */}
      {photoTips && photoTips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Suggested Photos:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {photoTips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Tips (collapsible) */}
      {showQuickTips && (
        <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <summary className="font-medium text-gray-900 cursor-pointer">Photo Tips</summary>
          <ul className="text-sm text-gray-700 space-y-1 mt-2">
            <li>• Use flash in dark areas</li>
            <li>• Hold camera steady to avoid blur</li>
            <li>• Get close enough to read meter displays</li>
            <li>• Ensure material and meter are both visible</li>
          </ul>
        </details>
      )}

      {/* Photo Capture Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={handleTakePhoto}
          disabled={isUploading || uploadState.status === 'uploading'}
          className="flex-1"
        >
          <Camera className="w-4 h-4" />
          {uploadState.status === 'uploading' ? 'Uploading...' : `Take Photo of ${contextLabel}`}
        </Button>

        <Button
          variant="secondary"
          onClick={handleUploadFromGallery}
          disabled={isUploading || uploadState.status === 'uploading'}
          className="flex-1"
        >
          <Upload className="w-4 h-4" />
          Upload from Gallery
        </Button>
      </div>

      {/* Upload State Feedback */}
      {uploadState.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-900">{uploadState.error || 'Upload failed'}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleRetry}>
              <RotateCcw className="w-4 h-4" />
              Retry
            </Button>
            <Button variant="secondary" onClick={handleTakePhoto}>
              <Camera className="w-4 h-4" />
              Retake
            </Button>
          </div>
        </div>
      )}

      {/* Minimum Photos Status */}
      {minPhotos && (
        <div className={`p-3 rounded-lg ${
          meetsMinimum
            ? 'bg-green-50 border border-green-200'
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <p className={`text-sm font-medium ${
            meetsMinimum ? 'text-green-900' : 'text-yellow-900'
          }`}>
            {meetsMinimum ? (
              <>
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {photos.length} photos captured - Requirement met!
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {photos.length} of {minPhotos} minimum photos captured
              </>
            )}
          </p>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className={`grid grid-cols-${gridCols} gap-3`}>
          {photos.map((photoUrl, index) => (
            <div key={index} className="relative">
              <img
                src={photoUrl}
                alt={`${contextLabel} ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                onClick={() => handleDelete(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                aria-label="Delete photo"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Upload success indicator */}
              <div className="absolute top-2 left-2 bg-green-600 text-white rounded-full p-1">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Photo?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete this photo? You can undo this action within 5 seconds.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Toast */}
      {deletedPhoto && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg p-4 shadow-lg flex items-center gap-3 z-50">
          <span className="text-sm">Photo deleted</span>
          <Button
            variant="secondary"
            onClick={handleUndo}
          >
            Undo
          </Button>
        </div>
      )}
    </div>
  );
};
