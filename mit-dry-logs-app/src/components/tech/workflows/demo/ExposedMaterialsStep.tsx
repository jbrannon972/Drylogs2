import React, { useState, useEffect } from 'react';
import { Eye, Info, Camera, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { ExposedMaterialPhoto, ConstructionMaterialType } from '../../../../types';

interface ExposedMaterialsStepProps {
  job: any;
  onNext: () => void;
}

export const ExposedMaterialsStep: React.FC<ExposedMaterialsStepProps> = ({ job, onNext }) => {
  const { demoData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  const [exposedPhotos, setExposedPhotos] = useState<ExposedMaterialPhoto[]>(
    demoData.exposedMaterialPhotos || []
  );

  const affectedRooms = Array.isArray(job?.rooms) ? job.rooms.filter((r: any) => r.affectedStatus === 'affected') : [];

  // Material types mapped to exposure types
  const materialOptions: { material: ConstructionMaterialType; exposureType: 'wall-cavity' | 'subfloor' | 'structural' | 'insulation' }[] = [
    { material: 'Drywall - Wall', exposureType: 'wall-cavity' },
    { material: 'Drywall - Ceiling', exposureType: 'wall-cavity' },
    { material: 'Subfloor', exposureType: 'subfloor' },
    { material: 'Insulation - Wall', exposureType: 'insulation' },
    { material: 'Insulation - Ceiling/Attic', exposureType: 'insulation' },
    { material: 'Baseboards', exposureType: 'structural' },
    { material: 'Other Trim', exposureType: 'structural' },
  ];

  useEffect(() => {
    updateWorkflowData('demo', {
      exposedMaterialPhotos: exposedPhotos
    });
  }, [exposedPhotos]);

  const handleAddPhoto = async (roomId: string, roomName: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file && user && job) {
        try {
          const photoUrl = await uploadPhoto(file, job.jobId, roomId, 'exposed-material', user.uid);
          if (photoUrl) {
            // Add placeholder - user will fill in details
            const newPhoto: ExposedMaterialPhoto = {
              photoUrl,
              materialType: 'Drywall - Wall', // Default
              exposureType: 'wall-cavity',
              timestamp: new Date().toISOString(),
              notes: '',
            };
            setExposedPhotos([...exposedPhotos, newPhoto]);
          }
        } catch (error) {
          console.error('Error uploading photo:', error);
          alert('Failed to upload photo');
        }
      }
    };
    input.click();
  };

  const updatePhoto = (index: number, updates: Partial<ExposedMaterialPhoto>) => {
    const updated = [...exposedPhotos];
    updated[index] = { ...updated[index], ...updates };
    setExposedPhotos(updated);
  };

  const deletePhoto = (index: number) => {
    setExposedPhotos(exposedPhotos.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    // PHASE 3: At least 1 photo of exposed materials required
    return exposedPhotos.length >= 1;
  };

  const handleNext = () => {
    if (!canProceed()) {
      alert('Please capture at least 1 photo of exposed materials (wall cavities, subfloor, structural damage, etc.) before proceeding.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* PHASE 3: Mandatory Hidden Damage Photos */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-900 mb-1">REQUIRED: Exposed Materials Documentation</h4>
            <p className="text-sm text-orange-900">
              After demo, you must photograph what was hidden behind walls, under floors, etc.
              This proves the damage extended beyond visible areas.
            </p>
            <p className="text-sm text-orange-800 mt-2">
              <strong>Minimum 1 photo required:</strong> Wall cavities, subfloor, structural damage, or insulation
            </p>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`p-4 rounded-lg ${
        canProceed() ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <p className={`text-sm font-medium ${canProceed() ? 'text-green-900' : 'text-yellow-900'}`}>
          {canProceed() ? (
            <>
              <CheckCircle className="w-4 h-4 inline mr-1" />
              {exposedPhotos.length} photo(s) captured - Requirement met!
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 inline mr-1" />
              No photos yet - At least 1 required
            </>
          )}
        </p>
      </div>

      {/* Add Photo Button */}
      <Button
        variant="primary"
        onClick={() => handleAddPhoto('demo', 'Demo Area')}
        disabled={isUploading}
        className="w-full"
      >
        <Camera className="w-5 h-5" />
        {isUploading ? 'Uploading...' : 'Take Exposed Material Photo'}
      </Button>

      {/* Photos List */}
      {exposedPhotos.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Captured Photos ({exposedPhotos.length})</h3>
          {exposedPhotos.map((photo, index) => (
            <div key={index} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
              <div className="flex gap-4">
                {/* Photo Thumbnail */}
                <div className="relative">
                  <img
                    src={photo.photoUrl}
                    alt={`Exposed ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => deletePhoto(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Photo Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Type *
                    </label>
                    <select
                      value={photo.materialType}
                      onChange={(e) => updatePhoto(index, { materialType: e.target.value as ConstructionMaterialType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {materialOptions.map((opt) => (
                        <option key={opt.material} value={opt.material}>
                          {opt.material}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exposure Type *
                    </label>
                    <select
                      value={photo.exposureType}
                      onChange={(e) => updatePhoto(index, { exposureType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="wall-cavity">Wall Cavity</option>
                      <option value="subfloor">Subfloor</option>
                      <option value="structural">Structural</option>
                      <option value="insulation">Insulation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={photo.notes || ''}
                      onChange={(e) => updatePhoto(index, { notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={2}
                      placeholder="Describe what's visible in this photo..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900">
              <strong>What to photograph:</strong> Take photos of what was revealed after removing materials.
              Examples: studs behind drywall, plywood under carpet, joists under subfloor, wet insulation, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div></div>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          Continue to Post-Demo Readings
        </Button>
      </div>
    </div>
  );
};
