/**
 * Comprehensive Seed Data - Insanely Great Edition
 *
 * Each job tells a complete story with realistic data at different workflow phases.
 * This demonstrates the full power of the drylog elimination system.
 *
 * Philosophy: Data should feel alive, not generated.
 * Every number, every reading, every timestamp tells part of the restoration story.
 */

import { Timestamp } from 'firebase/firestore';

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

/**
 * JOB 1: BURST PIPE - READY FOR PULL
 * Category 1, small 2-bedroom condo, 5 days in
 * All readings < 12%, ready for equipment removal
 * Perfect example of successful drying
 */
export const job1_BurstPipe_ReadyForPull = {
  jobId: 'JOB-2024-001',
  customerInfo: {
    name: 'Martinez Family',
    address: '1247 Riverside Drive',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    phoneNumber: '(217) 555-3421',
    email: 'carlos.martinez@email.com',
    propertyType: 'residential',
    occupancyStatus: 'occupied',
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

  propertyAddress: {
    street: '1247 Riverside Drive',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    propertyType: 'residential',
  },

  causeOfLoss: {
    type: 'Burst Pipe',
    description: 'Supply line to bathroom sink failed during cold snap',
    location: 'Master Bathroom vanity',
    discoveryDate: daysAgo(6, 7), // Discovered 6 days ago at 7am
    eventDate: daysAgo(6, 2), // Happened overnight
    affectedAreas: ['Master Bathroom', 'Master Bedroom', 'Hallway'],
  },

  jobStatus: 'Pull',
  startDate: daysAgo(5, 9), // Install was 5 days ago

  // Complete room structure with full journey
  rooms: [
    {
      roomId: 'room-001',
      roomName: 'Master Bathroom',
      roomType: 'bathroom',
      dimensions: {
        length: 10,
        width: 8,
        height: 8,
        squareFootage: 80,
        cubicFootage: 640,
      },
      affectedStatus: 'affected',
      moistureReadings: [
        // Install day (5 days ago) - wet
        {
          readingId: 'reading-001',
          material: 'Drywall',
          location: 'North wall, behind vanity',
          reading: 28.5,
          temperature: 68,
          humidity: 65,
          timestamp: daysAgo(5, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-002',
          material: 'Subfloor',
          location: 'Under vanity',
          reading: 35.2,
          temperature: 68,
          humidity: 65,
          timestamp: daysAgo(5, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        // Post-demo (4 days ago)
        {
          readingId: 'reading-003',
          material: 'Wall Studs',
          location: 'Behind removed drywall',
          reading: 22.8,
          temperature: 70,
          humidity: 58,
          timestamp: daysAgo(4, 14),
          readingType: 'post-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-004',
          material: 'Subfloor',
          location: 'Exposed area',
          reading: 28.4,
          temperature: 70,
          humidity: 58,
          timestamp: daysAgo(4, 14),
          readingType: 'post-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        // Day 1 check (3 days ago)
        {
          readingId: 'reading-005',
          material: 'Wall Studs',
          location: 'Behind removed drywall',
          reading: 16.2,
          temperature: 72,
          humidity: 48,
          timestamp: daysAgo(3, 10),
          readingType: 'daily-check',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-006',
          material: 'Subfloor',
          location: 'Exposed area',
          reading: 19.8,
          temperature: 72,
          humidity: 48,
          timestamp: daysAgo(3, 10),
          readingType: 'daily-check',
          technician: 'Mike Johnson',
          isDry: false,
        },
        // Day 2 check (2 days ago)
        {
          readingId: 'reading-007',
          material: 'Wall Studs',
          location: 'Behind removed drywall',
          reading: 11.8,
          temperature: 73,
          humidity: 42,
          timestamp: daysAgo(2, 10),
          readingType: 'daily-check',
          technician: 'Mike Johnson',
          isDry: true, // Just crossed threshold!
        },
        {
          readingId: 'reading-008',
          material: 'Subfloor',
          location: 'Exposed area',
          reading: 14.2,
          temperature: 73,
          humidity: 42,
          timestamp: daysAgo(2, 10),
          readingType: 'daily-check',
          technician: 'Mike Johnson',
          isDry: false,
        },
        // Day 3 check (yesterday)
        {
          readingId: 'reading-009',
          material: 'Wall Studs',
          location: 'Behind removed drywall',
          reading: 10.4,
          temperature: 74,
          humidity: 40,
          timestamp: daysAgo(1, 10),
          readingType: 'daily-check',
          technician: 'Mike Johnson',
          isDry: true,
        },
        {
          readingId: 'reading-010',
          material: 'Subfloor',
          location: 'Exposed area',
          reading: 11.2,
          temperature: 74,
          humidity: 40,
          timestamp: daysAgo(1, 10),
          readingType: 'daily-check',
          technician: 'Mike Johnson',
          isDry: true, // Now dry!
        },
      ],
      affectedMaterials: [
        {
          material: 'Drywall',
          quantity: 16,
          unit: 'LF',
          height: 'up to 2ft',
          removed: true,
          removalDate: daysAgo(4, 13),
        },
        {
          material: 'Baseboard',
          quantity: 16,
          unit: 'LF',
          removed: true,
          removalDate: daysAgo(4, 13),
        },
        {
          material: 'Tile',
          quantity: 12,
          unit: 'SF',
          removed: false,
          notes: 'Tile intact, dried in place',
        },
      ],
    },
    {
      roomId: 'room-002',
      roomName: 'Master Bedroom',
      roomType: 'bedroom',
      dimensions: {
        length: 14,
        width: 12,
        height: 8,
        squareFootage: 168,
        cubicFootage: 1344,
      },
      affectedStatus: 'affected',
      moistureReadings: [
        // Install - carpet and pad wet
        {
          readingId: 'reading-011',
          material: 'Carpet Pad Area',
          location: 'Near bathroom wall',
          reading: 42.1,
          temperature: 68,
          humidity: 62,
          timestamp: daysAgo(5, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-012',
          material: 'Subfloor',
          location: 'Under wet carpet',
          reading: 31.5,
          temperature: 68,
          humidity: 62,
          timestamp: daysAgo(5, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        // Post-demo - carpet/pad removed
        {
          readingId: 'reading-013',
          material: 'Subfloor',
          location: 'Exposed after carpet removal',
          reading: 24.8,
          temperature: 71,
          humidity: 55,
          timestamp: daysAgo(4, 14),
          readingType: 'post-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        // Progressive daily checks showing good drying
        {
          readingId: 'reading-014',
          material: 'Subfloor',
          location: 'Center of room',
          reading: 18.2,
          temperature: 73,
          humidity: 45,
          timestamp: daysAgo(3, 10),
          readingType: 'daily-check',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-015',
          material: 'Subfloor',
          location: 'Center of room',
          reading: 12.8,
          temperature: 74,
          humidity: 42,
          timestamp: daysAgo(2, 10),
          readingType: 'daily-check',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-016',
          material: 'Subfloor',
          location: 'Center of room',
          reading: 10.1,
          temperature: 74,
          humidity: 39,
          timestamp: daysAgo(1, 10),
          readingType: 'daily-check',
          technician: 'Mike Johnson',
          isDry: true, // Dry!
        },
      ],
      affectedMaterials: [
        {
          material: 'Carpet',
          quantity: 168,
          unit: 'SF',
          removed: true,
          removalDate: daysAgo(4, 12),
        },
        {
          material: 'Carpet Pad',
          quantity: 168,
          unit: 'SF',
          removed: true,
          removalDate: daysAgo(4, 12),
        },
        {
          material: 'Baseboard',
          quantity: 52,
          unit: 'LF',
          removed: true,
          removalDate: daysAgo(4, 12),
        },
      ],
    },
    {
      roomId: 'room-003',
      roomName: 'Living Room',
      roomType: 'living-room',
      dimensions: {
        length: 16,
        width: 14,
        height: 8,
        squareFootage: 224,
        cubicFootage: 1792,
      },
      affectedStatus: 'unaffected',
      isReferenceRoom: true, // This is the baseline room
      moistureReadings: [
        // Reference room readings - consistent across all visits
        {
          readingId: 'reading-ref-001',
          material: 'Reference Room',
          location: 'Center of room',
          reading: 8.2,
          temperature: 71,
          humidity: 45,
          timestamp: daysAgo(5, 10),
          readingType: 'reference',
          technician: 'Mike Johnson',
          isDry: true,
        },
      ],
    },
  ],

  // Equipment deployed with full tracking
  equipment: [
    {
      equipmentId: 'DH-2401',
      type: 'Dehumidifier',
      serialNumber: 'PHOENIX-DH-2401',
      manufacturer: 'Phoenix',
      model: 'R175',
      location: 'Master Bedroom',
      deployedAt: daysAgo(5, 11),
      status: 'operational',
      dailyCheckHistory: [
        { date: daysAgo(4, 10), status: 'operational', hoursRun: 24 },
        { date: daysAgo(3, 10), status: 'operational', hoursRun: 48 },
        { date: daysAgo(2, 10), status: 'operational', hoursRun: 72 },
        { date: daysAgo(1, 10), status: 'operational', hoursRun: 96 },
      ],
    },
    {
      equipmentId: 'AM-1203',
      type: 'Air Mover',
      serialNumber: 'DRISTORM-AM-1203',
      manufacturer: 'Dri-Storm',
      model: 'Snail',
      location: 'Master Bathroom',
      deployedAt: daysAgo(5, 11),
      status: 'operational',
    },
    {
      equipmentId: 'AM-1204',
      type: 'Air Mover',
      serialNumber: 'DRISTORM-AM-1204',
      manufacturer: 'Dri-Storm',
      model: 'Snail',
      location: 'Master Bedroom',
      deployedAt: daysAgo(5, 11),
      status: 'operational',
    },
    {
      equipmentId: 'AM-1205',
      type: 'Air Mover',
      serialNumber: 'DRISTORM-AM-1205',
      manufacturer: 'Dri-Storm',
      model: 'Snail',
      location: 'Hallway',
      deployedAt: daysAgo(5, 11),
      status: 'operational',
    },
  ],

  // Work history showing complete journey
  workHistory: {
    install: {
      status: 'completed',
      startedAt: daysAgo(5, 9),
      completedAt: daysAgo(5, 13),
      technician: 'Mike Johnson',
      arrivalTime: '09:15',
      departureTime: '13:45',
      isAfterHours: false,
      totalHours: 4.5,
      notes: 'Clean Category 1 burst pipe. Set containment, deployed 1 dehu + 3 movers. Good cooperation from homeowner.',
      environmentalBaseline: {
        outsideTemp: 42,
        outsideHumidity: 68,
        referenceRoomTemp: 71,
        referenceRoomHumidity: 45,
      },
    },
    demo: {
      status: 'completed',
      startedAt: daysAgo(4, 11),
      completedAt: daysAgo(4, 15),
      technician: 'Mike Johnson',
      techCount: 2,
      arrivalTime: '11:20',
      departureTime: '15:40',
      isAfterHours: false,
      totalHours: 4.3,
      notes: 'Removed drywall, baseboard, carpet & pad. Exposed subfloor drying well. 2 truck loads to dump.',
      debrisRemoval: [
        { type: 'truck-load', count: 2, notes: 'Carpet, pad, drywall' },
      ],
      ppeUsed: [], // Category 1 - no special PPE needed
    },
    checkService: {
      status: 'completed',
      visits: [
        {
          visitNumber: 1,
          date: daysAgo(3),
          startedAt: daysAgo(3, 10),
          completedAt: daysAgo(3, 10.5),
          technician: 'Mike Johnson',
          notes: 'Day 1: Good progress. Readings dropping. All equipment operational.',
          readingsVerified: true,
          equipmentAdjustments: [],
        },
        {
          visitNumber: 2,
          date: daysAgo(2),
          startedAt: daysAgo(2, 10),
          completedAt: daysAgo(2, 10.5),
          technician: 'Mike Johnson',
          notes: 'Day 2: Bathroom studs now dry. Bedroom subfloor still at 12.8%. One more day needed.',
          readingsVerified: true,
          equipmentAdjustments: [],
        },
        {
          visitNumber: 3,
          date: daysAgo(1),
          startedAt: daysAgo(1, 10),
          completedAt: daysAgo(1, 10.5),
          technician: 'Mike Johnson',
          notes: 'Day 3: All materials now below 12%. Ready for pull. Called lead for approval.',
          readingsVerified: true,
          equipmentAdjustments: [],
        },
      ],
    },
    pull: {
      status: 'pending',
      leadApprovalRequired: true,
      leadApproved: false,
      notes: 'Awaiting MIT Lead approval to pull equipment.',
    },
  },

  // Financial tracking
  financial: {
    equipment: {
      dehumidifiers: { count: 1, days: 5, rate: 29.23, total: 146.15 },
      airMovers: { count: 3, days: 5, rate: 14.62, total: 219.30 },
      totalEquipment: 365.45,
    },
    labor: {
      install: { hours: 4.5, rate: 85, total: 382.50 },
      demo: { hours: 4.3, techs: 2, rate: 85, total: 730.50 },
      checkService: { hours: 1.5, visits: 3, rate: 85, total: 382.50 },
      totalLabor: 1495.50,
    },
    materials: {
      containment: { sf: 0, rate: 0, total: 0 }, // No containment needed
      disposal: { truckLoads: 2, rate: 125, total: 250 },
      totalMaterials: 250,
    },
    estimatedTotal: 2110.95,
  },

  scheduledDate: daysAgo(5, 9),
  scheduledTechnician: 'tech1',
  scheduledZone: 'Zone 1',

  metadata: {
    createdAt: daysAgo(6, 8),
    createdBy: 'tech1',
    lastModifiedAt: hoursAgo(2),
    lastModifiedBy: 'tech1',
    version: 12, // Has been updated 12 times through journey
  },
};

/**
 * JOB 2: SEWAGE BACKUP - DEMO PHASE
 * Category 3, requires PPE and decontamination
 * Currently in demo workflow, materials marked for removal
 * Shows revenue-protecting details for Cat 3 jobs
 */
export const job2_SewageBackup_DemoPhase = {
  jobId: 'JOB-2024-002',
  customerInfo: {
    name: 'Chen Residence',
    address: '892 Oak Valley Lane',
    city: 'Riverside',
    state: 'CA',
    zipCode: '92501',
    phoneNumber: '(951) 555-7821',
    email: 'david.chen@email.com',
    propertyType: 'residential',
    occupancyStatus: 'occupied',
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
    categoryOfWater: 'Category 3', // Critical - drives PPE and decon charges
  },

  propertyAddress: {
    street: '892 Oak Valley Lane',
    city: 'Riverside',
    state: 'CA',
    zipCode: '92501',
    propertyType: 'residential',
  },

  causeOfLoss: {
    type: 'Sewage Backup',
    description: 'Main sewer line backed up into basement. Category 3 contamination.',
    location: 'Basement laundry room and recreation room',
    discoveryDate: daysAgo(2, 19), // Discovered 2 days ago evening
    eventDate: daysAgo(2, 16), // Happened during day
    affectedAreas: ['Basement Laundry Room', 'Basement Recreation Room', 'Basement Bathroom'],
  },

  jobStatus: 'Demo',
  startDate: daysAgo(1, 9), // Install was yesterday

  rooms: [
    {
      roomId: 'room-004',
      roomName: 'Basement Laundry Room',
      roomType: 'laundry',
      dimensions: {
        length: 12,
        width: 10,
        height: 8,
        squareFootage: 120,
        cubicFootage: 960,
      },
      affectedStatus: 'affected',
      moistureReadings: [
        // Install readings - heavily contaminated
        {
          readingId: 'reading-017',
          material: 'Concrete Slab',
          location: 'Center of room',
          reading: 48.2,
          temperature: 65,
          humidity: 82,
          timestamp: daysAgo(1, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-018',
          material: 'Drywall',
          location: 'South wall',
          reading: 52.1,
          temperature: 65,
          humidity: 82,
          timestamp: daysAgo(1, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-019',
          material: 'Baseboard',
          location: 'All walls',
          reading: 65.3,
          temperature: 65,
          humidity: 82,
          timestamp: daysAgo(1, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
      ],
      // Demo plan - materials marked for removal (drives billing)
      affectedMaterials: [
        {
          material: 'Drywall',
          quantity: 44, // All 4 walls
          unit: 'LF',
          height: 'up to 4ft', // Flood cut
          removed: false, // Not removed yet - demo scheduled for today
          plannedRemoval: true,
          estimatedCost: 880, // 44 LF × $20/LF
        },
        {
          material: 'Baseboard',
          quantity: 44,
          unit: 'LF',
          removed: false,
          plannedRemoval: true,
          estimatedCost: 220,
        },
        {
          material: 'Insulation',
          quantity: 120,
          unit: 'SF',
          removed: false,
          plannedRemoval: true,
          notes: 'Contaminated insulation must be removed',
          estimatedCost: 360,
        },
      ],
    },
    {
      roomId: 'room-005',
      roomName: 'Basement Recreation Room',
      roomType: 'recreation',
      dimensions: {
        length: 20,
        width: 16,
        height: 8,
        squareFootage: 320,
        cubicFootage: 2560,
      },
      affectedStatus: 'affected',
      moistureReadings: [
        {
          readingId: 'reading-020',
          material: 'Carpet Pad Area',
          location: 'Throughout room',
          reading: 78.5, // Saturated
          temperature: 64,
          humidity: 85,
          timestamp: daysAgo(1, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-021',
          material: 'Subfloor',
          location: 'Under carpet',
          reading: 42.8,
          temperature: 64,
          humidity: 85,
          timestamp: daysAgo(1, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
        {
          readingId: 'reading-022',
          material: 'Drywall',
          location: 'West wall',
          reading: 38.2,
          temperature: 64,
          humidity: 85,
          timestamp: daysAgo(1, 10),
          readingType: 'pre-demo',
          technician: 'Mike Johnson',
          isDry: false,
        },
      ],
      affectedMaterials: [
        {
          material: 'Carpet',
          quantity: 320,
          unit: 'SF',
          removed: false,
          plannedRemoval: true,
          estimatedCost: 960, // Cat 3 - special handling
          notes: 'Category 3 contamination - dispose as hazardous',
        },
        {
          material: 'Carpet Pad',
          quantity: 320,
          unit: 'SF',
          removed: false,
          plannedRemoval: true,
          estimatedCost: 480,
        },
        {
          material: 'Drywall',
          quantity: 72, // Perimeter walls
          unit: 'LF',
          height: 'up to 2ft',
          removed: false,
          plannedRemoval: true,
          estimatedCost: 1080,
        },
        {
          material: 'Baseboard',
          quantity: 72,
          unit: 'LF',
          removed: false,
          plannedRemoval: true,
          estimatedCost: 360,
        },
      ],
    },
    {
      roomId: 'room-006',
      roomName: 'Main Floor Living Room',
      roomType: 'living-room',
      dimensions: {
        length: 18,
        width: 15,
        height: 8,
        squareFootage: 270,
        cubicFootage: 2160,
      },
      affectedStatus: 'unaffected',
      isReferenceRoom: true,
      moistureReadings: [
        {
          readingId: 'reading-ref-002',
          material: 'Reference Room',
          location: 'Center',
          reading: 7.8,
          temperature: 72,
          humidity: 42,
          timestamp: daysAgo(1, 10),
          readingType: 'reference',
          technician: 'Mike Johnson',
          isDry: true,
        },
      ],
    },
  ],

  // Equipment with special Cat 3 requirements
  equipment: [
    {
      equipmentId: 'DH-2301',
      type: 'Dehumidifier',
      serialNumber: 'PHOENIX-DH-2301',
      manufacturer: 'Phoenix',
      model: 'R200',
      location: 'Basement Recreation Room',
      deployedAt: daysAgo(1, 12),
      status: 'operational',
      needsDecontamination: true, // Category 3!
      decontaminationCharge: 38.68,
    },
    {
      equipmentId: 'DH-2302',
      type: 'Dehumidifier',
      serialNumber: 'PHOENIX-DH-2302',
      manufacturer: 'Phoenix',
      model: 'R175',
      location: 'Basement Laundry Room',
      deployedAt: daysAgo(1, 12),
      status: 'operational',
      needsDecontamination: true,
      decontaminationCharge: 38.68,
    },
    {
      equipmentId: 'AM-1301',
      type: 'Air Mover',
      serialNumber: 'DRISTORM-AM-1301',
      manufacturer: 'Dri-Storm',
      model: 'Snail',
      location: 'Basement Recreation Room',
      deployedAt: daysAgo(1, 12),
      status: 'operational',
      needsDecontamination: true,
      decontaminationCharge: 38.68,
    },
    {
      equipmentId: 'AM-1302',
      type: 'Air Mover',
      serialNumber: 'DRISTORM-AM-1302',
      manufacturer: 'Dri-Storm',
      model: 'Snail',
      location: 'Basement Laundry Room',
      deployedAt: daysAgo(1, 12),
      status: 'operational',
      needsDecontamination: true,
      decontaminationCharge: 38.68,
    },
    {
      equipmentId: 'AS-0501',
      type: 'Air Scrubber',
      serialNumber: 'AIRKING-AS-0501',
      manufacturer: 'Air King',
      model: 'HEPA-500',
      location: 'Basement hallway (negative pressure)',
      deployedAt: daysAgo(1, 12),
      status: 'operational',
      needsDecontamination: true,
      decontaminationCharge: 38.68,
    },
  ],

  workHistory: {
    install: {
      status: 'completed',
      startedAt: daysAgo(1, 9),
      completedAt: daysAgo(1, 14),
      technician: 'Mike Johnson',
      arrivalTime: '09:00',
      departureTime: '14:15',
      isAfterHours: false,
      totalHours: 5.25,
      notes: 'Category 3 sewage backup. Set 6mil poly containment (440 SF). Negative air pressure with HEPA scrubber. All techs in Tyvek suits, N95, gloves, boots. Microbial testing scheduled.',
      environmentalBaseline: {
        outsideTemp: 68,
        outsideHumidity: 55,
        referenceRoomTemp: 72,
        referenceRoomHumidity: 42,
      },
      specialCharges: [
        { item: 'Containment setup', quantity: 440, unit: 'SF', rate: 1.50, total: 660 },
        { item: 'Microbial testing', quantity: 1, unit: 'EA', rate: 350, total: 350 },
        { item: 'Antimicrobial treatment', quantity: 440, unit: 'SF', rate: 0.75, total: 330 },
      ],
    },
    demo: {
      status: 'in-progress',
      scheduledFor: hoursAgo(-2), // Scheduled for 2 hours from now
      techCount: 3, // Needs 3 techs for this scope
      estimatedDuration: 6,
      notes: 'Demo crew assigned. Will need large dumpster. All PPE required. Decontaminate all equipment after.',
      demoChecklist: {
        ppeVerified: false,
        containmentVerified: false,
        negativeAirRunning: false,
        wasteContainersReady: false,
      },
    },
  },

  // Financial - shows Cat 3 upcharges
  financial: {
    equipment: {
      dehumidifiers: { count: 2, days: 1, rate: 29.23, total: 58.46 },
      airMovers: { count: 2, days: 1, rate: 14.62, total: 29.24 },
      airScrubbers: { count: 1, days: 1, rate: 22.50, total: 22.50 },
      decontamination: { count: 5, rate: 38.68, total: 193.40 }, // 5 units × $38.68
      totalEquipment: 303.60,
    },
    labor: {
      install: { hours: 5.25, rate: 85, total: 446.25 },
      demo: { hours: 6, techs: 3, rate: 85, total: 1530 }, // Estimated
      totalLabor: 1976.25,
    },
    materials: {
      containment: { sf: 440, rate: 1.50, total: 660 },
      antimicrobial: { sf: 440, rate: 0.75, total: 330 },
      disposal: { dumpster: 1, rate: 450, total: 450 }, // Large dumpster
      testing: { count: 1, rate: 350, total: 350 },
      totalMaterials: 1790,
    },
    ppeSupplies: [
      { item: 'Tyvek Suits', quantity: 9, rate: 12, total: 108 }, // 3 techs × 3 days
      { item: 'N95 Respirators', quantity: 18, rate: 3, total: 54 },
      { item: 'Heavy Duty Gloves', quantity: 18, rate: 2, total: 36 },
      { item: 'Boot Covers', quantity: 18, rate: 1.50, total: 27 },
    ],
    ppeTotal: 225,
    estimatedTotal: 4294.85,
  },

  scheduledDate: daysAgo(1, 9),
  scheduledTechnician: 'tech1',
  scheduledZone: 'Zone 1',

  metadata: {
    createdAt: daysAgo(2, 20),
    createdBy: 'tech1',
    lastModifiedAt: hoursAgo(1),
    lastModifiedBy: 'tech1',
    version: 4,
    flags: ['category-3', 'containment-required', 'ppeRequired', 'microbial-testing'],
  },
};

/**
 * JOB 3: COMMERCIAL FLOODING - CHECK SERVICE PHASE
 * Category 2, office building, multiple daily visits
 * Shows progressive moisture decline with equipment adjustments
 * Demonstrates Check Service workflow with full reading history
 */
export const job3_Commercial_CheckService = {
  jobId: 'JOB-2024-003',
  customerInfo: {
    name: 'TechStart Solutions LLC',
    address: '4400 Innovation Drive, Suite 200',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    phoneNumber: '(512) 555-4422',
    email: 'facilities@techstart.com',
    propertyType: 'commercial',
    occupancyStatus: 'occupied',
    coordinates: {
      latitude: 30.2672,
      longitude: -97.7431,
    },
  },

  insuranceInfo: {
    carrierName: 'Hartford Insurance',
    policyNumber: 'HTF-COM-88234',
    claimNumber: 'CLM-99328',
    adjusterName: 'Michael Torres',
    adjusterPhone: '(800) 555-3221',
    adjusterEmail: 'mtorres@hartford.com',
    deductible: 10000,
    estimatedValue: 45000,
    categoryOfWater: 'Category 2', // AC drip pan overflow
  },

  propertyAddress: {
    street: '4400 Innovation Drive, Suite 200',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    propertyType: 'commercial',
  },

  causeOfLoss: {
    type: 'Flooding',
    description: 'AC condensate drip pan overflowed over weekend. Category 2 water affected multiple office areas.',
    location: 'Server room and adjacent offices',
    discoveryDate: daysAgo(4, 8), // Monday morning discovery
    eventDate: daysAgo(5, 14), // Saturday afternoon
    affectedAreas: ['Server Room', 'Conference Room A', 'Office 201', 'Office 202', 'Hallway'],
  },

  jobStatus: 'Check Service',
  startDate: daysAgo(3, 9), // Install 3 days ago

  rooms: [
    {
      roomId: 'room-007',
      roomName: 'Server Room',
      roomType: 'office',
      dimensions: {
        length: 15,
        width: 12,
        height: 9,
        squareFootage: 180,
        cubicFootage: 1620,
      },
      affectedStatus: 'affected',
      moistureReadings: [
        // Install day - high readings
        { readingId: 'reading-023', material: 'Carpet Pad Area', location: 'Under server racks', reading: 68.4, temperature: 74, humidity: 72, timestamp: daysAgo(3, 10), readingType: 'pre-demo', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-024', material: 'Subfloor', location: 'Center of room', reading: 44.2, temperature: 74, humidity: 72, timestamp: daysAgo(3, 10), readingType: 'pre-demo', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-025', material: 'Drywall', location: 'South wall', reading: 38.5, temperature: 74, humidity: 72, timestamp: daysAgo(3, 10), readingType: 'pre-demo', technician: 'Mike Johnson', isDry: false },
        // Post-demo readings
        { readingId: 'reading-026', material: 'Subfloor', location: 'Under racks (carpet removed)', reading: 36.8, temperature: 76, humidity: 62, timestamp: daysAgo(3, 15), readingType: 'post-demo', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-027', material: 'Wall Studs', location: 'South wall (drywall removed)', reading: 32.1, temperature: 76, humidity: 62, timestamp: daysAgo(3, 15), readingType: 'post-demo', technician: 'Mike Johnson', isDry: false },
        // Day 1 check
        { readingId: 'reading-028', material: 'Subfloor', location: 'Under racks', reading: 28.4, temperature: 78, humidity: 52, timestamp: daysAgo(2, 9), readingType: 'daily-check', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-029', material: 'Wall Studs', location: 'South wall', reading: 24.2, temperature: 78, humidity: 52, timestamp: daysAgo(2, 9), readingType: 'daily-check', technician: 'Mike Johnson', isDry: false },
        // Day 2 check - added equipment
        { readingId: 'reading-030', material: 'Subfloor', location: 'Under racks', reading: 22.1, temperature: 79, humidity: 46, timestamp: daysAgo(1, 9), readingType: 'daily-check', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-031', material: 'Wall Studs', location: 'South wall', reading: 18.8, temperature: 79, humidity: 46, timestamp: daysAgo(1, 9), readingType: 'daily-check', technician: 'Mike Johnson', isDry: false },
        // Day 3 check (today) - progress slowing, needs more time
        { readingId: 'reading-032', material: 'Subfloor', location: 'Under racks', reading: 17.2, temperature: 80, humidity: 44, timestamp: hoursAgo(2), readingType: 'daily-check', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-033', material: 'Wall Studs', location: 'South wall', reading: 14.5, temperature: 80, humidity: 44, timestamp: hoursAgo(2), readingType: 'daily-check', technician: 'Mike Johnson', isDry: false },
      ],
      affectedMaterials: [
        { material: 'Carpet', quantity: 180, unit: 'SF', removed: true, removalDate: daysAgo(3, 13) },
        { material: 'Carpet Pad', quantity: 180, unit: 'SF', removed: true, removalDate: daysAgo(3, 13) },
        { material: 'Drywall', quantity: 15, unit: 'LF', height: 'up to 2ft', removed: true, removalDate: daysAgo(3, 14) },
        { material: 'Baseboard', quantity: 54, unit: 'LF', removed: true, removalDate: daysAgo(3, 14) },
      ],
    },
    {
      roomId: 'room-008',
      roomName: 'Conference Room A',
      roomType: 'conference',
      dimensions: {
        length: 20,
        width: 16,
        height: 9,
        squareFootage: 320,
        cubicFootage: 2880,
      },
      affectedStatus: 'affected',
      moistureReadings: [
        // Just showing current state - similar progression pattern
        { readingId: 'reading-034', material: 'Subfloor', location: 'Near south wall', reading: 15.8, temperature: 79, humidity: 44, timestamp: hoursAgo(2), readingType: 'daily-check', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-035', material: 'Drywall', location: 'South wall', reading: 13.2, temperature: 79, humidity: 44, timestamp: hoursAgo(2), readingType: 'daily-check', technician: 'Mike Johnson', isDry: false },
      ],
      affectedMaterials: [
        { material: 'Carpet', quantity: 320, unit: 'SF', removed: true, removalDate: daysAgo(3, 13) },
        { material: 'Carpet Pad', quantity: 320, unit: 'SF', removed: true, removalDate: daysAgo(3, 13) },
      ],
    },
    {
      roomId: 'room-009',
      roomName: 'Lobby (Unaffected)',
      roomType: 'lobby',
      dimensions: {
        length: 25,
        width: 20,
        height: 10,
        squareFootage: 500,
        cubicFootage: 5000,
      },
      affectedStatus: 'unaffected',
      isReferenceRoom: true,
      moistureReadings: [
        { readingId: 'reading-ref-003', material: 'Reference Room', location: 'Center', reading: 7.1, temperature: 76, humidity: 38, timestamp: hoursAgo(2), readingType: 'reference', technician: 'Mike Johnson', isDry: true },
      ],
    },
  ],

  equipment: [
    // Initially deployed
    { equipmentId: 'DH-2701', type: 'Dehumidifier', serialNumber: 'PHOENIX-DH-2701', location: 'Server Room', deployedAt: daysAgo(3, 11), status: 'operational' },
    { equipmentId: 'DH-2702', type: 'Dehumidifier', serialNumber: 'PHOENIX-DH-2702', location: 'Conference Room A', deployedAt: daysAgo(3, 11), status: 'operational' },
    { equipmentId: 'AM-1701', type: 'Air Mover', serialNumber: 'DRISTORM-AM-1701', location: 'Server Room', deployedAt: daysAgo(3, 11), status: 'operational' },
    { equipmentId: 'AM-1702', type: 'Air Mover', serialNumber: 'DRISTORM-AM-1702', location: 'Conference Room A', deployedAt: daysAgo(3, 11), status: 'operational' },
    { equipmentId: 'AM-1703', type: 'Air Mover', serialNumber: 'DRISTORM-AM-1703', location: 'Hallway', deployedAt: daysAgo(3, 11), status: 'operational' },
    // Added during Day 2 check service (drying too slow)
    { equipmentId: 'DH-2703', type: 'Dehumidifier', serialNumber: 'PHOENIX-DH-2703', location: 'Hallway (central)', deployedAt: daysAgo(1, 10), status: 'operational', notes: 'Added to speed drying - readings plateauing' },
    { equipmentId: 'AM-1704', type: 'Air Mover', serialNumber: 'DRISTORM-AM-1704', location: 'Server Room (additional)', deployedAt: daysAgo(1, 10), status: 'operational', notes: 'Additional air movement needed' },
  ],

  workHistory: {
    install: {
      status: 'completed',
      startedAt: daysAgo(3, 9),
      completedAt: daysAgo(3, 16),
      technician: 'Mike Johnson',
      arrivalTime: '09:00',
      departureTime: '16:15',
      isAfterHours: false,
      totalHours: 7.25,
      notes: 'Commercial office. AC drip pan overflow (Cat 2). Minimal demo needed - removed carpet/pad. Business critical - server room priority.',
      environmentalBaseline: {
        outsideTemp: 88,
        outsideHumidity: 72,
        referenceRoomTemp: 76,
        referenceRoomHumidity: 38,
      },
    },
    demo: {
      status: 'completed',
      startedAt: daysAgo(3, 13),
      completedAt: daysAgo(3, 15),
      technician: 'Mike Johnson',
      techCount: 2,
      notes: 'Same-day demo during install. Removed carpet/pad from server room and conference room. Minimal drywall removal.',
    },
    checkService: {
      status: 'in-progress',
      visits: [
        {
          visitNumber: 1,
          date: daysAgo(2),
          startedAt: daysAgo(2, 9),
          completedAt: daysAgo(2, 9.5),
          technician: 'Mike Johnson',
          notes: 'Day 1: Good initial progress. All equipment operational. Server room drying slower than expected.',
          readingsVerified: true,
          equipmentAdjustments: [],
        },
        {
          visitNumber: 2,
          date: daysAgo(1),
          startedAt: daysAgo(1, 9),
          completedAt: daysAgo(1, 10.5),
          technician: 'Mike Johnson',
          notes: 'Day 2: Progress slowing. Added 1 dehu + 1 air mover to speed drying. Estimate 2-3 more days.',
          readingsVerified: true,
          equipmentAdjustments: [
            { action: 'add', equipment: 'Dehumidifier', serialNumber: 'PHOENIX-DH-2703', reason: 'Readings plateauing, need more moisture extraction' },
            { action: 'add', equipment: 'Air Mover', serialNumber: 'DRISTORM-AM-1704', reason: 'Additional air movement in server room' },
          ],
        },
        {
          visitNumber: 3,
          date: hoursAgo(2),
          startedAt: hoursAgo(2),
          completedAt: hoursAgo(1.5),
          technician: 'Mike Johnson',
          notes: 'Day 3: Better progress after equipment addition. Still 2-3 days from dry. All equipment running well.',
          readingsVerified: true,
          equipmentAdjustments: [],
        },
      ],
    },
  },

  financial: {
    equipment: {
      dehumidifiers: { count: 3, days: 3, rate: 29.23, total: 263.07 }, // Note: 3rd dehu only 2 days
      airMovers: { count: 5, days: 3, rate: 14.62, total: 219.30 },
      totalEquipment: 482.37,
    },
    labor: {
      install: { hours: 7.25, rate: 95, total: 688.75 }, // Commercial rate
      demo: { hours: 2, techs: 2, rate: 95, total: 380 },
      checkService: { hours: 2, visits: 3, rate: 95, total: 570 },
      totalLabor: 1638.75,
    },
    materials: {
      disposal: { truckLoads: 3, rate: 125, total: 375 },
      totalMaterials: 375,
    },
    estimatedTotal: 2496.12,
  },

  scheduledDate: daysAgo(3, 9),
  scheduledTechnician: 'tech1',
  scheduledZone: 'Zone 1',

  metadata: {
    createdAt: daysAgo(4, 10),
    createdBy: 'tech1',
    lastModifiedAt: hoursAgo(1.5),
    lastModifiedBy: 'tech1',
    version: 8,
    flags: ['commercial', 'category-2', 'equipment-adjusted'],
  },
};

/**
 * JOB 4: ICE DAM - INSTALL PHASE (Just Started)
 * Category 1, residential attic/bedroom damage
 * Currently in Install workflow - demonstrates fresh job setup
 * Shows after-hours emergency call
 */
export const job4_IceDam_InstallPhase = {
  jobId: 'JOB-2024-004',
  customerInfo: {
    name: 'Thompson Family',
    address: '2156 Wintergreen Circle',
    city: 'Minneapolis',
    state: 'MN',
    zipCode: '55401',
    phoneNumber: '(612) 555-8844',
    email: 'sarah.thompson@email.com',
    propertyType: 'residential',
    occupancyStatus: 'occupied',
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

  propertyAddress: {
    street: '2156 Wintergreen Circle',
    city: 'Minneapolis',
    state: 'MN',
    zipCode: '55401',
    propertyType: 'residential',
  },

  causeOfLoss: {
    type: 'Ice Dam',
    description: 'Ice dam on north-facing roof caused water backup under shingles. Water infiltrated attic and leaked into master bedroom.',
    location: 'Attic and Master Bedroom',
    discoveryDate: hoursAgo(4), // Discovered this evening
    eventDate: hoursAgo(6), // Started during day
    affectedAreas: ['Attic', 'Master Bedroom', 'Master Closet'],
  },

  jobStatus: 'Install',
  startDate: hoursAgo(2), // Install started 2 hours ago (evening)

  rooms: [
    {
      roomId: 'room-010',
      roomName: 'Master Bedroom',
      roomType: 'bedroom',
      dimensions: {
        length: 16,
        width: 14,
        height: 8,
        squareFootage: 224,
        cubicFootage: 1792,
      },
      affectedStatus: 'affected',
      moistureReadings: [
        // Initial readings being taken NOW
        { readingId: 'reading-036', material: 'Ceiling Drywall', location: 'North corner', reading: 45.2, temperature: 66, humidity: 68, timestamp: hoursAgo(1.5), readingType: 'pre-demo', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-037', material: 'Ceiling Drywall', location: 'Center', reading: 32.8, temperature: 66, humidity: 68, timestamp: hoursAgo(1.5), readingType: 'pre-demo', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-038', material: 'Drywall', location: 'North wall, top', reading: 38.4, temperature: 66, humidity: 68, timestamp: hoursAgo(1.5), readingType: 'pre-demo', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-039', material: 'Carpet Pad Area', location: 'Under affected ceiling', reading: 28.5, temperature: 66, humidity: 68, timestamp: hoursAgo(1.5), readingType: 'pre-demo', technician: 'Mike Johnson', isDry: false },
      ],
      // Demo plan being created NOW during install
      affectedMaterials: [
        { material: 'Ceiling Drywall', quantity: 40, unit: 'SF', removed: false, plannedRemoval: true, notes: 'Wet ceiling - will need removal' },
        { material: 'Insulation', quantity: 40, unit: 'SF', removed: false, plannedRemoval: true, notes: 'Saturated insulation in attic' },
        { material: 'Drywall', quantity: 16, unit: 'LF', height: 'up to 2ft', removed: false, plannedRemoval: true, notes: 'Top of north wall' },
        { material: 'Carpet Pad', quantity: 60, unit: 'SF', removed: false, plannedRemoval: true, notes: 'Wet area under ceiling leak' },
      ],
    },
    {
      roomId: 'room-011',
      roomName: 'Attic',
      roomType: 'attic',
      dimensions: {
        length: 30,
        width: 20,
        height: 6,
        squareFootage: 600,
        cubicFootage: 3600,
      },
      affectedStatus: 'affected',
      moistureReadings: [
        { readingId: 'reading-040', material: 'Wood Framing', location: 'Roof trusses', reading: 52.8, temperature: 35, humidity: 92, timestamp: hoursAgo(1), readingType: 'pre-demo', technician: 'Mike Johnson', isDry: false },
        { readingId: 'reading-041', material: 'Subfloor', location: 'Attic floor', reading: 38.2, temperature: 35, humidity: 92, timestamp: hoursAgo(1), readingType: 'pre-demo', technician: 'Mike Johnson', isDry: false },
      ],
      affectedMaterials: [
        { material: 'Insulation', quantity: 200, unit: 'SF', removed: false, plannedRemoval: true, notes: 'Fiberglass insulation - saturated' },
      ],
    },
    {
      roomId: 'room-012',
      roomName: 'Living Room',
      roomType: 'living-room',
      dimensions: {
        length: 18,
        width: 15,
        height: 8,
        squareFootage: 270,
        cubicFootage: 2160,
      },
      affectedStatus: 'unaffected',
      isReferenceRoom: true,
      moistureReadings: [
        { readingId: 'reading-ref-004', material: 'Reference Room', location: 'Center', reading: 8.8, temperature: 69, humidity: 42, timestamp: hoursAgo(1), readingType: 'reference', technician: 'Mike Johnson', isDry: true },
      ],
    },
  ],

  equipment: [
    // Equipment being deployed NOW
    { equipmentId: 'DH-2501', type: 'Dehumidifier', serialNumber: 'PHOENIX-DH-2501', location: 'Master Bedroom', deployedAt: hoursAgo(0.5), status: 'operational' },
    { equipmentId: 'AM-1501', type: 'Air Mover', serialNumber: 'DRISTORM-AM-1501', location: 'Master Bedroom', deployedAt: hoursAgo(0.5), status: 'operational' },
    { equipmentId: 'AM-1502', type: 'Air Mover', serialNumber: 'DRISTORM-AM-1502', location: 'Attic', deployedAt: hoursAgo(0.5), status: 'operational' },
  ],

  workHistory: {
    install: {
      status: 'in-progress',
      startedAt: hoursAgo(2),
      technician: 'Mike Johnson',
      arrivalTime: '18:45', // After hours!
      isAfterHours: true, // Premium rate
      notes: 'Emergency call - ice dam. Customer discovered water dripping from bedroom ceiling. Active leak stopped but extensive saturation. Setting equipment tonight, demo scheduled for tomorrow.',
      environmentalBaseline: {
        outsideTemp: 18, // Cold!
        outsideHumidity: 85,
        referenceRoomTemp: 69,
        referenceRoomHumidity: 42,
      },
    },
  },

  financial: {
    equipment: {
      // Will be calculated when install completes
      dehumidifiers: { count: 1, days: 0, rate: 29.23, total: 0 },
      airMovers: { count: 2, days: 0, rate: 14.62, total: 0 },
      totalEquipment: 0,
    },
    labor: {
      install: { hours: 2, rate: 85, total: 170 }, // Will increase when complete
      afterHoursMultiplier: 1.5, // After hours premium
      totalLabor: 255, // 170 × 1.5
    },
    materials: {
      emergencyCallFee: 150, // After hours call out
      totalMaterials: 150,
    },
    estimatedTotal: 405, // Partial - job just started
  },

  scheduledDate: hoursAgo(2),
  scheduledTechnician: 'tech1',
  scheduledZone: 'Zone 1',

  metadata: {
    createdAt: hoursAgo(3),
    createdBy: 'tech1',
    lastModifiedAt: hoursAgo(0.5),
    lastModifiedBy: 'tech1',
    version: 2,
    flags: ['emergency-call', 'after-hours', 'active-install'],
  },
};

/**
 * JOB 5: APPLIANCE LEAK - PRE-INSTALL
 * Category 1, small dishwasher leak
 * Needs assessment - demonstrates job creation phase
 * Perfect for quick demo of app flow
 */
export const job5_ApplianceLeak_PreInstall = {
  jobId: 'JOB-2024-005',
  customerInfo: {
    name: 'Rodriguez Family',
    address: '8822 Maple Street',
    city: 'Denver',
    state: 'CO',
    zipCode: '80201',
    phoneNumber: '(303) 555-6677',
    email: 'maria.rodriguez@email.com',
    propertyType: 'residential',
    occupancyStatus: 'occupied',
    coordinates: {
      latitude: 39.7392,
      longitude: -104.9903,
    },
  },

  insuranceInfo: {
    carrierName: 'Progressive',
    policyNumber: 'PRO-CO-77332',
    claimNumber: 'CLM-44891',
    adjusterName: 'Tom Richards',
    adjusterPhone: '(800) 555-7766',
    adjusterEmail: 'trichards@progressive.com',
    deductible: 500,
    estimatedValue: 3500,
    categoryOfWater: 'Category 1',
  },

  propertyAddress: {
    street: '8822 Maple Street',
    city: 'Denver',
    state: 'CO',
    zipCode: '80201',
    propertyType: 'residential',
  },

  causeOfLoss: {
    type: 'Appliance Leak',
    description: 'Dishwasher supply line failed. Water leaked under kitchen floor into basement ceiling.',
    location: 'Kitchen and Basement',
    discoveryDate: hoursAgo(18), // Yesterday evening
    eventDate: hoursAgo(20), // Yesterday afternoon
    affectedAreas: ['Kitchen', 'Basement Storage Room'],
  },

  jobStatus: 'Pre-Install',
  startDate: null, // Not started yet

  rooms: [], // Will be defined during install

  equipment: [], // No equipment yet

  workHistory: {
    install: {
      status: 'pending',
      scheduledFor: hoursAgo(-6), // Scheduled for 6 hours from now (tomorrow morning 9am)
      technician: 'Mike Johnson',
      notes: 'Small appliance leak. Customer stopped water source. Plumber has repaired supply line. Ready for mitigation.',
    },
  },

  financial: {
    equipment: {
      totalEquipment: 0,
    },
    labor: {
      totalLabor: 0,
    },
    materials: {
      totalMaterials: 0,
    },
    estimatedTotal: 0, // Will be estimated during install
  },

  scheduledDate: hoursAgo(-6), // Tomorrow morning
  scheduledTechnician: 'tech1',
  scheduledZone: 'Zone 1',

  metadata: {
    createdAt: hoursAgo(16),
    createdBy: 'office-admin',
    lastModifiedAt: hoursAgo(16),
    lastModifiedBy: 'office-admin',
    version: 1,
    flags: ['pending-assessment', 'small-job'],
  },
};

// Export all jobs
export const comprehensiveJobs = [
  job1_BurstPipe_ReadyForPull,
  job2_SewageBackup_DemoPhase,
  job3_Commercial_CheckService,
  job4_IceDam_InstallPhase,
  job5_ApplianceLeak_PreInstall,
];
