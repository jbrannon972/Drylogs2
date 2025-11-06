import React, { useState } from 'react';
import { Clock, Shield, Info, AlertTriangle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface StartPullStepProps {
  job: any;
  onNext: () => void;
}

export const StartPullStep: React.FC<StartPullStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const [arrivalTime, setArrivalTime] = useState(`${hours}:${minutes}`);
  const [techCount, setTechCount] = useState(1);
  const [leadTech, setLeadTech] = useState('');
  const [leadApprovalName, setLeadApprovalName] = useState('');
  const [leadApprovalTime, setLeadApprovalTime] = useState('');
  const [hasLeadApproval, setHasLeadApproval] = useState(false);

  React.useEffect(() => {
    updateWorkflowData('pull', {
      arrivalTime,
      techCount,
      leadTech,
      leadApproval: hasLeadApproval ? {
        approvedBy: leadApprovalName,
        approvalTime: leadApprovalTime,
        timestamp: new Date().toISOString(),
      } : null,
      startTimestamp: new Date().toISOString(),
    });
  }, [arrivalTime, techCount, leadTech, hasLeadApproval, leadApprovalName, leadApprovalTime]);

  const isAfterHours = () => {
    const hour = parseInt(arrivalTime.split(':')[0]);
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return hour >= 17 || isWeekend;
  };

  const daysSinceDrying = () => {
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
            <h4 className="font-medium text-blue-900 mb-1">Equipment Pull - Job Completion</h4>
            <p className="text-sm text-blue-800">
              Final step of the restoration process. MIT Lead approval is REQUIRED before removing any equipment.
            </p>
          </div>
        </div>
      </div>

      {/* MIT Lead Approval Requirement */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">⚠️ MIT Lead Approval Required</h4>
            <p className="text-sm text-red-800">
              Equipment cannot be removed without MIT Lead verification that all materials are dry. This protects against premature pulls and callbacks.
            </p>
          </div>
        </div>
      </div>

      {/* Job Summary */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Job Summary</h3>
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
            <label className="text-xs text-gray-600">Days Drying</label>
            <p className="font-medium text-entrusted-orange">{daysSinceDrying()} days</p>
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
          <p className="text-sm text-orange-600 mt-1 font-medium">
            ⏰ After-hours pull (premium rate applies)
          </p>
        )}
      </div>

      {/* Tech Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Techs On Site *
        </label>
        <Input
          type="number"
          value={techCount}
          onChange={(e) => setTechCount(parseInt(e.target.value) || 1)}
          min={1}
        />
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
          placeholder="Enter name"
        />
      </div>

      {/* MIT Lead Approval */}
      <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
        <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          MIT Lead Approval
        </h3>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasLeadApproval}
              onChange={(e) => setHasLeadApproval(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-gray-900">
              MIT Lead has approved equipment pull
            </span>
          </label>
        </div>

        {hasLeadApproval && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MIT Lead Name *
              </label>
              <Input
                type="text"
                value={leadApprovalName}
                onChange={(e) => setLeadApprovalName(e.target.value)}
                placeholder="Name of MIT Lead who approved"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Time *
              </label>
              <Input
                type="time"
                value={leadApprovalTime}
                onChange={(e) => setLeadApprovalTime(e.target.value)}
              />
            </div>
          </div>
        )}

        {!hasLeadApproval && (
          <div className="bg-white border border-red-200 rounded p-3 mt-3">
            <p className="text-sm text-red-800">
              <strong>Important:</strong> Contact MIT Lead to verify final moisture readings before proceeding. Premature pulls can result in callbacks and lost revenue.
            </p>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Pre-Pull Checklist</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>MIT Lead has approved based on final moisture readings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>All materials are below 12% moisture (IICRC standard)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Customer has been notified of today's pull</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Paperwork (CoS, DRW if needed) is ready for signatures</span>
          </li>
        </ul>
      </div>

      {!hasLeadApproval && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              You must obtain MIT Lead approval before proceeding with the equipment pull.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
