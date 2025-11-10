import React, { useState } from 'react';
import { Button } from '../../../shared/Button';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { useNavigate } from 'react-router-dom';

interface CompleteInstallStepProps {
  job: any;
  onNext: () => void;
}

export const CompleteInstallStep: React.FC<CompleteInstallStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData, completeWorkflow } = useWorkflowStore();
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

    // Check equipment placement
    const placedEquipment = installData.placedEquipment || [];
    if (placedEquipment.length === 0) {
      errors.push('No equipment has been placed');
    } else if (installData.equipmentCalculations?.total) {
      const calc = installData.equipmentCalculations.total;
      const placed = {
        dehumidifiers: placedEquipment.filter((e: any) => e.type === 'dehumidifier').length,
        airMovers: placedEquipment.filter((e: any) => e.type === 'air-mover').length,
        airScrubbers: placedEquipment.filter((e: any) => e.type === 'air-scrubber').length,
      };

      if (placed.dehumidifiers < calc.dehumidifiers) {
        errors.push(`Need ${calc.dehumidifiers - placed.dehumidifiers} more dehumidifier(s)`);
      }
      if (placed.airMovers < calc.airMovers) {
        errors.push(`Need ${calc.airMovers - placed.airMovers} more air mover(s)`);
      }
      if (placed.airScrubbers < calc.airScrubbers) {
        errors.push(`Need ${calc.airScrubbers - placed.airScrubbers} more air scrubber(s)`);
      }
    }

    // Check cause of loss documented
    if (!installData.waterClassification || !installData.waterClassification.source) {
      errors.push('Cause of loss has not been documented');
    }

    return errors;
  };

  const handleComplete = async () => {
    // Validate workflow
    const errors = validateWorkflow();

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidation(true);
      return;
    }

    // Save completion data
    await updateWorkflowData('install', {
      departureTime,
      completionNotes: techNotes,
      completedAt: new Date().toISOString(),
      workflowStatus: 'completed',
    });

    // Complete workflow and return to dashboard
    completeWorkflow();
    alert('✅ Install workflow completed successfully!');
    navigate('/tech');
  };

  return (
    <div className="space-y-6">
      {/* Completion Form */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900 mb-2">Cannot Complete Workflow</h4>
              <p className="text-sm text-red-800 mb-3">
                Please complete the following required steps:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
              <p className="text-sm text-red-700 mt-3 font-medium">
                Use the workflow overview (tap header) to navigate to missing steps.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {showValidation && validationErrors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
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
