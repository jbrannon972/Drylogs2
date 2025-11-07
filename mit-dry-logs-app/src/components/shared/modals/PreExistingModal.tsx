import React, { useState } from 'react';
import { X, Camera, Upload } from 'lucide-react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useAuth } from '../../../hooks/useAuth';
import { usePhotos } from '../../../hooks/usePhotos';

interface PreExistingModalProps {
  jobId: string;
  currentRoom?: string;
  onClose: () => void;
}

export const PreExistingModal: React.FC<PreExistingModalProps> = ({
  jobId,
  currentRoom,
  onClose,
}) => {
  const { user } = useAuth();
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { uploadPhoto, isUploading } = usePhotos();

  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'severe'>('minor');
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      try {
        const url = await uploadPhoto(file, jobId, 'pre-existing', 'assessment', user.uid);
        setPhoto(url);
      } catch (error) {
        console.error('Photo upload failed:', error);
        alert('Failed to upload photo. Please try again.');
      }
    }
  };

  const handleSave = () => {
    if (!description.trim() || !photo) {
      alert('Please add a description and photo before saving.');
      return;
    }

    const newDamage = {
      id: `pre-${Date.now()}`,
      description: description.trim(),
      severity,
      photo,
      room: currentRoom || 'Unknown',
      discoveredAt: new Date().toISOString(),
      discoveredDuringStep: installData.currentStep || 'unknown',
    };

    const existingDamage = installData.preExistingConditions || [];

    updateWorkflowData('install', {
      preExistingConditions: [...existingDamage, newDamage],
    });

    alert('Pre-existing damage logged successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Add Pre-Existing Damage</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo <span className="text-red-500">*</span>
            </label>
            {photo ? (
              <div className="relative">
                <img src={photo} alt="Pre-existing damage" className="w-full h-48 object-cover rounded-lg" />
                <button
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                {isUploading ? (
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 animate-pulse" />
                    <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto text-gray-400" />
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
              placeholder="E.g., Cracked tile in bathroom corner, stained ceiling near window..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSeverity('minor')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  severity === 'minor'
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Minor
              </button>
              <button
                onClick={() => setSeverity('moderate')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  severity === 'moderate'
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Moderate
              </button>
              <button
                onClick={() => setSeverity('severe')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  severity === 'severe'
                    ? 'bg-red-100 text-red-800 border-2 border-red-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Severe
              </button>
            </div>
          </div>

          {/* Room Context (if available) */}
          {currentRoom && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Room:</strong> {currentRoom}
              </p>
            </div>
          )}
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
            onClick={handleSave}
            disabled={!description.trim() || !photo}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              !description.trim() || !photo
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            Save Damage
          </button>
        </div>
      </div>
    </div>
  );
};
