import React, { useState } from 'react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '../../../shared/Button';
import { UniversalPhotoCapture } from '../../../shared/UniversalPhotoCapture';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface FinalPhotosStepProps {
  job: any;
  onNext: () => void;
}

interface RoomPhotos {
  roomId: string;
  roomName: string;
  photos: string[];
}

export const FinalPhotosStep: React.FC<FinalPhotosStepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { installData, updateWorkflowData } = useWorkflowStore();

  // Get rooms from installData
  const rooms = installData.rooms || [];

  // Load existing room photos from workflow data
  const [roomPhotos, setRoomPhotos] = useState<RoomPhotos[]>(() => {
    const saved = installData.finalPhotosByRoom || [];
    // Ensure all rooms have an entry
    return rooms.map((room: any) => {
      const existing = saved.find((rp: RoomPhotos) => rp.roomId === room.id);
      return existing || {
        roomId: room.id,
        roomName: room.name,
        photos: [],
      };
    });
  });

  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  const handlePhotosUploaded = (urls: string[]) => {
    const currentRoom = roomPhotos[currentRoomIndex];
    const updatedRoomPhotos = [...roomPhotos];
    updatedRoomPhotos[currentRoomIndex] = {
      ...currentRoom,
      photos: [...currentRoom.photos, ...urls],
    };
    setRoomPhotos(updatedRoomPhotos);
    updateWorkflowData('install', { finalPhotosByRoom: updatedRoomPhotos });
  };

  const handleNextRoom = () => {
    if (currentRoomIndex < roomPhotos.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
    }
  };

  const handlePreviousRoom = () => {
    if (currentRoomIndex > 0) {
      setCurrentRoomIndex(currentRoomIndex - 1);
    }
  };

  const getTotalPhotos = () => {
    return roomPhotos.reduce((sum, rp) => sum + rp.photos.length, 0);
  };

  const getCompletedRooms = () => {
    return roomPhotos.filter(rp => rp.photos.length >= 2).length;
  };

  if (rooms.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ No rooms found. Please complete the room assessment step first.
        </p>
      </div>
    );
  }

  const currentRoom = roomPhotos[currentRoomIndex];
  const isCurrentRoomComplete = currentRoom && currentRoom.photos.length >= 2;
  const allRoomsComplete = getCompletedRooms() === roomPhotos.length;

  return (
    <div className="space-y-4">
      {/* Instructions Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm font-medium text-blue-900">
          📸 Final Photos - Document equipment in each room (minimum 2 photos per room)
        </p>
      </div>

      {/* Overall Progress Stats */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Progress</p>
          <p className="text-lg font-bold text-gray-900">
            {getCompletedRooms()}/{roomPhotos.length} rooms
          </p>
        </div>
        <div className="flex-1 mx-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getCompletedRooms() / roomPhotos.length) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Photos</p>
          <p className="text-lg font-bold text-gray-900">{getTotalPhotos()}</p>
        </div>
      </div>

      {/* Room List Overview - AT TOP */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">All Rooms</h4>
        <div className="space-y-2">
          {roomPhotos.map((rp, index) => (
            <div
              key={rp.roomId}
              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                index === currentRoomIndex
                  ? 'border-orange-500 bg-orange-50 shadow-sm'
                  : rp.photos.length >= 2
                  ? 'border-green-300 bg-green-50 hover:border-green-400'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setCurrentRoomIndex(index)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  rp.photos.length >= 2
                    ? 'bg-green-500 text-white'
                    : index === currentRoomIndex
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {rp.photos.length >= 2 ? '✓' : index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{rp.roomName}</p>
                  <p className="text-xs text-gray-600">
                    {rp.photos.length >= 2 ? (
                      <span className="text-green-700 font-medium">{rp.photos.length} photos ✓</span>
                    ) : (
                      <span>{rp.photos.length}/2 photos</span>
                    )}
                  </p>
                </div>
              </div>
              {index === currentRoomIndex && (
                <span className="text-xs font-bold text-orange-600 px-2 py-1 bg-orange-100 rounded">
                  CURRENT
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Room Photo Capture */}
      <div className="bg-white border-2 border-orange-500 rounded-lg p-4 shadow-sm">
        {/* Current Room Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{currentRoom.roomName}</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Room {currentRoomIndex + 1} of {roomPhotos.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handlePreviousRoom}
              disabled={currentRoomIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5"
            >
              <ChevronRight className="w-4 h-4 transform rotate-180" />
              Prev
            </Button>
            <Button
              variant="secondary"
              onClick={handleNextRoom}
              disabled={currentRoomIndex === roomPhotos.length - 1}
              className="flex items-center gap-1 px-3 py-1.5"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Room Status Badge */}
        <div className={`p-3 rounded-lg border mb-4 ${
          isCurrentRoomComplete
            ? 'bg-green-50 border-green-300'
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-center gap-2">
            {isCurrentRoomComplete ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  {currentRoom.photos.length} photos captured - Complete ✓
                </span>
              </>
            ) : (
              <>
                <span className="text-lg">📸</span>
                <span className="text-sm font-medium text-yellow-900">
                  {currentRoom.photos.length}/2 photos - {2 - currentRoom.photos.length} more needed
                </span>
              </>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        {user && (
          <div className="mb-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-orange-900">
                <strong>Capture equipment in place:</strong> Show dehumidifiers, air movers, air scrubbers, and overall room setup
              </p>
            </div>
            <UniversalPhotoCapture
              jobId={job.jobId}
              location={currentRoom.roomName}
              category="final"
              userId={user.uid}
              onPhotosUploaded={handlePhotosUploaded}
              uploadedCount={currentRoom.photos.length}
              label={`${currentRoom.roomName} Final Photos *`}
              minimumPhotos={2}
            />
          </div>
        )}

        {/* Preview captured photos */}
        {currentRoom.photos.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Captured Photos ({currentRoom.photos.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {currentRoom.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`${currentRoom.roomName} photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                  />
                  <div className="absolute top-1 right-1 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Status */}
      {!allRoomsComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please capture at least 2 photos for each room before proceeding.
            {getCompletedRooms()} of {roomPhotos.length} rooms complete.
          </p>
        </div>
      )}

      {allRoomsComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              All {roomPhotos.length} rooms documented! {getTotalPhotos()} total photos captured.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
