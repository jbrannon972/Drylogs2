import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useJobsStore } from '../../../stores/jobsStore';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../shared/Button';
import { WorkflowActionBar } from '../../shared/WorkflowActionBar';
import {
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Camera,
  Hammer,
  Eye,
  Droplets,
  Trash2,
  Shield,
  Wind,
  X
} from 'lucide-react';
import { DemoStep } from '../../../types/workflow';

// Import step components
import { DemoClockInStep } from './demo/DemoClockInStep';
import { PreDemoPhotosStep } from './demo/PreDemoPhotosStep';
import { DemoExecutionStep } from './demo/DemoExecutionStep';
import { ExposedMaterialsStep } from './demo/ExposedMaterialsStep';
import { PostDemoReadingsStep } from './demo/PostDemoReadingsStep';
import { DebrisDisposalStep } from './demo/DebrisDisposalStep';
import { PPESuppliesStep } from './demo/PPESuppliesStep';
import { PostDemoPhotosStep } from './demo/PostDemoPhotosStep';
import { DemoEquipmentAdjustStep } from './demo/DemoEquipmentAdjustStep';
import { DemoCompleteStep } from './demo/DemoCompleteStep';

interface StepConfig {
  id: DemoStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
}

const DEMO_STEPS: StepConfig[] = [
  {
    id: 'clock-in',
    title: 'Clock In',
    description: 'Arrival & team setup',
    icon: <Clock className="w-5 h-5" />,
    component: DemoClockInStep,
  },
  {
    id: 'pre-demo-photos',
    title: 'Pre-Demo Photos',
    description: 'Before state documentation',
    icon: <Camera className="w-5 h-5" />,
    component: PreDemoPhotosStep,
  },
  {
    id: 'demo-execution',
    title: 'Demo Execution',
    description: 'Room-by-room demolition tracking',
    icon: <Hammer className="w-5 h-5" />,
    component: DemoExecutionStep,
  },
  {
    id: 'exposed-materials',
    title: 'Exposed Materials',
    description: 'Assess newly exposed areas',
    icon: <Eye className="w-5 h-5" />,
    component: ExposedMaterialsStep,
  },
  {
    id: 'post-demo-readings',
    title: 'Post-Demo Readings',
    description: 'Moisture on exposed materials',
    icon: <Droplets className="w-5 h-5" />,
    component: PostDemoReadingsStep,
  },
  {
    id: 'debris-disposal',
    title: 'Debris & Disposal',
    description: 'Document waste removal',
    icon: <Trash2 className="w-5 h-5" />,
    component: DebrisDisposalStep,
  },
  {
    id: 'ppe-supplies',
    title: 'PPE & Supplies',
    description: 'Track safety equipment used',
    icon: <Shield className="w-5 h-5" />,
    component: PPESuppliesStep,
  },
  {
    id: 'post-demo-photos',
    title: 'Post-Demo Photos',
    description: 'After state documentation',
    icon: <Camera className="w-5 h-5" />,
    component: PostDemoPhotosStep,
  },
  {
    id: 'equipment-adjust',
    title: 'Equipment Adjustment',
    description: 'Add/remove/reposition equipment',
    icon: <Wind className="w-5 h-5" />,
    component: DemoEquipmentAdjustStep,
  },
  {
    id: 'complete',
    title: 'Complete Demo',
    description: 'Clock out & finalize',
    icon: <CheckCircle className="w-5 h-5" />,
    component: DemoCompleteStep,
  },
];

export const DemoWorkflow: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { demoStep, setDemoStep, startWorkflow } = useWorkflowStore();
  const { getJobById } = useJobsStore();
  const [job, setJob] = useState<any>(null);
  const [showStepOverview, setShowStepOverview] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId && user) {
      startWorkflow('demo', jobId, user.uid);
      const jobData = getJobById(jobId);
      setJob(jobData);
    }
  }, [jobId, user, startWorkflow, getJobById]);

  useEffect(() => {
    if (contentRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [demoStep]);

  const currentStepIndex = DEMO_STEPS.findIndex(s => s.id === demoStep);
  const currentStepConfig = DEMO_STEPS[currentStepIndex];
  const StepComponent = currentStepConfig?.component;

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setDemoStep(DEMO_STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setDemoStep(DEMO_STEPS[currentStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: DemoStep) => {
    setDemoStep(stepId);
    setShowStepOverview(false);
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Progress will be saved.')) {
      navigate('/tech');
    }
  };

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

  const progressPercent = Math.round(((currentStepIndex + 1) / DEMO_STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ULTRAFIELD CONDENSED HEADER - 48px */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-3 py-2 flex items-center justify-between">
          {/* Left: Logo + Step info - CLICKABLE for menu */}
          <div
            className="flex-1 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => setShowStepOverview(!showStepOverview)}
          >
            <div className="flex items-center gap-2 text-sm">
              <img src="/Elogo.png" alt="Entrusted" className="h-6 w-auto" />
              <span className="text-gray-400">•</span>
              <span className="text-gray-700">Step {currentStepIndex + 1}/{DEMO_STEPS.length}</span>
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
          {StepComponent && <StepComponent job={job} onNext={handleNext} />}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <WorkflowActionBar
        jobId={job.jobId}
        currentStep={currentStepConfig.id}
        currentStepIndex={currentStepIndex}
        totalSteps={DEMO_STEPS.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoBack={currentStepIndex > 0}
        canGoForward={currentStepIndex < DEMO_STEPS.length - 1}
      />

      {/* STEP OVERVIEW MODAL */}
      {showStepOverview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-poppins font-bold text-gray-900">
                Demo Workflow Overview
              </h3>
              <button
                onClick={() => setShowStepOverview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {DEMO_STEPS.map((step, index) => {
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
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
                  {currentStepIndex} of {DEMO_STEPS.length} steps completed
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setShowStepOverview(false)}
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
