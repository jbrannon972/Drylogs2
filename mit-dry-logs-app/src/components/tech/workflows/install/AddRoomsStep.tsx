import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Plus, Trash2, Home, AlertCircle, Camera, CheckCircle, Info } from 'lucide-react';
import { RoomType } from '../../../../types';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';

interface AddRoomsStepProps {
  job: any;
  onNext: () => void;
}

interface RoomData {
  id: string;
  name: string;
  type: RoomType;
  floor?: string; // Floor/Story (Basement, 1st Floor, 2nd Floor, etc.)
  length: number;
  width: number;
  height: number;
  insetsCubicFt?: number;  // Add cubic footage (closets, alcoves, etc.) for dehumidifier calculations
  offsetsCubicFt?: number; // Subtract cubic footage (columns, pilasters, etc.) for dehumidifier calculations
  floorSqFt: number;
  wallSqFt: number;
  ceilingSqFt: number;
  totalSurfaceArea: number;
  affectedStatus?: 'affected' | 'unaffected' | 'partial';
  isReferenceRoom?: boolean;
  overviewPhoto?: string;
}

export const AddRoomsStep: React.FC<AddRoomsStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const [rooms, setRooms] = useState<RoomData[]>(installData.rooms || []);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'Bedroom' as RoomType,
    floor: '1st Floor',
    length: '',
    width: '',
    height: '8',
    insetsCubicFt: '',
    offsetsCubicFt: '',
    affectedStatus: 'affected' as 'affected' | 'unaffected' | 'partial',
    isReferenceRoom: false,
    overviewPhoto: null as string | null,
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
  // ULTRAFAULT: Debounce and prevent unnecessary updates
  useEffect(() => {
    // Only update if rooms actually changed (deep comparison)
    const currentRooms = installData.rooms || [];
    const roomsChanged = JSON.stringify(rooms) !== JSON.stringify(currentRooms);

    if (roomsChanged) {
      console.log('📝 AddRoomsStep: Updating rooms in workflow data');
      updateWorkflowData('install', { rooms });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  const handleRoomPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const roomName = newRoom.name || 'room';
      const url = await uploadPhoto(file, job.jobId, roomName, 'assessment', user.uid);
      if (url) setNewRoom({ ...newRoom, overviewPhoto: url });
    }
  };

  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.length || !newRoom.width) {
      console.warn('Please fill in room name, length, and width');
      return;
    }

    const length = parseFloat(newRoom.length);
    const width = parseFloat(newRoom.width);
    const height = parseFloat(newRoom.height);
    const insetsCubicFt = newRoom.insetsCubicFt ? parseFloat(newRoom.insetsCubicFt) : 0;
    const offsetsCubicFt = newRoom.offsetsCubicFt ? parseFloat(newRoom.offsetsCubicFt) : 0;

    const surfaces = calculateSurfaceAreas(length, width, height);

    const room: RoomData = {
      id: Date.now().toString(),
      name: newRoom.name,
      type: newRoom.type,
      floor: newRoom.floor,
      length,
      width,
      height,
      insetsCubicFt: insetsCubicFt > 0 ? insetsCubicFt : undefined,
      offsetsCubicFt: offsetsCubicFt > 0 ? offsetsCubicFt : undefined,
      ...surfaces,
      affectedStatus: newRoom.affectedStatus,
      isReferenceRoom: newRoom.isReferenceRoom,
      overviewPhoto: newRoom.overviewPhoto || undefined,
    };

    setRooms([...rooms, room]);
    setNewRoom({
      name: '',
      type: 'Bedroom',
      floor: '1st Floor',
      length: '',
      width: '',
      height: '8',
      insetsCubicFt: '',
      offsetsCubicFt: '',
      affectedStatus: 'affected',
      isReferenceRoom: false,
      overviewPhoto: null,
    });
    setShowAddRoom(false);
  };

  const handleDeleteRoom = (id: string) => {
    setRoomToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRoom = () => {
    if (roomToDelete) {
      setRooms(rooms.filter(r => r.id !== roomToDelete));
      setRoomToDelete(null);
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
              <div key={room.id} className={`border-2 rounded-lg bg-white p-4 ${
                room.isReferenceRoom ? 'border-blue-400 bg-blue-50' :
                room.affectedStatus === 'affected' ? 'border-red-200' :
                room.affectedStatus === 'partial' ? 'border-yellow-200' :
                'border-green-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {room.overviewPhoto && (
                      <img src={room.overviewPhoto} alt={room.name} className="w-20 h-20 rounded object-cover flex-shrink-0" />
                    )}
                    {!room.overviewPhoto && (
                      <Home className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-gray-900">{room.name}</p>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {room.type}
                        </span>
                        {room.affectedStatus && (
                          <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                            room.affectedStatus === 'affected' ? 'bg-red-100 text-red-800' :
                            room.affectedStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {room.affectedStatus === 'affected' ? '● Affected' :
                             room.affectedStatus === 'partial' ? '◐ Partial' :
                             '○ Unaffected'}
                          </span>
                        )}
                        {room.isReferenceRoom && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded font-medium">
                            ★ Reference Room
                          </span>
                        )}
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

            {/* Floor/Story Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor / Story *
              </label>
              <select
                value={newRoom.floor}
                onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
              >
                <option value="Basement">Basement</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
                <option value="4th Floor">4th Floor</option>
                <option value="Attic">Attic</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Helps with equipment allocation and labor estimation
              </p>
            </div>

            {/* Affected Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affected Status *
              </label>
              <select
                value={newRoom.affectedStatus}
                onChange={(e) => setNewRoom({ ...newRoom, affectedStatus: e.target.value as 'affected' | 'unaffected' | 'partial' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
              >
                <option value="affected">Affected - Direct water damage</option>
                <option value="partial">Partial - Some areas affected</option>
                <option value="unaffected">Unaffected - No water damage</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Whether this room has water damage
              </p>
            </div>

            {/* Reference Room Checkbox */}
            {newRoom.affectedStatus === 'unaffected' && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRoom.isReferenceRoom}
                    onChange={(e) => setNewRoom({ ...newRoom, isReferenceRoom: e.target.checked })}
                    className="w-5 h-5 text-entrusted-orange border-gray-300 rounded focus:ring-entrusted-orange mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-blue-900">Use as Reference Room (Dry Standard Baseline)</p>
                    <p className="text-sm text-blue-800 mt-1">
                      This room's temperature and humidity will establish the baseline for all moisture readings throughout the job. Only one reference room should be selected.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Room Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Overview Photo
              </label>
              {newRoom.overviewPhoto ? (
                <div>
                  <img src={newRoom.overviewPhoto} alt="Room Overview" className="max-h-32 rounded mb-2" />
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Photo added</span>
                  </div>
                  <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleRoomPhoto}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Camera className="w-4 h-4" />
                    Replace Photo
                  </label>
                </div>
              ) : (
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleRoomPhoto}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Camera className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Take Room Photo'}
                </label>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Photo helps with documentation and insurance claims
              </p>
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

            {/* Insets & Offsets for Equipment Calculations */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-600" />
                Insets & Offsets (Optional)
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                <strong>Insets</strong> (closets, alcoves) create dead air zones requiring additional air movers.
                <strong> Offsets</strong> (columns, obstacles) disrupt airflow patterns.
                Per IICRC S500, these affect air mover placement to maintain proper air circulation.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Insets (cubic ft)"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="0"
                    value={newRoom.insetsCubicFt}
                    onChange={(e) => setNewRoom({ ...newRoom, insetsCubicFt: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Closets, alcoves (adds volume)</p>
                </div>
                <div>
                  <Input
                    label="Offsets (cubic ft)"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="0"
                    value={newRoom.offsetsCubicFt}
                    onChange={(e) => setNewRoom({ ...newRoom, offsetsCubicFt: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Columns, pilasters (reduces volume)</p>
                </div>
              </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteRoom}
        title="Delete Room?"
        message="Are you sure you want to delete this room? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
