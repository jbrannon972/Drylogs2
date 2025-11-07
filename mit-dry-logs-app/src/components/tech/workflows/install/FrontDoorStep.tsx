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

  // Removed duplicate arrival tracking - it's now in Step 1 (ArrivalStep)
  const [frontEntrancePhoto, setFrontEntrancePhoto] = useState<string | null>(
    installData.frontEntrancePhoto || null
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
      frontEntrancePhoto,
      isAfterHours,
    });
  }, [frontEntrancePhoto, isAfterHours]);

  const handleFrontEntrancePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadPhoto(file, job.jobId, 'front-entrance', 'arrival', user.uid);
      if (url) setFrontEntrancePhoto(url);
    }
  };

  const handleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allComplete = frontEntrancePhoto && Object.values(checklist).every(v => v);

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
                This job is being performed after 5pm or on a weekend. Premium labor rates will apply.
              </p>
            </div>
          </div>
        </div>
      )}

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
