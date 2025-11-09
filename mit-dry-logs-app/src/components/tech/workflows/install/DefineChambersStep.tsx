import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Wind, Plus, Trash2, Edit2, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { DryingChamber } from '../../../../types';
import { Timestamp } from 'firebase/firestore';

interface DefineChambersStepProps {
  job: any;
  onNext: () => void;
}

interface RoomData {
  id: string;
  name: string;
  floor?: string;
  length: number;
  width: number;
  height: number;
  insetsCubicFt?: number;
  offsetsCubicFt?: number;
}

export const DefineChambersStep: React.FC<DefineChambersStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const rooms: RoomData[] = installData.roomAssessments || [];

  const [chambers, setChambers] = useState<DryingChamber[]>([]);
  const [editingChamberId, setEditingChamberId] = useState<string | null>(null);
  const [chamberNameInput, setChamberNameInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chamberToDelete, setChamberToDelete] = useState<string | null>(null);

  // Auto-create chambers on mount based on floor levels
  useEffect(() => {
    if (chambers.length === 0 && rooms.length > 0) {
      console.log('🏗️ DefineChambersStep: Auto-creating chambers based on floor levels');
      createChambersFromFloors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createChambersFromFloors = () => {
    // Group rooms by floor level
    const roomsByFloor: Record<string, RoomData[]> = {};

    rooms.forEach(room => {
      const floor = room.floor || '1st Floor';
      if (!roomsByFloor[floor]) {
        roomsByFloor[floor] = [];
      }
      roomsByFloor[floor].push(room);
    });

    // Create one chamber per floor
    const newChambers: DryingChamber[] = [];
    let chamberIndex = 0;

    Object.entries(roomsByFloor).forEach(([floorLevel, floorRooms]) => {
      const chamberLetter = String.fromCharCode(65 + chamberIndex); // A, B, C...
      const chamberId = `chamber-${Date.now()}-${chamberIndex}`;

      newChambers.push({
        chamberId,
        chamberName: `Chamber ${chamberLetter}`,
        floorLevel,
        assignedRooms: floorRooms.map(r => r.id),
        deploymentDate: Timestamp.now(),
        status: 'planned',
        dehumidifiers: [],
        airMovers: [],
        airScrubbers: [],
        ambientReadings: [],
        hasContainment: false,
      });

      chamberIndex++;
    });

    setChambers(newChambers);
  };

  const addNewChamber = () => {
    const chamberLetter = String.fromCharCode(65 + chambers.length); // Next letter
    const chamberId = `chamber-${Date.now()}`;

    const newChamber: DryingChamber = {
      chamberId,
      chamberName: `Chamber ${chamberLetter}`,
      assignedRooms: [],
      deploymentDate: Timestamp.now(),
      status: 'planned',
      dehumidifiers: [],
      airMovers: [],
      airScrubbers: [],
      ambientReadings: [],
      hasContainment: false,
    };

    setChambers([...chambers, newChamber]);
  };

  const deleteChamber = (chamberId: string) => {
    if (chambers.length <= 1) {
      alert('You must have at least one chamber');
      return;
    }

    setChamberToDelete(chamberId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChamber = () => {
    if (chamberToDelete) {
      setChambers(chambers.filter(c => c.chamberId !== chamberToDelete));
      setChamberToDelete(null);
    }
  };

  const startEditingChamberName = (chamber: DryingChamber) => {
    setEditingChamberId(chamber.chamberId);
    setChamberNameInput(chamber.chamberName);
  };

  const saveChamberName = (chamberId: string) => {
    if (!chamberNameInput.trim()) {
      alert('Chamber name cannot be empty');
      return;
    }

    setChambers(chambers.map(c =>
      c.chamberId === chamberId
        ? { ...c, chamberName: chamberNameInput.trim() }
        : c
    ));
    setEditingChamberId(null);
  };

  const assignRoomToChamber = (roomId: string, chamberId: string) => {
    // Remove room from all chambers first
    const updatedChambers = chambers.map(c => ({
      ...c,
      assignedRooms: c.assignedRooms.filter(rid => rid !== roomId),
    }));

    // Add room to selected chamber
    const finalChambers = updatedChambers.map(c =>
      c.chamberId === chamberId
        ? { ...c, assignedRooms: [...c.assignedRooms, roomId] }
        : c
    );

    setChambers(finalChambers);
  };

  const toggleContainment = (chamberId: string) => {
    setChambers(chambers.map(c =>
      c.chamberId === chamberId
        ? { ...c, hasContainment: !c.hasContainment }
        : c
    ));
  };

  const calculateChamberCubicFootage = (chamber: DryingChamber): number => {
    return chamber.assignedRooms.reduce((total, roomId) => {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return total;

      const baseCubicFt = room.length * room.width * room.height;
      const insets = room.insetsCubicFt || 0;
      const offsets = room.offsetsCubicFt || 0;
      return total + baseCubicFt + insets - offsets;
    }, 0);
  };

  const handleNext = () => {
    // Validate: all rooms must be assigned to a chamber
    const assignedRoomIds = new Set(chambers.flatMap(c => c.assignedRooms));
    const allRoomIds = rooms.map(r => r.id);
    const unassignedRooms = allRoomIds.filter(id => !assignedRoomIds.has(id));

    if (unassignedRooms.length > 0) {
      alert(`Please assign all rooms to chambers. ${unassignedRooms.length} room(s) are not assigned.`);
      return;
    }

    // Save chambers to workflow store
    updateWorkflowData('install', {
      chambers: chambers.map(c => ({
        ...c,
        assignedRooms: c.assignedRooms,
      })),
    });

    onNext();
  };

  // Get unassigned rooms
  const getUnassignedRooms = (): RoomData[] => {
    const assignedRoomIds = new Set(chambers.flatMap(c => c.assignedRooms));
    return rooms.filter(r => !assignedRoomIds.has(r.id));
  };

  const unassignedRooms = getUnassignedRooms();

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Define Drying Chambers</h4>
            <p className="text-sm text-blue-800">
              Chambers are grouped areas where equipment works together. We've created chambers based on floor levels.
              You can rename them, reassign rooms, or add more chambers as needed.
            </p>
          </div>
        </div>
      </div>

      {/* Chambers List */}
      <div className="space-y-4">
        {chambers.map((chamber) => {
          const chamberRooms = rooms.filter(r => chamber.assignedRooms.includes(r.id));
          const cubicFootage = calculateChamberCubicFootage(chamber);

          return (
            <div key={chamber.chamberId} className="border-2 border-gray-300 rounded-lg p-5 bg-white">
              {/* Chamber Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Wind className="w-6 h-6 text-orange-600" />
                  {editingChamberId === chamber.chamberId ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={chamberNameInput}
                        onChange={(e) => setChamberNameInput(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        autoFocus
                      />
                      <Button
                        variant="primary"
                        onClick={() => saveChamberName(chamber.chamberId)}
                        className="px-3 py-1 text-sm"
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingChamberId(null)}
                        className="px-3 py-1 text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-900">{chamber.chamberName}</h3>
                      <button
                        onClick={() => startEditingChamberName(chamber)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Rename chamber"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {chambers.length > 1 && (
                    <button
                      onClick={() => deleteChamber(chamber.chamberId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete chamber"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Chamber Info */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 border rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600 mb-1">Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{chamberRooms.length}</p>
                </div>
                <div className="bg-gray-50 border rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600 mb-1">Cubic Footage</p>
                  <p className="text-2xl font-bold text-gray-900">{cubicFootage.toFixed(0)}</p>
                </div>
                <div className="bg-gray-50 border rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600 mb-1">Floor Level</p>
                  <p className="text-lg font-medium text-gray-900">{chamber.floorLevel || 'Mixed'}</p>
                </div>
              </div>

              {/* Containment Option */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chamber.hasContainment || false}
                    onChange={() => toggleContainment(chamber.chamberId)}
                    className="h-4 w-4 text-orange-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    This chamber has containment barriers (poly sheeting)
                  </span>
                </label>
              </div>

              {/* Assigned Rooms */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Rooms:</h4>
                {chamberRooms.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No rooms assigned to this chamber</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {chamberRooms.map(room => (
                      <div
                        key={room.id}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-blue-900">{room.name}</p>
                          <p className="text-xs text-blue-700">
                            {room.length}' × {room.width}' × {room.height}'
                          </p>
                        </div>
                        <select
                          value={chamber.chamberId}
                          onChange={(e) => assignRoomToChamber(room.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {chambers.map(c => (
                            <option key={c.chamberId} value={c.chamberId}>
                              Move to {c.chamberName}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned Rooms (if any) */}
      {unassignedRooms.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Unassigned Rooms</h4>
              <p className="text-sm text-yellow-800">
                These rooms are not assigned to any chamber. Please assign them before continuing.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {unassignedRooms.map(room => (
              <div
                key={room.id}
                className="bg-white border border-yellow-300 rounded-lg p-2"
              >
                <p className="text-sm font-medium text-gray-900 mb-1">{room.name}</p>
                <select
                  onChange={(e) => assignRoomToChamber(room.id, e.target.value)}
                  className="text-xs w-full px-2 py-1 border border-gray-300 rounded"
                  defaultValue=""
                >
                  <option value="" disabled>Assign to chamber...</option>
                  {chambers.map(c => (
                    <option key={c.chamberId} value={c.chamberId}>
                      {c.chamberName}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Chamber Button */}
      <div>
        <Button
          variant="secondary"
          onClick={addNewChamber}
        >
          <Plus className="w-5 h-5" />
          Add Another Chamber
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Add more chambers if you need to isolate specific areas (e.g., containment zones, separate floors)
        </p>
      </div>

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">Chamber Summary</h4>
            <p className="text-sm text-green-800">
              <strong>{chambers.length}</strong> chamber(s) defined with <strong>{rooms.length}</strong> total room(s)
            </p>
            {unassignedRooms.length === 0 && (
              <p className="text-sm text-green-700 mt-1">✓ All rooms are assigned to chambers</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div></div>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={unassignedRooms.length > 0}
        >
          Continue to Equipment Calculations
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteChamber}
        title="Delete Chamber?"
        message="Are you sure you want to delete this chamber? Rooms will be unassigned."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
