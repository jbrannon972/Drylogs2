import React, { useState, useEffect, useRef } from 'react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '../../../shared/Button';
import { UniversalPhotoCapture } from '../../../shared/UniversalPhotoCapture';
import { CheckCircle, ChevronRight, Camera, AlertTriangle, Info } from 'lucide-react';

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
  amperage: number | null;
  photoUrl?: string;
}

interface AirMoverPerformance {
  equipmentId: string;
  serialNumber: string;
  model: string;
  isRunning: boolean;
  amperage: number | null;
}

interface RoomEquipmentPerformance {
  roomId: string;
  roomName: string;
  dehumidifiers: DehumidifierPerformance[];
  airMovers: AirMoverPerformance[];
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

  // Initialize equipment performance data from chambers
  const initializeEquipmentPerformance = (): RoomEquipmentPerformance[] => {
    const saved = installData.equipmentPerformance || [];
    return rooms.map((room: any) => {
      const existing = saved.find((ep: RoomEquipmentPerformance) => ep.roomId === room.id);
      if (existing) return existing;

      // Find chamber containing this room
      const chamber = chambers.find((c: any) => c.assignedRooms.includes(room.id));

      // Create performance entries for all equipment in this room's chamber
      const dehumidifiers: DehumidifierPerformance[] = chamber?.dehumidifiers?.map((d: any) => ({
        equipmentId: d.equipmentId,
        serialNumber: d.serialNumber,
        model: d.model,
        inletTemp: null,
        inletRH: null,
        outletTemp: null,
        outletRH: null,
        isRunning: false,
        amperage: null,
        photoUrl: undefined,
      })) || [];

      const airMovers: AirMoverPerformance[] = chamber?.airMovers?.map((am: any) => ({
        equipmentId: am.equipmentId,
        serialNumber: am.serialNumber,
        model: am.model,
        isRunning: false,
        amperage: null,
      })) || [];

      return {
        roomId: room.id,
        roomName: room.name,
        dehumidifiers,
        airMovers,
      };
    });
  };

