import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useJobsStore } from '../../../stores/jobsStore';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../shared/Button';
import { WorkflowActionBar } from '../../shared/WorkflowActionBar';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { ConfirmModal } from '../../shared/ConfirmModal';
import {
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
  Home,
  Camera,
  Ruler,
  Droplets,
  Wind,
  ClipboardCheck,
  Layers,
  Calendar,
  X
} from 'lucide-react';
import { InstallStep } from '../../../types/workflow';

// Import step components
import { OfficePreparationStep } from './install/OfficePreparationStep';
import { ArrivalStep } from './install/ArrivalStep';
import { FrontDoorStep } from './install/FrontDoorStep';
import { CauseOfLossStep } from './install/CauseOfLossStep';
import { RoomAssessmentStep } from './install/RoomAssessmentStep';
import { DefineChambersStep } from './install/DefineChambersStep';
import { PlanJobStep } from './install/PlanJobStep';
import { PartialDemoStep } from './install/PartialDemoStep';
import { ScheduleWorkStep } from './install/ScheduleWorkStep';
import { EquipmentCalcStep } from './install/EquipmentCalcStep';
import { GeneralBillablesStep } from './install/GeneralBillablesStep';
import {
  EquipmentPlaceStep,
  CommunicatePlanStep,
  FinalPhotosStep,
  CompleteStep,
} from './install/StubSteps';

interface StepConfig {
  id: InstallStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
}

const INSTALL_STEPS: StepConfig[] = [
  {
    id: 'office-prep',
    title: 'Office Preparation',
    description: 'Pre-departure prep (optional)',
    icon: <ClipboardCheck className="w-5 h-5" />,
    component: OfficePreparationStep,
  },
  {
    id: 'arrival',
    title: 'Property Arrival',
    description: 'Clock in and document arrival',
    icon: <Home className="w-5 h-5" />,
    component: ArrivalStep,
  },
  {
    id: 'front-door',
    title: 'Customer Introduction',
    description: 'Ground rules and walkthrough',
    icon: <ClipboardCheck className="w-5 h-5" />,
    component: FrontDoorStep,
  },
  {
    id: 'cause-of-loss',
    title: 'Cause of Loss',
    description: 'Source + water category',
    icon: <Droplets className="w-5 h-5" />,
    component: CauseOfLossStep,
  },
  {
    id: 'room-assessment',
    title: 'Room Assessment',
    description: 'Dimensions, moisture, materials & pre-existing damage',
    icon: <Ruler className="w-5 h-5" />,
    component: RoomAssessmentStep,
  },
  {
    id: 'define-chambers',
    title: 'Define Drying Chambers',
    description: 'Group rooms into drying zones',
    icon: <Wind className="w-5 h-5" />,
    component: DefineChambersStep,
  },
  {
    id: 'plan-job',
    title: 'Plan the Job',
    description: 'Set drying class and timeline',
    icon: <ClipboardCheck className="w-5 h-5" />,
    component: PlanJobStep,
  },
  {
    id: 'partial-demo',
    title: 'Partial Demo',
    description: 'Demo work during install (optional)',
    icon: <Layers className="w-5 h-5" />,
    component: PartialDemoStep,
  },
  {
    id: 'schedule-work',
    title: 'Schedule Work',
    description: 'Plan Day 2+ (demo, checks, pull)',
    icon: <Calendar className="w-5 h-5" />,
    component: ScheduleWorkStep,
  },
  {
    id: 'equipment-calc',
    title: 'Equipment Calculation',
    description: 'IICRC per-room calculations',
    icon: <Wind className="w-5 h-5" />,
    component: EquipmentCalcStep,
  },
  {
    id: 'equipment-place',
    title: 'Equipment Placement',
    description: 'Place and scan by room',
    icon: <Wind className="w-5 h-5" />,
    component: EquipmentPlaceStep,
  },
  {
    id: 'general-billables',
    title: 'Additional Billable Work',
    description: 'Log additional services performed',
    icon: <ClipboardCheck className="w-5 h-5" />,
    component: GeneralBillablesStep,
  },
  {
    id: 'communicate-plan',
    title: 'Communicate Plan',
    description: 'Review with customer',
    icon: <ClipboardCheck className="w-5 h-5" />,
    component: CommunicatePlanStep,
  },
  {
    id: 'final-photos',
    title: 'Final Photos',
    description: 'Document setup',
    icon: <Camera className="w-5 h-5" />,
    component: FinalPhotosStep,
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Finalize and depart',
    icon: <CheckCircle className="w-5 h-5" />,
    component: CompleteStep,
  },
];

