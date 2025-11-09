import React, { useState, useEffect } from 'react';
import { Droplets, Info, TrendingDown, TrendingUp, Minus, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { Button } from '../../../shared/Button';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import {
  MaterialMoistureTracking,
  MoistureReadingEntry,
  getMoistureTrend,
  isMaterialDry,
} from '../../../../types';

interface RoomReadingsStepNewProps {
  job: any;
  onNext: () => void;
  visitNumber: number; // Which check service visit (1, 2, 3, etc.)
}

export const RoomReadingsStepNew: React.FC<RoomReadingsStepNewProps> = ({ job, onNext, visitNumber }) => {
  const { installData, checkServiceData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  // Load moisture tracking from install
  const [moistureTracking, setMoistureTracking] = useState<MaterialMoistureTracking[]>(
    installData?.moistureTracking || []
  );

  // Current material being updated
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [newReading, setNewReading] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const selectedMaterial = moistureTracking.find(m => m.id === selectedMaterialId);

  // Save to workflow store
  useEffect(() => {
    // Update both install data (source of truth) and check service data
    updateWorkflowData('install', { moistureTracking });
    updateWorkflowData('checkService', {
      moistureReadingsUpdated: true,
      lastUpdated: new Date().toISOString(),
    });
  }, [moistureTracking]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user && selectedMaterial) {
      const url = await uploadPhoto(file, job.jobId, selectedMaterial.roomName, 'daily-check', user.uid);
      if (url) setPhoto(url);
    }
  };

  const handleAddReading = () => {
    if (!selectedMaterial || !newReading) {
      alert('Please enter a moisture reading');
      return;
    }

    const readingNum = parseFloat(newReading);

    // Create new reading entry
    const entry: MoistureReadingEntry = {
      timestamp: new Date().toISOString(),
      moisturePercent: readingNum,
      photo: photo || undefined,
      technicianId: user?.uid || 'unknown',
      technicianName: user?.displayName || 'Unknown Tech',
      workflowPhase: 'check-service',
      visitNumber,
      notes,
    };

    // Calculate trend
    const lastReading = selectedMaterial.readings[selectedMaterial.readings.length - 1];
    const trend = getMoistureTrend(readingNum, lastReading.moisturePercent);

    // Update tracking record
    const updatedTracking = moistureTracking.map(m => {
      if (m.id === selectedMaterialId) {
        // Determine status
        const newStatus: 'wet' | 'drying' | 'dry' = isMaterialDry(readingNum, m.dryStandard)
          ? 'dry'
          : readingNum < lastReading.moisturePercent
          ? 'drying'
          : 'wet';

        return {
          ...m,
          readings: [...m.readings, entry],
          lastReadingAt: entry.timestamp,
          status: newStatus,
          trend,
        };
      }
      return m;
    });

    setMoistureTracking(updatedTracking);

    // Reset form
    setSelectedMaterialId(null);
    setNewReading('');
    setPhoto(null);
    setNotes('');
  };

  const getTrendIcon = (material: MaterialMoistureTracking) => {
    if (material.readings.length < 2) return null;

    switch (material.trend) {
      case 'improving':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      case 'worsening':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (material: MaterialMoistureTracking) => {
    const lastReading = material.readings[material.readings.length - 1];
    const isDry = isMaterialDry(lastReading.moisturePercent, material.dryStandard);

    if (isDry) {
      return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">✓ DRY</span>;
    }
    return <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">✗ WET</span>;
  };

  // Group by room
  const materialsByRoom = moistureTracking.reduce((acc, material) => {
    if (!acc[material.roomId]) {
      acc[material.roomId] = [];
    }
    acc[material.roomId].push(material);
    return acc;
  }, {} as Record<string, MaterialMoistureTracking[]>);

  // Calculate overall progress
  const totalMaterials = moistureTracking.length;
  const materialsUpdatedToday = moistureTracking.filter(m => {
    const lastReading = m.readings[m.readings.length - 1];
    return lastReading.visitNumber === visitNumber;
  }).length;
  const dryMaterials = moistureTracking.filter(m => {
    const lastReading = m.readings[m.readings.length - 1];
    return isMaterialDry(lastReading.moisturePercent, m.dryStandard);
  }).length;

  if (totalMaterials === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
        <p className="text-gray-700 font-medium mb-2">No Moisture Tracking Records Found</p>
        <p className="text-sm text-gray-600">
          Moisture readings are set up during the Install workflow. Please complete the Install workflow first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Check Service Visit #{visitNumber} - Moisture Readings</h4>
            <p className="text-sm text-blue-800">
              Update readings for all materials that were tracked during install. Return to the same
              locations to ensure consistent measurement. Materials are dry when within 2% of dry standard
              or below 12% moisture.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Overall Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-900">{totalMaterials}</p>
            <p className="text-xs text-gray-600">Materials Tracked</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">{dryMaterials}</p>
            <p className="text-xs text-gray-600">Dry Materials</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-entrusted-orange">{materialsUpdatedToday}</p>
            <p className="text-xs text-gray-600">Updated Today</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Drying Progress</span>
            <span className="font-medium">{Math.round((dryMaterials / totalMaterials) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(dryMaterials / totalMaterials) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Materials by Room */}
      {Object.entries(materialsByRoom).map(([roomId, materials]) => {
        const roomName = materials[0]?.roomName || 'Unknown Room';

        return (
          <div key={roomId} className="border rounded-lg p-5 bg-white">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">{roomName}</h3>
            <div className="space-y-3">
              {materials.map((material) => {
                const lastReading = material.readings[material.readings.length - 1];
                const previousReading = material.readings.length > 1
                  ? material.readings[material.readings.length - 2]
                  : null;
                const isUpdatedToday = lastReading.visitNumber === visitNumber;
                const isDry = isMaterialDry(lastReading.moisturePercent, material.dryStandard);

                return (
                  <div
                    key={material.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      selectedMaterialId === material.id
                        ? 'border-entrusted-orange bg-orange-50'
                        : isUpdatedToday
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(material)}
                          {getTrendIcon(material)}
                          {isUpdatedToday && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Updated Today
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900">{material.material}</h4>
                        <p className="text-sm text-gray-600">{material.location}</p>
                      </div>
                      <Button
                        variant={selectedMaterialId === material.id ? 'secondary' : 'primary'}
                        onClick={() => setSelectedMaterialId(selectedMaterialId === material.id ? null : material.id)}
                      >
                        {selectedMaterialId === material.id ? 'Cancel' : 'Update'}
                      </Button>
                    </div>

                    {/* Reading History */}
                    <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-600 text-xs">Dry Standard</p>
                        <p className="font-bold text-blue-600">{material.dryStandard}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Current</p>
                        <p className={`font-bold ${isDry ? 'text-green-600' : 'text-red-600'}`}>
                          {lastReading.moisturePercent}%
                        </p>
                      </div>
                      {previousReading && (
                        <div>
                          <p className="text-gray-600 text-xs">Previous</p>
                          <p className="font-medium text-gray-700">{previousReading.moisturePercent}%</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600 text-xs">Trend</p>
                        <p className="font-medium capitalize">{material.trend}</p>
                      </div>
                    </div>

                    {/* Reading Timeline */}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-900 mb-2">
                        View all {material.readings.length} reading{material.readings.length !== 1 ? 's' : ''}
                      </summary>
                      <div className="space-y-1 pl-4 border-l-2 border-gray-200">
                        {material.readings.slice().reverse().map((reading, idx) => (
                          <div key={idx} className="py-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">
                                {reading.moisturePercent}% •{' '}
                                {reading.workflowPhase === 'install'
                                  ? 'Install'
                                  : `CS Visit #${reading.visitNumber}`}
                              </span>
                              <span className="text-gray-500">
                                {new Date(reading.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            {reading.photo && (
                              <img src={reading.photo} alt="Reading" className="max-h-16 rounded mt-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </details>

                    {/* Update Form */}
                    {selectedMaterialId === material.id && (
                      <div className="mt-4 pt-4 border-t-2 border-entrusted-orange space-y-3">
                        <h5 className="font-medium text-gray-900">Add New Reading</h5>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            <Droplets className="w-3 h-3 inline mr-1" />
                            Moisture % *
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0.0"
                            value={newReading}
                            onChange={(e) => setNewReading(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Any observations..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange text-sm"
                          />
                        </div>
                        <div>
                          {photo ? (
                            <div>
                              <img src={photo} alt="Meter" className="max-h-32 rounded mb-2" />
                              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
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
                              {isUploading ? 'Uploading...' : 'Take Photo (Optional)'}
                            </label>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          onClick={handleAddReading}
                          disabled={!newReading}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Save Reading
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* IICRC Reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          <strong>IICRC Best Practice:</strong> Take readings at the same locations and times each day
          for accurate trend analysis. Materials are considered dry when within 2% of dry standard or below 12%.
        </p>
      </div>
    </div>
  );
};
