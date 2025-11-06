import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Droplets, AlertCircle, Info, Plus, Trash2, CheckCircle, Camera, AlertTriangle } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { MaterialType, ReadingType } from '../../../../types';

interface MoistureReading {
  id: string;
  roomId: string;
  material: MaterialType;
  location: string;
  moisturePercent: number;
  temperature: number;
  humidity: number;
  readingType: ReadingType;
  isDryStandard: boolean;
  notes: string;
  timestamp: string;
  photo?: string;
}

interface MoistureMappingStepProps {
  job: any;
  onNext: () => void;
}

export const MoistureMappingStep: React.FC<MoistureMappingStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const rooms = installData.rooms || [];
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [moistureReadings, setMoistureReadings] = useState<MoistureReading[]>(
    installData.moistureReadings || []
  );
  const [showAddReading, setShowAddReading] = useState(false);
  const [newReading, setNewReading] = useState({
    material: 'Drywall' as MaterialType,
    location: '',
    moisturePercent: '',
    temperature: '70',
    humidity: '50',
    isDryStandard: false,
    notes: '',
    photo: null as string | null,
  });

  const currentRoom = rooms[currentRoomIndex];

  // Save readings to workflow store
  useEffect(() => {
    updateWorkflowData('install', { moistureReadings });
  }, [moistureReadings]);

  const handleReadingPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user && currentRoom) {
      const url = await uploadPhoto(file, job.jobId, currentRoom.name, 'moisture-reading', user.uid);
      if (url) setNewReading({ ...newReading, photo: url });
    }
  };

  const handleAddReading = () => {
    if (!currentRoom || !newReading.location || !newReading.moisturePercent) {
      alert('Please fill in location and moisture percentage');
      return;
    }

    const moistureValue = parseFloat(newReading.moisturePercent);

    const reading: MoistureReading = {
      id: Date.now().toString(),
      roomId: currentRoom.id,
      material: newReading.material,
      location: newReading.location,
      moisturePercent: moistureValue,
      temperature: parseFloat(newReading.temperature),
      humidity: parseFloat(newReading.humidity),
      readingType: 'initial',
      isDryStandard: newReading.isDryStandard,
      notes: newReading.notes,
      timestamp: new Date().toISOString(),
      photo: newReading.photo || undefined,
    };

    setMoistureReadings([...moistureReadings, reading]);
    setNewReading({
      material: newReading.material,
      location: '',
      moisturePercent: '',
      temperature: '70',
      humidity: '50',
      isDryStandard: false,
      notes: '',
      photo: null,
    });
    setShowAddReading(false);
  };

  const handleDeleteReading = (id: string) => {
    if (confirm('Delete this moisture reading?')) {
      setMoistureReadings(moistureReadings.filter(r => r.id !== id));
    }
  };

  const handleNextRoom = () => {
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
        <p className="text-gray-600">No rooms found. Please add rooms in the previous steps.</p>
      </div>
    );
  }

  const roomReadings = moistureReadings.filter(r => r.roomId === currentRoom.id);
  const dryStandard = roomReadings.find(r => r.isDryStandard);
  const affectedReadings = roomReadings.filter(r => !r.isDryStandard);

  const roomsWithReadings = new Set(moistureReadings.map(r => r.roomId)).size;
  const totalReadings = moistureReadings.length;

  const isDry = (moisture: number) => {
    if (!dryStandard) return moisture <= 12; // Default threshold
    return moisture <= dryStandard.moisturePercent + 2; // Within 2% of dry standard
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">
            Room {currentRoomIndex + 1} of {rooms.length}: {currentRoom.name}
          </h3>
          <span className="text-sm text-gray-600">
            {roomsWithReadings} rooms with readings • {totalReadings} total readings
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-entrusted-orange h-2 rounded-full transition-all"
            style={{ width: `${(roomsWithReadings / rooms.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Initial Moisture Mapping</h4>
            <p className="text-sm text-blue-800 mb-2">
              For each room, establish a dry standard from unaffected materials, then record moisture readings
              from affected areas. Use a grid pattern for consistency.
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• First, take a DRY STANDARD reading from unaffected material</li>
              <li>• Then, take multiple readings from affected areas</li>
              <li>• Record specific locations (e.g., "North wall, 2ft height, grid A3")</li>
            </ul>
          </div>
        </div>
      </div>

      {/* High Readings Warning */}
      {affectedReadings.some(r => r.moisturePercent > 40) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">⚠️ Very High Moisture Detected (&gt;40%)</h4>
              <p className="text-sm text-red-800 mb-2">
                Readings above 40% may indicate Category 2 or 3 water. Materials may not be salvageable and could require removal.
              </p>
              <ul className="text-sm text-red-800 space-y-1">
                {affectedReadings
                  .filter(r => r.moisturePercent > 40)
                  .map(r => (
                    <li key={r.id}>
                      • <strong>{r.material}</strong> at {r.location}: <strong>{r.moisturePercent}%</strong>
                    </li>
                  ))}
              </ul>
              <p className="text-sm text-red-800 mt-2 font-medium">
                → Consider upgrading water category classification and flagging for additional demo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dry Standard Status */}
      {!dryStandard && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Dry Standard Required</h4>
              <p className="text-sm text-yellow-800">
                You haven't established a dry standard for this room yet. Check the "Dry Standard" box
                when recording your first reading from unaffected material.
              </p>
            </div>
          </div>
        </div>
      )}

      {dryStandard && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">Dry Standard Established</h4>
              <p className="text-sm text-green-800">
                <strong>{dryStandard.material}</strong> at <strong>{dryStandard.location}</strong>: {dryStandard.moisturePercent}%
                (Target: ≤ {(dryStandard.moisturePercent + 2).toFixed(1)}% to be considered dry)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Readings */}
      {roomReadings.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Readings for {currentRoom.name} ({roomReadings.length})
          </h3>
          <div className="space-y-2">
            {roomReadings.map(reading => (
              <div
                key={reading.id}
                className={`border-l-4 rounded-lg bg-white p-4 ${
                  reading.isDryStandard
                    ? 'border-blue-500'
                    : isDry(reading.moisturePercent)
                    ? 'border-green-500'
                    : 'border-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {reading.isDryStandard && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          Dry Standard
                        </span>
                      )}
                      {!reading.isDryStandard && (
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          isDry(reading.moisturePercent)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isDry(reading.moisturePercent) ? '✓ DRY' : '✗ WET'}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-900">{reading.material}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Location:</strong> {reading.location}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Moisture</p>
                        <p className="font-bold text-lg">{reading.moisturePercent}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Temperature</p>
                        <p className="font-medium">{reading.temperature}°F</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Humidity</p>
                        <p className="font-medium">{reading.humidity}%</p>
                      </div>
                    </div>
                    {reading.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        Note: {reading.notes}
                      </p>
                    )}
                    {reading.photo && (
                      <div className="mt-2">
                        <img src={reading.photo} alt="Moisture Meter" className="max-h-24 rounded border border-gray-200" />
                        <p className="text-xs text-gray-500 mt-1">
                          <Camera className="w-3 h-3 inline mr-1" />
                          Meter photo
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteReading(reading.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Reading Form */}
      {showAddReading ? (
        <div className="border-2 border-entrusted-orange rounded-lg p-6 bg-orange-50">
          <h3 className="font-semibold text-gray-900 mb-4">Add Moisture Reading</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Type *
                </label>
                <select
                  value={newReading.material}
                  onChange={(e) => setNewReading({ ...newReading, material: e.target.value as MaterialType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
                >
                  <option>Drywall</option>
                  <option>Flooring</option>
                  <option>Carpet</option>
                  <option>Wood Framing</option>
                  <option>Subfloor</option>
                  <option>Concrete</option>
                  <option>Insulation</option>
                  <option>Tile</option>
                  <option>Other</option>
                </select>
              </div>
              <Input
                label="Location *"
                placeholder="e.g., North wall, 2ft height, grid A3"
                value={newReading.location}
                onChange={(e) => setNewReading({ ...newReading, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Moisture % *"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="0-100"
                value={newReading.moisturePercent}
                onChange={(e) => setNewReading({ ...newReading, moisturePercent: e.target.value })}
              />
              <Input
                label="Temperature (°F)"
                type="number"
                step="0.1"
                value={newReading.temperature}
                onChange={(e) => setNewReading({ ...newReading, temperature: e.target.value })}
              />
              <Input
                label="Humidity (%)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={newReading.humidity}
                onChange={(e) => setNewReading({ ...newReading, humidity: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newReading.isDryStandard}
                  onChange={(e) => setNewReading({ ...newReading, isDryStandard: e.target.checked })}
                  className="w-4 h-4 text-entrusted-orange border-gray-300 rounded focus:ring-entrusted-orange"
                />
                <span className="text-sm font-medium text-gray-700">
                  This is a Dry Standard (unaffected baseline)
                </span>
              </label>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moisture Meter Photo (Optional)
              </label>
              {newReading.photo ? (
                <div>
                  <img src={newReading.photo} alt="Moisture Reading" className="max-h-32 rounded mb-2" />
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Photo added</span>
                  </div>
                  <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleReadingPhoto}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Camera className="w-4 h-4" />
                    Replace Photo
                  </label>
                </div>
              ) : (
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleReadingPhoto}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Camera className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Photo Moisture Meter'}
                </label>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Photograph the moisture meter display for documentation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={newReading.notes}
                onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                rows={2}
                placeholder="Any observations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="primary" onClick={handleAddReading}>
                <Plus className="w-4 h-4" />
                Add Reading
              </Button>
              <Button variant="secondary" onClick={() => setShowAddReading(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setShowAddReading(true)} className="w-full">
          <Plus className="w-4 h-4" />
          Add Moisture Reading
        </Button>
      )}

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
          onClick={handleNextRoom}
          disabled={currentRoomIndex >= rooms.length - 1}
        >
          Next Room
        </Button>
      </div>

      {/* IICRC Reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          <strong>Best Practice:</strong> Establish a dry standard in each room before taking affected readings.
          Return to the same locations daily for consistent progress tracking.
        </p>
      </div>
    </div>
  );
};
