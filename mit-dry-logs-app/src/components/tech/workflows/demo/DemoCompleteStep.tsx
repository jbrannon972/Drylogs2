import React, { useState } from 'react';
import { CheckCircle, Clock, Info } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { useNavigate } from 'react-router-dom';

interface DemoCompleteStepProps {
  job: any;
  onNext: () => void;
}

export const DemoCompleteStep: React.FC<DemoCompleteStepProps> = ({ job, onNext }) => {
  const { demoData, updateWorkflowData } = useWorkflowStore();
  const navigate = useNavigate();
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const [endTime, setEndTime] = useState(`${hours}:${minutes}`);

  React.useEffect(() => {
    updateWorkflowData('demo', {
      endTime,
      endTimestamp: new Date().toISOString(),
    });
  }, [endTime]);

  const calculateDuration = () => {
    if (!demoData.startTimestamp) return '0:00';
    const start = new Date(demoData.startTimestamp);
    const end = new Date();
    const diff = Math.abs(end.getTime() - start.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const isAfterHours = () => {
    const hour = parseInt(endTime.split(':')[0]);
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return hour >= 17 || isWeekend;
  };

  const handleComplete = () => {
    // Save final data and navigate back
    if (confirm('Complete demo and return to dashboard?')) {
      navigate('/tech');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">Demo Day Complete!</h4>
            <p className="text-sm text-green-800">
              Review your work summary and clock out. All data has been saved for billing.
            </p>
          </div>
        </div>
      </div>

      {/* End Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Departure Time *
        </label>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        {isAfterHours() && (
          <p className="text-sm text-orange-600 mt-1 font-medium">
            ⏰ After-hours service (premium rate applies)
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Demo Summary</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600">Arrival</label>
            <p className="font-medium">{demoData.arrivalTime || '--:--'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Departure</label>
            <p className="font-medium">{endTime}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Total Time</label>
            <p className="font-medium text-entrusted-orange">{calculateDuration()}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Tech Count</label>
            <p className="font-medium">{demoData.techCount || 1}</p>
          </div>
        </div>

        {demoData.demoQuantities && (
          <div>
            <label className="text-xs text-gray-600 block mb-2">Demolition Completed</label>
            <div className="bg-gray-50 p-3 rounded text-sm">
              {Object.keys(demoData.demoQuantities).length} room(s) processed
            </div>
          </div>
        )}

        {demoData.debris && (
          <div>
            <label className="text-xs text-gray-600 block mb-2">Debris Removal</label>
            <div className="bg-gray-50 p-3 rounded text-sm">
              {demoData.debris.truckLoads > 0 && <p>• Truck loads: {demoData.debris.truckLoads}</p>}
              {demoData.debris.dumpsterBags > 0 && <p>• Dumpster bags: {demoData.debris.dumpsterBags}</p>}
              {demoData.debris.largeDumpster && <p>• Large dumpster used</p>}
            </div>
          </div>
        )}
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        className="w-full btn-primary py-4 text-lg font-semibold"
      >
        Clock Out & Complete Demo
      </button>
    </div>
  );
};
