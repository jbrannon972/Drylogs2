import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Calendar, User, MapPin } from 'lucide-react';
import { JobPhoto } from '../../../types/photo';

interface PhotoLightboxProps {
  photo: JobPhoto;
  allPhotos: JobPhoto[];
  onClose: () => void;
  onNavigate: (photo: JobPhoto) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  allPhotos,
  onClose,
  onNavigate,
}) => {
  const [zoom, setZoom] = useState(1);
  const [showMetadata, setShowMetadata] = useState(true);

  const currentIndex = allPhotos.findIndex(p => p.id === photo.id);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < allPhotos.length - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && canGoPrev) {
        onNavigate(allPhotos[currentIndex - 1]);
        setZoom(1); // Reset zoom on navigate
      } else if (e.key === 'ArrowRight' && canGoNext) {
        onNavigate(allPhotos[currentIndex + 1]);
        setZoom(1); // Reset zoom on navigate
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, allPhotos, canGoPrev, canGoNext, onClose, onNavigate]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3)); // Max 3x zoom
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1)); // Min 1x zoom
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${photo.roomName}-${photo.timestamp.toDate().toISOString()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading photo:', error);
      alert('Failed to download photo');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full text-white transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation - Previous */}
      {canGoPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(allPhotos[currentIndex - 1]);
            setZoom(1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full text-white transition-all z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Navigation - Next */}
      {canGoNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(allPhotos[currentIndex + 1]);
            setZoom(1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full text-white transition-all z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Controls Bar */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white bg-opacity-10 rounded-full p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            disabled={zoom <= 1}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="px-3 text-white text-sm font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            disabled={zoom >= 3}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full text-white transition-all"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Photo Counter */}
        <div className="px-3 py-2 bg-white bg-opacity-10 rounded-full text-white text-sm font-medium">
          {currentIndex + 1} / {allPhotos.length}
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.url}
          alt={photo.roomName}
          className="max-w-full max-h-full object-contain transition-transform duration-300 cursor-zoom-in"
          style={{
            transform: `scale(${zoom})`,
          }}
          onClick={() => {
            if (zoom === 1) {
              handleZoomIn();
            }
          }}
        />
      </div>

      {/* Metadata Panel */}
      {showMetadata && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-entrusted-orange" />
                <div>
                  <p className="text-xs text-gray-300">Room</p>
                  <p className="font-medium">{photo.roomName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-entrusted-orange" />
                <div>
                  <p className="text-xs text-gray-300">Timestamp</p>
                  <p className="font-medium">{formatTimestamp(photo.timestamp)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-entrusted-orange" />
                <div>
                  <p className="text-xs text-gray-300">Uploaded by</p>
                  <p className="font-medium">{photo.uploadedByName}</p>
                </div>
              </div>
            </div>
            {photo.category && (
              <div className="mt-3 inline-block px-3 py-1 bg-entrusted-orange rounded-full text-sm font-medium">
                {photo.category}
              </div>
            )}
            {photo.notes && (
              <p className="mt-3 text-sm text-gray-300">{photo.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-4 py-2 rounded-full">
        Use ← → arrows to navigate • +/- to zoom • ESC to close
      </div>
    </div>
  );
};
