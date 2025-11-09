import React, { useState, useEffect } from 'react';
import { X, Images, Loader, Filter } from 'lucide-react';
import { JobPhoto } from '../../../types/photo';
import { photosService } from '../../../services/firebase/photosService';
import { PhotoLightbox } from './PhotoLightbox';

interface PhotoGalleryModalProps {
  jobId: string;
  onClose: () => void;
}

type TimeGroup = 'today' | 'yesterday' | 'this-week' | 'earlier';

interface PhotosByTimeGroup {
  [key: string]: JobPhoto[];
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ jobId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [allPhotos, setAllPhotos] = useState<JobPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<JobPhoto[]>([]);
  const [roomNames, setRoomNames] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<JobPhoto | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<JobPhoto[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch photos on mount
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const photos = await photosService.getPhotosByJobId(jobId);

        // Sort by timestamp DESC (newest first)
        const sortedPhotos = photos.sort((a, b) =>
          b.timestamp.toMillis() - a.timestamp.toMillis()
        );

        setAllPhotos(sortedPhotos);
        setFilteredPhotos(sortedPhotos);

        // Get unique room names
        const rooms = photosService.getRoomNames(sortedPhotos);
        setRoomNames(rooms);

        // Get unique dates (YYYY-MM-DD format)
        const uniqueDates = Array.from(
          new Set(
            sortedPhotos.map(photo =>
              photo.timestamp.toDate().toISOString().split('T')[0]
            )
          )
        ).sort().reverse(); // Most recent first
        setAvailableDates(uniqueDates);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [jobId]);

  // Filter photos by room and date
  useEffect(() => {
    let filtered = allPhotos;

    if (selectedRoom) {
      filtered = filtered.filter(p => p.roomName === selectedRoom);
    }

    if (selectedDate) {
      filtered = filtered.filter(p => {
        const photoDate = p.timestamp.toDate().toISOString().split('T')[0];
        return photoDate === selectedDate;
      });
    }

    setFilteredPhotos(filtered);
  }, [selectedRoom, selectedDate, allPhotos]);

  // Group photos by time period
  const getTimeGroup = (timestamp: any): string => {
    const now = new Date();
    const photoDate = timestamp.toDate();
    const diffMs = now.getTime() - photoDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'This Week';
    return 'Earlier';
  };

  const groupPhotosByTime = (photos: JobPhoto[]): PhotosByTimeGroup => {
    const grouped: PhotosByTimeGroup = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Earlier': []
    };

    photos.forEach(photo => {
      const group = getTimeGroup(photo.timestamp);
      grouped[group].push(photo);
    });

    return grouped;
  };

  const photosByTimeGroup = groupPhotosByTime(filteredPhotos);

  const handlePhotoClick = (photo: JobPhoto, photos: JobPhoto[]) => {
    setLightboxPhoto(photo);
    setLightboxPhotos(photos);
  };

  const handleCloseLightbox = () => {
    setLightboxPhoto(null);
    setLightboxPhotos([]);
  };

  const handleNavigateLightbox = (photo: JobPhoto) => {
    setLightboxPhoto(photo);
  };

  const handleClearFilters = () => {
    setSelectedDate(null);
    setSelectedRoom(null);
  };

  const activeFilterCount = [selectedDate, selectedRoom].filter(Boolean).length;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-12 h-12 text-entrusted-orange animate-spin" />
            <p className="text-gray-700 font-medium">Loading photos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (allPhotos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <Images className="w-16 h-16 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900">No Photos Yet</h3>
            <p className="text-gray-600">
              Photos uploaded during workflows will appear here. Start taking photos during your install, demo, or check service workflows.
            </p>
            <button onClick={onClose} className="btn-primary mt-4">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-entrusted-orange" />
            <div>
              <h2 className="font-bold text-gray-900">Photos</h2>
              <p className="text-xs text-gray-500">{filteredPhotos.length} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterModal(true)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Filter className="w-6 h-6 text-gray-600" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-entrusted-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Photos List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(photosByTimeGroup).map(([timeGroup, photos]) => {
            if (photos.length === 0) return null;

            return (
              <div key={timeGroup} className="mb-6">
                {/* Time Group Header */}
                <div className="sticky top-0 bg-gray-100 px-4 py-2 border-b border-gray-200 z-10">
                  <h3 className="font-bold text-gray-900">{timeGroup}</h3>
                  <p className="text-xs text-gray-500">{photos.length} photos</p>
                </div>

                {/* Photos */}
                <div className="p-2 grid grid-cols-2 gap-2">
                  {photos.map(photo => (
                    <div
                      key={photo.id}
                      onClick={() => handlePhotoClick(photo, photos)}
                      className="bg-white rounded-lg overflow-hidden active:opacity-75 transition-opacity"
                    >
                      {/* Photo */}
                      <div className="aspect-square bg-gray-100 relative">
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.roomName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {photo.category && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black bg-opacity-70 text-white text-xs font-medium rounded">
                            {photo.category}
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="p-2">
                        <p className="font-bold text-xs text-gray-900 truncate">{photo.roomName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {photo.timestamp.toDate().toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredPhotos.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <Images className="w-16 h-16 mb-3" />
              <p className="font-medium">No photos</p>
              <p className="text-sm">Try selecting a different room</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md sm:mx-4 max-h-[80vh] flex flex-col animate-slide-up">
            {/* Filter Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-entrusted-orange" />
                <h3 className="font-bold text-gray-900">Filter Photos</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Date Filter */}
              {availableDates.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-3">Date</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedDate(null)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        !selectedDate
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      All Dates
                    </button>
                    {availableDates.map(date => {
                      const dateObj = new Date(date + 'T00:00:00');
                      const formatted = dateObj.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      });
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                            selectedDate === date
                              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {formatted}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Room Filter */}
              {roomNames.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-3">Room</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        !selectedRoom
                          ? 'border-entrusted-orange bg-orange-50 text-orange-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      All Rooms
                    </button>
                    {roomNames.map(room => (
                      <button
                        key={room}
                        onClick={() => setSelectedRoom(room)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedRoom === room
                            ? 'border-entrusted-orange bg-orange-50 text-orange-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {room}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-3 bg-entrusted-orange text-white font-bold rounded-lg hover:bg-orange-600 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          allPhotos={lightboxPhotos}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigateLightbox}
        />
      )}
    </>
  );
};
