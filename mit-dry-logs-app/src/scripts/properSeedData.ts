/**
 * Proper Seed Data - Matches Job Interface
 *
 * Creates jobs with correct structure for:
 * - workflowPhases (not workHistory)
 * - psmData for PSM dashboard
 * - All required Job interface fields
 */

import { Timestamp } from 'firebase/firestore';
import { Job } from '../types';

// Helper to create timestamps relative to now
const daysAgo = (days: number, hours: number = 9) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return Timestamp.fromDate(date);
};

const hoursAgo = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return Timestamp.fromDate(date);
};

const now = () => Timestamp.now();

/**
 * JOB 1: Ready for PSM Review - Install completed
 * Shows in PSM dashboard with field work complete
 */
export const job1_ReadyForPSM: Job = {
  jobId: 'JOB-2024-001',

  customerInfo: {
    name: 'Martinez Family',
    address: '1247 Riverside Drive',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    phoneNumber: '(217) 555-3421',
    email: 'carlos.martinez@email.com',
    coordinates: {
      latitude: 39.7817,
      longitude: -89.6501,
    },
  },

  insuranceInfo: {
    carrierName: 'State Farm',
    policyNumber: 'SF-7842-3391',
    claimNumber: 'CLM-55482',
    adjusterName: 'Jennifer Wallace',
    adjusterPhone: '(312) 555-8821',
    adjusterEmail: 'jwallace@statefarm.com',
    deductible: 1000,
    estimatedValue: 8420,
    categoryOfWater: 'Category 1',
  },

  causeOfLoss: {
    type: 'Burst Pipe',
    description: 'Supply line to bathroom sink failed during cold snap',
    location: 'Master Bathroom vanity',
    discoveryDate: daysAgo(6, 7),
    eventDate: daysAgo(6, 2),
  },

  jobStatus: 'Pull',

  // CORRECT STRUCTURE: workflowPhases (not workHistory)
  workflowPhases: {
    install: {
      status: 'completed',
      startedAt: daysAgo(5, 9),
      completedAt: daysAgo(5, 13),
      technician: 'tech1',
      notes: 'Clean Category 1 burst pipe. Set containment, deployed equipment.',
    },
    demo: {
      status: 'completed',
      startedAt: daysAgo(4, 11),
      completedAt: daysAgo(4, 15),
      technician: 'tech1',
      notes: 'Removed drywall, baseboard, carpet & pad.',
    },
    checkService: {
      status: 'completed',
      visits: [
        {
          visitNumber: 1,
          startedAt: daysAgo(3, 10),
          completedAt: daysAgo(3, 10.5),
          technician: 'tech1',
          notes: 'Day 1: Good progress. All equipment operational.',
          readingsVerified: true,
        },
        {
          visitNumber: 2,
          startedAt: daysAgo(2, 10),
          completedAt: daysAgo(2, 10.5),
          technician: 'tech1',
          notes: 'Day 2: Bathroom studs now dry.',
          readingsVerified: true,
        },
        {
          visitNumber: 3,
          startedAt: daysAgo(1, 10),
          completedAt: daysAgo(1, 10.5),
          technician: 'tech1',
          notes: 'Day 3: All materials below 12%. Ready for pull.',
          readingsVerified: true,
        },
      ],
    },
    pull: {
      status: 'pending',
      notes: 'Awaiting MIT Lead approval to pull equipment.',
    },
  },

  rooms: [
    {
      roomId: 'room-001',
      name: 'Master Bathroom',
      type: 'Bathroom',
      dimensions: {
        length: 10,
        width: 8,
        height: 8,
        squareFootage: 80,
      },
      affectedStatus: 'affected',
      waterClass: 'Class 2',
      floor: {
        totalSqFt: 80,
        affectedSqFt: 80,
        percentAffected: 100,
        materials: [
          { type: 'tile', sqFt: 80 }
        ],
      },
      walls: {
        totalSqFt: 144,
        affectedSqFt: 48,
        percentAffected: 33,
        materials: [
          { type: 'drywall', sqFt: 144 }
        ],
      },
      ceiling: {
        totalSqFt: 80,
        affectedSqFt: 0,
        percentAffected: 0,
        materials: [
          { type: 'drywall', sqFt: 80 }
        ],
      },
      materialsAffected: [],
      moistureReadings: [],
      photos: [],
    },
  ],

  equipment: {
    chambers: [
      {
        chamberId: 'chamber-001',
        rooms: ['room-001'],
        dehumidifiers: [
          {
            equipmentId: 'DH-2401',
            serialNumber: 'PHOENIX-DH-2401',
            manufacturer: 'Phoenix',
            model: 'R175',
            deployedAt: daysAgo(5, 11),
            status: 'deployed',
            location: 'Master Bedroom',
          },
        ],
        airMovers: [
          {
            equipmentId: 'AM-1203',
            serialNumber: 'DRISTORM-AM-1203',
            manufacturer: 'Dri-Storm',
            model: 'Snail',
            deployedAt: daysAgo(5, 11),
            status: 'deployed',
            location: 'Master Bathroom',
          },
        ],
        airScrubbers: [],
      },
    ],
    calculations: {
      totalAffectedSquareFootage: 80,
      totalCubicFootage: 640,
      estimatedDryingDays: 5,
      recommendedDehumidifierCount: 1,
      recommendedAirMoverCount: 3,
      recommendedAirScrubberCount: 0,
      calculationMethod: 'IICRC S500',
      lastCalculatedAt: daysAgo(5, 10),
      calculatedBy: 'tech1',
      waterClass: 'Class 2',
      waterCategory: 'Category 1',
    },
  },

  safetyChecklist: {
    preArrivalInspection: true,
    containmentSetup: false,
    ppeEquipped: true,
    safetyConesPlaced: true,
    utilityLocations: {
      electrical: true,
      gas: true,
      water: true,
      verified: true,
      verifiedAt: daysAgo(5, 9),
    },
    hazardsIdentified: [],
  },

  communication: {
    groundRulesPresented: true,
    estimatedTimeline: '4-5 days',
    customerConcerns: [],
    preExistingConditions: [],
  },

  financial: {
    insuranceDeductible: 1000,
    estimatedMaterials: 250,
    estimatedLabor: 1495,
    estimatedTotal: 2111,
    actualExpenses: {
      materials: 250,
      labor: 1495,
      equipment: 365,
      total: 2110,
    },
    paymentStatus: 'unpaid',
    paymentMethod: 'insurance',
    payments: [],
  },

  documentation: {
    matterportScan: {
      completed: false,
    },
    certificateOfSatisfaction: {
      obtained: false,
    },
    dryReleaseWaiver: {
      needed: false,
      obtained: false,
    },
  },

  scheduledZone: 'Zone 1',
  scheduledTechnician: 'tech1',
  scheduledDate: daysAgo(5, 9),

  metadata: {
    createdAt: daysAgo(6, 8),
    createdBy: 'tech1',
    lastModifiedAt: hoursAgo(2),
    lastModifiedBy: 'tech1',
    version: 12,
  },

  // PSM DATA - This makes it show in PSM dashboard!
  psmData: {
    psmPhase: {
      status: 'field-complete',
      assignedPSM: 'Sarah Johnson',
      startedReviewAt: hoursAgo(2),
      daysInPhase: 0,
      notes: 'Field work complete, ready for PSM review',
    },
    redFlags: [
      {
        flagId: 'flag-001',
        type: 'documentation',
        severity: 'medium',
        description: 'Missing final moisture readings documentation',
        detectedAt: hoursAgo(2),
        resolved: false,
      },
    ],
    documentationReview: {
      photosComplete: true,
      moistureReadingsComplete: false,
      equipmentLogsComplete: true,
      workAuthorizationSigned: true,
      missingItems: ['Final moisture readings'],
      reviewedAt: hoursAgo(2),
      reviewedBy: 'PSM-001',
    },
    adjusterCommunications: [
      {
        communicationId: 'comm-001',
        adjusterName: 'Jennifer Wallace',
        contactMethod: 'email',
        timestamp: daysAgo(5),
        subject: 'Initial claim notification',
        summary: 'Adjuster notified of loss, confirmed coverage',
        followUpRequired: false,
        sentBy: 'tech1',
      },
    ],
    approvalStatus: {
      scopeApproved: true,
      scopeApprovedAt: daysAgo(5),
      scopeApprovedBy: 'Jennifer Wallace',
      estimateSubmitted: true,
      estimateSubmittedAt: daysAgo(4),
      estimateApproved: false,
      currentEstimateAmount: 2111,
      notes: 'Awaiting final estimate approval',
    },
    homeownerCommunications: [],
    invoice: {
      invoiceNumber: '',
      generatedAt: undefined,
      generatedBy: '',
      totalAmount: 0,
      lineItems: [],
      sentToAdjuster: false,
      paidInFull: false,
    },
  },
};

