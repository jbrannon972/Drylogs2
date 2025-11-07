import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../../../stores/workflowStore';

interface DemoModalProps {
  jobId: string;
  currentRoom?: string;
  onClose: () => void;
}

type DemoReason = 'unsalvageable' | 'contaminated' | 'facilitate-drying' | 'structural-compromise' | 'microbial-growth' | 'access-leak' | 'investigative' | 'other';

const MATERIAL_OPTIONS = [
  'Drywall',
  'Baseboards',
  'Carpet',
  'Pad',
  'Vinyl Flooring',
  'Laminate Flooring',
  'Hardwood Flooring',
  'Tile',
  'Insulation',
  'Cabinets',
  'Vanity',
  'Other',
];

const DEMO_REASONS: { value: DemoReason; label: string }[] = [
  { value: 'unsalvageable', label: 'Unsalvageable (IICRC S500)' },
  { value: 'contaminated', label: 'Contaminated Material' },
  { value: 'facilitate-drying', label: 'Facilitate Drying' },
  { value: 'structural-compromise', label: 'Structural Compromise' },
  { value: 'microbial-growth', label: 'Microbial Growth' },
  { value: 'access-leak', label: 'To Access Source of Loss' },
  { value: 'investigative', label: 'Investigative Demo - Determine extent' },
  { value: 'other', label: 'Other' },
];

export const DemoModal: React.FC<DemoModalProps> = ({
  jobId,
  currentRoom,
  onClose,
}) => {
  const { installData, updateWorkflowData } = useWorkflowStore();

  const [room, setRoom] = useState(currentRoom || '');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [reason, setReason] = useState<DemoReason>('unsalvageable');
  const [notes, setNotes] = useState('');

  const rooms = installData.rooms || [];

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const handleSave = () => {
    if (!room.trim()) {
      alert('Please select a room.');
      return;
    }

    if (selectedMaterials.length === 0) {
      alert('Please select at least one material.');
      return;
    }

    const newDemo = {
      id: `demo-${Date.now()}`,
      room: room.trim(),
      materials: selectedMaterials,
      reason,
      notes: notes.trim(),
      loggedAt: new Date().toISOString(),
      loggedDuringStep: installData.currentStep || 'unknown',
    };

    const existingDemos = installData.quickActionDemos || [];

    updateWorkflowData('install', {
      quickActionDemos: [...existingDemos, newDemo],
    });

    alert('Demo work logged successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Log Demo Work</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room <span className="text-red-500">*</span>
            </label>
            {rooms.length > 0 ? (
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select room...</option>
                {rooms.map((r: any) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Materials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materials <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MATERIAL_OPTIONS.map((material) => (
                <button
                  key={material}
                  onClick={() => toggleMaterial(material)}
                  className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                    selectedMaterials.includes(material)
                      ? 'bg-orange-100 text-orange-800 border-2 border-orange-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Removal <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DemoReason)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {DEMO_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!room.trim() || selectedMaterials.length === 0}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              !room.trim() || selectedMaterials.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            Log Demo
          </button>
        </div>
      </div>
    </div>
  );
};
