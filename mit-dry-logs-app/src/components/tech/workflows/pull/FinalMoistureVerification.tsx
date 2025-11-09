import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, Camera, Droplets, FileText, AlertCircle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { Button } from '../../../shared/Button';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import {
  MaterialMoistureTracking,
  MoistureReadingEntry,
  DryingReleaseWaiver,
  getMoistureTrend,
  isMaterialDry,
} from '../../../../types';

interface FinalMoistureVerificationProps {
  job: any;
  onNext: () => void;
}

export const FinalMoistureVerification: React.FC<FinalMoistureVerificationProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  // Load moisture tracking from install
  const [moistureTracking, setMoistureTracking] = useState<MaterialMoistureTracking[]>(
    installData?.moistureTracking || []
  );

  // Current material being verified
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [finalReading, setFinalReading] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const selectedMaterial = moistureTracking.find(m => m.id === selectedMaterialId);

  // Save to workflow store
  useEffect(() => {
    updateWorkflowData('install', { moistureTracking });
    updateWorkflowData('pull', {
      finalMoistureVerificationComplete: allMaterialsDry,
      verifiedAt: new Date().toISOString(),
    });
  }, [moistureTracking]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user && selectedMaterial) {
      const url = await uploadPhoto(file, job.jobId, selectedMaterial.roomName, 'final', user.uid);
      if (url) setPhoto(url);
    }
  };

  const handleAddFinalReading = () => {
    if (!selectedMaterial || !finalReading) {
      alert('Please enter a final moisture reading');
      return;
    }

    // PHASE 1: Photo is REQUIRED for final readings
    if (!photo) {
      alert('Photo is required! Please take a photo showing the final moisture meter reading and the material.');
      return;
    }

    const readingNum = parseFloat(finalReading);

    // Create final reading entry
    const entry: MoistureReadingEntry = {
      timestamp: new Date().toISOString(),
      moisturePercent: readingNum,
      photo: photo || undefined,
      technicianId: user?.uid || 'unknown',
      technicianName: user?.displayName || 'Unknown Tech',
      workflowPhase: 'pull',
      notes,
    };

    // Calculate trend
    const lastReading = selectedMaterial.readings[selectedMaterial.readings.length - 1];
    const trend = getMoistureTrend(readingNum, lastReading.moisturePercent);

    // Update tracking record
    const updatedTracking = moistureTracking.map(m => {
      if (m.id === selectedMaterialId) {
        const newStatus: 'wet' | 'drying' | 'dry' = isMaterialDry(readingNum, m.dryStandard) ? 'dry' : 'wet';

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
    setFinalReading('');
    setPhoto(null);
    setNotes('');
  };

  // Calculate statistics
  const totalMaterials = moistureTracking.length;
  const verifiedMaterials = moistureTracking.filter(m => {
    const lastReading = m.readings[m.readings.length - 1];
    return lastReading.workflowPhase === 'pull';
  }).length;
  const dryMaterials = moistureTracking.filter(m => {
    const lastReading = m.readings[m.readings.length - 1];
    return isMaterialDry(lastReading.moisturePercent, m.dryStandard);
  }).length;
  const wetMaterials = totalMaterials - dryMaterials;
  const allMaterialsVerified = verifiedMaterials === totalMaterials;
  const allMaterialsDry = dryMaterials === totalMaterials && allMaterialsVerified;

  // Group by room
  const materialsByRoom = moistureTracking.reduce((acc, material) => {
    if (!acc[material.roomId]) {
      acc[material.roomId] = [];
    }
    acc[material.roomId].push(material);
    return acc;
  }, {} as Record<string, MaterialMoistureTracking[]>);

  if (totalMaterials === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
        <p className="text-gray-700 font-medium mb-2">No Moisture Tracking Records Found</p>
        <p className="text-sm text-gray-600">
          Moisture readings are set up during the Install workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PHASE 1: Instructions with DRW option */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Final Moisture Verification - Tracked Materials List
            </h4>
            <p className="text-sm text-blue-800">
              Before pulling equipment, verify ALL materials from the tracked materials list. Take final readings
              at the exact same locations as initial readings.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              <strong>PHASE 1 Requirements:</strong>
            </p>
            <ul className="text-sm text-blue-800 list-disc ml-5 mt-1">
              <li>Photo REQUIRED for each final reading (meter + material visible)</li>
              <li>Materials must be within 2% of dry standard or below 12% (IICRC)</li>
              <li>If pulling equipment while materials still wet, create Drying Release Waiver (DRW)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`border-2 rounded-lg p-5 ${
        allMaterialsDry
          ? 'border-green-500 bg-green-50'
          : wetMaterials > 0
          ? 'border-red-500 bg-red-50'
          : 'border-yellow-500 bg-yellow-50'
      }`}>
        <div className="flex items-start gap-4">
          {allMaterialsDry ? (
            <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-12 h-12 text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {allMaterialsDry
                ? '✓ All Materials Dry - Ready for Pull'
                : wetMaterials > 0
                ? `⚠️ ${wetMaterials} Material${wetMaterials !== 1 ? 's' : ''} Still Wet`
                : 'Verification In Progress'}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Materials</p>
                <p className="text-2xl font-bold text-gray-900">{totalMaterials}</p>
              </div>
              <div>
                <p className="text-gray-600">Dry Materials</p>
                <p className="text-2xl font-bold text-green-600">{dryMaterials}</p>
              </div>
              <div>
                <p className="text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-blue-600">{verifiedMaterials}/{totalMaterials}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if materials still wet */}
      {wetMaterials > 0 && allMaterialsVerified && (
        <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Cannot Pull - Materials Not Dry</h4>
              <p className="text-sm text-red-800">
                Some materials are still above acceptable moisture levels. Pulling equipment now may result
                in secondary damage and customer dissatisfaction. Consider:
              </p>
              <ul className="text-sm text-red-800 mt-2 space-y-1">
                <li>• Extending drying time with equipment in place</li>
                <li>• Checking for proper air circulation and dehumidification</li>
                <li>• Investigating hidden moisture sources</li>
                <li>• Consulting with PSM before pulling equipment</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Materials by Room */}
      {Object.entries(materialsByRoom).map(([roomId, materials]) => {
        const roomName = materials[0]?.roomName || 'Unknown Room';
        const roomDry = materials.every(m => {
          const lastReading = m.readings[m.readings.length - 1];
          return isMaterialDry(lastReading.moisturePercent, m.dryStandard);
        });

        return (
          <div key={roomId} className="border rounded-lg p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">{roomName}</h3>
              {roomDry ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Room Dry
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Still Drying
                </span>
              )}
            </div>
            <div className="space-y-3">
              {materials.map((material) => {
                const lastReading = material.readings[material.readings.length - 1];
                const isVerifiedToday = lastReading.workflowPhase === 'pull';
                const isDry = isMaterialDry(lastReading.moisturePercent, material.dryStandard);
                const initialReading = material.readings[0];

                return (
                  <div
                    key={material.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      selectedMaterialId === material.id
                        ? 'border-entrusted-orange bg-orange-50'
                        : isVerifiedToday && isDry
                        ? 'border-green-300 bg-green-50'
                        : isDry
                        ? 'border-green-200'
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isDry ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              DRY
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                              <AlertTriangle className="w-4 h-4 inline mr-1" />
                              WET
                            </span>
                          )}
                          {isVerifiedToday && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Final Reading Taken
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900">{material.material}</h4>
                        <p className="text-sm text-gray-600">{material.location}</p>
                      </div>
                      {!isVerifiedToday && (
                        <Button
                          variant={selectedMaterialId === material.id ? 'secondary' : 'primary'}
                          onClick={() => setSelectedMaterialId(selectedMaterialId === material.id ? null : material.id)}
                        >
                          {selectedMaterialId === material.id ? 'Cancel' : 'Verify'}
                        </Button>
                      )}
                    </div>

                    {/* Reading Summary */}
                    <div className="grid grid-cols-4 gap-3 text-sm mb-3 p-3 bg-white rounded">
                      <div>
                        <p className="text-gray-600 text-xs">Dry Standard</p>
                        <p className="font-bold text-blue-600">{material.dryStandard}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Initial (Install)</p>
                        <p className="font-medium text-gray-700">{initialReading.moisturePercent}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Current</p>
                        <p className={`font-bold ${isDry ? 'text-green-600' : 'text-red-600'}`}>
                          {lastReading.moisturePercent}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Total Reduction</p>
                        <p className="font-bold text-green-600">
                          -{(initialReading.moisturePercent - lastReading.moisturePercent).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Complete Reading History */}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-900 mb-2 font-medium">
                        Complete History ({material.readings.length} readings over {Math.ceil((new Date(material.lastReadingAt).getTime() - new Date(material.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days)
                      </summary>
                      <div className="space-y-2 pl-4 border-l-2 border-gray-200 mt-2">
                        {material.readings.slice().reverse().map((reading, idx) => {
                          const readingIsDry = isMaterialDry(reading.moisturePercent, material.dryStandard);
                          return (
                            <div key={idx} className="py-1">
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${readingIsDry ? 'text-green-700' : 'text-red-700'}`}>
                                  {reading.moisturePercent}% {readingIsDry && '✓'}
                                </span>
                                <span className="text-gray-600">
                                  {reading.workflowPhase === 'install'
                                    ? 'Install'
                                    : reading.workflowPhase === 'pull'
                                    ? 'Final'
                                    : `CS #${reading.visitNumber}`}
                                  {' • '}
                                  {new Date(reading.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              {reading.notes && (
                                <p className="text-gray-600 italic mt-1">{reading.notes}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </details>

                    {/* Verify Form */}
                    {selectedMaterialId === material.id && (
                      <div className="mt-4 pt-4 border-t-2 border-entrusted-orange space-y-3">
                        <h5 className="font-medium text-gray-900">Final Reading</h5>
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
                            value={finalReading}
                            onChange={(e) => setFinalReading(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Final observations..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            <Camera className="w-3 h-3 inline mr-1" />
                            Photo (Required) *
                          </label>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-2">
                            <p className="text-xs text-orange-900">
                              <strong>REQUIRED:</strong> Final photo must show meter display AND material tested
                            </p>
                          </div>
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
                            <label className="btn-primary cursor-pointer inline-flex items-center gap-2 w-full justify-center">
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                disabled={isUploading}
                              />
                              <Camera className="w-4 h-4" />
                              {isUploading ? 'Uploading...' : 'Take Final Photo (Required)'}
                            </label>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          onClick={handleAddFinalReading}
                          disabled={!finalReading || !photo}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Save Final Reading
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

      {/* Completion Status */}
      {allMaterialsVerified && (
        <div className={`border-2 rounded-lg p-4 ${
          allMaterialsDry ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
        }`}>
          {allMaterialsDry ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ✓ Final Moisture Verification Complete
              </h3>
              <p className="text-gray-700">
                All materials have been verified dry. Equipment can be safely pulled.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-yellow-600 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Verification Complete - Materials Still Drying
              </h3>
              <p className="text-gray-700">
                All materials have been checked, but {wetMaterials} {wetMaterials === 1 ? 'is' : 'are'} still wet.
                Do NOT pull equipment until all materials are dry.
              </p>
            </div>
          )}
        </div>
      )}

      {/* IICRC Reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          <strong>IICRC S500 Standard:</strong> Materials must reach dry standard (within 2% of baseline) or
          below 12% moisture content before equipment removal. Premature equipment pull may result in secondary
          damage and mold growth.
        </p>
      </div>
    </div>
  );
};
