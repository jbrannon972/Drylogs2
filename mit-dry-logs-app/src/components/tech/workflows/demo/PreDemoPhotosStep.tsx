import React, { useState } from 'react';
import { Camera, Info, AlertCircle } from 'lucide-react';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';

interface PreDemoPhotosStepProps {
  job: any;
  onNext: () => void;
}

export const PreDemoPhotosStep: React.FC<PreDemoPhotosStepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const [roomPhotos, setRoomPhotos] = useState<Record<string, string>>({});

  const handlePhotoUpload = async (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const room = job.rooms.find((r: any) => r.roomId === roomId);
      const url = await uploadPhoto(file, job.jobId, room.roomName, 'pre-demo', user.uid);
      if (url) {
        setRoomPhotos(prev => ({ ...prev, [roomId]: url }));
      }
    }
  };

  const affectedRooms = job.rooms?.filter((r: any) => r.affectedStatus === 'affected') || [];
  const allPhotosTaken = affectedRooms.every((r: any) => roomPhotos[r.roomId]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Pre-Demo Documentation</h4>
            <p className="text-sm text-blue-800">
              Take photos of each room BEFORE starting demolition. These prove the starting conditions.
            </p>
          </div>
        </div>
      </div>

      {affectedRooms.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No affected rooms documented. Return to Install workflow to add rooms.
          </p>
        </div>
      )}

      {affectedRooms.map((room: any) => (
        <div key={room.roomId} className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">{room.roomName}</h3>
          {roomPhotos[room.roomId] ? (
            <div>
              <img
                src={roomPhotos[room.roomId]}
                alt={`Pre-demo ${room.roomName}`}
                className="max-h-64 w-full object-cover rounded mb-3"
              />
              <p className="text-sm text-green-600 font-medium">✓ Photo uploaded</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <label className="btn-primary cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(room.roomId, e)}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? 'Uploading...' : `Take Pre-Demo Photo`}
              </label>
            </div>
          )}
        </div>
      ))}

      {!allPhotosTaken && affectedRooms.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Please photograph all affected rooms before proceeding.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
