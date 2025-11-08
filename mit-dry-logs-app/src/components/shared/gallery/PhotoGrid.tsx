import React from 'react';
import { Camera, Calendar, User } from 'lucide-react';
import { JobPhoto } from '../../../types/photo';

interface PhotoGridProps {
  photosByRoom: { [roomName: string]: JobPhoto[] };
  onPhotoClick: (photo: JobPhoto, allPhotos: JobPhoto[]) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photosByRoom, onPhotoClick }) => {
  const rooms = Object.keys(photosByRoom);

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Camera className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No photos found</p>
        <p className="text-sm">Try selecting a different date or room</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rooms.map(roomName => {
        const photos = photosByRoom[roomName];
        if (photos.length === 0) return null;

        return (
          <div key={roomName} className="bg-white rounded-lg border border-gray-200 p-4">
            {/* Room Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {roomName}
              </h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map(photo => (
                <div
                  key={photo.id}
                  onClick={() => onPhotoClick(photo, photos)}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-entrusted-orange transition-all"
                >
                  {/* Photo */}
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={`${roomName} photo`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end p-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs space-y-1 w-full">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{photo.timestamp.toDate().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">{photo.uploadedByName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Badge */}
                  {photo.category && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded-full">
                      {photo.category}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
