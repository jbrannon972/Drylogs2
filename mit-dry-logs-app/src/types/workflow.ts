/**
 * Workflow Types
 * Defines the step-by-step workflow for MIT Tech job processes
 */

export type InstallStep =
  | 'arrival'           // Step 1: Property arrival, clock in
  | 'front-door'        // Step 2: Customer intro, ground rules
  | 'pre-existing'      // Step 3: Document pre-existing conditions
  | 'cause-of-loss'     // Step 4: Document cause of loss
  | 'room-evaluation'   // Step 5: Room by room assessment
  | 'affected-rooms'    // Step 6: Document affected rooms
  | 'equipment-calc'    // Step 7: Calculate equipment needs
  | 'equipment-place'   // Step 8: Place and scan equipment
  | 'communicate-plan'  // Step 9: Customer communication
  | 'final-photos'      // Step 10: Final documentation
  | 'review'            // Step 11: Review all data
  | 'complete';         // Step 12: Complete and depart

export type DemoStep =
  | 'pre-demo-safety'
  | 'pre-demo-photos'
  | 'demo-work'
  | 'post-demo-assessment'
  | 'post-demo-photos'
  | 'equipment-adjust'
  | 'complete';

export type CheckServiceStep =
  | 'chamber-readings'
  | 'room-assessment'
  | 'equipment-check'
  | 'progress-photos'
  | 'complete';

export type PullStep =
  | 'final-readings'
  | 'equipment-removal'
  | 'site-restoration'
  | 'customer-walkthrough'
  | 'final-photos'
  | 'complete';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isRequired: boolean;
  data?: any;
}

export interface WorkflowProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  startedAt: Date;
  lastUpdatedAt: Date;
}
