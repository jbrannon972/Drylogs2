/**
 * Workflow Types
 * Defines the step-by-step workflow for MIT Tech job processes
 */

export type InstallStep =
  | 'arrival'                // Step 1: Property arrival, clock in
  | 'front-door'             // Step 2: Customer intro, ground rules
  | 'pre-existing'           // Step 3: Document pre-existing conditions with photos
  | 'cause-of-loss'          // Step 4: Document cause + water category (1/2/3)
  | 'add-rooms'              // Step 5: Add rooms with dimensions
  | 'affected-materials'     // Step 6: Document affected SQFT per room
  | 'moisture-mapping'       // Step 7: Initial moisture readings + photos
  | 'schedule-work'          // Step 8: Plan Day 2+ (demo, checks, pull)
  | 'equipment-calc'         // Step 9: IICRC equipment calculations per room
  | 'equipment-place'        // Step 10: Place and scan equipment by room
  | 'communicate-plan'       // Step 11: Customer communication
  | 'final-photos'           // Step 12: Final documentation
  | 'complete';              // Step 13: Complete and depart

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
