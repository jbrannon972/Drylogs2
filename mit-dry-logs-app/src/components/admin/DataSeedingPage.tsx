/**
 * Data Seeding Page - Web-based seed data management
 *
 * Accessible from browser to seed database with comprehensive PSM job data
 */

import React, { useState } from 'react';
import { collection, doc, setDoc, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Job } from '../../types';
import { Database, Loader, CheckCircle, AlertCircle } from 'lucide-react';

export const DataSeedingPage: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [jobsCreated, setJobsCreated] = useState<number>(0);
  const [error, setError] = useState<string>('');

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
    const jobs: Job[] = [];

    // Generate 15 jobs with correct type structure
    for (let i = 1; i <= 15; i++) {
      const jobNum = i.toString().padStart(3, '0');
      const statuses: Job['jobStatus'][] = ['Pre-Install', 'Install', 'Demo', 'Check Service', 'Pull', 'Complete'];
      const status = statuses[i % statuses.length];
      const daysOld = Math.floor(i / 2);

      const job: Job = {
        jobId: `JOB-2024-${jobNum}`,
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
          categoryOfWater: ['Category 1', 'Category 2', 'Category 3'][i % 3] as any,
        },
        causeOfLoss: {
          type: ['Burst Pipe', 'Flooding', 'Appliance Leak', 'Sewage Backup'][i % 4] as any,
          description: `Loss description for job ${i}`,
          location: ['Kitchen', 'Bathroom', 'Basement', 'Attic'][i % 4],
          discoveryDate: daysAgo(daysOld, 8),
          eventDate: daysAgo(daysOld, 6),
        },
        jobStatus: status,
        workflowPhases: {
          install: {
            status: status === 'Pre-Install' ? 'pending' : 'completed',
            ...(status !== 'Pre-Install' && {
              startedAt: daysAgo(daysOld, 9),
              completedAt: daysAgo(daysOld, 13),
              technician: 'tech1',
              notes: 'Completed install',
            }),
          },
          demo: {
            status: ['Demo', 'Check Service', 'Pull', 'Complete'].includes(status) ? 'completed' : 'pending',
            ...(['Demo', 'Check Service', 'Pull', 'Complete'].includes(status) && {
              startedAt: daysAgo(Math.max(1, daysOld - 1), 10),
              completedAt: daysAgo(Math.max(1, daysOld - 1), 14),
              technician: 'tech1',
            }),
          },
          checkService: {
            status: ['Check Service', 'Pull', 'Complete'].includes(status) ? 'in-progress' : 'pending',
            visits: ['Check Service', 'Pull', 'Complete'].includes(status) ? [{
              visitNumber: 1,
              startedAt: daysAgo(Math.max(1, daysOld - 2), 10),
              completedAt: daysAgo(Math.max(1, daysOld - 2), 10.5),
              technician: 'tech1',
              notes: 'Check service visit',
              readingsVerified: true,
            }] : [],
          },
          pull: {
            status: status === 'Complete' ? 'completed' : 'pending',
            ...(status === 'Complete' && {
              startedAt: daysAgo(1, 10),
              completedAt: daysAgo(1, 11),
              technician: 'tech1',
            }),
          },
        },
        rooms: [],
        equipment: {
          chambers: [],
          calculations: {
            totalAffectedSquareFootage: 100 + (i * 50),
            totalCubicFootage: 800 + (i * 400),
            estimatedDryingDays: 3 + (i % 5),
            recommendedDehumidifierCount: 1 + (i % 3),
            recommendedAirMoverCount: 2 + (i % 4),
            recommendedAirScrubberCount: i % 5 === 0 ? 1 : 0,
            calculationMethod: 'IICRC S500',
            lastCalculatedAt: daysAgo(Math.floor(i / 2)),
            calculatedBy: 'tech1',
            waterClass: ['Class 1', 'Class 2', 'Class 3'][i % 3] as any,
            waterCategory: ['Category 1', 'Category 2', 'Category 3'][i % 3] as any,
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
            verifiedAt: daysAgo(Math.floor(i / 2)),
          },
          hazardsIdentified: [],
        },
        communication: {
          groundRulesPresented: true,
          estimatedTimeline: `${3 + (i % 5)} days`,
          customerConcerns: [],
          preExistingConditions: [],
        },
        financial: {
          insuranceDeductible: 1000 + (i * 500),
          estimatedMaterials: 500 + (i * 200),
          estimatedLabor: 1500 + (i * 300),
          estimatedTotal: 5000 + (i * 2000),
          actualExpenses: {
            materials: 500 + (i * 200),
            labor: 1500 + (i * 300),
            equipment: 200 + (i * 50),
            total: 2200 + (i * 550),
          },
          paymentStatus: status === 'Complete' && i % 2 === 0 ? 'paid' : 'unpaid',
          paymentMethod: 'insurance',
          payments: [],
        },
        documentation: {
          matterportScan: {
            completed: status === 'Complete',
            ...(status === 'Complete' && {
              url: `https://matterport.com/scan/${i}`,
              scanDate: daysAgo(1),
            }),
          },
          certificateOfSatisfaction: {
            obtained: status === 'Complete',
            ...(status === 'Complete' && {
              signedDate: daysAgo(1),
            }),
          },
          dryReleaseWaiver: {
            needed: false,
            obtained: false,
          },
        },
        scheduledZone: ['Zone 1', 'Zone 2', 'Zone 3', '2nd Shift'][i % 4] as any,
        scheduledTechnician: 'tech1',
        scheduledDate: daysAgo(Math.floor(i / 2) + 1),
        metadata: {
          createdAt: daysAgo(Math.floor(i / 2) + 1),
          createdBy: 'tech1',
          lastModifiedAt: daysAgo(Math.max(0, Math.floor(i / 3))),
          lastModifiedBy: 'tech1',
          version: i + 1,
        },
        psmData: {
          psmPhase: {
            status: ['field-complete', 'reviewing', 'awaiting-adjuster', 'approved', 'invoiced'][i % 5] as any,
            assignedPSM: 'Sarah Johnson',
            daysInPhase: daysOld,
            notes: `PSM notes for job ${i}`,
          },
          redFlags: i % 4 === 0 ? [{
            id: `flag-${jobNum}`,
            type: 'missing-photos',
            severity: 'medium',
            description: 'Some documentation photos missing',
            detectedAt: daysAgo(daysOld),
            resolved: i % 8 === 0,
          }] : [],
          documentationReview: {
            checklist: {
              allRoomsPhotographed: i % 3 !== 0,
              moistureReadingsComplete: i % 3 !== 1,
              equipmentScanned: i % 3 !== 2,
              demoDocumented: true,
              customerSignatures: true,
              matterportCompleted: status === 'Complete',
            },
            missingItems: i % 3 === 0 ? ['Room photos'] : [],
            reviewedBy: 'PSM-001',
            reviewedAt: daysAgo(daysOld),
            readyForSubmission: i % 2 === 0,
          },
          adjusterCommunications: [{
            id: `comm-${jobNum}`,
            communicationType: 'email',
            timestamp: daysAgo(daysOld),
            contactedBy: 'PSM-001',
            summary: 'Initial claim communication',
            questionsAsked: ['Coverage confirmation'],
            answersProvided: ['Coverage confirmed'],
            nextStep: 'Submit estimate',
          }],
          approvalStatus: {
            demoScope: i > 5 ? 'approved' : 'pending',
            demoAmount: {
              requested: 2000 + (i * 500),
              approved: i > 10 ? 2000 + (i * 500) : 0,
              deniedAmount: 0,
            },
            equipmentPlan: 'approved',
            billableItems: {},
            conditionalApprovals: [],
          },
          homeownerCommunications: [],
          invoice: {
            generated: status === 'Complete',
            ...(status === 'Complete' && {
              generatedAt: daysAgo(1),
              generatedBy: 'PSM-001',
              invoiceNumber: `INV-${jobNum}`,
            }),
            lineItems: status === 'Complete' ? [{
              description: 'Mitigation services',
              quantity: 1,
              unitPrice: 5000 + (i * 2000),
              totalPrice: 5000 + (i * 2000),
              approvalStatus: 'approved',
            }] : [],
            subtotal: status === 'Complete' ? 5000 + (i * 2000) : 0,
            tax: status === 'Complete' ? (5000 + (i * 2000)) * 0.0825 : 0,
            total: status === 'Complete' ? (5000 + (i * 2000)) * 1.0825 : 0,
            amountDue: status === 'Complete' && i % 2 !== 0 ? (5000 + (i * 2000)) * 1.0825 : 0,
            status: status === 'Complete' ? (i % 2 === 0 ? 'paid' : 'approved') : 'draft',
          },
        },
      };

      jobs.push(job);
    }

    return jobs;
  };

  const seedDatabase = async () => {
    setIsSeeding(true);
    setError('');
    setJobsCreated(0);

    try {
      await clearAllJobs();

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
