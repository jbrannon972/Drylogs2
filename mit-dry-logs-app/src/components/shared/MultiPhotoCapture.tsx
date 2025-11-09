/**
 * Multi Photo Capture
 * Custom camera interface that stays open for multiple shots
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface MultiPhotoCaptureProps {
  onPhotosCapture: (files: File[]) => void;
  onClose: () => void;
}

export const MultiPhotoCapture: React.FC<MultiPhotoCaptureProps> = ({
  onPhotosCapture,
  onClose,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    // Convert to blob/file
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const timestamp = Date.now();
      const file = new File([blob], `photo_${timestamp}.jpg`, { type: 'image/jpeg' });

      // Create preview URL
      const previewUrl = URL.createObjectURL(blob);

      setCapturedPhotos(prev => [...prev, file]);
      setPreviews(prev => [...prev, previewUrl]);

      // Flash effect
      setTimeout(() => setIsCapturing(false), 200);
    }, 'image/jpeg', 0.9);
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Clean up URL to prevent memory leak
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  const handleDone = () => {
    stopCamera();
    onPhotosCapture(capturedPhotos);
    onClose();
  };

  const handleCancel = () => {
    stopCamera();
    // Clean up preview URLs
    previews.forEach(url => URL.revokeObjectURL(url));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-80 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <span className="font-medium">Take Photos</span>
          {capturedPhotos.length > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              {capturedPhotos.length}
            </span>
          )}
        </div>
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Flash effect */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white animate-pulse" />
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Capture Button */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-lg active:scale-95 transition-transform hover:border-blue-500"
          >
            <div className="w-full h-full rounded-full border-2 border-black flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
          </button>
        </div>
      </div>

      {/* Photo Strip */}
      {capturedPhotos.length > 0 && (
        <div className="bg-gray-900 p-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={preview}
                  alt={`Captured ${index + 1}`}
                  className="w-20 h-20 object-cover rounded border-2 border-white"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleDone}
            variant="primary"
            className="w-full mt-2"
          >
            <Check className="w-4 h-4" />
            Done ({capturedPhotos.length} photo{capturedPhotos.length !== 1 ? 's' : ''})
          </Button>
        </div>
      )}

      {/* Instructions */}
      {capturedPhotos.length === 0 && (
        <div className="bg-gray-900 bg-opacity-90 text-white p-4 text-center">
          <p className="text-sm">Tap the camera button to take photos</p>
          <p className="text-xs text-gray-400 mt-1">Take as many as you need</p>
        </div>
      )}
    </div>
  );
};
