import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Info } from 'lucide-react';
import { PullStep } from '../../../types/workflow';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useJobsStore } from '../../../stores/jobsStore';
import { Button } from '../../shared/Button';
import { StartPullStep } from './pull/StartPullStep';
import { FinalVerificationStep } from './pull/FinalVerificationStep';
import { EquipmentRemovalStep } from './pull/EquipmentRemovalStep';
import { PullFinalPhotosStep } from './pull/PullFinalPhotosStep';
import { CustomerPaperworkStep } from './pull/CustomerPaperworkStep';
import { PaymentCollectionStep } from './pull/PaymentCollectionStep';
import { MatterportVerifyStep } from './pull/MatterportVerifyStep';
import { PullCompleteStep } from './pull/PullCompleteStep';

interface StepConfig {
  id: PullStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<{ job: any; onNext: () => void }>;
}

const PULL_STEPS: StepConfig[] = [
  {
    id: 'start-pull',
    title: 'Start Pull',
    description: 'Clock in & MIT Lead approval',
    icon: <CheckCircle className="w-5 h-5" />,
    component: StartPullStep,
  },
  {
    id: 'final-verification',
    title: 'Final Verification',
    description: 'Confirm all materials < 12% moisture',
    icon: <CheckCircle className="w-5 h-5" />,
    component: FinalVerificationStep,
  },
  {
    id: 'equipment-removal',
    title: 'Equipment Removal',
    description: 'Remove & scan all equipment',
    icon: <CheckCircle className="w-5 h-5" />,
    component: EquipmentRemovalStep,
  },
  {
    id: 'final-photos',
    title: 'Final Photos',
    description: 'Document dry conditions',
    icon: <CheckCircle className="w-5 h-5" />,
    component: PullFinalPhotosStep,
  },
  {
    id: 'customer-paperwork',
    title: 'Customer Paperwork',
    description: 'Signatures & DRW if needed',
    icon: <CheckCircle className="w-5 h-5" />,
    component: CustomerPaperworkStep,
  },
  {
    id: 'payment-collection',
    title: 'Payment Collection',
    description: 'Collect payment if cash job',
    icon: <CheckCircle className="w-5 h-5" />,
    component: PaymentCollectionStep,
  },
  {
    id: 'matterport-verify',
    title: 'Matterport Verify',
    description: 'Confirm 3D scan completed',
    icon: <CheckCircle className="w-5 h-5" />,
    component: MatterportVerifyStep,
  },
  {
    id: 'complete',
    title: 'Complete Job',
    description: 'Final summary & clock out',
    icon: <CheckCircle className="w-5 h-5" />,
    component: PullCompleteStep,
  },
];

export const PullWorkflow: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { pullStep, setPullStep, startWorkflow } = useWorkflowStore();
  const { getJobById } = useJobsStore();
  const [job, setJob] = useState<any>(null);
  const [showOverview, setShowOverview] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId) {
      startWorkflow('pull', jobId);
      const jobData = getJobById(jobId);
      setJob(jobData);
    }
  }, [jobId]);

  useEffect(() => {
    if (contentRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pullStep]);

  const currentStepIndex = PULL_STEPS.findIndex(s => s.id === pullStep);
  const currentStepConfig = PULL_STEPS[currentStepIndex];
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
    if (currentStepIndex < PULL_STEPS.length - 1) {
      setPullStep(PULL_STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setPullStep(PULL_STEPS[currentStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: PullStep) => {
    setPullStep(stepId);
    setShowOverview(false);
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Progress will be saved.')) {
      navigate('/tech');
    }
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / PULL_STEPS.length) * 100);

  if (showOverview) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Pull Workflow</h1>
          <p className="text-gray-600">
            Final verification and equipment removal to complete the water damage restoration job
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Job Completion Process</h4>
              <p className="text-sm text-blue-800">
                This workflow ensures all materials are dry, equipment is properly removed and tracked, customer paperwork is complete, and the job is ready for final invoicing.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {PULL_STEPS.map((step, index) => (
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
            setPullStep('start-pull');
          }}
          className="w-full mt-6 btn-primary py-4 text-lg font-semibold"
        >
          Start Equipment Pull
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
          Step {currentStepIndex + 1} of {PULL_STEPS.length}: {currentStepConfig.title}
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
          disabled={currentStepIndex === PULL_STEPS.length - 1}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {PULL_STEPS.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setPullStep(step.id)}
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
