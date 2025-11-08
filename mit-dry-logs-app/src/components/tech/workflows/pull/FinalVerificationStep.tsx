import React, { useState } from 'react';
import { Droplets, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface FinalVerificationStepProps {
  job: any;
  onNext: () => void;
}

interface FinalReading {
  roomId: string;
  roomName: string;
  materialType: string;
  location: string;
  reading: number;
  isDry: boolean;
}

export const FinalVerificationStep: React.FC<FinalVerificationStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const [readings, setReadings] = useState<FinalReading[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [location, setLocation] = useState('');
  const [currentReading, setCurrentReading] = useState('');

  const affectedRooms = job.rooms?.filter((r: any) => r.affectedStatus === 'affected') || [];

  const DRY_STANDARD = 12; // IICRC dry standard: < 12%

  React.useEffect(() => {
    updateWorkflowData('pull', {
      finalReadings: readings,
      finalReadingsTimestamp: new Date().toISOString(),
    });
  }, [readings]);

  const addReading = () => {
    if (!selectedRoom || !materialType || !currentReading) return;

    const room = affectedRooms.find((r: any) => r.roomId === selectedRoom);
    if (!room) return;

    const readingValue = parseFloat(currentReading);
    const reading: FinalReading = {
      roomId: selectedRoom,
      roomName: room.roomName,
      materialType,
      location,
      reading: readingValue,
      isDry: readingValue < DRY_STANDARD,
    };

    setReadings(prev => [...prev, reading]);

    // Reset form
    setMaterialType('');
    setLocation('');
    setCurrentReading('');
  };

  const removeReading = (index: number) => {
    setReadings(prev => prev.filter((_, i) => i !== index));
  };

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

  const getRoomReadings = (roomId: string) => {
    return readings.filter(r => r.roomId === roomId);
  };

  const isRoomDry = (roomId: string) => {
    const roomReadings = getRoomReadings(roomId);
    return roomReadings.length > 0 && roomReadings.every(r => r.isDry);
  };

  const allRoomsDry = affectedRooms.every((room: any) => {
    const roomReadings = getRoomReadings(room.roomId);
    return roomReadings.length > 0 && roomReadings.every(r => r.isDry);
  });

  const allRoomsHaveReadings = affectedRooms.every((room: any) => {
    return getRoomReadings(room.roomId).length > 0;
  });

  const wetMaterials = readings.filter(r => !r.isDry);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Final Moisture Verification</h4>
            <p className="text-sm text-blue-800">
              Take final readings for ALL affected materials in ALL rooms. Every material must be below 12% per IICRC standards before equipment can be removed.
            </p>
          </div>
        </div>
      </div>

      {/* IICRC Standard */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">IICRC S500 Dry Standard</h3>
        <div className="flex items-center gap-3">
          <div className="text-center p-3 bg-white rounded border border-green-500">
            <p className="text-2xl font-bold text-green-600">&lt; 12%</p>
            <p className="text-xs text-gray-600">Dry Standard</p>
          </div>
          <p className="text-sm text-gray-700">
            All materials must read below 12% moisture content to be considered dry and safe for closure.
          </p>
        </div>
      </div>

      {/* Room Status Overview */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Room Status</h3>
        <div className="grid grid-cols-2 gap-2">
          {affectedRooms.map((room: any) => {
            const roomReadings = getRoomReadings(room.roomId);
            const isDry = isRoomDry(room.roomId);
            const hasReadings = roomReadings.length > 0;

            return (
              <div
                key={room.roomId}
                className={`p-3 rounded border-2 ${
                  !hasReadings
                    ? 'border-gray-200 bg-gray-50'
                    : isDry
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{room.roomName}</p>
                  {hasReadings && (
                    isDry ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {hasReadings ? `${roomReadings.length} readings` : 'No readings yet'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Reading Form */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Record Final Reading
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
                  {isRoomDry(room.roomId) && ' ✓'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., North wall, center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moisture Reading (%) *</label>
            <Input
              type="number"
              step="0.1"
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              placeholder="10.5"
            />
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

      {/* All Readings */}
      {readings.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">All Final Readings ({readings.length})</h3>
          <div className="space-y-2">
            {readings.map((reading, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border-2 ${
                  reading.isDry ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {reading.roomName} - {reading.materialType}
                    </p>
                    {reading.location && (
                      <p className="text-sm text-gray-600">{reading.location}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${
                      reading.isDry ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {reading.reading.toFixed(1)}%
                    </span>
                    {reading.isDry ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <button
                      onClick={() => removeReading(idx)}
                      className="text-sm text-gray-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wet Materials Warning */}
      {wetMaterials.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">⚠️ Wet Materials Detected</h4>
              <p className="text-sm text-red-800 mb-2">
                {wetMaterials.length} {wetMaterials.length === 1 ? 'material is' : 'materials are'} still above 12% moisture:
              </p>
              <ul className="text-sm text-red-800 space-y-1">
                {wetMaterials.map((mat, idx) => (
                  <li key={idx}>
                    • {mat.roomName} - {mat.materialType}: {mat.reading.toFixed(1)}%
                  </li>
                ))}
              </ul>
              <p className="text-sm text-red-800 mt-2 font-medium">
                Equipment cannot be removed until ALL materials are dry. Contact MIT Lead for guidance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {allRoomsDry && allRoomsHaveReadings && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">✓ All Materials Dry!</h4>
              <p className="text-sm text-green-800">
                All {readings.length} readings are below 12%. This job meets IICRC dry standards and is ready for equipment removal.
              </p>
            </div>
          </div>
        </div>
      )}

      {readings.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            No final readings recorded yet. Take readings for all affected materials.
          </p>
        </div>
      )}
    </div>
  );
};
