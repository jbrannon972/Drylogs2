import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../shared/Button';
import {
  Home, Plus, Trash2, Camera, Droplets, AlertCircle, CheckCircle,
  Layers, Info, ChevronRight, Edit2, X
} from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { RoomType, MaterialType, FlooringInstallationType, MaterialMoistureTracking } from '../../../../types';
import { MoistureTabContent } from './MoistureTabContent';
import { PhotoCapture } from '../../../shared/PhotoCapture';
import { UniversalPhotoCapture } from '../../../shared/UniversalPhotoCapture';

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
  customMaterialName?: string; // For 'Custom' material type
  isAffected: boolean;
  squareFootage: number;
  removalRequired: boolean;
  removalReason?: string;
  installationType?: FlooringInstallationType; // For flooring materials only
  notes?: string;
  id?: string; // Unique ID for custom materials
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

  // Affected areas for equipment calculations
  affectedFloorSqFt?: number;
  affectedWallsSqFt?: number;
  affectedCeilingSqFt?: number;
  damageClass?: 1 | 2 | 3 | 4;
  percentAffected?: number;

  // Pre-existing damage
  hasPreexistingDamage: boolean;
  preexistingDamageNotes?: string;
  preexistingDamagePhotos: string[];

  // Moisture readings
  moistureReadings: MoistureReading[];

  // Affected materials
  materialsAffected: MaterialAffected[];

  // Photos - Phase 1 Requirements
  overallPhotos: string[]; // REQUIRED: Minimum 4 (wide shot + damage close-ups)
  thermalPhotos?: string[]; // OPTIONAL: Thermal imaging (moved from CauseOfLoss)

  // Completion tracking
  isComplete: boolean;
}

