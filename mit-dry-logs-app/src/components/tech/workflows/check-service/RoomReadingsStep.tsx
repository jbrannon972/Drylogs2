import React, { useState } from 'react';
import { Droplets, Info, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface RoomReadingsStepProps {
  job: any;
  onNext: () => void;
}

interface MaterialReading {
  materialType: string;
  location: string;
  currentReading: number;
  previousReading?: number;
  isDry: boolean;
}

interface RoomData {
  roomId: string;
  roomName: string;
  readings: MaterialReading[];
}

export const RoomReadingsStep: React.FC<RoomReadingsStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const [roomReadings, setRoomReadings] = useState<RoomData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [materialType, setMaterialType] = useState('');
  const [location, setLocation] = useState('');
  const [currentReading, setCurrentReading] = useState('');

  // ULTRAFAULT: Defensive array check to prevent .filter() errors
  const affectedRooms = Array.isArray(job?.rooms) ? job.rooms.filter((r: any) => r.affectedStatus === 'affected') : [];

  const materialTypes = [
    'Drywall',
    'Ceiling Drywall',
    'Baseboard',
    'Wood Flooring',
    'Subfloor',
    'Floor Joists',
    'Wall Studs',
    'Concrete/Slab',
    'Carpet Pad Area',
    'Other',
  ];

  React.useEffect(() => {
    updateWorkflowData('checkService', {
      roomReadings,
      readingsTimestamp: new Date().toISOString(),
    });
  }, [roomReadings]);

  const addReading = () => {
    if (!selectedRoom || !materialType || !currentReading) return;

    const room = affectedRooms.find((r: any) => r.roomId === selectedRoom);
    if (!room) return;

    const reading: MaterialReading = {
      materialType,
      location,
      currentReading: parseFloat(currentReading),
      isDry: parseFloat(currentReading) < 12, // IICRC dry standard
    };

    setRoomReadings(prev => {
      const existing = prev.find(r => r.roomId === selectedRoom);
      if (existing) {
        return prev.map(r =>
          r.roomId === selectedRoom
            ? { ...r, readings: [...r.readings, reading] }
            : r
        );
      }
      return [...prev, {
        roomId: selectedRoom,
        roomName: room.roomName,
        readings: [reading],
      }];
    });

    // Reset form
    setMaterialType('');
    setLocation('');
    setCurrentReading('');
  };

  const getRoomProgress = (roomId: string) => {
    const roomData = roomReadings.find(r => r.roomId === roomId);
    if (!roomData || roomData.readings.length === 0) return null;

    const totalReadings = roomData.readings.length;
    const dryReadings = roomData.readings.filter(r => r.isDry).length;
    const avgReading = roomData.readings.reduce((sum, r) => sum + r.currentReading, 0) / totalReadings;

    return {
      totalReadings,
      dryReadings,
      percentDry: Math.round((dryReadings / totalReadings) * 100),
      avgReading: avgReading.toFixed(1),
    };
  };

  const getTrendIcon = (reading: MaterialReading) => {
    if (!reading.previousReading) return null;
    const diff = reading.currentReading - reading.previousReading;
    if (Math.abs(diff) < 0.5) return <Minus className="w-4 h-4 text-gray-500" />;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const totalReadings = roomReadings.reduce((sum, r) => sum + r.readings.length, 0);
  const totalDry = roomReadings.reduce((sum, r) => sum + r.readings.filter(m => m.isDry).length, 0);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Moisture Readings</h4>
            <p className="text-sm text-blue-800">
              Take readings for ALL affected materials in each room. Readings below 12% are considered dry per IICRC standards.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      {totalReadings > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Overall Progress</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalReadings}</p>
              <p className="text-xs text-gray-600">Total Readings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalDry}</p>
              <p className="text-xs text-gray-600">Dry Materials</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-entrusted-orange">
                {totalReadings > 0 ? Math.round((totalDry / totalReadings) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-600">Complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Reading Form */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Record Moisture Reading
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select room...</option>
              {affectedRooms.map((room: any) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.roomName}
                  {getRoomProgress(room.roomId) && ` (${getRoomProgress(room.roomId)!.dryReadings}/${getRoomProgress(room.roomId)!.totalReadings} dry)`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material Type *</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select material...</option>
              {materialTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specific Location</label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., North wall, center"
            />
            <p className="text-xs text-gray-500 mt-1">Optional - helps track specific spots over time</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moisture Reading (%) *</label>
            <Input
              type="number"
              step="0.1"
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              placeholder="15.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              IICRC dry standard: &lt; 12%
            </p>
          </div>

          <button
            onClick={addReading}
            disabled={!selectedRoom || !materialType || !currentReading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Reading
          </button>
        </div>
      </div>

      {/* Readings Summary by Room */}
      {roomReadings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Readings by Room</h3>
          {roomReadings.map(room => {
            const progress = getRoomProgress(room.roomId);
            return (
              <div key={room.roomId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{room.roomName}</h4>
                  {progress && (
                    <span className={`text-sm font-medium ${
                      progress.percentDry === 100 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {progress.percentDry}% dry
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {room.readings.map((reading, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{reading.materialType}</p>
                        {reading.location && (
                          <p className="text-sm text-gray-600">{reading.location}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(reading)}
                        <span className={`text-lg font-bold ${
                          reading.isDry ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {reading.currentReading.toFixed(1)}%
                        </span>
                        {reading.isDry && (
                          <span className="text-xs text-green-600 font-medium">✓ DRY</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {progress && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Average reading: <span className="font-medium">{progress.avgReading}%</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {roomReadings.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            No readings recorded yet. Add readings for all affected materials.
          </p>
        </div>
      )}
    </div>
  );
};
