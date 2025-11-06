import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Droplets, AlertCircle, Info, Camera } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';

interface CauseOfLossStepProps {
  job: any;
  onNext: () => void;
}

export const CauseOfLossStep: React.FC<CauseOfLossStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  const [causeType, setCauseType] = useState(installData.causeOfLoss?.type || '');
  const [causeLocation, setCauseLocation] = useState(installData.causeOfLoss?.location || '');
  const [causeNotes, setCauseNotes] = useState(installData.causeOfLoss?.notes || '');
  const [causePhoto, setCausePhoto] = useState<string | null>(installData.causeOfLoss?.photo || null);
  const [waterCategory, setWaterCategory] = useState<1 | 2 | 3 | null>(
    installData.waterClassification?.category || null
  );

  useEffect(() => {
    updateWorkflowData('install', {
      causeOfLoss: {
        type: causeType,
        location: causeLocation,
        notes: causeNotes,
        photo: causePhoto,
      },
      waterClassification: {
        category: waterCategory,
        determinedAt: new Date().toISOString(),
      },
    });
  }, [causeType, causeLocation, causeNotes, causePhoto, waterCategory]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadPhoto(file, job.jobId, 'cause-of-loss', 'assessment', user.uid);
      if (url) setCausePhoto(url);
    }
  };

  const causeTypes = [
    { value: 'Burst Pipe', examples: 'Supply line, drain pipe, fixture' },
    { value: 'Appliance Leak', examples: 'Dishwasher, washing machine, water heater' },
    { value: 'Roof Leak', examples: 'Missing shingles, ice dam, flashing failure' },
    { value: 'Flooding', examples: 'Natural disaster, storm surge, river overflow' },
    { value: 'Sewage Backup', examples: 'Main line blockage, septic failure' },
    { value: 'Ice Dam', examples: 'Gutter overflow, roof ice buildup' },
    { value: 'HVAC Leak', examples: 'AC condensation, furnace overflow' },
    { value: 'Tub/Sink Overflow', examples: 'Left running, clogged drain' },
    { value: 'Toilet Overflow', examples: 'Clog, supply line failure' },
    { value: 'Other', examples: 'Describe in notes' },
  ];

  const waterCategories = [
    {
      value: 1,
      title: 'Category 1 - Clean Water',
      description: 'From sanitary source, no health risk',
      examples: ['Broken water supply line', 'Tub overflow (clean water)', 'Melting ice/snow'],
      color: 'blue',
    },
    {
      value: 2,
      title: 'Category 2 - Gray Water',
      description: 'Contains contamination, potential health risk',
      examples: ['Washing machine overflow', 'Dishwasher overflow', 'Toilet (urine only)'],
      color: 'yellow',
    },
    {
      value: 3,
      title: 'Category 3 - Black Water',
      description: 'Grossly contaminated, serious health risk',
      examples: ['Sewage backup', 'Toilet (feces)', 'Rising flood water', 'Standing water with growth'],
      color: 'red',
    },
  ];

  const getColorClasses = (color: string, selected: boolean) => {
    const base = selected ? 'border-2' : 'border';
    if (color === 'blue') {
      return `${base} ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`;
    } else if (color === 'yellow') {
      return `${base} ${selected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`;
    } else if (color === 'red') {
      return `${base} ${selected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`;
    }
    return '';
  };

  const isComplete = causeType && causeLocation && causePhoto && waterCategory;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Document the Water Source</h4>
            <p className="text-sm text-blue-800">
              Identify what caused the water damage and determine the water category for proper safety protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Cause Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo of Cause *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {causePhoto ? (
            <div>
              <img src={causePhoto} alt="Cause of Loss" className="max-h-64 mx-auto mb-2 rounded" />
              <p className="text-sm text-green-600 font-medium mb-2">✓ Photo uploaded</p>
              <label className="btn-secondary cursor-pointer inline-block text-sm">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                Replace Photo
              </label>
            </div>
          ) : (
            <div>
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <label className="btn-primary cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? 'Uploading...' : 'Take Photo of Water Source'}
              </label>
              <p className="text-xs text-gray-500 mt-2">Photo required for insurance claim</p>
            </div>
          )}
        </div>
      </div>

      {/* Cause Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What Caused the Water Damage? *
        </label>
        <select
          value={causeType}
          onChange={(e) => setCauseType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:outline-none"
        >
          <option value="">Select cause of loss...</option>
          {causeTypes.map((cause) => (
            <option key={cause.value} value={cause.value}>
              {cause.value} - {cause.examples}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location of Source *
        </label>
        <input
          type="text"
          value={causeLocation}
          onChange={(e) => setCauseLocation(e.target.value)}
          placeholder="e.g., Kitchen sink supply line, Master bathroom toilet"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:outline-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={causeNotes}
          onChange={(e) => setCauseNotes(e.target.value)}
          rows={3}
          placeholder="Additional observations about the water source or circumstances..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:outline-none"
        />
      </div>

      {/* Water Category Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Water Category *</h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on the source, determine the contamination level. This affects safety protocols and equipment requirements.
        </p>
        <div className="space-y-3">
          {waterCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => setWaterCategory(category.value as 1 | 2 | 3)}
              className={`w-full text-left p-4 rounded-lg transition-all ${getColorClasses(
                category.color,
                waterCategory === category.value
              )}`}
            >
              <div className="flex items-start gap-3">
                <Droplets className={`w-5 h-5 flex-shrink-0 mt-1 ${
                  category.color === 'blue' ? 'text-blue-600' :
                  category.color === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{category.title}</h4>
                    {waterCategory === category.value && (
                      <span className="px-2 py-0.5 bg-entrusted-orange text-white text-xs rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{category.description}</p>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Examples:</p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {category.examples.map((example, idx) => (
                        <li key={idx}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category 2/3 Warning */}
      {(waterCategory === 2 || waterCategory === 3) && (
        <div className={`border rounded-lg p-4 ${
          waterCategory === 3 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              waterCategory === 3 ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <h4 className={`font-medium mb-1 ${
                waterCategory === 3 ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {waterCategory === 3 ? 'Category 3 Safety Requirements' : 'Category 2 Safety Requirements'}
              </h4>
              <ul className={`text-sm space-y-1 ${
                waterCategory === 3 ? 'text-red-800' : 'text-yellow-800'
              }`}>
                <li>✓ Air scrubbers required during drying</li>
                <li>✓ Enhanced PPE required (gloves, mask, protective clothing)</li>
                {waterCategory === 3 && (
                  <>
                    <li>✓ Containment barriers recommended</li>
                    <li>✓ Special disposal procedures for contaminated materials</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warning */}
      {!isComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                Please complete all required fields (photo, cause type, location, and water category) before continuing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
