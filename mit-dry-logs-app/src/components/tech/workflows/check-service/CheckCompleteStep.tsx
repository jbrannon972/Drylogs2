import React, { useState } from 'react';
import { CheckCircle, Clock, Calendar, Info } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { useNavigate } from 'react-router-dom';

interface CheckCompleteStepProps {
  job: any;
  onNext: () => void;
}

export const CheckCompleteStep: React.FC<CheckCompleteStepProps> = ({ job, onNext }) => {
  const { checkServiceData, updateWorkflowData } = useWorkflowStore();
  const navigate = useNavigate();
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const [departureTime, setDepartureTime] = useState(`${hours}:${minutes}`);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  React.useEffect(() => {
    updateWorkflowData('checkService', {
      departureTime,
      endTimestamp: new Date().toISOString(),
    });
  }, [departureTime]);

  const calculateDuration = () => {
    if (!checkServiceData.startTimestamp) return '0:00';
    const start = new Date(checkServiceData.startTimestamp);
    const end = new Date();
    const diff = Math.abs(end.getTime() - start.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const isAfterHours = () => {
    const hour = parseInt(departureTime.split(':')[0]);
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return hour >= 17 || isWeekend;
  };

  const getDryingProgress = () => {
    const roomReadings = checkServiceData?.roomReadings || [];
    if (roomReadings.length === 0) return null;

    let totalReadings = 0;
    let dryReadings = 0;

    roomReadings.forEach((room: any) => {
      room.readings.forEach((reading: any) => {
        totalReadings++;
        if (reading.isDry) dryReadings++;
      });
    });

    const percentDry = totalReadings > 0 ? Math.round((dryReadings / totalReadings) * 100) : 0;
    return { totalReadings, dryReadings, percentDry };
  };

  const getEquipmentSummary = () => {
    const equipmentStatus = checkServiceData?.equipmentStatus || [];
    const adjustments = checkServiceData?.equipmentAdjustments || [];

    const operational = equipmentStatus.filter((e: any) => e.status === 'operational').length;
    const issues = equipmentStatus.filter((e: any) => e.status === 'issue' || e.status === 'offline').length;
    const added = adjustments.filter((a: any) => a.action === 'add').length;
    const removed = adjustments.filter((a: any) => a.action === 'remove').length;

    return { operational, issues, added, removed };
  };

  const handleComplete = () => {
    setShowCompleteConfirm(true);
  };

  const confirmComplete = () => {
    // Save all data to job record
    navigate('/tech');
  };

  const progress = getDryingProgress();
  const equipment = getEquipmentSummary();
  const assessment = checkServiceData?.dryingAssessment;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">Check Service Complete!</h4>
            <p className="text-sm text-green-800">
              Review your visit summary and clock out. All data has been saved for customer records and billing.
            </p>
          </div>
        </div>
      </div>

      {/* Departure Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Departure Time *
        </label>
        <Input
          type="time"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
        />
        {isAfterHours() && (
          <p className="text-sm text-orange-600 mt-1 font-medium">
            ⏰ After-hours service (premium rate applies)
          </p>
        )}
      </div>

      {/* Visit Summary */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Visit Summary</h3>

        {/* Time Tracking */}
        <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200">
          <div>
            <label className="text-xs text-gray-600">Visit #</label>
            <p className="font-medium">{checkServiceData.visitNumber || 1}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Time On Site</label>
            <p className="font-medium text-entrusted-orange">{calculateDuration()}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Technician</label>
            <p className="font-medium">{checkServiceData.techName || 'N/A'}</p>
          </div>
        </div>

        {/* Environmental Conditions */}
        {checkServiceData.environmental && (
          <div className="pb-4 border-b border-gray-200">
            <label className="text-xs text-gray-600 block mb-2">Environmental Conditions</label>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-700">
                  Outside: {checkServiceData.environmental.outsideTemp}°F / {checkServiceData.environmental.outsideHumidity}% RH
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  {checkServiceData.environmental.referenceRoom}: {checkServiceData.environmental.referenceTemp}°F / {checkServiceData.environmental.referenceHumidity}% RH
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Drying Progress */}
        {progress && (
          <div className="pb-4 border-b border-gray-200">
            <label className="text-xs text-gray-600 block mb-2">Drying Progress</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${progress.percentDry}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{progress.percentDry}%</p>
                <p className="text-xs text-gray-600">{progress.dryReadings}/{progress.totalReadings} dry</p>
              </div>
            </div>
          </div>
        )}

        {/* Drying Assessment */}
        {assessment && (
          <div className="pb-4 border-b border-gray-200">
            <label className="text-xs text-gray-600 block mb-2">Estimated Completion</label>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {assessment.estimatedDaysRemaining} {assessment.estimatedDaysRemaining === 1 ? 'day' : 'days'} remaining
                </p>
                {assessment.notes && (
                  <p className="text-sm text-gray-600 mt-1">{assessment.notes}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Equipment Status */}
        <div className="pb-4 border-b border-gray-200">
          <label className="text-xs text-gray-600 block mb-2">Equipment Status</label>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-green-600 font-medium">✓ {equipment.operational} Operational</p>
              {equipment.issues > 0 && (
                <p className="text-red-600 font-medium">⚠ {equipment.issues} Issues</p>
              )}
            </div>
            <div>
              {equipment.added > 0 && (
                <p className="text-blue-600">+ {equipment.added} Added</p>
              )}
              {equipment.removed > 0 && (
                <p className="text-gray-600">− {equipment.removed} Removed</p>
              )}
            </div>
          </div>
        </div>

        {/* Moisture Readings Count */}
        {progress && (
          <div>
            <label className="text-xs text-gray-600 block mb-1">Documentation</label>
            <p className="text-sm text-gray-700">
              • {progress.totalReadings} moisture readings recorded
            </p>
            <p className="text-sm text-gray-700">
              • Environmental baseline documented
            </p>
            {equipment.operational > 0 && (
              <p className="text-sm text-gray-700">
                • {equipment.operational} equipment units verified
              </p>
            )}
          </div>
        )}
      </div>

      {/* Next Steps */}
      {progress && progress.percentDry === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">✓ Ready for Equipment Pull!</h4>
          <p className="text-sm text-green-800">
            All materials are dry. Schedule the Pull workflow to remove equipment and complete the job.
          </p>
        </div>
      )}

      {progress && progress.percentDry < 100 && assessment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Continue Monitoring</h4>
          <p className="text-sm text-blue-800">
            Next visit should be tomorrow. Expected dry date: {assessment.estimatedDaysRemaining} days from today.
          </p>
        </div>
      )}

      {/* Data Capture Confirmation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-700">
          <span className="font-medium">Drylog Data:</span> All visit data has been captured automatically and will be included in the final job documentation for insurance and customer records.
        </p>
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        className="w-full btn-primary py-4 text-lg font-semibold"
      >
        <Clock className="w-5 h-5 inline mr-2" />
        Clock Out & Complete Visit
      </button>

      {/* Complete Confirmation Modal */}
      <ConfirmModal
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        onConfirm={confirmComplete}
        title="Complete Check Service?"
        message="Complete check service and return to dashboard?"
        confirmText="Complete"
        variant="info"
      />
    </div>
  );
};
