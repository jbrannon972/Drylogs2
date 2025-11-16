import React from 'react';
import { X, DollarSign } from 'lucide-react';
import { GeneralBillablesStep } from '../../tech/workflows/install/GeneralBillablesStep';
import { useJobsStore } from '../../../stores/jobsStore';

interface GeneralBillablesModalProps {
  jobId: string;
  onClose: () => void;
}

export const GeneralBillablesModal: React.FC<GeneralBillablesModalProps> = ({
  jobId,
  onClose,
}) => {
  const { jobs } = useJobsStore();
  const job = jobs.find(j => j.jobId === jobId);

  if (!job) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal - Full Screen on Mobile */}
      <div className="relative bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-lg shadow-2xl flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-entrusted-orange to-orange-500 md:rounded-t-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-white" />
            <h2 className="text-lg font-bold text-white">General Billables</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Quick Action Mode:</strong> Log billable work on-the-fly without leaving your current workflow step.
              Changes are saved automatically to your install workflow.
            </p>
          </div>

          <GeneralBillablesStep job={job} />
        </div>

        {/* Footer - Fixed */}
        <div className="flex gap-3 p-4 border-t bg-gray-50 md:rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-entrusted-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