export const RoomAssessmentStep: React.FC<RoomAssessmentStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData, saveWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  // STANDARDIZED: Use 'rooms' as single source of truth (migrate from old 'roomAssessments' key)
  const [rooms, setRooms] = useState<RoomData[]>(installData.rooms || installData.roomAssessments || []);
  const [moistureTracking, setMoistureTracking] = useState<MaterialMoistureTracking[]>(
    installData.moistureTracking || []
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    rooms.length > 0 ? rooms[0].id : null
  );
  const [activeTab, setActiveTab] = useState<'info' | 'moisture' | 'materials'>('info');
  const [showPreexistingModal, setShowPreexistingModal] = useState(false);

  // Material category expansion state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set()); // Default: All collapsed

  // New room form
  const [newRoomForm, setNewRoomForm] = useState({
    name: '',
    type: 'Bedroom' as RoomType,
    floor: '1st Floor',
    length: '',
    width: '',
    height: '8',
  });

  // Migrate old rooms to new material structure and new photo structure
  useEffect(() => {
    let needsMigration = false;
    const migratedRooms = rooms.map(room => {
      let updatedRoom = { ...room };

      // Check if room has old material structure (< 42 materials or has old material names like 'Appliances')
      const hasOldAppliances = room.materialsAffected.some(m => m.materialType === 'Appliances' as any);
      if (room.materialsAffected.length < 42 || hasOldAppliances) {
        needsMigration = true;
        // Preserve any custom materials that were added
        const customMaterials = room.materialsAffected.filter(m => m.materialType === 'Custom');
        updatedRoom.materialsAffected = [...getDefaultMaterials(), ...customMaterials];
      }

      // PHASE 1 MIGRATION: Convert old overviewPhoto to overallPhotos array
      if ('overviewPhoto' in updatedRoom && !(updatedRoom as any).overallPhotos) {
        needsMigration = true;
        const oldPhoto = (updatedRoom as any).overviewPhoto;
        updatedRoom.overallPhotos = oldPhoto ? [oldPhoto] : [];
        delete (updatedRoom as any).overviewPhoto;
        console.log('🔄 Migrating room photo structure: overviewPhoto → overallPhotos');
      }

      // PHASE 1 MIGRATION: Ensure overallPhotos exists
      if (!updatedRoom.overallPhotos) {
        needsMigration = true;
        updatedRoom.overallPhotos = [];
      }

      // PHASE 1 MIGRATION: Ensure thermalPhotos exists
      if (!updatedRoom.thermalPhotos) {
        needsMigration = true;
        updatedRoom.thermalPhotos = [];
      }

      return updatedRoom;
    });

    if (needsMigration) {
      console.log('🔄 Migrating rooms to new structure (Phase 1 photo requirements)');
      setRooms(migratedRooms);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ULTRAFAULT FIX: Save IMMEDIATELY to Firebase - NO DEBOUNCE
  // The 2-second debounce was causing data loss when user navigated away quickly
  const prevDataRef = useRef({
    rooms: JSON.stringify(installData.rooms || installData.roomAssessments || []),
    moistureTracking: JSON.stringify(installData.moistureTracking || [])
  });

  useEffect(() => {
    const currentRoomsStr = JSON.stringify(rooms);
    const currentMoistureStr = JSON.stringify(moistureTracking);

    // Only update if values actually changed from what we loaded from store
    if (
      prevDataRef.current.rooms !== currentRoomsStr ||
      prevDataRef.current.moistureTracking !== currentMoistureStr
    ) {
      console.log('🔄 RoomAssessmentStep: Data changed, saving IMMEDIATELY');

      // 1. Update Zustand store immediately (in-memory)
      updateWorkflowData('install', {
        rooms: rooms,
        moistureTracking: moistureTracking
      });

      // 2. ULTRAFAULT: SAVE IMMEDIATELY TO FIREBASE - NO DELAY
      saveWorkflowData().then(() => {
        console.log('✅ IMMEDIATE save to Firebase successful');
      }).catch((error) => {
        console.error('❌ IMMEDIATE save failed:', error);
      });

      // Update ref to prevent re-triggering
      prevDataRef.current = {
        rooms: currentRoomsStr,
        moistureTracking: currentMoistureStr
      };
    }
  }, [rooms, moistureTracking, updateWorkflowData, saveWorkflowData]);

  // ULTRAFAULT: Force save on component unmount to catch any pending changes
  useEffect(() => {
    return () => {
      console.log('🚪 RoomAssessmentStep: Component unmounting, forcing final save');
      saveWorkflowData().catch((error) => {
        console.error('❌ Unmount save failed:', error);
      });
    };
  }, [saveWorkflowData]);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const addRoom = () => {
    // Validation
    if (!newRoomForm.name.trim()) {
      alert('Please enter a room name');
      return;
    }
    if (!newRoomForm.length || !newRoomForm.width) {
      alert('Please enter room dimensions');
      return;
    }

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
      overallPhotos: [], // Phase 1: Minimum 4 required
      thermalPhotos: [], // Phase 1: Optional thermal imaging
      isComplete: false,
    };

    setRooms([...rooms, newRoom]);
    setNewRoomForm({ name: '', type: 'Bedroom', floor: '1st Floor', length: '', width: '', height: '8' });
    // Open the newly created room in detail view
    openRoomDetail(newRoom.id);
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

  // NOTE: Old moisture reading functions removed - now using MoistureTabContent component

  const updateMaterial = (materialType: MaterialType, updates: Partial<MaterialAffected>) => {
    if (!selectedRoom) return;

    updateSelectedRoom({
      materialsAffected: selectedRoom.materialsAffected.map(m =>
        m.materialType === materialType ? { ...m, ...updates } : m
      ),
    });
  };

  const addCustomMaterial = () => {
    if (!selectedRoom) return;

    const customMaterial: MaterialAffected = {
      id: `custom-${Date.now()}`,
      materialType: 'Custom',
      customMaterialName: '',
      isAffected: true,
      squareFootage: 0,
      removalRequired: true,
      removalReason: '',
      notes: '',
    };

    updateSelectedRoom({
      materialsAffected: [...selectedRoom.materialsAffected, customMaterial],
    });
  };

  const updateCustomMaterial = (id: string, updates: Partial<MaterialAffected>) => {
    if (!selectedRoom) return;

    updateSelectedRoom({
      materialsAffected: selectedRoom.materialsAffected.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ),
    });
  };

  const deleteCustomMaterial = (id: string) => {
    if (!selectedRoom) return;

    updateSelectedRoom({
      materialsAffected: selectedRoom.materialsAffected.filter(m => m.id !== id),
    });
  };

  const handleNext = async () => {
    const incompleteRooms = rooms.filter(r => !r.isComplete);

    if (incompleteRooms.length > 0) {
      alert(`Please complete assessment for ${incompleteRooms.length} room(s)`);
      return;
    }

    if (rooms.length === 0) {
      alert('Please add at least one room');
      return;
    }

    // ULTRAFAULT FIX: Save to Firebase before continuing
    try {
      await saveWorkflowData();
      console.log('✅ All room data saved to Firebase before continuing');
      onNext();
    } catch (error) {
      console.error('❌ Failed to save room data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  const getDefaultMaterials = (): MaterialAffected[] => [
    // Flooring
    { materialType: 'Carpet & Pad', isAffected: false, squareFootage: 0, removalRequired: false, installationType: 'N/A' },
    { materialType: 'Hardwood Flooring', isAffected: false, squareFootage: 0, removalRequired: false, installationType: 'N/A' },
    { materialType: 'Vinyl/Linoleum Flooring', isAffected: false, squareFootage: 0, removalRequired: false, installationType: 'N/A' },
    { materialType: 'Tile Flooring', isAffected: false, squareFootage: 0, removalRequired: false, installationType: 'N/A' },
    { materialType: 'Laminate Flooring', isAffected: false, squareFootage: 0, removalRequired: false, installationType: 'N/A' },
    { materialType: 'Engineered Flooring', isAffected: false, squareFootage: 0, removalRequired: false, installationType: 'N/A' },
    { materialType: 'Subfloor', isAffected: false, squareFootage: 0, removalRequired: false },

    // Drywall
    { materialType: 'Drywall - Wall', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Drywall - Ceiling', isAffected: false, squareFootage: 0, removalRequired: false },

    // Trim & Molding
    { materialType: 'Baseboards', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Shoe Molding', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Crown Molding', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Door Casing', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Window Casing', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Chair Rail', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Other Trim', isAffected: false, squareFootage: 0, removalRequired: false },

    // Tile & Backsplash
    { materialType: 'Tile Walls', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Backsplash', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Tub Surround', isAffected: false, squareFootage: 0, removalRequired: false },

    // Cabinetry & Counters
    { materialType: 'Base Cabinets', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Upper Cabinets', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Vanity', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Countertops', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Shelving', isAffected: false, squareFootage: 0, removalRequired: false },

    // Insulation
    { materialType: 'Insulation - Wall', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Insulation - Ceiling/Attic', isAffected: false, squareFootage: 0, removalRequired: false },

    // Fixtures & Appliances
    { materialType: 'Sink/Faucet', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Tub', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Shower Pan', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Dishwasher', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Refrigerator', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Washer', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Dryer', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Stove/Oven', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Microwave', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Water Heater', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Disposal', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Other Appliance', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Mirror', isAffected: false, squareFootage: 0, removalRequired: false },
    { materialType: 'Towel Bars/Accessories', isAffected: false, squareFootage: 0, removalRequired: false },

    // Other
    { materialType: 'Other', isAffected: false, squareFootage: 0, removalRequired: false },
  ];

  const completedCount = rooms.filter(r => r.isComplete).length;
  const totalCount = rooms.length;

  // Toggle category expansion with auto-close behavior
  const toggleCategory = (category: string) => {
    const newExpanded = new Set<string>();
    // If clicking already-open category, close it. Otherwise open clicked category and close all others
    if (!expandedCategories.has(category)) {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // View state: 'list' | 'detail' | 'add'
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'add'>('list');

  const openRoomDetail = (roomId: string) => {
    setSelectedRoomId(roomId);
    setViewMode('detail');
    setActiveTab('info');
  };

  const returnToList = () => {
    setViewMode('list');
    setSelectedRoomId(null);
  };

  const markCompleteAndReturn = () => {
    if (!selectedRoom) return;

    // If already complete, just return to list
    if (selectedRoom.isComplete) {
      returnToList();
      return;
    }

    // Validation for new completions
    if (selectedRoom.length === 0 || selectedRoom.width === 0) {
      alert('Please enter room dimensions before marking complete');
      return;
    }

    // Affected Area Validation
    const totalAffectedSqFt = (selectedRoom.affectedFloorSqFt || 0) +
                             (selectedRoom.affectedWallsSqFt || 0) +
                             (selectedRoom.affectedCeilingSqFt || 0);
    if (totalAffectedSqFt === 0) {
      alert('Please enter affected square footage for floor, walls, or ceiling before marking complete. This is required for equipment calculations.');
      return;
    }

    // PHASE 1 VALIDATION: Check overall photos (minimum 4 required)
    if (selectedRoom.overallPhotos.length < 4) {
      alert(`Please capture at least 4 overall room photos. You currently have ${selectedRoom.overallPhotos.length} photo(s).`);
      return;
    }

    // PHASE 1 VALIDATION: Check moisture photos (minimum 1 material tracked)
    const roomMoistureTracking = moistureTracking.filter(t => t.roomId === selectedRoom.id);

    if (roomMoistureTracking.length < 1) {
      alert(`Please add at least 1 moisture reading for this room. Click the Moisture tab to add moisture readings with photos.`);
      return;
    }

    // PHASE 1 VALIDATION: Check materials marked for removal
    const materialsMarkedForRemoval = selectedRoom.materialsAffected.filter(m => m.removalRequired).length;
    if (materialsMarkedForRemoval === 0) {
      const confirmContinue = window.confirm(
        `⚠️ No materials marked for removal!\n\nYou haven't selected any construction materials, fixtures, or appliances for removal.\n\nIs this room truly unaffected?\n\nClick OK to continue anyway, or Cancel to review materials.`
      );
      if (!confirmContinue) {
        return;
      }
    }

    updateSelectedRoom({ isComplete: true });

    // ULTRAFAULT FIX: Save to Firebase immediately
    saveWorkflowData().then(() => {
      console.log('✅ Room data saved to Firebase');
    }).catch((error) => {
      console.error('❌ Failed to save room data:', error);
    });

    // Success feedback
    alert(`✅ ${selectedRoom.name} marked complete!\n\n${roomMoistureTracking.length} moisture reading(s) captured\n${materialsMarkedForRemoval} material(s) marked for removal\n\nReturning to room list...`);

    returnToList();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ROOM LIST VIEW */}
      {viewMode === 'list' && (
        <div className="max-w-4xl mx-auto p-3">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Assessment</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>{completedCount}/{totalCount}</strong> rooms completed
              </p>
            </div>
          </div>

          {/* Add Room Button */}
          <Button
            variant="primary"
            onClick={() => setViewMode('add')}
            className="w-full mb-2"
          >
            <Plus className="w-5 h-5" />
            Add Room
          </Button>

          {/* Room List */}
          <div className="space-y-3">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => openRoomDetail(room.id)}
                className="w-full text-left p-3 rounded-lg border-2 border-gray-300 bg-white hover:border-orange-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-gray-900">{room.name}</span>
                      {room.isComplete && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{room.floor}</p>
                    <p className="text-sm text-gray-700">
                      {room.length > 0 ? `${room.length}' × ${room.width}' × ${room.height}'` : 'No dimensions yet'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {moistureTracking.filter(t => t.roomId === room.id).length} material(s) tracked
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRoom(room.id);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </button>
            ))}

            {rooms.length === 0 && (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Home className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                <p className="text-base">No rooms added yet</p>
                <p className="text-sm mt-1">Click "Add Room" to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROOM DETAIL VIEW */}
      {viewMode === 'detail' && selectedRoom && (
        <div className="min-h-screen bg-white flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-300 bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={returnToList}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <ChevronRight className="w-5 h-5 transform rotate-180" />
                <span>Back to Rooms</span>
              </button>

              {/* Save & Mark Complete Button - Moved to Header */}
              <Button
                variant="primary"
                onClick={markCompleteAndReturn}
                className="flex items-center gap-2"
              >
                {selectedRoom.isComplete ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Return to Room List
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Save & Mark Complete
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.name}</h2>
                <p className="text-sm text-gray-600">{selectedRoom.floor} • {selectedRoom.type}</p>
              </div>
              {selectedRoom.isComplete && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Complete</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-300 bg-white sticky top-0 z-10">
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
                Moisture ({moistureTracking.filter(t => t.roomId === selectedRoom.id).length})
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
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-3">
              {activeTab === 'info' && (
                <div className="max-w-2xl space-y-4">
                  <div className="grid grid-cols-3 gap-2">
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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      <strong>Cubic Footage:</strong> {(selectedRoom.length * selectedRoom.width * selectedRoom.height).toFixed(0)} cf
                    </p>
                    <p className="text-sm text-blue-900 mt-1">
                      <strong>Square Footage:</strong> {(selectedRoom.length * selectedRoom.width).toFixed(0)} sq ft
                    </p>
                  </div>

                  {/* Affected Area - For Equipment Calculations */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Affected Area *</h3>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-orange-900 font-medium">
                            <strong>REQUIRED:</strong> Enter affected square footage for each surface
                          </p>
                          <p className="text-sm text-orange-900 mt-1">
                            Used to calculate damage class and equipment requirements per IICRC S500
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedRoom.length > 0 && selectedRoom.width > 0 && selectedRoom.height > 0 ? (
                      <div className="space-y-4">
                        {/* Calculated Total Surfaces */}
                        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Total Surface Areas:</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">Floor:</span>
                              <span className="font-bold ml-1">
                                {(selectedRoom.length * selectedRoom.width).toFixed(1)} sq ft
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Walls:</span>
                              <span className="font-bold ml-1">
                                {(2 * selectedRoom.length * selectedRoom.height + 2 * selectedRoom.width * selectedRoom.height).toFixed(1)} sq ft
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Ceiling:</span>
                              <span className="font-bold ml-1">
                                {(selectedRoom.length * selectedRoom.width).toFixed(1)} sq ft
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Affected Square Footage Inputs */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Floor Affected (sq ft) *
                            </label>
                            <input
                              type="number"
                              value={selectedRoom.affectedFloorSqFt || 0}
                              onChange={(e) => updateSelectedRoom({ affectedFloorSqFt: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              step="0.1"
                              min="0"
                              max={selectedRoom.length * selectedRoom.width}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Walls Affected (sq ft) *
                            </label>
                            <input
                              type="number"
                              value={selectedRoom.affectedWallsSqFt || 0}
                              onChange={(e) => updateSelectedRoom({ affectedWallsSqFt: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              step="0.1"
                              min="0"
                              max={2 * selectedRoom.length * selectedRoom.height + 2 * selectedRoom.width * selectedRoom.height}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ceiling Affected (sq ft) *
                            </label>
                            <input
                              type="number"
                              value={selectedRoom.affectedCeilingSqFt || 0}
                              onChange={(e) => updateSelectedRoom({ affectedCeilingSqFt: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              step="0.1"
                              min="0"
                              max={selectedRoom.length * selectedRoom.width}
                            />
                          </div>
                        </div>

                        {/* Damage Class Calculation */}
                        {(() => {
                          const totalSurface = (selectedRoom.length * selectedRoom.width * 2) +
                                             (selectedRoom.length * selectedRoom.height * 2) +
                                             (selectedRoom.width * selectedRoom.height * 2);
                          const totalAffected = (selectedRoom.affectedFloorSqFt || 0) +
                                              (selectedRoom.affectedWallsSqFt || 0) +
                                              (selectedRoom.affectedCeilingSqFt || 0);
                          const percentAffected = totalSurface > 0 ? (totalAffected / totalSurface) * 100 : 0;

                          let damageClass: 1 | 2 | 3 | 4 = 1;
                          if (percentAffected > 40) {
                            damageClass = 3;
                          } else if (percentAffected >= 5) {
                            damageClass = 2;
                          }

                          // Update the room with calculated class
                          if (totalAffected > 0 && selectedRoom.damageClass !== damageClass) {
                            setTimeout(() => updateSelectedRoom({ damageClass, percentAffected }), 0);
                          }

                          return totalAffected > 0 ? (
                            <div className={`border-l-4 rounded-lg p-3 ${
                              damageClass === 3 ? 'border-red-500 bg-red-50' :
                              damageClass === 2 ? 'border-yellow-500 bg-yellow-50' :
                              'border-green-500 bg-green-50'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Damage Class: {damageClass}
                                  </p>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {percentAffected.toFixed(1)}% of total surface area affected ({totalAffected.toFixed(1)} / {totalSurface.toFixed(1)} sq ft)
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {damageClass === 3 ? 'Class 3: Fast evaporation rate (>40% affected)' :
                                     damageClass === 2 ? 'Class 2: Moderate evaporation rate (5-40% affected)' :
                                     'Class 1: Slow evaporation rate (<5% affected)'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-900">
                          Enter room dimensions first to calculate affected areas
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PHASE 1: Overall Room Photos - REQUIRED (4+ minimum) */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Room Photos</h3>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-orange-900 font-medium mb-1">
                            <strong>REQUIRED:</strong> Minimum 4 photos
                          </p>
                          <p className="text-sm text-orange-900">
                            • 1 wide shot showing full room<br />
                            • 3+ close-ups of visible damage areas
                          </p>
                        </div>
                      </div>
                    </div>

                    {user && (
                      <UniversalPhotoCapture
                        jobId={job.jobId}
                        location={selectedRoom.id}
                        category="overall"
                        userId={user.uid}
                        onPhotosUploaded={(urls) => {
                          updateSelectedRoom({
                            overallPhotos: [...selectedRoom.overallPhotos, ...urls],
                          });
                        }}
                        uploadedCount={selectedRoom.overallPhotos.length}
                        label={`${selectedRoom.name} Overview Photos *`}
                        minimumPhotos={4}
                      />
                    )}
                  </div>

                  {/* PHASE 1: Thermal Imaging Photos - OPTIONAL */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Thermal Imaging (Optional)</h3>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-900 font-medium mb-1">
                            Optional - Use When Moisture is Hidden
                          </p>
                          <p className="text-sm text-blue-800">
                            • Use thermal imaging if you suspect moisture behind walls, ceilings, or insulation that isn't visible
                            <br/>• Helps identify hidden moisture patterns and temperature differentials
                          </p>
                        </div>
                      </div>
                    </div>

                    {user && (
                      <UniversalPhotoCapture
                        jobId={job.jobId}
                        location={selectedRoom.id}
                        category="thermal"
                        userId={user.uid}
                        onPhotosUploaded={(urls) => {
                          updateSelectedRoom({
                            thermalPhotos: [...(selectedRoom.thermalPhotos || []), ...urls],
                          });
                        }}
                        uploadedCount={selectedRoom.thermalPhotos?.length || 0}
                        label={`${selectedRoom.name} Thermal Imaging (Optional)`}
                      />
                    )}
                  </div>

                  {/* Pre-existing Damage Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-existing Damage</h3>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-900">
                            Document any pre-existing damage in this room (damage not caused by current water loss).
                            This protects you from liability claims later.
                          </p>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer mb-2">
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
                <MoistureTabContent
                  job={job}
                  roomId={selectedRoom.id}
                  roomName={selectedRoom.name}
                  moistureTracking={moistureTracking}
                  onUpdate={setMoistureTracking}
                />
              )}

              {activeTab === 'materials' && (
                <div className="max-w-4xl space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Materials Removal Plan</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Document what materials need to be removed and why. Expand categories to select materials.
                    </p>
                  </div>

                  {/* FLOORING CATEGORY */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('flooring')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Flooring
                        {selectedRoom.materialsAffected.filter(m =>
                          ['Carpet & Pad', 'Hardwood Flooring', 'Vinyl/Linoleum Flooring', 'Tile Flooring', 'Laminate Flooring', 'Engineered Flooring', 'Subfloor'].includes(m.materialType) && m.removalRequired
                        ).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m =>
                              ['Carpet & Pad', 'Hardwood Flooring', 'Vinyl/Linoleum Flooring', 'Tile Flooring', 'Laminate Flooring', 'Engineered Flooring', 'Subfloor'].includes(m.materialType) && m.removalRequired
                            ).length} selected
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories.has('flooring') ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedCategories.has('flooring') && (
                      <div className="p-3 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => ['Carpet & Pad', 'Hardwood Flooring', 'Vinyl/Linoleum Flooring', 'Tile Flooring', 'Laminate Flooring', 'Engineered Flooring', 'Subfloor'].includes(m.materialType))
                          .map((material) => {
                            const isFlooringType = material.materialType !== 'Subfloor';
                            return (
                              <div key={material.materialType} className="space-y-2">
                                <button
                                  onClick={() => updateMaterial(material.materialType, {
                                    removalRequired: !material.removalRequired,
                                    isAffected: !material.removalRequired
                                  })}
                                  className={`
                                    w-full min-h-[44px] px-4 py-3 rounded-lg border-2 transition-all
                                    active:scale-95 flex items-center justify-between
                                    ${material.removalRequired
                                      ? 'border-entrusted-orange bg-orange-100'
                                      : 'border-gray-300 bg-white hover:border-gray-400'}
                                  `}
                                >
                                  <span className="text-sm text-gray-900">{material.materialType}</span>
                                  {material.removalRequired && <CheckCircle className="w-5 h-5 text-entrusted-orange" />}
                                </button>
                                {material.removalRequired && (
                                  <div className="ml-6 space-y-3 mt-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (sq ft)</label>
                                        <input
                                          type="number"
                                          value={material.squareFootage}
                                          onChange={(e) => updateMaterial(material.materialType, { squareFootage: parseFloat(e.target.value) || 0 })}
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                          placeholder="0"
                                        />
                                      </div>
                                      {isFlooringType && (
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Installation Type</label>
                                          <select
                                            value={material.installationType || 'N/A'}
                                            onChange={(e) => updateMaterial(material.materialType, { installationType: e.target.value as FlooringInstallationType })}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                          >
                                            <option value="N/A">Select...</option>
                                            <option value="Floating">Floating</option>
                                            <option value="Glue Down">Glue Down</option>
                                            <option value="Nail Down">Nail Down</option>
                                            <option value="Staple Down">Staple Down</option>
                                            <option value="Stretch">Stretch (Carpet)</option>
                                            <option value="Tar & Screed">Tar & Screed</option>
                                            <option value="Direct Glue">Direct Glue</option>
                                          </select>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Removal</label>
                                      <select
                                        value={material.removalReason || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { removalReason: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      >
                                        <option value="">Select...</option>
                                        <option value="saturated">Saturated / Water-logged</option>
                                        <option value="contaminated">Contaminated (Cat 2/3)</option>
                                        <option value="visual-contamination">Visual Contamination</option>
                                        <option value="damaged">Structurally Damaged</option>
                                        <option value="access">Access Required</option>
                                        <option value="customer">Customer Request</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                                      <input
                                        type="text"
                                        value={material.notes || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { notes: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="Add any additional details..."
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* DRYWALL CATEGORY */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('drywall')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Drywall
                        {selectedRoom.materialsAffected.filter(m =>
                          ['Drywall - Wall', 'Drywall - Ceiling'].includes(m.materialType) && m.removalRequired
                        ).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m =>
                              ['Drywall - Wall', 'Drywall - Ceiling'].includes(m.materialType) && m.removalRequired
                            ).length} selected
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories.has('drywall') ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedCategories.has('drywall') && (
                      <div className="p-3 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => ['Drywall - Wall', 'Drywall - Ceiling'].includes(m.materialType))
                          .map((material) => (
                            <div key={material.materialType} className="space-y-2">
                              <button
                                onClick={() => updateMaterial(material.materialType, {
                                  removalRequired: !material.removalRequired,
                                  isAffected: !material.removalRequired
                                })}
                                className={`
                                  w-full min-h-[36px] px-3 py-2 rounded-lg border-2 transition-all
                                  active:scale-95 flex items-center justify-between
                                  ${material.removalRequired
                                    ? 'border-entrusted-orange bg-orange-100'
                                    : 'border-gray-300 bg-white hover:border-gray-400'}
                                `}
                              >
                                <span className="text-sm text-gray-900">{material.materialType}</span>
                                {material.removalRequired && <CheckCircle className="w-5 h-5 text-entrusted-orange" />}
                              </button>
                              {material.removalRequired && (
                                <div className="ml-6 space-y-3 mt-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (sq ft)</label>
                                      <input
                                        type="number"
                                        value={material.squareFootage}
                                        onChange={(e) => updateMaterial(material.materialType, { squareFootage: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Removal</label>
                                      <select
                                        value={material.removalReason || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { removalReason: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      >
                                        <option value="">Select...</option>
                                        <option value="saturated">Saturated / Water-logged</option>
                                        <option value="contaminated">Contaminated (Cat 2/3)</option>
                                        <option value="visual-contamination">Visual Contamination</option>
                                        <option value="damaged">Structurally Damaged</option>
                                        <option value="access">Access Required</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                                      <input
                                        type="text"
                                        value={material.notes || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { notes: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="Add any additional details..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* TRIM & MOLDING CATEGORY */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('trim')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Trim & Molding
                        {selectedRoom.materialsAffected.filter(m =>
                          ['Baseboards', 'Shoe Molding', 'Crown Molding', 'Door Casing', 'Window Casing', 'Chair Rail', 'Other Trim'].includes(m.materialType) && m.removalRequired
                        ).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m =>
                              ['Baseboards', 'Shoe Molding', 'Crown Molding', 'Door Casing', 'Window Casing', 'Chair Rail', 'Other Trim'].includes(m.materialType) && m.removalRequired
                            ).length} selected
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories.has('trim') ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedCategories.has('trim') && (
                      <div className="p-3 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => ['Baseboards', 'Shoe Molding', 'Crown Molding', 'Door Casing', 'Window Casing', 'Chair Rail', 'Other Trim'].includes(m.materialType))
                          .map((material) => (
                            <div key={material.materialType} className="space-y-2">
                              <button
                                onClick={() => updateMaterial(material.materialType, {
                                  removalRequired: !material.removalRequired,
                                  isAffected: !material.removalRequired
                                })}
                                className={`
                                  w-full min-h-[36px] px-3 py-2 rounded-lg border-2 transition-all
                                  active:scale-95 flex items-center justify-between
                                  ${material.removalRequired
                                    ? 'border-entrusted-orange bg-orange-100'
                                    : 'border-gray-300 bg-white hover:border-gray-400'}
                                `}
                              >
                                <span className="text-sm text-gray-900">{material.materialType}</span>
                                {material.removalRequired && <CheckCircle className="w-5 h-5 text-entrusted-orange" />}
                              </button>
                              {material.removalRequired && (
                                <div className="ml-6 space-y-3 mt-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (linear ft)</label>
                                      <input
                                        type="number"
                                        value={material.squareFootage}
                                        onChange={(e) => updateMaterial(material.materialType, { squareFootage: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Removal</label>
                                      <select
                                        value={material.removalReason || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { removalReason: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      >
                                        <option value="">Select...</option>
                                        <option value="saturated">Saturated</option>
                                        <option value="contaminated">Contaminated (Cat 2/3)</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="access">Access Required</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                                      <input
                                        type="text"
                                        value={material.notes || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { notes: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="Add any additional details..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* TILE & BACKSPLASH CATEGORY */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('tile')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Tile & Backsplash
                        {selectedRoom.materialsAffected.filter(m =>
                          ['Tile Walls', 'Backsplash', 'Tub Surround'].includes(m.materialType) && m.removalRequired
                        ).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m =>
                              ['Tile Walls', 'Backsplash', 'Tub Surround'].includes(m.materialType) && m.removalRequired
                            ).length} selected
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories.has('tile') ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedCategories.has('tile') && (
                      <div className="p-3 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => ['Tile Walls', 'Backsplash', 'Tub Surround'].includes(m.materialType))
                          .map((material) => (
                            <div key={material.materialType} className="space-y-2">
                              <button
                                onClick={() => updateMaterial(material.materialType, {
                                  removalRequired: !material.removalRequired,
                                  isAffected: !material.removalRequired
                                })}
                                className={`
                                  w-full min-h-[36px] px-3 py-2 rounded-lg border-2 transition-all
                                  active:scale-95 flex items-center justify-between
                                  ${material.removalRequired
                                    ? 'border-entrusted-orange bg-orange-100'
                                    : 'border-gray-300 bg-white hover:border-gray-400'}
                                `}
                              >
                                <span className="text-sm text-gray-900">{material.materialType}</span>
                                {material.removalRequired && <CheckCircle className="w-5 h-5 text-entrusted-orange" />}
                              </button>
                              {material.removalRequired && (
                                <div className="ml-6 space-y-3 mt-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (sq ft)</label>
                                      <input
                                        type="number"
                                        value={material.squareFootage}
                                        onChange={(e) => updateMaterial(material.materialType, { squareFootage: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Removal</label>
                                      <select
                                        value={material.removalReason || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { removalReason: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      >
                                        <option value="">Select...</option>
                                        <option value="damaged">Damaged/Cracked</option>
                                        <option value="contaminated">Contaminated (Cat 2/3)</option>
                                        <option value="access">Access Required</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                                      <input
                                        type="text"
                                        value={material.notes || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { notes: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="Add any additional details..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* CABINETRY & COUNTERS CATEGORY */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('cabinetry')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Cabinetry & Counters
                        {selectedRoom.materialsAffected.filter(m =>
                          ['Base Cabinets', 'Upper Cabinets', 'Vanity', 'Countertops', 'Shelving'].includes(m.materialType) && m.removalRequired
                        ).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m =>
                              ['Base Cabinets', 'Upper Cabinets', 'Vanity', 'Countertops', 'Shelving'].includes(m.materialType) && m.removalRequired
                            ).length} selected
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories.has('cabinetry') ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedCategories.has('cabinetry') && (
                      <div className="p-3 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => ['Base Cabinets', 'Upper Cabinets', 'Vanity', 'Countertops', 'Shelving'].includes(m.materialType))
                          .map((material) => (
                            <div key={material.materialType} className="space-y-2">
                              <button
                                onClick={() => updateMaterial(material.materialType, {
                                  removalRequired: !material.removalRequired,
                                  isAffected: !material.removalRequired
                                })}
                                className={`
                                  w-full min-h-[36px] px-3 py-2 rounded-lg border-2 transition-all
                                  active:scale-95 flex items-center justify-between
                                  ${material.removalRequired
                                    ? 'border-entrusted-orange bg-orange-100'
                                    : 'border-gray-300 bg-white hover:border-gray-400'}
                                `}
                              >
                                <span className="text-sm text-gray-900">{material.materialType}</span>
                                {material.removalRequired && <CheckCircle className="w-5 h-5 text-entrusted-orange" />}
                              </button>
                              {material.removalRequired && (
                                <div className="ml-6 space-y-3 mt-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (linear ft)</label>
                                      <input
                                        type="number"
                                        value={material.squareFootage}
                                        onChange={(e) => updateMaterial(material.materialType, { squareFootage: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Removal</label>
                                      <select
                                        value={material.removalReason || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { removalReason: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      >
                                        <option value="">Select...</option>
                                        <option value="saturated">Saturated</option>
                                        <option value="contaminated">Contaminated (Cat 2/3)</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="access">Access Required</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                                      <input
                                        type="text"
                                        value={material.notes || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { notes: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="Add any additional details..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* INSULATION CATEGORY */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('insulation')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Insulation
                        {selectedRoom.materialsAffected.filter(m =>
                          ['Insulation - Wall', 'Insulation - Ceiling/Attic'].includes(m.materialType) && m.removalRequired
                        ).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m =>
                              ['Insulation - Wall', 'Insulation - Ceiling/Attic'].includes(m.materialType) && m.removalRequired
                            ).length} selected
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories.has('insulation') ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedCategories.has('insulation') && (
                      <div className="p-3 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => ['Insulation - Wall', 'Insulation - Ceiling/Attic'].includes(m.materialType))
                          .map((material) => (
                            <div key={material.materialType} className="space-y-2">
                              <button
                                onClick={() => updateMaterial(material.materialType, {
                                  removalRequired: !material.removalRequired,
                                  isAffected: !material.removalRequired
                                })}
                                className={`
                                  w-full min-h-[36px] px-3 py-2 rounded-lg border-2 transition-all
                                  active:scale-95 flex items-center justify-between
                                  ${material.removalRequired
                                    ? 'border-entrusted-orange bg-orange-100'
                                    : 'border-gray-300 bg-white hover:border-gray-400'}
                                `}
                              >
                                <span className="text-sm text-gray-900">{material.materialType}</span>
                                {material.removalRequired && <CheckCircle className="w-5 h-5 text-entrusted-orange" />}
                              </button>
                              {material.removalRequired && (
                                <div className="ml-6 space-y-3 mt-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (sq ft)</label>
                                      <input
                                        type="number"
                                        value={material.squareFootage}
                                        onChange={(e) => updateMaterial(material.materialType, { squareFootage: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Removal</label>
                                      <select
                                        value={material.removalReason || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { removalReason: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      >
                                        <option value="">Select...</option>
                                        <option value="saturated">Saturated</option>
                                        <option value="contaminated">Contaminated (Cat 2/3)</option>
                                        <option value="access">Access Required</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                                      <input
                                        type="text"
                                        value={material.notes || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { notes: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="Add any additional details..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* FIXTURES & APPLIANCES CATEGORY */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('fixtures')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Fixtures & Appliances
                        {selectedRoom.materialsAffected.filter(m =>
                          ['Sink/Faucet', 'Tub', 'Shower Pan', 'Dishwasher', 'Refrigerator', 'Washer', 'Dryer', 'Stove/Oven', 'Microwave', 'Water Heater', 'Disposal', 'Other Appliance', 'Mirror', 'Towel Bars/Accessories'].includes(m.materialType) && m.removalRequired
                        ).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m =>
                              ['Sink/Faucet', 'Tub', 'Shower Pan', 'Dishwasher', 'Refrigerator', 'Washer', 'Dryer', 'Stove/Oven', 'Microwave', 'Water Heater', 'Disposal', 'Other Appliance', 'Mirror', 'Towel Bars/Accessories'].includes(m.materialType) && m.removalRequired
                            ).length} selected
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories.has('fixtures') ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedCategories.has('fixtures') && (
                      <div className="p-3 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => ['Sink/Faucet', 'Tub', 'Shower Pan', 'Dishwasher', 'Refrigerator', 'Washer', 'Dryer', 'Stove/Oven', 'Microwave', 'Water Heater', 'Disposal', 'Other Appliance', 'Mirror', 'Towel Bars/Accessories'].includes(m.materialType))
                          .map((material) => (
                            <div key={material.materialType} className="space-y-2">
                              <button
                                onClick={() => updateMaterial(material.materialType, {
                                  removalRequired: !material.removalRequired,
                                  isAffected: !material.removalRequired
                                })}
                                className={`
                                  w-full min-h-[36px] px-3 py-2 rounded-lg border-2 transition-all
                                  active:scale-95 flex items-center justify-between
                                  ${material.removalRequired
                                    ? 'border-entrusted-orange bg-orange-100'
                                    : 'border-gray-300 bg-white hover:border-gray-400'}
                                `}
                              >
                                <span className="text-sm text-gray-900">{material.materialType}</span>
                                {material.removalRequired && <CheckCircle className="w-5 h-5 text-entrusted-orange" />}
                              </button>
                              {material.removalRequired && (
                                <div className="ml-6 space-y-3 mt-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (each)</label>
                                      <input
                                        type="number"
                                        value={material.squareFootage}
                                        onChange={(e) => updateMaterial(material.materialType, { squareFootage: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Removal</label>
                                      <select
                                        value={material.removalReason || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { removalReason: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      >
                                        <option value="">Select...</option>
                                        <option value="access">Access Required</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="customer">Customer Request</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                                    <input
                                      type="text"
                                      value={material.notes || ''}
                                      onChange={(e) => updateMaterial(material.materialType, { notes: e.target.value })}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      placeholder="Add any additional details..."
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* OTHER CATEGORY */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('other')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Other
                        {selectedRoom.materialsAffected.filter(m => m.materialType === 'Other' && m.removalRequired).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            1 selected
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories.has('other') ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedCategories.has('other') && (
                      <div className="p-3 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => m.materialType === 'Other')
                          .map((material) => (
                            <div key={material.materialType} className="space-y-2">
                              <button
                                onClick={() => updateMaterial(material.materialType, {
                                  removalRequired: !material.removalRequired,
                                  isAffected: !material.removalRequired
                                })}
                                className={`
                                  w-full min-h-[36px] px-3 py-2 rounded-lg border-2 transition-all
                                  active:scale-95 flex items-center justify-between
                                  ${material.removalRequired
                                    ? 'border-entrusted-orange bg-orange-100'
                                    : 'border-gray-300 bg-white hover:border-gray-400'}
                                `}
                              >
                                <span className="text-sm text-gray-900">{material.materialType}</span>
                                {material.removalRequired && <CheckCircle className="w-5 h-5 text-entrusted-orange" />}
                              </button>
                              {material.removalRequired && (
                                <div className="ml-6 space-y-3 mt-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Material Description</label>
                                    <input
                                      type="text"
                                      value={material.notes || ''}
                                      onChange={(e) => updateMaterial(material.materialType, { notes: e.target.value })}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                                      placeholder="Describe the material..."
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                      <input
                                        type="number"
                                        value={material.squareFootage}
                                        onChange={(e) => updateMaterial(material.materialType, { squareFootage: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Removal</label>
                                      <select
                                        value={material.removalReason || ''}
                                        onChange={(e) => updateMaterial(material.materialType, { removalReason: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      >
                                        <option value="">Select...</option>
                                        <option value="saturated">Saturated</option>
                                        <option value="contaminated">Contaminated</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="access">Access Required</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* CUSTOM MATERIALS SECTION */}
                  <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('custom')}
                      className="w-full px-4 py-3 bg-blue-50 flex items-center justify-between hover:bg-blue-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Custom Materials
                        {selectedRoom.materialsAffected.filter(m => m.materialType === 'Custom').length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m => m.materialType === 'Custom').length} added
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedCategories.has('custom') ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedCategories.has('custom') && (
                      <div className="p-3 space-y-3 bg-white">
                        <button
                          onClick={addCustomMaterial}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <Plus className="w-5 h-5" />
                          Add Custom Material
                        </button>

                        {selectedRoom.materialsAffected
                          .filter(m => m.materialType === 'Custom')
                          .map((material) => (
                            <div key={material.id} className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Material Name</label>
                                  <input
                                    type="text"
                                    value={material.customMaterialName || ''}
                                    onChange={(e) => updateCustomMaterial(material.id!, { customMaterialName: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                    placeholder="e.g., Granite Countertop, Oak Beam, etc."
                                  />
                                </div>
                                <button
                                  onClick={() => deleteCustomMaterial(material.id!)}
                                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete custom material"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                      type="number"
                                      value={material.squareFootage}
                                      onChange={(e) => updateCustomMaterial(material.id!, { squareFootage: parseFloat(e.target.value) || 0 })}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                                    <select
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                    >
                                      <option value="sqft">Square Feet</option>
                                      <option value="linft">Linear Feet</option>
                                      <option value="each">Each</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Removal</label>
                                  <select
                                    value={material.removalReason || ''}
                                    onChange={(e) => updateCustomMaterial(material.id!, { removalReason: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  >
                                    <option value="">Select...</option>
                                    <option value="saturated">Saturated / Water-logged</option>
                                    <option value="contaminated">Contaminated (Cat 2/3)</option>
                                    <option value="visual-contamination">Visual Contamination</option>
                                    <option value="damaged">Structurally Damaged</option>
                                    <option value="access">Access Required</option>
                                    <option value="customer">Customer Request</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                  <textarea
                                    value={material.notes || ''}
                                    onChange={(e) => updateCustomMaterial(material.id!, { notes: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                    placeholder="Add details about this custom material..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                        {selectedRoom.materialsAffected.filter(m => m.materialType === 'Custom').length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No custom materials added yet. Click the button above to add one.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedRoom.materialsAffected.filter(m => m.removalRequired).length === 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center mt-2">
                      <Layers className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        No materials selected for removal yet. Expand categories above to select materials for demo.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ADD ROOM VIEW (Full Screen) */}
      {viewMode === 'add' && (
        <div className="min-h-screen bg-white flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-300 bg-gray-50 p-3">
            <button
              onClick={() => {
                setViewMode('list');
                setNewRoomForm({ name: '', type: 'Bedroom', floor: '1st Floor', length: '', width: '', height: '8' });
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-2"
            >
              <ChevronRight className="w-5 h-5 transform rotate-180" />
              <span>Back to Rooms</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Add New Room</h2>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
                  <input
                    type="text"
                    value={newRoomForm.name}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                    placeholder="e.g., Master Bedroom"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                  <select
                    value={newRoomForm.type}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, type: e.target.value as RoomType })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Floor Level</label>
                <select
                  value={newRoomForm.floor}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, floor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                >
                  <option>Basement</option>
                  <option>1st Floor</option>
                  <option>2nd Floor</option>
                  <option>3rd Floor</option>
                  <option>Attic</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Dimensions *</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (ft)</label>
                    <input
                      type="number"
                      value={newRoomForm.length}
                      onChange={(e) => setNewRoomForm({ ...newRoomForm, length: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                      step="0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (ft)</label>
                    <input
                      type="number"
                      value={newRoomForm.width}
                      onChange={(e) => setNewRoomForm({ ...newRoomForm, width: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                      step="0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (ft)</label>
                    <input
                      type="number"
                      value={newRoomForm.height}
                      onChange={(e) => setNewRoomForm({ ...newRoomForm, height: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                      step="0.5"
                      placeholder="8"
                    />
                  </div>
                </div>
              </div>

              {newRoomForm.length && newRoomForm.width && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Cubic Footage:</strong> {(parseFloat(newRoomForm.length) * parseFloat(newRoomForm.width) * parseFloat(newRoomForm.height || '8')).toFixed(0)} cf
                  </p>
                  <p className="text-sm text-blue-900 mt-1">
                    <strong>Square Footage:</strong> {(parseFloat(newRoomForm.length) * parseFloat(newRoomForm.width)).toFixed(0)} sq ft
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="border-t border-gray-300 bg-white p-3 sticky bottom-0">
            <div className="max-w-2xl mx-auto flex gap-2">
              <Button
                variant="primary"
                onClick={addRoom}
                disabled={!newRoomForm.name || !newRoomForm.length || !newRoomForm.width}
                className="flex-1"
              >
                <Plus className="w-5 h-5" />
                Add Room & Continue
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setViewMode('list');
                  setNewRoomForm({ name: '', type: 'Bedroom', floor: '1st Floor', length: '', width: '', height: '8' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-existing Damage Modal */}
      {showPreexistingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
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

            <div className="p-3 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
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
                {user && (
                  <UniversalPhotoCapture
                    jobId={job.jobId}
                    location={selectedRoom.id}
                    category="preexisting"
                    userId={user.uid}
                    onPhotosUploaded={(urls) => {
                      updateSelectedRoom({
                        preexistingDamagePhotos: [...selectedRoom.preexistingDamagePhotos, ...urls],
                      });
                    }}
                    uploadedCount={selectedRoom.preexistingDamagePhotos.length}
                    label="Photos of Pre-existing Damage"
                  />
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-2">
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
