// MIT DRY LOGS APP - TypeScript Type Definitions
// Based on Firebase Schema from MIT_DRY_LOGS_DEVELOPMENT_PLAN.md

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'MIT_TECH' | 'MIT_LEAD' | 'PSM' | 'ADMIN';
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
export type ArrivalWindow = '9-1' | '12-4' | 'custom';

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

export interface PartialDemoMaterial {
  materialType: string;
  quantity: number;
  unit: 'sqft' | 'linear-ft' | 'each';
  notes: string;
}

export interface PartialDemoRoom {
  roomId: string;
  roomName: string;
  materialsRemoved: PartialDemoMaterial[];
  demoTimeMinutes: number;
  photos: string[];
  notes: string;
}

export interface PartialDemoDetails {
  rooms: PartialDemoRoom[];
  totalDemoTimeMinutes: number;
  loggedAt: Timestamp;
  loggedBy?: string;
}

export interface WorkflowPhases {
  install: WorkflowPhase & {
    partialDemoPerformed?: boolean;
    partialDemoDetails?: PartialDemoDetails;
  };
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
export type MaterialType =
  // Flooring
  | 'Carpet & Pad'
  | 'Hardwood Flooring'
  | 'Vinyl/Linoleum Flooring'
  | 'Tile Flooring'
  | 'Laminate Flooring'
  | 'Engineered Flooring'
  | 'Subfloor'
  // Drywall
  | 'Drywall - Wall'
  | 'Drywall - Ceiling'
  // Trim & Molding
  | 'Baseboards'
  | 'Shoe Molding'
  | 'Crown Molding'
  | 'Door Casing'
  | 'Window Casing'
  | 'Chair Rail'
  | 'Other Trim'
  // Tile & Backsplash
  | 'Tile Walls'
  | 'Backsplash'
  | 'Tub Surround'
  // Cabinetry & Counters
  | 'Base Cabinets'
  | 'Upper Cabinets'
  | 'Vanity'
  | 'Countertops'
  | 'Shelving'
  // Insulation
  | 'Insulation - Wall'
  | 'Insulation - Ceiling/Attic'
  // Fixtures & Appliances
  | 'Sink/Faucet'
  | 'Tub'
  | 'Shower Pan'
  | 'Dishwasher'
  | 'Refrigerator'
  | 'Washer'
  | 'Dryer'
  | 'Stove/Oven'
  | 'Microwave'
  | 'Water Heater'
  | 'Disposal'
  | 'Other Appliance'
  | 'Mirror'
  | 'Towel Bars/Accessories'
  // Other
  | 'Other'
  | 'Custom'; // For user-defined materials

export type FlooringInstallationType =
  | 'Floating'
  | 'Glue Down'
  | 'Nail Down'
  | 'Staple Down'
  | 'Stretch' // For carpet
  | 'Tar & Screed'
  | 'Direct Glue'
  | 'N/A';

export type MaterialCondition = 'wet' | 'damp' | 'dry';
export type ReadingType = 'dry-standard' | 'initial' | 'daily' | 'final';
export type PhotoStep = 'arrival' | 'assessment' | 'preexisting' | 'pre-demo' | 'demo' | 'post-demo' | 'daily-check' | 'final' | 'overall' | 'thermal' | 'containment' | 'exposed-material' | 'check-service';

// New: Specific material subtypes for affected areas
export type FloorMaterialType = 'carpet' | 'hardwood' | 'tile' | 'vinyl' | 'laminate' | 'concrete' | 'other';
export type WallMaterialType = 'drywall' | 'plaster' | 'concrete' | 'wood' | 'brick' | 'other';
export type CeilingMaterialType = 'drywall' | 'plaster' | 'acoustic' | 'wood' | 'other';

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

// New: Material breakdown for affected areas
export interface MaterialBreakdown {
  type: FloorMaterialType | WallMaterialType | CeilingMaterialType;
  sqFt: number;
  percentOfSurface: number;
}

export interface AffectedFloor {
  totalSqFt: number;
  affectedSqFt: number;
  percentAffected: number;
  materials: Array<{
    type: FloorMaterialType;
    sqFt: number;
  }>;
}

export interface AffectedWalls {
  totalSqFt: number;
  affectedSqFt: number;
  percentAffected: number;
  wetHeightAvg: number; // Average height of water line in feet
  materials: Array<{
    type: WallMaterialType;
    sqFt: number;
  }>;
}

export interface AffectedCeiling {
  totalSqFt: number;
  affectedSqFt: number;
  percentAffected: number;
  materials: Array<{
    type: CeilingMaterialType;
    sqFt: number;
  }>;
}

export interface AffectedAreas {
  floor: AffectedFloor;
  walls: AffectedWalls;
  ceiling: AffectedCeiling;
  totalSurfaceArea: number; // Sum of all surfaces (floor + walls + ceiling)
  totalAffectedArea: number; // Sum of all affected areas
  percentAffected: number; // For determining water class
}

export interface MoistureReading {
  readingId: string;
  material: MaterialType;
  location: string; // e.g., "North wall, 3ft height, grid A3"
  moisturePercentage: number;
  temperature: number;
  humidity: number;
  recordedAt: Timestamp;
  readingType: ReadingType;
  technicianId: string;
  meterType?: string; // e.g., "Tramex MES II"
  photoUrl?: string;
  notes?: string;
  isDryStandard?: boolean; // True if this is the baseline reading
}

// ============================================================================
// CONSTRUCTION MATERIALS (for moisture readings only)
// ============================================================================

// Only construction materials that can have moisture readings
// Excludes: appliances, mirrors, fixtures, and other non-porous items
export type ConstructionMaterialType =
  // Flooring Materials
  | 'Carpet & Pad'
  | 'Hardwood Flooring'
  | 'Vinyl/Linoleum Flooring'
  | 'Tile Flooring'
  | 'Laminate Flooring'
  | 'Engineered Flooring'
  | 'Subfloor'
  // Drywall & Ceiling
  | 'Drywall - Wall'
  | 'Drywall - Ceiling'
  // Trim & Molding
  | 'Baseboards'
  | 'Shoe Molding'
  | 'Crown Molding'
  | 'Door Casing'
  | 'Window Casing'
  | 'Chair Rail'
  | 'Other Trim'
  // Insulation
  | 'Insulation - Wall'
  | 'Insulation - Ceiling/Attic'
  // Tile & Backsplash
  | 'Tile Walls'
  | 'Backsplash'
  | 'Tub Surround'
  // Cabinetry (wood can absorb moisture)
  | 'Base Cabinets'
  | 'Upper Cabinets'
  | 'Vanity'
  | 'Countertops'
  | 'Shelving';

// ============================================================================
// ULTRAFIELD MOISTURE TRACKING SYSTEM
// ============================================================================

// Individual reading entry in the timeline
export interface MoistureReadingEntry {
  timestamp: string; // ISO string
  moisturePercent: number;
  photo?: string; // Photo URL
  technicianId: string;
  technicianName: string;
  workflowPhase: 'install' | 'check-service' | 'pull';
  visitNumber?: number; // For check services (1, 2, 3, etc.)
  notes?: string;
}

// Material moisture tracking record - persists across all phases
export interface MaterialMoistureTracking {
  id: string; // Unique ID for this material/location combination
  roomId: string;
  roomName: string;
  material: ConstructionMaterialType;
  location: string; // Specific location within room (e.g., "North wall, 2ft height")
  dryStandard: number; // Baseline from unaffected area - set once at install
  readings: MoistureReadingEntry[]; // All readings over time (chronological)
  createdAt: string; // ISO string
  lastReadingAt: string; // ISO string
  status: 'wet' | 'drying' | 'dry'; // Current status based on last reading
  trend: 'improving' | 'stable' | 'worsening' | 'unknown'; // Based on last 2+ readings
}

// Helper to get trend between two readings
export const getMoistureTrend = (current: number, previous: number): 'improving' | 'stable' | 'worsening' => {
  const diff = current - previous;
  if (Math.abs(diff) <= 0.5) return 'stable';
  return diff < 0 ? 'improving' : 'worsening';
};

// Helper to determine if material is dry
export const isMaterialDry = (currentReading: number, dryStandard: number): boolean => {
  // Material is dry if within 2% of dry standard OR below 12% (IICRC guideline)
  return currentReading <= dryStandard + 2 || currentReading <= 12;
};

export interface Photo {
  photoId: string;
  url: string;
  timestamp: Timestamp;
  step: PhotoStep;
  caption: string;
  room: string;
  uploadedBy: string;
}

// New: Water damage classification for room
export interface WaterDamageClassification {
  category: 1 | 2 | 3; // Clean/Gray/Black water
  class: 1 | 2 | 3 | 4; // Based on % of surfaces affected
  determinedAt: Timestamp;
  determinedBy: string;
  notes?: string;
}

export interface Room {
  roomId: string;
  roomName: string;
  roomType: RoomType;
  affectedStatus: AffectedStatus;
  dimensions: RoomDimensions;
  affectedAreas?: AffectedAreas; // NEW: Detailed breakdown of affected materials
  waterDamageClassification?: WaterDamageClassification; // NEW: Category and Class
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

export interface ChamberAmbientReading {
  readingId: string;
  temperature: number; // Fahrenheit
  humidity: number; // Relative humidity %
  timestamp: Timestamp;
  takenBy: string;
  dehumidifierId?: string; // If reading is from dehumidifier sensor
  notes?: string;
}

export interface DryingChamber {
  chamberId: string;
  chamberName: string;
  floorLevel?: string; // "First Floor", "Basement", etc.
  assignedRooms: string[];
  deploymentDate: Timestamp;
  removalDate?: Timestamp;
  status: EquipmentStatus;
  dehumidifiers: Dehumidifier[];
  airMovers: AirMover[];
  airScrubbers: AirScrubber[];
  ambientReadings: ChamberAmbientReading[]; // Environmental conditions over time
  hasContainment?: boolean; // DEPRECATED: Use containmentBarrier instead
  containmentNotes?: string; // DEPRECATED: Use containmentBarrier instead
  containmentBarrier?: ContainmentBarrierSetup; // PHASE 2: Full containment documentation
}

// NEW: Drying Plan and Goals
export interface DryingGoals {
  targetMoisturePercent: Record<string, number>; // By material type
  estimatedDryingDays: number;
  monitoringSchedule: 'daily' | 'twice-daily';
  completionCriteria: string;
}

export interface EquipmentPlan {
  calculated: {
    dehumidifiers: number;
    airMovers: number;
    airScrubbers: number;
    calculationNotes: string;
  };
  actual: {
    dehumidifiers: number;
    airMovers: number;
    airScrubbers: number;
  };
  variance?: {
    reason?: string;
    approvedBy?: string;
  };
}

export interface DryingPlan {
  waterCategory: 1 | 2 | 3;
  overallClass: 1 | 2 | 3 | 4; // Worst class across all rooms
  totalAffectedSqFt: number;
  totalFloorSqFt: number;
  totalWallSqFt: number;
  totalCeilingSqFt: number;
  dryingGoals: DryingGoals;
  equipmentPlan: EquipmentPlan;
  createdAt: Timestamp;
  createdBy: string;
}

export interface EquipmentCalculations {
  totalAffectedSquareFootage: number;
  totalCubicFootage: number; // NEW: Required for dehumidifier calc
  estimatedDryingDays: number;
  recommendedDehumidifierCount: number;
  recommendedAirMoverCount: number;
  recommendedAirScrubberCount: number;
  dehumidifierType?: DehumidifierType; // NEW: Type used for calculation
  chartFactor?: number; // NEW: IICRC chart factor used
  calculationMethod: string;
  calculationDetails?: string; // NEW: Show the math
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
// ADDITIONAL BILLABLE WORK (GENERAL PAGE)
// ============================================================================

export interface BillableItem {
  performed: boolean;
  quantity: number;
  unit: 'each' | 'sqft' | 'linear-ft' | 'daily';
  notes?: string;
}

export interface AdditionalWork {
  // Structural Materials
  insulation?: BillableItem;
  insulationVacuum?: BillableItem;
  insulationTruss?: BillableItem;
  countertops?: BillableItem;
  backsplash?: BillableItem;
  cabinetry?: BillableItem;
  // Contents & Protection
  contents?: BillableItem;
  contentsBags?: BillableItem;
  applianceMoving?: BillableItem;
  floorProtection?: BillableItem;
  plasticCoverings?: BillableItem;
  areaRugRedelivery?: BillableItem;
  // Containment
  containmentSqft?: BillableItem;
  zipPoleSystem?: BillableItem;
  zippers?: BillableItem;
  // Specialized Services
  waterExtraction?: BillableItem;
  sprayAntiMicrobial?: BillableItem;
  cleaning?: BillableItem;
  finalCleaning?: BillableItem;
  thermalImaging?: BillableItem;
  moldTesting?: BillableItem;
  leadTesting?: BillableItem;
  categoryTestingStrips?: BillableItem;
  drillHoles?: BillableItem;
  // Equipment Services
  jobsiteMonitoring?: BillableItem;
  decontaminateDehus?: BillableItem;
  decontaminateAirScrubbers?: BillableItem;
  decontaminateAirMovers?: BillableItem;
  toolRental?: BillableItem;
  ladder?: BillableItem;
  // Materials & Supplies
  plastic?: BillableItem;
  bubbleWrap?: BillableItem;
  lumber2x4?: BillableItem;
  fullCoveralls?: BillableItem;
  fullFaceRespirator?: BillableItem;
  halfFaceRespirator?: BillableItem;
  disposableGloves?: BillableItem;
  heavyDutyGloves?: BillableItem;
  eyeProtection?: BillableItem;
  disposableMask?: BillableItem;
  // Disposal & Logistics
  pod?: BillableItem;
  podDeliveryPickup?: BillableItem;
  pickupDumpCharge?: BillableItem;
  dumpsterBag?: BillableItem;
  // Other Services
  emergencyCallDuringHours?: BillableItem;
  emergencyCallAfterHours?: BillableItem;
  tempSinkHookup?: BillableItem;
  matterport?: BillableItem;
  other?: BillableItem & { description?: string };
  // Metadata
  loggedBy?: string;
  loggedAt?: Timestamp;
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
  workflowData?: {
    install?: any; // Install workflow data (room assessments, etc.)
    demo?: any; // Demo workflow data
    checkService?: any; // Check service workflow data
    pull?: any; // Pull workflow data
  };
  rooms: Room[];
  equipment: JobEquipment;
  dryingPlan?: DryingPlan; // NEW: Comprehensive drying plan
  additionalWork?: AdditionalWork; // NEW: General page billable items
  safetyChecklist: SafetyChecklist;
  communication: Communication;
  financial: Financial;
  documentation: Documentation;
  scheduledZone: Zone;
  scheduledTechnician: string;
  scheduledDate: Timestamp;
  arrivalWindow?: ArrivalWindow; // Preferred arrival time window
  customArrivalStart?: string; // For 'custom' window: HH:mm format
  customArrivalEnd?: string;   // For 'custom' window: HH:mm format
  metadata: JobMetadata;
  psmData?: PSMJobData; // PSM-specific data (office workflows)
}

// ============================================================================
// SUBCONTRACTOR REQUEST TYPES
// ============================================================================

export type SpecialistType =
  | 'Plumber'
  | 'Electrician'
  | 'HVAC Technician'
  | 'Asbestos Abatement'
  | 'Mold Remediation'
  | 'Structural Engineer'
  | 'Roofing Contractor'
  | 'Other';

export type UrgencyLevel = 'emergency' | 'urgent' | 'standard';
export type SubRequestStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface SubcontractorRequest {
  requestId: string;
  jobId: string;
  requestedBy: string; // MIT Tech UID
  requestedAt: Timestamp;

  specialistType: SpecialistType;
  otherSpecialistType?: string; // If specialistType is 'Other'
  urgency: UrgencyLevel;
  location: string; // Room name
  issueDescription: string;
  photos: string[]; // Photo URLs
  customerAware: boolean;

  status: SubRequestStatus;

  // MIT Lead actions
  assignedTo?: string; // Sub company/contact
  scheduledDate?: Timestamp;
  assignedBy?: string; // MIT Lead UID
  assignedAt?: Timestamp;

  // Completion tracking
  completedAt?: Timestamp;
  completedBy?: string;
  completionNotes?: string;
  charge?: number; // Billable amount
  chargeApproved?: boolean;

  // Notifications
  notifications?: Array<{
    sentTo: string;
    sentAt: Timestamp;
    type: 'request' | 'scheduled' | 'completed';
  }>;
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

// ============================================================================
// PSM (PROJECT SUPPORT MANAGER) TYPES
// ============================================================================

export type CommunicationType = 'call' | 'email' | 'meeting' | 'portal-message';
export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'partial';
export type InvoiceStatus = 'draft' | 'sent' | 'reviewed' | 'disputed' | 'approved' | 'paid';
export type RedFlagType =
  | 'equipment-variance'
  | 'missing-photos'
  | 'moisture-not-improving'
  | 'demo-no-reason'
  | 'no-adjuster-approval'
  | 'cost-overrun'
  | 'timeline-delay';
export type RedFlagSeverity = 'low' | 'medium' | 'high' | 'critical';
export type PSMPhaseStatus =
  | 'field-complete'
  | 'reviewing'
  | 'awaiting-adjuster'
  | 'approved'
  | 'invoiced';

export interface AdjusterCommunication {
  id: string;
  communicationType: CommunicationType;
  timestamp: Timestamp;
  contactedBy: string; // PSM name
  summary: string;
  questionsAsked: string[];
  answersProvided: string[];
  nextStep: string;
  followUpDate?: Timestamp;
}

export interface LineItemApproval {
  status: ApprovalStatus;
  requestedQty: number;
  approvedQty: number;
  denialReason?: string;
}

export interface ConditionalApproval {
  item: string;
  condition: string;
  conditionMet: boolean;
}

export interface ApprovalTracking {
  demoScope: ApprovalStatus;
  demoAmount: {
    requested: number;
    approved: number;
    deniedAmount: number;
    denialReason?: string;
  };
  equipmentPlan: ApprovalStatus;
  equipmentModifications?: string;
  billableItems: Record<string, LineItemApproval>;
  conditionalApprovals: ConditionalApproval[];
}

export interface HomeownerCommunication {
  id: string;
  timestamp: Timestamp;
  contactedBy: string;
  method: 'phone' | 'email' | 'in-person';
  topicsDiscussed: string[];
  questionsAsked: string[];
  nextContact?: Timestamp;
}

export interface DocumentationChecklist {
  allRoomsPhotographed: boolean;
  moistureReadingsComplete: boolean;
  equipmentScanned: boolean;
  demoDocumented: boolean;
  customerSignatures: boolean;
  matterportCompleted: boolean;
}

export interface DocumentationReview {
  checklist: DocumentationChecklist;
  missingItems: string[];
  reviewedBy: string;
  reviewedAt: Timestamp;
  readyForSubmission: boolean;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  approvalStatus: ApprovalStatus;
}

export interface Invoice {
  generated: boolean;
  generatedAt?: Timestamp;
  generatedBy?: string;
  invoiceNumber?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountDue: number;
  status: InvoiceStatus;
  sentToAdjusterAt?: Timestamp;
  approvedByAdjusterAt?: Timestamp;
  paidAt?: Timestamp;
}

export interface RedFlag {
  id: string;
  type: RedFlagType;
  severity: RedFlagSeverity;
  description: string;
  detectedAt: Timestamp;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Timestamp;
  resolutionNotes?: string;
}

export interface PSMPhase {
  status: PSMPhaseStatus;
  assignedPSM: string;
  startedReviewAt?: Timestamp;
  submittedToAdjusterAt?: Timestamp;
  approvedByAdjusterAt?: Timestamp;
  invoicedAt?: Timestamp;
  completedAt?: Timestamp;
  daysInPhase: number;
  notes: string;
}

export interface PSMJobData {
  adjusterCommunications: AdjusterCommunication[];
  approvalStatus: ApprovalTracking;
  homeownerCommunications: HomeownerCommunication[];
  documentationReview: DocumentationReview;
  invoice: Invoice;
  redFlags: RedFlag[];
  psmPhase: PSMPhase;
}

// ============================================================================
// PRICE DATABASE TYPES
// ============================================================================

export interface PriceItem {
  id: string;
  category: string;
  description: string;
  unitPrice: number;
  unit: 'each' | 'sqft' | 'linear-ft' | 'daily' | 'hourly';
  lastUpdated: Timestamp;
  updatedBy: string;
}

export interface PriceDatabase {
  items: Record<string, PriceItem>;
  version: number;
  lastUpdated: Timestamp;
}

// ============================================================================
// PHOTO DOCUMENTATION ENHANCEMENTS (Phases 1-5)
// ============================================================================

// Phase 1: Enhanced Photo Requirements
export interface RoomPhotoRequirements {
  overallPhotos: string[]; // Minimum 4: wide shot + damage close-ups
  moisturePhotos: string[]; // Minimum 2 per room with meter visible
  preExistingPhotos?: string[]; // Only if pre-existing damage flagged
  thermalPhotos?: string[]; // Optional thermal imaging
}

export interface MoisturePhotoData {
  photoUrl: string;
  materialType: ConstructionMaterialType;
  moisturePercent: number;
  timestamp: Timestamp;
  meterVisible: boolean; // Must show meter display + material
  notes?: string; // Optional tracking notes for next visit
}

// Phase 2: Equipment Tracking
export interface EquipmentPlacement {
  equipmentId: string;
  qrCode: string;
  roomId: string;
  roomName: string;
  photoUrl: string;
  placedAt: Timestamp;
  runtimeHours: number; // Starting at 0 for install
}

// Phase 3: Demo Workflow Enhancements
export type DisposalMethod = 'dumpster' | 'bags' | 'loose-materials' | 'other';

export interface DebrisDocumentation {
  disposalMethod: DisposalMethod;
  photos: string[]; // Required based on disposal method
  quantity?: number; // For bags
  description?: string; // For loose materials or other
}

export interface ExposedMaterialPhoto {
  photoUrl: string;
  materialType: ConstructionMaterialType;
  exposureType: 'wall-cavity' | 'subfloor' | 'structural' | 'insulation';
  timestamp: string; // ISO date string
  notes?: string;
}

export interface PPEDocumentation {
  respiratorsUsed: boolean;
  respiratorPhoto?: string;
  protectiveSuits: boolean;
  suitPhoto?: string;
  glovesType?: string;
  eyeProtection: boolean;
  containmentBarriers: boolean;
  containmentPhoto?: string;
  negativeAirPressure: boolean;
  negativeAirPhoto?: string;
  safetySignagePosted: boolean;
  signagePhoto?: string;
  otherPPE?: string;
  ppePhoto?: string; // General PPE in use photo
  notes?: string;
}

// Phase 4: Chamber Containment
export interface ContainmentBarrierSetup {
  hasBarrier: boolean;
  photos?: string[];
  plasticSqFt?: number;
  zipperUsed?: boolean;
  zipPolesUsed?: boolean;
  zipPolesCount?: number;
}

// Phase 4: Enhanced Signatures
export type PullSignatureType =
  | 'completion-acceptance'
  | 'equipment-removal'
  | 'final-walkthrough'
  | 'drying-release-waiver'
  | 'payment-acknowledgment';

export interface CustomerSignature {
  type: PullSignatureType;
  signatureDataUrl: string;
  signedAt: Timestamp;
  customerName: string;
  notes?: string;
}

// Phase 4: Drying Release Waiver
export interface DryingReleaseWaiver {
  materialId: string;
  roomName: string;
  materialType: ConstructionMaterialType;
  finalMoisturePercent: number;
  dryStandard: number;
  customerAcceptsRisk: boolean;
  customerSignature: string; // Signature data URL
  reasonForEarlyPull: string;
  photoUrl: string; // Photo of wet material
  createdAt: Timestamp;
}

// Phase 5: Matterport Integration
export interface MatterportScan {
  scanId: string;
  scanUrl?: string;
  capturedDuringWorkflow: 'check-service' | 'manual';
  capturedAfterDemo: boolean;
  visitNumber?: number; // Which check service visit
  capturedAt: Timestamp;
  capturedBy: string;
  verified: boolean;
  verifiedAt?: Timestamp;
}

// Enhanced Environmental Readings (Phase 2)
export interface EnvironmentalReading {
  chamberId: string;
  chamberName: string;
  temperature: number;
  relativeHumidity: number;
  gpp: number; // Grains per pound
  photoUrl: string; // Hygrometer showing all readings (REQUIRED)
  timestamp: Timestamp;
  technicianId: string;
}

// Equipment Runtime Documentation (Phase 2)
export interface EquipmentRuntimePhoto {
  equipmentId: string;
  qrCode: string;
  runtimeHours: number;
  photoUrl: string; // Display showing runtime hours
  settings?: {
    temperature?: number;
    humidity?: number;
    fanSpeed?: string;
  };
  timestamp: Timestamp;
  isWorking: boolean;
  issues?: string;
}

// Room Closeout Photos (Phase 2)
export interface RoomCloseoutPhoto {
  roomId: string;
  roomName: string;
  photoUrl: string; // Overall showing current conditions
  equipmentScanned: string[]; // QR codes of equipment in room
  changesObserved?: string;
  timestamp: Timestamp;
}

// Final Room Photos (Pull - Phase 2)
export interface FinalRoomPhoto {
  roomId: string;
  roomName: string;
  photoUrl: string; // Overall empty room, dry conditions
  concerns?: string;
  timestamp: Timestamp;
}

// Drying Curve Data (Phase 4)
export interface DryingCurveDataPoint {
  date: string; // ISO date string
  moisturePercent: number;
  visitNumber?: number;
  workflow: 'install' | 'check-service' | 'pull';
}

export interface DryingCurveData {
  materialId: string;
  roomName: string;
  materialType: ConstructionMaterialType;
  dryStandard: number;
  dataPoints: DryingCurveDataPoint[];
  trend: 'improving' | 'stable' | 'worsening' | 'unknown';
  projectedDryDate?: string; // ISO date string
}
