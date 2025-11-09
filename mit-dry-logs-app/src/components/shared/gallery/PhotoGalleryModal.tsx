import React, { useState, useEffect } from 'react';
import { X, Images, Loader } from 'lucide-react';
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Date Filter - Fixed, scrollable pills */}
        {availableDates.length > 0 && (
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedDate(null)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
                  !selectedDate
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                All Dates
              </button>
              {availableDates.map(date => {
                const dateObj = new Date(date + 'T00:00:00');
                const formatted = dateObj.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
                      selectedDate === date
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {formatted}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Room Filter - Fixed, scrollable pills */}
        {roomNames.length > 0 && (
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedRoom(null)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
                  !selectedRoom
                    ? 'bg-entrusted-orange text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                All Rooms
              </button>
              {roomNames.map(room => (
                <button
                  key={room}
                  onClick={() => setSelectedRoom(room)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
                    selectedRoom === room
                      ? 'bg-entrusted-orange text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>
        )}

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
