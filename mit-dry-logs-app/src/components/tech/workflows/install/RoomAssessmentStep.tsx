import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import {
  Home, Plus, Trash2, Camera, Droplets, AlertCircle, CheckCircle,
  Layers, Info, ChevronRight, Edit2, X
} from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { RoomType, MaterialType } from '../../../../types';

interface RoomAssessmentStepProps {
  job: any;
  onNext: () => void;
}

interface MoistureReading {
  id: string;
  material: MaterialType;
  location: string;
  percentage: number;
  isDryStandard: boolean;
  timestamp: Date;
}

interface MaterialAffected {
  materialType: MaterialType;
  isAffected: boolean;
  squareFootage: number;
  removalRequired: boolean;
  notes?: string;
}

interface RoomData {
  id: string;
  name: string;
  type: RoomType;
  floor: string;
  length: number;
  width: number;
  height: number;
  insetsCubicFt: number;
  offsetsCubicFt: number;

  // Pre-existing damage
  hasPreexistingDamage: boolean;
  preexistingDamageNotes?: string;
  preexistingDamagePhotos: string[];

  // Moisture readings
  moistureReadings: MoistureReading[];

  // Affected materials
  materialsAffected: MaterialAffected[];

  // Photos
  overviewPhoto?: string;
  moisturePhotos: string[];

  // Completion tracking
  isComplete: boolean;
}

