import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Info, Circle, X } from 'lucide-react';
import { PullStep } from '../../../types/workflow';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useJobsStore } from '../../../stores/jobsStore';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../shared/Button';
import { WorkflowActionBar } from '../../shared/WorkflowActionBar';
import { StartPullStep } from './pull/StartPullStep';
import { FinalMoistureVerification } from './pull/FinalMoistureVerification';
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
    title: 'Final Moisture Verification',
    description: 'Verify all tracked materials are dry',
    icon: <CheckCircle className="w-5 h-5" />,
    component: FinalMoistureVerification,
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
  const { user } = useAuth();
  const { pullStep, setPullStep, startWorkflow } = useWorkflowStore();
  const { getJobById } = useJobsStore();
  const [job, setJob] = useState<any>(null);
  const [showOverview, setShowOverview] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId && user) {
      startWorkflow('pull', jobId, user.uid);
      const jobData = getJobById(jobId);
      setJob(jobData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, user]);

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ULTRAFIELD CONDENSED HEADER - 48px */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-3 py-2 flex items-center justify-between">
          {/* Left: Logo + Step info - CLICKABLE for menu */}
          <div
            className="flex-1 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => setShowOverview(!showOverview)}
          >
            <div className="flex items-center gap-2 text-sm">
              <img src="/Elogo.png" alt="Entrusted" className="h-6 w-auto" />
              <span className="text-gray-400">•</span>
              <span className="text-gray-700">Step {currentStepIndex + 1}/{PULL_STEPS.length}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-900 font-medium truncate">{currentStepConfig.title}</span>
            </div>
            {/* Thin progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div
                className="bg-entrusted-orange h-1 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Exit button */}
          <button
            onClick={handleExit}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm ml-3"
          >
            Exit
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div ref={contentRef} className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-24">
          {CurrentStepComponent && <CurrentStepComponent job={job} onNext={handleNext} />}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <WorkflowActionBar
        jobId={job.jobId}
        currentStep={currentStepConfig.id}
        currentStepIndex={currentStepIndex}
        totalSteps={PULL_STEPS.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoBack={currentStepIndex > 0}
        canGoForward={currentStepIndex < PULL_STEPS.length - 1}
      />

      {/* STEP OVERVIEW MODAL */}
      {showOverview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-poppins font-bold text-gray-900">
                Equipment Pull Workflow Overview
              </h3>
              <button
                onClick={() => setShowOverview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {PULL_STEPS.map((step, index) => {
                  const isCurrent = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(step.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all border-2 ${
                        isCurrent
                          ? 'border-entrusted-orange bg-orange-50'
                          : isCompleted
                          ? 'border-green-200 bg-green-50 hover:bg-green-100'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : isCurrent ? (
                            <div className="w-6 h-6 text-entrusted-orange">
                              {step.icon}
                            </div>
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500">
                              Step {index + 1}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-entrusted-orange text-white text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className={`font-medium ${
                            isCurrent ? 'text-entrusted-orange' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {step.description}
                          </p>
                        </div>
                        {!isCompleted && !isCurrent && (
                          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {currentStepIndex} of {PULL_STEPS.length} steps completed
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setShowOverview(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
