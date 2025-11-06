// MIT DRY LOGS APP - TypeScript Type Definitions
// Based on Firebase Schema from MIT_DRY_LOGS_DEVELOPMENT_PLAN.md

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'MIT_TECH' | 'MIT_LEAD' | 'ADMIN';
export type Zone = 'Zone 1' | 'Zone 2' | 'Zone 3' | '2nd Shift';
export type TrainingLevel = 'junior' | 'mid' | 'senior';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: UserRole;
  zone: Zone;
  assignedJobs: string[];
  createdAt: Timestamp;
  lastLogin: Timestamp;
  isActive: boolean;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    preferredTimeZone: string;
    language: string;
  };
  qualifications: {
    iicrcCertified: boolean;
    certificationExpiry?: Timestamp;
    trainingLevel: TrainingLevel;
  };
  metadata: {
    totalJobsCompleted: number;
    totalEquipmentScans: number;
    accuracyScore: number;
    lastActivityAt: Timestamp;
  };
}

// ============================================================================
// JOB TYPES
// ============================================================================

export type JobStatus = 'Pre-Install' | 'Install' | 'Demo' | 'Check Service' | 'Pull' | 'Complete' | 'On Hold';
export type PhaseStatus = 'pending' | 'in-progress' | 'completed';
export type WaterCategory = 'Category 1' | 'Category 2' | 'Category 3';
export type WaterClass = 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4';
export type CauseOfLossType = 'Burst Pipe' | 'Flooding' | 'Ice Dam' | 'Sewage Backup' | 'Roof Leak' | 'Appliance Leak' | 'Other';

export interface CustomerInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface InsuranceInfo {
  carrierName: string;
  policyNumber: string;
  claimNumber: string;
  adjusterName: string;
  adjusterPhone: string;
  adjusterEmail: string;
  deductible: number;
  estimatedValue: number;
  categoryOfWater: WaterCategory;
}

export interface CauseOfLoss {
  type: CauseOfLossType;
  description: string;
  location: string;
  discoveryDate: Timestamp;
  eventDate: Timestamp;
}

export interface WorkflowPhase {
  status: PhaseStatus;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  technician?: string;
  notes?: string;
}

export interface CheckServiceVisit {
  visitNumber: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  technician: string;
  notes: string;
  readingsVerified: boolean;
}

export interface WorkflowPhases {
  install: WorkflowPhase;
  demo: WorkflowPhase & { scheduledDate?: Timestamp };
  checkService: WorkflowPhase & {
    visits: CheckServiceVisit[];
  };
  pull: WorkflowPhase;
}

// ============================================================================
// ROOM & MATERIAL TYPES
// ============================================================================

export type RoomType = 'Bedroom' | 'Bathroom' | 'Kitchen' | 'Living Room' | 'Dining' | 'Laundry' | 'Hallway' | 'Basement' | 'Attic' | 'Garage' | 'Other';
export type AffectedStatus = 'affected' | 'unaffected' | 'partially-affected';
export type MaterialType = 'Drywall' | 'Flooring' | 'Carpet' | 'Wood Framing' | 'Subfloor' | 'Concrete' | 'Insulation' | 'Tile' | 'Other';
export type MaterialCondition = 'wet' | 'damp' | 'dry';
export type ReadingType = 'pre-demo' | 'post-demo' | 'daily-check' | 'final';
export type PhotoStep = 'arrival' | 'assessment' | 'pre-demo' | 'demo' | 'post-demo' | 'daily-check' | 'final';

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  squareFootage: number;
}

export interface ExposedMaterial {
  materialId: string;
  materialType: MaterialType;
  exposedAt: Timestamp;
  readingsRequired: boolean;
}

export interface MaterialAffected {
  materialId: string;
  materialType: MaterialType;
  condition: MaterialCondition;
  squareFootageAffected: number;
  removalDate?: Timestamp;
  removalPhotos: string[];
  exposedMaterials: ExposedMaterial[];
}

export interface MoistureReading {
  readingId: string;
  material: MaterialType;
  moisturePercentage: number;
  temperature: number;
  humidity: number;
  recordedAt: Timestamp;
  readingType: ReadingType;
  technicianId: string;
  photoUrl?: string;
  notes?: string;
}

export interface Photo {
  photoId: string;
  url: string;
  timestamp: Timestamp;
  step: PhotoStep;
  caption: string;
  room: string;
  uploadedBy: string;
}

export interface Room {
  roomId: string;
  roomName: string;
  roomType: RoomType;
  affectedStatus: AffectedStatus;
  dimensions: RoomDimensions;
  materialsAffected: MaterialAffected[];
  moistureReadings: MoistureReading[];
  photos: Photo[];
  dryingChamber?: string;
  isClosed: boolean;
  closureNotes?: string;
}

// ============================================================================
// EQUIPMENT TYPES
// ============================================================================

export type EquipmentStatus = 'planned' | 'deployed' | 'removed';
export type EquipmentCondition = 'good' | 'needs-repair' | 'damaged';
export type DehumidifierType = 'Conventional Refrigerant' | 'Low Grain Refrigerant (LGR)' | 'Desiccant';

export interface EquipmentReading {
  readingId: string;
  timestamp: Timestamp;
  temperature: number;
  humidity: number;
  hoursRunning: number;
  ppd: number;
}

