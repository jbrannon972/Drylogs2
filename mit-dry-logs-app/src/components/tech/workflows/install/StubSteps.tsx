// Stub components for Install workflow steps
// These will be fully implemented in the next iteration

import React, { useState } from 'react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { EquipmentCalculator } from '../../../shared/EquipmentCalculator';
import { ChamberCalculationResult } from '../../../../utils/iicrcCalculations';
import { useAuth } from '../../../../hooks/useAuth';
import { photoService } from '../../../../services/firebase/photoService';
import { Camera, Upload, CheckCircle } from 'lucide-react';
import { Button } from '../../../shared/Button';

interface StepProps {
  job: any;
  onNext: () => void;
}

export const PreExistingStep: React.FC<StepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { installData, updateWorkflowData } = useWorkflowStore();
  const [hasPreExisting, setHasPreExisting] = useState(installData.hasPreExisting ?? true);
  const [preExistingNotes, setPreExistingNotes] = useState(installData.preExistingNotes || '');
  const [preExistingPhotos, setPreExistingPhotos] = useState<string[]>(installData.preExistingPhotos || []);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setUploading(true);
      try {
        const url = await photoService.uploadPhoto(file, job.jobId, 'pre-existing', 'assessment', user.uid);
        if (url) {
          const newPhotos = [...preExistingPhotos, url];
          setPreExistingPhotos(newPhotos);
          updateWorkflowData('install', { preExistingPhotos: newPhotos });
        }
      } catch (error) {
        console.error('Photo upload failed:', error);
        alert('Failed to upload photo. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = () => {
    updateWorkflowData('install', {
      hasPreExisting,
      preExistingNotes,
      preExistingPhotos,
    });
  };

  return (
    <div className="space-y-6" onBlur={handleSave}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          📋 Document any damage, stains, or issues that existed BEFORE the water loss to protect against liability.
        </p>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasPreExisting}
            onChange={(e) => {
              setHasPreExisting(e.target.checked);
              updateWorkflowData('install', { hasPreExisting: e.target.checked });
            }}
            className="w-5 h-5 rounded text-entrusted-orange"
          />
          <span className="text-sm font-medium text-gray-700">
            Pre-existing conditions found
          </span>
        </label>
      </div>

      {hasPreExisting && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description of Pre-Existing Conditions *
            </label>
            <textarea
              value={preExistingNotes}
              onChange={(e) => {
                setPreExistingNotes(e.target.value);
                updateWorkflowData('install', { preExistingNotes: e.target.value });
              }}
              placeholder="Describe pre-existing damage, stains, cracks, or other issues..."
              className="input-field min-h-[100px]"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Examples: Water stains on ceiling, cracked tiles, carpet wear, etc.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos of Pre-Existing Conditions *
            </label>
            <div className="space-y-3">
              {preExistingPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Pre-existing condition ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-green-500"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-400 animate-bounce" />
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Tap to capture</span> pre-existing conditions
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {preExistingPhotos.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Please upload at least one photo of pre-existing conditions for documentation.
              </p>
            </div>
          )}
        </>
      )}

      {!hasPreExisting && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              No pre-existing conditions found
            </p>
          </div>
        </div>
      )}

      {hasPreExisting && preExistingNotes && preExistingPhotos.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              Pre-existing conditions documented successfully
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const CauseOfLossStep: React.FC<StepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { installData, updateWorkflowData } = useWorkflowStore();
  const [causeType, setCauseType] = useState(installData.causeType || '');
  const [causeDescription, setCauseDescription] = useState(installData.causeDescription || '');
  const [causePhotos, setCausePhotos] = useState<string[]>(installData.causePhotos || []);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setUploading(true);
      try {
        const url = await photoService.uploadPhoto(file, job.jobId, 'cause-of-loss', 'assessment', user.uid);
        if (url) {
          const newPhotos = [...causePhotos, url];
          setCausePhotos(newPhotos);
          updateWorkflowData('install', { causePhotos: newPhotos });
        }
      } catch (error) {
        console.error('Photo upload failed:', error);
        alert('Failed to upload photo. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = () => {
    updateWorkflowData('install', {
      causeType,
      causeDescription,
      causePhotos,
    });
  };

  const causeTypes = [
    'Burst Pipe',
    'Leaking Pipe',
    'Toilet Overflow',
    'Appliance Leak',
    'Water Heater',
    'Roof Leak',
    'Storm Damage',
    'Sewer Backup',
    'Other',
  ];

  return (
    <div className="space-y-6" onBlur={handleSave}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type of Loss *
        </label>
        <select
          value={causeType}
          onChange={(e) => {
            setCauseType(e.target.value);
            updateWorkflowData('install', { causeType: e.target.value });
          }}
          className="input-field"
        >
          <option value="">Select cause type...</option>
          {causeTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={causeDescription}
          onChange={(e) => {
            setCauseDescription(e.target.value);
            updateWorkflowData('install', { causeDescription: e.target.value });
          }}
          placeholder="Describe the cause of loss in detail..."
          className="input-field min-h-[100px]"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos of Cause * (minimum 2)
        </label>
        <div className="space-y-3">
          {causePhotos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={photo}
                alt={`Cause of loss ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg border-2 border-green-500"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          ))}

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Upload className="w-8 h-8 mb-2 text-gray-400 animate-bounce" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Tap to capture</span> cause of loss
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {causePhotos.length < 2 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please upload at least 2 photos of the cause of loss for documentation.
          </p>
        </div>
      )}

      {causeType && causeDescription && causePhotos.length >= 2 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              Cause of loss documented successfully
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const AffectedRoomsStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Document materials affected in each room.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Affected materials interface coming soon...</p>
    </div>
  </div>
);

export const EquipmentCalcStep: React.FC<StepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const rooms = installData.rooms || [];

  const handleCalculationComplete = (result: ChamberCalculationResult) => {
    updateWorkflowData('install', { equipmentCalculation: result });
  };

  return (
    <div>
      <p className="text-gray-600 mb-4">
        Calculate equipment needs using IICRC S500-2021 standards based on the rooms you've documented.
      </p>

      <EquipmentCalculator
        rooms={rooms}
        waterCategory={job.insuranceInfo?.categoryOfWater || 'Category 1'}
        onCalculationComplete={handleCalculationComplete}
      />

      {rooms.length === 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ No rooms have been added yet. Go back to the Room Evaluation step to add rooms before calculating equipment needs.
          </p>
        </div>
      )}
    </div>
  );
};

export const EquipmentPlaceStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Place and scan equipment in designated chambers.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Equipment placement and scanning coming soon...</p>
    </div>
  </div>
);

export const CommunicatePlanStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Review the mitigation plan with the customer.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Plan communication interface coming soon...</p>
    </div>
  </div>
);

export const FinalPhotosStep: React.FC<StepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { installData, updateWorkflowData } = useWorkflowStore();
  const [finalPhotos, setFinalPhotos] = useState<string[]>(installData.finalPhotos || []);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setUploading(true);
      try {
        const url = await photoService.uploadPhoto(file, job.jobId, 'final-setup', 'final', user.uid);
        if (url) {
          const newPhotos = [...finalPhotos, url];
          setFinalPhotos(newPhotos);
          updateWorkflowData('install', { finalPhotos: newPhotos });
        }
      } catch (error) {
        console.error('Photo upload failed:', error);
        alert('Failed to upload photo. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const photoChecklist = [
    'Each room with equipment in place',
    'Dehumidifiers positioned correctly',
    'Air movers covering affected areas',
    'Power cords and extension cords',
    'Air scrubbers (if applicable)',
    'Overall setup overview',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          📸 Final Documentation Checklist
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          {photoChecklist.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Final Setup Photos * (minimum 4)
        </label>
        <div className="space-y-3">
          {finalPhotos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={photo}
                alt={`Final setup ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg border-2 border-green-500"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                Photo {index + 1} of {finalPhotos.length}
              </div>
            </div>
          ))}

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Upload className="w-8 h-8 mb-2 text-gray-400 animate-bounce" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Tap to capture</span> final setup
                  </p>
                  <p className="text-xs text-gray-400">
                    {finalPhotos.length} / 4 minimum photos
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {finalPhotos.length < 4 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please upload at least 4 photos documenting the final equipment setup ({4 - finalPhotos.length} more needed).
          </p>
        </div>
      )}

      {finalPhotos.length >= 4 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              Final documentation complete ({finalPhotos.length} photos captured)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const ReviewStep: React.FC<StepProps> = ({ job, onNext }) => {
  const { installData } = useWorkflowStore();
  const rooms = installData.rooms || [];
  const equipmentCalc = installData.equipmentCalculation;

  const sections = [
    {
      title: 'Pre-Existing Conditions',
      icon: <Camera className="w-5 h-5" />,
      complete: installData.hasPreExisting !== undefined,
      data: installData.hasPreExisting
        ? `${installData.preExistingPhotos?.length || 0} photos, Notes: ${installData.preExistingNotes?.substring(0, 50)}...`
        : 'No pre-existing conditions found',
    },
    {
      title: 'Cause of Loss',
      icon: <Camera className="w-5 h-5" />,
      complete: Boolean(installData.causeType && installData.causeDescription),
      data: installData.causeType
        ? `${installData.causeType} - ${installData.causePhotos?.length || 0} photos`
        : 'Not documented',
    },
    {
      title: 'Room Evaluation',
      icon: <CheckCircle className="w-5 h-5" />,
      complete: rooms.length > 0,
      data: rooms.length > 0
        ? `${rooms.length} rooms evaluated (${rooms.reduce((sum: number, r: any) => sum + parseFloat(r.squareFootage || 0), 0).toFixed(0)} sq ft total)`
        : 'No rooms added',
    },
    {
      title: 'Equipment Calculation',
      icon: <CheckCircle className="w-5 h-5" />,
      complete: Boolean(equipmentCalc),
      data: equipmentCalc
        ? `${equipmentCalc.dehumidifiers.dehumidifierCount} dehumidifiers, ${equipmentCalc.airMovers.totalCount} air movers, ${equipmentCalc.airScrubbers.count} air scrubbers`
        : 'Not calculated',
    },
    {
      title: 'Final Photos',
      icon: <Camera className="w-5 h-5" />,
      complete: (installData.finalPhotos?.length || 0) >= 4,
      data: `${installData.finalPhotos?.length || 0} photos captured`,
    },
  ];

  const allComplete = sections.every(s => s.complete);
  const completionPercentage = (sections.filter(s => s.complete).length / sections.length) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-entrusted-orange to-orange-600 text-white rounded-lg p-6">
        <h3 className="text-2xl font-poppins font-bold mb-2">Install Review</h3>
        <p className="text-orange-100">
          Review all collected data before completing the install workflow
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Completion Progress</span>
            <span className="font-bold">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-orange-800 bg-opacity-50 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${
              section.complete
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  section.complete ? 'bg-green-100' : 'bg-yellow-100'
                }`}
              >
                {section.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{section.title}</h4>
                  {section.complete ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <span className="text-xs font-medium text-yellow-600 px-2 py-1 bg-yellow-100 rounded">
                      Incomplete
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{section.data}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rooms.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Rooms Summary</h4>
          <div className="space-y-2">
            {rooms.map((room: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm py-2 border-b last:border-b-0">
                <span className="text-gray-900">{room.name}</span>
                <span className="text-gray-600">{room.squareFootage} sq ft</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {equipmentCalc && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Equipment Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-900">{equipmentCalc.dehumidifiers.dehumidifierCount}</p>
              <p className="text-xs text-gray-600">Dehumidifiers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{equipmentCalc.airMovers.totalCount}</p>
              <p className="text-xs text-gray-600">Air Movers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{equipmentCalc.airScrubbers.count}</p>
              <p className="text-xs text-gray-600">Air Scrubbers</p>
            </div>
          </div>
        </div>
      )}

      {!allComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Some sections are incomplete. Please go back and complete all required steps before finalizing the install.
          </p>
        </div>
      )}

      {allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              All sections complete! Ready to finalize the install.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const CompleteStep: React.FC<StepProps> = ({ job, onNext }) => {
  const { installData } = useWorkflowStore();
  const [clockOutTime, setClockOutTime] = useState(new Date().toLocaleTimeString());
  const [techNotes, setTechNotes] = useState(installData.completionNotes || '');

  const handleFinalize = () => {
    // In a real app, this would save to Firebase
    alert('Install workflow completed successfully! Returning to dashboard...');
    window.location.href = '/tech';
  };

  const summary = {
    rooms: installData.rooms?.length || 0,
    totalSqFt: installData.rooms?.reduce((sum: number, r: any) => sum + parseFloat(r.squareFootage || 0), 0) || 0,
    dehumidifiers: installData.equipmentCalculation?.dehumidifiers?.dehumidifierCount || 0,
    airMovers: installData.equipmentCalculation?.airMovers?.totalCount || 0,
    airScrubbers: installData.equipmentCalculation?.airScrubbers?.count || 0,
    photos: (installData.preExistingPhotos?.length || 0) +
            (installData.causePhotos?.length || 0) +
            (installData.finalPhotos?.length || 0),
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4" />
        <h3 className="text-3xl font-poppins font-bold mb-2">Install Complete!</h3>
        <p className="text-green-100">
          Great work! All steps have been completed successfully.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Installation Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-900">{summary.rooms}</p>
            <p className="text-sm text-gray-600">Rooms Evaluated</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-900">{summary.totalSqFt.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Total Sq Ft</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-900">{summary.dehumidifiers}</p>
            <p className="text-sm text-gray-600">Dehumidifiers</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-900">{summary.airMovers}</p>
            <p className="text-sm text-gray-600">Air Movers</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-900">{summary.airScrubbers}</p>
            <p className="text-sm text-gray-600">Air Scrubbers</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-900">{summary.photos}</p>
            <p className="text-sm text-gray-600">Photos Captured</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clock Out Time
        </label>
        <input
          type="time"
          value={clockOutTime}
          onChange={(e) => setClockOutTime(e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Completion Notes (Optional)
        </label>
        <textarea
          value={techNotes}
          onChange={(e) => setTechNotes(e.target.value)}
          placeholder="Any additional notes about the installation..."
          className="input-field min-h-[100px]"
          rows={4}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Next Steps:</strong>
        </p>
        <ul className="text-sm text-blue-800 space-y-1 mt-2 ml-4">
          <li>• Equipment will be monitored daily during Check Service visits</li>
          <li>• Customer has been provided with safety information</li>
          <li>• All documentation will be synced to the office</li>
          <li>• Work order will be available for Lead review</li>
        </ul>
      </div>

      <Button
        variant="primary"
        onClick={handleFinalize}
        className="w-full py-4 text-lg"
      >
        <CheckCircle className="w-5 h-5" />
        Finalize and Return to Dashboard
      </Button>
    </div>
  );
};
