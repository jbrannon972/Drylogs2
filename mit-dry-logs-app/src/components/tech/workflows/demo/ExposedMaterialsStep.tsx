import React, { useState } from 'react';
import { Eye, Info } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface ExposedMaterialsStepProps {
  job: any;
  onNext: () => void;
}

export const ExposedMaterialsStep: React.FC<ExposedMaterialsStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const [exposedData, setExposedData] = useState<Record<string, any>>({});

  const affectedRooms = Array.isArray(job?.rooms) ? job.rooms.filter((r: any) => r.affectedStatus === 'affected') : [];

  const materialTypes = [
    'Wood Framing (2x4/2x6)',
    'Subfloor (Plywood/OSB)',
    'Concrete Slab',
    'Insulation (Exposed)',
    'Electrical Wiring',
    'Plumbing Lines',
  ];

  const conditionOptions = ['Wet', 'Damp', 'Dry', 'Damaged'];

  const updateExposedMaterial = (roomId: string, material: string, field: string, value: any) => {
    const roomData = exposedData[roomId] || {};
    const materialData = roomData[material] || {};
    const updated = {
      ...exposedData,
      [roomId]: {
        ...roomData,
        [material]: {
          ...materialData,
          [field]: value,
        },
      },
    };
    setExposedData(updated);
    updateWorkflowData('demo', { exposedMaterials: updated });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Exposed Materials Assessment</h4>
            <p className="text-sm text-blue-800">
              After demo, assess the condition of newly exposed materials. This determines what needs monitoring.
            </p>
          </div>
        </div>
      </div>

      {affectedRooms.map((room: any) => (
        <div key={room.roomId} className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">{room.roomName}</h3>
          <div className="space-y-3">
            {materialTypes.map((material) => (
              <div key={material} className="bg-gray-50 p-3 rounded">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={exposedData[room.roomId]?.[material]?.present || false}
                    onChange={(e) =>
                      updateExposedMaterial(room.roomId, material, 'present', e.target.checked)
                    }
                  />
                  <span className="font-medium text-sm">{material}</span>
                </label>
                {exposedData[room.roomId]?.[material]?.present && (
                  <div className="ml-6 mt-2">
                    <select
                      value={exposedData[room.roomId]?.[material]?.condition || ''}
                      onChange={(e) =>
                        updateExposedMaterial(room.roomId, material, 'condition', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="">Select condition...</option>
                      {conditionOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
