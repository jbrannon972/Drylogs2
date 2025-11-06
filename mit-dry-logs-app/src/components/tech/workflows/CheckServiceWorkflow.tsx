import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Info } from 'lucide-react';
import { CheckServiceStep } from '../../../types/workflow';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useJobsStore } from '../../../stores/jobsStore';
import { Button } from '../../shared/Button';
import { StartVisitStep } from './check-service/StartVisitStep';
import { EnvironmentalCheckStep } from './check-service/EnvironmentalCheckStep';
import { RoomReadingsStep } from './check-service/RoomReadingsStep';
import { EquipmentStatusStep } from './check-service/EquipmentStatusStep';
import { DryingAssessmentStep } from './check-service/DryingAssessmentStep';
import { CheckEquipmentAdjustStep } from './check-service/CheckEquipmentAdjustStep';
import { CheckCompleteStep } from './check-service/CheckCompleteStep';

interface StepConfig {
  id: CheckServiceStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<{ job: any; onNext: () => void }>;
}

const CHECK_SERVICE_STEPS: StepConfig[] = [
  {
    id: 'start-visit',
    title: 'Start Visit',
    description: 'Clock in & visit tracking',
    icon: <CheckCircle className="w-5 h-5" />,
    component: StartVisitStep,
  },
  {
    id: 'environmental-check',
    title: 'Environmental Check',
    description: 'Outside & reference room conditions',
    icon: <CheckCircle className="w-5 h-5" />,
    component: EnvironmentalCheckStep,
  },
  {
    id: 'room-readings',
    title: 'Room Readings',
    description: 'Moisture readings per room',
    icon: <CheckCircle className="w-5 h-5" />,
    component: RoomReadingsStep,
  },
  {
    id: 'equipment-status',
    title: 'Equipment Status',
    description: 'Verify all equipment operational',
    icon: <CheckCircle className="w-5 h-5" />,
    component: EquipmentStatusStep,
  },
  {
    id: 'drying-assessment',
    title: 'Drying Assessment',
    description: 'Calculate days remaining',
    icon: <CheckCircle className="w-5 h-5" />,
    component: DryingAssessmentStep,
  },
  {
    id: 'equipment-adjust',
    title: 'Equipment Adjust',
    description: 'Add/remove equipment if needed',
    icon: <CheckCircle className="w-5 h-5" />,
    component: CheckEquipmentAdjustStep,
  },
  {
    id: 'complete',
    title: 'Complete Visit',
    description: 'Clock out & save data',
    icon: <CheckCircle className="w-5 h-5" />,
    component: CheckCompleteStep,
  },
];

export const CheckServiceWorkflow: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { checkServiceStep, setCheckServiceStep, startWorkflow } = useWorkflowStore();
  const { getJobById } = useJobsStore();
  const [job, setJob] = useState<any>(null);
  const [showOverview, setShowOverview] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId) {
      startWorkflow('check-service', jobId);
      const jobData = getJobById(jobId);
      setJob(jobData);
    }
  }, [jobId, startWorkflow, getJobById]);

  useEffect(() => {
    if (contentRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [checkServiceStep]);

  const currentStepIndex = CHECK_SERVICE_STEPS.findIndex(s => s.id === checkServiceStep);
  const currentStepConfig = CHECK_SERVICE_STEPS[currentStepIndex];
  const CurrentStepComponent = currentStepConfig?.component;

  if (!job || !currentStepConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-entrusted-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStepIndex < CHECK_SERVICE_STEPS.length - 1) {
      setCheckServiceStep(CHECK_SERVICE_STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCheckServiceStep(CHECK_SERVICE_STEPS[currentStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: CheckServiceStep) => {
    setCheckServiceStep(stepId);
    setShowOverview(false);
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Progress will be saved.')) {
      navigate('/tech');
    }
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / CHECK_SERVICE_STEPS.length) * 100);

  if (showOverview) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Service Workflow</h1>
          <p className="text-gray-600">
            Daily monitoring visit to track drying progress and equipment status
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Daily Monitoring Process</h4>
              <p className="text-sm text-blue-800">
                This workflow captures all data needed for insurance documentation and drying progress tracking.
                Complete all steps to ensure proper monitoring records.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {CHECK_SERVICE_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-entrusted-orange hover:bg-orange-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-700">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setShowOverview(false);
            setCheckServiceStep('start-visit');
          }}
          className="w-full mt-6 btn-primary py-4 text-lg font-semibold"
        >
          Start Check Service Visit
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setShowOverview(true)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Step {currentStepIndex + 1} of {CHECK_SERVICE_STEPS.length}: {currentStepConfig.title}
        </h1>
        <p className="text-gray-600">{currentStepConfig.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-entrusted-orange">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-entrusted-orange h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Component */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <CurrentStepComponent job={job} onNext={handleNext} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStepIndex === CHECK_SERVICE_STEPS.length - 1}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {CHECK_SERVICE_STEPS.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCheckServiceStep(step.id)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentStepIndex
                ? 'bg-entrusted-orange w-8'
                : index < currentStepIndex
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
            title={step.title}
          />
        ))}
      </div>
    </div>
  );
};
