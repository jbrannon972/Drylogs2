import React, { useState } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import {
  Droplets,
  Camera,
  CheckCircle,
  MapPin,
  Trash2,
  Plus
} from 'lucide-react';
import { useBatchPhotos } from '../../../../hooks/useBatchPhotos';
import { useAuth } from '../../../../hooks/useAuth';
import {
  ConstructionMaterialType,
  MaterialMoistureTracking,
  MoistureReadingEntry,
  isMaterialDry
} from '../../../../types';

interface MoistureTabContentProps {
  job: any;
  roomId: string;
  roomName: string;
  moistureTracking: MaterialMoistureTracking[];
  onUpdate: (updatedTracking: MaterialMoistureTracking[]) => void;
}

export const MoistureTabContent: React.FC<MoistureTabContentProps> = ({
  job,
  roomId,
  roomName,
  moistureTracking,
  onUpdate,
}) => {
  const { user } = useAuth();
  const { queuePhoto } = useBatchPhotos();

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<ConstructionMaterialType>('Drywall - Wall');
  const [location, setLocation] = useState('');
  const [dryStandard, setDryStandard] = useState('');
  const [wetReading, setWetReading] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Construction materials only (no appliances, mirrors, etc.)
  const CONSTRUCTION_MATERIALS: ConstructionMaterialType[] = [
    'Drywall - Wall',
    'Drywall - Ceiling',
    'Carpet & Pad',
    'Hardwood Flooring',
    'Vinyl/Linoleum Flooring',
    'Tile Flooring',
    'Laminate Flooring',
    'Engineered Flooring',
    'Subfloor',
    'Baseboards',
    'Shoe Molding',
    'Crown Molding',
    'Door Casing',
    'Window Casing',
    'Chair Rail',
    'Other Trim',
    'Insulation - Wall',
    'Insulation - Ceiling/Attic',
    'Tile Walls',
    'Backsplash',
    'Tub Surround',
    'Base Cabinets',
    'Upper Cabinets',
    'Vanity',
    'Countertops',
    'Shelving',
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      // Queue photo instead of uploading immediately
      await queuePhoto(file, job.jobId, roomId, roomName, 'assessment');

      // Create preview for display
      const reader = new FileReader();
      reader.onload = (e) => setPhoto(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCurrentMaterial('Drywall - Wall');
    setLocation('');
    setDryStandard('');
    setWetReading('');
    setPhoto(null);
    setNotes('');
    setShowAddForm(false);
  };

  const handleSaveReading = () => {
    // PHASE 1 VALIDATION: Photo is REQUIRED and must be first
    if (!photo) {
      alert('Photo is required! Please take a photo showing the moisture meter display and the material being tested.');
      return;
    }

    if (!dryStandard || !wetReading) {
      alert('Please complete all required fields: Dry Standard and Wet Reading');
      return;
    }

    const dryStandardNum = parseFloat(dryStandard);
    const wetReadingNum = parseFloat(wetReading);

    if (isNaN(dryStandardNum) || isNaN(wetReadingNum)) {
      alert('Please enter valid numbers for moisture readings');
      return;
    }

    // Create initial reading entry
    const initialReading: MoistureReadingEntry = {
      timestamp: new Date().toISOString(),
      moisturePercent: wetReadingNum,
      photo: photo || undefined,
      technicianId: user?.uid || 'unknown',
      technicianName: user?.displayName || 'Unknown Tech',
      workflowPhase: 'install',
      notes,
    };

    // Create moisture tracking record
    const tracking: MaterialMoistureTracking = {
      id: `${roomId}-${currentMaterial}-${Date.now()}`,
      roomId,
      roomName,
      material: currentMaterial,
      location,
      dryStandard: dryStandardNum,
      readings: [initialReading],
      createdAt: new Date().toISOString(),
      lastReadingAt: new Date().toISOString(),
      status: isMaterialDry(wetReadingNum, dryStandardNum) ? 'dry' : 'wet',
      trend: 'unknown',
    };

    onUpdate([...moistureTracking, tracking]);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      onUpdate(moistureTracking.filter(t => t.id !== recordToDelete));
      setRecordToDelete(null);
    }
  };

  // Get readings for this room only
  const roomReadings = moistureTracking.filter(t => t.roomId === roomId);

  return (
    <div className="w-full h-full space-y-6">
      {/* Existing Readings */}
      {roomReadings.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">
            Tracked Materials ({roomReadings.length})
          </h4>
          {roomReadings.map((tracking) => {
            const lastReading = tracking.readings[tracking.readings.length - 1];
            const isDry = isMaterialDry(lastReading.moisturePercent, tracking.dryStandard);

            return (
              <div
                key={tracking.id}
                className={`border-l-4 rounded-lg p-4 ${
                  isDry ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        isDry ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
                      }`}>
                        {isDry ? '✓ DRY' : '✗ WET'}
                      </span>
                      <span className="font-medium text-gray-900">{tracking.material}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {tracking.location || 'No location specified'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Dry Standard:</span>
                        <span className="font-bold ml-1">{tracking.dryStandard}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Current:</span>
                        <span className="font-bold ml-1">{lastReading.moisturePercent}%</span>
                      </div>
                    </div>
                    {lastReading.photo && (
                      <div className="mt-2">
                        <img src={lastReading.photo} alt="Meter" className="max-h-24 rounded" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(tracking.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No readings yet */}
      {roomReadings.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <Droplets className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No moisture readings yet</p>
          <p className="text-sm mt-1">Add a material to start tracking</p>
        </div>
      )}

      {/* Add New Reading Form - Full Screen Single Form */}
      {showAddForm && (
        <div className="border-2 border-entrusted-orange rounded-lg p-6 bg-orange-50 space-y-5">
          <h3 className="font-semibold text-gray-900 text-lg mb-4">
            Add Moisture Reading
          </h3>

          {/* Photo Upload - PHASE 1: FIRST and REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="w-4 h-4 inline mr-1" />
              Photo (Required) *
            </label>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-orange-900">
                <strong>Take photo first!</strong> Frame shot to show moisture meter display AND material surface clearly.
              </p>
            </div>
            {photo ? (
              <div>
                <img src={photo} alt="Moisture Meter" className="max-h-48 rounded mb-3" />
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Photo queued</span>
                </div>
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 justify-center px-4 py-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Camera className="w-4 h-4" />
                  Replace Photo
                </label>
              </div>
            ) : (
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 w-full justify-center py-6 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Camera className="w-5 h-5" />
                Take Photo
              </label>
            )}
          </div>

          {/* Material Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Construction Material *
            </label>
            <select
              value={currentMaterial}
              onChange={(e) => setCurrentMaterial(e.target.value as ConstructionMaterialType)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange text-base"
            >
              {CONSTRUCTION_MATERIALS.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Only construction materials are shown (no appliances or fixtures)
            </p>
          </div>

          {/* Dry Standard and Wet Reading */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Droplets className="w-4 h-4 inline mr-1" />
                Dry Standard (%) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="0.0"
                value={dryStandard}
                onChange={(e) => setDryStandard(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-gray-600 mt-1">
                Reading from unaffected area
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Droplets className="w-4 h-4 inline mr-1" />
                Wet Reading (%) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="0.0"
                value={wetReading}
                onChange={(e) => setWetReading(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-gray-600 mt-1">
                Reading from affected area
              </p>
            </div>
          </div>

          {/* Location - Now Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location Note (Optional)
            </label>
            <Input
              placeholder="e.g., North wall, 2ft height, grid A3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-gray-600 mt-1">
              Optional note to help find this spot on future visits
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveReading}
              disabled={!dryStandard || !wetReading || !photo}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4" />
              Save Reading
            </Button>
          </div>
        </div>
      )}

      {/* Add Button (when form not shown) */}
      {!showAddForm && (
        <Button
          variant="primary"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4" />
          Add Moisture Reading
        </Button>
      )}

      {/* IICRC Reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          <strong>IICRC Best Practice:</strong> Materials are considered dry when within 2% of dry standard
          or below 12% moisture content. Return to the same locations daily for consistent progress tracking.
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Moisture Record?"
        message="Delete this moisture tracking record? This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
