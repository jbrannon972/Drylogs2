import React, { useState } from 'react';
import { Droplets, Info } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface PostDemoReadingsStepProps {
  job: any;
  onNext: () => void;
}

export const PostDemoReadingsStep: React.FC<PostDemoReadingsStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const [readings, setReadings] = useState<Record<string, any>>({});

  const affectedRooms = Array.isArray(job?.rooms) ? job.rooms.filter((r: any) => r.affectedStatus === 'affected') : [];

  const updateReading = (roomId: string, material: string, field: string, value: any) => {
    const roomData = readings[roomId] || {};
    const materialData = roomData[material] || {};
    const updated = {
      ...readings,
      [roomId]: {
        ...roomData,
        [material]: {
          ...materialData,
          [field]: value,
          timestamp: new Date().toISOString(),
          readingType: 'post-demo',
        },
      },
    };
    setReadings(updated);
    updateWorkflowData('demo', { postDemoReadings: updated });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Post-Demo Moisture Readings</h4>
            <p className="text-sm text-blue-800">
              Take readings on newly exposed materials. Compare to pre-demo readings to assess drying progress.
            </p>
          </div>
        </div>
      </div>

      {affectedRooms.map((room: any) => (
        <div key={room.roomId} className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">{room.roomName}</h3>
          <div className="space-y-4">
            {['Wood Framing', 'Subfloor', 'Concrete'].map((material) => (
              <div key={material} className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-900 mb-3">{material}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Moisture %</label>
                    <Input
                      type="number"
                      value={readings[room.roomId]?.[material]?.moisture || ''}
                      onChange={(e) =>
                        updateReading(room.roomId, material, 'moisture', parseFloat(e.target.value))
                      }
                      placeholder="0.0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Temp (°F)</label>
                    <Input
                      type="number"
                      value={readings[room.roomId]?.[material]?.temperature || ''}
                      onChange={(e) =>
                        updateReading(room.roomId, material, 'temperature', parseFloat(e.target.value))
                      }
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">RH %</label>
                    <Input
                      type="number"
                      value={readings[room.roomId]?.[material]?.humidity || ''}
                      onChange={(e) =>
                        updateReading(room.roomId, material, 'humidity', parseFloat(e.target.value))
                      }
                      placeholder="50"
                    />
                  </div>
                </div>
                {readings[room.roomId]?.[material]?.moisture > 12 && (
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ Still wet - requires continued drying
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
