import React, { useState } from 'react';
import { Camera, Info, AlertCircle } from 'lucide-react';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { UniversalPhotoCapture } from '../../../shared/UniversalPhotoCapture';

interface PreDemoPhotosStepProps {
  job: any;
  onNext: () => void;
}

export const PreDemoPhotosStep: React.FC<PreDemoPhotosStepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const [roomPhotos, setRoomPhotos] = useState<Record<string, string[]>>({});

  const affectedRooms = Array.isArray(job?.rooms) ? job.rooms.filter((r: any) => r.affectedStatus === 'affected') : [];
  const allPhotosTaken = affectedRooms.every((r: any) => roomPhotos[r.roomId]?.length > 0);

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
          {user && (
            <UniversalPhotoCapture
              jobId={job.jobId}
              location={room.roomName}
              category="pre-demo"
              userId={user.uid}
              onPhotosUploaded={(urls) => {
                setRoomPhotos(prev => ({
                  ...prev,
                  [room.roomId]: [...(prev[room.roomId] || []), ...urls]
                }));
              }}
              uploadedCount={roomPhotos[room.roomId]?.length || 0}
              label={`Pre-Demo Photos for ${room.roomName}`}
              minimumPhotos={1}
            />
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
