import React, { useState } from 'react';
import { Job, ApprovalStatus as ApprovalStatusType } from '../../../types';
import { CheckCircle, XCircle, Clock, DollarSign, AlertCircle } from 'lucide-react';

interface ApprovalTrackerProps {
  job: Job;
  onUpdate: (updates: Partial<Job['psmData']>) => void;
}

export const ApprovalTracker: React.FC<ApprovalTrackerProps> = ({ job, onUpdate }) => {
  const [editingDemo, setEditingDemo] = useState(false);
  const [demoAmount, setDemoAmount] = useState({
    requested: job.psmData?.approvalStatus.demoAmount.requested || 0,
    approved: job.psmData?.approvalStatus.demoAmount.approved || 0,
    denialReason: job.psmData?.approvalStatus.demoAmount.denialReason || '',
  });

  const approvalStatus = job.psmData?.approvalStatus;

  const getStatusIcon = (status: ApprovalStatusType | undefined) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ApprovalStatusType | undefined) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Approved</span>;
      case 'denied':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Denied</span>;
      case 'partial':
        return <span className={`${baseClasses} bg-orange-100 text-orange-700`}>Partial</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>Pending</span>;
    }
  };

  const handleDemoAmountSave = () => {
    const deniedAmount = demoAmount.requested - demoAmount.approved;
    onUpdate({
      approvalStatus: {
        ...approvalStatus!,
        demoScope: demoAmount.approved === demoAmount.requested ? 'approved' : 'partial',
        demoAmount: {
          requested: demoAmount.requested,
          approved: demoAmount.approved,
          deniedAmount,
          denialReason: demoAmount.denialReason,
        },
      },
    });
    setEditingDemo(false);
  };

  return (
    <div className="space-y-6">
      {/* Equipment Plan Approval */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Equipment Plan</h3>
          {getStatusBadge(approvalStatus?.equipmentPlan)}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-600">Dehumidifiers</p>
            <p className="font-medium text-gray-900">
              {job.equipment.chambers.reduce((sum, ch) => sum + ch.dehumidifiers.length, 0)} deployed
            </p>
            <p className="text-xs text-gray-500">
              IICRC: {job.equipment.calculations.recommendedDehumidifierCount}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Air Movers</p>
            <p className="font-medium text-gray-900">
              {job.equipment.chambers.reduce((sum, ch) => sum + ch.airMovers.length, 0)} deployed
            </p>
            <p className="text-xs text-gray-500">
              IICRC: {job.equipment.calculations.recommendedAirMoverCount}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Air Scrubbers</p>
            <p className="font-medium text-gray-900">
              {job.equipment.chambers.reduce((sum, ch) => sum + ch.airScrubbers.length, 0)} deployed
            </p>
            <p className="text-xs text-gray-500">
              IICRC: {job.equipment.calculations.recommendedAirScrubberCount}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              onUpdate({ approvalStatus: { ...approvalStatus!, equipmentPlan: 'approved' } })
            }
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            Approve
          </button>
          <button
            onClick={() =>
              onUpdate({ approvalStatus: { ...approvalStatus!, equipmentPlan: 'pending' } })
            }
            className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            Pending
          </button>
        </div>
      </div>

      {/* Demo Scope Approval */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Demo Scope</h3>
          {getStatusBadge(approvalStatus?.demoScope)}
        </div>

        {!editingDemo ? (
          <>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Requested Amount:</span>
                <span className="font-medium text-gray-900">
                  ${(approvalStatus?.demoAmount.requested || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Approved Amount:</span>
                <span className="font-medium text-green-700">
                  ${(approvalStatus?.demoAmount.approved || 0).toLocaleString()}
                </span>
              </div>
              {approvalStatus?.demoAmount.deniedAmount && approvalStatus.demoAmount.deniedAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Denied Amount:</span>
                    <span className="font-medium text-red-700">
                      ${approvalStatus.demoAmount.deniedAmount.toLocaleString()}
                    </span>
                  </div>
                  {approvalStatus.demoAmount.denialReason && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-700">
                        <span className="font-medium">Denial Reason:</span>{' '}
                        {approvalStatus.demoAmount.denialReason}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <button
              onClick={() => setEditingDemo(true)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Update Demo Approval
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Requested Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={demoAmount.requested}
                  onChange={e => setDemoAmount({ ...demoAmount, requested: Number(e.target.value) })}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Approved Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={demoAmount.approved}
                  onChange={e => setDemoAmount({ ...demoAmount, approved: Number(e.target.value) })}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
                />
              </div>
            </div>
            {demoAmount.approved < demoAmount.requested && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Denial Reason</label>
                <textarea
                  value={demoAmount.denialReason}
                  onChange={e => setDemoAmount({ ...demoAmount, denialReason: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
                  placeholder="Why was the full amount not approved?"
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingDemo(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDemoAmountSave}
                className="flex-1 px-4 py-2 bg-entrusted-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conditional Approvals */}
      {approvalStatus?.conditionalApprovals && approvalStatus.conditionalApprovals.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Conditional Approvals</h3>
          <div className="space-y-3">
            {approvalStatus.conditionalApprovals.map((conditional, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  conditional.conditionMet ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {conditional.conditionMet ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{conditional.item}</p>
                    <p className="text-xs text-gray-700 mt-1">
                      <span className="font-medium">Condition:</span> {conditional.condition}
                    </p>
                  </div>
                </div>
                {!conditional.conditionMet && (
                  <button
                    onClick={() => {
                      const updated = [...approvalStatus.conditionalApprovals];
                      updated[index] = { ...conditional, conditionMet: true };
                      onUpdate({
                        approvalStatus: {
                          ...approvalStatus,
                          conditionalApprovals: updated,
                        },
                      });
                    }}
                    className="w-full mt-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Mark Condition Met
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
