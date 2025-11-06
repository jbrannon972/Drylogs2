import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, Clock, Camera, AlertTriangle, Info } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';

interface FrontDoorStepProps {
  job: any;
  onNext: () => void;
}

export const FrontDoorStep: React.FC<FrontDoorStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  const [arrivalTimestamp, setArrivalTimestamp] = useState<string | null>(
    installData.arrivalTimestamp || null
  );
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(
    installData.arrivalGPS || null
  );
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [frontEntrancePhoto, setFrontEntrancePhoto] = useState<string | null>(
    installData.frontEntrancePhoto || null
  );
  const [preExistingPhotos, setPreExistingPhotos] = useState<string[]>(
    installData.preExistingPhotos || []
  );
  const [isAfterHours, setIsAfterHours] = useState(false);

  const [checklist, setChecklist] = useState({
    introduced: false,
    groundRules: false,
    walkthrough: false,
    questions: false,
    utilities: false,
  });

  // Check if current time is after hours
  useEffect(() => {
    const checkAfterHours = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday

      // After 5pm weekdays or any time on weekends
      const afterHours = hour >= 17 || day === 0 || day === 6;
      setIsAfterHours(afterHours);
    };

    checkAfterHours();
  }, []);

  // Save to workflow store
  useEffect(() => {
    updateWorkflowData('install', {
      arrivalTimestamp,
      arrivalGPS: gpsLocation,
      frontEntrancePhoto,
      preExistingPhotos,
      isAfterHours,
    });
  }, [arrivalTimestamp, gpsLocation, frontEntrancePhoto, preExistingPhotos, isAfterHours]);

  const handleArriveAtJob = () => {
    const timestamp = new Date().toISOString();
    setArrivalTimestamp(timestamp);

    // Get GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGpsError(null);
        },
        (error) => {
          setGpsError('GPS unavailable - location not recorded');
          console.error('GPS error:', error);
        }
      );
    } else {
      setGpsError('GPS not supported on this device');
    }
  };

  const handleFrontEntrancePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadPhoto(file, job.jobId, 'front-entrance', 'arrival', user.uid);
      if (url) setFrontEntrancePhoto(url);
    }
  };

  const handlePreExistingPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadPhoto(file, job.jobId, 'pre-existing', 'arrival', user.uid);
      if (url) setPreExistingPhotos([...preExistingPhotos, url]);
    }
  };

  const handleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allComplete = arrivalTimestamp && frontEntrancePhoto && Object.values(checklist).every(v => v);

  return (
    <div className="space-y-6">
      {/* After Hours Warning */}
      {isAfterHours && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">After-Hours Service</h4>
              <p className="text-sm text-orange-800">
                This job is being performed after 5pm or on a weekend. Premium labor rates ($98.27/hr) will apply automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Arrival Tracking */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Arrival at Job Site</h3>

        {!arrivalTimestamp ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Click the button below to record your arrival time and location. This captures your start time for billing.
            </p>
            <button
              onClick={handleArriveAtJob}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              <Clock className="w-5 h-5" />
              Arrive at Job Site
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">✓ Arrived at Job Site</p>
                <p className="text-sm text-green-800">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {new Date(arrivalTimestamp).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
                {gpsLocation && (
                  <p className="text-sm text-green-800">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    GPS: {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
                  </p>
                )}
                {gpsError && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ {gpsError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Front Entrance Photo */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Front Entrance Photo *</h3>
        <p className="text-sm text-gray-600 mb-3">
          Take a photo of the property entrance for documentation.
        </p>

        {frontEntrancePhoto ? (
          <div>
            <img src={frontEntrancePhoto} alt="Front Entrance" className="max-h-48 rounded mb-2" />
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">✓ Front entrance documented</span>
            </div>
            <label className="btn-secondary cursor-pointer inline-block text-sm">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFrontEntrancePhoto}
                className="hidden"
                disabled={isUploading}
              />
              Replace Photo
            </label>
          </div>
        ) : (
          <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFrontEntrancePhoto}
              className="hidden"
              disabled={isUploading}
            />
            <Camera className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Take Photo of Front Entrance'}
          </label>
        )}
      </div>

      {/* Pre-Existing Damage Photos */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Pre-Existing Conditions</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Document any pre-existing damage or conditions to protect against future liability claims.
            </p>
          </div>
        </div>

        {preExistingPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {preExistingPhotos.map((photo, idx) => (
              <img key={idx} src={photo} alt={`Pre-existing ${idx + 1}`} className="rounded h-24 w-full object-cover" />
            ))}
          </div>
        )}

        <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePreExistingPhoto}
            className="hidden"
            disabled={isUploading}
          />
          <Camera className="w-4 h-4" />
          {preExistingPhotos.length === 0 ? 'Add Pre-Existing Damage Photo' : 'Add Another Photo'}
        </label>
        <p className="text-xs text-gray-500 mt-2">
          {preExistingPhotos.length} photo{preExistingPhotos.length !== 1 ? 's' : ''} added
        </p>
      </div>

      {/* Customer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Customer: {job.customerInfo.name}</h3>
        <p className="text-sm text-gray-700">Phone: {job.customerInfo.phoneNumber}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Ground Rules Presentation</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.introduced}
              onChange={() => handleCheck('introduced')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">1. Introduce yourself and team</p>
              <p className="text-sm text-gray-600">Present Entrusted identification</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.groundRules}
              onChange={() => handleCheck('groundRules')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">2. Explain today's process</p>
              <p className="text-sm text-gray-600">Purpose, timeline, noise levels, access needs</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.walkthrough}
              onChange={() => handleCheck('walkthrough')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">3. Property walkthrough</p>
              <p className="text-sm text-gray-600">Tour affected areas, listen to customer's story</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.questions}
              onChange={() => handleCheck('questions')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">4. Address customer concerns</p>
              <p className="text-sm text-gray-600">Answer questions, establish communication preferences</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.utilities}
              onChange={() => handleCheck('utilities')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">5. Confirm utility locations</p>
              <p className="text-sm text-gray-600">Electrical, gas, water shut-offs</p>
            </div>
          </label>
        </div>
      </div>

      {allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">All ground rules completed ✓</p>
        </div>
      )}
    </div>
  );
};
