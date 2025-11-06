/**
 * Workflow Store
 * Manages the current workflow state and progress
 */

import { create } from 'zustand';
import { InstallStep, DemoStep, CheckServiceStep, PullStep, WorkflowProgress } from '../types/workflow';

interface WorkflowState {
  // Current workflow
  currentWorkflow: 'install' | 'demo' | 'check-service' | 'pull' | null;
  currentJobId: string | null;

  // Install workflow
  installStep: InstallStep;
  installData: Record<string, any>;

  // Demo workflow
  demoStep: DemoStep;
  demoData: Record<string, any>;

  // Check Service workflow
  checkServiceStep: CheckServiceStep;
  checkServiceData: Record<string, any>;

  // Pull workflow
  pullStep: PullStep;
  pullData: Record<string, any>;

  // Progress tracking
  progress: WorkflowProgress | null;

  // Actions
  startWorkflow: (workflow: 'install' | 'demo' | 'check-service' | 'pull', jobId: string) => void;
  setInstallStep: (step: InstallStep) => void;
  setDemoStep: (step: DemoStep) => void;
  setCheckServiceStep: (step: CheckServiceStep) => void;
  setPullStep: (step: PullStep) => void;
  updateWorkflowData: (workflow: string, data: any) => void;
  completeWorkflow: () => void;
  resetWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentWorkflow: null,
  currentJobId: null,
  installStep: 'arrival',
  installData: {},
  demoStep: 'pre-demo-safety',
  demoData: {},
  checkServiceStep: 'chamber-readings',
  checkServiceData: {},
  pullStep: 'final-readings',
  pullData: {},
  progress: null,

  startWorkflow: (workflow, jobId) => {
    const totalSteps = {
      install: 12,
      demo: 7,
      'check-service': 5,
      pull: 6,
    }[workflow];

    set({
      currentWorkflow: workflow,
      currentJobId: jobId,
      progress: {
        currentStep: 1,
        totalSteps,
        completedSteps: 0,
        startedAt: new Date(),
        lastUpdatedAt: new Date(),
      },
    });
  },

  setInstallStep: (step) => {
    const state = get();
    set({
      installStep: step,
      progress: state.progress ? {
        ...state.progress,
        lastUpdatedAt: new Date(),
      } : null,
    });
  },

  setDemoStep: (step) => {
    const state = get();
    set({
      demoStep: step,
      progress: state.progress ? {
        ...state.progress,
        lastUpdatedAt: new Date(),
      } : null,
    });
  },

  setCheckServiceStep: (step) => {
    const state = get();
    set({
      checkServiceStep: step,
      progress: state.progress ? {
        ...state.progress,
        lastUpdatedAt: new Date(),
      } : null,
    });
  },

  setPullStep: (step) => {
    const state = get();
    set({
      pullStep: step,
      progress: state.progress ? {
        ...state.progress,
        lastUpdatedAt: new Date(),
      } : null,
    });
  },

  updateWorkflowData: (workflow, data) => {
    const state = get();
    set({
      [`${workflow}Data`]: {
        ...state[`${workflow}Data` as keyof WorkflowState],
        ...data,
      },
    } as any);
  },

  completeWorkflow: () => {
    set({
      currentWorkflow: null,
      currentJobId: null,
      progress: null,
      installStep: 'arrival',
      demoStep: 'pre-demo-safety',
      checkServiceStep: 'chamber-readings',
      pullStep: 'final-readings',
    });
  },

  resetWorkflow: () => {
    set({
      currentWorkflow: null,
      currentJobId: null,
      installStep: 'arrival',
      installData: {},
      demoStep: 'pre-demo-safety',
      demoData: {},
      checkServiceStep: 'chamber-readings',
      checkServiceData: {},
      pullStep: 'final-readings',
      pullData: {},
      progress: null,
    });
  },
}));
