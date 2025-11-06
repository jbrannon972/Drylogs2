import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Plus, Trash2, Home, AlertCircle } from 'lucide-react';
import { RoomType } from '../../../../types';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface RoomDimensionsStepProps {
  job: any;
  onNext: () => void;
}

interface RoomData {
  id: string;
  name: string;
  type: RoomType;
  length: number;
  width: number;
  height: number;
  floorSqFt: number;
  wallSqFt: number;
  ceilingSqFt: number;
  totalSurfaceArea: number;
}

export const RoomDimensionsStep: React.FC<RoomDimensionsStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const [rooms, setRooms] = useState<RoomData[]>(installData.rooms || []);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'Bedroom' as RoomType,
    length: '',
    width: '',
    height: '8',
  });

  // Auto-calculate surface areas
  const calculateSurfaceAreas = (length: number, width: number, height: number) => {
    const floorSqFt = length * width;
    const perimeter = 2 * (length + width);
    const wallSqFt = perimeter * height;
    const ceilingSqFt = length * width;
    const totalSurfaceArea = floorSqFt + wallSqFt + ceilingSqFt;

    return { floorSqFt, wallSqFt, ceilingSqFt, totalSurfaceArea };
  };

  // Save rooms to workflow store whenever they change
  useEffect(() => {
    updateWorkflowData('install', { rooms });
  }, [rooms]);

  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.length || !newRoom.width) {
      alert('Please fill in room name, length, and width');
      return;
    }

    const length = parseFloat(newRoom.length);
    const width = parseFloat(newRoom.width);
    const height = parseFloat(newRoom.height);

    const surfaces = calculateSurfaceAreas(length, width, height);

    const room: RoomData = {
      id: Date.now().toString(),
      name: newRoom.name,
      type: newRoom.type,
      length,
      width,
      height,
      ...surfaces,
    };

    setRooms([...rooms, room]);
    setNewRoom({
      name: '',
      type: 'Bedroom',
      length: '',
      width: '',
      height: '8',
    });
    setShowAddRoom(false);
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const totalFloorSqFt = rooms.reduce((sum, r) => sum + r.floorSqFt, 0);
  const totalRooms = rooms.length;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Measure Each Room</h4>
            <p className="text-sm text-blue-800">
              Record the dimensions (Length × Width × Height) for every room in the property.
              We'll determine which rooms are affected in the next steps.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{totalRooms}</p>
          <p className="text-sm text-gray-600 mt-1">Total Rooms</p>
        </div>
        <div className="bg-gray-50 border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{totalFloorSqFt.toFixed(0)}</p>
          <p className="text-sm text-gray-600 mt-1">Total Floor Sq Ft</p>
        </div>
      </div>

      {/* Existing Rooms List */}
      {rooms.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Rooms ({rooms.length})</h3>
          <div className="space-y-3">
            {rooms.map(room => (
              <div key={room.id} className="border rounded-lg bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Home className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{room.name}</p>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {room.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">
                            Dimensions: {room.length}' × {room.width}' × {room.height}'
                          </p>
                          <p className="text-gray-600">
                            Floor: <span className="font-medium">{room.floorSqFt.toFixed(0)} sq ft</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            Walls: <span className="font-medium">{room.wallSqFt.toFixed(0)} sq ft</span>
                          </p>
                          <p className="text-gray-600">
                            Ceiling: <span className="font-medium">{room.ceilingSqFt.toFixed(0)} sq ft</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Total Surface Area: {room.totalSurfaceArea.toFixed(0)} sq ft
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Room Form */}
      {showAddRoom ? (
        <div className="border-2 border-entrusted-orange rounded-lg p-6 bg-orange-50">
          <h3 className="font-semibold text-gray-900 mb-4">Add New Room</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Room Name *"
                placeholder="e.g., Master Bedroom"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value as RoomType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
                >
                  <option>Bedroom</option>
                  <option>Bathroom</option>
                  <option>Kitchen</option>
                  <option>Living Room</option>
                  <option>Dining</option>
                  <option>Laundry</option>
                  <option>Hallway</option>
                  <option>Basement</option>
                  <option>Attic</option>
                  <option>Garage</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Length (ft) *"
                type="number"
                step="0.1"
                min="1"
                placeholder="20"
                value={newRoom.length}
                onChange={(e) => setNewRoom({ ...newRoom, length: e.target.value })}
              />
              <Input
                label="Width (ft) *"
                type="number"
                step="0.1"
                min="1"
                placeholder="15"
                value={newRoom.width}
                onChange={(e) => setNewRoom({ ...newRoom, width: e.target.value })}
              />
              <Input
                label="Height (ft)"
                type="number"
                step="0.1"
                min="1"
                max="15"
                value={newRoom.height}
                onChange={(e) => setNewRoom({ ...newRoom, height: e.target.value })}
              />
            </div>

            {/* Auto-calculated preview */}
            {newRoom.length && newRoom.width && newRoom.height && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 mb-2">Calculated Surface Areas:</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>Floor: {(parseFloat(newRoom.length) * parseFloat(newRoom.width)).toFixed(0)} sq ft</div>
                  <div>Walls: {(2 * (parseFloat(newRoom.length) + parseFloat(newRoom.width)) * parseFloat(newRoom.height)).toFixed(0)} sq ft</div>
                  <div>Ceiling: {(parseFloat(newRoom.length) * parseFloat(newRoom.width)).toFixed(0)} sq ft</div>
                  <div className="font-medium">
                    Total: {calculateSurfaceAreas(parseFloat(newRoom.length), parseFloat(newRoom.width), parseFloat(newRoom.height)).totalSurfaceArea.toFixed(0)} sq ft
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="primary" onClick={handleAddRoom}>
                <Plus className="w-4 h-4" />
                Add Room
              </Button>
              <Button variant="secondary" onClick={() => setShowAddRoom(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setShowAddRoom(true)} className="w-full">
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      )}

      {/* Empty State */}
      {rooms.length === 0 && !showAddRoom && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Home className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-medium mb-2">No rooms added yet</p>
          <p className="text-sm text-gray-500 mb-4">Add your first room to begin the assessment</p>
        </div>
      )}

      {/* Validation Warning */}
      {rooms.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                You must add at least one room before continuing to the next step.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
