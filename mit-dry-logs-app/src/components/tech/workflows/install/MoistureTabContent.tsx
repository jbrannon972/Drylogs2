import React, { useState } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { UniversalPhotoCapture } from '../../../shared/UniversalPhotoCapture';
import {
  Droplets,
  Camera,
  CheckCircle,
  MapPin,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
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

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingToTrackingId, setAddingToTrackingId] = useState<string | null>(null); // NEW: Track if adding to existing material
  const [currentMaterial, setCurrentMaterial] = useState<ConstructionMaterialType>('Drywall - Wall');
  const [location, setLocation] = useState('');
  const [dryStandard, setDryStandard] = useState('');
  const [wetReading, setWetReading] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Expanded materials state
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());

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

  const resetForm = () => {
    setCurrentMaterial('Drywall - Wall');
    setLocation('');
    setDryStandard('');
    setWetReading('');
    setPhotos([]);
    setNotes('');
    setShowAddForm(false);
    setAddingToTrackingId(null);
  };

  const toggleExpanded = (trackingId: string) => {
    setExpandedMaterials(prev => {
      const next = new Set(prev);
      if (next.has(trackingId)) {
        next.delete(trackingId);
      } else {
        next.add(trackingId);
      }
      return next;
    });
  };

  const handleAddReadingToExisting = (tracking: MaterialMoistureTracking) => {
    setAddingToTrackingId(tracking.id);
    setCurrentMaterial(tracking.material);
    setLocation(tracking.location || '');
    setDryStandard(tracking.dryStandard.toString());
    setWetReading('');
    setPhotos([]);
    setNotes('');
    setShowAddForm(true);
  };

  const getHighestReading = (tracking: MaterialMoistureTracking): number => {
    return Math.max(...tracking.readings.map(r => r.moisturePercent));
  };

  const handleSaveReading = () => {
    // PHASE 1 VALIDATION: 2 Photos are REQUIRED
    if (photos.length < 2) {
      alert('2 photos required! Please take: (1) moisture meter display, (2) material being tested. Use gallery to select multiple or tap camera twice.');
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

    // Create new reading entry
    const newReading: MoistureReadingEntry = {
      timestamp: new Date().toISOString(),
      moisturePercent: wetReadingNum,
      photo: photos[0] || undefined,
      technicianId: user?.uid || 'unknown',
      technicianName: user?.displayName || 'Unknown Tech',
      workflowPhase: 'install',
      notes,
    };

    if (addingToTrackingId) {
      // Adding to existing material
      const updatedTracking = moistureTracking.map(t => {
        if (t.id === addingToTrackingId) {
          const updatedReadings = [...t.readings, newReading];
          const highestReading = Math.max(...updatedReadings.map(r => r.moisturePercent));
          return {
            ...t,
            readings: updatedReadings,
            lastReadingAt: new Date().toISOString(),
            status: (isMaterialDry(highestReading, t.dryStandard) ? 'dry' : 'wet') as 'dry' | 'wet' | 'drying',
          };
        }
        return t;
      });
      onUpdate(updatedTracking);
    } else {
      // Create new moisture tracking record
      const tracking: MaterialMoistureTracking = {
        id: `${roomId}-${currentMaterial}-${Date.now()}`,
        roomId,
        roomName,
        material: currentMaterial,
        location,
        dryStandard: dryStandardNum,
        readings: [newReading],
        createdAt: new Date().toISOString(),
        lastReadingAt: new Date().toISOString(),
        status: (isMaterialDry(wetReadingNum, dryStandardNum) ? 'dry' : 'wet') as 'dry' | 'wet' | 'drying',
        trend: 'unknown',
      };
      onUpdate([...moistureTracking, tracking]);
    }

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
    <div className="w-full h-full space-y-4">
      {/* Existing Readings - Grouped by Material with Expandable Dropdown */}
      {roomReadings.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">
            Tracked Materials ({roomReadings.length})
          </h4>
          {roomReadings.map((tracking) => {
            const highestReading = getHighestReading(tracking);
            const isDry = isMaterialDry(highestReading, tracking.dryStandard);
            const isExpanded = expandedMaterials.has(tracking.id);
            const latestReading = tracking.readings[tracking.readings.length - 1];

            return (
              <div
                key={tracking.id}
                className={`border-l-4 rounded-lg ${
                  isDry ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}
              >
                {/* Material Header - Clickable to Expand */}
                <div
                  className="p-3 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => toggleExpanded(tracking.id)}
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
                        {tracking.readings.length > 1 && (
                          <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
                            {tracking.readings.length} readings
                          </span>
                        )}
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
                          <span className="text-gray-600">Highest:</span>
                          <span className="font-bold ml-1 text-red-700">{highestReading}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tracking.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded View - All Readings */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-300">
                    <div className="pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">All Readings:</p>
                      <div className="space-y-2">
                        {tracking.readings.map((reading, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg font-bold text-gray-900">
                                    {reading.moisturePercent}%
                                  </span>
                                  {reading.moisturePercent === highestReading && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                      HIGHEST
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {new Date(reading.timestamp).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  By: {reading.technicianName}
                                </p>
                                {reading.notes && (
                                  <p className="text-xs text-gray-700 mt-1 italic">
                                    Note: {reading.notes}
                                  </p>
                                )}
                              </div>
                              {reading.photo && (
                                <img src={reading.photo} alt="Meter" className="max-h-20 rounded ml-2" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Another Reading Button */}
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddReadingToExisting(tracking);
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Reading
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No readings yet */}
      {roomReadings.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <Droplets className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>No moisture readings yet</p>
          <p className="text-sm mt-1">Add a material to start tracking</p>
        </div>
      )}

      {/* Add New Reading Form - Full Screen Single Form */}
      {showAddForm && (
        <div className="border-2 border-entrusted-orange rounded-lg p-3 bg-orange-50 space-y-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              {addingToTrackingId ? 'Add Another Reading' : 'Add Moisture Reading'}
            </h3>
            {addingToTrackingId && (
              <p className="text-sm text-gray-600 mt-1">
                Adding to existing material: <strong>{currentMaterial}</strong>
              </p>
            )}
          </div>

          {/* Photo Upload - PHASE 1: FIRST and REQUIRED */}
          <div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-orange-900">
                <strong>Take 2 photos!</strong> (1) Moisture meter display showing reading, (2) Material surface being tested. Use gallery to select both at once.
              </p>
            </div>
            {user && (
              <UniversalPhotoCapture
                jobId={job.jobId}
                location={roomName}
                category="assessment"
                userId={user.uid}
                onPhotosUploaded={(urls) => {
                  setPhotos(prev => [...prev, ...urls]);
                }}
                uploadedCount={photos.length}
                label="Moisture Reading Photos *"
                minimumPhotos={2}
              />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveReading}
              disabled={!dryStandard || !wetReading || photos.length < 2}
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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">IICRC Best Practice:</p>
        <ul className="text-xs text-gray-600 list-disc ml-5 space-y-1">
          <li>Materials are dry when within 2% of dry standard OR below 12% moisture content</li>
          <li>Return to the same locations daily for consistent progress tracking</li>
        </ul>
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
