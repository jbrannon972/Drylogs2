/**
 * SetupPage Component
 * One-click setup for demo users and sample jobs
 */

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, setDoc, doc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { User, Job } from '../../types';

interface SetupResult {
  userId: string;
  status: 'success' | 'error';
  message: string;
}

interface JobResult {
  jobId: string;
  status: 'success' | 'error';
  message: string;
}

export function SetupPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingJobs, setIsCreatingJobs] = useState(false);
  const [results, setResults] = useState<SetupResult[]>([]);
  const [jobResults, setJobResults] = useState<JobResult[]>([]);
  const [techUid, setTechUid] = useState<string>('');
  const [leadUid, setLeadUid] = useState<string>('');
  const [existingJobCount, setExistingJobCount] = useState<number | null>(null);

  const demoUsers = [
    {
      email: 'tech@demo.com',
      password: 'password123',
      displayName: 'Demo Tech',
      phoneNumber: '+1 (555) 123-4567',
      role: 'MIT_TECH' as const,
      zone: 'Zone 1' as const,
    },
    {
      email: 'lead@demo.com',
      password: 'password123',
      displayName: 'Demo Lead',
      phoneNumber: '+1 (555) 987-6543',
      role: 'MIT_LEAD' as const,
      zone: 'Zone 1' as const,
    },
  ];

  // Check how many jobs exist
  const checkExistingJobs = async () => {
    try {
      const jobsQuery = query(collection(db, 'jobs'));
      const snapshot = await getDocs(jobsQuery);
      setExistingJobCount(snapshot.size);
      return snapshot.size;
    } catch (error) {
      console.error('Error checking jobs:', error);
      return 0;
    }
  };

  // Find existing user UIDs by email
  const findUserByEmail = async (email: string): Promise<string | null> => {
    try {
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(usersQuery);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  };

  // Create jobs using existing user accounts
  const createJobsWithExistingUsers = async () => {
    setJobResults([]);
    setIsCreatingJobs(true);

    try {
      // Find existing users
      const foundTechUid = await findUserByEmail('tech@demo.com');
      const foundLeadUid = await findUserByEmail('lead@demo.com');

      if (!foundTechUid || !foundLeadUid) {
        setJobResults([
          {
            jobId: 'error',
            status: 'error',
            message: '❌ Could not find existing demo users. Please create users first.',
          },
        ]);
        setIsCreatingJobs(false);
        return;
      }

      setTechUid(foundTechUid);
      setLeadUid(foundLeadUid);

      // Create jobs
      await createSampleJobs(foundTechUid, foundLeadUid);
    } catch (error: any) {
      setJobResults([
        {
          jobId: 'error',
          status: 'error',
          message: `❌ Error: ${error.message}`,
        },
      ]);
      setIsCreatingJobs(false);
    }
  };

  const createSampleJobs = async (techUid: string, leadUid: string) => {
    setIsCreatingJobs(true);
    setJobResults([]);

    const sampleJobs: Partial<Job>[] = [
      {
        customerInfo: {
          name: 'John Smith Family',
          address: '123 Main Street',
          city: 'Boston',
          state: 'MA',
          zipCode: '02108',
          phoneNumber: '+1 (555) 234-5678',
          email: 'john.smith@email.com',
          coordinates: {
            latitude: 42.3601,
            longitude: -71.0589,
          },
        },
        insuranceInfo: {
          carrierName: 'State Farm Insurance',
          policyNumber: 'SF-12345678',
          claimNumber: 'CLM-2025-00123',
          adjusterName: 'Sarah Johnson',
          adjusterPhone: '+1 (555) 345-6789',
          adjusterEmail: 'sarah.j@statefarm.com',
          deductible: 1000,
          estimatedValue: 15000,
          categoryOfWater: 'Category 1' as const,
        },
        causeOfLoss: {
          type: 'Burst Pipe' as any,
          description: 'Burst pipe in master bathroom',
          location: 'Master Bathroom',
          discoveryDate: Timestamp.fromDate(new Date('2025-01-15')),
          eventDate: Timestamp.fromDate(new Date('2025-01-14')),
        },
        jobStatus: 'Install' as const,
        workflowPhases: {
          install: {
            status: 'in-progress',
            startedAt: Timestamp.now(),
            technician: techUid,
          },
          demo: {
            status: 'pending',
          },
          checkService: {
            status: 'pending',
            visits: [],
          },
          pull: {
            status: 'pending',
          },
        },
        rooms: [],
        equipment: {
          chambers: [],
          calculations: {
            totalAffectedSquareFootage: 0,
            totalCubicFootage: 0,
            estimatedDryingDays: 3,
            recommendedDehumidifierCount: 0,
            recommendedAirMoverCount: 0,
            recommendedAirScrubberCount: 0,
            calculationMethod: 'IICRC S500-2021',
            lastCalculatedAt: Timestamp.now(),
            calculatedBy: techUid,
            waterClass: 'Class 2' as any,
            waterCategory: 'Category 1' as const,
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
          insuranceDeductible: 1000,
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
        scheduledZone: 'Zone 1' as const,
        scheduledTechnician: techUid,
        scheduledDate: Timestamp.now(),
        metadata: {
          createdAt: Timestamp.now(),
          createdBy: techUid,
          lastModifiedAt: Timestamp.now(),
          lastModifiedBy: techUid,
          version: 1,
        },
      },
      {
        customerInfo: {
          name: 'Maria Garcia Family',
          address: '456 Oak Avenue',
          city: 'Cambridge',
          state: 'MA',
          zipCode: '02139',
          phoneNumber: '+1 (555) 456-7890',
          email: 'maria.garcia@email.com',
          coordinates: {
            latitude: 42.3736,
            longitude: -71.1097,
          },
        },
        insuranceInfo: {
          carrierName: 'Allstate Insurance',
          policyNumber: 'AL-87654321',
          claimNumber: 'CLM-2025-00456',
          adjusterName: 'Mike Wilson',
          adjusterPhone: '+1 (555) 567-8901',
          adjusterEmail: 'mike.w@allstate.com',
          deductible: 2500,
          estimatedValue: 12000,
          categoryOfWater: 'Category 2' as const,
        },
        causeOfLoss: {
          type: 'Appliance Leak' as any,
          description: 'Washing machine overflow',
          location: 'Laundry Room',
          discoveryDate: Timestamp.fromDate(new Date('2025-01-18')),
          eventDate: Timestamp.fromDate(new Date('2025-01-18')),
        },
        jobStatus: 'Pre-Install' as const,
        workflowPhases: {
          install: {
            status: 'pending',
          },
          demo: {
            status: 'pending',
          },
          checkService: {
            status: 'pending',
            visits: [],
          },
          pull: {
            status: 'pending',
          },
        },
        rooms: [],
        equipment: {
          chambers: [],
          calculations: {
            totalAffectedSquareFootage: 0,
            totalCubicFootage: 0,
            estimatedDryingDays: 3,
            recommendedDehumidifierCount: 0,
            recommendedAirMoverCount: 0,
            recommendedAirScrubberCount: 0,
            calculationMethod: 'IICRC S500-2021',
            lastCalculatedAt: Timestamp.now(),
            calculatedBy: techUid,
            waterClass: 'Class 3' as any,
            waterCategory: 'Category 2' as const,
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
          insuranceDeductible: 2500,
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
        scheduledZone: 'Zone 1' as const,
        scheduledTechnician: techUid,
        scheduledDate: Timestamp.fromDate(new Date('2025-01-20')),
        metadata: {
          createdAt: Timestamp.now(),
          createdBy: techUid,
          lastModifiedAt: Timestamp.now(),
          lastModifiedBy: techUid,
          version: 1,
        },
      },
      {
        customerInfo: {
          name: 'Robert Chen Business',
          address: '789 Elm Street',
          city: 'Somerville',
          state: 'MA',
          zipCode: '02144',
          phoneNumber: '+1 (555) 678-9012',
          email: 'robert.chen@email.com',
          coordinates: {
            latitude: 42.3876,
            longitude: -71.0995,
          },
        },
        insuranceInfo: {
          carrierName: 'Liberty Mutual',
          policyNumber: 'LM-45678901',
          claimNumber: 'CLM-2025-00789',
          adjusterName: 'Emily Davis',
          adjusterPhone: '+1 (555) 789-0123',
          adjusterEmail: 'emily.d@libertymutual.com',
          deductible: 5000,
          estimatedValue: 25000,
          categoryOfWater: 'Category 3' as const,
        },
        causeOfLoss: {
          type: 'Sewage Backup' as any,
          description: 'Sewage backup from main line',
          location: 'Storage Room',
          discoveryDate: Timestamp.fromDate(new Date('2025-01-10')),
          eventDate: Timestamp.fromDate(new Date('2025-01-09')),
        },
        jobStatus: 'Demo' as const,
        workflowPhases: {
          install: {
            status: 'completed',
            startedAt: Timestamp.fromDate(new Date('2025-01-11')),
            completedAt: Timestamp.fromDate(new Date('2025-01-11')),
            technician: techUid,
            notes: 'Initial equipment deployment complete',
          },
          demo: {
            status: 'in-progress',
            startedAt: Timestamp.now(),
            technician: techUid,
          },
          checkService: {
            status: 'pending',
            visits: [],
          },
          pull: {
            status: 'pending',
          },
        },
        rooms: [],
        equipment: {
          chambers: [],
          calculations: {
            totalAffectedSquareFootage: 0,
            totalCubicFootage: 0,
            estimatedDryingDays: 5,
            recommendedDehumidifierCount: 0,
            recommendedAirMoverCount: 0,
            recommendedAirScrubberCount: 2,
            calculationMethod: 'IICRC S500-2021',
            lastCalculatedAt: Timestamp.now(),
            calculatedBy: techUid,
            waterClass: 'Class 4' as any,
            waterCategory: 'Category 3' as const,
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
          insuranceDeductible: 5000,
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
        scheduledZone: 'Zone 1' as const,
        scheduledTechnician: techUid,
        scheduledDate: Timestamp.fromDate(new Date('2025-01-10')),
        metadata: {
          createdAt: Timestamp.now(),
          createdBy: techUid,
          lastModifiedAt: Timestamp.now(),
          lastModifiedBy: techUid,
          version: 1,
        },
      },
    ];

    const newJobResults: JobResult[] = [];

    for (const jobData of sampleJobs) {
      try {
        const docRef = await addDoc(collection(db, 'jobs'), jobData);

        newJobResults.push({
          jobId: docRef.id,
          status: 'success',
          message: `✅ Created job: ${jobData.customerInfo?.name} (${jobData.jobStatus})`,
        });
      } catch (error: any) {
        newJobResults.push({
          jobId: jobData.customerInfo?.name || 'Unknown',
          status: 'error',
          message: `❌ Error: ${error.message}`,
        });
      }

      setJobResults([...newJobResults]);
    }

    setIsCreatingJobs(false);
  };

  const createDemoUsers = async () => {
    setIsCreating(true);
    setResults([]);

    const newResults: SetupResult[] = [];
    let createdTechUid = '';
    let createdLeadUid = '';

    for (const userData of demoUsers) {
      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        const firebaseUser = userCredential.user;

        // Create Firestore user profile
        const newUser: User = {
          uid: firebaseUser.uid,
          email: userData.email,
          displayName: userData.displayName,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          zone: userData.zone,
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
            totalJobsCompleted: 0,
            totalEquipmentScans: 0,
            accuracyScore: 100,
            lastActivityAt: Timestamp.now(),
          },
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

        newResults.push({
          userId: firebaseUser.uid,
          status: 'success',
          message: `✅ Created ${userData.displayName} (${userData.email})`,
        });

        // Store UIDs for job creation
        if (userData.role === 'MIT_TECH') {
          createdTechUid = firebaseUser.uid;
          setTechUid(firebaseUser.uid);
        }
        if (userData.role === 'MIT_LEAD') {
          createdLeadUid = firebaseUser.uid;
          setLeadUid(firebaseUser.uid);
        }

        // Sign out to create next user
        await auth.signOut();
      } catch (error: any) {
        newResults.push({
          userId: userData.email,
          status: 'error',
          message: `❌ Error: ${error.message}`,
        });
      }

      setResults([...newResults]);
    }

    setIsCreating(false);

    // Create sample jobs after users
    if (createdTechUid && createdLeadUid) {
      await createSampleJobs(createdTechUid, createdLeadUid);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl shadow-lg mb-4">
            <h1 className="text-4xl font-bold">MIT Dry Logs Setup</h1>
          </div>
          <p className="text-gray-600 text-lg mt-4">
            One-click demo environment setup
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Create Demo Users & Sample Jobs
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              This will create:
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">🔐</span>
                <div>
                  <strong>MIT Tech:</strong> tech@demo.com / password123
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔐</span>
                <div>
                  <strong>MIT Lead:</strong> lead@demo.com / password123
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📋</span>
                <div>
                  <strong>3 Sample Jobs:</strong> Install, Pre-Install, and Demo status
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={createDemoUsers}
              disabled={isCreating || isCreatingJobs}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isCreating || isCreatingJobs
                ? 'Creating...'
                : 'Create Demo Users & Sample Jobs'}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={checkExistingJobs}
                disabled={isCreating || isCreatingJobs}
                className="w-full bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Check Existing Jobs
              </button>

              <button
                onClick={createJobsWithExistingUsers}
                disabled={isCreating || isCreatingJobs}
                className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Create Jobs Only
              </button>
            </div>

            {existingJobCount !== null && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-yellow-900">
                  📊 Found {existingJobCount} existing job{existingJobCount !== 1 ? 's' : ''} in database
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Creation Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              User Creation Results
            </h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    result.status === 'success'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p
                    className={`font-medium ${
                      result.status === 'success'
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}
                  >
                    {result.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Creation Results */}
        {jobResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Job Creation Results
            </h3>
            <div className="space-y-3">
              {jobResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    result.status === 'success'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p
                    className={`font-medium ${
                      result.status === 'success'
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}
                  >
                    {result.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {results.length > 0 &&
          results.every((r) => r.status === 'success') &&
          jobResults.length > 0 &&
          jobResults.every((r) => r.status === 'success') && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Setup Complete!</h3>
              <p className="text-green-50 mb-6">
                All demo users and sample jobs have been created successfully.
              </p>
              <a
                href="/login"
                className="inline-block bg-white text-green-600 font-semibold py-3 px-8 rounded-xl hover:bg-green-50 transition-colors duration-200"
              >
                Go to Login
              </a>
            </div>
          )}
      </div>
    </div>
  );
}
