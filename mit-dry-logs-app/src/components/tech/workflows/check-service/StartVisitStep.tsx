import React, { useState } from 'react';
import { Clock, Info, AlertCircle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface StartVisitStepProps {
  job: any;
  onNext: () => void;
}

export const StartVisitStep: React.FC<StartVisitStepProps> = ({ job, onNext }) => {
  const { checkServiceData, updateWorkflowData } = useWorkflowStore();
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const [arrivalTime, setArrivalTime] = useState(`${hours}:${minutes}`);

  // Calculate visit number based on job start date
  const calculateVisitNumber = () => {
    if (!job.startDate) return 1;
    const start = new Date(job.startDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  };

  const [visitNumber, setVisitNumber] = useState(calculateVisitNumber());
  const [techName, setTechName] = useState('');

  React.useEffect(() => {
    updateWorkflowData('checkService', {
      arrivalTime,
      visitNumber,
      techName,
      visitDate: new Date().toISOString(),
      startTimestamp: new Date().toISOString(),
    });
  }, [arrivalTime, visitNumber, techName]);

  const isAfterHours = () => {
    const hour = parseInt(arrivalTime.split(':')[0]);
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return hour >= 17 || isWeekend;
  };

  const daysSinceStart = () => {
    if (!job.startDate) return 0;
    const start = new Date(job.startDate);
    const today = new Date();
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Daily Check Service</h4>
            <p className="text-sm text-blue-800">
              Clock in and document your monitoring visit. This data is required for insurance and customer billing.
            </p>
          </div>
        </div>
      </div>

      {/* Job Info Summary */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Job Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-xs text-gray-600">Job #</label>
            <p className="font-medium">{job.jobId}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Property</label>
            <p className="font-medium">{job.propertyAddress?.street || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Days Since Start</label>
            <p className="font-medium text-entrusted-orange">{daysSinceStart()} days</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Water Category</label>
            <p className="font-medium">{job.insuranceInfo?.categoryOfWater || 'Category 1'}</p>
          </div>
        </div>
      </div>

      {/* Arrival Time */}
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
          <div className="mt-2 flex items-center gap-2 text-orange-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm font-medium">
              After-hours visit (premium rate applies)
            </p>
          </div>
        )}
      </div>

      {/* Visit Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visit Number *
        </label>
        <Input
          type="number"
          value={visitNumber}
          onChange={(e) => setVisitNumber(parseInt(e.target.value) || 1)}
          min={1}
        />
        <p className="text-xs text-gray-500 mt-1">
          Auto-calculated based on days since job start. Adjust if needed.
        </p>
      </div>

      {/* Tech Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Technician Name *
        </label>
        <Input
          type="text"
          value={techName}
          onChange={(e) => setTechName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      {/* Expected Tasks */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Today's Tasks</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Record environmental conditions (outside + reference room)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Take moisture readings for all affected materials</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Verify all equipment is operational</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Calculate drying progress and days remaining</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Adjust equipment if needed (add/remove)</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
