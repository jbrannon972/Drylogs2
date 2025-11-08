import React, { useState } from 'react';
import { X, AlertTriangle, Camera, Upload } from 'lucide-react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useAuth } from '../../../hooks/useAuth';
import { usePhotos } from '../../../hooks/usePhotos';

interface SafetyFlagModalProps {
  jobId: string;
  currentStep: string;
  onClose: () => void;
}

type SafetyType = 'cat3-discovered' | 'structural' | 'electrical' | 'gas' | 'mold' | 'asbestos' | 'other';

const SAFETY_TYPES: { value: SafetyType; label: string; description: string }[] = [
  { value: 'cat3-discovered', label: 'Cat 3 Water Discovered', description: 'Sewage or grossly contaminated' },
  { value: 'structural', label: 'Structural Hazard', description: 'Unsafe floors, ceilings, walls' },
  { value: 'electrical', label: 'Electrical Hazard', description: 'Exposed wiring, water near panels' },
  { value: 'gas', label: 'Gas Leak/Concern', description: 'Gas smell, compromised lines' },
  { value: 'mold', label: 'Extensive Mold', description: 'Beyond typical scope' },
  { value: 'asbestos', label: 'Asbestos Suspected', description: 'Requires testing/abatement' },
  { value: 'other', label: 'Other Safety Concern', description: 'Describe in details' },
];

export const SafetyFlagModal: React.FC<SafetyFlagModalProps> = ({
  jobId,
  currentStep,
  onClose,
}) => {
  const { user } = useAuth();
  const { updateWorkflowData, installData } = useWorkflowStore();
  const { uploadPhoto, isUploading } = usePhotos();

  const [safetyType, setSafetyType] = useState<SafetyType>('cat3-discovered');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [workStopped, setWorkStopped] = useState(false);

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      try {
        const url = await uploadPhoto(file, jobId, 'safety', 'assessment', user.uid);
        setPhoto(url);
      } catch (error) {
        console.error('Photo upload failed:', error);
        alert('Failed to upload photo. Please try again.');
      }
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      alert('Please describe the safety concern before submitting.');
      return;
    }

    const flag = {
      id: `safety-${Date.now()}`,
      type: safetyType,
      typeLabel: SAFETY_TYPES.find((t) => t.value === safetyType)?.label || safetyType,
      description: description.trim(),
      photo,
      workStopped,
      flaggedAt: new Date().toISOString(),
      flaggedDuringStep: currentStep,
      status: 'open',
      priority: workStopped ? 'urgent' : 'high',
    };

    const existingFlags = installData.safetyFlags || [];

    updateWorkflowData('install', {
      safetyFlags: [...existingFlags, flag],
    });

    alert(
      workStopped
        ? 'URGENT SAFETY FLAG SENT! MIT Lead and office have been notified. Wait for instructions before continuing.'
        : 'Safety flag sent to MIT Lead and office for review.'
    );
    onClose();
  };

  const selectedType = SAFETY_TYPES.find((t) => t.value === safetyType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-red-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Safety Flag</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Safety Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Concern <span className="text-red-500">*</span>
            </label>
            <select
              value={safetyType}
              onChange={(e) => setSafetyType(e.target.value as SafetyType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {SAFETY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {selectedType && (
              <p className="text-xs text-gray-500 mt-1">{selectedType.description}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (Recommended)
            </label>
            {photo ? (
              <div className="relative">
                <img src={photo} alt="Safety concern" className="w-full h-48 object-cover rounded-lg" />
                <button
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                {isUploading ? (
                  <div className="text-center">
                    <Upload className="w-10 h-10 mx-auto text-gray-400 animate-pulse" />
                    <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Tap to capture photo</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the safety concern in detail. What did you find? Where is it located? What's the risk?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Work Stopped */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={workStopped}
                onChange={(e) => setWorkStopped(e.target.checked)}
                className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-yellow-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Work Stopped - Immediate Attention Required
                </div>
                <p className="text-sm text-yellow-800 mt-1">
                  Check this if you've stopped work due to this safety concern and need immediate guidance from MIT Lead.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!description.trim()}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              !description.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : workStopped
                ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {workStopped ? 'Send URGENT Flag' : 'Submit Flag'}
          </button>
        </div>
      </div>
    </div>
  );
};
