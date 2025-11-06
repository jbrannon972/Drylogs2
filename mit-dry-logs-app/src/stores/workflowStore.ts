/**
 * Workflow Store
 * Manages the current workflow state and progress
 */

import { create } from 'zustand';
import { InstallStep, DemoStep, CheckServiceStep, PullStep, WorkflowProgress } from '../types/workflow';
import { jobsService } from '../services/firebase/jobsService';

interface WorkflowState {
  // Current workflow
  currentWorkflow: 'install' | 'demo' | 'check-service' | 'pull' | null;
  currentJobId: string | null;
  currentUserId: string | null;

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
  startWorkflow: (workflow: 'install' | 'demo' | 'check-service' | 'pull', jobId: string, userId: string) => Promise<void>;
  setInstallStep: (step: InstallStep) => void;
  setDemoStep: (step: DemoStep) => void;
  setCheckServiceStep: (step: CheckServiceStep) => void;
  setPullStep: (step: PullStep) => void;
  updateWorkflowData: (workflow: string, data: any) => Promise<void>;
  completeWorkflow: () => void;
  resetWorkflow: () => void;
  saveWorkflowData: () => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentWorkflow: null,
  currentJobId: null,
  currentUserId: null,
  installStep: 'arrival',
  installData: {},
  demoStep: 'clock-in',
  demoData: {},
  checkServiceStep: 'start-visit',
  checkServiceData: {},
  pullStep: 'start-pull',
  pullData: {},
  progress: null,

  startWorkflow: async (workflow, jobId, userId) => {
    const totalSteps = {
      install: 13,
      demo: 10,
      'check-service': 7,
      pull: 8,
    }[workflow];

    // Load existing workflow data from the job
    try {
      const job = await jobsService.getJobById(jobId);
      if (job) {
        const existingWorkflowData = (job as any).workflowData?.[workflow] || {};

        set({
          currentWorkflow: workflow,
          currentJobId: jobId,
          currentUserId: userId,
          [`${workflow}Data`]: existingWorkflowData,
          progress: {
            currentStep: 1,
            totalSteps,
            completedSteps: 0,
            startedAt: new Date(),
            lastUpdatedAt: new Date(),
          },
        } as any);
      } else {
        set({
          currentWorkflow: workflow,
          currentJobId: jobId,
          currentUserId: userId,
          progress: {
            currentStep: 1,
            totalSteps,
            completedSteps: 0,
            startedAt: new Date(),
            lastUpdatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
      // Continue with empty data if load fails
      set({
        currentWorkflow: workflow,
        currentJobId: jobId,
        currentUserId: userId,
        progress: {
          currentStep: 1,
          totalSteps,
          completedSteps: 0,
          startedAt: new Date(),
          lastUpdatedAt: new Date(),
        },
      });
    }
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

  updateWorkflowData: async (workflow, data) => {
    const state = get();
    const dataKey = `${workflow}Data` as keyof WorkflowState;
    const currentData = (state[dataKey] || {}) as Record<string, any>;
    const updatedData = {
      ...currentData,
      ...data,
    };

    set({
      [dataKey]: updatedData,
    } as any);

    // Auto-save to Firebase
    await get().saveWorkflowData();
  },

  saveWorkflowData: async () => {
    const state = get();
    const { currentWorkflow, currentJobId, currentUserId } = state;

    if (!currentWorkflow || !currentJobId || !currentUserId) {
      console.warn('Cannot save workflow data: missing workflow, jobId, or userId');
      return;
    }

    try {
      const dataKey = `${currentWorkflow}Data` as keyof WorkflowState;
      const workflowData = state[dataKey] as Record<string, any>;

      // Save to job document under workflowData field
      await jobsService.updateJob(
        currentJobId,
        {
          workflowData: {
            [currentWorkflow]: workflowData,
          },
        } as any,
        currentUserId
      );

      console.log(`✅ Workflow data auto-saved for ${currentWorkflow}`);
    } catch (error) {
      console.error('Error saving workflow data:', error);
      // Don't throw - allow workflow to continue even if save fails
    }
  },

  completeWorkflow: () => {
    set({
      currentWorkflow: null,
      currentJobId: null,
      currentUserId: null,
      progress: null,
      installStep: 'arrival',
      demoStep: 'clock-in',
      checkServiceStep: 'start-visit',
      pullStep: 'start-pull',
    });
  },

  resetWorkflow: () => {
    set({
      currentWorkflow: null,
      currentJobId: null,
      currentUserId: null,
      installStep: 'arrival',
      installData: {},
      demoStep: 'clock-in',
      demoData: {},
      checkServiceStep: 'start-visit',
      checkServiceData: {},
      pullStep: 'start-pull',
      pullData: {},
      progress: null,
    });
  },
}));
