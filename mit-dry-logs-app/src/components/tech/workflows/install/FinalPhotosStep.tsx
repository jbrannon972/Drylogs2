import React, { useState, useEffect, useRef } from 'react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '../../../shared/Button';
import { UniversalPhotoCapture } from '../../../shared/UniversalPhotoCapture';
import { CheckCircle, ChevronRight, Camera, AlertTriangle, Info, ChevronDown } from 'lucide-react';

interface FinalPhotosStepProps {
  job: any;
  onNext: () => void;
}

interface RoomPhotos {
  roomId: string;
  roomName: string;
  photos: string[];
}

interface DehumidifierPerformance {
  equipmentId: string;
  serialNumber: string;
  model: string;
  inletTemp: number | null;
  inletRH: number | null;
  outletTemp: number | null;
  outletRH: number | null;
  isRunning: boolean;
  photoUrl?: string;
}

interface AirMoverPerformance {
  equipmentId: string;
  serialNumber: string;
  model: string;
  isRunning: boolean;
}

interface AirScrubberPerformance {
  equipmentId: string;
  serialNumber: string;
  model: string;
  isRunning: boolean;
}

interface RoomEquipmentPerformance {
  roomId: string;
  roomName: string;
  dehumidifiers: DehumidifierPerformance[];
  airMovers: AirMoverPerformance[];
  airScrubbers: AirScrubberPerformance[];
}

