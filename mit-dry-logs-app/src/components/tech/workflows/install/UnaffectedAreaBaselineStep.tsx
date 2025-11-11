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

interface UnaffectedAreaBaselineStepProps {
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
  isBaseline: boolean; // NEW: Mark as baseline/dry standard room

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

export const UnaffectedAreaBaselineStep: React.FC<UnaffectedAreaBaselineStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData, saveWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  // Initialize from environmentalBaseline.unaffectedAreas
  const [rooms, setRooms] = useState<RoomData[]>(
    installData.environmentalBaseline?.unaffectedAreas || []
  );
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

      // Ensure isBaseline is set
      if (!updatedRoom.isBaseline) {
        needsMigration = true;
        updatedRoom.isBaseline = true;
      }

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
        console.log('🔄 Migrating baseline room photo structure: overviewPhoto → overallPhotos');
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
      console.log('🔄 Migrating unaffected area baseline rooms to new structure');
      setRooms(migratedRooms);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ULTRAFAULT FIX: Save IMMEDIATELY to Firebase - NO DEBOUNCE
  // The 2-second debounce was causing data loss when user navigated away quickly
  const prevDataRef = useRef({
    rooms: JSON.stringify(installData.environmentalBaseline?.unaffectedAreas || []),
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
      console.log('🔄 UnaffectedAreaBaselineStep: Data changed, saving IMMEDIATELY');

      // 1. Update Zustand store immediately (in-memory)
      updateWorkflowData('install', {
        environmentalBaseline: {
          ...installData.environmentalBaseline,
          unaffectedAreas: rooms
        },
        moistureTracking: moistureTracking
      });

      // 2. ULTRAFAULT: SAVE IMMEDIATELY TO FIREBASE - NO DELAY
      saveWorkflowData().then(() => {
        console.log('✅ IMMEDIATE save to Firebase successful (unaffected areas)');
      }).catch((error) => {
        console.error('❌ IMMEDIATE save failed:', error);
      });

      // Update ref to prevent re-triggering
      prevDataRef.current = {
        rooms: currentRoomsStr,
        moistureTracking: currentMoistureStr
      };
    }
  }, [rooms, moistureTracking, updateWorkflowData, saveWorkflowData, installData.environmentalBaseline]);

  // ULTRAFAULT: Force save on component unmount to catch any pending changes
  useEffect(() => {
    return () => {
      console.log('🚪 UnaffectedAreaBaselineStep: Component unmounting, forcing final save');
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
      id: `baseline-room-${Date.now()}`,
      name: newRoomForm.name,
      type: newRoomForm.type,
      floor: newRoomForm.floor,
      length: parseFloat(newRoomForm.length),
      width: parseFloat(newRoomForm.width),
      height: parseFloat(newRoomForm.height),
      insetsCubicFt: 0,
      offsetsCubicFt: 0,
      isBaseline: true, // NEW: Mark as baseline room
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
    if (confirm('Delete this unaffected area? All baseline data will be lost.')) {
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
      alert(`Please complete baseline assessment for ${incompleteRooms.length} unaffected area(s)`);
      return;
    }

    // MINIMUM 1 ROOM REQUIRED (not 0 like RoomAssessmentStep)
    if (rooms.length === 0) {
      alert('Please add at least one unaffected area for baseline readings');
      return;
    }

    // ULTRAFAULT FIX: Save to Firebase before continuing
    try {
      await saveWorkflowData();
      console.log('✅ All unaffected area baseline data saved to Firebase before continuing');
      onNext();
    } catch (error) {
      console.error('❌ Failed to save unaffected area baseline data:', error);
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

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
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

    // PHASE 1 VALIDATION: Check overall photos (minimum 2 required for baseline)
    if (selectedRoom.overallPhotos.length < 2) {
      alert(`Please capture at least 2 overall room photos. You currently have ${selectedRoom.overallPhotos.length} photo(s).`);
      return;
    }

    // PHASE 1 VALIDATION: Check moisture photos (minimum 1 material tracked)
    const roomMoistureTracking = moistureTracking.filter(t => t.roomId === selectedRoom.id);

    if (roomMoistureTracking.length < 1) {
      alert(`Please add at least 1 baseline moisture reading for this unaffected area. Click the Moisture tab to add moisture readings with photos.`);
      return;
    }

    updateSelectedRoom({ isComplete: true });

    // ULTRAFAULT FIX: Save to Firebase immediately
    saveWorkflowData().then(() => {
      console.log('✅ Baseline room data saved to Firebase');
    }).catch((error) => {
      console.error('❌ Failed to save baseline room data:', error);
    });

    // Success feedback
    alert(`✅ ${selectedRoom.name} (baseline) marked complete!\n\n${roomMoistureTracking.length} baseline moisture reading(s) captured\n\nReturning to area list...`);

    returnToList();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ROOM LIST VIEW */}
      {viewMode === 'list' && (
        <div className="max-w-4xl mx-auto p-6">
          {/* Header - BLUE THEMED */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unaffected Area Baseline (Dry Standard)</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    <strong>IICRC S500 Requirement:</strong> Record baseline readings from dry areas for comparison
                  </p>
                  <p className="text-sm text-blue-800">
                    Select 1-2 unaffected rooms far from damage to establish normal moisture levels.
                    These readings serve as your "dry standard" for comparison during monitoring.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>{completedCount}/{totalCount}</strong> unaffected areas completed
              </p>
            </div>
          </div>

          {/* Add Room Button */}
          <Button
            variant="primary"
            onClick={() => setViewMode('add')}
            className="w-full mb-4"
          >
            <Plus className="w-5 h-5" />
            Add Unaffected Area
          </Button>

          {/* Room List */}
          <div className="space-y-3">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => openRoomDetail(room.id)}
                className="w-full text-left p-4 rounded-lg border-2 border-blue-300 bg-blue-50 hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-gray-900">{room.name}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        Baseline
                      </span>
                      {room.isComplete && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{room.floor}</p>
                    <p className="text-sm text-gray-700">
                      {room.length > 0 ? `${room.length}' × ${room.width}' × ${room.height}'` : 'No dimensions yet'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {moistureTracking.filter(t => t.roomId === room.id).length} baseline material(s) tracked
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ChevronRight className="w-6 h-6 text-gray-400" />
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
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                <Home className="w-16 h-16 mx-auto mb-3 text-blue-300" />
                <p className="text-base">No unaffected areas added yet</p>
                <p className="text-sm mt-1">Click "Add Unaffected Area" to establish baseline readings</p>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={handleNext}
              className="w-full"
              disabled={rooms.length === 0 || completedCount !== totalCount}
            >
              Continue to Next Step
              <ChevronRight className="w-5 h-5" />
            </Button>
            {rooms.length === 0 && (
              <p className="text-sm text-orange-600 mt-2 text-center">
                Add at least 1 unaffected area to continue
              </p>
            )}
            {rooms.length > 0 && completedCount !== totalCount && (
              <p className="text-sm text-orange-600 mt-2 text-center">
                Complete all unaffected areas to continue
              </p>
            )}
          </div>
        </div>
      )}

      {/* ROOM DETAIL VIEW */}
      {viewMode === 'detail' && selectedRoom && (
        <div className="min-h-screen bg-white flex flex-col">
          {/* Header - BLUE THEMED */}
          <div className="border-b border-blue-300 bg-blue-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={returnToList}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <ChevronRight className="w-5 h-5 transform rotate-180" />
                <span>Back to Unaffected Areas</span>
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
                    Return to Area List
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
                <p className="text-sm text-gray-600">{selectedRoom.floor} • {selectedRoom.type} • Baseline Area</p>
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
                    ? 'border-blue-500 text-blue-600'
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
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Droplets className="w-4 h-4 inline mr-2" />
                Baseline Moisture ({moistureTracking.filter(t => t.roomId === selectedRoom.id).length})
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'materials'
                    ? 'border-blue-500 text-blue-600'
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
            <div className="max-w-4xl mx-auto p-6">
              {activeTab === 'info' && (
                <div className="max-w-2xl space-y-6">
                  {/* Baseline Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900 font-medium mb-1">
                          This is a baseline/dry standard area
                        </p>
                        <p className="text-sm text-blue-800">
                          Record dimensions and moisture readings from this unaffected room to establish normal levels.
                          Do NOT mark materials for removal in baseline areas.
                        </p>
                      </div>
                    </div>
                  </div>

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

                  {/* PHASE 1: Overall Room Photos - REQUIRED (2+ minimum for baseline) */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Room Photos</h3>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-900 font-medium mb-1">
                            <strong>REQUIRED:</strong> Minimum 2 photos for baseline area
                          </p>
                          <p className="text-sm text-blue-800">
                            • Wide shot showing the dry, unaffected condition<br />
                            • Additional angle showing typical materials/surfaces
                          </p>
                        </div>
                      </div>
                    </div>

                    {user && (
                      <UniversalPhotoCapture
                        jobId={job.jobId}
                        location={selectedRoom.id}
                        category="baseline-overall"
                        userId={user.uid}
                        onPhotosUploaded={(urls) => {
                          updateSelectedRoom({
                            overallPhotos: [...selectedRoom.overallPhotos, ...urls],
                          });
                        }}
                        uploadedCount={selectedRoom.overallPhotos.length}
                        label={`${selectedRoom.name} Baseline Photos *`}
                        minimumPhotos={2}
                      />
                    )}
                  </div>

                  {/* Pre-existing Damage Section (typically not applicable for baseline) */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-existing Damage</h3>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-700">
                            Document any pre-existing damage in this baseline area.
                            Note: Baseline areas should ideally be completely unaffected and dry.
                          </p>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={selectedRoom.hasPreexistingDamage}
                        onChange={(e) => updateSelectedRoom({ hasPreexistingDamage: e.target.checked })}
                        className="h-5 w-5 text-blue-600 rounded"
                      />
                      <span className="text-base font-medium text-gray-900">
                        This area has pre-existing damage
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
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900 font-medium mb-1">
                          Baseline Moisture Readings
                        </p>
                        <p className="text-sm text-blue-800">
                          Record normal moisture levels in similar materials as affected areas.
                          These readings establish your "dry standard" per IICRC S500.
                        </p>
                      </div>
                    </div>
                  </div>
                  <MoistureTabContent
                    job={job}
                    roomId={selectedRoom.id}
                    roomName={selectedRoom.name}
                    moistureTracking={moistureTracking}
                    onUpdate={setMoistureTracking}
                  />
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="max-w-4xl space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900 font-medium mb-1">
                          Baseline Materials Reference
                        </p>
                        <p className="text-sm text-blue-800">
                          Use this to document what materials exist in this unaffected area.
                          DO NOT mark materials for removal in baseline areas - this is for reference only.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Materials Present</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Document materials present in this baseline area. This helps ensure you're comparing similar materials.
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
                          ['Carpet & Pad', 'Hardwood Flooring', 'Vinyl/Linoleum Flooring', 'Tile Flooring', 'Laminate Flooring', 'Engineered Flooring', 'Subfloor'].includes(m.materialType) && m.isAffected
                        ).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m =>
                              ['Carpet & Pad', 'Hardwood Flooring', 'Vinyl/Linoleum Flooring', 'Tile Flooring', 'Laminate Flooring', 'Engineered Flooring', 'Subfloor'].includes(m.materialType) && m.isAffected
                            ).length} present
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedCategories.has('flooring') ? 'transform rotate-90' : ''
                      }`} />
                    </button>
                    {expandedCategories.has('flooring') && (
                      <div className="p-4 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => ['Carpet & Pad', 'Hardwood Flooring', 'Vinyl/Linoleum Flooring', 'Tile Flooring', 'Laminate Flooring', 'Engineered Flooring', 'Subfloor'].includes(m.materialType))
                          .map((material) => (
                            <div key={material.materialType} className="border border-gray-200 rounded-lg p-3">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={material.isAffected}
                                  onChange={(e) => updateMaterial(material.materialType, { isAffected: e.target.checked })}
                                  className="h-5 w-5 text-blue-600 rounded"
                                />
                                <span className="font-medium text-gray-900">{material.materialType}</span>
                              </label>
                              {material.isAffected && (
                                <div className="ml-8 mt-2">
                                  <p className="text-xs text-blue-600 mb-1">Material present in this baseline area</p>
                                </div>
                              )}
                            </div>
                          ))}
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
                          ['Drywall - Wall', 'Drywall - Ceiling'].includes(m.materialType) && m.isAffected
                        ).length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {selectedRoom.materialsAffected.filter(m =>
                              ['Drywall - Wall', 'Drywall - Ceiling'].includes(m.materialType) && m.isAffected
                            ).length} present
                          </span>
                        )}
                      </span>
                      <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedCategories.has('drywall') ? 'transform rotate-90' : ''
                      }`} />
                    </button>
                    {expandedCategories.has('drywall') && (
                      <div className="p-4 space-y-3 bg-white">
                        {selectedRoom.materialsAffected
                          .filter(m => ['Drywall - Wall', 'Drywall - Ceiling'].includes(m.materialType))
                          .map((material) => (
                            <div key={material.materialType} className="border border-gray-200 rounded-lg p-3">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={material.isAffected}
                                  onChange={(e) => updateMaterial(material.materialType, { isAffected: e.target.checked })}
                                  className="h-5 w-5 text-blue-600 rounded"
                                />
                                <span className="font-medium text-gray-900">{material.materialType}</span>
                              </label>
                              {material.isAffected && (
                                <div className="ml-8 mt-2">
                                  <p className="text-xs text-blue-600 mb-1">Material present in this baseline area</p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Note: Other categories can be added similarly */}
                  <p className="text-sm text-gray-500 italic mt-4">
                    Additional material categories available. Expand categories above to mark materials present.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD ROOM VIEW */}
      {viewMode === 'add' && (
        <div className="min-h-screen bg-white flex flex-col">
          {/* Header */}
          <div className="border-b border-blue-300 bg-blue-50 p-4">
            <button
              onClick={() => {
                setViewMode('list');
                setNewRoomForm({ name: '', type: 'Bedroom', floor: '1st Floor', length: '', width: '', height: '8' });
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
            >
              <ChevronRight className="w-5 h-5 transform rotate-180" />
              <span>Back to Unaffected Areas</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Add Unaffected Area (Baseline)</h2>
            <p className="text-sm text-gray-600 mt-1">Select a dry room far from damage to establish normal moisture levels</p>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
                <input
                  type="text"
                  value={newRoomForm.name}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Master Bedroom (Upstairs - Dry)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    value={newRoomForm.type}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, type: e.target.value as RoomType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Bedroom">Bedroom</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Bathroom">Bathroom</option>
                    <option value="Dining Room">Dining Room</option>
                    <option value="Hallway">Hallway</option>
                    <option value="Basement">Basement</option>
                    <option value="Garage">Garage</option>
                    <option value="Laundry Room">Laundry Room</option>
                    <option value="Office">Office</option>
                    <option value="Closet">Closet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor Level</label>
                  <select
                    value={newRoomForm.floor}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Basement">Basement</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="Attic">Attic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Length (ft) *</label>
                  <input
                    type="number"
                    value={newRoomForm.length}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, length: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    step="0.5"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width (ft) *</label>
                  <input
                    type="number"
                    value={newRoomForm.width}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, width: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    step="0.5"
                    placeholder="10"
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
                    placeholder="8"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={addRoom}
                className="w-full"
              >
                <Plus className="w-5 h-5" />
                Add Unaffected Area
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-existing Damage Modal (reuse PhotoCapture modal pattern) */}
      {showPreexistingModal && selectedRoom && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Document Pre-existing Damage</h3>
                <button
                  onClick={() => setShowPreexistingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={selectedRoom.preexistingDamageNotes || ''}
                  onChange={(e) => updateSelectedRoom({ preexistingDamageNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Describe the pre-existing damage..."
                />
              </div>

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
                label="Pre-existing Damage Photos"
              />

              <div className="mt-4 flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => setShowPreexistingModal(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
