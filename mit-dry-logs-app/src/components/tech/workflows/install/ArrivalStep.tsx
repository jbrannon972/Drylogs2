import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Camera, MapPin, Clock, CheckCircle, X } from 'lucide-react';
import { useBatchPhotos } from '../../../../hooks/useBatchPhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface ArrivalStepProps {
  job: any;
  onNext: () => void;
}

export const ArrivalStep: React.FC<ArrivalStepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { queuePhoto } = useBatchPhotos();
  const { installData, updateWorkflowData } = useWorkflowStore();

  // Initialize from saved data or current time
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  const [arrivalTime, setArrivalTime] = useState(
    installData.arrivalTime || `${hours}:${minutes}`
  );
  const [travelTimeToSite, setTravelTimeToSite] = useState(
    installData.travelTimeToSite || 0
  );
  const [hasTruckPhoto, setHasTruckPhoto] = useState<boolean>(
    installData.hasTruckPhoto || false
  );
  const [hasPropertyPhoto, setHasPropertyPhoto] = useState<boolean>(
    installData.hasPropertyPhoto || false
  );
  const [showTruckPhotoModal, setShowTruckPhotoModal] = useState(false);
  const [showPropertyPhotoModal, setShowPropertyPhotoModal] = useState(false);

  // ULTRAFAULT: Save to workflow store when data changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateWorkflowData('install', {
        arrivalTime,
        travelTimeToSite,
        hasTruckPhoto,
        hasPropertyPhoto,
      });
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivalTime, travelTimeToSite, hasTruckPhoto, hasPropertyPhoto]);

  const handleTruckPhotosCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && user) {
      // Queue all captured photos for background upload
      for (let i = 0; i < files.length; i++) {
        await queuePhoto(files[i], job.jobId, 'exterior', 'Exterior', 'arrival');
      }
      // Mark as taken
      setHasTruckPhoto(true);
      // Reset input so same files can be selected again
      e.target.value = '';
    }
  };

  const handlePropertyPhotosCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && user) {
      // Queue all captured photos for background upload
      for (let i = 0; i < files.length; i++) {
        await queuePhoto(files[i], job.jobId, 'exterior', 'Exterior', 'arrival');
      }
      // Mark as taken
      setHasPropertyPhoto(true);
      // Reset input so same files can be selected again
      e.target.value = '';
    }
  };

  const canProceed = hasTruckPhoto && hasPropertyPhoto;

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
      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Time to Site (minutes)
          </label>
          <Input
            type="number"
            value={travelTimeToSite}
            onChange={(e) => setTravelTimeToSite(parseInt(e.target.value) || 0)}
            placeholder="0"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Drive time from office/home</p>
        </div>
      </div>

      {/* Truck Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Truck Location Photo *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          {hasTruckPhoto && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Photos queued</span>
            </div>
          )}
          <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />

          <button
            onClick={() => setShowTruckPhotoModal(true)}
            className="btn-primary w-full"
          >
            📷 Add Photos
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Required for safety documentation
          </p>
        </div>
      </div>

      {/* Property Exterior Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Exterior Photo *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          {hasPropertyPhoto && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Photos queued</span>
            </div>
          )}
          <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />

          <button
            onClick={() => setShowPropertyPhotoModal(true)}
            className="btn-primary w-full"
          >
            📷 Add Photos
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Document property exterior
          </p>
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

      {/* Truck Photo Modal */}
      {showTruckPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Truck Photos</h3>
                <button
                  onClick={() => setShowTruckPhotoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Quick Shot */}
                <label className="block p-4 border-2 border-gray-200 rounded-xl hover:border-entrusted-orange hover:bg-orange-50 transition-all cursor-pointer active:scale-95">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      handleTruckPhotosCapture(e);
                      setShowTruckPhotoModal(false);
                    }}
                    className="hidden"
                  />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-entrusted-orange" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">📷 Quick Shot</h4>
                      <p className="text-sm text-gray-600">Take one photo, tap again for more</p>
                    </div>
                  </div>
                </label>

                {/* Batch Mode */}
                <button
                  onClick={() => {
                    setShowTruckPhotoModal(false);
                    alert(
                      '📸 BATCH MODE:\n\n' +
                      '1. Exit this app\n' +
                      '2. Open Camera app\n' +
                      '3. Take ALL photos needed\n' +
                      '4. Come back here\n' +
                      '5. Tap "Add Photos"\n' +
                      '6. Choose "From Gallery"\n' +
                      '7. Multi-select photos'
                    );
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left active:scale-95"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📸</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">📋 Batch Mode</h4>
                      <p className="text-sm text-gray-600">Take many photos at once, then upload</p>
                    </div>
                  </div>
                </button>

                {/* From Gallery */}
                <label className="block p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer active:scale-95">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      handleTruckPhotosCapture(e);
                      setShowTruckPhotoModal(false);
                    }}
                    className="hidden"
                  />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🖼️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">📱 From Gallery</h4>
                      <p className="text-sm text-gray-600">Select multiple existing photos</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Photo Modal */}
      {showPropertyPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Property Photos</h3>
                <button
                  onClick={() => setShowPropertyPhotoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Quick Shot */}
                <label className="block p-4 border-2 border-gray-200 rounded-xl hover:border-entrusted-orange hover:bg-orange-50 transition-all cursor-pointer active:scale-95">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      handlePropertyPhotosCapture(e);
                      setShowPropertyPhotoModal(false);
                    }}
                    className="hidden"
                  />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-entrusted-orange" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">📷 Quick Shot</h4>
                      <p className="text-sm text-gray-600">Take one photo, tap again for more</p>
                    </div>
                  </div>
                </label>

                {/* Batch Mode */}
                <button
                  onClick={() => {
                    setShowPropertyPhotoModal(false);
                    alert(
                      '📸 BATCH MODE:\n\n' +
                      '1. Exit this app\n' +
                      '2. Open Camera app\n' +
                      '3. Take ALL photos needed\n' +
                      '4. Come back here\n' +
                      '5. Tap "Add Photos"\n' +
                      '6. Choose "From Gallery"\n' +
                      '7. Multi-select photos'
                    );
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left active:scale-95"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📸</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">📋 Batch Mode</h4>
                      <p className="text-sm text-gray-600">Take many photos at once, then upload</p>
                    </div>
                  </div>
                </button>

                {/* From Gallery */}
                <label className="block p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer active:scale-95">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      handlePropertyPhotosCapture(e);
                      setShowPropertyPhotoModal(false);
                    }}
                    className="hidden"
                  />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🖼️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">📱 From Gallery</h4>
                      <p className="text-sm text-gray-600">Select multiple existing photos</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
