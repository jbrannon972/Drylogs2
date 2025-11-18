import React, { useState } from 'react';
import { Button } from '../../../shared/Button';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { useNavigate } from 'react-router-dom';
import { jobsService } from '../../../../services/firebase/jobsService';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../../../hooks/useAuth';

interface CompleteInstallStepProps {
  job: any;
  onNext: () => void;
}

export const CompleteInstallStep: React.FC<CompleteInstallStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData, completeWorkflow, saveWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const now = new Date();
  const defaultTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const [departureTime, setDepartureTime] = useState(installData.departureTime || defaultTime);
  const [techNotes, setTechNotes] = useState(installData.completionNotes || '');

  // Validate all required steps
  const validateWorkflow = (): string[] => {
    const errors: string[] = [];

    // Check rooms assessed
    const rooms = installData.rooms || installData.roomAssessments || [];
    if (rooms.length === 0) {
      errors.push('No rooms have been assessed');
    } else {
      // Check each room has minimum 4 photos
      rooms.forEach((room: any) => {
        const photoCount = room.overallPhotos?.length || 0;
        if (photoCount < 4) {
          errors.push(`Room "${room.name}" needs ${4 - photoCount} more photo(s) (minimum 4 required)`);
        }
      });
    }

    // Check chambers defined
    const chambers = installData.chambers || [];
    if (chambers.length === 0) {
      errors.push('No drying chambers have been defined');
    }

    // Check equipment calculations
    if (!installData.equipmentCalculations || !installData.equipmentCalculations.total) {
      errors.push('Equipment has not been calculated');
    }

    // Check equipment placement (WARNING ONLY - not required)
    // Equipment is recommended but workflow can complete without it

    // Check cause of loss documented
    if (!installData.causeOfLoss || !installData.causeOfLoss.type) {
      errors.push('Cause of loss has not been documented');
    }

    return errors;
  };

  const handleComplete = async () => {
    if (!user) {
      alert('Error: User not authenticated');
      return;
    }

    // Validate workflow
    const errors = validateWorkflow();

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidation(true);
      return;
    }

    try {
      // 1. Update completion data in Zustand store
      await updateWorkflowData('install', {
        departureTime,
        completionNotes: techNotes,
        completedAt: new Date().toISOString(),
        workflowStatus: 'completed',
      });

      // 2. CRITICAL: Save workflow data to Firebase
      await saveWorkflowData();
      console.log('✅ Workflow data saved to Firebase');

      // 3. CRITICAL: Update job phases to mark install as completed
      await jobsService.updateJob(
        job.jobId,
        {
          workflowPhases: {
            ...job.workflowPhases,
            install: {
              ...job.workflowPhases.install,
              status: 'completed',
              completedAt: Timestamp.now(),
            },
          },
        } as any,
        user.uid
      );
      console.log('✅ Job phases updated - install marked as completed');

      // 4. Clean up local state and return to dashboard
      completeWorkflow();
      alert('✅ Install workflow completed successfully!');
      navigate('/tech');
    } catch (error) {
      console.error('❌ Error completing workflow:', error);
      alert('Error completing workflow. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Job Information Summary */}
      <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Job Information
        </h3>

        <div className="grid grid-cols-1 gap-3 text-sm">
          {/* Customer Info */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Customer</p>
            <p className="font-medium text-gray-900">
              {job.customerName || job.firstName && job.lastName ? `${job.firstName} ${job.lastName}` : 'Not provided'}
            </p>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Property Address</p>
            <p className="text-gray-900">
              {job.address || job.street ? (
                <>
                  {job.street && <>{job.street}<br /></>}
                  {job.city && job.state && job.zip ? `${job.city}, ${job.state} ${job.zip}` : 'Address incomplete'}
                </>
              ) : 'Not provided'}
            </p>
          </div>

          {/* Contact Info */}
          {(job.phone || job.email) && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Contact</p>
              <div className="space-y-1">
                {job.phone && <p className="text-gray-900">📞 {job.phone}</p>}
                {job.email && <p className="text-gray-900">✉️ {job.email}</p>}
              </div>
            </div>
          )}

          {/* Job Details */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Job Details</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Job ID:</span>
                <span className="font-medium text-gray-900">{job.jobId || 'Not set'}</span>
              </div>
              {job.claimNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Claim #:</span>
                  <span className="font-medium text-gray-900">{job.claimNumber}</span>
                </div>
              )}
              {job.insuranceCompany && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance:</span>
                  <span className="font-medium text-gray-900">{job.insuranceCompany}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Job Type:</span>
                <span className="font-medium text-gray-900">{job.jobType || 'Water Damage'}</span>
              </div>
              {job.dateOfLoss && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Loss:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(job.dateOfLoss).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cause of Loss Summary */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Loss Information</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Cause of Loss:</span>
                <span className="font-medium text-gray-900">
                  {installData.causeOfLoss?.type || 'Not documented'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water Category:</span>
                <span className={`font-medium ${
                  installData.causeOfLoss?.waterCategory === 'Category 3' ? 'text-red-600' :
                  installData.causeOfLoss?.waterCategory === 'Category 2' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {installData.causeOfLoss?.waterCategory || 'Not documented'}
                </span>
              </div>
              {installData.overallDamageClass && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Damage Class:</span>
                  <span className="font-medium text-gray-900">
                    Class {installData.overallDamageClass}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Summary */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Workflow Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Rooms Assessed:</span>
                <span className="font-medium text-gray-900">
                  {(installData.rooms || installData.roomAssessments || []).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Drying Chambers:</span>
                <span className="font-medium text-gray-900">
                  {(installData.chambers || []).length}
                </span>
              </div>
              {installData.equipmentCalculations?.total && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dehumidifiers:</span>
                    <span className="font-medium text-gray-900">
                      {installData.equipmentCalculations.total.dehumidifiers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Air Movers:</span>
                    <span className="font-medium text-gray-900">
                      {installData.equipmentCalculations.total.airMovers || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Form */}
      <div className="border rounded-lg p-3 bg-white">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Completion Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Time
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tech Notes (Optional)
            </label>
            <textarea
              value={techNotes}
              onChange={(e) => setTechNotes(e.target.value)}
              rows={4}
              placeholder="Any additional notes about the install..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {showValidation && validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900 mb-2">Cannot Complete Workflow</h4>
              <p className="text-sm text-red-800 mb-2">
                Please complete the following required steps:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
              <p className="text-sm text-red-700 mt-2 font-medium">
                Use the workflow overview (tap header) to navigate to missing steps.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {showValidation && validationErrors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">All Steps Complete!</h4>
              <p className="text-sm text-green-800">Ready to finalize workflow</p>
            </div>
          </div>
        </div>
      )}

      {/* Complete Button */}
      <Button
        variant="primary"
        onClick={handleComplete}
        className="w-full py-4 text-lg font-semibold"
      >
        Complete Install Workflow
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Completing will save all data and return to the dashboard
      </p>
    </div>
  );
};
