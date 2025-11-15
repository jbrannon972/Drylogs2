import React, { useState } from 'react';
import { Trash2, Plus, X, Camera, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/Button';

interface PartialDemoMaterial {
  materialType: string;
  quantity: number;
  unit: 'sqft' | 'linear-ft' | 'each';
  notes: string;
}

interface PartialDemoRoom {
  roomId: string;
  roomName: string;
  materialsRemoved: PartialDemoMaterial[];
  demoTimeMinutes: number;
  photos: string[];
  notes: string;
}

interface PartialDemoFormProps {
  rooms: any[]; // Available rooms
  onSave: (demoData: PartialDemoRoom[]) => void;
  initialData?: PartialDemoRoom[];
}

const COMMON_MATERIALS = [
  { label: 'Drywall', defaultUnit: 'sqft' as const },
  { label: 'Flooring', defaultUnit: 'sqft' as const },
  { label: 'Carpet', defaultUnit: 'sqft' as const },
  { label: 'Carpet Pad', defaultUnit: 'sqft' as const },
  { label: 'Baseboard', defaultUnit: 'linear-ft' as const },
  { label: 'Insulation', defaultUnit: 'sqft' as const },
  { label: 'Tile', defaultUnit: 'sqft' as const },
  { label: 'Other', defaultUnit: 'each' as const },
];

export const PartialDemoForm: React.FC<PartialDemoFormProps> = ({ rooms, onSave, initialData }) => {
  const [demoRooms, setDemoRooms] = useState<PartialDemoRoom[]>(initialData || []);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const handleAddRoom = () => {
    if (!selectedRoomId) return;

    const room = rooms.find(r => r.roomId === selectedRoomId);
    if (!room) return;

    // Check if room already added
    if (demoRooms.some(dr => dr.roomId === selectedRoomId)) {
      alert('This room has already been added to partial demo');
      return;
    }

    const newDemoRoom: PartialDemoRoom = {
      roomId: room.roomId,
      roomName: room.roomName,
      materialsRemoved: [],
      demoTimeMinutes: 0,
      photos: [],
      notes: ''
    };

    setDemoRooms([...demoRooms, newDemoRoom]);
    setSelectedRoomId('');
    setShowAddRoom(false);
  };

  const handleRemoveRoom = (roomId: string) => {
    setDemoRooms(demoRooms.filter(dr => dr.roomId !== roomId));
  };

  const handleAddMaterial = (roomId: string) => {
    setDemoRooms(demoRooms.map(dr => {
      if (dr.roomId === roomId) {
        return {
          ...dr,
          materialsRemoved: [
            ...dr.materialsRemoved,
            { materialType: 'Drywall', quantity: 0, unit: 'sqft', notes: '' }
          ]
        };
      }
      return dr;
    }));
  };

  const handleUpdateMaterial = (
    roomId: string,
    materialIndex: number,
    field: keyof PartialDemoMaterial,
    value: any
  ) => {
    setDemoRooms(demoRooms.map(dr => {
      if (dr.roomId === roomId) {
        return {
          ...dr,
          materialsRemoved: dr.materialsRemoved.map((mat, idx) =>
            idx === materialIndex ? { ...mat, [field]: value } : mat
          )
        };
      }
      return dr;
    }));
  };

  const handleRemoveMaterial = (roomId: string, materialIndex: number) => {
    setDemoRooms(demoRooms.map(dr => {
      if (dr.roomId === roomId) {
        return {
          ...dr,
          materialsRemoved: dr.materialsRemoved.filter((_, idx) => idx !== materialIndex)
        };
      }
      return dr;
    }));
  };

  const handleUpdateRoomField = (
    roomId: string,
    field: 'demoTimeMinutes' | 'notes',
    value: any
  ) => {
    setDemoRooms(demoRooms.map(dr =>
      dr.roomId === roomId ? { ...dr, [field]: value } : dr
    ));
  };

  const getTotalDemoTime = () => {
    return demoRooms.reduce((total, dr) => total + dr.demoTimeMinutes, 0);
  };

  const handleSave = () => {
    // Validation
    for (const room of demoRooms) {
      if (room.materialsRemoved.length === 0) {
        alert(`Please add at least one material removed for ${room.roomName}`);
        return;
      }
      for (const mat of room.materialsRemoved) {
        if (!mat.quantity || mat.quantity <= 0) {
          alert(`Please enter a valid quantity for ${mat.materialType} in ${room.roomName}`);
          return;
        }
      }
    }

    onSave(demoRooms);
  };

  return (
    <div className="space-y-4 mt-6 pt-6 border-t-2 border-orange-200">
      {/* Header */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Trash2 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-1">
              Demo Work Performed During Install
            </h3>
            <p className="text-sm text-orange-700">
              Log any demolition work completed during the install phase. This is for <strong>partial demo only</strong> —
              not the full scheduled demo workflow.
            </p>
            {getTotalDemoTime() > 0 && (
              <p className="text-sm text-orange-800 font-medium mt-2">
                Total Demo Time: {getTotalDemoTime()} minutes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Demo Rooms */}
      {demoRooms.map((demoRoom) => (
        <div key={demoRoom.roomId} className="border-2 border-gray-300 rounded-lg p-3 bg-white">
          {/* Room Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-orange-600" />
              {demoRoom.roomName}
            </h4>
            <button
              onClick={() => handleRemoveRoom(demoRoom.roomId)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove this room"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Materials Removed */}
          <div className="space-y-3 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Materials Removed:
            </label>
            {demoRoom.materialsRemoved.map((material, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                {/* Material Type */}
                <select
                  value={material.materialType}
                  onChange={(e) => {
                    const selectedMat = COMMON_MATERIALS.find(m => m.label === e.target.value);
                    handleUpdateMaterial(demoRoom.roomId, idx, 'materialType', e.target.value);
                    if (selectedMat) {
                      handleUpdateMaterial(demoRoom.roomId, idx, 'unit', selectedMat.defaultUnit);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {COMMON_MATERIALS.map(mat => (
                    <option key={mat.label} value={mat.label}>{mat.label}</option>
                  ))}
                </select>

                {/* Quantity */}
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={material.quantity || ''}
                  onChange={(e) => handleUpdateMaterial(demoRoom.roomId, idx, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                />

                {/* Unit */}
                <select
                  value={material.unit}
                  onChange={(e) => handleUpdateMaterial(demoRoom.roomId, idx, 'unit', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="sqft">Sq Ft</option>
                  <option value="linear-ft">Lin Ft</option>
                  <option value="each">Each</option>
                </select>

                {/* Remove Material Button */}
                <button
                  onClick={() => handleRemoveMaterial(demoRoom.roomId, idx)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Remove material"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add Material Button */}
            <button
              onClick={() => handleAddMaterial(demoRoom.roomId)}
              className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Material
            </button>
          </div>

          {/* Demo Time */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demo Time (minutes):
            </label>
            <input
              type="number"
              min="0"
              value={demoRoom.demoTimeMinutes || ''}
              onChange={(e) => handleUpdateRoomField(demoRoom.roomId, 'demoTimeMinutes', parseInt(e.target.value) || 0)}
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="0"
            />
            <span className="ml-2 text-sm text-gray-500">minutes</span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes:
            </label>
            <textarea
              value={demoRoom.notes}
              onChange={(e) => handleUpdateRoomField(demoRoom.roomId, 'notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              placeholder="Any details about the demo work performed..."
            />
          </div>
        </div>
      ))}

      {/* Add Room Button */}
      {demoRooms.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">No rooms added yet</p>
          <Button variant="primary" onClick={() => setShowAddRoom(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room with Demo Work
          </Button>
        </div>
      ) : (
        !showAddRoom && (
          <button
            onClick={() => setShowAddRoom(true)}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Another Room
          </button>
        )
      )}

      {/* Add Room Selector */}
      {showAddRoom && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Room:
          </label>
          <div className="flex gap-2">
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Select a room --</option>
              {rooms
                .filter(r => !demoRooms.some(dr => dr.roomId === r.roomId))
                .map(room => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.roomName}
                  </option>
                ))}
            </select>
            <Button variant="primary" onClick={handleAddRoom} disabled={!selectedRoomId}>
              Add
            </Button>
            <Button variant="secondary" onClick={() => setShowAddRoom(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Save Summary */}
      {demoRooms.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-medium text-green-900 mb-2">
            ✓ Partial Demo Summary
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            {demoRooms.map(dr => (
              <li key={dr.roomId}>
                <strong>{dr.roomName}:</strong> {dr.materialsRemoved.length} material(s) removed
                {dr.demoTimeMinutes > 0 && ` (${dr.demoTimeMinutes} min)`}
              </li>
            ))}
          </ul>
          <p className="text-sm text-green-700 mt-2">
            <strong>Total Demo Time:</strong> {getTotalDemoTime()} minutes
          </p>
        </div>
      )}
    </div>
  );
};
