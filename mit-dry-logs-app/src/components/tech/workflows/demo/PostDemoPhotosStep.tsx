import React, { useState } from 'react';
import { Camera, Info, CheckCircle } from 'lucide-react';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { UniversalPhotoCapture } from '../../../shared/UniversalPhotoCapture';

interface PostDemoPhotosStepProps {
  job: any;
  onNext: () => void;
}

export const PostDemoPhotosStep: React.FC<PostDemoPhotosStepProps> = ({ job, onNext }) => {
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
            <h4 className="font-medium text-blue-900 mb-1">Post-Demo Documentation</h4>
            <p className="text-sm text-blue-800">
              Photograph all rooms AFTER demo showing exposed materials and cleaned work area.
            </p>
          </div>
        </div>
      </div>

      {affectedRooms.map((room: any) => (
        <div key={room.roomId} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{room.roomName}</h3>
            {roomPhotos[room.roomId]?.length > 0 && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>
          {user && (
            <UniversalPhotoCapture
              jobId={job.jobId}
              location={room.roomName}
              category="post-demo"
              userId={user.uid}
              onPhotosUploaded={(urls) => {
                setRoomPhotos(prev => ({
                  ...prev,
                  [room.roomId]: [...(prev[room.roomId] || []), ...urls]
                }));
              }}
              uploadedCount={roomPhotos[room.roomId]?.length || 0}
              label={`Post-Demo Photos for ${room.roomName}`}
              minimumPhotos={1}
            />
          )}
        </div>
      ))}

      {allPhotosTaken && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">
            ✓ All rooms documented - ready to proceed
          </p>
        </div>
      )}
    </div>
  );
};
