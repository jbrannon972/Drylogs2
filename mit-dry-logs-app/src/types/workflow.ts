/**
 * Workflow Types
 * Defines the step-by-step workflow for MIT Tech job processes
 */

export type InstallStep =
  | 'office-prep'            // Step 1: Office preparation (optional)
  | 'arrival'                // Step 2: Property arrival, clock in
  | 'front-door'             // Step 3: Customer intro, ground rules
  | 'cause-of-loss'          // Step 4: Document cause + water category (1/2/3)
  | 'unaffected-baseline'    // Step 5: Unaffected area baseline (IICRC S500 dry standard)
  | 'room-assessment'        // Step 6: Assess ALL affected rooms (dimensions + moisture + materials + pre-existing)
  | 'define-chambers'        // Step 7: Define drying chambers and assign rooms
  | 'plan-job'               // Step 8: Plan the job - set drying class and timeline
  | 'partial-demo'           // Step 9: Partial demo work during install (optional)
  | 'schedule-work'          // Step 10: Plan Day 2+ (demo, checks, pull)
  | 'equipment-calc'         // Step 11: IICRC equipment calculations per chamber
  | 'equipment-place'        // Step 12: Place and scan equipment by chamber
  | 'general-billables'      // Step 13: Additional billable work (generals page)
  | 'communicate-plan'       // Step 14: Customer communication
  | 'final-photos'           // Step 15: Final documentation
  | 'complete';              // Step 16: Complete and depart

export type DemoStep =
  | 'clock-in'                // Step 1: Arrival & clock in
  | 'pre-demo-photos'         // Step 2: Before photos
  | 'demo-execution'          // Step 3: Room-by-room demo with quantity tracking
  | 'exposed-materials'       // Step 4: Assess newly exposed materials
  | 'post-demo-readings'      // Step 5: Moisture readings on exposed materials
  | 'debris-disposal'         // Step 6: Document debris removal
  | 'ppe-supplies'            // Step 7: PPE & supplies used (Cat 2/3)
  | 'post-demo-photos'        // Step 8: After photos
  | 'equipment-adjust'        // Step 9: Add/remove equipment
  | 'complete';               // Step 10: Clock out & complete

export type CheckServiceStep =
  | 'start-visit'             // Step 1: Clock in, visit # tracking
  | 'environmental-check'     // Step 2: Outside + reference room conditions
  | 'room-readings'           // Step 3: Moisture readings per room/material
  | 'equipment-status'        // Step 4: Equipment operational check
  | 'drying-assessment'       // Step 5: Calculate days remaining
  | 'equipment-adjust'        // Step 6: Add/remove equipment if needed
  | 'complete';               // Step 7: Clock out & save

export type PullStep =
  | 'start-pull'              // Step 1: Clock in (requires MIT Lead approval)
  | 'final-verification'      // Step 2: Final moisture readings (<12% required)
  | 'equipment-removal'       // Step 3: Remove & scan all equipment
  | 'final-photos'            // Step 4: Document dry conditions
  | 'customer-paperwork'      // Step 5: Signatures (CoS, DRW if needed)
  | 'payment-collection'      // Step 6: Collect payment (if cash job)
  | 'matterport-verify'       // Step 7: Verify Matterport scan done
  | 'complete';               // Step 8: Job summary & clock out

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
