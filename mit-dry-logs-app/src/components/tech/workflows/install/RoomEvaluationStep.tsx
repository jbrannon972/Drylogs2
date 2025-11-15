import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Plus, Trash2, Home } from 'lucide-react';
import { Room, RoomType, AffectedStatus } from '../../../../types';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface RoomEvaluationStepProps {
  job: any;
  onNext: () => void;
}

export const RoomEvaluationStep: React.FC<RoomEvaluationStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const [rooms, setRooms] = useState<any[]>(installData.rooms || []);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'Bedroom' as RoomType,
    length: '',
    width: '',
    height: '8',
    status: 'affected' as AffectedStatus,
  });

  // Save rooms to workflow store whenever they change
  useEffect(() => {
    updateWorkflowData('install', { rooms });
  }, [rooms]);

  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.length || !newRoom.width) {
      alert('Please fill in all required fields');
      return;
    }

    const squareFootage = parseFloat(newRoom.length) * parseFloat(newRoom.width);

    const room = {
      ...newRoom,
      id: Date.now().toString(),
      squareFootage: squareFootage.toFixed(1),
      length: parseFloat(newRoom.length),
      width: parseFloat(newRoom.width),
      height: parseFloat(newRoom.height),
    };

    setRooms([...rooms, room]);
    setNewRoom({
      name: '',
      type: 'Bedroom',
      length: '',
      width: '',
      height: '8',
      status: 'affected',
    });
    setShowAddRoom(false);
  };

  const handleDeleteRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const totalSquareFootage = rooms.reduce((sum, r) => sum + parseFloat(r.squareFootage), 0);
  const affectedRooms = rooms.filter(r => r.status === 'affected').length;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-900">{rooms.length}</p>
            <p className="text-sm text-gray-600">Total Rooms</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">{totalSquareFootage.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Total Sq Ft</p>
          </div>
        </div>
      </div>

      {/* Existing Rooms */}
      {rooms.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Rooms ({rooms.length})</h3>
          <div className="space-y-2">
            {rooms.map(room => (
              <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{room.name}</p>
                    <p className="text-sm text-gray-600">
                      {room.length}' × {room.width}' = {room.squareFootage} sq ft
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    room.status === 'affected'
                      ? 'bg-red-100 text-red-800'
                      : room.status === 'partially-affected'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {room.status}
                  </span>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        <div className="border-2 border-entrusted-orange rounded-lg p-3 bg-orange-50">
          <h3 className="font-semibold text-gray-900 mb-2">Add New Room</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
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
                  className="input-field"
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

            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Length (ft) *"
                type="number"
                step="0.1"
                placeholder="20"
                value={newRoom.length}
                onChange={(e) => setNewRoom({ ...newRoom, length: e.target.value })}
              />
              <Input
                label="Width (ft) *"
                type="number"
                step="0.1"
                placeholder="15"
                value={newRoom.width}
                onChange={(e) => setNewRoom({ ...newRoom, width: e.target.value })}
              />
              <Input
                label="Height (ft)"
                type="number"
                step="0.1"
                value={newRoom.height}
                onChange={(e) => setNewRoom({ ...newRoom, height: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affected Status *
              </label>
              <select
                value={newRoom.status}
                onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value as AffectedStatus })}
                className="input-field"
              >
                <option value="affected">Affected</option>
                <option value="partially-affected">Partially Affected</option>
                <option value="unaffected">Unaffected</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={handleAddRoom}>
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

      {rooms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Home className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>No rooms added yet. Add your first room to begin.</p>
        </div>
      )}
    </div>
  );
};
