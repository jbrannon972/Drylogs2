import React, { useState } from 'react';
import { Job } from '../../../types';
import {
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  Plus,
  User,
  DollarSign,
} from 'lucide-react';

interface PSMActionsPanelProps {
  job: Job;
}

export const PSMActionsPanel: React.FC<PSMActionsPanelProps> = ({ job }) => {
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const psmData = job.psmData;
  const adjusterComms = psmData?.adjusterCommunications || [];
  const homeownerComms = psmData?.homeownerCommunications || [];
  const approvalStatus = psmData?.approvalStatus;

  return (
    <div className="space-y-4">
      {/* PSM Workflow Status */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-4">PSM Workflow</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                psmData?.psmPhase.status === 'field-complete'
                  ? 'bg-yellow-100 text-yellow-700'
                  : psmData?.psmPhase.status === 'reviewing'
                  ? 'bg-blue-100 text-blue-700'
                  : psmData?.psmPhase.status === 'awaiting-adjuster'
                  ? 'bg-orange-100 text-orange-700'
                  : psmData?.psmPhase.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {psmData?.psmPhase.status?.replace(/-/g, ' ') || 'New'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned PSM</p>
            <p className="font-medium text-gray-900">{psmData?.psmPhase.assignedPSM || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Days in Phase</p>
            <p className="font-medium text-gray-900">{psmData?.psmPhase.daysInPhase || 0} days</p>
          </div>
        </div>
        <button className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
          ✓ Mark Ready for Adjuster
        </button>
      </div>

      {/* Adjuster Contact */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Adjuster Contact</h3>
        <div className="space-y-2 text-sm mb-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium text-gray-900">{job.insuranceInfo.adjusterName}</p>
          </div>
          <div>
            <p className="text-gray-600">Company</p>
            <p className="font-medium text-gray-900">{job.insuranceInfo.carrierName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <p className="text-gray-900">{job.insuranceInfo.adjusterPhone}</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <p className="text-gray-900 break-all">{job.insuranceInfo.adjusterEmail}</p>
          </div>
        </div>

        {adjusterComms.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Last Contact</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-gray-600">
                  {new Date(adjusterComms[0].timestamp.toDate()).toLocaleDateString()}
                </p>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-gray-600 capitalize">
                  {adjusterComms[0].communicationType}
                </p>
              </div>
              <p className="text-sm text-gray-700">{adjusterComms[0].summary}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={() => setShowCommunicationModal(true)}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Communication
          </button>
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Send Email
          </button>
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Callback
          </button>
        </div>
      </div>

      {/* Approval Status */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Approval Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Equipment Plan</span>
            {approvalStatus?.equipmentPlan === 'approved' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : approvalStatus?.equipmentPlan === 'denied' ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Clock className="w-5 h-5 text-orange-500" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Demo Scope</span>
            {approvalStatus?.demoScope === 'approved' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : approvalStatus?.demoScope === 'denied' ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : approvalStatus?.demoScope === 'partial' ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-orange-700">Partial</span>
                <Circle className="w-5 h-5 text-orange-500" />
              </div>
            ) : (
              <Clock className="w-5 h-5 text-orange-500" />
            )}
          </div>
          {approvalStatus?.demoAmount && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Requested:</span>
                <span className="font-medium text-gray-900">
                  ${approvalStatus.demoAmount.requested.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Approved:</span>
                <span className="font-medium text-green-700">
                  ${approvalStatus.demoAmount.approved.toLocaleString()}
                </span>
              </div>
              {approvalStatus.demoAmount.deniedAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Denied:</span>
                  <span className="font-medium text-red-700">
                    ${approvalStatus.demoAmount.deniedAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowApprovalModal(true)}
          className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Update Approval Status
        </button>
      </div>

      {/* Homeowner Status */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Homeowner Status</h3>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <p className="font-medium text-gray-900">{job.customerInfo.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <p className="text-gray-900">{job.customerInfo.phoneNumber}</p>
          </div>
        </div>

        {homeownerComms.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Last Contact</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">
                {new Date(homeownerComms[0].timestamp.toDate()).toLocaleDateString()} •{' '}
                {homeownerComms[0].method}
              </p>
              <p className="text-xs text-gray-700">
                Topics: {homeownerComms[0].topicsDiscussed.join(', ')}
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Payment Status</p>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Deductible Due:</span>
            <span className="font-bold text-blue-900">
              ${job.insuranceInfo.deductible.toLocaleString()}
            </span>
          </div>
        </div>

        <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Log Communication
        </button>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">Review all documentation</p>
              <p className="text-xs text-gray-500">Ensure completeness</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">Contact adjuster with scope</p>
              <p className="text-xs text-gray-500">Present findings</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">Generate invoice</p>
              <p className="text-xs text-gray-500">After approval</p>
            </div>
          </div>
        </div>
        <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>
    </div>
  );
};
