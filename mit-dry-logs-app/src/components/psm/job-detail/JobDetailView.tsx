import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobsStore } from '../../../stores/jobsStore';
import { ArrowLeft } from 'lucide-react';
import { FieldDocPanel } from './FieldDocPanel';
import { PresentationPanel } from './PresentationPanel';
import { PSMActionsPanel } from './PSMActionsPanel';

export const JobDetailView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJobById } = useJobsStore();

  const job = jobId ? getJobById(jobId) : null;

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Job not found</p>
          <button
            onClick={() => navigate('/psm')}
            className="mt-4 text-entrusted-orange hover:text-orange-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-full px-6 py-4">
          <button
            onClick={() => navigate('/psm')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-poppins font-bold text-gray-900">
                Job #{job.jobId}
              </h1>
              <p className="text-gray-600">
                {job.customerInfo.name} • {job.customerInfo.address}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {job.scheduledZone}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                job.psmData?.psmPhase.status === 'field-complete' ? 'bg-yellow-100 text-yellow-700' :
                job.psmData?.psmPhase.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                job.psmData?.psmPhase.status === 'awaiting-adjuster' ? 'bg-orange-100 text-orange-700' :
                job.psmData?.psmPhase.status === 'approved' ? 'bg-green-100 text-green-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {job.psmData?.psmPhase.status?.replace(/-/g, ' ') || 'New'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-12 gap-6 p-6 max-w-full">
        {/* Left Panel - Field Documentation (3 cols) */}
        <div className="col-span-3">
          <FieldDocPanel job={job} />
        </div>

        {/* Center Panel - Presentation View (6 cols) */}
        <div className="col-span-6">
          <PresentationPanel job={job} />
        </div>

        {/* Right Panel - PSM Actions (3 cols) */}
        <div className="col-span-3">
          <PSMActionsPanel job={job} />
        </div>
      </div>
    </div>
  );
};
