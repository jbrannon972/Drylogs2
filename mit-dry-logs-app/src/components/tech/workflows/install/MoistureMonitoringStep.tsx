import React, { useState } from 'react';
import { Button } from '../../../shared/Button';
import {
  Droplets, Plus, Camera, TrendingDown, TrendingUp, Minus, ChevronRight,
  X, AlertCircle, CheckCircle, ArrowLeft
} from 'lucide-react';
import { MonitoredMaterial, MonitorableMaterialType } from '../../../../types';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { useJobsStore } from '../../../../stores/jobsStore';
import { Timestamp } from 'firebase/firestore';

interface MoistureMonitoringStepProps {
  job: any;
}

// Materials that can be monitored for moisture (excludes appliances, mirrors, etc.)
const MONITORABLE_MATERIALS: MonitorableMaterialType[] = [
  // Flooring
  'Carpet & Pad',
  'Hardwood Flooring',
  'Vinyl/Linoleum Flooring',
  'Tile Flooring',
  'Laminate Flooring',
  'Engineered Flooring',
  'Subfloor',
  // Drywall
  'Drywall - Wall',
  'Drywall - Ceiling',
  // Trim & Molding
  'Baseboards',
  'Shoe Molding',
  'Crown Molding',
  'Door Casing',
  'Window Casing',
  'Chair Rail',
  'Other Trim',
  // Tile & Backsplash
  'Tile Walls',
  'Backsplash',
  'Tub Surround',
  // Cabinetry & Counters
  'Base Cabinets',
  'Upper Cabinets',
  'Vanity',
  'Countertops',
  'Shelving',
  // Insulation
  'Insulation - Wall',
  'Insulation - Ceiling/Attic',
];

type WorkflowMode = 'list' | 'add' | 'detail' | 'add-reading';
type AddStep = 'material' | 'dry-standard' | 'wet-reading' | 'review';