/**
 * JOB 2: In Check Service - Active monitoring
 */
export const job2_CheckService: Job = {
  jobId: 'JOB-2024-002',

  customerInfo: {
    name: 'Chen Residence',
    address: '892 Oak Valley Lane',
    city: 'Riverside',
    state: 'CA',
    zipCode: '92501',
    phoneNumber: '(951) 555-7821',
    email: 'david.chen@email.com',
    coordinates: {
      latitude: 33.9533,
      longitude: -117.3962,
    },
  },

  insuranceInfo: {
    carrierName: 'Farmers Insurance',
    policyNumber: 'FI-9823-7441',
    claimNumber: 'CLM-67234',
    adjusterName: 'Robert Kim',
    adjusterPhone: '(323) 555-9912',
    adjusterEmail: 'rkim@farmersinsurance.com',
    deductible: 2500,
    estimatedValue: 18500,
    categoryOfWater: 'Category 3',
  },

  causeOfLoss: {
    type: 'Sewage Backup',
    description: 'Main sewer line backed up into basement',
    location: 'Basement laundry room and recreation room',
    discoveryDate: daysAgo(2, 19),
    eventDate: daysAgo(2, 16),
  },

  jobStatus: 'Check Service',

  workflowPhases: {
    install: {
      status: 'completed',
      startedAt: daysAgo(1, 9),
      completedAt: daysAgo(1, 14),
      technician: 'tech1',
      notes: 'Category 3 sewage backup. Set containment, negative air.',
    },
    demo: {
      status: 'completed',
      startedAt: daysAgo(1, 15),
      completedAt: hoursAgo(18),
      technician: 'tech1',
      notes: 'Demo completed. All contaminated materials removed.',
    },
    checkService: {
      status: 'in-progress',
      startedAt: hoursAgo(6),
      technician: 'tech1',
      visits: [
        {
          visitNumber: 1,
          startedAt: hoursAgo(6),
          completedAt: hoursAgo(5.5),
          technician: 'tech1',
          notes: 'Day 1: Initial check after demo. All equipment operational.',
          readingsVerified: true,
        },
      ],
    },
    pull: {
      status: 'pending',
    },
  },

  rooms: [
    {
      roomId: 'room-004',
      name: 'Basement Laundry Room',
      type: 'Laundry',
      dimensions: {
        length: 12,
        width: 10,
        height: 8,
        squareFootage: 120,
      },
      affectedStatus: 'affected',
      waterClass: 'Class 3',
      floor: {
        totalSqFt: 120,
        affectedSqFt: 120,
        percentAffected: 100,
        materials: [{ type: 'concrete', sqFt: 120 }],
      },
      walls: {
        totalSqFt: 176,
        affectedSqFt: 176,
        percentAffected: 100,
        materials: [{ type: 'drywall', sqFt: 176 }],
      },
      ceiling: {
        totalSqFt: 120,
        affectedSqFt: 0,
        percentAffected: 0,
        materials: [{ type: 'drywall', sqFt: 120 }],
      },
      materialsAffected: [],
      moistureReadings: [],
      photos: [],
    },
  ],

  equipment: {
    chambers: [
      {
        chamberId: 'chamber-002',
        rooms: ['room-004'],
        dehumidifiers: [
          {
            equipmentId: 'DH-2301',
            serialNumber: 'PHOENIX-DH-2301',
            manufacturer: 'Phoenix',
            model: 'R200',
            deployedAt: daysAgo(1, 12),
            status: 'deployed',
            location: 'Basement Recreation Room',
          },
        ],
        airMovers: [
          {
            equipmentId: 'AM-1301',
            serialNumber: 'DRISTORM-AM-1301',
            manufacturer: 'Dri-Storm',
            model: 'Snail',
            deployedAt: daysAgo(1, 12),
            status: 'deployed',
            location: 'Basement Recreation Room',
          },
        ],
        airScrubbers: [
          {
            equipmentId: 'AS-0501',
            serialNumber: 'AIRKING-AS-0501',
            manufacturer: 'Air King',
            model: 'HEPA-500',
            deployedAt: daysAgo(1, 12),
            status: 'deployed',
            location: 'Basement hallway (negative pressure)',
          },
        ],
      },
    ],
    calculations: {
      totalAffectedSquareFootage: 440,
      totalCubicFootage: 3520,
      estimatedDryingDays: 7,
      recommendedDehumidifierCount: 2,
      recommendedAirMoverCount: 4,
      recommendedAirScrubberCount: 1,
      calculationMethod: 'IICRC S500 - Cat 3',
      lastCalculatedAt: daysAgo(1, 10),
      calculatedBy: 'tech1',
      waterClass: 'Class 3',
      waterCategory: 'Category 3',
    },
  },

  safetyChecklist: {
    preArrivalInspection: true,
    containmentSetup: true,
    ppeEquipped: true,
    safetyConesPlaced: true,
    utilityLocations: {
      electrical: true,
      gas: true,
      water: true,
      verified: true,
      verifiedAt: daysAgo(1, 9),
    },
    hazardsIdentified: [
      {
        hazardId: 'haz-001',
        type: 'Biological',
        description: 'Category 3 water - sewage contamination',
        mitigationSteps: 'Full PPE required, containment setup, negative air',
        resolved: true,
      },
    ],
  },

  communication: {
    groundRulesPresented: true,
    estimatedTimeline: '7-10 days',
    customerConcerns: ['Strong odor', 'Health concerns'],
    preExistingConditions: [],
  },

  financial: {
    insuranceDeductible: 2500,
    estimatedMaterials: 1790,
    estimatedLabor: 1976,
    estimatedTotal: 4295,
    actualExpenses: {
      materials: 1790,
      labor: 1976,
      equipment: 304,
      total: 4070,
    },
    paymentStatus: 'unpaid',
    paymentMethod: 'insurance',
    payments: [],
  },

  documentation: {
    matterportScan: {
      completed: false,
    },
    certificateOfSatisfaction: {
      obtained: false,
    },
    dryReleaseWaiver: {
      needed: false,
      obtained: false,
    },
  },

  scheduledZone: 'Zone 1',
  scheduledTechnician: 'tech1',
  scheduledDate: daysAgo(1, 9),

  metadata: {
    createdAt: daysAgo(2, 20),
    createdBy: 'tech1',
    lastModifiedAt: hoursAgo(1),
    lastModifiedBy: 'tech1',
    version: 4,
  },

  // NO PSM DATA YET - job still in progress
};