export interface Dehumidifier {
  equipmentId: string;
  serialNumber: string;
  model: string;
  scanCode: string;
  deploymentTime: Timestamp;
  removalTime?: Timestamp;
  readings: EquipmentReading[];
  conditionOnRemoval?: EquipmentCondition;
}

export interface AirMover {
  equipmentId: string;
  serialNumber: string;
  model: string;
  scanCode: string;
  deploymentTime: Timestamp;
  removalTime?: Timestamp;
  conditionOnRemoval?: EquipmentCondition;
}

export interface AirScrubber {
  equipmentId: string;
  serialNumber: string;
  model: string;
  scanCode: string;
  deploymentTime: Timestamp;
  removalTime?: Timestamp;
  conditionOnRemoval?: EquipmentCondition;
}

export interface DryingChamber {
  chamberId: string;
  chamberName: string;
  assignedRooms: string[];
  deploymentDate: Timestamp;
  removalDate?: Timestamp;
  status: EquipmentStatus;
  dehumidifiers: Dehumidifier[];
  airMovers: AirMover[];
  airScrubbers: AirScrubber[];
}

export interface EquipmentCalculations {
  totalAffectedSquareFootage: number;
  estimatedDryingDays: number;
  recommendedDehumidifierCount: number;
  recommendedAirMoverCount: number;
  recommendedAirScrubberCount: number;
  calculationMethod: string;
  lastCalculatedAt: Timestamp;
  calculatedBy: string;
  waterClass: WaterClass;
  waterCategory: WaterCategory;
}

export interface JobEquipment {
  chambers: DryingChamber[];
  calculations: EquipmentCalculations;
}

// ============================================================================
// SAFETY & COMPLIANCE TYPES
// ============================================================================

export interface Hazard {
  hazardId: string;
  type: string;
  description: string;
  mitigationSteps: string;
  resolved: boolean;
}

export interface SafetyChecklist {
  preArrivalInspection: boolean;
  containmentSetup: boolean;
  ppeEquipped: boolean;
  safetyConesPlaced: boolean;
  utilityLocations: {
    electrical: boolean;
    gas: boolean;
    water: boolean;
    verified: boolean;
    verifiedAt?: Timestamp;
  };
  hazardsIdentified: Hazard[];
}

// ============================================================================
// COMMUNICATION TYPES
// ============================================================================

export interface PreExistingCondition {
  conditionId: string;
  description: string;
  location: string;
  photoUrl: string;
}

export interface Communication {
  groundRulesPresented: boolean;
  estimatedTimeline: string;
  customerConcerns: string[];
  preExistingConditions: PreExistingCondition[];
}

// ============================================================================
// FINANCIAL TYPES
// ============================================================================

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'stripe' | 'insurance';

export interface Payment {
  paymentId: string;
  amount: number;
  timestamp: Timestamp;
  method: PaymentMethod;
  stripeTransactionId?: string;
  processedBy: string;
  receiptUrl?: string;
}

export interface Financial {
  insuranceDeductible: number;
  estimatedMaterials: number;
  estimatedLabor: number;
  estimatedTotal: number;
  actualExpenses: {
    materials: number;
    labor: number;
    equipment: number;
    total: number;
  };
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  payments: Payment[];
}

// ============================================================================
// DOCUMENTATION TYPES
// ============================================================================

export interface Documentation {
  matterportScan: {
    completed: boolean;
    url?: string;
    scanDate?: Timestamp;
  };
  certificateOfSatisfaction: {
    obtained: boolean;
    signedDate?: Timestamp;
    customerSignature?: string;
  };
  dryReleaseWaiver: {
    needed: boolean;
    obtained: boolean;
    signedDate?: Timestamp;
    customerSignature?: string;
  };
}

// ============================================================================
// JOB METADATA TYPES
// ============================================================================

export interface JobMetadata {
  createdAt: Timestamp;
  createdBy: string;
  lastModifiedAt: Timestamp;
  lastModifiedBy: string;
  version: number;
}

// ============================================================================
// COMPLETE JOB TYPE
// ============================================================================

export interface Job {
  jobId: string;
  customerInfo: CustomerInfo;
  insuranceInfo: InsuranceInfo;
  causeOfLoss: CauseOfLoss;
  jobStatus: JobStatus;
  workflowPhases: WorkflowPhases;
  rooms: Room[];
  equipment: JobEquipment;
  safetyChecklist: SafetyChecklist;
  communication: Communication;
  financial: Financial;
  documentation: Documentation;
  scheduledZone: Zone;
  scheduledTechnician: string;
  scheduledDate: Timestamp;
  metadata: JobMetadata;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'offline-mode';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

// ============================================================================
// SYNC TYPES
// ============================================================================

export type SyncOperation = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'syncing' | 'completed' | 'failed';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  collectionName: string;
  documentId: string;
  data: any;
  timestamp: number;
  status: SyncStatus;
  retryCount: number;
  error?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface RoomFormData {
  roomName: string;
  roomType: RoomType;
  affectedStatus: AffectedStatus;
  length: number;
  width: number;
  height: number;
}

export interface MoistureReadingFormData {
  material: MaterialType;
  moisturePercentage: number;
  temperature: number;
  humidity: number;
  readingType: ReadingType;
  notes?: string;
}

export interface PhotoUploadData {
  file: Blob;
  room: string;
  step: PhotoStep;
  caption: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface JobFilters {
  status?: JobStatus;
  zone?: Zone;
  searchText?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}
