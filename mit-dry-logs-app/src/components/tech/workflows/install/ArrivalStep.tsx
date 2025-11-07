import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Camera, MapPin, Clock } from 'lucide-react';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface ArrivalStepProps {
  job: any;
  onNext: () => void;
}

export const ArrivalStep: React.FC<ArrivalStepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const { installData, updateWorkflowData } = useWorkflowStore();

  // Initialize from saved data or current time
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  const [arrivalTime, setArrivalTime] = useState(
    installData.arrivalTime || `${hours}:${minutes}`
  );
  const [truckPhoto, setTruckPhoto] = useState<string | null>(
    installData.truckPhoto || null
  );
  const [propertyPhoto, setPropertyPhoto] = useState<string | null>(
    installData.propertyPhoto || null
  );

  // Save to workflow store when data changes
  useEffect(() => {
    updateWorkflowData('install', {
      arrivalTime,
      truckPhoto,
      propertyPhoto,
    });
  }, [arrivalTime, truckPhoto, propertyPhoto]);

  const handleTruckPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadPhoto(file, job.jobId, 'exterior', 'arrival', user.uid);
      if (url) setTruckPhoto(url);
    }
  };

  const handlePropertyPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadPhoto(file, job.jobId, 'exterior', 'arrival', user.uid);
      if (url) setPropertyPhoto(url);
    }
  };

  const canProceed = truckPhoto && propertyPhoto;

  return (
    <div className="space-y-6">
      {/* Job Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Job Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>{job.customerInfo.address}, {job.customerInfo.city}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4" />
            <span>Scheduled: {new Date(job.scheduledDate.seconds * 1000).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Clock In */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Arrival Time
        </label>
        <Input
          type="time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
        />
      </div>

      {/* Truck Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Truck Location Photo *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {truckPhoto ? (
            <div>
              <img src={truckPhoto} alt="Truck" className="max-h-48 mx-auto mb-2 rounded" />
              <p className="text-sm text-green-600 font-medium">✓ Photo uploaded</p>
            </div>
          ) : (
            <div>
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <label className="btn-primary cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleTruckPhoto}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? 'Uploading...' : 'Take Truck Photo'}
              </label>
              <p className="text-xs text-gray-500 mt-2">Required for safety documentation</p>
            </div>
          )}
        </div>
      </div>

      {/* Property Exterior Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Exterior Photo *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {propertyPhoto ? (
            <div>
              <img src={propertyPhoto} alt="Property" className="max-h-48 mx-auto mb-2 rounded" />
              <p className="text-sm text-green-600 font-medium">✓ Photo uploaded</p>
            </div>
          ) : (
            <div>
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <label className="btn-primary cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePropertyPhoto}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? 'Uploading...' : 'Take Property Photo'}
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Safety Checklist */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Safety Checklist</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Safety cones placed</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">PPE equipped and ready</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Vehicle secured</span>
          </label>
        </div>
      </div>

      {!canProceed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please upload both truck and property photos to proceed
          </p>
        </div>
      )}
    </div>
  );
};
