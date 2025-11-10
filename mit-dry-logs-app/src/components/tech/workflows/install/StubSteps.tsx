// Stub components for Install workflow steps
// These will be fully implemented in the next iteration

import React, { useState } from 'react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { EquipmentCalculator } from '../../../shared/EquipmentCalculator';
import { ChamberCalculationResult } from '../../../../utils/iicrcCalculations';
import { useAuth } from '../../../../hooks/useAuth';
import { photoService } from '../../../../services/firebase/photoService';
import { Camera, Upload, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../shared/Button';
import { UniversalPhotoCapture } from '../../../shared/UniversalPhotoCapture';

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

export const AffectedRoomsStep: React.FC<StepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const rooms = installData.rooms || [];
  const [affectedMaterials, setAffectedMaterials] = useState<Record<string, string[]>>(
    installData.affectedMaterials || {}
  );

  const commonMaterials = [
    'Carpet',
    'Hardwood Floor',
    'Laminate Floor',
    'Tile Floor',
    'Vinyl Floor',
    'Drywall',
    'Baseboards',
    'Cabinets',
    'Countertops',
    'Ceiling',
    'Insulation',
    'Pad/Underlayment',
    'Paint',
    'Wallpaper',
    'Wood Trim',
    'Other',
  ];

  const toggleMaterial = (roomId: string, material: string) => {
    const roomMaterials = affectedMaterials[roomId] || [];
    const newMaterials = roomMaterials.includes(material)
      ? roomMaterials.filter(m => m !== material)
      : [...roomMaterials, material];

    const updated = {
      ...affectedMaterials,
      [roomId]: newMaterials,
    };

    setAffectedMaterials(updated);
    updateWorkflowData('install', { affectedMaterials: updated });
  };

  const getTotalAffectedMaterials = () => {
    return Object.values(affectedMaterials).reduce((sum, materials) => sum + materials.length, 0);
  };

  const getRoomMaterialCount = (roomId: string) => {
    return (affectedMaterials[roomId] || []).length;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Select affected materials for each room
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This helps determine the scope of work and drying strategy
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">{getTotalAffectedMaterials()}</p>
            <p className="text-xs text-blue-600">Total Materials</p>
          </div>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ No rooms have been added. Go back to Room Evaluation to add rooms first.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map((room: any) => {
            const roomMaterials = affectedMaterials[room.id] || [];
            const isComplete = roomMaterials.length > 0;

            return (
              <div
                key={room.id}
                className={`border-2 rounded-lg p-4 ${
                  isComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{room.name}</h4>
                    <p className="text-xs text-gray-600">
                      {room.squareFootage} sq ft • {roomMaterials.length} materials selected
                    </p>
                  </div>
                  {isComplete && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {commonMaterials.map((material) => {
                    const isSelected = roomMaterials.includes(material);

                    return (
                      <button
                        key={material}
                        onClick={() => toggleMaterial(room.id, material)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-entrusted-orange bg-orange-50 text-entrusted-orange'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{material}</span>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rooms.length > 0 && getTotalAffectedMaterials() === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select at least one affected material for each room.
          </p>
        </div>
      )}

      {rooms.length > 0 && getTotalAffectedMaterials() > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              Affected materials documented ({getTotalAffectedMaterials()} total across {rooms.length} rooms)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

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

export const EquipmentPlaceStep: React.FC<StepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const rooms = installData.rooms || [];
  const equipmentCalc = installData.equipmentCalculation;
  const [placedEquipment, setPlacedEquipment] = useState<Record<string, any[]>>(
    installData.placedEquipment || {}
  );
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [equipmentType, setEquipmentType] = useState<'dehumidifier' | 'air-mover' | 'air-scrubber'>('dehumidifier');
  const [equipmentId, setEquipmentId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [equipmentCondition, setEquipmentCondition] = useState<'good' | 'worn' | 'damaged'>('good');

  const handleQRScan = () => {
    // In production, this would open device camera for QR/barcode scanning
    // For now, prompt for manual entry
    const scannedId = prompt('Scan QR code or enter equipment ID:');
    if (scannedId) {
      setEquipmentId(scannedId);
      setIsScanning(false);
    }
  };

  const handleAddEquipment = () => {
    if (!currentRoom || !equipmentId.trim()) {
      alert('Please select a room and enter equipment ID');
      return;
    }

    const now = new Date();
    const roomEquipment = placedEquipment[currentRoom] || [];
    const newEquipment = {
      id: equipmentId,
      type: equipmentType,
      condition: equipmentCondition,
      placedAt: now.toISOString(),
      placedAtTimestamp: now.getTime(), // Unix timestamp for easy sorting/filtering
      placedBy: job.assignedTech || 'Unknown',
      placedAtFormatted: now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
    };

    const updated = {
      ...placedEquipment,
      [currentRoom]: [...roomEquipment, newEquipment],
    };

    setPlacedEquipment(updated);
    updateWorkflowData('install', { placedEquipment: updated });
    setEquipmentId('');
    setEquipmentCondition('good');
  };

  const handleRemoveEquipment = (roomId: string, equipmentId: string) => {
    const roomEquipment = placedEquipment[roomId] || [];
    const updated = {
      ...placedEquipment,
      [roomId]: roomEquipment.filter(e => e.id !== equipmentId),
    };
    setPlacedEquipment(updated);
    updateWorkflowData('install', { placedEquipment: updated });
  };

  const getTotalPlaced = (type?: string) => {
    return Object.values(placedEquipment).reduce((sum, items) => {
      return sum + (type ? items.filter(i => i.type === type).length : items.length);
    }, 0);
  };

  const getProgress = () => {
    const totalRequired = (equipmentCalc?.dehumidifiers?.dehumidifierCount || 0) +
                         (equipmentCalc?.airMovers?.totalCount || 0) +
                         (equipmentCalc?.airScrubbers?.count || 0);
    const totalPlaced = getTotalPlaced();
    return totalRequired > 0 ? (totalPlaced / totalRequired) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-entrusted-orange to-orange-600 text-white rounded-lg p-6">
        <h3 className="text-xl font-poppins font-bold mb-2">Equipment Placement</h3>
        <p className="text-orange-100 text-sm">
          Track equipment placement according to the IICRC-calculated requirements
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Placement Progress</span>
            <span className="font-bold">{Math.round(getProgress())}%</span>
          </div>
          <div className="w-full bg-orange-800 bg-opacity-50 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {equipmentCalc && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">
              {getTotalPlaced('dehumidifier')}/{equipmentCalc.dehumidifiers.dehumidifierCount}
            </p>
            <p className="text-xs text-gray-600">Dehumidifiers</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-900">
              {getTotalPlaced('air-mover')}/{equipmentCalc.airMovers.totalCount}
            </p>
            <p className="text-xs text-gray-600">Air Movers</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-900">
              {getTotalPlaced('air-scrubber')}/{equipmentCalc.airScrubbers.count}
            </p>
            <p className="text-xs text-gray-600">Air Scrubbers</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Add Equipment</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room *
            </label>
            <select
              value={currentRoom}
              onChange={(e) => setCurrentRoom(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a room...</option>
              {rooms.map((room: any) => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.squareFootage} sq ft)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['dehumidifier', 'air-mover', 'air-scrubber'].map((type) => (
                <button
                  key={type}
                  onClick={() => setEquipmentType(type as any)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    equipmentType === type
                      ? 'border-entrusted-orange bg-orange-50 text-entrusted-orange'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Condition *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'good' as const, label: 'Good', color: 'green' },
                { value: 'worn' as const, label: 'Worn', color: 'yellow' },
                { value: 'damaged' as const, label: 'Damaged', color: 'red' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setEquipmentCondition(value)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    equipmentCondition === value
                      ? `border-${color}-500 bg-${color}-50 text-${color}-900`
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Document equipment condition for billing disputes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment ID / Serial Number *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                placeholder="Enter ID or scan QR code..."
                className="input-field flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEquipment();
                  }
                }}
              />
              <Button
                variant="secondary"
                onClick={handleQRScan}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Camera className="w-4 h-4" />
                Scan QR
              </Button>
              <Button variant="primary" onClick={handleAddEquipment}>
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ⏱️ Timestamp will be recorded automatically for billing verification
            </p>
          </div>
        </div>
      </div>

      {rooms.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Equipment by Room</h4>
          {rooms.map((room: any) => {
            const roomEquipment = placedEquipment[room.id] || [];

            return (
              <div
                key={room.id}
                className={`border-2 rounded-lg p-4 ${
                  roomEquipment.length > 0 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-900">{room.name}</h5>
                    <p className="text-xs text-gray-600">{roomEquipment.length} pieces of equipment</p>
                  </div>
                  {roomEquipment.length > 0 && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>

                {roomEquipment.length > 0 ? (
                  <div className="space-y-2">
                    {roomEquipment.map((equipment, index) => {
                      const conditionColors = {
                        good: 'bg-green-100 text-green-800 border-green-300',
                        worn: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                        damaged: 'bg-red-100 text-red-800 border-red-300',
                      };
                      const conditionColor = conditionColors[equipment.condition as keyof typeof conditionColors] || conditionColors.good;

                      return (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 bg-white rounded border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">{equipment.id}</p>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${conditionColor}`}>
                                {equipment.condition || 'good'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {equipment.type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span className="font-medium">Placed:</span>
                              <span>{equipment.placedAtFormatted || new Date(equipment.placedAt).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveEquipment(room.id, equipment.id)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded flex-shrink-0"
                          >
                            <span className="text-sm">Remove</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No equipment placed yet</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {getTotalPlaced() === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ No equipment has been placed yet. Add equipment using the form above.
          </p>
        </div>
      )}

      {equipmentCalc && getProgress() >= 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              All equipment placed according to IICRC calculations!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const CommunicatePlanStep: React.FC<StepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const [customerAgreed, setCustomerAgreed] = useState(installData.customerAgreed || false);
  const [customerNotes, setCustomerNotes] = useState(installData.customerNotes || '');
  const [customerSignature, setCustomerSignature] = useState(installData.customerSignature || '');

  const rooms = installData.rooms || [];
  const equipmentCalc = installData.equipmentCalculation;

  const handleAgreementChange = (agreed: boolean) => {
    setCustomerAgreed(agreed);
    updateWorkflowData('install', { customerAgreed: agreed });
  };

  const handleNotesChange = (notes: string) => {
    setCustomerNotes(notes);
    updateWorkflowData('install', { customerNotes: notes });
  };

  const planSummary = {
    rooms: rooms.length,
    totalSqFt: rooms.reduce((sum: number, r: any) => sum + parseFloat(r.squareFootage || 0), 0),
    dehumidifiers: equipmentCalc?.dehumidifiers?.dehumidifierCount || 0,
    airMovers: equipmentCalc?.airMovers?.totalCount || 0,
    airScrubbers: equipmentCalc?.airScrubbers?.count || 0,
    dryingDays: equipmentCalc?.estimatedDryingDays || 0,
  };

  const customerExpectations = [
    'Equipment will run 24/7 for optimal drying',
    'Daily monitoring visits will be conducted',
    'Do not turn off or unplug equipment',
    'Keep doors closed to affected areas',
    'Report any changes or concerns immediately',
    'Elevated noise levels are normal during drying',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-entrusted-orange to-orange-600 text-white rounded-lg p-6">
        <h3 className="text-xl font-poppins font-bold mb-2">Mitigation Plan Summary</h3>
        <p className="text-orange-100 text-sm">
          Review this plan with {job.customerInfo.name} and ensure they understand the process
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Scope of Work</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-900">{planSummary.rooms}</p>
            <p className="text-xs text-gray-600">Affected Rooms</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-900">{planSummary.totalSqFt.toFixed(0)}</p>
            <p className="text-xs text-gray-600">Total Sq Ft</p>
          </div>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">Equipment Being Installed</h4>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="text-xl font-bold text-green-900">{planSummary.dehumidifiers}</p>
            <p className="text-xs text-gray-600">Dehumidifiers</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="text-xl font-bold text-green-900">{planSummary.airMovers}</p>
            <p className="text-xs text-gray-600">Air Movers</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="text-xl font-bold text-green-900">{planSummary.airScrubbers}</p>
            <p className="text-xs text-gray-600">Air Scrubbers</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Estimated Drying Time:</strong> {planSummary.dryingDays} days
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Based on IICRC S500 standards and current conditions
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Customer Expectations</h4>
        <ul className="space-y-2">
          {customerExpectations.map((expectation, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{expectation}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Customer Agreement</h4>

        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-entrusted-orange transition-colors">
            <input
              type="checkbox"
              checked={customerAgreed}
              onChange={(e) => handleAgreementChange(e.target.checked)}
              className="w-5 h-5 rounded text-entrusted-orange"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 block">
                Customer understands and agrees to the mitigation plan
              </span>
              <span className="text-xs text-gray-600">
                Equipment placement, drying timeline, and expectations discussed
              </span>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Questions or Concerns (Optional)
          </label>
          <textarea
            value={customerNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Document any questions, concerns, or special requests from the customer..."
            className="input-field min-h-[100px]"
            rows={4}
          />
        </div>
      </div>

      {!customerAgreed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Customer agreement required before proceeding to equipment installation.
          </p>
        </div>
      )}

      {customerAgreed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              Customer has reviewed and agreed to the mitigation plan
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// FinalPhotosStep moved to separate file for room-by-room photos
// Export is now in ./FinalPhotosStep.tsx

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
  const { installData, updateWorkflowData } = useWorkflowStore();

  // Get current time as default
  const now = new Date();
  const defaultTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const [departureTime, setDepartureTime] = useState(installData.departureTime || defaultTime);
  const [travelTimeFromSite, setTravelTimeFromSite] = useState(installData.travelTimeFromSite || 0);
  const [techNotes, setTechNotes] = useState(installData.completionNotes || '');

  // Customer Signature
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(installData.customerSignature || null);
  const [customerName, setCustomerName] = useState(installData.customerSignatureName || job.customerInfo?.name || '');

  // Timestamps - initialized once and never change (prevents infinite loop)
  const [completedAt] = useState(() => installData.completedAt || new Date().toISOString());
  const [signatureTimestamp, setSignatureTimestamp] = useState(() => installData.customerSignatureTimestamp || null);

  // ULTRAFAULT: Track last saved state to prevent duplicate saves
  const lastSavedStateRef = React.useRef<string | null>(null);

  // ULTRAFAULT: Calculate labor hours with memoization to prevent infinite loops
  // Only recalculate when actual dependencies change
  const calculateLaborHours = React.useCallback(() => {
    if (!installData.arrivalTime || !departureTime) return null;

    try {
      const arrival = new Date();
      const [arrHours, arrMinutes] = installData.arrivalTime.split(':').map(Number);
      arrival.setHours(arrHours, arrMinutes, 0, 0);

      const departure = new Date();
      const [depHours, depMinutes] = departureTime.split(':').map(Number);
      departure.setHours(depHours, depMinutes, 0, 0);

      // If departure is before arrival, assume next day
      if (departure < arrival) {
        departure.setDate(departure.getDate() + 1);
      }

      const totalMinutes = Math.floor((departure.getTime() - arrival.getTime()) / 1000 / 60);
      const totalHours = totalMinutes / 60;

      // Calculate during hours (8 AM - 5 PM) and after hours
      let duringHours = 0;
      let afterHours = 0;

      // Simple calculation: if most of work falls in 8-5, count as during, else after
      const avgHour = (arrHours + depHours) / 2;
      if (avgHour >= 8 && avgHour < 17) {
        // Work mostly during business hours
        duringHours = totalHours;
      } else {
        // Work mostly after hours
        afterHours = totalHours;
      }

      return {
        totalHours: parseFloat(totalHours.toFixed(2)),
        duringHours: parseFloat(duringHours.toFixed(2)),
        afterHours: parseFloat(afterHours.toFixed(2)),
        arrivalTime: installData.arrivalTime,
        departureTime,
      };
    } catch (error) {
      console.error('Error calculating labor hours:', error);
      return null;
    }
  }, [installData.arrivalTime, departureTime]);

  // ULTRAFAULT: Memoize labor summary to prevent recalculation on every render
  const laborSummary = React.useMemo(() => {
    return calculateLaborHours();
  }, [calculateLaborHours]);

  // Signature canvas functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignature(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignature(null);
  };

  // Update signature timestamp when signature is created
  React.useEffect(() => {
    if (signature && !signatureTimestamp) {
      // Signature was just created, set timestamp in state
      setSignatureTimestamp(new Date().toISOString());
    }
  }, [signature, signatureTimestamp]);

  // ULTRAFAULT: Auto-save when state changes with deep comparison and debouncing
  React.useEffect(() => {
    console.log('✅ CompleteStep: State change detected, preparing to save');

    // Debounce rapid changes
    const timeoutId = setTimeout(() => {
      const dataToSave = {
        departureTime,
        travelTimeFromSite,
        completionNotes: techNotes,
        laborSummary,
        customerSignature: signature,
        customerSignatureName: customerName,
        customerSignatureTimestamp: signatureTimestamp,
        completedAt,
      };

      // CRITICAL FIX: Deep comparison to prevent infinite loops
      const dataString = JSON.stringify(dataToSave);
      if (dataString !== lastSavedStateRef.current) {
        console.log('✅ CompleteStep: Data changed, saving to workflow store');
        lastSavedStateRef.current = dataString;
        updateWorkflowData('install', dataToSave);
      } else {
        console.log('✅ CompleteStep: Data unchanged, skipping save');
      }
    }, 200); // 200ms debounce for better UX

    return () => clearTimeout(timeoutId);
    // Safe to depend on memoized laborSummary now
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureTime, travelTimeFromSite, techNotes, laborSummary, signature, customerName, completedAt, signatureTimestamp]);

  const handleFinalize = () => {
    // useEffect will auto-save before navigation
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

      {/* Labor Hours Tracking */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Labor Hours</h4>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arrival Time
            </label>
            <input
              type="time"
              value={installData.arrivalTime || ''}
              disabled
              className="input-field bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Recorded at arrival</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departure Time *
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Time leaving property</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Time from Site (minutes)
          </label>
          <input
            type="number"
            value={travelTimeFromSite}
            onChange={(e) => setTravelTimeFromSite(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="input-field w-32"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Drive time back to office/home</p>
        </div>

        {laborSummary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-3">Labor Summary</h5>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{laborSummary.totalHours}</p>
                <p className="text-xs text-gray-600">Total Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{laborSummary.duringHours}</p>
                <p className="text-xs text-gray-600">During Hours<br/>(8 AM - 5 PM)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{laborSummary.afterHours}</p>
                <p className="text-xs text-gray-600">After Hours</p>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-3 text-center">
              {installData.arrivalTime} → {departureTime} = {laborSummary.totalHours} hours on-site
            </p>
          </div>
        )}
      </div>

      {/* Installation Summary */}
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

      {/* Completion Notes */}
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

      {/* Customer Signature Capture */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-entrusted-orange" />
          <h4 className="font-semibold text-gray-900">Customer Signature *</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Customer signature confirms work completion and equipment placement. Required for dispute prevention.
        </p>

        {/* Customer Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className="input-field"
          />
        </div>

        {/* Signature Pad */}
        <div className="border-2 border-gray-300 rounded-lg bg-white">
          <div className="p-2 bg-gray-50 border-b-2 border-gray-300 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Sign below:</p>
            <button
              onClick={clearSignature}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear
            </button>
          </div>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full touch-none cursor-crosshair"
              style={{ touchAction: 'none' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!signature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm">Draw signature here</p>
              </div>
            )}
          </div>
        </div>

        {signature && (
          <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Signature Captured</p>
              <p className="text-xs text-green-700 mt-1">
                Signed by: <strong>{customerName}</strong> on {new Date().toLocaleString()}
              </p>
              <p className="text-xs text-green-700">
                This digital signature has the same legal weight as a handwritten signature.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
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

      {/* Finalize Button */}
      <Button
        variant="primary"
        onClick={handleFinalize}
        className="w-full py-4 text-lg"
        disabled={!departureTime || !signature || !customerName.trim()}
      >
        <CheckCircle className="w-5 h-5" />
        Finalize and Return to Dashboard
      </Button>

      {(!departureTime || !signature || !customerName.trim()) && (
        <div className="text-sm text-red-600 text-center space-y-1">
          <p className="font-medium">Required before finalizing:</p>
          <ul className="text-xs">
            {!departureTime && <li>• Enter departure time</li>}
            {!signature && <li>• Capture customer signature</li>}
            {!customerName.trim() && <li>• Enter customer name</li>}
          </ul>
        </div>
      )}
    </div>
  );
};
