import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useJobsStore } from '../../../stores/jobsStore';
import { Button } from '../../shared/Button';
import { Card } from '../../shared/Card';
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
  ClipboardCheck
} from 'lucide-react';
import { InstallStep } from '../../../types/workflow';

// Import step components
import { ArrivalStep } from './install/ArrivalStep';
import { FrontDoorStep } from './install/FrontDoorStep';
import { RoomEvaluationStep } from './install/RoomEvaluationStep';
import {
  PreExistingStep,
  CauseOfLossStep,
  AffectedRoomsStep,
  EquipmentCalcStep,
  EquipmentPlaceStep,
  CommunicatePlanStep,
  FinalPhotosStep,
  ReviewStep,
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
    description: 'Document existing issues',
    icon: <Camera className="w-5 h-5" />,
    component: PreExistingStep,
  },
  {
    id: 'cause-of-loss',
    title: 'Cause of Loss',
    description: 'Identify and photograph',
    icon: <Droplets className="w-5 h-5" />,
    component: CauseOfLossStep,
  },
  {
    id: 'room-evaluation',
    title: 'Room Evaluation',
    description: 'Room by room assessment',
    icon: <Ruler className="w-5 h-5" />,
    component: RoomEvaluationStep,
  },
  {
    id: 'affected-rooms',
    title: 'Affected Rooms',
    description: 'Document all affected areas',
    icon: <CheckCircle className="w-5 h-5" />,
    component: AffectedRoomsStep,
  },
  {
    id: 'equipment-calc',
    title: 'Equipment Calculation',
    description: 'IICRC-compliant calculations',
    icon: <Wind className="w-5 h-5" />,
    component: EquipmentCalcStep,
  },
  {
    id: 'equipment-place',
    title: 'Equipment Placement',
    description: 'Place and scan equipment',
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
    id: 'review',
    title: 'Review',
    description: 'Review all data',
    icon: <ClipboardCheck className="w-5 h-5" />,
    component: ReviewStep,
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
  const { installStep, setInstallStep, startWorkflow, progress } = useWorkflowStore();
  const { getJobById } = useJobsStore();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (jobId) {
      startWorkflow('install', jobId);
      const jobData = getJobById(jobId);
      setJob(jobData);
    }
  }, [jobId]);

  const currentStepIndex = INSTALL_STEPS.findIndex(s => s.id === installStep);
  const currentStepConfig = INSTALL_STEPS[currentStepIndex];
  const StepComponent = currentStepConfig?.component;

  const handleNext = () => {
    if (currentStepIndex < INSTALL_STEPS.length - 1) {
      setInstallStep(INSTALL_STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setInstallStep(INSTALL_STEPS[currentStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: InstallStep) => {
    setInstallStep(stepId);
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Progress will be saved.')) {
      navigate('/tech');
    }
  };

  if (!job || !currentStepConfig) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-poppins font-bold text-gray-900">
              Install Workflow
            </h1>
            <p className="text-sm text-gray-600">
              {job.customerInfo.name} - {job.customerInfo.address}
            </p>
          </div>
          <Button variant="secondary" onClick={handleExit}>
            Exit
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card title="Progress" className="sticky top-6">
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Step {currentStepIndex + 1} of {INSTALL_STEPS.length}</span>
                  <span className="font-semibold text-entrusted-orange">
                    {Math.round(((currentStepIndex + 1) / INSTALL_STEPS.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-entrusted-orange h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / INSTALL_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {INSTALL_STEPS.map((step, index) => {
                  const isActive = step.id === installStep;
                  const isCompleted = index < currentStepIndex;

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(step.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-entrusted-orange text-white shadow-md'
                          : isCompleted
                          ? 'bg-green-50 hover:bg-green-100'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : isActive ? (
                          <div className="w-5 h-5 flex-shrink-0">{step.icon}</div>
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isActive ? 'text-white' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </p>
                          <p className={`text-xs truncate ${
                            isActive ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-entrusted-orange text-white rounded-lg">
                    {currentStepConfig.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-poppins font-bold text-gray-900">
                      {currentStepConfig.title}
                    </h2>
                    <p className="text-gray-600">{currentStepConfig.description}</p>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              {StepComponent && <StepComponent job={job} onNext={handleNext} />}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={currentStepIndex === INSTALL_STEPS.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
