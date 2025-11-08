import React, { useState } from 'react';
import { Hammer, CheckCircle, Info, Camera } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';

interface DemoExecutionStepProps {
  job: any;
  onNext: () => void;
}

interface DemoItem {
  material: string;
  planned: number;
  actual: number;
  unit: string;
  photo?: string;
}

export const DemoExecutionStep: React.FC<DemoExecutionStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const [selectedRoom, setSelectedRoom] = useState('');
  const [demoData, setDemoData] = useState<Record<string, DemoItem[]>>({});

  const affectedRooms = Array.isArray(job?.rooms) ? job.rooms.filter((r: any) => r.affectedStatus === 'affected') : [];
  const currentRoom = affectedRooms.find((r: any) => r.roomId === selectedRoom);

  // Initialize demo items from Install plan
  React.useEffect(() => {
    if (selectedRoom && !demoData[selectedRoom]) {
      // Create demo checklist from affected materials
      const room = affectedRooms.find((r: any) => r.roomId === selectedRoom);
      if (room?.affectedAreas) {
        const items: DemoItem[] = [
          { material: 'Carpet', planned: room.affectedAreas.floor?.affectedSqFt || 0, actual: 0, unit: 'SF' },
          { material: 'Pad', planned: room.affectedAreas.floor?.affectedSqFt || 0, actual: 0, unit: 'SF' },
          { material: 'Baseboard', planned: (room.dimensions.length + room.dimensions.width) * 2, actual: 0, unit: 'LF' },
          { material: 'Drywall (2ft cut)', planned: (room.dimensions.length + room.dimensions.width) * 2, actual: 0, unit: 'LF' },
          { material: 'Insulation', planned: room.affectedAreas.walls?.affectedSqFt || 0, actual: 0, unit: 'SF' },
        ].filter(item => item.planned > 0);
        setDemoData(prev => ({ ...prev, [selectedRoom]: items }));
      }
    }
  }, [selectedRoom, affectedRooms]);

  const updateDemoItem = (itemIndex: number, actual: number) => {
    if (!selectedRoom) return;
    const items = [...(demoData[selectedRoom] || [])];
    items[itemIndex] = { ...items[itemIndex], actual };
    setDemoData(prev => ({ ...prev, [selectedRoom]: items }));
    updateWorkflowData('demo', { demoQuantities: { ...demoData, [selectedRoom]: items } });
  };

  const handlePhotoUpload = async (itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user && selectedRoom) {
      const room = affectedRooms.find((r: any) => r.roomId === selectedRoom);
      const url = await uploadPhoto(file, job.jobId, room.roomName, 'demo', user.uid);
      if (url) {
        const items = [...(demoData[selectedRoom] || [])];
        items[itemIndex] = { ...items[itemIndex], photo: url };
        setDemoData(prev => ({ ...prev, [selectedRoom]: items }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Demo Tracking</h4>
            <p className="text-sm text-blue-800">
              Track ACTUAL quantities removed for each material. Take a photo after removing each material type.
            </p>
          </div>
        </div>
      </div>

      {/* Room Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Room *
        </label>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:outline-none"
        >
          <option value="">Choose a room...</option>
          {affectedRooms.map((room: any) => (
            <option key={room.roomId} value={room.roomId}>
              {room.roomName}
            </option>
          ))}
        </select>
      </div>

      {/* Demo Checklist */}
      {selectedRoom && currentRoom && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            {currentRoom.roomName} - Demo Checklist
          </h3>
          {demoData[selectedRoom]?.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{item.material}</h4>
                {item.actual > 0 && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-xs text-gray-600">Planned</label>
                  <p className="text-lg font-semibold">{item.planned} {item.unit}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Actual Removed *</label>
                  <Input
                    type="number"
                    value={item.actual}
                    onChange={(e) => updateDemoItem(idx, parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              {item.actual > 0 && (
                <div className="border-t pt-3 mt-3">
                  {item.photo ? (
                    <div>
                      <img src={item.photo} alt={item.material} className="h-32 rounded mb-2" />
                      <p className="text-sm text-green-600">✓ Photo taken</p>
                    </div>
                  ) : (
                    <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handlePhotoUpload(idx, e)}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {isUploading ? 'Uploading...' : 'Photo After Removal'}
                    </label>
                  )}
                </div>
              )}
              {Math.abs(item.actual - item.planned) > item.planned * 0.1 && item.actual > 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Variance: {((item.actual - item.planned) / item.planned * 100).toFixed(0)}% from plan
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