  const [equipmentPerformance, setEquipmentPerformance] = useState<RoomEquipmentPerformance[]>(initializeEquipmentPerformance);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'photos' | 'equipment'>('photos');

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
    const currentRoom = roomPhotos[currentRoomIndex];
    const updatedRoomPhotos = [...roomPhotos];
    updatedRoomPhotos[currentRoomIndex] = {
      ...currentRoom,
      photos: [...currentRoom.photos, ...urls],
    };
    setRoomPhotos(updatedRoomPhotos);
  };

  const handleNextRoom = () => {
    if (currentRoomIndex < roomPhotos.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
      setActiveTab('photos'); // Reset to photos tab when switching rooms
    }
  };

  const handlePreviousRoom = () => {
    if (currentRoomIndex > 0) {
      setCurrentRoomIndex(currentRoomIndex - 1);
      setActiveTab('photos'); // Reset to photos tab when switching rooms
    }
  };

  const getTotalPhotos = () => {
    return roomPhotos.reduce((sum, rp) => sum + rp.photos.length, 0);
  };

  const getCompletedRooms = () => {
    return roomPhotos.filter((rp, index) => {
      const hasPhotos = rp.photos.length >= 4;
      const roomEquipment = equipmentPerformance[index];
      const hasEquipmentData =
        roomEquipment.dehumidifiers.every(d => d.isRunning || (d.inletTemp !== null && d.inletRH !== null)) &&
        roomEquipment.airMovers.every(am => am.isRunning !== undefined);
      return hasPhotos && hasEquipmentData;
    }).length;
  };

  // Update dehumidifier performance
  const updateDehumidifierPerformance = (equipmentId: string, updates: Partial<DehumidifierPerformance>) => {
    const updatedPerformance = [...equipmentPerformance];
    const currentRoomPerf = updatedPerformance[currentRoomIndex];

    currentRoomPerf.dehumidifiers = currentRoomPerf.dehumidifiers.map(d =>
      d.equipmentId === equipmentId ? { ...d, ...updates } : d
    );

    setEquipmentPerformance(updatedPerformance);
  };

  // Update air mover performance
  const updateAirMoverPerformance = (equipmentId: string, updates: Partial<AirMoverPerformance>) => {
    const updatedPerformance = [...equipmentPerformance];
    const currentRoomPerf = updatedPerformance[currentRoomIndex];

    currentRoomPerf.airMovers = currentRoomPerf.airMovers.map(am =>
      am.equipmentId === equipmentId ? { ...am, ...updates } : am
    );

    setEquipmentPerformance(updatedPerformance);
  };

  // Check if dehumidifier is not pulling moisture (validation)
  const isDehumidifierWarning = (dehum: DehumidifierPerformance): boolean => {
    if (dehum.inletRH === null || dehum.outletRH === null) return false;
    // Warn if outlet RH is within 5% of inlet RH (not removing moisture effectively)
    return Math.abs(dehum.inletRH - dehum.outletRH) < 5;
  };

  if (rooms.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ No rooms found. Please complete the room assessment step first.
        </p>
      </div>
    );
  }

  const currentRoom = roomPhotos[currentRoomIndex];
  const currentEquipment = equipmentPerformance[currentRoomIndex];
  const hasPhotos = currentRoom && currentRoom.photos.length >= 4;
  const hasEquipmentData =
    currentEquipment.dehumidifiers.length === 0 ||
    currentEquipment.dehumidifiers.every(d => d.isRunning || (d.inletTemp !== null && d.inletRH !== null));
  const isCurrentRoomComplete = hasPhotos && hasEquipmentData;
  const allRoomsComplete = getCompletedRooms() === roomPhotos.length;

  return (
    <div className="space-y-4">
      {/* Instructions Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
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

      {/* Room List Overview - AT TOP */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">All Rooms</h4>
        <div className="space-y-2">
          {roomPhotos.map((rp, index) => {
            const roomEquipment = equipmentPerformance[index];
            const roomHasPhotos = rp.photos.length >= 4;
            const roomHasEquipmentData =
              roomEquipment.dehumidifiers.length === 0 ||
              roomEquipment.dehumidifiers.every(d => d.isRunning || (d.inletTemp !== null && d.inletRH !== null));
            const roomComplete = roomHasPhotos && roomHasEquipmentData;

            return (
              <div
                key={rp.roomId}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  index === currentRoomIndex
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : roomComplete
                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setCurrentRoomIndex(index);
                  setActiveTab('photos');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    roomComplete
                      ? 'bg-green-500 text-white'
                      : index === currentRoomIndex
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {roomComplete ? '✓' : index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{rp.roomName}</p>
                    <p className="text-xs text-gray-600">
                      {roomComplete ? (
                        <span className="text-green-700 font-medium">Complete ✓</span>
                      ) : (
                        <span>
                          {rp.photos.length}/4 photos
                          {roomEquipment.dehumidifiers.length > 0 && !roomHasEquipmentData && ', equipment pending'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {index === currentRoomIndex && (
                  <span className="text-xs font-bold text-orange-600 px-2 py-1 bg-orange-100 rounded">
                    CURRENT
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Room Detail View with Tabs */}
      <div className="bg-white border-2 border-orange-500 rounded-lg p-4 shadow-sm">
        {/* Current Room Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
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
        <div className={`p-3 rounded-lg border mb-4 ${
          isCurrentRoomComplete
            ? 'bg-green-50 border-green-300'
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-center gap-2">
            {isCurrentRoomComplete ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Room complete - {currentRoom.photos.length} photos & equipment readings captured ✓
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">
                  {!hasPhotos && `${currentRoom.photos.length}/4 photos needed`}
                  {!hasPhotos && !hasEquipmentData && ' • '}
                  {!hasEquipmentData && 'Equipment readings needed'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'photos'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              <span>Photos ({currentRoom.photos.length}/4)</span>
              {hasPhotos && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'equipment'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Equipment ({currentEquipment.dehumidifiers.length + currentEquipment.airMovers.length})</span>
              {hasEquipmentData && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'photos' && (
          <div>
            {/* Photo Upload */}
            {user && (
              <div className="mb-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-orange-900">
                    <strong>Capture equipment in place:</strong> Show dehumidifiers, air movers, air scrubbers, and overall room setup (minimum 4 photos)
                  </p>
                </div>
                <UniversalPhotoCapture
                  jobId={job.jobId}
                  location={currentRoom.roomName}
                  category="final"
                  userId={user.uid}
                  onPhotosUploaded={handlePhotosUploaded}
                  uploadedCount={currentRoom.photos.length}
                  label={`${currentRoom.roomName} Final Photos *`}
                  minimumPhotos={4}
                />
              </div>
            )}

            {/* Preview captured photos */}
            {currentRoom.photos.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Captured Photos ({currentRoom.photos.length})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {currentRoom.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`${currentRoom.roomName} photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                      />
                      <div className="absolute top-1 right-1 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-4">
            {/* Equipment Performance */}
            {currentEquipment.dehumidifiers.length === 0 && currentEquipment.airMovers.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">No equipment assigned to this room</p>
              </div>
            ) : (
              <>
                {/* Dehumidifiers */}
                {currentEquipment.dehumidifiers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Dehumidifiers</h4>
                    <div className="space-y-4">
                      {currentEquipment.dehumidifiers.map((dehum) => (
                        <div key={dehum.equipmentId} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-900">{dehum.model}</p>
                              <p className="text-xs text-gray-600">S/N: {dehum.serialNumber}</p>
                            </div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={dehum.isRunning}
                                onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { isRunning: e.target.checked })}
                                className="h-4 w-4 text-orange-600 rounded"
                              />
                              <span className="text-sm font-medium text-gray-700">Running</span>
                            </label>
                          </div>

                          {isDehumidifierWarning(dehum) && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 mb-3 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-yellow-900">
                                <strong>Warning:</strong> Inlet and outlet RH are similar. Unit may not be removing moisture effectively.
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Inlet Temp (°F)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={dehum.inletTemp ?? ''}
                                onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { inletTemp: e.target.value ? parseFloat(e.target.value) : null })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                placeholder="72.5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Inlet RH (%)</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={dehum.inletRH ?? ''}
                                onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { inletRH: e.target.value ? parseFloat(e.target.value) : null })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                placeholder="65.0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Outlet Temp (°F)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={dehum.outletTemp ?? ''}
                                onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { outletTemp: e.target.value ? parseFloat(e.target.value) : null })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                placeholder="85.0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Outlet RH (%)</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={dehum.outletRH ?? ''}
                                onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { outletRH: e.target.value ? parseFloat(e.target.value) : null })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                placeholder="45.0"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Amperage Draw</label>
                              <input
                                type="number"
                                step="0.1"
                                value={dehum.amperage ?? ''}
                                onChange={(e) => updateDehumidifierPerformance(dehum.equipmentId, { amperage: e.target.value ? parseFloat(e.target.value) : null })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                placeholder="12.5"
                              />
                            </div>
                          </div>

                          {/* Dehumidifier Photo */}
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Photo of Readings (Optional)</label>
                            {dehum.photoUrl ? (
                              <div className="relative">
                                <img
                                  src={dehum.photoUrl}
                                  alt="Dehumidifier readings"
                                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                />
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
                                      // For simplicity, we'll use a simple file reader to convert to base64
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
                                className="w-full text-sm"
                              >
                                <Camera className="w-4 h-4" />
                                Take Photo of Readings
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Air Movers */}
                {currentEquipment.airMovers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Air Movers</h4>
                    <div className="space-y-3">
                      {currentEquipment.airMovers.map((mover) => (
                        <div key={mover.equipmentId} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{mover.model}</p>
                              <p className="text-xs text-gray-600">S/N: {mover.serialNumber}</p>
                            </div>
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
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Amperage Draw</label>
                            <input
                              type="number"
                              step="0.1"
                              value={mover.amperage ?? ''}
                              onChange={(e) => updateAirMoverPerformance(mover.equipmentId, { amperage: e.target.value ? parseFloat(e.target.value) : null })}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="2.5"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Completion Status */}
      {!allRoomsComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