export const RoomAssessmentStep: React.FC<RoomAssessmentStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  const [rooms, setRooms] = useState<RoomData[]>(installData.roomAssessments || []);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    rooms.length > 0 ? rooms[0].id : null
  );
  const [activeTab, setActiveTab] = useState<'info' | 'moisture' | 'materials'>('info');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showPreexistingModal, setShowPreexistingModal] = useState(false);

  // New room form
  const [newRoomForm, setNewRoomForm] = useState({
    name: '',
    type: 'Bedroom' as RoomType,
    floor: '1st Floor',
    length: '',
    width: '',
    height: '8',
  });

  // Save to workflow store whenever rooms change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateWorkflowData('install', { roomAssessments: rooms });
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const addRoom = () => {
    const newRoom: RoomData = {
      id: `room-${Date.now()}`,
      name: newRoomForm.name,
      type: newRoomForm.type,
      floor: newRoomForm.floor,
      length: parseFloat(newRoomForm.length),
      width: parseFloat(newRoomForm.width),
      height: parseFloat(newRoomForm.height),
      insetsCubicFt: 0,
      offsetsCubicFt: 0,
      hasPreexistingDamage: false,
      preexistingDamageNotes: '',
      preexistingDamagePhotos: [],
      moistureReadings: [],
      materialsAffected: getDefaultMaterials(),
      overviewPhoto: undefined,
      moisturePhotos: [],
      isComplete: false,
    };

    setRooms([...rooms, newRoom]);
    setSelectedRoomId(newRoom.id);
    setShowAddRoom(false);
    setNewRoomForm({ name: '', type: 'Bedroom', floor: '1st Floor', length: '', width: '', height: '8' });
  };

  const deleteRoom = (roomId: string) => {
    if (confirm('Delete this room? All assessment data will be lost.')) {
      const newRooms = rooms.filter(r => r.id !== roomId);
      setRooms(newRooms);
      if (selectedRoomId === roomId) {
        setSelectedRoomId(newRooms.length > 0 ? newRooms[0].id : null);
      }
    }
  };

  const updateSelectedRoom = (updates: Partial<RoomData>) => {
    if (!selectedRoomId) return;
    setRooms(rooms.map(r => r.id === selectedRoomId ? { ...r, ...updates } : r));
  };

  const addMoistureReading = () => {
    if (!selectedRoom) return;

    const newReading: MoistureReading = {
      id: `reading-${Date.now()}`,
      material: 'Drywall',
      location: '',
      percentage: 0,
      isDryStandard: false,
      timestamp: new Date(),
    };

    updateSelectedRoom({
      moistureReadings: [...selectedRoom.moistureReadings, newReading],
    });
  };

  const updateMoistureReading = (readingId: string, updates: Partial<MoistureReading>) => {
    if (!selectedRoom) return;

    updateSelectedRoom({
      moistureReadings: selectedRoom.moistureReadings.map(r =>
        r.id === readingId ? { ...r, ...updates } : r
      ),
    });
  };

  const deleteMoistureReading = (readingId: string) => {
    if (!selectedRoom) return;
    updateSelectedRoom({
      moistureReadings: selectedRoom.moistureReadings.filter(r => r.id !== readingId),
    });
  };

  const updateMaterial = (materialType: MaterialType, updates: Partial<MaterialAffected>) => {
    if (!selectedRoom) return;

    updateSelectedRoom({
      materialsAffected: selectedRoom.materialsAffected.map(m =>
        m.materialType === materialType ? { ...m, ...updates } : m
      ),
    });
  };

  const markRoomComplete = () => {
    if (!selectedRoom) return;

    // Validation
    if (selectedRoom.length === 0 || selectedRoom.width === 0) {
      alert('Please enter room dimensions');
      return;
    }

    updateSelectedRoom({ isComplete: true });

    // Move to next incomplete room
    const nextIncomplete = rooms.find(r => r.id !== selectedRoomId && !r.isComplete);
    if (nextIncomplete) {
      setSelectedRoomId(nextIncomplete.id);
      setActiveTab('info');
    }
  };

  const handleNext = () => {
    const incompleteRooms = rooms.filter(r => !r.isComplete);

    if (incompleteRooms.length > 0) {
      alert(`Please complete assessment for ${incompleteRooms.length} room(s)`);
      return;
    }

    if (rooms.length === 0) {
      alert('Please add at least one room');
      return;
    }

    onNext();
  };

  const getDefaultMaterials = (): MaterialAffected[] => [
    { materialType: 'Carpet', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Subfloor', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Drywall', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Wood Framing', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Flooring', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Tile', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Insulation', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Concrete', isAffected: false, squareFootage: 0, removalRequired: false },
  ];

  const completedCount = rooms.filter(r => r.isComplete).length;
  const totalCount = rooms.length;

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Room List */}
      <div className="w-80 bg-gray-50 border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-300 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Rooms</h3>
            <Button variant="primary" onClick={() => setShowAddRoom(true)} className="text-sm px-3 py-1">
              <Plus className="w-4 h-4" />
              Add Room
            </Button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <p className="text-sm text-blue-900">
              <strong>{completedCount}/{totalCount}</strong> rooms completed
            </p>
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedRoomId === room.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{room.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{room.floor}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {room.length > 0 ? `${room.length}' × ${room.width}' × ${room.height}'` : 'No dimensions'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {room.moistureReadings.length} readings
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {room.isComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRoom(room.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </button>
          ))}

          {rooms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Home className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No rooms added yet</p>
              <p className="text-xs mt-1">Click "Add Room" to start</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Room Details */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedRoom && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a room to assess</p>
            </div>
          </div>
        )}

        {selectedRoom && (
          <>
            {/* Room Header */}
            <div className="border-b border-gray-300 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.name}</h2>
                  <p className="text-sm text-gray-600">{selectedRoom.floor} • {selectedRoom.type}</p>
                </div>
                {selectedRoom.isComplete ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Complete</span>
                  </div>
                ) : (
                  <Button variant="primary" onClick={markRoomComplete}>
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300 bg-white">
              <div className="flex gap-1 px-4">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="w-4 h-4 inline mr-2" />
                  Room Info
                </button>
                <button
                  onClick={() => setActiveTab('moisture')}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'moisture'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Droplets className="w-4 h-4 inline mr-2" />
                  Moisture ({selectedRoom.moistureReadings.length})
                </button>
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'materials'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Layers className="w-4 h-4 inline mr-2" />
                  Materials
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'info' && (
                <div className="max-w-2xl space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Length (ft)</label>
                      <input
                        type="number"
                        value={selectedRoom.length}
                        onChange={(e) => updateSelectedRoom({ length: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Width (ft)</label>
                      <input
                        type="number"
                        value={selectedRoom.width}
                        onChange={(e) => updateSelectedRoom({ width: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height (ft)</label>
                      <input
                        type="number"
                        value={selectedRoom.height}
                        onChange={(e) => updateSelectedRoom({ height: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        step="0.5"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Cubic Footage:</strong> {(selectedRoom.length * selectedRoom.width * selectedRoom.height).toFixed(0)} cf
                    </p>
                    <p className="text-sm text-blue-900 mt-1">
                      <strong>Square Footage:</strong> {(selectedRoom.length * selectedRoom.width).toFixed(0)} sq ft
                    </p>
                  </div>

                  {/* Pre-existing Damage Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-existing Damage</h3>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-900">
                            Document any pre-existing damage in this room (damage not caused by current water loss).
                            This protects you from liability claims later.
                          </p>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={selectedRoom.hasPreexistingDamage}
                        onChange={(e) => updateSelectedRoom({ hasPreexistingDamage: e.target.checked })}
                        className="h-5 w-5 text-orange-600 rounded"
                      />
                      <span className="text-base font-medium text-gray-900">
                        This room has pre-existing damage
                      </span>
                    </label>

                    {selectedRoom.hasPreexistingDamage && (
                      <div className="space-y-4">
                        <Button
                          variant="primary"
                          onClick={() => setShowPreexistingModal(true)}
                        >
                          <Camera className="w-4 h-4" />
                          Document Pre-existing Damage
                        </Button>

                        {selectedRoom.preexistingDamagePhotos.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-900">
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              <strong>{selectedRoom.preexistingDamagePhotos.length}</strong> photo(s) captured
                            </p>
                            {selectedRoom.preexistingDamageNotes && (
                              <p className="text-sm text-green-800 mt-2">
                                <strong>Notes:</strong> {selectedRoom.preexistingDamageNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'moisture' && (
                <div className="max-w-4xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Moisture Readings</h3>
                    <Button variant="primary" onClick={addMoistureReading}>
                      <Plus className="w-4 h-4" />
                      Add Reading
                    </Button>
                  </div>

                  {selectedRoom.moistureReadings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Droplets className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No moisture readings yet</p>
                    </div>
                  )}

                  {selectedRoom.moistureReadings.map((reading) => (
                    <div key={reading.id} className="border border-gray-300 rounded-lg p-4 bg-white">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Material</label>
                          <select
                            value={reading.material}
                            onChange={(e) => updateMoistureReading(reading.id, { material: e.target.value as MaterialType })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option>Drywall</option>
                            <option>Carpet</option>
                            <option>Pad</option>
                            <option>Hardwood</option>
                            <option>Subfloor</option>
                            <option>Concrete</option>
                            <option>Baseboard</option>
                            <option>Insulation</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                          <input
                            type="text"
                            value={reading.location}
                            onChange={(e) => updateMoistureReading(reading.id, { location: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="e.g., North wall"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Moisture %</label>
                          <input
                            type="number"
                            value={reading.percentage}
                            onChange={(e) => updateMoistureReading(reading.id, { percentage: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            step="0.1"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={reading.isDryStandard}
                              onChange={(e) => updateMoistureReading(reading.id, { isDryStandard: e.target.checked })}
                              className="h-4 w-4"
                            />
                            <span className="text-xs text-gray-700">Dry Standard</span>
                          </label>
                          <button
                            onClick={() => deleteMoistureReading(reading.id)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="max-w-4xl space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Affected Materials</h3>

                  {selectedRoom.materialsAffected.map((material) => (
                    <div key={material.materialType} className="border border-gray-300 rounded-lg p-4 bg-white">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer min-w-[150px]">
                          <input
                            type="checkbox"
                            checked={material.isAffected}
                            onChange={(e) => updateMaterial(material.materialType, { isAffected: e.target.checked })}
                            className="h-5 w-5"
                          />
                          <span className="font-medium text-gray-900">{material.materialType}</span>
                        </label>

                        {material.isAffected && (
                          <>
                            <div className="flex-1">
                              <input
                                type="number"
                                value={material.squareFootage}
                                onChange={(e) => updateMaterial(material.materialType, { squareFootage: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Square footage"
                                step="1"
                              />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={material.removalRequired}
                                onChange={(e) => updateMaterial(material.materialType, { removalRequired: e.target.checked })}
                                className="h-4 w-4"
                              />
                              <span className="text-sm text-gray-700">Remove</span>
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Bottom Navigation */}
        <div className="border-t border-gray-300 bg-white p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {completedCount} of {totalCount} rooms completed
            </div>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={completedCount !== totalCount || totalCount === 0}
            >
              Continue to Define Chambers
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Room</h2>
              <button
                onClick={() => setShowAddRoom(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    value={newRoomForm.name}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Master Bedroom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    value={newRoomForm.type}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, type: e.target.value as RoomType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Bedroom</option>
                    <option>Bathroom</option>
                    <option>Kitchen</option>
                    <option>Living Room</option>
                    <option>Dining Room</option>
                    <option>Hallway</option>
                    <option>Closet</option>
                    <option>Laundry</option>
                    <option>Garage</option>
                    <option>Basement</option>
                    <option>Attic</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor Level</label>
                <select
                  value={newRoomForm.floor}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, floor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option>Basement</option>
                  <option>1st Floor</option>
                  <option>2nd Floor</option>
                  <option>3rd Floor</option>
                  <option>Attic</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Length (ft)</label>
                  <input
                    type="number"
                    value={newRoomForm.length}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, length: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width (ft)</label>
                  <input
                    type="number"
                    value={newRoomForm.width}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, width: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (ft)</label>
                  <input
                    type="number"
                    value={newRoomForm.height}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, height: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
              <Button
                variant="primary"
                onClick={addRoom}
                disabled={!newRoomForm.name || !newRoomForm.length || !newRoomForm.width}
              >
                <Plus className="w-4 h-4" />
                Add Room
              </Button>
              <Button variant="secondary" onClick={() => setShowAddRoom(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-existing Damage Modal */}
      {showPreexistingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Document Pre-existing Damage</h2>
              <button
                onClick={() => setShowPreexistingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-900">
                      Document damage that existed <strong>before</strong> the current water loss.
                      This protects you from liability claims.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description of Pre-existing Damage
                </label>
                <textarea
                  value={selectedRoom.preexistingDamageNotes || ''}
                  onChange={(e) => updateSelectedRoom({ preexistingDamageNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Describe the pre-existing damage (e.g., cracked drywall, stained ceiling, damaged flooring...)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos of Pre-existing Damage
                </label>
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.capture = 'environment';
                      input.onchange = async (e: any) => {
                        const file = e.target?.files?.[0];
                        if (file && user && job && selectedRoom) {
                          try {
                            const photoUrl = await uploadPhoto(file, job.jobId, selectedRoom.id, 'preexisting', user.uid);
                            if (photoUrl) {
                              updateSelectedRoom({
                                preexistingDamagePhotos: [...selectedRoom.preexistingDamagePhotos, photoUrl],
                              });
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
                  >
                    <Camera className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Take Photo'}
                  </Button>

                  {selectedRoom.preexistingDamagePhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedRoom.preexistingDamagePhotos.map((photoUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photoUrl}
                            alt={`Pre-existing damage ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            onClick={() => {
                              updateSelectedRoom({
                                preexistingDamagePhotos: selectedRoom.preexistingDamagePhotos.filter((_, i) => i !== index),
                              });
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
              <Button
                variant="primary"
                onClick={() => setShowPreexistingModal(false)}
              >
                <CheckCircle className="w-4 h-4" />
                Save Documentation
              </Button>
              <Button variant="secondary" onClick={() => setShowPreexistingModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
