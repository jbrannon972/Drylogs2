/**
 * Workflow Store
 * Manages the current workflow state and progress
 */

import { create } from 'zustand';
import { InstallStep, DemoStep, CheckServiceStep, PullStep, WorkflowProgress } from '../types/workflow';
import { jobsService } from '../services/firebase/jobsService';

/**
 * Recursively removes undefined values from an object
 * Firebase Firestore does not accept undefined values
 */
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item)).filter(item => item !== null);
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      const value = removeUndefined(obj[key]);
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  return obj;
}

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

  // Save guard
  isSaving: boolean;
  lastSaveTime: number;

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
  isSaving: false,
  lastSaveTime: 0,

  startWorkflow: async (workflow, jobId, userId) => {
    const totalSteps = {
      install: 14, // Updated: Removed "Plan the Job" step (was 15, now 14)
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

    console.log(`📝 updateWorkflowData called for ${workflow}`, data);

    // Only update local state - NO AUTO-SAVE
    // User must click "Save & Continue" to persist to Firebase
    set({
      [dataKey]: updatedData,
    } as any);
  },

  saveWorkflowData: async () => {
    const state = get();
    const { currentWorkflow, currentJobId, currentUserId, isSaving, lastSaveTime } = state;

    console.log('🔍 saveWorkflowData called from:', new Error().stack?.split('\n')[2]?.trim());

    // ULTRAFAULT GUARD: Prevent infinite loops
    // 1. Check if already saving
    if (isSaving) {
      console.warn('⚠️ Save already in progress, skipping duplicate call');
      return;
    }

    // 2. Check if called too frequently (debounce: max once per 500ms)
    const now = Date.now();
    if (now - lastSaveTime < 500) {
      console.warn('⚠️ Save called too soon after last save, skipping (debounce)');
      return;
    }

    if (!currentWorkflow || !currentJobId || !currentUserId) {
      console.warn('Cannot save workflow data: missing workflow, jobId, or userId');
      return;
    }

    // Set saving flag
    set({ isSaving: true, lastSaveTime: now });

    try {
      const dataKey = `${currentWorkflow}Data` as keyof WorkflowState;
      const workflowData = state[dataKey] as Record<string, any>;

      // Remove undefined values to prevent Firebase errors
      const cleanedData = removeUndefined(workflowData);

      console.log(`💾 Saving workflow data for ${currentWorkflow}:`, cleanedData);

      // Save to job document under workflowData field
      await jobsService.updateJob(
        currentJobId,
        {
          workflowData: {
            [currentWorkflow]: cleanedData,
          },
        } as any,
        currentUserId
      );

      console.log(`✅ Workflow data saved successfully for ${currentWorkflow}`);
    } catch (error) {
      console.error('Error saving workflow data:', error);
      throw error; // Throw so the UI can show an error message
    } finally {
      // Clear saving flag
      set({ isSaving: false });
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
