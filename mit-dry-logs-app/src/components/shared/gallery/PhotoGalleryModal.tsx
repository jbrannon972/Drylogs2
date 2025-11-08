import React, { useState, useEffect } from 'react';
import { X, Images, Loader } from 'lucide-react';
import { JobPhoto, PhotosByDate } from '../../../types/photo';
import { photosService } from '../../../services/firebase/photosService';
import { DatePickerWithHighlights } from './DatePickerWithHighlights';
import { RoomFilterBar } from './RoomFilterBar';
import { PhotoGrid } from './PhotoGrid';
import { PhotoLightbox } from './PhotoLightbox';

interface PhotoGalleryModalProps {
  jobId: string;
  onClose: () => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ jobId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [allPhotos, setAllPhotos] = useState<JobPhoto[]>([]);
  const [photosByDate, setPhotosByDate] = useState<PhotosByDate>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [roomNames, setRoomNames] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<JobPhoto | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<JobPhoto[]>([]);

  // Fetch photos on mount
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const photos = await photosService.getPhotosByJobId(jobId);

        if (photos.length === 0) {
          setLoading(false);
          return;
        }

        setAllPhotos(photos);

        // Group by date
        const grouped = photosService.groupPhotosByDate(photos);
        setPhotosByDate(grouped);

        // Get available dates
        const dates = photosService.getAvailableDates(grouped);
        setAvailableDates(dates);

        // Set initial date to most recent
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }

        // Get room names
        const rooms = photosService.getRoomNames(photos);
        setRoomNames(rooms);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [jobId]);

  // Filter photos based on selected date and room
  const filteredPhotosByRoom = selectedDate
    ? photosService.filterPhotos(photosByDate, selectedDate, selectedRoom)
    : {};

  // Get photo counts for date picker
  const photoCountByDate = availableDates.reduce((acc, date) => {
    acc[date] = photosService.getPhotoCountForDate(photosByDate, date);
    return acc;
  }, {} as { [date: string]: number });

  // Get photo counts for room filter
  const photoCountByRoom: { [roomName: string]: number } = {};
  if (selectedDate && photosByDate[selectedDate]) {
    Object.keys(photosByDate[selectedDate]).forEach(room => {
      photoCountByRoom[room] = photosByDate[selectedDate][room].length;
    });
  }

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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden">
        <div className="h-full w-full bg-white flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-entrusted-orange to-orange-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Images className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Photo Gallery</h2>
                <p className="text-orange-100 text-sm">
                  {allPhotos.length} {allPhotos.length === 1 ? 'photo' : 'photos'} total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6">
              {/* Date Picker */}
              <div className="mb-6">
                <DatePickerWithHighlights
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  photoCountByDate={photoCountByDate}
                />
              </div>

              {/* Room Filter */}
              {roomNames.length > 1 && (
                <div className="mb-6">
                  <RoomFilterBar
                    rooms={roomNames}
                    selectedRoom={selectedRoom}
                    onRoomSelect={setSelectedRoom}
                    photoCountByRoom={photoCountByRoom}
                  />
                </div>
              )}

              {/* Photo Grid */}
              <PhotoGrid
                photosByRoom={filteredPhotosByRoom}
                onPhotoClick={handlePhotoClick}
              />
            </div>
          </div>
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
