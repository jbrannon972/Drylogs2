/**
 * Data Seeding Page - Web-based seed data management
 *
 * Accessible from browser to seed database with comprehensive PSM job data
 */

import React, { useState } from 'react';
import { collection, doc, setDoc, getDocs, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Job } from '../../types';
import { Database, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const DataSeedingPage: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [jobsCreated, setJobsCreated] = useState<number>(0);
  const [error, setError] = useState<string>('');

  // Helper functions
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

  const clearAllJobs = async () => {
    setStatus('Clearing existing jobs...');
    const jobsRef = collection(db, 'jobs');
    const snapshot = await getDocs(jobsRef);

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
    setStatus(`Deleted ${snapshot.docs.length} existing jobs`);
  };

  const generateComprehensiveJobs = (): Job[] => {
    // Generate 15 comprehensive jobs across all phases
    const jobs: Partial<Job>[] = [
      // JOB 1: Pre-Install
      {
        jobId: 'JOB-2024-001',
        jobStatus: 'Pre-Install',
        customerInfo: {
          name: 'Anderson Family',
          address: '1523 Maple Ave',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          phoneNumber: '(713) 555-1001',
          email: 'anderson@email.com',
          coordinates: { latitude: 29.7604, longitude: -95.3698 },
        },
        insuranceInfo: {
          carrierName: 'State Farm',
          policyNumber: 'SF-1001',
          claimNumber: 'CLM-1001',
          adjusterName: 'Mike Peterson',
          adjusterPhone: '(800) 555-1001',
          adjusterEmail: 'mpeterson@statefarm.com',
          deductible: 1000,
          estimatedValue: 5000,
          categoryOfWater: 'Category 1',
        },
        causeOfLoss: {
          type: 'Burst Pipe',
          description: 'Kitchen sink supply line failed',
          location: 'Kitchen',
          discoveryDate: hoursAgo(12),
          eventDate: hoursAgo(14),
        },
        scheduledDate: hoursAgo(-24),
        psmData: {
          psmPhase: {
            status: 'field-complete',
            assignedPSM: 'Sarah Johnson',
            daysInPhase: 0,
            notes: 'New job - install scheduled',
          },
          redFlags: [],
          documentationReview: {
            photosComplete: false,
            moistureReadingsComplete: false,
            equipmentLogsComplete: false,
            workAuthorizationSigned: false,
            missingItems: ['Pending job start'],
            reviewedAt: hoursAgo(10),
            reviewedBy: 'PSM-001',
          },
          adjusterCommunications: [{
            communicationId: 'comm-001',
            adjusterName: 'Mike Peterson',
            contactMethod: 'phone',
            timestamp: hoursAgo(11),
            subject: 'Initial claim',
            summary: 'Coverage confirmed',
            followUpRequired: false,
            sentBy: 'office',
          }],
          approvalStatus: {
            scopeApproved: true,
            scopeApprovedAt: hoursAgo(11),
            scopeApprovedBy: 'Mike Peterson',
            estimateSubmitted: false,
            estimateApproved: false,
            currentEstimateAmount: 5000,
            notes: 'Verbal approval',
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
      },

      // JOB 2: Install In Progress
      {
        jobId: 'JOB-2024-002',
        jobStatus: 'Install',
        customerInfo: {
          name: 'Chen Residence',
          address: '4567 Oak St',
          city: 'Houston',
          state: 'TX',
          zipCode: '77002',
          phoneNumber: '(713) 555-1002',
          email: 'chen@email.com',
          coordinates: { latitude: 29.7504, longitude: -95.3598 },
        },
        insuranceInfo: {
          carrierName: 'Farmers',
          policyNumber: 'FM-1002',
          claimNumber: 'CLM-1002',
          adjusterName: 'Lisa Wong',
          adjusterPhone: '(800) 555-1002',
          adjusterEmail: 'lwong@farmers.com',
          deductible: 2500,
          estimatedValue: 15000,
          categoryOfWater: 'Category 2',
        },
        causeOfLoss: {
          type: 'Appliance Leak',
          description: 'Washing machine overflow',
          location: 'Laundry room',
          discoveryDate: hoursAgo(8),
          eventDate: hoursAgo(10),
        },
        scheduledDate: hoursAgo(2),
        workflowPhases: {
          install: {
            status: 'in-progress',
            startedAt: hoursAgo(2),
            technician: 'tech1',
            notes: 'On-site setting equipment',
          },
          demo: { status: 'pending' },
          checkService: { status: 'pending', visits: [] },
          pull: { status: 'pending' },
        },
        psmData: {
          psmPhase: {
            status: 'field-complete',
            assignedPSM: 'Sarah Johnson',
            daysInPhase: 0,
            notes: 'Active install',
          },
          redFlags: [{
            flagId: 'flag-002',
            type: 'scope',
            severity: 'medium',
            description: 'Possible category upgrade',
            detectedAt: hoursAgo(2),
            resolved: false,
          }],
          documentationReview: {
            photosComplete: false,
            moistureReadingsComplete: false,
            equipmentLogsComplete: false,
            workAuthorizationSigned: true,
            missingItems: ['Photos', 'Readings'],
            reviewedAt: hoursAgo(1),
            reviewedBy: 'PSM-001',
          },
          adjusterCommunications: [{
            communicationId: 'comm-002',
            adjusterName: 'Lisa Wong',
            contactMethod: 'email',
            timestamp: hoursAgo(8),
            subject: 'Emergency authorization',
            summary: 'Verbal approval received',
            followUpRequired: true,
            sentBy: 'tech1',
          }],
          approvalStatus: {
            scopeApproved: true,
            scopeApprovedAt: hoursAgo(8),
            scopeApprovedBy: 'Lisa Wong',
            estimateSubmitted: false,
            estimateApproved: false,
            currentEstimateAmount: 15000,
            notes: 'Formal estimate due 24h',
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
      },

      // Add more jobs (JOB-003 through JOB-015)
      // For brevity, I'll create a generator function
    ];

    // Generate remaining jobs programmatically
    for (let i = 3; i <= 15; i++) {
      const jobNum = i.toString().padStart(3, '0');
      const status = ['Demo', 'Check Service', 'Pull', 'Complete'][i % 4] as Job['jobStatus'];
      const daysOld = Math.floor(i / 2);

      jobs.push({
        jobId: `JOB-2024-${jobNum}`,
        jobStatus: status,
        customerInfo: {
          name: `Customer ${i}`,
          address: `${1000 + i} Test St`,
          city: 'Houston',
          state: 'TX',
          zipCode: `7700${i % 9}`,
          phoneNumber: `(713) 555-10${jobNum}`,
          email: `customer${i}@email.com`,
          coordinates: { latitude: 29.76 + (i * 0.01), longitude: -95.37 - (i * 0.01) },
        },
        insuranceInfo: {
          carrierName: ['State Farm', 'Allstate', 'Farmers', 'Progressive'][i % 4],
          policyNumber: `POL-${jobNum}`,
          claimNumber: `CLM-${jobNum}`,
          adjusterName: `Adjuster ${i}`,
          adjusterPhone: `(800) 555-10${jobNum}`,
          adjusterEmail: `adjuster${i}@insurance.com`,
          deductible: 1000 + (i * 500),
          estimatedValue: 5000 + (i * 2000),
          categoryOfWater: ['Category 1', 'Category 2', 'Category 3'][i % 3] as Job['insuranceInfo']['categoryOfWater'],
        },
        causeOfLoss: {
          type: ['Burst Pipe', 'Flooding', 'Appliance Leak', 'Sewage Backup'][i % 4] as Job['causeOfLoss']['type'],
          description: `Loss description for job ${i}`,
          location: ['Kitchen', 'Bathroom', 'Basement', 'Attic'][i % 4],
          discoveryDate: daysAgo(daysOld, 8),
          eventDate: daysAgo(daysOld, 6),
        },
        scheduledDate: daysAgo(daysOld, 9),
        workflowPhases: {
          install: {
            status: 'completed',
            startedAt: daysAgo(daysOld, 9),
            completedAt: daysAgo(daysOld, 13),
            technician: 'tech1',
            notes: 'Completed install',
          },
          demo: {
            status: status === 'Demo' || status === 'Check Service' || status === 'Pull' || status === 'Complete' ? 'completed' : 'pending',
            ...(status !== 'Pre-Install' && status !== 'Install' && {
              startedAt: daysAgo(daysOld - 1, 10),
              completedAt: daysAgo(daysOld - 1, 14),
              technician: 'tech1',
            }),
          },
          checkService: {
            status: status === 'Check Service' || status === 'Pull' || status === 'Complete' ? 'in-progress' : 'pending',
            visits: status === 'Check Service' || status === 'Pull' || status === 'Complete' ? [
              {
                visitNumber: 1,
                startedAt: daysAgo(Math.max(1, daysOld - 2), 10),
                completedAt: daysAgo(Math.max(1, daysOld - 2), 10.5),
                technician: 'tech1',
                notes: 'Check service visit',
                readingsVerified: true,
              }
            ] : [],
          },
          pull: {
            status: status === 'Pull' || status === 'Complete' ? 'completed' : 'pending',
            ...(status === 'Complete' && {
              startedAt: daysAgo(1, 10),
              completedAt: daysAgo(1, 11),
              technician: 'tech1',
            }),
          },
        },
        psmData: {
          psmPhase: {
            status: ['field-complete', 'reviewing', 'awaiting-adjuster', 'approved', 'invoiced'][i % 5] as any,
            assignedPSM: 'Sarah Johnson',
            daysInPhase: daysOld,
            notes: `PSM notes for job ${i}`,
          },
          redFlags: i % 4 === 0 ? [{
            flagId: `flag-${jobNum}`,
            type: 'documentation',
            severity: 'medium',
            description: 'Sample red flag',
            detectedAt: daysAgo(daysOld),
            resolved: i % 8 === 0,
          }] : [],
          documentationReview: {
            photosComplete: i % 3 !== 0,
            moistureReadingsComplete: i % 3 !== 1,
            equipmentLogsComplete: i % 3 !== 2,
            workAuthorizationSigned: true,
            missingItems: i % 3 === 0 ? ['Photos'] : [],
            reviewedAt: daysAgo(daysOld),
            reviewedBy: 'PSM-001',
          },
          adjusterCommunications: [{
            communicationId: `comm-${jobNum}`,
            adjusterName: `Adjuster ${i}`,
            contactMethod: 'email',
            timestamp: daysAgo(daysOld),
            subject: 'Claim communication',
            summary: 'Communication summary',
            followUpRequired: false,
            sentBy: 'PSM-001',
          }],
          approvalStatus: {
            scopeApproved: true,
            scopeApprovedAt: daysAgo(daysOld),
            scopeApprovedBy: `Adjuster ${i}`,
            estimateSubmitted: i > 5,
            estimateApproved: i > 10,
            currentEstimateAmount: 5000 + (i * 2000),
            notes: `Approval notes for job ${i}`,
          },
          homeownerCommunications: [],
          invoice: {
            invoiceNumber: status === 'Complete' ? `INV-${jobNum}` : '',
            generatedAt: status === 'Complete' ? daysAgo(1) : undefined,
            generatedBy: status === 'Complete' ? 'PSM-001' : '',
            totalAmount: status === 'Complete' ? 5000 + (i * 2000) : 0,
            lineItems: status === 'Complete' ? [{
              description: 'Mitigation services',
              quantity: 1,
              rate: 5000 + (i * 2000),
              total: 5000 + (i * 2000),
            }] : [],
            sentToAdjuster: status === 'Complete',
            paidInFull: status === 'Complete' && i % 2 === 0,
          },
        },
      });
    }

    // Fill in required fields for all jobs
    return jobs.map((job, index) => ({
      ...job,
      rooms: [],
      equipment: {
        chambers: [],
        calculations: {
          totalAffectedSquareFootage: 100 + (index * 50),
          totalCubicFootage: 800 + (index * 400),
          estimatedDryingDays: 3 + (index % 5),
          recommendedDehumidifierCount: 1 + (index % 3),
          recommendedAirMoverCount: 2 + (index % 4),
          recommendedAirScrubberCount: index % 5 === 0 ? 1 : 0,
          calculationMethod: 'IICRC S500',
          lastCalculatedAt: daysAgo(Math.floor(index / 2)),
          calculatedBy: 'tech1',
          waterClass: ['Class 1', 'Class 2', 'Class 3'][index % 3] as any,
          waterCategory: job.insuranceInfo?.categoryOfWater || 'Category 1',
        },
      },
      safetyChecklist: {
        preArrivalInspection: true,
        containmentSetup: job.insuranceInfo?.categoryOfWater === 'Category 3',
        ppeEquipped: true,
        safetyConesPlaced: true,
        utilityLocations: {
          electrical: true,
          gas: true,
          water: true,
          verified: true,
          verifiedAt: daysAgo(Math.floor(index / 2)),
        },
        hazardsIdentified: [],
      },
      communication: {
        groundRulesPresented: true,
        estimatedTimeline: `${3 + (index % 5)} days`,
        customerConcerns: [],
        preExistingConditions: [],
      },
      financial: {
        insuranceDeductible: job.insuranceInfo?.deductible || 1000,
        estimatedMaterials: 500 + (index * 200),
        estimatedLabor: 1500 + (index * 300),
        estimatedTotal: job.insuranceInfo?.estimatedValue || 5000,
        actualExpenses: {
          materials: 500 + (index * 200),
          labor: 1500 + (index * 300),
          equipment: 200 + (index * 50),
          total: 2200 + (index * 550),
        },
        paymentStatus: job.jobStatus === 'Complete' && index % 2 === 0 ? 'paid' : 'unpaid',
        paymentMethod: 'insurance',
        payments: [],
      },
      documentation: {
        matterportScan: {
          completed: job.jobStatus === 'Complete',
          ...(job.jobStatus === 'Complete' && {
            url: `https://matterport.com/scan/${index}`,
            scanDate: daysAgo(1),
          }),
        },
        certificateOfSatisfaction: {
          obtained: job.jobStatus === 'Complete',
          ...(job.jobStatus === 'Complete' && {
            signedDate: daysAgo(1),
          }),
        },
        dryReleaseWaiver: {
          needed: false,
          obtained: false,
        },
      },
      scheduledZone: ['Zone 1', 'Zone 2', 'Zone 3', '2nd Shift'][index % 4] as any,
      scheduledTechnician: 'tech1',
      metadata: {
        createdAt: daysAgo(Math.floor(index / 2) + 1),
        createdBy: 'tech1',
        lastModifiedAt: daysAgo(Math.max(0, Math.floor(index / 3))),
        lastModifiedBy: 'tech1',
        version: index + 1,
      },
      workflowPhases: job.workflowPhases || {
        install: { status: 'pending' },
        demo: { status: 'pending' },
        checkService: { status: 'pending', visits: [] },
        pull: { status: 'pending' },
      },
    })) as Job[];
  };

  const seedDatabase = async () => {
    setIsSeeding(true);
    setError('');
    setJobsCreated(0);

    try {
      // Step 1: Clear existing jobs
      await clearAllJobs();

      // Step 2: Generate and seed new jobs
      setStatus('Generating comprehensive PSM job data...');
      const jobs = generateComprehensiveJobs();

      setStatus(`Seeding ${jobs.length} jobs...`);

      for (const job of jobs) {
        const jobRef = doc(db, 'jobs', job.jobId);
        await setDoc(jobRef, job);
        setJobsCreated(prev => prev + 1);
      }

      setStatus(`✅ Successfully seeded ${jobs.length} jobs!`);

    } catch (err: any) {
      console.error('Seeding error:', err);
      setError(err.message || 'Failed to seed database');
      setStatus('');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-entrusted-orange" />
            <h1 className="text-3xl font-bold text-gray-900">Database Seeding</h1>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">What this does:</h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li>Clears ALL existing jobs from the database</li>
              <li>Creates 15 comprehensive test jobs across all workflow phases</li>
              <li>Generates realistic PSM data for all jobs</li>
              <li>Includes jobs in Pre-Install, Install, Demo, Check Service, Pull, and Complete states</li>
              <li>PSM Dashboard will show ALL jobs for tracking and reporting</li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={seedDatabase}
              disabled={isSeeding}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-entrusted-orange text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
            >
              {isSeeding ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="w-6 h-6" />
                  Seed Database (Clear & Repopulate)
                </>
              )}
            </button>

            {status && (
              <div className={`flex items-start gap-3 p-4 rounded-lg ${
                status.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                {status.includes('✅') ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <Loader className="w-5 h-5 text-gray-600 animate-spin mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${status.includes('✅') ? 'text-green-900' : 'text-gray-900'}`}>
                    {status}
                  </p>
                  {jobsCreated > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Jobs created: {jobsCreated} / 15
                    </p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">After Seeding:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-entrusted-orange">→</span>
                <span>Navigate to PSM Dashboard to see all 15 jobs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-entrusted-orange">→</span>
                <span>Jobs will be in various phases: Pre-Install, Install, Demo, Check Service, Pull, Complete</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-entrusted-orange">→</span>
                <span>Use filters to view jobs by status, zone, or flags</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-entrusted-orange">→</span>
                <span>Click any job to see full details and generate reports</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
