/**
 * Partial Demo Step
 * Log demolition work performed during install phase (before scheduled demo day)
 */

import React, { useState } from 'react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '../../../shared/Button';
import {
  Hammer,
  Plus,
  Trash2,
  Camera,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface PartialDemoMaterial {
  id: string;
  materialType: string;
  quantity: number;
  unit: 'sqft' | 'linear-ft' | 'each';
  notes: string;
}

interface PartialDemoRoom {
  roomId: string;
  roomName: string;
  materialsRemoved: PartialDemoMaterial[];
  demoTimeMinutes: number;
  photos: string[];
  notes: string;
}

interface PartialDemoStepProps {
  job: any;
}

export const PartialDemoStep: React.FC<PartialDemoStepProps> = ({ job }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { uploadPhoto, isUploading } = usePhotos();
  const { user } = useAuth();

  const rooms = installData.rooms || [];
  const [demoPerformed, setDemoPerformed] = useState(
    installData.partialDemoPerformed || false
  );
  const [demoRooms, setDemoRooms] = useState<PartialDemoRoom[]>(
    installData.partialDemoDetails?.rooms || []
  );
  const [currentRoomId, setCurrentRoomId] = useState<string>('');

  // Material options
  const commonDemoMaterials = [
    'Drywall',
    'Baseboard',
    'Carpet',
    'Pad/Underlayment',
    'Hardwood Flooring',
    'Laminate Flooring',
    'Vinyl Flooring',
    'Tile',
    'Cabinets',
    'Countertops',
    'Backsplash',
    'Insulation',
    'Ceiling Material',
    'Trim/Molding',
    'Other',
  ];

  const handleToggleDemo = (performed: boolean) => {
    setDemoPerformed(performed);
    updateWorkflowData('install', { partialDemoPerformed: performed });
    if (!performed) {
      setDemoRooms([]);
      updateWorkflowData('install', { partialDemoDetails: null });
    }
  };

  const handleAddRoom = () => {
    if (!currentRoomId) {
      alert('Please select a room');
      return;
    }

    const room = rooms.find((r: any) => r.id === currentRoomId);
    if (!room) return;

    // Check if room already exists
    if (demoRooms.find(dr => dr.roomId === currentRoomId)) {
      alert('This room is already added to partial demo');
      return;
    }

    const newRoom: PartialDemoRoom = {
      roomId: currentRoomId,
      roomName: room.name,
      materialsRemoved: [],
      demoTimeMinutes: 0,
      photos: [],
      notes: '',
    };

    const updated = [...demoRooms, newRoom];
    setDemoRooms(updated);
    setCurrentRoomId('');
    saveToWorkflow(updated);
  };

  const handleRemoveRoom = (roomId: string) => {
    const updated = demoRooms.filter(dr => dr.roomId !== roomId);
    setDemoRooms(updated);
    saveToWorkflow(updated);
  };

  const handleAddMaterial = (roomId: string) => {
    const updated = demoRooms.map(dr => {
      if (dr.roomId === roomId) {
        const newMaterial: PartialDemoMaterial = {
          id: Date.now().toString(),
          materialType: commonDemoMaterials[0],
          quantity: 0,
          unit: 'sqft',
          notes: '',
        };
        return { ...dr, materialsRemoved: [...dr.materialsRemoved, newMaterial] };
      }
      return dr;
    });
    setDemoRooms(updated);
    saveToWorkflow(updated);
  };

  const handleRemoveMaterial = (roomId: string, materialId: string) => {
    const updated = demoRooms.map(dr => {
      if (dr.roomId === roomId) {
        return {
          ...dr,
          materialsRemoved: dr.materialsRemoved.filter(m => m.id !== materialId),
        };
      }
      return dr;
    });
    setDemoRooms(updated);
    saveToWorkflow(updated);
  };

  const handleUpdateMaterial = (
    roomId: string,
    materialId: string,
    field: keyof PartialDemoMaterial,
    value: any
  ) => {
    const updated = demoRooms.map(dr => {
      if (dr.roomId === roomId) {
        return {
          ...dr,
          materialsRemoved: dr.materialsRemoved.map(m =>
            m.id === materialId ? { ...m, [field]: value } : m
          ),
        };
      }
      return dr;
    });
    setDemoRooms(updated);
    saveToWorkflow(updated);
  };

  const handleUpdateRoomField = (
    roomId: string,
    field: keyof PartialDemoRoom,
    value: any
  ) => {
    const updated = demoRooms.map(dr =>
      dr.roomId === roomId ? { ...dr, [field]: value } : dr
    );
    setDemoRooms(updated);
    saveToWorkflow(updated);
  };

  const handlePhotoUpload = async (roomId: string, file: File) => {
    if (!user) return;

    const url = await uploadPhoto(file, job.jobId, roomId, 'demo', user.uid);
    if (url) {
      const updated = demoRooms.map(dr =>
        dr.roomId === roomId ? { ...dr, photos: [...dr.photos, url] } : dr
      );
      setDemoRooms(updated);
      saveToWorkflow(updated);
    }
  };

  const saveToWorkflow = (rooms: PartialDemoRoom[]) => {
    const totalTime = rooms.reduce((sum, r) => sum + (r.demoTimeMinutes || 0), 0);
    updateWorkflowData('install', {
      partialDemoDetails: {
        rooms,
        totalDemoTimeMinutes: totalTime,
        loggedAt: new Date(),
      },
    });
  };

  const getTotalTime = () => {
    return demoRooms.reduce((sum, r) => sum + (r.demoTimeMinutes || 0), 0);
  };

  const getTotalMaterials = () => {
    return demoRooms.reduce((sum, r) => sum + r.materialsRemoved.length, 0);
  };

  const availableRooms = rooms.filter(
    (r: any) => !demoRooms.find(dr => dr.roomId === r.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Hammer className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-1">
              Partial Demo During Install
            </h3>
            <p className="text-sm text-orange-800">
              Log any demolition work completed during the install phase. This is for
              partial demo only — not the full scheduled demo workflow.
            </p>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
          <input
            type="checkbox"
            checked={demoPerformed}
            onChange={(e) => handleToggleDemo(e.target.checked)}
            className="w-5 h-5 rounded text-entrusted-orange focus:ring-orange-500"
          />
          <div>
            <span className="font-semibold text-gray-900 text-lg block">
              Demo work performed during install
            </span>
            <p className="text-sm text-gray-600">
              Check this if you performed any demolition work during the install (before
              scheduled demo day)
            </p>
          </div>
        </label>
      </div>

      {/* Demo Details */}
      {demoPerformed && (
        <>
          {/* Summary Stats */}
          {demoRooms.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-900">{demoRooms.length}</p>
                <p className="text-xs text-gray-600">Rooms with Demo</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-900">{getTotalMaterials()}</p>
                <p className="text-xs text-gray-600">Materials Removed</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-900">{getTotalTime()}</p>
                <p className="text-xs text-gray-600">Total Minutes</p>
              </div>
            </div>
          )}

          {/* Add Room */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Add Room with Demo Work</h4>
            <div className="flex gap-2">
              <select
                value={currentRoomId}
                onChange={(e) => setCurrentRoomId(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">Select a room...</option>
                {availableRooms.map((room: any) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                onClick={handleAddRoom}
                disabled={!currentRoomId}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Room
              </Button>
            </div>
            {availableRooms.length === 0 && demoRooms.length < rooms.length && (
              <p className="text-sm text-gray-500 mt-2">
                All rooms have been added to partial demo
              </p>
            )}
          </div>

          {/* Demo Rooms */}
          {demoRooms.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  No rooms added yet. Add rooms where you performed demo work.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {demoRooms.map((demoRoom) => (
                <div
                  key={demoRoom.roomId}
                  className="border-2 border-gray-200 rounded-lg p-6 bg-white"
                >
                  {/* Room Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {demoRoom.roomName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {demoRoom.materialsRemoved.length} materials •{' '}
                        {demoRoom.demoTimeMinutes} minutes
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveRoom(demoRoom.roomId)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Demo Time */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Demo Time (minutes) *
                    </label>
                    <input
                      type="number"
                      value={demoRoom.demoTimeMinutes || ''}
                      onChange={(e) =>
                        handleUpdateRoomField(
                          demoRoom.roomId,
                          'demoTimeMinutes',
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="input-field w-32"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Time spent on demo work in this room
                    </p>
                  </div>

                  {/* Materials Removed */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Materials Removed
                      </label>
                      <Button
                        variant="secondary"
                        onClick={() => handleAddMaterial(demoRoom.roomId)}
                        className="flex items-center gap-1 text-xs px-2 py-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Material
                      </Button>
                    </div>

                    {demoRoom.materialsRemoved.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No materials added yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {demoRoom.materialsRemoved.map((material) => (
                          <div
                            key={material.id}
                            className="bg-gray-50 border border-gray-200 rounded p-3"
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 grid grid-cols-4 gap-2">
                                {/* Material Type */}
                                <div className="col-span-2">
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Material
                                  </label>
                                  <select
                                    value={material.materialType}
                                    onChange={(e) =>
                                      handleUpdateMaterial(
                                        demoRoom.roomId,
                                        material.id,
                                        'materialType',
                                        e.target.value
                                      )
                                    }
                                    className="input-field text-sm"
                                  >
                                    {commonDemoMaterials.map((mat) => (
                                      <option key={mat} value={mat}>
                                        {mat}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Quantity */}
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    value={material.quantity || ''}
                                    onChange={(e) =>
                                      handleUpdateMaterial(
                                        demoRoom.roomId,
                                        material.id,
                                        'quantity',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="input-field text-sm"
                                    min="0"
                                    step="0.1"
                                  />
                                </div>

                                {/* Unit */}
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Unit
                                  </label>
                                  <select
                                    value={material.unit}
                                    onChange={(e) =>
                                      handleUpdateMaterial(
                                        demoRoom.roomId,
                                        material.id,
                                        'unit',
                                        e.target.value
                                      )
                                    }
                                    className="input-field text-sm"
                                  >
                                    <option value="sqft">sqft</option>
                                    <option value="linear-ft">linear-ft</option>
                                    <option value="each">each</option>
                                  </select>
                                </div>

                                {/* Notes */}
                                <div className="col-span-4">
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Notes (optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={material.notes}
                                    onChange={(e) =>
                                      handleUpdateMaterial(
                                        demoRoom.roomId,
                                        material.id,
                                        'notes',
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g., Water-damaged only"
                                    className="input-field text-sm"
                                  />
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  handleRemoveMaterial(demoRoom.roomId, material.id)
                                }
                                className="text-red-600 hover:bg-red-50 p-1 rounded mt-5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Demo Photos
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {demoRoom.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Demo photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded border-2 border-green-500"
                          />
                          <div className="absolute top-1 right-1 bg-green-500 text-white p-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                          </div>
                        </div>
                      ))}
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-gray-300 border-dashed rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center">
                          {isUploading ? (
                            <Upload className="w-6 h-6 text-gray-400 animate-bounce" />
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-gray-400" />
                              <p className="text-xs text-gray-500 mt-1">Add Photo</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(demoRoom.roomId, file);
                          }}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Room Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Notes (optional)
                    </label>
                    <textarea
                      value={demoRoom.notes}
                      onChange={(e) =>
                        handleUpdateRoomField(demoRoom.roomId, 'notes', e.target.value)
                      }
                      placeholder="Additional notes about demo work in this room..."
                      className="input-field text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completion Status */}
          {demoRooms.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Partial demo documented for {demoRooms.length} room(s) • Total time:{' '}
                  {getTotalTime()} minutes
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Skip Message */}
      {!demoPerformed && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-700">
              No partial demo work performed during install — proceeding with equipment
              setup only
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
