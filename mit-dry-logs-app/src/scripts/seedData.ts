/**
 * Seed Data Script
 * Populates Firebase with sample users and jobs for testing
 *
 * Run with: npm run seed
 */

import { collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Job, UserRole, Zone, JobStatus, WaterCategory } from '../types';

// Sample Users
const sampleUsers: User[] = [
  {
    uid: 'tech1',
    email: 'tech@demo.com',
    displayName: 'Mike Johnson',
    phoneNumber: '(555) 123-4567',
    role: 'MIT_TECH',
    zone: 'Zone 1',
    assignedJobs: [],
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now(),
    isActive: true,
    preferences: {
      notifications: true,
      darkMode: false,
      preferredTimeZone: 'America/New_York',
      language: 'en',
    },
    qualifications: {
      iicrcCertified: true,
      certificationExpiry: Timestamp.fromDate(new Date('2026-12-31')),
      trainingLevel: 'senior',
    },
    metadata: {
      totalJobsCompleted: 142,
      totalEquipmentScans: 1850,
      accuracyScore: 98,
      lastActivityAt: Timestamp.now(),
    },
  },
  {
    uid: 'lead1',
    email: 'lead@demo.com',
    displayName: 'Sarah Martinez',
    phoneNumber: '(555) 987-6543',
    role: 'MIT_LEAD',
    zone: 'Zone 1',
    assignedJobs: [],
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now(),
    isActive: true,
    preferences: {
      notifications: true,
      darkMode: false,
      preferredTimeZone: 'America/New_York',
      language: 'en',
    },
    qualifications: {
      iicrcCertified: true,
      certificationExpiry: Timestamp.fromDate(new Date('2027-06-30')),
      trainingLevel: 'senior',
    },
    metadata: {
      totalJobsCompleted: 0,
      totalEquipmentScans: 0,
      accuracyScore: 100,
      lastActivityAt: Timestamp.now(),
    },
  },
];