/**
 * JOB 3: Completed and Invoiced - PSM work done
 */
export const job3_Completed: Job = {
  jobId: 'JOB-2024-003',

  customerInfo: {
    name: 'Thompson Family',
    address: '2156 Wintergreen Circle',
    city: 'Minneapolis',
    state: 'MN',
    zipCode: '55401',
    phoneNumber: '(612) 555-8844',
    email: 'sarah.thompson@email.com',
    coordinates: {
      latitude: 44.9778,
      longitude: -93.2650,
    },
  },

  insuranceInfo: {
    carrierName: 'Allstate',
    policyNumber: 'ALL-MN-44521',
    claimNumber: 'CLM-77665',
    adjusterName: 'Linda Chen',
    adjusterPhone: '(866) 555-2200',
    adjusterEmail: 'lchen@allstate.com',
    deductible: 1500,
    estimatedValue: 12000,
    categoryOfWater: 'Category 1',
  },

  causeOfLoss: {
    type: 'Ice Dam',
    description: 'Ice dam on north-facing roof caused water infiltration',
    location: 'Attic and Master Bedroom',
    discoveryDate: daysAgo(10, 18),
    eventDate: daysAgo(10, 15),
  },

  jobStatus: 'Complete',

  workflowPhases: {
    install: {
      status: 'completed',
      startedAt: daysAgo(9, 9),
      completedAt: daysAgo(9, 13),
      technician: 'tech1',
      notes: 'Ice dam mitigation. Equipment deployed.',
    },
    demo: {
      status: 'completed',
      startedAt: daysAgo(8, 10),
      completedAt: daysAgo(8, 14),
      technician: 'tech1',
      notes: 'Removed affected ceiling drywall and insulation.',
    },
    checkService: {
      status: 'completed',
      visits: [
        {
          visitNumber: 1,
          startedAt: daysAgo(7, 10),
          completedAt: daysAgo(7, 10.5),
          technician: 'tech1',
          notes: 'Day 1 check complete',
          readingsVerified: true,
        },
        {
          visitNumber: 2,
          startedAt: daysAgo(6, 10),
          completedAt: daysAgo(6, 10.5),
          technician: 'tech1',
          notes: 'Day 2 check complete',
          readingsVerified: true,
        },
        {
          visitNumber: 3,
          startedAt: daysAgo(5, 10),
          completedAt: daysAgo(5, 10.5),
          technician: 'tech1',
          notes: 'All dry, ready for pull',
          readingsVerified: true,
        },
      ],
    },
    pull: {
      status: 'completed',
      startedAt: daysAgo(4, 10),
      completedAt: daysAgo(4, 11),
      technician: 'tech1',
      notes: 'Equipment pulled, site clean.',
    },
  },

  rooms: [
    {
      roomId: 'room-010',
      name: 'Master Bedroom',
      type: 'Bedroom',
      dimensions: {
        length: 16,
        width: 14,
        height: 8,
        squareFootage: 224,
      },
      affectedStatus: 'affected',
      waterClass: 'Class 2',
      floor: {
        totalSqFt: 224,
        affectedSqFt: 60,
        percentAffected: 27,
        materials: [{ type: 'carpet', sqFt: 224 }],
      },
      walls: {
        totalSqFt: 240,
        affectedSqFt: 48,
        percentAffected: 20,
        materials: [{ type: 'drywall', sqFt: 240 }],
      },
      ceiling: {
        totalSqFt: 224,
        affectedSqFt: 40,
        percentAffected: 18,
        materials: [{ type: 'drywall', sqFt: 224 }],
      },
      materialsAffected: [],
      moistureReadings: [],
      photos: [],
    },
  ],

  equipment: {
    chambers: [
      {
        chamberId: 'chamber-003',
        rooms: ['room-010'],
        dehumidifiers: [
          {
            equipmentId: 'DH-2501',
            serialNumber: 'PHOENIX-DH-2501',
            manufacturer: 'Phoenix',
            model: 'R175',
            deployedAt: daysAgo(9, 10),
            status: 'retrieved',
            location: 'Master Bedroom',
            retrievedAt: daysAgo(4, 10),
          },
        ],
        airMovers: [
          {
            equipmentId: 'AM-1501',
            serialNumber: 'DRISTORM-AM-1501',
            manufacturer: 'Dri-Storm',
            model: 'Snail',
            deployedAt: daysAgo(9, 10),
            status: 'retrieved',
            location: 'Master Bedroom',
            retrievedAt: daysAgo(4, 10),
          },
        ],
        airScrubbers: [],
      },
    ],
    calculations: {
      totalAffectedSquareFootage: 224,
      totalCubicFootage: 1792,
      estimatedDryingDays: 5,
      recommendedDehumidifierCount: 1,
      recommendedAirMoverCount: 2,
      recommendedAirScrubberCount: 0,
      calculationMethod: 'IICRC S500',
      lastCalculatedAt: daysAgo(9, 10),
      calculatedBy: 'tech1',
      waterClass: 'Class 2',
      waterCategory: 'Category 1',
    },
  },

  safetyChecklist: {
    preArrivalInspection: true,
    containmentSetup: false,
    ppeEquipped: true,
    safetyConesPlaced: true,
    utilityLocations: {
      electrical: true,
      gas: true,
      water: true,
      verified: true,
      verifiedAt: daysAgo(9, 9),
    },
    hazardsIdentified: [],
  },

  communication: {
    groundRulesPresented: true,
    estimatedTimeline: '5-7 days',
    customerConcerns: [],
    preExistingConditions: [],
  },

  financial: {
    insuranceDeductible: 1500,
    estimatedMaterials: 450,
    estimatedLabor: 1200,
    estimatedTotal: 2055,
    actualExpenses: {
      materials: 450,
      labor: 1200,
      equipment: 405,
      total: 2055,
    },
    paymentStatus: 'paid',
    paymentMethod: 'insurance',
    payments: [
      {
        paymentId: 'pay-001',
        amount: 2055,
        timestamp: daysAgo(2),
        method: 'insurance',
        processedBy: 'PSM-001',
      },
    ],
  },

  documentation: {
    matterportScan: {
      completed: true,
      url: 'https://matterport.com/scan/12345',
      scanDate: daysAgo(4),
    },
    certificateOfSatisfaction: {
      obtained: true,
      signedDate: daysAgo(4),
    },
    dryReleaseWaiver: {
      needed: false,
      obtained: false,
    },
  },

  scheduledZone: 'Zone 2',
  scheduledTechnician: 'tech1',
  scheduledDate: daysAgo(9, 9),

  metadata: {
    createdAt: daysAgo(10, 18),
    createdBy: 'tech1',
    lastModifiedAt: daysAgo(2),
    lastModifiedBy: 'PSM-001',
    version: 15,
  },

  // PSM DATA - Completed and invoiced
  psmData: {
    psmPhase: {
      status: 'invoiced',
      assignedPSM: 'Sarah Johnson',
      startedReviewAt: daysAgo(4),
      submittedToAdjusterAt: daysAgo(3),
      approvedByAdjusterAt: daysAgo(2),
      invoicedAt: daysAgo(2),
      completedAt: daysAgo(2),
      daysInPhase: 2,
      notes: 'Job completed successfully, invoice paid',
    },
    redFlags: [],
    documentationReview: {
      photosComplete: true,
      moistureReadingsComplete: true,
      equipmentLogsComplete: true,
      workAuthorizationSigned: true,
      missingItems: [],
      reviewedAt: daysAgo(4),
      reviewedBy: 'PSM-001',
    },
    adjusterCommunications: [
      {
        communicationId: 'comm-002',
        adjusterName: 'Linda Chen',
        contactMethod: 'email',
        timestamp: daysAgo(9),
        subject: 'Initial claim',
        summary: 'Claim opened, coverage confirmed',
        followUpRequired: false,
        sentBy: 'tech1',
      },
      {
        communicationId: 'comm-003',
        adjusterName: 'Linda Chen',
        contactMethod: 'phone',
        timestamp: daysAgo(3),
        subject: 'Final invoice submitted',
        summary: 'Invoice approved for payment',
        followUpRequired: false,
        sentBy: 'PSM-001',
      },
    ],
    approvalStatus: {
      scopeApproved: true,
      scopeApprovedAt: daysAgo(9),
      scopeApprovedBy: 'Linda Chen',
      estimateSubmitted: true,
      estimateSubmittedAt: daysAgo(3),
      estimateApproved: true,
      estimateApprovedAt: daysAgo(2),
      estimateApprovedBy: 'Linda Chen',
      currentEstimateAmount: 2055,
      notes: 'Approved and paid in full',
    },
    homeownerCommunications: [],
    invoice: {
      invoiceNumber: 'INV-2024-003',
      generatedAt: daysAgo(3),
      generatedBy: 'PSM-001',
      totalAmount: 2055,
      lineItems: [
        {
          description: 'Equipment rental (5 days)',
          quantity: 5,
          rate: 81,
          total: 405,
        },
        {
          description: 'Labor - Install/Demo/Check/Pull',
          quantity: 1,
          rate: 1200,
          total: 1200,
        },
        {
          description: 'Materials and disposal',
          quantity: 1,
          rate: 450,
          total: 450,
        },
      ],
      sentToAdjuster: true,
      sentToAdjusterAt: daysAgo(3),
      paidInFull: true,
      paidAt: daysAgo(2),
    },
  },
};

// Export all jobs
export const properSeedJobs: Job[] = [
  job1_ReadyForPSM,
  job2_CheckService,
  job3_Completed,
];
