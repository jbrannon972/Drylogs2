/**
 * Workflow Types
 * Defines the step-by-step workflow for MIT Tech job processes
 */

export type InstallStep =
  | 'office-prep'            // Step 0: Office preparation (optional)
  | 'arrival'                // Step 1: Property arrival, clock in + exterior environmental baseline
  | 'front-door'             // Step 2: Customer intro, ground rules
  | 'cause-of-loss'          // Step 3: Document cause + water category (1/2/3)
  | 'room-assessment'        // Step 4: Assess ALL rooms (dimensions + moisture + materials + pre-existing)
  | 'define-chambers'        // Step 5: Define drying chambers and assign rooms + unaffected area dry standards (IICRC)
  | 'plan-job'               // Step 6: Plan the job - set drying class and timeline (REMOVED from workflow)
  | 'partial-demo'           // Step 7: Partial demo work during install (optional)
  | 'schedule-work'          // Step 11: Plan Day 2+ (demo, checks, pull)
  | 'equipment-calc'         // Step 6: IICRC equipment calculations per chamber
  | 'equipment-place'        // Step 8: Place and scan equipment by chamber + initial dehumidifier check
  | 'general-billables'      // Step 9: Additional billable work (generals page)
  | 'communicate-plan'       // Step 12: Customer communication
  | 'final-photos'           // Step 10: Final documentation
  | 'complete';              // Step 13: Complete and depart

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