// Sample Jobs
const generateSampleJobs = (techId: string): Partial<Job>[] => {
  const addresses = [
    { name: 'Smith', address: '123 Main St', city: 'Springfield', zipCode: '62701' },
    { name: 'Johnson', address: '456 Oak Ave', city: 'Riverside', zipCode: '92501' },
    { name: 'Williams', address: '789 Elm Street', city: 'Greenville', zipCode: '27858' },
    { name: 'Brown', address: '321 Pine Rd', city: 'Madison', zipCode: '53703' },
    { name: 'Davis', address: '654 Maple Dr', city: 'Portland', zipCode: '97201' },
    { name: 'Miller', address: '987 Cedar Ln', city: 'Austin', zipCode: '78701' },
    { name: 'Wilson', address: '147 Birch Way', city: 'Denver', zipCode: '80201' },
    { name: 'Moore', address: '258 Spruce Ct', city: 'Seattle', zipCode: '98101' },
    { name: 'Taylor', address: '369 Willow Path', city: 'Boston', zipCode: '02101' },
    { name: 'Anderson', address: '741 Aspen Blvd', city: 'Phoenix', zipCode: '85001' },
  ];

  const statuses: JobStatus[] = ['Pre-Install', 'Install', 'Demo', 'Check Service', 'Pull'];
  const categories: WaterCategory[] = ['Category 1', 'Category 2', 'Category 3'];
  const causes = [
    'Burst Pipe',
    'Flooding',
    'Ice Dam',
    'Sewage Backup',
    'Roof Leak',
    'Appliance Leak',
  ];

  return addresses.map((addr, index) => {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + (index % 5) - 2); // Spread across days

    return {
      customerInfo: {
        name: `${addr.name} Family`,
        address: addr.address,
        city: addr.city,
        state: 'State',
        zipCode: addr.zipCode,
        phoneNumber: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        email: `${addr.name.toLowerCase()}@email.com`,
        coordinates: {
          latitude: 40 + Math.random() * 10,
          longitude: -100 + Math.random() * 20,
        },
      },
      insuranceInfo: {
        carrierName: ['State Farm', 'Allstate', 'Farmers', 'Progressive'][index % 4],
        policyNumber: `POL-${Math.floor(100000 + Math.random() * 900000)}`,
        claimNumber: `CLM-${Math.floor(10000 + Math.random() * 90000)}`,
        adjusterName: ['John Adjuster', 'Jane Claims', 'Bob Reviewer'][index % 3],
        adjusterPhone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        adjusterEmail: `adjuster${index}@insurance.com`,
        deductible: [500, 1000, 2500, 5000][index % 4],
        estimatedValue: Math.floor(5000 + Math.random() * 20000),
        categoryOfWater: categories[index % 3],
      },
      causeOfLoss: {
        type: causes[index % causes.length] as any,
        description: `Water damage from ${causes[index % causes.length].toLowerCase()} event`,
        location: ['Kitchen', 'Bathroom', 'Basement', 'Attic', 'Laundry Room'][index % 5],
        discoveryDate: Timestamp.fromDate(new Date(scheduledDate.getTime() - 86400000)),
        eventDate: Timestamp.fromDate(new Date(scheduledDate.getTime() - 172800000)),
      },
      jobStatus: statuses[index % statuses.length],
      workflowPhases: {
        install: {
          status: index % 5 >= 0 ? 'completed' : 'pending',
          startedAt: index % 5 >= 0 ? Timestamp.now() : undefined,
          completedAt: index % 5 >= 1 ? Timestamp.now() : undefined,
          technician: techId,
          notes: index % 5 >= 0 ? 'Initial installation completed' : undefined,
        },
        demo: {
          status: index % 5 >= 2 ? 'completed' : index % 5 === 1 ? 'in-progress' : 'pending',
          startedAt: index % 5 >= 1 ? Timestamp.now() : undefined,
          completedAt: index % 5 >= 2 ? Timestamp.now() : undefined,
          technician: index % 5 >= 1 ? techId : undefined,
          notes: index % 5 >= 1 ? 'Demo work in progress' : undefined,
        },
        checkService: {
          status: index % 5 >= 3 ? 'completed' : 'pending',
          visits: index % 5 >= 3 ? [
            {
              visitNumber: 1,
              startedAt: Timestamp.now(),
              completedAt: Timestamp.now(),
              technician: techId,
              notes: 'Day 1 check - readings improving',
              readingsVerified: true,
            },
          ] : [],
        },
        pull: {
          status: index % 5 >= 4 ? 'completed' : 'pending',
          startedAt: index % 5 >= 4 ? Timestamp.now() : undefined,
          completedAt: index % 5 >= 4 ? Timestamp.now() : undefined,
          technician: index % 5 >= 4 ? techId : undefined,
          notes: index % 5 >= 4 ? 'Equipment pulled, job complete' : undefined,
        },
      },
      rooms: [],
      equipment: {
        chambers: [],
        calculations: {
          totalAffectedSquareFootage: Math.floor(200 + Math.random() * 800),
          estimatedDryingDays: Math.floor(3 + Math.random() * 5),
          recommendedDehumidifierCount: Math.floor(2 + Math.random() * 4),
          recommendedAirMoverCount: Math.floor(4 + Math.random() * 8),
          recommendedAirScrubberCount: categories[index % 3] === 'Category 1' ? 0 : Math.floor(1 + Math.random() * 3),
          calculationMethod: 'IICRC S500-2021',
          lastCalculatedAt: Timestamp.now(),
          calculatedBy: techId,
          waterClass: ['Class 2', 'Class 3'][index % 2] as any,
          waterCategory: categories[index % 3],
        },
      },
      safetyChecklist: {
        preArrivalInspection: false,
        containmentSetup: false,
        ppeEquipped: false,
        safetyConesPlaced: false,
        utilityLocations: {
          electrical: false,
          gas: false,
          water: false,
          verified: false,
        },
        hazardsIdentified: [],
      },
      communication: {
        groundRulesPresented: false,
        estimatedTimeline: '',
        customerConcerns: [],
        preExistingConditions: [],
      },
      financial: {
        insuranceDeductible: [500, 1000, 2500, 5000][index % 4],
        estimatedMaterials: 0,
        estimatedLabor: 0,
        estimatedTotal: 0,
        actualExpenses: {
          materials: 0,
          labor: 0,
          equipment: 0,
          total: 0,
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
      scheduledZone: 'Zone 1' as Zone,
      scheduledTechnician: techId,
      scheduledDate: Timestamp.fromDate(scheduledDate),
      metadata: {
        createdAt: Timestamp.now(),
        createdBy: techId,
        lastModifiedAt: Timestamp.now(),
        lastModifiedBy: techId,
        version: 1,
      },
    };
  });
};

// Seed function
export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Add users
    console.log('📝 Creating users...');
    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.uid), user);
      console.log(`✓ Created user: ${user.displayName} (${user.role})`);
    }

    // Add jobs for tech user
    console.log('\n📋 Creating jobs...');
    const jobs = generateSampleJobs('tech1');
    for (const job of jobs) {
      const docRef = await addDoc(collection(db, 'jobs'), job);
      console.log(`✓ Created job: ${job.customerInfo?.name} - ${job.jobStatus}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users created: ${sampleUsers.length}`);
    console.log(`   Jobs created: ${jobs.length}`);
    console.log('\n🔐 Demo Credentials:');
    console.log('   MIT Tech: tech@demo.com / password123');
    console.log('   MIT Lead: lead@demo.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
