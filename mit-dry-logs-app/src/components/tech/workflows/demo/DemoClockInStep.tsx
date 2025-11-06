import React, { useState } from 'react';
import { Clock, Users, Info } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface DemoClockInStepProps {
  job: any;
  onNext: () => void;
}

export const DemoClockInStep: React.FC<DemoClockInStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const [arrivalTime, setArrivalTime] = useState(`${hours}:${minutes}`);
  const [techCount, setTechCount] = useState(1);
  const [leadTech, setLeadTech] = useState('');

  React.useEffect(() => {
    updateWorkflowData('demo', {
      arrivalTime,
      techCount,
      leadTech,
      startTimestamp: new Date().toISOString(),
    });
  }, [arrivalTime, techCount, leadTech]);

  const isAfterHours = () => {
    const hour = parseInt(arrivalTime.split(':')[0]);
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return hour >= 17 || isWeekend;
  };

  return (
    <div className="space-y-6">
      {/* Job Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Demo Day Start</h4>
            <p className="text-sm text-blue-800">
              Clock in and document your demo crew. All demolition quantities will be tracked room-by-room.
            </p>
          </div>
        </div>
      </div>

      {/* Clock In */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Arrival Time *
        </label>
        <Input
          type="time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
        />
        {isAfterHours() && (
          <p className="text-sm text-orange-600 mt-1 font-medium">
            ⏰ After-hours service detected (premium rate applies)
          </p>
        )}
      </div>

      {/* Team Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Technicians *
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTechCount(Math.max(1, techCount - 1))}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            −
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">{techCount}</span>
          </div>
          <button
            onClick={() => setTechCount(techCount + 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      {/* Lead Tech */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lead Technician Name *
        </label>
        <Input
          type="text"
          value={leadTech}
          onChange={(e) => setLeadTech(e.target.value)}
          placeholder="Enter lead tech name"
        />
      </div>

      {/* Review Demo Plan */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Planned Demolition</h3>
        {job.rooms && job.rooms.length > 0 ? (
          <ul className="space-y-2">
            {job.rooms
              .filter((r: any) => r.affectedStatus === 'affected')
              .map((room: any) => (
                <li key={room.roomId} className="text-sm text-gray-700">
                  • {room.roomName}: Demo planned
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No rooms documented yet</p>
        )}
      </div>
    </div>
  );
};
