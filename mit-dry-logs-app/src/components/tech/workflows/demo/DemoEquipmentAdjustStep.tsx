import React, { useState } from 'react';
import { Wind, Plus, Minus, Info, QrCode } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface DemoEquipmentAdjustStepProps {
  job: any;
  onNext: () => void;
}

export const DemoEquipmentAdjustStep: React.FC<DemoEquipmentAdjustStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const [action, setAction] = useState<'add' | 'remove' | null>(null);
  const [equipmentType, setEquipmentType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [room, setRoom] = useState('');
  const [changes, setChanges] = useState<any[]>([]);

  const addChange = () => {
    if (action && equipmentType && room) {
      const change = {
        action,
        equipmentType,
        serialNumber,
        room,
        timestamp: new Date().toISOString(),
      };
      const updated = [...changes, change];
      setChanges(updated);
      updateWorkflowData('demo', { equipmentChanges: updated });
      // Reset form
      setAction(null);
      setEquipmentType('');
      setSerialNumber('');
      setRoom('');
    }
  };

  const affectedRooms = job.rooms?.filter((r: any) => r.affectedStatus === 'affected') || [];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Equipment Adjustment</h4>
            <p className="text-sm text-blue-800">
              After demo, you may need to add more equipment or reposition existing units. Document all changes.
            </p>
          </div>
        </div>
      </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select type...</option>
              <option value="Dehumidifier">Dehumidifier</option>
              <option value="Air Mover">Air Mover</option>
              <option value="Air Scrubber">Air Scrubber</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number / Scan Code</label>
            <Input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Scan QR or enter manually"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
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

          <button
            onClick={addChange}
            disabled={!action || !equipmentType || !room}
            className="w-full btn-primary"
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
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">
                    {change.action === 'add' ? '+ Added' : '− Removed'}: {change.equipmentType}
                  </p>
                  <p className="text-sm text-gray-600">{change.room}</p>
                </div>
                <span className="text-xs text-gray-500">{change.serialNumber}</span>
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
    </div>
  );
};