export const FinalPhotosStep: React.FC<FinalPhotosStepProps> = ({ job, onNext }) => {
  const { user } = useAuth();
  const { installData, updateWorkflowData, saveWorkflowData } = useWorkflowStore();

  // Get rooms and chambers from installData
  const rooms = installData.rooms || [];
  const chambers = installData.chambers || [];

  // Load existing room photos from workflow data
  const [roomPhotos, setRoomPhotos] = useState<RoomPhotos[]>(() => {
    const saved = installData.finalPhotosByRoom || [];
    // Ensure all rooms have an entry
    return rooms.map((room: any) => {
      const existing = saved.find((rp: RoomPhotos) => rp.roomId === room.id);
      return existing || {
        roomId: room.id,
        roomName: room.name,
        photos: [],
      };
    });
  });

  // Initialize equipment performance data from placedEquipment
  const initializeEquipmentPerformance = (): RoomEquipmentPerformance[] => {
    const saved = installData.equipmentPerformance || [];
    const placedEquipment = installData.placedEquipment || [];

    return rooms.map((room: any) => {
      const existing = saved.find((ep: RoomEquipmentPerformance) => ep.roomId === room.id);
      if (existing) return existing;

      // Get equipment placed in this specific room
      const roomEquipment = placedEquipment.filter((e: any) => e.assignedRoomId === room.id);

      // Create performance entries for dehumidifiers in this room
      const dehumidifiers: DehumidifierPerformance[] = roomEquipment
        .filter((e: any) => e.type === 'dehumidifier')
        .map((d: any) => ({
          equipmentId: d.id,
          serialNumber: d.serialNumber,
          model: d.model || 'Unknown',
          inletTemp: null,
          inletRH: null,
          outletTemp: null,
          outletRH: null,
          isRunning: false,
          photoUrl: undefined,
        }));

      // Create performance entries for air movers in this room
      const airMovers: AirMoverPerformance[] = roomEquipment
        .filter((e: any) => e.type === 'air-mover')
        .map((am: any) => ({
          equipmentId: am.id,
          serialNumber: am.serialNumber,
          model: am.model || 'Unknown',
          isRunning: false,
        }));

      // Create performance entries for air scrubbers in this room
      const airScrubbers: AirScrubberPerformance[] = roomEquipment
        .filter((e: any) => e.type === 'air-scrubber')
        .map((as: any) => ({
          equipmentId: as.id,
          serialNumber: as.serialNumber,
          model: as.model || 'Unknown',
          isRunning: false,
        }));

      return {
        roomId: room.id,
        roomName: room.name,
        dehumidifiers,
        airMovers,
        airScrubbers,
      };
    });
  };

  const [equipmentPerformance, setEquipmentPerformance] = useState<RoomEquipmentPerformance[]>(initializeEquipmentPerformance);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  // ULTRAFAULT: Ensure currentRoomIndex stays within bounds
  useEffect(() => {
    if (currentRoomIndex >= roomPhotos.length && roomPhotos.length > 0) {
      console.warn('⚠️ currentRoomIndex out of bounds, resetting to 0');
      setCurrentRoomIndex(0);
    }
  }, [currentRoomIndex, roomPhotos.length]);

  // ULTRAFAULT: Auto-save IMMEDIATELY to Firebase (no debounce)
  const prevDataRef = useRef({
    roomPhotos: JSON.stringify(installData.finalPhotosByRoom || []),
    equipmentPerformance: JSON.stringify(installData.equipmentPerformance || [])
  });

  useEffect(() => {
    const currentPhotosStr = JSON.stringify(roomPhotos);
    const currentEquipmentStr = JSON.stringify(equipmentPerformance);

    if (
      prevDataRef.current.roomPhotos !== currentPhotosStr ||
      prevDataRef.current.equipmentPerformance !== currentEquipmentStr
    ) {
      console.log('🔄 FinalPhotosStep: Data changed, saving IMMEDIATELY');

      // 1. Update Zustand store immediately (in-memory)
      updateWorkflowData('install', {
        finalPhotosByRoom: roomPhotos,
        equipmentPerformance: equipmentPerformance
      });

      // 2. ULTRAFAULT: SAVE IMMEDIATELY TO FIREBASE - NO DELAY
      saveWorkflowData().then(() => {
        console.log('✅ IMMEDIATE save to Firebase successful');
      }).catch((error) => {
        console.error('❌ IMMEDIATE save failed:', error);
      });

      // Update ref to prevent re-triggering
      prevDataRef.current = {
        roomPhotos: currentPhotosStr,
        equipmentPerformance: currentEquipmentStr
      };
    }
  }, [roomPhotos, equipmentPerformance, updateWorkflowData, saveWorkflowData]);

  // ULTRAFAULT: Force save on component unmount to catch any pending changes
  useEffect(() => {
    return () => {
      console.log('🚪 FinalPhotosStep: Component unmounting, forcing final save');
      saveWorkflowData().catch((error) => {
        console.error('❌ Unmount save failed:', error);
      });
    };
  }, [saveWorkflowData]);

  const handlePhotosUploaded = (urls: string[]) => {
    // ULTRAFAULT: Validate index before updating
    if (currentRoomIndex >= roomPhotos.length) {
      console.error('🔥 ULTRAFAULT: handlePhotosUploaded called with out-of-bounds index', currentRoomIndex);
      return;
    }

    const currentRoom = roomPhotos[currentRoomIndex];
    if (!currentRoom) {
      console.error('🔥 ULTRAFAULT: currentRoom is undefined in handlePhotosUploaded');
      return;
    }

    const updatedRoomPhotos = [...roomPhotos];
    updatedRoomPhotos[currentRoomIndex] = {
      ...currentRoom,
      photos: [...(currentRoom.photos || []), ...urls],
    };
    setRoomPhotos(updatedRoomPhotos);
  };

  const handleNextRoom = () => {
    if (currentRoomIndex < roomPhotos.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
    }
  };

  const handlePreviousRoom = () => {
    if (currentRoomIndex > 0) {
      setCurrentRoomIndex(currentRoomIndex - 1);
    }
  };

  const getTotalPhotos = () => {
    // ULTRAFAULT: Protect against undefined elements in roomPhotos array
    return roomPhotos.reduce((sum, rp) => {
      if (!rp || !rp.photos) return sum;
      return sum + rp.photos.length;
    }, 0);
  };

  const getCompletedRooms = () => {
    return roomPhotos.filter((rp, index) => {
      // ULTRAFAULT: Guard against undefined rp or rp.photos
      if (!rp || !rp.photos) return false;

      const hasPhotos = rp.photos.length >= 4;
      const roomEquipment = equipmentPerformance[index];

      // Safety check: ensure roomEquipment exists
      if (!roomEquipment) return false;

      const hasEquipmentData =
        roomEquipment.dehumidifiers.every(d => d.isRunning || (d.inletTemp !== null && d.inletRH !== null)) &&
        roomEquipment.airMovers.every(am => am.isRunning !== undefined) &&
        roomEquipment.airScrubbers.every(as => as.isRunning !== undefined);
      return hasPhotos && hasEquipmentData;
    }).length;
  };

  // Update dehumidifier performance
  const updateDehumidifierPerformance = (equipmentId: string, updates: Partial<DehumidifierPerformance>) => {
    // ULTRAFAULT: Validate index before updating
    if (currentRoomIndex >= equipmentPerformance.length) {
      console.error('🔥 ULTRAFAULT: updateDehumidifierPerformance called with out-of-bounds index', currentRoomIndex);
      return;
    }

    const updatedPerformance = [...equipmentPerformance];
    const currentRoomPerf = updatedPerformance[currentRoomIndex];

    if (!currentRoomPerf) {
      console.error('🔥 ULTRAFAULT: currentRoomPerf is undefined in updateDehumidifierPerformance');
      return;
    }

    currentRoomPerf.dehumidifiers = currentRoomPerf.dehumidifiers.map(d =>
      d.equipmentId === equipmentId ? { ...d, ...updates } : d
    );

    setEquipmentPerformance(updatedPerformance);
  };

  // Update air mover performance
  const updateAirMoverPerformance = (equipmentId: string, updates: Partial<AirMoverPerformance>) => {
    // ULTRAFAULT: Validate index before updating
    if (currentRoomIndex >= equipmentPerformance.length) {
      console.error('🔥 ULTRAFAULT: updateAirMoverPerformance called with out-of-bounds index', currentRoomIndex);
      return;
    }

    const updatedPerformance = [...equipmentPerformance];
    const currentRoomPerf = updatedPerformance[currentRoomIndex];

    if (!currentRoomPerf) {
      console.error('🔥 ULTRAFAULT: currentRoomPerf is undefined in updateAirMoverPerformance');
      return;
    }

    currentRoomPerf.airMovers = currentRoomPerf.airMovers.map(am =>
      am.equipmentId === equipmentId ? { ...am, ...updates } : am
    );

    setEquipmentPerformance(updatedPerformance);
  };

  // Update air scrubber performance
  const updateAirScrubberPerformance = (equipmentId: string, updates: Partial<AirScrubberPerformance>) => {
    // ULTRAFAULT: Validate index before updating
    if (currentRoomIndex >= equipmentPerformance.length) {
      console.error('🔥 ULTRAFAULT: updateAirScrubberPerformance called with out-of-bounds index', currentRoomIndex);
      return;
    }

    const updatedPerformance = [...equipmentPerformance];
    const currentRoomPerf = updatedPerformance[currentRoomIndex];

    if (!currentRoomPerf) {
      console.error('🔥 ULTRAFAULT: currentRoomPerf is undefined in updateAirScrubberPerformance');
      return;
    }

    currentRoomPerf.airScrubbers = currentRoomPerf.airScrubbers.map(as =>
      as.equipmentId === equipmentId ? { ...as, ...updates } : as
    );

    setEquipmentPerformance(updatedPerformance);
  };

  // Check if dehumidifier is not pulling moisture (validation)
  const isDehumidifierWarning = (dehum: DehumidifierPerformance): boolean => {
    if (dehum.inletRH === null || dehum.outletRH === null) return false;
    // Warn if outlet RH is within 5% of inlet RH (not removing moisture effectively)
    return Math.abs(dehum.inletRH - dehum.outletRH) < 5;
  };

  // Check if dehumidifier is complete
  const isDehumidifierComplete = (dehum: DehumidifierPerformance): boolean => {
    return (
      dehum.inletTemp !== null &&
      dehum.inletRH !== null &&
      dehum.outletTemp !== null &&
      dehum.outletRH !== null &&
      dehum.isRunning &&
      dehum.photoUrl !== undefined
    );
  };

  // Check if air mover is complete
  const isAirMoverComplete = (mover: AirMoverPerformance): boolean => {
    return mover.isRunning;
  };

  // Check if air scrubber is complete
  const isAirScrubberComplete = (scrubber: AirScrubberPerformance): boolean => {
    return scrubber.isRunning;
  };

  // ULTRAFAULT: Early return if no rooms
  if (rooms.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          ⚠️ No rooms found. Please complete the room assessment step first.
        </p>
      </div>
    );
  }

  // ULTRAFAULT: Validate currentRoomIndex is within bounds
  const currentRoom = roomPhotos[currentRoomIndex];
  const currentEquipment = equipmentPerformance[currentRoomIndex];

  // ULTRAFAULT: Guard against undefined currentRoom or currentEquipment
  if (!currentRoom || !currentEquipment) {
    console.error('🔥 ULTRAFAULT: currentRoom or currentEquipment is undefined!', {
      currentRoomIndex,
      roomPhotosLength: roomPhotos.length,
      equipmentPerformanceLength: equipmentPerformance.length,
      roomsLength: rooms.length
    });
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <p className="text-sm text-red-800">
          ⚠️ Data sync error. Please go back to a previous step and return.
        </p>
      </div>
    );
  }

  // ULTRAFAULT: Ensure currentRoom.photos exists, default to empty array
  const roomPhotosArray = currentRoom.photos || [];
  const hasPhotos = roomPhotosArray.length >= 4;

  // Safety check: ensure currentEquipment exists before accessing its properties
  const hasEquipmentData =
    (currentEquipment.dehumidifiers.length === 0 || currentEquipment.dehumidifiers.every(d => d.isRunning || (d.inletTemp !== null && d.inletRH !== null))) &&
    (currentEquipment.airMovers.length === 0 || currentEquipment.airMovers.every(am => am.isRunning)) &&
    (currentEquipment.airScrubbers.length === 0 || currentEquipment.airScrubbers.every(as => as.isRunning));

  const isCurrentRoomComplete = hasPhotos && hasEquipmentData;
  const allRoomsComplete = getCompletedRooms() === roomPhotos.length;

  return (
    <div className="space-y-4">
      {/* Instructions Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Final Photos & Equipment Performance</h4>
            <p className="text-sm text-blue-800">
              For each room, upload final photos (minimum 4) and record equipment performance readings.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Progress Stats */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Progress</p>
          <p className="text-lg font-bold text-gray-900">
            {getCompletedRooms()}/{roomPhotos.length} rooms
          </p>
        </div>
        <div className="flex-1 mx-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getCompletedRooms() / roomPhotos.length) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Photos</p>
          <p className="text-lg font-bold text-gray-900">{getTotalPhotos()}</p>
        </div>
      </div>


      {/* Current Room Detail View with Tabs */}
      <div className="bg-white border-2 border-orange-500 rounded-lg p-3 shadow-sm">
        {/* Current Room Header */}
        <div className="flex items-center justify-between mb-2 pb-3 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{currentRoom.roomName}</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Room {currentRoomIndex + 1} of {roomPhotos.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handlePreviousRoom}
              disabled={currentRoomIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5"
            >
              <ChevronRight className="w-4 h-4 transform rotate-180" />
              Prev
            </Button>
            <Button
              variant="secondary"
              onClick={handleNextRoom}
              disabled={currentRoomIndex === roomPhotos.length - 1}
              className="flex items-center gap-1 px-3 py-1.5"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Room Status Badge */}
        <div className={`p-3 rounded-lg border mb-2 ${
          isCurrentRoomComplete
            ? 'bg-green-50 border-green-300'
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-center gap-2">
            {isCurrentRoomComplete ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Room complete - {roomPhotosArray.length} photos & equipment readings captured ✓
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">
                  {!hasPhotos && `${roomPhotosArray.length}/4 photos needed`}
                  {!hasPhotos && !hasEquipmentData && ' • '}
                  {!hasEquipmentData && 'Equipment readings needed'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Single Scroll View - Equipment Readings First, Then Photos */}
        <div className="space-y-4">
          {/* Equipment Performance Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipment in this Room:</h3>
            <div className="space-y-3">
            {/* Equipment Performance */}
            {currentEquipment.dehumidifiers.length === 0 && currentEquipment.airMovers.length === 0 && currentEquipment.airScrubbers.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">No equipment assigned to this room</p>
              </div>
            ) : (
              <>
                {/* Dehumidifiers - Compact Inline Cards */}
                {currentEquipment.dehumidifiers.map((dehum, index) => {
                  const isComplete = isDehumidifierComplete(dehum);
                  const hasWarning = isDehumidifierWarning(dehum);

                  return (
                    <div
                      key={dehum.equipmentId}
                      className={`border-2 rounded-lg p-3 ${
                        isComplete
                          ? 'border-green-300 bg-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          Dehu {dehum.serialNumber}
                        </p>
                        {isComplete && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Warning Banner */}
                      {hasWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 flex items-start gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-900">
                            <strong>Warning:</strong> Inlet and outlet RH are similar. Unit may not be removing moisture effectively.
                          </p>
                        </div>
                      )}

                      {/* Running Checkbox */}
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={dehum.isRunning}
                          onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { isRunning: e.target.checked })}
                          className="h-4 w-4 text-orange-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Running</span>
                      </label>

                      {/* Inline Temp/RH Fields */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="number"
                          step="0.1"
                          value={dehum.inletTemp ?? ''}
                          onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { inletTemp: e.target.value ? parseFloat(e.target.value) : null })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          placeholder="Inlet Temp (°F)"
                        />
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={dehum.inletRH ?? ''}
                          onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { inletRH: e.target.value ? parseFloat(e.target.value) : null })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          placeholder="Inlet RH (%)"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={dehum.outletTemp ?? ''}
                          onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { outletTemp: e.target.value ? parseFloat(e.target.value) : null })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          placeholder="Outlet Temp (°F)"
                        />
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={dehum.outletRH ?? ''}
                          onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { outletRH: e.target.value ? parseFloat(e.target.value) : null })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          placeholder="Outlet RH (%)"
                        />
                      </div>

                      {/* Photo Upload */}
                      {dehum.photoUrl ? (
                        <div className="relative">
                          <img
                            src={dehum.photoUrl}
                            alt="Dehumidifier readings"
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            onClick={() => updateDehumidifierPerformance(dehum.equipmentId, { photoUrl: undefined })}
                            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={async () => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.capture = 'environment';
                            input.onchange = async (e: any) => {
                              const file = e.target?.files?.[0];
                              if (file && user) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const photoUrl = event.target?.result as string;
                                  updateDehumidifierPerformance(dehum.equipmentId, { photoUrl });
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                          className="w-full text-sm flex items-center justify-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Take Photo
                        </Button>
                      )}
                    </div>
                  );
                })}

                {/* Air Movers - Compact Inline Cards */}
                {currentEquipment.airMovers.map((mover, index) => {
                  const isComplete = isAirMoverComplete(mover);

                  return (
                    <div
                      key={mover.equipmentId}
                      className={`border-2 rounded-lg p-3 ${
                        isComplete
                          ? 'border-green-300 bg-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          Mover {mover.serialNumber}
                        </p>
                        {isComplete && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Running Checkbox */}
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={mover.isRunning}
                          onChange={(e) => updateAirMoverPerformance(mover.equipmentId, { isRunning: e.target.checked })}
                          className="h-4 w-4 text-orange-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Running</span>
                      </label>
                    </div>
                  );
                })}

                {/* Air Scrubbers - Compact Inline Cards */}
                {currentEquipment.airScrubbers.map((scrubber, index) => {
                  const isComplete = isAirScrubberComplete(scrubber);

                  return (
                    <div
                      key={scrubber.equipmentId}
                      className={`border-2 rounded-lg p-3 ${
                        isComplete
                          ? 'border-green-300 bg-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          Scrubber {scrubber.serialNumber}
                        </p>
                        {isComplete && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Running Checkbox */}
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={scrubber.isRunning}
                          onChange={(e) => updateAirScrubberPerformance(scrubber.equipmentId, { isRunning: e.target.checked })}
                          className="h-4 w-4 text-orange-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Running</span>
                      </label>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          </div>

          {/* Final Photos Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Final Photos</h3>
            <p className="text-sm text-gray-600 mb-2">
              Take at least 4 photos showing the equipment setup and room condition
            </p>

            {/* Photo Capture */}
            <UniversalPhotoCapture
              jobId={job.jobId}
              location={currentRoom.roomName}
              category="final"
              userId={user?.uid || ''}
              onPhotosUploaded={handlePhotosUploaded}
              uploadedCount={roomPhotosArray.length}
              label={`${currentRoom.roomName} Final Photos`}
              minimumPhotos={4}
            />

            {/* Photo Preview Grid */}
            {roomPhotosArray.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Captured Photos ({roomPhotosArray.length})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {roomPhotosArray.map((photoUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photoUrl}
                        alt={`Final photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100">
                          Photo {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Status */}
      {!allRoomsComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Please complete all rooms before proceeding
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {getCompletedRooms()} of {roomPhotos.length} rooms complete. Each room needs:
              </p>
              <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                <li>Minimum 4 final photos</li>
                <li>Equipment performance readings (if equipment assigned)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {allRoomsComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              All {roomPhotos.length} rooms documented! {getTotalPhotos()} total photos captured and equipment performance recorded.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
