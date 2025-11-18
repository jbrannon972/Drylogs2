import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Wind, Plus, Trash2, Edit2, AlertCircle, Info, CheckCircle, Camera, X } from 'lucide-react';
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

export const DefineChambersStep: React.FC<DefineChambersStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  // COMBINED: Include both affected rooms AND unaffected baseline rooms
  const affectedRooms: RoomData[] = installData.rooms || installData.roomAssessments || [];
  const baselineRooms: RoomData[] = installData.environmentalBaseline?.unaffectedAreas || [];
  const rooms: RoomData[] = [...affectedRooms, ...baselineRooms];

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

  const unassignRoom = (roomId: string) => {
    // Remove room from all chambers (for baseline rooms only)
    setChambers(chambers.map(c => ({
      ...c,
      assignedRooms: c.assignedRooms.filter(rid => rid !== roomId),
    })));
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

  // Auto-save chambers and calculate overall damage class when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Calculate overall damage class
      const roomsWithClass = (installData.rooms || []).filter((r: any) => r.damageClass);
      const overallClass = roomsWithClass.length > 0
        ? Math.max(...roomsWithClass.map((r: any) => r.damageClass || 1))
        : 1;

      // Save chambers and overall damage class to workflow store
      updateWorkflowData('install', {
        chambers: chambers.map(c => ({
          ...c,
          assignedRooms: c.assignedRooms,
        })),
        overallDamageClass: overallClass,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [chambers, installData.rooms, updateWorkflowData]);

  // Helper: Check if room is a baseline (unaffected) room
  const isBaselineRoom = (roomId: string): boolean => {
    return baselineRooms.some(r => r.id === roomId);
  };

  // Get unassigned rooms
  const getUnassignedRooms = (): RoomData[] => {
    const assignedRoomIds = new Set(chambers.flatMap(c => c.assignedRooms));
    return rooms.filter(r => !assignedRoomIds.has(r.id));
  };

  const unassignedRooms = getUnassignedRooms();

  // Separate unassigned rooms into affected vs baseline
  const unassignedAffectedRooms = unassignedRooms.filter(r => !isBaselineRoom(r.id));
  const unassignedBaselineRooms = unassignedRooms.filter(r => isBaselineRoom(r.id));

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Define Drying Chambers</h4>
            <p className="text-sm text-blue-800 mb-2">
              Chambers are grouped areas where equipment works together. We've created chambers based on floor levels.
              You can rename them, reassign rooms, or add more chambers as needed.
            </p>
            <p className="text-sm text-blue-800">
              <span className="inline-block px-2 py-0.5 bg-sky-600 text-white text-xs rounded-full font-medium mr-1">
                Baseline
              </span>
              rooms are unaffected areas for dry standard comparison. These can be assigned to chambers or left unassigned.
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
            <div key={chamber.chamberId} className="border-2 border-gray-300 rounded-lg p-3 bg-white">
              {/* Chamber Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-orange-600" />
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
              <div className="grid grid-cols-3 gap-2 mb-2">
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
              <div className="mb-2 border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
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
                  <div className="ml-6 space-y-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Containment Barrier Details</h5>

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

                    {/* NEW: Space Reduction Field */}
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Space Reduction (Cubic Feet) *
                      </label>
                      <p className="text-xs text-blue-700 mb-2">
                        How much space (cubic feet) did you REDUCE from this chamber with containment barriers?
                      </p>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={chamber.containmentBarrier.spaceReductionCuFt || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || undefined;
                          setChambers(chambers.map(c =>
                            c.chamberId === chamber.chamberId
                              ? {
                                  ...c,
                                  containmentBarrier: { ...c.containmentBarrier!, spaceReductionCuFt: value }
                                }
                              : c
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 1500"
                      />
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <p className="font-medium text-blue-900 mb-1">💡 Why this matters:</p>
                        <ul className="text-blue-800 space-y-1 list-disc list-inside">
                          <li>Reduces dehumidifier requirements</li>
                          <li>Shows efficiency to insurance</li>
                          <li>Billable item (containment barriers)</li>
                        </ul>
                        <p className="text-blue-700 mt-2">
                          <strong>Example:</strong> 5-room chamber, contained off 500 sq ft dining area = {(500 * 8).toLocaleString()} cu ft reduction
                        </p>
                      </div>
                      {chamber.totalCubicFootage && chamber.containmentBarrier.spaceReductionCuFt && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <p className="font-medium text-green-900">Equipment Calculation:</p>
                          <p className="text-green-800">
                            Original: {chamber.totalCubicFootage.toLocaleString()} cu ft →
                            Reduced: {(chamber.totalCubicFootage - chamber.containmentBarrier.spaceReductionCuFt).toLocaleString()} cu ft
                          </p>
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
                        <div className="mt-2 grid grid-cols-2 gap-2">
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
                    {chamberRooms.map(room => {
                      const isBaseline = isBaselineRoom(room.id);
                      return (
                        <div
                          key={room.id}
                          className={`${
                            isBaseline ? 'bg-sky-50 border-sky-200' : 'bg-blue-50 border-blue-200'
                          } border rounded-lg p-2 flex items-center justify-between`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${isBaseline ? 'text-sky-900' : 'text-blue-900'}`}>
                                {room.name}
                              </p>
                              {isBaseline && (
                                <span className="px-2 py-0.5 bg-sky-600 text-white text-xs rounded-full font-medium">
                                  Baseline
                                </span>
                              )}
                            </div>
                            <p className={`text-xs ${isBaseline ? 'text-sky-700' : 'text-blue-700'}`}>
                              {room.length}' × {room.width}' × {room.height}'
                            </p>
                          </div>
                          <select
                            value={chamber.chamberId}
                            onChange={(e) => {
                              if (e.target.value === 'unassign') {
                                unassignRoom(room.id);
                              } else {
                                assignRoomToChamber(room.id, e.target.value);
                              }
                            }}
                            className="text-xs px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value={chamber.chamberId} disabled>
                              Current chamber
                            </option>
                            {isBaseline && (
                              <option value="unassign">
                                Unassign (baseline)
                              </option>
                            )}
                            {chambers.filter(c => c.chamberId !== chamber.chamberId).map(c => (
                              <option key={c.chamberId} value={c.chamberId}>
                                Move to {c.chamberName}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned AFFECTED Rooms (if any) - REQUIRED */}
      {unassignedAffectedRooms.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Unassigned Affected Rooms</h4>
              <p className="text-sm text-yellow-800">
                These affected rooms must be assigned to a chamber before continuing.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {unassignedAffectedRooms.map(room => (
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

      {/* Unassigned BASELINE Rooms (if any) - OPTIONAL */}
      {unassignedBaselineRooms.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Unassigned Baseline Rooms (Optional)</h4>
              <p className="text-sm text-blue-800">
                These baseline rooms can be assigned to chambers if needed for comparison, or left unassigned.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {unassignedBaselineRooms.map(room => (
              <div
                key={room.id}
                className="bg-white border border-blue-200 rounded-lg p-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">{room.name}</p>
                  <span className="px-2 py-0.5 bg-sky-600 text-white text-xs rounded-full font-medium">
                    Baseline
                  </span>
                </div>
                <select
                  onChange={(e) => assignRoomToChamber(room.id, e.target.value)}
                  className="text-xs w-full px-2 py-1 border border-gray-300 rounded"
                  defaultValue=""
                >
                  <option value="" disabled>Assign to chamber (optional)...</option>
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

      {/* Overall Damage Class Calculation */}
      {(() => {
        // Calculate overall damage class from all rooms
        const roomsWithClass = (installData.rooms || []).filter((r: any) => r.damageClass);
        const overallClass = roomsWithClass.length > 0
          ? Math.max(...roomsWithClass.map((r: any) => r.damageClass || 1))
          : null;

        return overallClass !== null ? (
          <div className={`border-l-4 rounded-lg p-3 ${
            overallClass === 3 ? 'border-red-500 bg-red-50' :
            overallClass === 2 ? 'border-yellow-500 bg-yellow-50' :
            'border-green-500 bg-green-50'
          }`}>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Overall Damage Class: {overallClass}
              </h4>
              <p className="text-sm text-gray-700">
                {overallClass === 3 ? 'Class 3: Fast evaporation rate - Greatest amount of water absorption and evaporation load (>40% affected)' :
                 overallClass === 2 ? 'Class 2: Moderate evaporation rate - Significant absorption and evaporation (5-40% affected)' :
                 'Class 1: Slow evaporation rate - Minimal absorption and evaporation (<5% affected)'}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Per IICRC S500: Highest class from all assessed rooms. Used for equipment calculations.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-900">
                  <strong>Warning:</strong> No damage class calculated. Make sure affected areas are entered for all rooms in the Room Assessment step.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">Chamber Summary</h4>
            <p className="text-sm text-green-800">
              <strong>{chambers.length}</strong> chamber(s) defined with <strong>{affectedRooms.length}</strong> affected room(s)
              {baselineRooms.length > 0 && (
                <> and <strong>{baselineRooms.length}</strong> baseline room(s)</>
              )}
            </p>
            {unassignedAffectedRooms.length === 0 && (
              <p className="text-sm text-green-700 mt-1">✓ All affected rooms are assigned to chambers</p>
            )}
            {unassignedBaselineRooms.length > 0 && (
              <p className="text-sm text-blue-700 mt-1">
                ℹ {unassignedBaselineRooms.length} baseline room(s) unassigned (optional)
              </p>
            )}
          </div>
        </div>
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
