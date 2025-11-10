import React from 'react';
import { Button } from '../../../shared/Button';
import {
  CheckCircle, Calendar, Wind, Droplets, AlertCircle, Info
} from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface CommunicatePlanStepProps {
  job: any;
  onNext: () => void;
}

export const CommunicatePlanStep: React.FC<CommunicatePlanStepProps> = ({ job, onNext }) => {
  const { installData } = useWorkflowStore();

  // Get data from workflow
  const rooms = installData.rooms || installData.roomAssessments || [];
  const chambers = installData.chambers || [];
  const equipmentCalc = installData.equipmentCalculations;
  const placedEquipment = installData.placedEquipment || [];
  const scheduledVisits = installData.scheduledVisits || [];
  const dryingPlan = installData.dryingPlan || {};
  const waterClassification = installData.waterClassification || {};

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Review Plan Before Departing</h4>
            <p className="text-sm text-blue-800">
              Review the work completed and plan for future visits.
              This is for tech review only - plan is not sent to customer.
            </p>
          </div>
        </div>
      </div>

      {/* Job Information */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Job Information
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Customer:</span>
            <span className="ml-2 font-medium text-gray-900">{job.clientName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Address:</span>
            <span className="ml-2 font-medium text-gray-900">{job.address || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Cause of Loss:</span>
            <span className="ml-2 font-medium text-gray-900">
              {waterClassification.source || 'Not documented'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Water Category:</span>
            <span className="ml-2 font-medium text-gray-900">
              {waterClassification.category ? `Category ${waterClassification.category}` : 'Not classified'}
            </span>
          </div>
        </div>
      </div>

      {/* Rooms Assessed */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-3">
          Rooms Assessed ({rooms.length})
        </h3>
        {rooms.length === 0 ? (
          <p className="text-sm text-gray-600">No rooms assessed</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {rooms.map((room: any, idx: number) => (
              <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                <div className="font-medium text-gray-900">{room.name}</div>
                <div className="text-xs text-gray-600">
                  {room.length}' × {room.width}' × {room.height}'
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Equipment Placed */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-600" />
          Equipment Placed
        </h3>
        {equipmentCalc && equipmentCalc.total ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {placedEquipment.filter((e: any) => e.type === 'dehumidifier').length}
                </div>
                <div className="text-xs text-gray-600">Dehumidifiers</div>
                <div className="text-xs text-gray-500">
                  (Need: {equipmentCalc.total.dehumidifiers})
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {placedEquipment.filter((e: any) => e.type === 'air-mover').length}
                </div>
                <div className="text-xs text-gray-600">Air Movers</div>
                <div className="text-xs text-gray-500">
                  (Need: {equipmentCalc.total.airMovers})
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {placedEquipment.filter((e: any) => e.type === 'air-scrubber').length}
                </div>
                <div className="text-xs text-gray-600">Air Scrubbers</div>
                <div className="text-xs text-gray-500">
                  (Need: {equipmentCalc.total.airScrubbers})
                </div>
              </div>
            </div>

            {placedEquipment.length < (equipmentCalc.total.dehumidifiers + equipmentCalc.total.airMovers + equipmentCalc.total.airScrubbers) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    Not all calculated equipment has been placed. This may affect drying efficiency.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Equipment not calculated</p>
        )}
      </div>

      {/* Drying Timeline */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-3">
          Estimated Drying Timeline
        </h3>
        <div className="text-sm">
          <p className="text-gray-600 mb-2">
            Based on damage class{' '}
            {dryingPlan.overallClass ? (
              <span className="font-medium text-gray-900">
                Class {dryingPlan.overallClass}
              </span>
            ) : (
              <span className="text-gray-500">Not set</span>
            )}
          </p>
          <p>
            <span className="text-2xl font-bold text-gray-900">
              {dryingPlan.estimatedDays || scheduledVisits.length || 3}
            </span>
            <span className="text-gray-600 ml-2">days to dry</span>
          </p>
        </div>
      </div>

      {/* Scheduled Future Work */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Scheduled Future Work
        </h3>
        {scheduledVisits.length === 0 ? (
          <p className="text-sm text-gray-600">No future visits scheduled</p>
        ) : (
          <div className="space-y-2">
            {scheduledVisits.map((visit: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      Day {visit.day} - {visit.type === 'demo' ? '🔨 Demo Work' : visit.type === 'check' ? '📋 Check Service' : '📦 Equipment Pull'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {visit.date} • {visit.arrivalWindow} • {visit.estimatedHours}h • {visit.teamSize} tech(s)
                    </div>
                    {visit.notes && (
                      <div className="text-xs text-gray-500 mt-1">{visit.notes}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary / Next Steps */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">✅ Install Workflow Complete</h4>
        <div className="text-sm text-green-800 space-y-1">
          <p>• Equipment installed and running</p>
          <p>• Future work scheduled</p>
          <p>• Job ready for monitoring phase</p>
        </div>
        <p className="text-xs text-green-700 mt-3">
          <strong>Note:</strong> This plan is for tech review only. Use the PSM Dashboard to
          communicate with the customer.
        </p>
      </div>
    </div>
  );
};
