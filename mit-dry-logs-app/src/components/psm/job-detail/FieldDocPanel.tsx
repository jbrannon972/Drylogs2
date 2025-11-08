import React from 'react';
import { Job } from '../../../types';
import {
  CheckCircle,
  Circle,
  AlertCircle,
  Camera,
  Droplets,
  Package,
  Hammer,
  Clock,
} from 'lucide-react';

interface FieldDocPanelProps {
  job: Job;
}

export const FieldDocPanel: React.FC<FieldDocPanelProps> = ({ job }) => {
  const { workflowPhases, psmData } = job;

  // Calculate documentation completeness
  const photoCount = job.rooms.reduce((sum, room) => sum + room.photos.length, 0);
  const moistureReadingCount = job.rooms.reduce(
    (sum, room) => sum + room.moistureReadings.length,
    0
  );
  const equipmentCount =
    (job.equipment.chambers.reduce((sum, chamber) => {
      return (
        sum +
        chamber.dehumidifiers.length +
        chamber.airMovers.length +
        chamber.airScrubbers.length
      );
    }, 0));

  const demoPerformed =
    workflowPhases.demo.status === 'completed' ||
    workflowPhases.install.partialDemoPerformed;

  const checklist = psmData?.documentationReview.checklist;
  const redFlags = psmData?.redFlags.filter(f => !f.resolved) || [];

  return (
    <div className="space-y-4">
      {/* Workflow Progress */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Workflow Progress</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {workflowPhases.install.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : workflowPhases.install.status === 'in-progress' ? (
              <Clock className="w-5 h-5 text-blue-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Install</p>
              <p className="text-xs text-gray-500">
                {workflowPhases.install.completedAt
                  ? new Date(workflowPhases.install.completedAt.toDate()).toLocaleDateString()
                  : 'Pending'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {workflowPhases.demo.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : workflowPhases.demo.status === 'in-progress' ? (
              <Clock className="w-5 h-5 text-blue-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Demo</p>
              <p className="text-xs text-gray-500">
                {workflowPhases.demo.completedAt
                  ? new Date(workflowPhases.demo.completedAt.toDate()).toLocaleDateString()
                  : workflowPhases.demo.scheduledDate
                  ? `Scheduled: ${new Date(workflowPhases.demo.scheduledDate.toDate()).toLocaleDateString()}`
                  : 'Not scheduled'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {workflowPhases.checkService.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : workflowPhases.checkService.status === 'in-progress' ? (
              <Clock className="w-5 h-5 text-blue-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Check Service</p>
              <p className="text-xs text-gray-500">
                {workflowPhases.checkService.visits.length} visit
                {workflowPhases.checkService.visits.length !== 1 ? 's' : ''} completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {workflowPhases.pull.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : workflowPhases.pull.status === 'in-progress' ? (
              <Clock className="w-5 h-5 text-blue-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pull</p>
              <p className="text-xs text-gray-500">
                {workflowPhases.pull.completedAt
                  ? new Date(workflowPhases.pull.completedAt.toDate()).toLocaleDateString()
                  : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Completeness */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Documentation</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {checklist?.allRoomsPhotographed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className="text-sm text-gray-700">Photos</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{photoCount} total</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {checklist?.moistureReadingsComplete ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className="text-sm text-gray-700">Moisture Readings</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {moistureReadingCount} readings
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {checklist?.equipmentScanned ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className="text-sm text-gray-700">Equipment Scanned</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{equipmentCount} items</span>
          </div>

          {demoPerformed && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {checklist?.demoDocumented ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
                <span className="text-sm text-gray-700">Demo Documentation</span>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {checklist?.customerSignatures ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className="text-sm text-gray-700">Customer Signatures</span>
            </div>
            {checklist?.customerSignatures ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {checklist?.matterportCompleted ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className="text-sm text-gray-700">Matterport Scan</span>
            </div>
            {job.documentation.matterportScan.completed ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300" />
            )}
          </div>
        </div>

        {psmData?.documentationReview.missingItems &&
          psmData.documentationReview.missingItems.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700 mb-1">Missing Items:</p>
              <ul className="text-xs text-red-600 space-y-1">
                {psmData.documentationReview.missingItems.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Red Flags ({redFlags.length})
          </h3>
          <div className="space-y-3">
            {redFlags.map(flag => (
              <div
                key={flag.id}
                className={`p-3 rounded-lg border ${
                  flag.severity === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : flag.severity === 'high'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className={`w-4 h-4 mt-0.5 ${
                      flag.severity === 'critical'
                        ? 'text-red-600'
                        : flag.severity === 'high'
                        ? 'text-orange-600'
                        : 'text-yellow-600'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">{flag.type.replace(/-/g, ' ')}</p>
                    <p className="text-xs text-gray-700 mt-1">{flag.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