export const MoistureMonitoringStep: React.FC<MoistureMonitoringStepProps> = ({
  job,
}) => {
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const { updateJob } = useJobsStore();

  const monitoredMaterials = job.monitoredMaterials || [];

  const updateMonitoredMaterials = (materials: MonitoredMaterial[]) => {
    updateJob(job.jobId, { monitoredMaterials: materials });
  };

  const [viewMode, setViewMode] = useState<WorkflowMode>('list');
  const [addStep, setAddStep] = useState<AddStep>('material');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  // New material form state
  const [newMaterial, setNewMaterial] = useState({
    materialType: 'Drywall - Wall' as MonitorableMaterialType,
    location: '',
    roomId: job.rooms[0]?.roomId || '',
    roomName: job.rooms[0]?.roomName || '',
    dryStandardPercentage: 0,
    dryStandardPhoto: '',
    wetReadingPercentage: 0,
    wetReadingPhoto: '',
    notes: '',
  });

  // New reading form state
  const [newReading, setNewReading] = useState({
    percentage: 0,
    photo: '',
    notes: '',
  });

  const selectedMaterial = monitoredMaterials.find((m: MonitoredMaterial) => m.id === selectedMaterialId);

  const calculateTrend = (material: MonitoredMaterial): 'drying' | 'stable' | 'increasing' => {
    if (material.wetReadings.length < 2) return 'stable';

    const latest = material.wetReadings[material.wetReadings.length - 1].percentage;
    const previous = material.wetReadings[material.wetReadings.length - 2].percentage;

    if (latest < previous - 1) return 'drying';
    if (latest > previous + 1) return 'increasing';
    return 'stable';
  };

  const onUpdateMonitoredMaterials = updateMonitoredMaterials;

  const addMonitoredMaterial = () => {
    const material: MonitoredMaterial = {
      id: `material-${Date.now()}`,
      materialType: newMaterial.materialType,
      location: newMaterial.location,
      roomId: newMaterial.roomId,
      roomName: newMaterial.roomName,
      dryStandard: {
        percentage: newMaterial.dryStandardPercentage,
        photo: newMaterial.dryStandardPhoto,
        recordedAt: Timestamp.now(),
        recordedBy: user?.uid || '',
      },
      wetReadings: [
        {
          id: `reading-${Date.now()}`,
          percentage: newMaterial.wetReadingPercentage,
          photo: newMaterial.wetReadingPhoto,
          recordedAt: Timestamp.now(),
          recordedBy: user?.uid || '',
          workflowPhase: 'install',
          notes: newMaterial.notes,
        },
      ],
      isDry: newMaterial.wetReadingPercentage <= newMaterial.dryStandardPercentage,
      lastReading: newMaterial.wetReadingPercentage,
      trend: 'stable',
    };

    updateMonitoredMaterials([...monitoredMaterials, material]);

    // Reset form
    setNewMaterial({
      materialType: 'Drywall - Wall',
      location: '',
      roomId: job.rooms[0]?.roomId || '',
      roomName: job.rooms[0]?.roomName || '',
      dryStandardPercentage: 0,
      dryStandardPhoto: '',
      wetReadingPercentage: 0,
      wetReadingPhoto: '',
      notes: '',
    });
    setAddStep('material');
    setViewMode('list');
  };

  const addReadingToMaterial = () => {
    if (!selectedMaterial) return;

    const updatedMaterial: MonitoredMaterial = {
      ...selectedMaterial,
      wetReadings: [
        ...selectedMaterial.wetReadings,
        {
          id: `reading-${Date.now()}`,
          percentage: newReading.percentage,
          photo: newReading.photo,
          recordedAt: Timestamp.now(),
          recordedBy: user?.uid || '',
          workflowPhase: 'install',
          notes: newReading.notes,
        },
      ],
      lastReading: newReading.percentage,
      isDry: newReading.percentage <= selectedMaterial.dryStandard.percentage,
    };

    updatedMaterial.trend = calculateTrend(updatedMaterial);

    updateMonitoredMaterials(
      monitoredMaterials.map((m: MonitoredMaterial) => m.id === selectedMaterial.id ? updatedMaterial : m)
    );

    setNewReading({ percentage: 0, photo: '', notes: '' });
    setViewMode('detail');
  };

  const handlePhotoUpload = async (file: File, type: 'dry' | 'wet' | 'newReading') => {
    if (!user) return;

    const photoUrl = await uploadPhoto(
      file,
      job.jobId,
      newMaterial.roomId || job.rooms[0]?.roomId,
      'assessment',
      user.uid
    );

    if (photoUrl) {
      if (type === 'dry') {
        setNewMaterial({ ...newMaterial, dryStandardPhoto: photoUrl });
      } else if (type === 'wet') {
        setNewMaterial({ ...newMaterial, wetReadingPhoto: photoUrl });
      } else if (type === 'newReading') {
        setNewReading({ ...newReading, photo: photoUrl });
      }
    }
  };

  const getTrendIcon = (trend: 'drying' | 'stable' | 'increasing') => {
    if (trend === 'drying') return <TrendingDown className="w-5 h-5 text-green-600" />;
    if (trend === 'increasing') return <TrendingUp className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-yellow-600" />;
  };

  const getTrendColor = (trend: 'drying' | 'stable' | 'increasing') => {
    if (trend === 'drying') return 'bg-green-50 border-green-200 text-green-800';
    if (trend === 'increasing') return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  // ============================================================================
  // LIST VIEW
  // ============================================================================
  if (viewMode === 'list') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Moisture Monitoring</h3>
          <p className="text-sm text-gray-600 mb-4">
            Track materials over time to ensure proper drying. Add materials, record dry standards, and monitor moisture levels.
          </p>

          <Button variant="primary" onClick={() => setViewMode('add')}>
            <Plus className="w-5 h-5" />
            Add Material to Monitor
          </Button>
        </div>

        {monitoredMaterials.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No materials being monitored yet</p>
            <p className="text-sm text-gray-400">Add a material to start tracking moisture readings</p>
          </div>
        )}

        <div className="space-y-3">
          {monitoredMaterials.map((material: MonitoredMaterial) => (
            <div
              key={material.id}
              onClick={() => {
                setSelectedMaterialId(material.id);
                setViewMode('detail');
              }}
              className="border-2 border-gray-300 rounded-lg p-4 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">{material.materialType}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{material.location}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      Dry Standard: <strong>{material.dryStandard.percentage}%</strong>
                    </span>
                    <span className="text-gray-500">
                      Current: <strong className={material.isDry ? 'text-green-600' : 'text-orange-600'}>
                        {material.lastReading}%
                      </strong>
                    </span>
                    <span className="text-gray-500">
                      Readings: <strong>{material.wetReadings.length}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full border ${getTrendColor(material.trend)} flex items-center gap-1 text-sm font-medium`}>
                    {getTrendIcon(material.trend)}
                    {material.trend === 'drying' && 'Drying'}
                    {material.trend === 'stable' && 'Stable'}
                    {material.trend === 'increasing' && 'Rising'}
                  </div>
                  {material.isDry && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // ADD MATERIAL WORKFLOW
  // ============================================================================
  if (viewMode === 'add') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-300 p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('list')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Material to Monitor</h2>
                <p className="text-sm text-gray-600">Step {addStep === 'material' ? '1' : addStep === 'dry-standard' ? '2' : addStep === 'wet-reading' ? '3' : '4'} of 4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-2 rounded-full ${addStep !== 'material' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`flex-1 h-2 rounded-full ${addStep === 'wet-reading' || addStep === 'review' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`flex-1 h-2 rounded-full ${addStep === 'review' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-6">
          {/* STEP 1: SELECT MATERIAL & LOCATION */}
          {addStep === 'material' && (
            <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Material & Location</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
                  <select
                    value={newMaterial.materialType}
                    onChange={(e) => setNewMaterial({ ...newMaterial, materialType: e.target.value as MonitorableMaterialType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <optgroup label="Flooring">
                      {MONITORABLE_MATERIALS.filter(m => ['Carpet & Pad', 'Hardwood Flooring', 'Vinyl/Linoleum Flooring', 'Tile Flooring', 'Laminate Flooring', 'Engineered Flooring', 'Subfloor'].includes(m)).map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Drywall">
                      {MONITORABLE_MATERIALS.filter(m => m.includes('Drywall')).map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Trim & Molding">
                      {MONITORABLE_MATERIALS.filter(m => ['Baseboards', 'Shoe Molding', 'Crown Molding', 'Door Casing', 'Window Casing', 'Chair Rail', 'Other Trim'].includes(m)).map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other">
                      {MONITORABLE_MATERIALS.filter(m => !['Carpet & Pad', 'Hardwood Flooring', 'Vinyl/Linoleum Flooring', 'Tile Flooring', 'Laminate Flooring', 'Engineered Flooring', 'Subfloor', 'Drywall - Wall', 'Drywall - Ceiling', 'Baseboards', 'Shoe Molding', 'Crown Molding', 'Door Casing', 'Window Casing', 'Chair Rail', 'Other Trim'].includes(m)).map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                  <select
                    value={newMaterial.roomId}
                    onChange={(e) => {
                      const room = job.rooms.find((r: any) => r.roomId === e.target.value);
                      setNewMaterial({
                        ...newMaterial,
                        roomId: e.target.value,
                        roomName: room?.roomName || '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {job.rooms.map((room: any) => (
                      <option key={room.roomId} value={room.roomId}>
                        {room.roomName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specific Location</label>
                  <input
                    type="text"
                    value={newMaterial.location}
                    onChange={(e) => setNewMaterial({ ...newMaterial, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., North wall, 3ft from corner"
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={() => setAddStep('dry-standard')}
                  className="w-full"
                  disabled={!newMaterial.location.trim()}
                >
                  Next: Record Dry Standard
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DRY STANDARD */}
          {addStep === 'dry-standard' && (
            <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Record Dry Standard</h3>
              <p className="text-sm text-gray-600 mb-6">
                Take a reading of similar unaffected material to establish the baseline.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dry Standard Moisture %</label>
                  <input
                    type="number"
                    value={newMaterial.dryStandardPercentage}
                    onChange={(e) => setNewMaterial({ ...newMaterial, dryStandardPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file, 'dry');
                    }}
                    className="w-full"
                    disabled={isUploading}
                  />
                  {newMaterial.dryStandardPhoto && (
                    <img src={newMaterial.dryStandardPhoto} alt="Dry standard" className="mt-2 w-32 h-32 object-cover rounded border" />
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setAddStep('material')}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setAddStep('wet-reading')}
                    className="flex-1"
                    disabled={newMaterial.dryStandardPercentage === 0}
                  >
                    Next: Record Wet Reading
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: WET READING */}
          {addStep === 'wet-reading' && (
            <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Record Initial Wet Reading</h3>
              <p className="text-sm text-gray-600 mb-6">
                Take a moisture reading of the affected material.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wet Reading Moisture %</label>
                  <input
                    type="number"
                    value={newMaterial.wetReadingPercentage}
                    onChange={(e) => setNewMaterial({ ...newMaterial, wetReadingPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file, 'wet');
                    }}
                    className="w-full"
                    disabled={isUploading}
                  />
                  {newMaterial.wetReadingPhoto && (
                    <img src={newMaterial.wetReadingPhoto} alt="Wet reading" className="mt-2 w-32 h-32 object-cover rounded border" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={newMaterial.notes}
                    onChange={(e) => setNewMaterial({ ...newMaterial, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Any additional observations..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setAddStep('dry-standard')}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={addMonitoredMaterial}
                    className="flex-1"
                    disabled={newMaterial.wetReadingPercentage === 0}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Save Material
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // DETAIL VIEW
  // ============================================================================
  if (viewMode === 'detail' && selectedMaterial) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-300 p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('list')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedMaterial.materialType}</h2>
                <p className="text-sm text-gray-600">{selectedMaterial.location}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full border ${getTrendColor(selectedMaterial.trend)} flex items-center gap-1 text-sm font-medium`}>
              {getTrendIcon(selectedMaterial.trend)}
              {selectedMaterial.trend === 'drying' && 'Drying'}
              {selectedMaterial.trend === 'stable' && 'Stable'}
              {selectedMaterial.trend === 'increasing' && 'Rising'}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Status Card */}
          <div className={`rounded-lg border-2 p-6 ${selectedMaterial.isDry ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
            <div className="flex items-center gap-3 mb-4">
              {selectedMaterial.isDry ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-orange-600" />
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedMaterial.isDry ? 'Dry Standard Reached' : 'Still Drying'}
                </h3>
                <p className="text-sm text-gray-600">
                  Current: {selectedMaterial.lastReading}% | Dry Standard: {selectedMaterial.dryStandard.percentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Add New Reading Button */}
          <Button variant="primary" onClick={() => setViewMode('add-reading')} className="w-full">
            <Plus className="w-5 h-5" />
            Add New Reading
          </Button>

          {/* Reading History */}
          <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reading History</h3>

            {/* Dry Standard */}
            <div className="border-l-4 border-blue-600 pl-4 pb-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-blue-600 uppercase">Dry Standard (Baseline)</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{selectedMaterial.dryStandard.percentage}%</p>
              <p className="text-sm text-gray-500">
                {selectedMaterial.dryStandard.recordedAt && new Date((selectedMaterial.dryStandard.recordedAt as any).seconds * 1000).toLocaleDateString()}
              </p>
              {selectedMaterial.dryStandard.photo && (
                <img src={selectedMaterial.dryStandard.photo} alt="Dry standard" className="mt-2 w-24 h-24 object-cover rounded border" />
              )}
            </div>

            {/* Wet Readings */}
            <div className="space-y-4">
              {selectedMaterial.wetReadings.map((reading: any, index: number) => (
                <div key={reading.id} className="border-l-4 border-gray-300 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-600 uppercase">
                      Reading #{index + 1} - {reading.workflowPhase}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reading.percentage}%</p>
                  <p className="text-sm text-gray-500">
                    {reading.recordedAt && new Date((reading.recordedAt as any).seconds * 1000).toLocaleDateString()}
                  </p>
                  {reading.notes && (
                    <p className="text-sm text-gray-600 mt-1 italic">{reading.notes}</p>
                  )}
                  {reading.photo && (
                    <img src={reading.photo} alt={`Reading ${index + 1}`} className="mt-2 w-24 h-24 object-cover rounded border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ADD READING VIEW
  // ============================================================================
  if (viewMode === 'add-reading' && selectedMaterial) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-300 p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('detail')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add New Reading</h2>
                <p className="text-sm text-gray-600">{selectedMaterial.materialType} - {selectedMaterial.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moisture %</label>
                <input
                  type="number"
                  value={newReading.percentage}
                  onChange={(e) => setNewReading({ ...newReading, percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file, 'newReading');
                  }}
                  className="w-full"
                  disabled={isUploading}
                />
                {newReading.photo && (
                  <img src={newReading.photo} alt="New reading" className="mt-2 w-32 h-32 object-cover rounded border" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={newReading.notes}
                  onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Any observations..."
                />
              </div>

              <Button
                variant="primary"
                onClick={addReadingToMaterial}
                className="w-full"
                disabled={newReading.percentage === 0}
              >
                <CheckCircle className="w-5 h-5" />
                Save Reading
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
