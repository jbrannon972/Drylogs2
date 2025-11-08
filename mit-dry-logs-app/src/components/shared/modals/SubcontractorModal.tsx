import React, { useState } from 'react';
import { X, Wrench, Zap, Wind, Droplets, Users } from 'lucide-react';
import { useWorkflowStore } from '../../../stores/workflowStore';

interface SubcontractorModalProps {
  jobId: string;
  currentStep: string;
  onClose: () => void;
}

type SubType = 'plumber' | 'electrician' | 'hvac' | 'mold' | 'other';
type Urgency = 'emergency' | 'same-day' | 'next-visit' | 'schedule';

const SUB_TYPES: { value: SubType; label: string; icon: any }[] = [
  { value: 'plumber', label: 'Plumber', icon: Droplets },
  { value: 'electrician', label: 'Electrician', icon: Zap },
  { value: 'hvac', label: 'HVAC', icon: Wind },
  { value: 'mold', label: 'Mold Specialist', icon: Users },
  { value: 'other', label: 'Other', icon: Wrench },
];

const URGENCY_OPTIONS: { value: Urgency; label: string; description: string; color: string }[] = [
  { value: 'emergency', label: 'Emergency', description: 'Within 2 hours', color: 'red' },
  { value: 'same-day', label: 'Same Day', description: 'Today', color: 'orange' },
  { value: 'next-visit', label: 'Next Visit', description: 'Next scheduled visit', color: 'blue' },
  { value: 'schedule', label: 'Schedule', description: 'Coordinate timing', color: 'gray' },
];

export const SubcontractorModal: React.FC<SubcontractorModalProps> = ({
  jobId,
  currentStep,
  onClose,
}) => {
  const { updateWorkflowData, installData } = useWorkflowStore();

  const [subType, setSubType] = useState<SubType>('plumber');
  const [urgency, setUrgency] = useState<Urgency>('same-day');
  const [description, setDescription] = useState('');
  const [otherType, setOtherType] = useState('');

  const handleSendRequest = () => {
    if (!description.trim()) {
      alert('Please describe what the subcontractor needs to do.');
      return;
    }

    if (subType === 'other' && !otherType.trim()) {
      alert('Please specify the type of subcontractor needed.');
      return;
    }

    const request = {
      id: `sub-${Date.now()}`,
      type: subType === 'other' ? otherType.trim() : SUB_TYPES.find((t) => t.value === subType)?.label || subType,
      urgency,
      description: description.trim(),
      requestedAt: new Date().toISOString(),
      requestedDuringStep: currentStep,
      status: 'pending',
    };

    const existingRequests = installData.subcontractorRequests || [];

    updateWorkflowData('install', {
      subcontractorRequests: [...existingRequests, request],
    });

    alert('Subcontractor request sent to MIT Lead and office!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal - Full Screen */}
      <div className="relative bg-white h-full w-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Request Subcontractor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Subcontractor Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SUB_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSubType(type.value)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg font-medium text-xs transition-colors ${
                      subType === type.value
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Type (if selected) */}
          {subType === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specify Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={otherType}
                onChange={(e) => setOtherType(e.target.value)}
                placeholder="E.g., Roofer, Flooring Specialist..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {URGENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setUrgency(option.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg font-medium text-sm transition-colors border-2 ${
                    urgency === option.value
                      ? `bg-${option.color}-100 text-${option.color}-800 border-${option.color}-500`
                      : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      urgency === option.value
                        ? `border-${option.color}-600 bg-${option.color}-600`
                        : 'border-gray-300'
                    }`}
                  >
                    {urgency === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What needs to be done? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Gas line compromised near water heater, needs immediate shutoff and repair..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              This request will be sent to your MIT Lead and the office. They'll coordinate scheduling and notify you when the sub is on the way.
            </p>
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
            onClick={handleSendRequest}
            disabled={!description.trim() || (subType === 'other' && !otherType.trim())}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              !description.trim() || (subType === 'other' && !otherType.trim())
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};
