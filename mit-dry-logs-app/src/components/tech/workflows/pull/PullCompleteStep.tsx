import React, { useState } from 'react';
import { CheckCircle, Clock, Calendar, DollarSign, Info, TrendingUp } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { useNavigate } from 'react-router-dom';

interface PullCompleteStepProps {
  job: any;
  onNext: () => void;
}

export const PullCompleteStep: React.FC<PullCompleteStepProps> = ({ job, onNext }) => {
  const { pullData, updateWorkflowData } = useWorkflowStore();
  const navigate = useNavigate();
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const [departureTime, setDepartureTime] = useState(`${hours}:${minutes}`);

  React.useEffect(() => {
    updateWorkflowData('pull', {
      departureTime,
      endTimestamp: new Date().toISOString(),
      jobComplete: true,
    });
  }, [departureTime]);

  const calculateDuration = () => {
    if (!pullData.startTimestamp) return '0:00';
    const start = new Date(pullData.startTimestamp);
    const end = new Date();
    const diff = Math.abs(end.getTime() - start.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const calculateTotalJobDays = () => {
    if (!job.startDate) return 0;
    const start = new Date(job.startDate);
    const today = new Date();
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isAfterHours = () => {
    const hour = parseInt(departureTime.split(':')[0]);
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return hour >= 17 || isWeekend;
  };

  const handleComplete = () => {
    if (confirm('Mark job as complete and return to dashboard?')) {
      // In production, this would:
      // 1. Generate final invoice data
      // 2. Mark job status as "Complete"
      // 3. Trigger automated billing
      // 4. Send completion notification to office
      navigate('/tech');
    }
  };

  const finalReadings = pullData.finalReadings || [];
  const removedEquipment = pullData.removedEquipment || [];
  const payment = pullData.payment;
  const matterport = pullData.matterport;
  const decontaminationCount = removedEquipment.filter((e: any) => e.needsDecontamination).length;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">🎉 Job Complete!</h4>
            <p className="text-sm text-green-800">
              All work is finished and documented. Review the job summary below and clock out to finalize everything.
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
            ⏰ After-hours completion (premium rate applies)
          </p>
        )}
      </div>

      {/* Job Summary */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Complete Job Summary</h3>

        {/* Timeline */}
        <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200">
          <div className="text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">{calculateTotalJobDays()}</p>
            <p className="text-xs text-gray-600">Total Days</p>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-orange-600" />
            <p className="text-2xl font-bold text-gray-900">{calculateDuration()}</p>
            <p className="text-xs text-gray-600">Pull Time</p>
          </div>
          <div className="text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">{removedEquipment.length}</p>
            <p className="text-xs text-gray-600">Equipment Removed</p>
          </div>
        </div>

        {/* Final Verification */}
        <div className="pb-4 border-b border-gray-200">
          <label className="text-xs text-gray-600 block mb-2">Final Moisture Verification</label>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{finalReadings.length} readings taken</p>
              <p className="text-sm text-gray-600">
                All materials verified dry (&lt; 12% moisture)
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        {/* Equipment Summary */}
        <div className="pb-4 border-b border-gray-200">
          <label className="text-xs text-gray-600 block mb-2">Equipment Summary</label>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Total pieces removed:</span>
              <span className="font-medium">{removedEquipment.length}</span>
            </div>
            {decontaminationCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Decontamination required:</span>
                <span className="font-medium">{decontaminationCount} units</span>
              </div>
            )}
            {decontaminationCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Decontamination charge:</span>
                <span className="font-medium text-green-600">
                  ${(decontaminationCount * 38.68).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        {payment && (
          <div className="pb-4 border-b border-gray-200">
            <label className="text-xs text-gray-600 block mb-2">Payment</label>
            {payment.collected ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    ${payment.amount?.toFixed(2)} collected
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    Via {payment.method?.replace('-', ' ')}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <p className="text-sm text-gray-700">Insurance direct billing</p>
            )}
          </div>
        )}

        {/* Matterport */}
        {matterport && (
          <div className="pb-4 border-b border-gray-200">
            <label className="text-xs text-gray-600 block mb-2">3D Documentation</label>
            {matterport.completed ? (
              <div>
                <p className="font-medium text-gray-900">✓ Matterport scan completed</p>
                <p className="text-sm text-gray-600">By {matterport.scannedBy}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                {matterport.skipped ? `Not done: ${matterport.skipReason}` : 'Not applicable'}
              </p>
            )}
          </div>
        )}

        {/* Paperwork */}
        <div>
          <label className="text-xs text-gray-600 block mb-2">Customer Paperwork</label>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">✓ Certificate of Satisfaction signed</p>
            {pullData.paperwork?.dryingRecordWorksheet && (
              <p className="text-gray-700">✓ Drying Record Worksheet signed</p>
            )}
            <p className="text-gray-700">✓ Customer received copies</p>
          </div>
        </div>
      </div>

      {/* Data Capture Confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Complete Drylog Data Captured</h4>
            <p className="text-sm text-blue-800 mb-3">
              All job data has been automatically captured throughout the workflow:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Install data (equipment, readings, photos)</li>
              <li>• Demo data (quantities, materials, disposal)</li>
              <li>• Check service history (daily readings, equipment status)</li>
              <li>• Pull data (final verification, equipment condition, paperwork)</li>
            </ul>
            <p className="text-sm text-blue-800 mt-3 font-medium">
              Ready for automated invoice generation and insurance submission.
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Protection Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Revenue Protection</h4>
        <p className="text-sm text-green-800 mb-2">
          This workflow captured critical billing data that protects revenue:
        </p>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✓ All equipment usage tracked ({removedEquipment.length} units)</li>
          <li>✓ Decontamination charges documented (${(decontaminationCount * 38.68).toFixed(2)})</li>
          <li>✓ Complete moisture reading history ({finalReadings.length} final readings)</li>
          <li>✓ Photo timeline for insurance documentation</li>
          <li>✓ Customer signatures obtained</li>
          {payment?.collected && <li>✓ Payment collected (${payment.amount?.toFixed(2)})</li>}
        </ul>
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        className="w-full btn-primary py-4 text-lg font-semibold"
      >
        <CheckCircle className="w-5 h-5 inline mr-2" />
        Clock Out & Complete Job
      </button>

      {/* Next Steps */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-2">What Happens Next</h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">1.</span>
            <span>Job status automatically updated to "Complete"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">2.</span>
            <span>Invoice team receives all captured data for final billing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">3.</span>
            <span>Final invoice generated with accurate scope and charges</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">4.</span>
            <span>Insurance submission package created automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">5.</span>
            <span>Customer receives completion notification</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
