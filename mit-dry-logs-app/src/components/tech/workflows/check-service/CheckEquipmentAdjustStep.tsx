import React, { useState } from 'react';
import { Wind, Plus, Minus, Info, QrCode } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface CheckEquipmentAdjustStepProps {
  job: any;
  onNext: () => void;
}

export const CheckEquipmentAdjustStep: React.FC<CheckEquipmentAdjustStepProps> = ({ job, onNext }) => {
  const { checkServiceData, updateWorkflowData } = useWorkflowStore();
  const [action, setAction] = useState<'add' | 'remove' | null>(null);
  const [equipmentType, setEquipmentType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [room, setRoom] = useState('');
  const [reason, setReason] = useState('');
  const [changes, setChanges] = useState<any[]>([]);

  const addChange = () => {
    if (action && equipmentType && room) {
      const change = {
        action,
        equipmentType,
        serialNumber,
        room,
        reason,
        timestamp: new Date().toISOString(),
      };
      const updated = [...changes, change];
      setChanges(updated);
      updateWorkflowData('checkService', { equipmentAdjustments: updated });

      // Reset form
      setAction(null);
      setEquipmentType('');
      setSerialNumber('');
      setRoom('');
      setReason('');
    }
  };

  const affectedRooms = Array.isArray(job?.rooms) ? job.rooms.filter((r: any) => r.affectedStatus === 'affected') : [];

  // Check if assessment suggests additional equipment needed
  const needsMoreEquipment = () => {
    const assessment = checkServiceData?.dryingAssessment;
    if (!assessment) return false;

    // If estimated days remaining is high and drying is behind schedule
    return assessment.estimatedDaysRemaining > 3;
  };

  // Check if equipment has issues that need replacement
  const hasEquipmentIssues = () => {
    const equipmentStatus = checkServiceData?.equipmentStatus || [];
    return equipmentStatus.some((e: any) => e.status === 'issue' || e.status === 'offline');
  };

  const showRecommendation = needsMoreEquipment() || hasEquipmentIssues();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Equipment Adjustment</h4>
            <p className="text-sm text-blue-800">
              Add or remove equipment based on drying progress and equipment status. Document all changes for billing.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {showRecommendation && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">Recommendations</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            {needsMoreEquipment() && (
              <li>• Consider adding more equipment - drying is progressing slowly</li>
            )}
            {hasEquipmentIssues() && (
              <li>• Replace equipment with issues to maintain proper drying</li>
            )}
          </ul>
        </div>
      )}

      {/* Action Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setAction('add')}
            className={`p-4 border-2 rounded-lg transition-all ${
              action === 'add'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <Plus className="w-6 h-6 mx-auto mb-1 text-green-600" />
            <p className="text-sm font-medium">Add Equipment</p>
          </button>
          <button
            onClick={() => setAction('remove')}
            className={`p-4 border-2 rounded-lg transition-all ${
              action === 'remove'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300'
            }`}
          >
            <Minus className="w-6 h-6 mx-auto mb-1 text-red-600" />
            <p className="text-sm font-medium">Remove Equipment</p>
          </button>
        </div>
      </div>

      {action && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type *</label>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select type...</option>
              <option value="Dehumidifier">Dehumidifier</option>
              <option value="Air Mover">Air Mover</option>
              <option value="Air Scrubber">Air Scrubber</option>
              <option value="Axial Fan">Axial Fan</option>
              <option value="Desiccant Dehumidifier">Desiccant Dehumidifier</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serial Number / Scan Code *
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Scan QR or enter manually"
                className="flex-1"
              />
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <QrCode className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select room...</option>
              {affectedRooms.map((r: any) => (
                <option key={r.roomId} value={r.roomName}>
                  {r.roomName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for {action === 'add' ? 'Addition' : 'Removal'} *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={
                action === 'add'
                  ? 'e.g., Additional coverage needed for faster drying'
                  : 'e.g., Replacing faulty unit, Area sufficiently dry'
              }
            />
          </div>

          <button
            onClick={addChange}
            disabled={!action || !equipmentType || !room || !reason}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Record {action === 'add' ? 'Addition' : 'Removal'}
          </button>
        </>
      )}

      {/* Changes Summary */}
      {changes.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Equipment Changes ({changes.length})</h3>
          <div className="space-y-2">
            {changes.map((change, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <p className={`font-medium ${
                      change.action === 'add' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change.action === 'add' ? '+ Added' : '− Removed'}: {change.equipmentType}
                    </p>
                    <p className="text-sm text-gray-600">{change.room}</p>
                  </div>
                  <span className="text-xs text-gray-500">{change.serialNumber}</span>
                </div>
                <p className="text-sm text-gray-700 italic">{change.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {changes.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            No equipment changes needed? You can skip this step.
          </p>
        </div>
      )}

      {/* Billing Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <span className="font-medium">Billing Note:</span> All equipment changes are automatically tracked for billing.
          {changes.filter(c => c.action === 'add').length > 0 && ' New equipment will be charged from today forward.'}
          {changes.filter(c => c.action === 'remove').length > 0 && ' Removed equipment billing stops today.'}
        </p>
      </div>
    </div>
  );
};
