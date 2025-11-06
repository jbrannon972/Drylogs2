import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Layers, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { FloorMaterialType, WallMaterialType, CeilingMaterialType } from '../../../../types';

interface AffectedMaterialsStepProps {
  job: any;
  onNext: () => void;
}

interface RoomAffectedData {
  roomId: string;
  floor: {
    affectedSqFt: number;
    materials: Array<{ type: FloorMaterialType; sqFt: number }>;
  };
  walls: {
    affectedSqFt: number;
    wetHeightAvg: number;
    materials: Array<{ type: WallMaterialType; sqFt: number }>;
  };
  ceiling: {
    affectedSqFt: number;
    materials: Array<{ type: CeilingMaterialType; sqFt: number }>;
  };
}

export const AffectedMaterialsStep: React.FC<AffectedMaterialsStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const rooms = installData.rooms || [];
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [roomsAffectedData, setRoomsAffectedData] = useState<Record<string, RoomAffectedData>>(
    installData.roomsAffectedData || {}
  );

  const currentRoom = rooms[currentRoomIndex];

  const [formData, setFormData] = useState({
    floorAffectedSqFt: '',
    wallsAffectedSqFt: '',
    wallsWetHeight: '',
    ceilingAffectedSqFt: '',
    floorMaterial: 'carpet' as FloorMaterialType,
    wallMaterial: 'drywall' as WallMaterialType,
    ceilingMaterial: 'drywall' as CeilingMaterialType,
  });

  // Load existing data for current room
  useEffect(() => {
    if (currentRoom && roomsAffectedData[currentRoom.id]) {
      const data = roomsAffectedData[currentRoom.id];
      setFormData({
        floorAffectedSqFt: data.floor.affectedSqFt.toString(),
        wallsAffectedSqFt: data.walls.affectedSqFt.toString(),
        wallsWetHeight: data.walls.wetHeightAvg.toString(),
        ceilingAffectedSqFt: data.ceiling.affectedSqFt.toString(),
        floorMaterial: data.floor.materials[0]?.type || 'carpet',
        wallMaterial: data.walls.materials[0]?.type || 'drywall',
        ceilingMaterial: data.ceiling.materials[0]?.type || 'drywall',
      });
    } else {
      // Reset form for new room
      setFormData({
        floorAffectedSqFt: '',
        wallsAffectedSqFt: '',
        wallsWetHeight: '',
        ceilingAffectedSqFt: '',
        floorMaterial: 'carpet',
        wallMaterial: 'drywall',
        ceilingMaterial: 'drywall',
      });
    }
  }, [currentRoomIndex, currentRoom]);

  const handleSaveRoom = () => {
    if (!currentRoom) return;

    const floorAffected = parseFloat(formData.floorAffectedSqFt) || 0;
    const wallsAffected = parseFloat(formData.wallsAffectedSqFt) || 0;
    const ceilingAffected = parseFloat(formData.ceilingAffectedSqFt) || 0;
    const wetHeight = parseFloat(formData.wallsWetHeight) || 0;

    const roomData: RoomAffectedData = {
      roomId: currentRoom.id,
      floor: {
        affectedSqFt: floorAffected,
        materials: floorAffected > 0 ? [{ type: formData.floorMaterial, sqFt: floorAffected }] : [],
      },
      walls: {
        affectedSqFt: wallsAffected,
        wetHeightAvg: wetHeight,
        materials: wallsAffected > 0 ? [{ type: formData.wallMaterial, sqFt: wallsAffected }] : [],
      },
      ceiling: {
        affectedSqFt: ceilingAffected,
        materials: ceilingAffected > 0 ? [{ type: formData.ceilingMaterial, sqFt: ceilingAffected }] : [],
      },
    };

    const newData = {
      ...roomsAffectedData,
      [currentRoom.id]: roomData,
    };

    setRoomsAffectedData(newData);
    updateWorkflowData('install', { roomsAffectedData: newData });

    // Move to next room or finish
    if (currentRoomIndex < rooms.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
    }
  };

  const handlePreviousRoom = () => {
    if (currentRoomIndex > 0) {
      setCurrentRoomIndex(currentRoomIndex - 1);
    }
  };

  if (!currentRoom) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
        <p className="text-gray-600">No rooms found. Please add rooms in the previous step.</p>
      </div>
    );
  }

  const totalAffected = (parseFloat(formData.floorAffectedSqFt) || 0) +
                        (parseFloat(formData.wallsAffectedSqFt) || 0) +
                        (parseFloat(formData.ceilingAffectedSqFt) || 0);

  const percentAffected = currentRoom.totalSurfaceArea > 0
    ? ((totalAffected / currentRoom.totalSurfaceArea) * 100).toFixed(1)
    : '0';

  // Determine water class based on % affected
  let waterClass = 1;
  const percentNum = parseFloat(percentAffected);
  if (percentNum > 40) waterClass = 3;
  else if (percentNum >= 5) waterClass = 2;

  const completedRooms = Object.keys(roomsAffectedData).length;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">
            Room {currentRoomIndex + 1} of {rooms.length}: {currentRoom.name}
          </h3>
          <span className="text-sm text-gray-600">
            {completedRooms} of {rooms.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-entrusted-orange h-2 rounded-full transition-all"
            style={{ width: `${(completedRooms / rooms.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Document Affected Materials</h4>
            <p className="text-sm text-blue-800">
              For this room, record the square footage of affected materials for floor, walls, and ceiling.
              Only enter the AFFECTED area, not the total room size.
            </p>
          </div>
        </div>
      </div>

      {/* Room Dimensions Reference */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Room Dimensions (Reference)</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Dimensions: {currentRoom.length}' × {currentRoom.width}' × {currentRoom.height}'</p>
            <p className="text-gray-600">Floor Area: <strong>{currentRoom.floorSqFt.toFixed(0)} sq ft</strong></p>
          </div>
          <div>
            <p className="text-gray-600">Wall Area: <strong>{currentRoom.wallSqFt.toFixed(0)} sq ft</strong></p>
            <p className="text-gray-600">Ceiling Area: <strong>{currentRoom.ceilingSqFt.toFixed(0)} sq ft</strong></p>
          </div>
        </div>
      </div>

      {/* Floor Section */}
      <div className="border rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-entrusted-orange" />
          Floor Materials
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Material Type
            </label>
            <select
              value={formData.floorMaterial}
              onChange={(e) => setFormData({ ...formData, floorMaterial: e.target.value as FloorMaterialType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
            >
              <option value="carpet">Carpet</option>
              <option value="hardwood">Hardwood</option>
              <option value="tile">Tile</option>
              <option value="vinyl">Vinyl</option>
              <option value="laminate">Laminate</option>
              <option value="concrete">Concrete</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input
            label={`Affected Floor Area (Max: ${currentRoom.floorSqFt.toFixed(0)} sq ft)`}
            type="number"
            step="0.1"
            min="0"
            max={currentRoom.floorSqFt}
            placeholder="0"
            value={formData.floorAffectedSqFt}
            onChange={(e) => setFormData({ ...formData, floorAffectedSqFt: e.target.value })}
          />
        </div>
      </div>

      {/* Walls Section */}
      <div className="border rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-entrusted-orange" />
          Wall Materials
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wall Material Type
            </label>
            <select
              value={formData.wallMaterial}
              onChange={(e) => setFormData({ ...formData, wallMaterial: e.target.value as WallMaterialType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
            >
              <option value="drywall">Drywall</option>
              <option value="plaster">Plaster</option>
              <option value="concrete">Concrete</option>
              <option value="wood">Wood</option>
              <option value="brick">Brick</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input
            label="Avg Water Height on Walls (ft)"
            type="number"
            step="0.1"
            min="0"
            max={currentRoom.height}
            placeholder="0"
            value={formData.wallsWetHeight}
            onChange={(e) => setFormData({ ...formData, wallsWetHeight: e.target.value })}
          />
          <Input
            label={`Affected Wall Area (Max: ${currentRoom.wallSqFt.toFixed(0)} sq ft)`}
            type="number"
            step="0.1"
            min="0"
            max={currentRoom.wallSqFt}
            placeholder="0"
            value={formData.wallsAffectedSqFt}
            onChange={(e) => setFormData({ ...formData, wallsAffectedSqFt: e.target.value })}
          />
        </div>
      </div>

      {/* Ceiling Section */}
      <div className="border rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-entrusted-orange" />
          Ceiling Materials
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ceiling Material Type
            </label>
            <select
              value={formData.ceilingMaterial}
              onChange={(e) => setFormData({ ...formData, ceilingMaterial: e.target.value as CeilingMaterialType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
            >
              <option value="drywall">Drywall</option>
              <option value="plaster">Plaster</option>
              <option value="acoustic">Acoustic Tile</option>
              <option value="wood">Wood</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input
            label={`Affected Ceiling Area (Max: ${currentRoom.ceilingSqFt.toFixed(0)} sq ft)`}
            type="number"
            step="0.1"
            min="0"
            max={currentRoom.ceilingSqFt}
            placeholder="0"
            value={formData.ceilingAffectedSqFt}
            onChange={(e) => setFormData({ ...formData, ceilingAffectedSqFt: e.target.value })}
          />
        </div>
      </div>

      {/* Summary & Class Determination */}
      <div className={`border-2 rounded-lg p-5 ${
        waterClass === 3 ? 'border-red-300 bg-red-50' :
        waterClass === 2 ? 'border-yellow-300 bg-yellow-50' :
        'border-green-300 bg-green-50'
      }`}>
        <h4 className="font-semibold text-gray-900 mb-3">Room Classification Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <p className="text-gray-600">Total Affected Area:</p>
            <p className="text-2xl font-bold text-gray-900">{totalAffected.toFixed(0)} sq ft</p>
          </div>
          <div>
            <p className="text-gray-600">Percent of Room Affected:</p>
            <p className="text-2xl font-bold text-gray-900">{percentAffected}%</p>
          </div>
        </div>
        <div className={`inline-block px-4 py-2 rounded-full font-medium ${
          waterClass === 3 ? 'bg-red-200 text-red-900' :
          waterClass === 2 ? 'bg-yellow-200 text-yellow-900' :
          'bg-green-200 text-green-900'
        }`}>
          Determined Class: Class {waterClass}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {waterClass === 1 && 'Less than 5% of surfaces affected'}
          {waterClass === 2 && '5% to 40% of surfaces affected'}
          {waterClass === 3 && 'More than 40% of surfaces affected'}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="secondary"
          onClick={handlePreviousRoom}
          disabled={currentRoomIndex === 0}
        >
          Previous Room
        </Button>
        <span className="text-sm text-gray-600">
          Room {currentRoomIndex + 1} of {rooms.length}
        </span>
        <Button
          variant="primary"
          onClick={handleSaveRoom}
        >
          {currentRoomIndex < rooms.length - 1 ? 'Save & Next Room' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
};
