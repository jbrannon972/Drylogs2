import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Input } from '../../../shared/Input';
import { Wind, Plus, Trash2, Edit2, AlertCircle, Info, CheckCircle, Camera, X, Thermometer, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { DryingChamber, ContainmentBarrierSetup } from '../../../../types';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
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

interface UnaffectedReading {
  id: string;
  roomName: string;
  temperature: string;
  relativeHumidity: string;
  materialReadings: {
    material: string;
    reading: string;
  }[];
}

const COMMON_MATERIALS = [
  'Drywall',
  'Wood Flooring',
  'Concrete',
  'Carpet',
  'Subfloor',
  'Baseboard',
  'Cabinet',
  'Tile',
  'Other',
];

export const DefineChambersStep: React.FC<DefineChambersStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  // STANDARDIZED: Use 'rooms' key (migrate from old 'roomAssessments')
  const rooms: RoomData[] = installData.rooms || installData.roomAssessments || [];

  const [chambers, setChambers] = useState<DryingChamber[]>([]);
  const [editingChamberId, setEditingChamberId] = useState<string | null>(null);
  const [chamberNameInput, setChamberNameInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chamberToDelete, setChamberToDelete] = useState<string | null>(null);

  // Unaffected Room Readings (Dry Standards)
  const [unaffectedReadings, setUnaffectedReadings] = useState<UnaffectedReading[]>(
    installData.unaffectedReadings || []
  );
  const [showUnaffectedSection, setShowUnaffectedSection] = useState(false);

  // Auto-create chambers on mount based on floor levels
  useEffect(() => {
    if (chambers.length === 0 && rooms.length > 0) {
      console.log('🏗️ DefineChambersStep: Auto-creating chambers based on floor levels');
      createChambersFromFloors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save unaffected readings to workflow store
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateWorkflowData('install', {
        unaffectedReadings,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unaffectedReadings]);

  // Unaffected Room Management
  const addUnaffectedRoom = () => {
    const newReading: UnaffectedReading = {
      id: 'unaffected-' + new Date().getTime(),
      roomName: '',
      temperature: '',
      relativeHumidity: '',
      materialReadings: [],
    };
    setUnaffectedReadings([...unaffectedReadings, newReading]);
    setShowUnaffectedSection(true);
  };

  const removeUnaffectedRoom = (id: string) => {
    setUnaffectedReadings(unaffectedReadings.filter(r => r.id !== id));
  };

  const updateUnaffectedReading = (id: string, field: keyof UnaffectedReading, value: any) => {
    setUnaffectedReadings(readings =>
      readings.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const addMaterialReading = (readingId: string) => {
    setUnaffectedReadings(readings =>
      readings.map(r => {
        if (r.id === readingId) {
          return {
            ...r,
            materialReadings: [
              ...r.materialReadings,
              { material: '', reading: '' },
            ],
          };
        }
        return r;
      })
    );
  };

  const removeMaterialReading = (readingId: string, materialIndex: number) => {
    setUnaffectedReadings(readings =>
      readings.map(r => {
        if (r.id === readingId) {
          return {
            ...r,
            materialReadings: r.materialReadings.filter((_, i) => i !== materialIndex),
          };
        }
        return r;
      })
    );
  };

  const updateMaterialReading = (
    readingId: string,
    materialIndex: number,
    field: 'material' | 'reading',
    value: string
  ) => {
    setUnaffectedReadings(readings =>
      readings.map(r => {
        if (r.id === readingId) {
          return {
            ...r,
            materialReadings: r.materialReadings.map((m, i) =>
              i === materialIndex ? { ...m, [field]: value } : m
            ),
          };
        }
        return r;
      })
    );
  };

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

    // Validate: chambers with containment must have photos
    const chambersWithContainmentNoPhotos = chambers.filter(c =>
      c.containmentBarrier &&
      (!c.containmentBarrier.photos || c.containmentBarrier.photos.length === 0)
    );

    if (chambersWithContainmentNoPhotos.length > 0) {
      alert(`Containment photos are required! Please add photos for chamber(s): ${chambersWithContainmentNoPhotos.map(c => c.chamberName).join(', ')}`);
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

      {/* Unaffected Area Readings (Dry Standards) - Collapsible */}
      <div className="border-2 border-orange-200 rounded-lg bg-orange-50">
        <button
          type="button"
          onClick={() => setShowUnaffectedSection(!showUnaffectedSection)}
          className="w-full flex items-center justify-between p-4 hover:bg-orange-100 transition-colors rounded-t-lg"
        >
          <div className="flex items-center gap-3">
            <Thermometer className="w-5 h-5 text-orange-600" />
            <div className="text-left">
              <h3 className="font-semibold text-orange-900">
                Unaffected Area Readings (Dry Standards)
              </h3>
              <p className="text-sm text-orange-800">
                {unaffectedReadings.length === 0
                  ? 'Optional: Establish baselines from dry rooms for IICRC compliance'
                  : `${unaffectedReadings.length} unaffected room(s) recorded`}
              </p>
            </div>
          </div>
          {showUnaffectedSection ? (
            <ChevronUp className="w-5 h-5 text-orange-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-orange-600" />
          )}
        </button>

        {showUnaffectedSection && (
          <div className="p-4 pt-0 space-y-4">
            <div className="bg-white border border-orange-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="mb-2">
                <strong>IICRC S500 Best Practice:</strong> Take readings from unaffected rooms (not damaged by water)
                to establish accurate dry standards.
              </p>
              <p className="text-xs text-gray-600">
                Select dry rooms and capture temp, RH, and material moisture readings. These serve as your baseline
                for determining when affected materials reach dry status.
              </p>
            </div>

            {unaffectedReadings.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-orange-300">
                <Droplets className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No unaffected rooms added yet</p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={addUnaffectedRoom}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unaffected Room
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {unaffectedReadings.map((reading, index) => (
                  <div
                    key={reading.id}
                    className="bg-white border-2 border-orange-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">
                        Unaffected Room #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeUnaffectedRoom(reading.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Name *
                      </label>
                      <Input
                        type="text"
                        value={reading.roomName}
                        onChange={(e) => updateUnaffectedReading(reading.id, 'roomName', e.target.value)}
                        placeholder="e.g., Master Bedroom, Hall Closet"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature (°F) *
                        </label>
                        <Input
                          type="number"
                          value={reading.temperature}
                          onChange={(e) => updateUnaffectedReading(reading.id, 'temperature', e.target.value)}
                          placeholder="72"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relative Humidity (%) *
                        </label>
                        <Input
                          type="number"
                          value={reading.relativeHumidity}
                          onChange={(e) => updateUnaffectedReading(reading.id, 'relativeHumidity', e.target.value)}
                          placeholder="45"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">
                          Material Moisture Readings *
                        </label>
                        <button
                          type="button"
                          onClick={() => addMaterialReading(reading.id)}
                          className="text-sm text-entrusted-orange hover:text-orange-700 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Material
                        </button>
                      </div>

                      {reading.materialReadings.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">
                            No material readings yet
                          </p>
                          <button
                            type="button"
                            onClick={() => addMaterialReading(reading.id)}
                            className="text-sm text-entrusted-orange hover:text-orange-700 font-medium"
                          >
                            + Add Material Reading
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {reading.materialReadings.map((material, matIndex) => (
                            <div
                              key={matIndex}
                              className="grid grid-cols-[1fr,100px,40px] gap-3 items-end"
                            >
                              <div>
                                <select
                                  value={material.material}
                                  onChange={(e) =>
                                    updateMaterialReading(reading.id, matIndex, 'material', e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange"
                                >
                                  <option value="">Select Material</option>
                                  {COMMON_MATERIALS.map(mat => (
                                    <option key={mat} value={mat}>
                                      {mat}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  value={material.reading}
                                  onChange={(e) =>
                                    updateMaterialReading(reading.id, matIndex, 'reading', e.target.value)
                                  }
                                  placeholder="12.5"
                                  step="0.1"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMaterialReading(reading.id, matIndex)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={addUnaffectedRoom}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Unaffected Room
                </Button>
              </div>
            )}
          </div>
        )}
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

              {/* PHASE 2: Containment Barrier Documentation */}
              <div className="mb-4 border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={chamber.containmentBarrier?.hasBarrier || chamber.hasContainment || false}
                    onChange={(e) => {
                      const hasBarrier = e.target.checked;
                      setChambers(chambers.map(c =>
                        c.chamberId === chamber.chamberId
                          ? {
                              ...c,
                              containmentBarrier: hasBarrier
                                ? { hasBarrier: true, photos: [] }
                                : undefined,
                              hasContainment: hasBarrier
                            }
                          : c
                      ));
                    }}
                    className="h-4 w-4 text-orange-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    This chamber has containment barriers (poly sheeting)
                  </span>
                </label>

                {/* Expanded Containment Documentation */}
                {chamber.containmentBarrier?.hasBarrier && (
                  <div className="ml-6 space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-3">Containment Barrier Details</h5>

                    {/* Plastic Square Footage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plastic Square Footage (optional)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={chamber.containmentBarrier.plasticSqFt || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || undefined;
                          setChambers(chambers.map(c =>
                            c.chamberId === chamber.chamberId
                              ? {
                                  ...c,
                                  containmentBarrier: { ...c.containmentBarrier!, plasticSqFt: value }
                                }
                              : c
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 500"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        💡 <strong>Quick calculator:</strong> Each 10'×25' roll = 250 sqft | Roll count × 250 = Total sqft
                      </p>
                    </div>

                    {/* Zipper Door Used */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={chamber.containmentBarrier.zipperUsed || false}
                          onChange={(e) => {
                            setChambers(chambers.map(c =>
                              c.chamberId === chamber.chamberId
                                ? {
                                    ...c,
                                    containmentBarrier: { ...c.containmentBarrier!, zipperUsed: e.target.checked }
                                  }
                                : c
                            ));
                          }}
                          className="h-4 w-4 text-orange-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Zipper door installed</span>
                      </label>
                    </div>

                    {/* Zip Poles Used */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          checked={chamber.containmentBarrier.zipPolesUsed || false}
                          onChange={(e) => {
                            setChambers(chambers.map(c =>
                              c.chamberId === chamber.chamberId
                                ? {
                                    ...c,
                                    containmentBarrier: {
                                      ...c.containmentBarrier!,
                                      zipPolesUsed: e.target.checked,
                                      zipPolesCount: e.target.checked ? c.containmentBarrier!.zipPolesCount : undefined
                                    }
                                  }
                                : c
                            ));
                          }}
                          className="h-4 w-4 text-orange-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Zip poles used</span>
                      </label>

                      {/* Zip Poles Count */}
                      {chamber.containmentBarrier.zipPolesUsed && (
                        <div className="ml-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of zip poles
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={chamber.containmentBarrier.zipPolesCount || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || undefined;
                              setChambers(chambers.map(c =>
                                c.chamberId === chamber.chamberId
                                  ? {
                                      ...c,
                                      containmentBarrier: { ...c.containmentBarrier!, zipPolesCount: value }
                                    }
                                  : c
                              ));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="e.g., 4"
                          />
                        </div>
                      )}
                    </div>

                    {/* Containment Photos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Containment Photos (Required) *
                      </label>
                      <p className="text-xs text-orange-800 bg-orange-50 border border-orange-200 rounded p-2 mb-2">
                        <strong>Required:</strong> Take photos showing the containment barrier setup, plastic sheeting, and zipper doors.
                      </p>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.capture = 'environment';
                          input.onchange = async (e: any) => {
                            const file = e.target?.files?.[0];
                            if (file && user && job) {
                              try {
                                const photoUrl = await uploadPhoto(file, job.jobId, chamber.chamberId, 'containment', user.uid);
                                if (photoUrl) {
                                  setChambers(chambers.map(c =>
                                    c.chamberId === chamber.chamberId
                                      ? {
                                          ...c,
                                          containmentBarrier: {
                                            ...c.containmentBarrier!,
                                            photos: [...(c.containmentBarrier!.photos || []), photoUrl]
                                          }
                                        }
                                      : c
                                  ));
                                }
                              } catch (error) {
                                console.error('Error uploading photo:', error);
                                alert('Failed to upload photo');
                              }
                            }
                          };
                          input.click();
                        }}
                        disabled={isUploading}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4" />
                        {isUploading ? 'Uploading...' : 'Take Containment Photo'}
                      </Button>

                      {/* Photo Grid */}
                      {(chamber.containmentBarrier.photos?.length || 0) > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {chamber.containmentBarrier.photos?.map((photoUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photoUrl}
                                alt={`Containment ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                onClick={() => {
                                  setChambers(chambers.map(c =>
                                    c.chamberId === chamber.chamberId
                                      ? {
                                          ...c,
                                          containmentBarrier: {
                                            ...c.containmentBarrier!,
                                            photos: c.containmentBarrier!.photos?.filter((_, i) => i !== index)
                                          }
                                        }
                                      : c
                                  ));
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
