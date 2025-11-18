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
  const [locationNumber, setLocationNumber] = useState(''); // NEW: Numbered labeling system
  const [dryStandard, setDryStandard] = useState('');
  const [wetReading, setWetReading] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Quick Reading state (camera-first flow)
  const [showQuickReadingModal, setShowQuickReadingModal] = useState(false);
  const [quickReadingPhoto, setQuickReadingPhoto] = useState<string | null>(null);
  const [quickReadingTrackingId, setQuickReadingTrackingId] = useState<string | null>(null);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [quickWetReading, setQuickWetReading] = useState('');
  const [quickLocation, setQuickLocation] = useState('');
  const [quickLocationNumber, setQuickLocationNumber] = useState('');
  const [quickNotes, setQuickNotes] = useState('');

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
    setLocationNumber('');
    setDryStandard('');
    setWetReading('');
    setPhotos([]);
    setNotes('');
    setShowAddForm(false);
    setAddingToTrackingId(null);
  };

  // Get dry standard for a material type (from any existing tracking across all rooms)
  const getDryStandardForMaterial = (material: ConstructionMaterialType): number | null => {
    const existingTracking = moistureTracking.find(t => t.material === material);
    return existingTracking ? existingTracking.dryStandard : null;
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

  // QUICK READING FUNCTIONS (Camera-First Flow)
  const handleStartQuickReading = (tracking: MaterialMoistureTracking) => {
    // Store which material we're adding to
    setQuickReadingTrackingId(tracking.id);

    // Trigger camera immediately
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file && user) {
        // Upload photo
        const formData = new FormData();
        formData.append('file', file);

        // For now, create a temporary URL for preview
        const photoUrl = URL.createObjectURL(file);
        setQuickReadingPhoto(photoUrl);

        // Upload in background and replace URL when done
        import('../../../../services/firebase/photoService').then(({ photoService }) => {
          photoService.uploadPhoto(file, job.jobId, roomId, 'assessment', user.uid).then(url => {
            if (url) {
              setQuickReadingPhoto(url);
            }
          });
        });

        // Show modal with form
        setShowQuickReadingModal(true);
      }
    };
    input.click();
  };

  const resetQuickReadingForm = () => {
    setShowQuickReadingModal(false);
    setQuickReadingPhoto(null);
    setQuickReadingTrackingId(null);
    setShowContinuePrompt(false);
    setQuickWetReading('');
    setQuickLocation('');
    setQuickLocationNumber('');
    setQuickNotes('');
  };

  const handleSaveQuickReading = () => {
    if (!quickWetReading || !quickReadingPhoto || !quickReadingTrackingId) {
      alert('Please complete all required fields: Wet Reading');
      return;
    }

    const wetReadingNum = parseFloat(quickWetReading);
    if (isNaN(wetReadingNum)) {
      alert('Please enter a valid number for wet reading');
      return;
    }

    // Build location string
    const finalLocation = quickLocationNumber
      ? `#${quickLocationNumber}${quickLocation ? ' ' + quickLocation : ''}`
      : quickLocation;

    // Create new reading entry
    const newReading: MoistureReadingEntry = {
      timestamp: new Date().toISOString(),
      moisturePercent: wetReadingNum,
      photo: quickReadingPhoto,
      technicianId: user?.uid || 'unknown',
      technicianName: user?.displayName || 'Unknown Tech',
      workflowPhase: 'install',
      notes: quickNotes,
    };

    // Add reading to existing material
    const updatedTracking = moistureTracking.map(t => {
      if (t.id === quickReadingTrackingId) {
        const updatedReadings = [...t.readings, newReading];
        const highestReading = Math.max(...updatedReadings.map(r => r.moisturePercent));
        return {
          ...t,
          readings: updatedReadings,
          location: finalLocation || t.location, // Update location if provided
          lastReadingAt: new Date().toISOString(),
          status: (isMaterialDry(highestReading, t.dryStandard) ? 'dry' : 'wet') as 'dry' | 'wet' | 'drying',
        };
      }
      return t;
    });

    onUpdate(updatedTracking);

    // Show continuation prompt
    setShowQuickReadingModal(false);
    setShowContinuePrompt(true);
  };

  const handleTakeAnotherReading = () => {
    if (!quickReadingTrackingId) return;

    // Find the tracking we just added to
    const tracking = moistureTracking.find(t => t.id === quickReadingTrackingId);
    if (tracking) {
      // Reset form but keep same material
      setQuickWetReading('');
      setQuickLocation('');
      setQuickLocationNumber('');
      setQuickNotes('');
      setQuickReadingPhoto(null);
      setShowContinuePrompt(false);

      // Start new quick reading for same material
      handleStartQuickReading(tracking);
    }
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
                        {tracking.location ? (
                          <>
                            {tracking.location.match(/^#?\d+$/) ? (
                              <span className="font-bold text-entrusted-orange">#{tracking.location.replace('#', '')}</span>
                            ) : (
                              tracking.location
                            )}
                          </>
                        ) : (
                          'No location specified'
                        )}
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartQuickReading(tracking);
                        }}
                        className="px-3 py-1.5 bg-entrusted-orange text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
                        title="Quick Reading"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-sm font-medium">Quick Reading</span>
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
                            </div>
                            {/* Photo Thumbnails - Show all photos inline */}
                            {reading.photo && (
                              <div className="flex gap-1 mt-2">
                                {[reading.photo].map((photo, photoIndex) => (
                                  <img
                                    key={photoIndex}
                                    src={photo}
                                    alt={`Photo ${photoIndex + 1}`}
                                    className="h-16 w-16 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-75"
                                    onClick={() => window.open(photo, '_blank')}
                                  />
                                ))}
                              </div>
                            )}
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

          {/* Numbered Tape Reminder */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
            <p className="text-sm font-bold text-blue-900 mb-1">📍 Numbered Labeling System</p>
            <p className="text-xs text-blue-800">
              Use numbered tape or stickers on walls! Write the location number on painter's tape near each reading spot.
              This helps find the exact same location on future check service visits for accurate progress tracking.
            </p>
          </div>

          {/* Photo Upload - PHASE 1: FIRST and REQUIRED */}
          <div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-orange-900">
                <strong>Take 2 photos!</strong> (1) Moisture meter display showing reading, (2) Material surface with numbered tape visible.
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
                label="Moisture Meter Reading Photo *"
                minimumPhotos={1}
                singlePhotoMode={true}
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
              onChange={(e) => {
                const newMaterial = e.target.value as ConstructionMaterialType;
                setCurrentMaterial(newMaterial);
                // Auto-populate dry standard if exists for this material type
                const existingDryStandard = getDryStandardForMaterial(newMaterial);
                if (existingDryStandard !== null && !addingToTrackingId) {
                  setDryStandard(existingDryStandard.toString());
                }
              }}
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

          {/* Location Number - Numbered Tape System */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location # *
              </label>
              <Input
                type="number"
                placeholder="1"
                value={locationNumber}
                onChange={(e) => {
                  setLocationNumber(e.target.value);
                  setLocation(e.target.value ? `#${e.target.value}` : '');
                }}
                className="text-base"
                min="1"
              />
              <p className="text-xs text-gray-600 mt-1">
                Tape/sticker number
              </p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Additional Note (Optional)
              </label>
              <Input
                placeholder="e.g., North wall, 2ft height"
                value={location.startsWith('#') ? location.substring(location.indexOf(' ') + 1 || location.length) : location}
                onChange={(e) => {
                  if (locationNumber) {
                    setLocation(`#${locationNumber} ${e.target.value}`.trim());
                  } else {
                    setLocation(e.target.value);
                  }
                }}
                className="text-base"
              />
              <p className="text-xs text-gray-600 mt-1">
                Optional detail
              </p>
            </div>
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

      {/* Quick Reading Modal (Camera-First Flow) */}
      {showQuickReadingModal && quickReadingTrackingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="border-b pb-3">
                <h2 className="text-xl font-bold text-gray-900">
                  Quick Reading: {moistureTracking.find(t => t.id === quickReadingTrackingId)?.material}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Adding to existing material
                </p>
              </div>

              {/* Photo Preview */}
              {quickReadingPhoto && (
                <div className="border-2 border-gray-300 rounded-lg p-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">📸 Photo Captured</p>
                  <img
                    src={quickReadingPhoto}
                    alt="Moisture meter reading"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}

              {/* Material Info (Read-Only) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 mb-2">📊 Material Info</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700">Material:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {moistureTracking.find(t => t.id === quickReadingTrackingId)?.material}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Dry Standard:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {moistureTracking.find(t => t.id === quickReadingTrackingId)?.dryStandard}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4"></div>

              {/* Wet Reading (Auto-Focused) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💧 Wet Reading % *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="18.5"
                  value={quickWetReading}
                  onChange={(e) => setQuickWetReading(e.target.value)}
                  autoFocus
                  className="text-2xl font-bold"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Location *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1"># Tape Number</label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={quickLocationNumber}
                      onChange={(e) => setQuickLocationNumber(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Additional Detail (Optional)</label>
                    <Input
                      placeholder="North wall, 2ft height"
                      value={quickLocation}
                      onChange={(e) => setQuickLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Notes (Optional)
                </label>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  rows={3}
                  placeholder="Any observations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={resetQuickReadingForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveQuickReading}
                  disabled={!quickWetReading}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Reading
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continuation Prompt (Take Another Reading?) */}
      {showContinuePrompt && quickReadingTrackingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            {/* Success Message */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">✓ Reading Saved!</h3>
              <p className="text-gray-600">
                {quickWetReading}% reading added to {moistureTracking.find(t => t.id === quickReadingTrackingId)?.material}
              </p>
            </div>

            <div className="border-t pt-4"></div>

            {/* Prompt */}
            <p className="text-center text-gray-700 font-medium">
              Measure another spot on this material?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleTakeAnotherReading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Another Reading
              </Button>
              <Button
                variant="secondary"
                onClick={resetQuickReadingForm}
                className="flex-1"
              >
                ✓ Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
