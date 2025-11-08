import React, { useState } from 'react';
import { Wind, QrCode, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface EquipmentRemovalStepProps {
  job: any;
  onNext: () => void;
}

interface RemovedEquipment {
  equipmentId: string;
  type: string;
  serialNumber: string;
  location: string;
  condition: 'good' | 'needs-cleaning' | 'needs-repair' | 'damaged';
  needsDecontamination: boolean;
  notes?: string;
  removedTimestamp: string;
}

export const EquipmentRemovalStep: React.FC<EquipmentRemovalStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const [removedEquipment, setRemovedEquipment] = useState<RemovedEquipment[]>([]);

  // ULTRAFAULT: Defensive array check to prevent .map() errors
  const installedEquipment = Array.isArray(job?.equipment) ? job.equipment : [];
  const waterCategory = job?.insuranceInfo?.categoryOfWater || 'Category 1';
  const requiresDecontamination = waterCategory === 'Category 2' || waterCategory === 'Category 3';

  React.useEffect(() => {
    updateWorkflowData('pull', {
      removedEquipment,
      equipmentRemovalComplete: removedEquipment.length === installedEquipment.length,
    });
  }, [removedEquipment]);

  const removeEquipment = (
    equipmentId: string,
    condition: 'good' | 'needs-cleaning' | 'needs-repair' | 'damaged',
    needsDecontamination: boolean,
    notes?: string
  ) => {
    const equipment = installedEquipment.find((e: any) => e.equipmentId === equipmentId);
    if (!equipment) return;

    const removed: RemovedEquipment = {
      equipmentId,
      type: equipment.type,
      serialNumber: equipment.serialNumber,
      location: equipment.location,
      condition,
      needsDecontamination,
      notes,
      removedTimestamp: new Date().toISOString(),
    };

    setRemovedEquipment(prev => [...prev, removed]);
  };

  const undoRemoval = (equipmentId: string) => {
    setRemovedEquipment(prev => prev.filter(e => e.equipmentId !== equipmentId));
  };

  const isRemoved = (equipmentId: string) => {
    return removedEquipment.some(e => e.equipmentId === equipmentId);
  };

  const getRemovalData = (equipmentId: string) => {
    return removedEquipment.find(e => e.equipmentId === equipmentId);
  };

  const decontaminationCount = removedEquipment.filter(e => e.needsDecontamination).length;
  const needsRepairCount = removedEquipment.filter(e => e.condition === 'needs-repair' || e.condition === 'damaged').length;

  const allRemoved = installedEquipment.length > 0 && removedEquipment.length === installedEquipment.length;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Equipment Removal & Tracking</h4>
            <p className="text-sm text-blue-800">
              Scan or manually record each piece of equipment as you remove it. Document condition and decontamination needs for billing.
            </p>
          </div>
        </div>
      </div>

      {/* Water Category Notice */}
      {requiresDecontamination && (
        <div className={`border rounded-lg p-4 ${
          waterCategory === 'Category 3' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              waterCategory === 'Category 3' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <h4 className={`font-medium mb-1 ${
                waterCategory === 'Category 3' ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {waterCategory} - Equipment Decontamination Required
              </h4>
              <p className={`text-sm ${
                waterCategory === 'Category 3' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                All equipment must be marked for decontamination.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Removal Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {removedEquipment.length}/{installedEquipment.length}
            </p>
            <p className="text-xs text-gray-600">Removed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{decontaminationCount}</p>
            <p className="text-xs text-gray-600">Need Decon</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{needsRepairCount}</p>
            <p className="text-xs text-gray-600">Need Repair</p>
          </div>
        </div>

        {decontaminationCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
            <p>
              <span className="font-medium">Decontamination Required:</span> {decontaminationCount} {decontaminationCount === 1 ? 'unit' : 'units'}
            </p>
          </div>
        )}
      </div>

      {/* Equipment List */}
      {installedEquipment.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No equipment found on this job. Equipment should have been added during Install workflow.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {installedEquipment.map((equipment: any) => {
            const removed = isRemoved(equipment.equipmentId);
            const removalData = getRemovalData(equipment.equipmentId);

            return (
              <EquipmentCard
                key={equipment.equipmentId}
                equipment={equipment}
                removed={removed}
                removalData={removalData}
                requiresDecontamination={requiresDecontamination}
                onRemove={(condition, needsDecon, notes) =>
                  removeEquipment(equipment.equipmentId, condition, needsDecon, notes)
                }
                onUndo={() => undoRemoval(equipment.equipmentId)}
              />
            );
          })}
        </div>
      )}

      {/* Completion Check */}
      {allRemoved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">✓ All Equipment Removed</h4>
              <p className="text-sm text-green-800">
                All {installedEquipment.length} pieces have been accounted for and removed from the job site.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface EquipmentCardProps {
  equipment: any;
  removed: boolean;
  removalData?: RemovedEquipment;
  requiresDecontamination: boolean;
  onRemove: (condition: 'good' | 'needs-cleaning' | 'needs-repair' | 'damaged', needsDecon: boolean, notes?: string) => void;
  onUndo: () => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  removed,
  removalData,
  requiresDecontamination,
  onRemove,
  onUndo,
}) => {
  const [condition, setCondition] = useState<'good' | 'needs-cleaning' | 'needs-repair' | 'damaged'>('good');
  const [needsDecon, setNeedsDecon] = useState(requiresDecontamination);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleRemove = () => {
    onRemove(condition, needsDecon, notes);
    setShowForm(false);
  };

  if (removed && removalData) {
    return (
      <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-gray-900">{removalData.type}</h4>
              <p className="text-sm text-gray-600">{removalData.location}</p>
              <p className="text-xs text-gray-500">SN: {removalData.serialNumber}</p>
            </div>
          </div>
          <button
            onClick={onUndo}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Undo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-xs text-gray-600">Condition</label>
            <p className="font-medium capitalize">{removalData.condition.replace('-', ' ')}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Decontamination</label>
            <p className="font-medium">{removalData.needsDecontamination ? 'Required' : 'Not needed'}</p>
          </div>
        </div>

        {removalData.notes && (
          <div className="mt-2 text-sm">
            <label className="text-xs text-gray-600">Notes</label>
            <p className="text-gray-700">{removalData.notes}</p>
          </div>
        )}
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="border-2 border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wind className="w-6 h-6 text-gray-600" />
            <div>
              <h4 className="font-semibold text-gray-900">{equipment.type}</h4>
              <p className="text-sm text-gray-600">{equipment.location}</p>
              <p className="text-xs text-gray-500">SN: {equipment.serialNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <QrCode className="w-4 h-4 mr-2 inline" />
            Remove Equipment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <Wind className="w-6 h-6 text-blue-600" />
        <div>
          <h4 className="font-semibold text-gray-900">{equipment.type}</h4>
          <p className="text-sm text-gray-600">{equipment.location}</p>
          <p className="text-xs text-gray-500">SN: {equipment.serialNumber}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="good">Good - Ready to reuse</option>
            <option value="needs-cleaning">Needs Cleaning</option>
            <option value="needs-repair">Needs Repair</option>
            <option value="damaged">Damaged - Unusable</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={needsDecon}
              onChange={(e) => setNeedsDecon(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-gray-900">
              Needs Decontamination
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any issues or observations..."
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRemove}
            className="flex-1 btn-primary"
          >
            Confirm Removal
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
