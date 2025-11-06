/**
 * Workflow Types
 * Defines the step-by-step workflow for MIT Tech job processes
 */

export type InstallStep =
  | 'arrival'                // Step 1: Property arrival, clock in
  | 'front-door'             // Step 2: Customer intro, ground rules
  | 'pre-existing'           // Step 3: Document pre-existing conditions
  | 'cause-of-loss'          // Step 4: Document cause of loss
  | 'room-dimensions'        // Step 5: Room dimensions (L x W x H)
  | 'water-classification'   // Step 6: Water category & class determination
  | 'affected-materials'     // Step 7: Affected walls/ceiling/floor SQFT
  | 'moisture-mapping'       // Step 8: Initial moisture readings
  | 'plan-job'               // Step 9: Review totals, set goals, plan
  | 'equipment-calc'         // Step 10: IICRC equipment calculations
  | 'equipment-place'        // Step 11: Place and scan equipment
  | 'communicate-plan'       // Step 12: Customer communication
  | 'final-photos'           // Step 13: Final documentation
  | 'complete';              // Step 14: Complete and depart

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