export const InstallWorkflow: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { installStep, setInstallStep, startWorkflow, progress, saveWorkflowData, installData } = useWorkflowStore();
  const { getJobById } = useJobsStore();
  const [job, setJob] = useState<any>(null);
  const [showStepOverview, setShowStepOverview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId && user) {
      startWorkflow('install', jobId, user.uid);
      const jobData = getJobById(jobId);
      setJob(jobData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, user]);

  // Auto-scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [installStep]);

  const currentStepIndex = INSTALL_STEPS.findIndex(s => s.id === installStep);
  const currentStepConfig = INSTALL_STEPS[currentStepIndex];
  const StepComponent = currentStepConfig?.component;

  // ULTRAFAULT: Track render count to detect infinite loops
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`🔄 InstallWorkflow render #${renderCountRef.current} - Step: ${currentStepConfig?.title || 'unknown'}`);

    if (renderCountRef.current > 50) {
      console.error('🔥 INFINITE LOOP DETECTED - Too many renders!');
      console.error('Current step:', currentStepConfig?.title);
      console.error('Step ID:', installStep);
    }
  });

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      await saveWorkflowData();

      // After successful save, move to next step
      if (currentStepIndex < INSTALL_STEPS.length - 1) {
        setInstallStep(INSTALL_STEPS[currentStepIndex + 1].id);
      }
    } catch (error) {
      console.error('Error saving workflow data:', error);
      setShowSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setInstallStep(INSTALL_STEPS[currentStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: InstallStep) => {
    setInstallStep(stepId);
    setShowStepOverview(false);
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate('/tech');
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

  const progressPercent = Math.round(((currentStepIndex + 1) / INSTALL_STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ULTRAFIELD CONDENSED HEADER - 48px */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-3 py-2 flex items-center justify-between">
          {/* Left: Logo + Step info */}
          <div
            className="flex-1 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => setShowStepOverview(!showStepOverview)}
          >
            <div className="flex items-center gap-2 text-sm">
              {/* Logo */}
              <img
                src="/Elogo.png"
                alt="Entrusted"
                className="h-6 w-auto"
              />
              <span className="text-gray-400">•</span>
              <span className="text-gray-900 font-medium">
                {currentStepIndex + 1}/{INSTALL_STEPS.length}
              </span>
            </div>
            {/* Progress bar - thin */}
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
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm ml-3"
          >
            Exit
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - SINGLE STEP ONLY */}
      <div ref={contentRef} className="container mx-auto px-4 py-6 max-w-4xl">
        {/* NO DUPLICATE HEADER - Just the step content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-24">
          {/* Step Content with Error Boundary */}
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error('🔥 Step component crashed:', currentStepConfig?.title);
              console.error('Error:', error);
              console.error('Error info:', errorInfo);
            }}
          >
            {StepComponent && <StepComponent job={job} />}
          </ErrorBoundary>
        </div>
      </div>

      {/* ULTRAFIELD ACTION BAR - Fixed Bottom */}
      <WorkflowActionBar
        jobId={job.jobId}
        currentStep={currentStepConfig.id}
        currentStepIndex={currentStepIndex}
        totalSteps={INSTALL_STEPS.length}
        currentRoom={installData.rooms?.[0]?.name} // Pass current room context if available
        onPrevious={handlePrevious}
        onNext={handleSaveAndContinue}
        canGoBack={currentStepIndex > 0 && !isSaving}
        canGoForward={currentStepIndex < INSTALL_STEPS.length - 1 && !isSaving}
      />

      {/* STEP OVERVIEW MODAL */}
      {showStepOverview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-poppins font-bold text-gray-900">
                Workflow Overview
              </h3>
              <button
                onClick={() => setShowStepOverview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {INSTALL_STEPS.map((step, index) => {
                  const isActive = step.id === installStep;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;

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

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {currentStepIndex} of {INSTALL_STEPS.length} steps completed
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

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={confirmExit}
        title="Exit Workflow?"
        message="Make sure to save your progress before exiting. Unsaved changes will be lost."
        confirmText="Exit"
        cancelText="Stay"
        variant="warning"
      />

      {/* Save Error Modal */}
      <ConfirmModal
        isOpen={showSaveError}
        onClose={() => setShowSaveError(false)}
        onConfirm={() => setShowSaveError(false)}
        title="Save Failed"
        message="Unable to save your progress. Please check your connection and try again."
        confirmText="OK"
        cancelText="Close"
        variant="danger"
      />
    </div>
  );
};
