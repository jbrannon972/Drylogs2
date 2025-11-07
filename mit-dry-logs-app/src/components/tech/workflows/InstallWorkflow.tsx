import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useJobsStore } from '../../../stores/jobsStore';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../shared/Button';
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
import { ArrivalStep } from './install/ArrivalStep';
import { FrontDoorStep } from './install/FrontDoorStep';
import { CauseOfLossStep } from './install/CauseOfLossStep';
import { AddRoomsStep } from './install/AddRoomsStep';
import { AffectedMaterialsStep } from './install/AffectedMaterialsStep';
import { MoistureMappingStep } from './install/MoistureMappingStep';
import { ScheduleWorkStep } from './install/ScheduleWorkStep';
import { EquipmentCalcStep } from './install/EquipmentCalcStep';
import {
  PreExistingStep,
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
    id: 'pre-existing',
    title: 'Pre-Existing Conditions',
    description: 'Document with photos',
    icon: <Camera className="w-5 h-5" />,
    component: PreExistingStep,
  },
  {
    id: 'cause-of-loss',
    title: 'Cause of Loss',
    description: 'Source + water category',
    icon: <Droplets className="w-5 h-5" />,
    component: CauseOfLossStep,
  },
  {
    id: 'add-rooms',
    title: 'Add Rooms',
    description: 'Measure and add all rooms',
    icon: <Ruler className="w-5 h-5" />,
    component: AddRoomsStep,
  },
  {
    id: 'moisture-mapping',
    title: 'Moisture Mapping',
    description: 'Readings + photos per room',
    icon: <Droplets className="w-5 h-5" />,
    component: MoistureMappingStep,
  },
  {
    id: 'affected-materials',
    title: 'Materials for Removal',
    description: 'Document materials to demo per room',
    icon: <Layers className="w-5 h-5" />,
    component: AffectedMaterialsStep,
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
  const { installStep, setInstallStep, startWorkflow, progress, saveWorkflowData } = useWorkflowStore();
  const { getJobById } = useJobsStore();
  const [job, setJob] = useState<any>(null);
  const [showStepOverview, setShowStepOverview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId && user) {
      startWorkflow('install', jobId, user.uid);
      const jobData = getJobById(jobId);
      setJob(jobData);
    }
  }, [jobId, user, startWorkflow, getJobById]);

  // Auto-scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [installStep]);

  const currentStepIndex = INSTALL_STEPS.findIndex(s => s.id === installStep);
  const currentStepConfig = INSTALL_STEPS[currentStepIndex];
  const StepComponent = currentStepConfig?.component;

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
      alert('Failed to save. Please try again.');
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

  const handleExit = async () => {
    const confirmMessage = 'Are you sure you want to exit? Make sure to save your progress first.';
    if (confirm(confirmMessage)) {
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

  const progressPercent = Math.round(((currentStepIndex + 1) / INSTALL_STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ULTRAFLOW MINIMAL HEADER */}
      <div className="bg-white shadow-md border-b sticky top-0 z-10">
        {/* Top bar with job info */}
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <div>
            <h1 className="text-lg font-poppins font-bold text-gray-900">
              Install Workflow
            </h1>
            <p className="text-xs text-gray-600">
              {job.customerInfo.name} • {job.customerInfo.address}
            </p>
          </div>
          <Button variant="secondary" onClick={handleExit} className="text-sm">
            Exit
          </Button>
        </div>

        {/* Clickable Progress Bar */}
        <div
          className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowStepOverview(!showStepOverview)}
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700 font-medium">
              Step {currentStepIndex + 1} of {INSTALL_STEPS.length}: {currentStepConfig.title}
            </span>
            <span className="font-bold text-entrusted-orange">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-entrusted-orange h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Click to view all steps
          </p>
        </div>
      </div>

      {/* MAIN CONTENT - SINGLE STEP ONLY */}
      <div ref={contentRef} className="container mx-auto px-4 py-6 max-w-4xl">
        {/* NO DUPLICATE HEADER - Just the step content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Step Content */}
          {StepComponent && <StepComponent job={job} />}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0 || isSaving}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {INSTALL_STEPS.length}
            </div>

            <Button
              variant="primary"
              onClick={handleSaveAndContinue}
              disabled={currentStepIndex === INSTALL_STEPS.length - 1 || isSaving}
              className="flex items-center gap-2 min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  {currentStepIndex === INSTALL_STEPS.length - 1 ? 'Save & Finish' : 'Save & Continue'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

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
    </div>
  );
};
