import React, { useState, useEffect } from 'react';
import { Eye, Info, Camera, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { useToast } from '../../../../contexts/ToastContext';
import { ExposedMaterialPhoto, ConstructionMaterialType } from '../../../../types';

interface ExposedMaterialsStepProps {
  job: any;
  onNext: () => void;
}

export const ExposedMaterialsStep: React.FC<ExposedMaterialsStepProps> = ({ job, onNext }) => {
  const { demoData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const toast = useToast();

  const [exposedPhotos, setExposedPhotos] = useState<ExposedMaterialPhoto[]>(
    demoData.exposedMaterialPhotos || []
  );
  const [checklist, setChecklist] = useState({
    wallCavities: false,
    subfloor: false,
    insulation: false,
    structuralDamage: false,
  });

  const affectedRooms = Array.isArray(job?.rooms) ? job.rooms.filter((r: any) => r.affectedStatus === 'affected') : [];

  // Material types mapped to exposure types
  const materialOptions: { material: ConstructionMaterialType; exposureType: 'wall-cavity' | 'subfloor' | 'structural' | 'insulation'; label: string; icon: string }[] = [
    { material: 'Drywall - Wall', exposureType: 'wall-cavity', label: 'Drywall', icon: '🧱' },
    { material: 'Subfloor', exposureType: 'subfloor', label: 'Subfloor', icon: '🪵' },
    { material: 'Insulation - Wall', exposureType: 'insulation', label: 'Insulation', icon: '🔶' },
    { material: 'Other Trim', exposureType: 'structural', label: 'Other', icon: '📦' },
  ];

  // Preset note options
  const presetNotes = [
    'Mold present',
    'Wet insulation',
    'Structural damage',
    'No issues visible',
  ];

  useEffect(() => {
    updateWorkflowData('demo', {
      exposedMaterialPhotos: exposedPhotos
    });
  }, [exposedPhotos]);

  const handleAddPhoto = async (material: ConstructionMaterialType, exposureType: 'wall-cavity' | 'subfloor' | 'structural' | 'insulation') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file && user && job) {
        try {
          const photoUrl = await uploadPhoto(file, job.jobId, 'demo', 'exposed-material', user.uid);
          if (photoUrl) {
            // Photo auto-tagged with selected material type
            const newPhoto: ExposedMaterialPhoto = {
              photoUrl,
              materialType: material,
              exposureType: exposureType,
              timestamp: new Date().toISOString(),
              notes: '',
            };
            setExposedPhotos([...exposedPhotos, newPhoto]);
          }
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast.error('Failed to upload photo');
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
      toast.warning('Please capture at least 1 photo of exposed materials (wall cavities, subfloor, structural damage, etc.) before proceeding.');
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

      {/* Demo Checklist */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Capture photos of:</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-blue-900">
            <input
              type="checkbox"
              checked={checklist.wallCavities}
              onChange={(e) => setChecklist({ ...checklist, wallCavities: e.target.checked })}
              className="w-4 h-4 rounded border-blue-300"
            />
            <span>Wall cavities (if opened)</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-blue-900">
            <input
              type="checkbox"
              checked={checklist.subfloor}
              onChange={(e) => setChecklist({ ...checklist, subfloor: e.target.checked })}
              className="w-4 h-4 rounded border-blue-300"
            />
            <span>Subfloor (if removed)</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-blue-900">
            <input
              type="checkbox"
              checked={checklist.insulation}
              onChange={(e) => setChecklist({ ...checklist, insulation: e.target.checked })}
              className="w-4 h-4 rounded border-blue-300"
            />
            <span>Insulation (if exposed)</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-blue-900">
            <input
              type="checkbox"
              checked={checklist.structuralDamage}
              onChange={(e) => setChecklist({ ...checklist, structuralDamage: e.target.checked })}
              className="w-4 h-4 rounded border-blue-300"
            />
            <span>Structural damage</span>
          </label>
        </div>
      </div>

      {/* Material-First Photo Buttons */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Select material type to photograph:</h4>
        <div className="grid grid-cols-2 gap-3">
          {materialOptions.map((option) => (
            <Button
              key={option.material}
              variant="secondary"
              onClick={() => handleAddPhoto(option.material, option.exposureType)}
              disabled={isUploading}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Tap a material type to open camera and capture photo
        </p>
      </div>

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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material Type: <span className="font-bold text-gray-900">{photo.materialType}</span>
                    </label>
                    <p className="text-xs text-gray-600">Auto-tagged when photo was taken</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preset Notes (select all that apply):
                    </label>
                    <div className="space-y-2">
                      {presetNotes.map((note) => {
                        const isSelected = photo.notes?.includes(note);
                        return (
                          <button
                            key={note}
                            onClick={() => {
                              const currentNotes = photo.notes || '';
                              let updatedNotes: string;
                              if (isSelected) {
                                // Remove note
                                updatedNotes = currentNotes
                                  .split(', ')
                                  .filter((n) => n !== note)
                                  .join(', ');
                              } else {
                                // Add note
                                updatedNotes = currentNotes
                                  ? `${currentNotes}, ${note}`
                                  : note;
                              }
                              updatePhoto(index, { notes: updatedNotes });
                            }}
                            className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{note}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes (optional)
                    </label>
                    <textarea
                      value={photo.notes || ''}
                      onChange={(e) => updatePhoto(index, { notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={2}
                      placeholder="Add any additional observations..."
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
