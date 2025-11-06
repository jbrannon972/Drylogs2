import React, { useState } from 'react';
import { Camera, Info, CheckCircle } from 'lucide-react';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';

interface PullFinalPhotosStepProps {
  job: any;
  onNext: () => void;
}

export const PullFinalPhotosStep: React.FC<PullFinalPhotosStepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const [roomPhotos, setRoomPhotos] = useState<Record<string, string>>({});

  const handlePhotoUpload = async (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const room = job.rooms.find((r: any) => r.roomId === roomId);
      const url = await uploadPhoto(file, job.jobId, room.roomName, 'final-pull', user.uid);
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
            <h4 className="font-medium text-blue-900 mb-1">Final Documentation Photos</h4>
            <p className="text-sm text-blue-800">
              Photograph all rooms AFTER equipment removal showing dry conditions. These are critical for insurance closure and protecting against future claims.
            </p>
          </div>
        </div>
      </div>

      {/* Photo Requirements */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Photo Requirements</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Clear view of all affected areas showing dry conditions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Include any exposed materials (drywall, subfloor, framing)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Show clean work area with no equipment remaining</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Document any areas that still require reconstruction</span>
          </li>
        </ul>
      </div>

      {/* Room Photos */}
      {affectedRooms.map((room: any) => (
        <div key={room.roomId} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{room.roomName}</h3>
            {roomPhotos[room.roomId] && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>

          {roomPhotos[room.roomId] ? (
            <div>
              <img
                src={roomPhotos[room.roomId]}
                alt={`Final ${room.roomName}`}
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
                {isUploading ? 'Uploading...' : 'Take Final Photo'}
              </label>
            </div>
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

      {/* Photo Timeline Summary */}
      <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
        <h3 className="font-semibold text-gray-900 mb-2">Complete Photo Timeline</h3>
        <p className="text-sm text-blue-800">
          This job now has a complete photo record: Pre-install → Post-install → Pre-demo → Post-demo → Final.
          This documentation protects against future disputes and demonstrates proper drying procedures.
        </p>
      </div>
    </div>
  );
};
