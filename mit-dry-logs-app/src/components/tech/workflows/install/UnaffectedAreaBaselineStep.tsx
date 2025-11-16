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

  // Environmental readings - REQUIRED for baseline
  temperature?: number; // Room temperature in °F
  relativeHumidity?: number; // Room RH in %
  meterPhotos: string[]; // Photos of meter readings showing temp/RH

  // Affected areas for equipment calculations
  affectedFloorSqFt?: number;
  affectedWallsSqFt?: number;
  affectedCeilingSqFt?: number;
  damageClass?: 1 | 2 | 3 | 4;
  percentAffected?: number;

  // Pre-existing damage - OPTIONAL
  hasPreexistingDamage: boolean;
  preexistingDamageNotes?: string;
  preexistingDamagePhotos: string[];

  // Moisture readings - OPTIONAL
  moistureReadings: MoistureReading[];

  // Affected materials - kept for compatibility but not used
  materialsAffected: MaterialAffected[];

  // Photos - OPTIONAL
  overallPhotos: string[]; // OPTIONAL: Overall room photos
  thermalPhotos?: string[]; // OPTIONAL: Thermal imaging

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
  const [activeTab, setActiveTab] = useState<'info' | 'moisture'>('info');
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

      // SIMPLIFICATION MIGRATION: Ensure meterPhotos exists
      if (!updatedRoom.meterPhotos) {
        needsMigration = true;
        updatedRoom.meterPhotos = [];
      }

      // SIMPLIFICATION MIGRATION: Ensure environmental readings exist
      if (updatedRoom.temperature === undefined) {
        needsMigration = true;
        updatedRoom.temperature = undefined;
      }
      if (updatedRoom.relativeHumidity === undefined) {
        needsMigration = true;
        updatedRoom.relativeHumidity = undefined;
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
      temperature: undefined, // REQUIRED: To be filled in
      relativeHumidity: undefined, // REQUIRED: To be filled in
      meterPhotos: [], // REQUIRED: Meter reading photos
      hasPreexistingDamage: false,
      preexistingDamageNotes: '',
      preexistingDamagePhotos: [],
      moistureReadings: [],
      materialsAffected: getDefaultMaterials(), // Kept for compatibility but not used
      overallPhotos: [], // OPTIONAL: Overall room photos
      thermalPhotos: [], // OPTIONAL: Thermal imaging
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

  // NOTE: Material functions removed - Materials tab has been removed from baseline step

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

    // SIMPLIFIED VALIDATION: Check only required fields
    if (!selectedRoom.name) {
      alert('Please enter a room name before marking complete');
      return;
    }

    if (selectedRoom.length === 0 || selectedRoom.width === 0 || selectedRoom.height === 0) {
      alert('Please enter all room dimensions (length, width, height) before marking complete');
      return;
    }

    if (!selectedRoom.temperature) {
      alert('Please enter room temperature before marking complete');
      return;
    }

    if (!selectedRoom.relativeHumidity) {
      alert('Please enter room relative humidity before marking complete');
      return;
    }

    if (selectedRoom.meterPhotos.length < 1) {
      alert('Please capture at least 1 meter reading photo showing temperature and relative humidity');
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
    const roomMoistureTracking = moistureTracking.filter(t => t.roomId === selectedRoom.id);
    alert(`✅ ${selectedRoom.name} (baseline) marked complete!\n\nTemp: ${selectedRoom.temperature}°F, RH: ${selectedRoom.relativeHumidity}%\n${roomMoistureTracking.length} moisture reading(s) (optional)\n\nReturning to area list...`);

    returnToList();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ROOM LIST VIEW */}
      {viewMode === 'list' && (
        <div className="max-w-4xl mx-auto p-3">
          {/* Header - BLUE THEMED */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unaffected Area Baseline (Dry Standard)</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <div className="flex items-start gap-2">
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
            className="w-full mb-2"
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
                className="w-full text-left p-3 rounded-lg border-2 border-blue-300 bg-blue-50 hover:border-blue-500 transition-all"
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
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                <Home className="w-16 h-16 mx-auto mb-2 text-blue-300" />
                <p className="text-base">No unaffected areas added yet</p>
                <p className="text-sm mt-1">Click "Add Unaffected Area" to establish baseline readings</p>
              </div>
            )}
          </div>

          {/* Status Summary */}
          {rooms.length === 0 ? (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800 text-center">
                Add at least 1 unaffected area to continue
              </p>
            </div>
          ) : completedCount !== totalCount ? (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800 text-center">
                Complete all unaffected areas to continue ({completedCount}/{totalCount} complete)
              </p>
            </div>
          ) : (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 text-center font-medium">
                ✓ All unaffected areas complete - use Next button below to continue
              </p>
            </div>
          )}
        </div>
      )}

      {/* ROOM DETAIL VIEW */}
      {viewMode === 'detail' && selectedRoom && (
        <div className="min-h-screen bg-white flex flex-col">
          {/* Header - BLUE THEMED */}
          <div className="border-b border-blue-300 bg-blue-50 p-3">
            <div className="flex items-center justify-between mb-2">
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
                Moisture (Optional) ({moistureTracking.filter(t => t.roomId === selectedRoom.id).length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-3">
              {activeTab === 'info' && (
                <div className="max-w-2xl space-y-4">
                  {/* Baseline Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900 font-medium mb-1">
                          This is a baseline/dry standard area
                        </p>
                        <p className="text-sm text-blue-800">
                          Record environmental conditions (temp/RH) and dimensions from this unaffected room to establish normal levels per IICRC S500.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Room Dimensions - REQUIRED */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Dimensions *</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Length (ft) *</label>
                        <input
                          type="number"
                          value={selectedRoom.length}
                          onChange={(e) => updateSelectedRoom({ length: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width (ft) *</label>
                        <input
                          type="number"
                          value={selectedRoom.width}
                          onChange={(e) => updateSelectedRoom({ width: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (ft) *</label>
                        <input
                          type="number"
                          value={selectedRoom.height}
                          onChange={(e) => updateSelectedRoom({ height: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          step="0.5"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <p className="text-sm text-blue-900">
                        <strong>Cubic Footage:</strong> {(selectedRoom.length * selectedRoom.width * selectedRoom.height).toFixed(0)} cf
                      </p>
                      <p className="text-sm text-blue-900 mt-1">
                        <strong>Square Footage:</strong> {(selectedRoom.length * selectedRoom.width).toFixed(0)} sq ft
                      </p>
                    </div>
                  </div>

                  {/* Environmental Readings - REQUIRED */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2">Environmental Readings *</h4>
                    <p className="text-xs text-blue-700 mb-2">Record dry standard conditions for this unaffected area</p>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">Room Temperature (°F) *</label>
                        <input
                          type="number"
                          value={selectedRoom.temperature || ''}
                          onChange={(e) => updateSelectedRoom({ temperature: parseFloat(e.target.value) || undefined })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                          step="0.1"
                          placeholder="e.g., 72"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">Room Relative Humidity (%) *</label>
                        <input
                          type="number"
                          value={selectedRoom.relativeHumidity || ''}
                          onChange={(e) => updateSelectedRoom({ relativeHumidity: parseFloat(e.target.value) || undefined })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                          step="0.1"
                          placeholder="e.g., 45"
                        />
                      </div>
                    </div>

                    {/* Meter Reading Photo - REQUIRED */}
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">Meter Reading Photo *</label>
                      <p className="text-xs text-blue-700 mb-2">Capture meter display showing temperature and RH readings</p>
                      {user && (
                        <UniversalPhotoCapture
                          jobId={job.jobId}
                          location={selectedRoom.id}
                          category="assessment"
                          userId={user.uid}
                          onPhotosUploaded={(urls) => {
                            updateSelectedRoom({
                              meterPhotos: [...selectedRoom.meterPhotos, ...urls],
                            });
                          }}
                          uploadedCount={selectedRoom.meterPhotos.length}
                          label="Meter Reading Photo *"
                          minimumPhotos={1}
                        />
                      )}
                    </div>
                  </div>

                  {/* Overall Room Photos - OPTIONAL */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Notable Items Photos *</h3>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-800 font-medium mb-1">
                            Required: Take 2 photos of things that stand out in this room
                          </p>
                          <p className="text-xs text-blue-700">
                            Examples: Pre-existing damage, very dirty areas, scratched doors, cracked tiles, stains, marks
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            <strong>Purpose:</strong> Liability protection for adjacent rooms - documents condition before work begins
                          </p>
                        </div>
                      </div>
                    </div>

                    {user && (
                      <UniversalPhotoCapture
                        jobId={job.jobId}
                        location={selectedRoom.id}
                        category="assessment"
                        userId={user.uid}
                        onPhotosUploaded={(urls) => {
                          updateSelectedRoom({
                            overallPhotos: [...selectedRoom.overallPhotos, ...urls],
                          });
                        }}
                        uploadedCount={selectedRoom.overallPhotos.length}
                        label={`${selectedRoom.name} Notable Items`}
                        minimumPhotos={2}
                      />
                    )}
                  </div>

                  {/* Pre-existing Damage Section - REQUIRED */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-existing Damage *</h3>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-800 font-medium">
                            Required: Does this room have any pre-existing damage or notable conditions?
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            This protects against false claims after work is completed
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: selectedRoom.hasPreexistingDamage === true ? '#f97316' : '#d1d5db' }}>
                        <input
                          type="radio"
                          name={`preexisting-${selectedRoom.id}`}
                          checked={selectedRoom.hasPreexistingDamage === true}
                          onChange={() => updateSelectedRoom({ hasPreexistingDamage: true })}
                          className="h-5 w-5 text-orange-600"
                        />
                        <span className="text-base font-medium text-gray-900">
                          Yes - This room has pre-existing damage
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: selectedRoom.hasPreexistingDamage === false ? '#10b981' : '#d1d5db' }}>
                        <input
                          type="radio"
                          name={`preexisting-${selectedRoom.id}`}
                          checked={selectedRoom.hasPreexistingDamage === false}
                          onChange={() => updateSelectedRoom({ hasPreexistingDamage: false })}
                          className="h-5 w-5 text-green-600"
                        />
                        <span className="text-base font-medium text-gray-900">
                          No - This room is clean with no notable damage
                        </span>
                      </label>
                    </div>

                    {selectedRoom.hasPreexistingDamage === true && (
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

                    {selectedRoom.hasPreexistingDamage === false && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-900">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          ✓ Room documented as clean with no pre-existing damage
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'moisture' && (
                <div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Moisture Readings (Optional)
                        </p>
                        <p className="text-sm text-gray-600">
                          Optional: Record normal moisture levels in similar materials as affected areas.
                          These readings can establish your "dry standard" per IICRC S500, but are not required for completion.
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
            </div>
          </div>
        </div>
      )}

      {/* ADD ROOM VIEW */}
      {viewMode === 'add' && (
        <div className="min-h-screen bg-white flex flex-col">
          {/* Header */}
          <div className="border-b border-blue-300 bg-blue-50 p-3">
            <button
              onClick={() => {
                setViewMode('list');
                setNewRoomForm({ name: '', type: 'Bedroom', floor: '1st Floor', length: '', width: '', height: '8' });
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-2"
            >
              <ChevronRight className="w-5 h-5 transform rotate-180" />
              <span>Back to Unaffected Areas</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Add Unaffected Area (Baseline)</h2>
            <p className="text-sm text-gray-600 mt-1">Select a dry room far from damage to establish normal moisture levels</p>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-3 space-y-4">
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

              <div className="grid grid-cols-2 gap-2">
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

              <div className="grid grid-cols-3 gap-2">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">Document Pre-existing Damage</h3>
                <button
                  onClick={() => setShowPreexistingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-2">
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

              <div className="mt-2 flex justify-end">
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
