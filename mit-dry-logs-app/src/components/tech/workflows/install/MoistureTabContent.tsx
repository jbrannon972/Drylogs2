import React, { useState } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import {
  Droplets,
  AlertCircle,
  Info,
  Camera,
  CheckCircle,
  MapPin,
  Thermometer,
  Wind,
  Trash2,
  Plus
} from 'lucide-react';
import { usePhotos } from '../../../../hooks/usePhotos';
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

// ULTRAFIELD Step States
type WorkflowStep = 'select-material' | 'location' | 'dry-standard' | 'wet-reading' | 'photo' | 'complete';

export const MoistureTabContent: React.FC<MoistureTabContentProps> = ({
  job,
  roomId,
  roomName,
  moistureTracking,
  onUpdate,
}) => {
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  // ULTRAFIELD workflow state
  const [showAddForm, setShowAddForm] = useState(false);
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('select-material');
  const [currentMaterial, setCurrentMaterial] = useState<ConstructionMaterialType>('Drywall - Wall');
  const [location, setLocation] = useState('');
  const [dryStandard, setDryStandard] = useState('');
  const [wetReading, setWetReading] = useState('');
  const [temperature, setTemperature] = useState('70');
  const [humidity, setHumidity] = useState('50');
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

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
      const url = await uploadPhoto(file, job.jobId, roomName, 'assessment', user.uid);
      if (url) setPhoto(url);
    }
  };

  const resetForm = () => {
    setWorkflowStep('select-material');
    setCurrentMaterial('Drywall - Wall');
    setLocation('');
    setDryStandard('');
    setWetReading('');
    setTemperature('70');
    setHumidity('50');
    setPhoto(null);
    setNotes('');
    setShowAddForm(false);
  };

  const handleSaveReading = () => {
    if (!dryStandard || !wetReading) {
      alert('Please complete all required fields');
      return;
    }

    const dryStandardNum = parseFloat(dryStandard);
    const wetReadingNum = parseFloat(wetReading);

    // Create initial reading entry
    const initialReading: MoistureReadingEntry = {
      timestamp: new Date().toISOString(),
      moisturePercent: wetReadingNum,
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
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
    setWorkflowStep('complete');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this moisture tracking record? This cannot be undone.')) {
      onUpdate(moistureTracking.filter(t => t.id !== id));
    }
  };

  const handleAddAnother = () => {
    resetForm();
    setShowAddForm(true);
    setWorkflowStep('select-material');
  };

  // Get readings for this room only
  const roomReadings = moistureTracking.filter(t => t.roomId === roomId);

  return (
    <div className="max-w-2xl space-y-6">
      {/* ULTRAFIELD Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">ULTRAFIELD Moisture Tracking</h4>
            <p className="text-sm text-blue-800">
              Track individual construction materials through the entire job. For each material, establish a
              dry standard from an unaffected area, then record the wet reading. These will be tracked through
              all check services until pull.
            </p>
          </div>
        </div>
      </div>

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

      {/* Add New Reading Form */}
      {showAddForm && workflowStep !== 'complete' && (
        <div className="border-2 border-entrusted-orange rounded-lg p-5 bg-orange-50">
          <h3 className="font-semibold text-gray-900 mb-4">
            Add Moisture Reading - Step {
              workflowStep === 'select-material' ? '1' :
              workflowStep === 'location' ? '2' :
              workflowStep === 'dry-standard' ? '3' :
              workflowStep === 'wet-reading' ? '4' :
              '5'
            } of 5
          </h3>

          {/* Step 1: Select Material */}
          {workflowStep === 'select-material' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Construction Material *
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
              <div className="flex gap-3">
                <Button variant="secondary" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setWorkflowStep('location')}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {workflowStep === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Specific Location *
                </label>
                <Input
                  placeholder="e.g., North wall, 2ft height, grid A3"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-base"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Be specific so you can return to the same spot for check services
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setWorkflowStep('select-material')} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setWorkflowStep('dry-standard')}
                  disabled={!location.trim()}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Dry Standard */}
          {workflowStep === 'dry-standard' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-800">
                  <Info className="w-4 h-4 inline mr-1" />
                  Take a reading from an <strong>unaffected</strong> area of the same material type
                  to establish a dry baseline.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="w-4 h-4 inline mr-1" />
                  Dry Standard Reading (%) *
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
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setWorkflowStep('location')} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setWorkflowStep('wet-reading')}
                  disabled={!dryStandard || parseFloat(dryStandard) < 0}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Wet Reading */}
          {workflowStep === 'wet-reading' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Now take a reading from the <strong>affected</strong> area at the location you specified.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3">
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Thermometer className="w-4 h-4 inline mr-1" />
                    Temp (°F)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Wind className="w-4 h-4 inline mr-1" />
                    Humidity (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any observations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setWorkflowStep('dry-standard')} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setWorkflowStep('photo')}
                  disabled={!wetReading || parseFloat(wetReading) < 0}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Photo */}
          {workflowStep === 'photo' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-green-800">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Take a photo of the moisture meter display for documentation (optional but recommended)
                </p>
              </div>
              {photo ? (
                <div>
                  <img src={photo} alt="Moisture Meter" className="max-h-48 rounded mb-3 mx-auto" />
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Photo captured</span>
                  </div>
                  <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 w-full justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Camera className="w-4 h-4" />
                    Replace Photo
                  </label>
                </div>
              ) : (
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 w-full justify-center py-8 border-2 border-dashed border-gray-300 hover:border-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Camera className="w-6 h-6" />
                  {isUploading ? 'Uploading...' : 'Take Photo (Optional)'}
                </label>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setWorkflowStep('wet-reading')} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveReading}
                  className="flex-1"
                >
                  Save Reading
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion State */}
      {workflowStep === 'complete' && (
        <div className="border-2 border-green-500 rounded-lg p-5 bg-green-50">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Reading Saved!</h3>
            <p className="text-gray-700">
              {currentMaterial} at {location} has been added to moisture tracking
            </p>
            <Button variant="secondary" onClick={handleAddAnother} className="w-full">
              <Plus className="w-4 h-4" />
              Add Another Material
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
    </div>
  );
};
