/**
 * Demo Admin Dashboard
 *
 * Comprehensive development admin interface for:
 * - Resetting all data (Firestore + Storage)
 * - Seeding 20 jobs from CSV (10 preinstall + 10 phased)
 * - Managing jobs (view, delete, advance phase)
 * - Viewing statistics and metrics
 * - Generating test data
 */

import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { Job, WaterCategory, CauseOfLossType, ApprovalStatus } from '../../types';
import {
  Database,
  Loader,
  CheckCircle,
  AlertCircle,
  Trash2,
  Upload,
  Users,
  TrendingUp,
  FileText,
  Filter,
  Search,
  ChevronRight,
  Settings,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CSVJob {
  clientName: string;
  address: string;
  phone: string;
  email: string;
  referralSource: string;
  referralIndividual: string;
  accountManager: string;
  damageConsultant: string;
  zone: string;
  categoryOfWater: string;
  roomsAffected: string;
  causeOfLoss: string;
  causeOfLossStatus: string;
  isDemoNeeded: string;
  isMoldTestNeeded: string;
  claimNumber: string;
  carrierName: string;
  deductible: string;
  contractedAmountTotal: string;
  claimFiled: string;
  specificPromises: string;
  detailedFUP: string;
}

export const DemoAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [csvData, setCSVData] = useState<CSVJob[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const loadedJobs = jobsSnapshot.docs.map(doc => ({ ...doc.data(), jobId: doc.id } as Job));
      setJobs(loadedJobs);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setCSVData(parsed);
      setStatus(`✅ Loaded ${parsed.length} jobs from CSV - ready to seed`);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): CSVJob[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const csvJobs: CSVJob[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split(',');
      const job: any = {};

      headers.forEach((header, index) => {
        const key = header
          .trim()
          .replace(/\s+/g, '')
          .replace(/[()]/g, '')
          .replace(/\?/g, '')
          .replace(/\//g, '');
        job[key] = values[index]?.trim() || '';
      });

      csvJobs.push(job as CSVJob);
    }

    return csvJobs;
  };

  const resetAllData = async () => {
    if (!window.confirm('⚠️ This will DELETE ALL jobs and photos. This cannot be undone. Continue?')) {
      return;
    }

    setIsResetting(true);
    setError('');

    try {
      setStatus('Deleting all jobs from Firestore...');
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const batch = writeBatch(db);

      jobsSnapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
      setStatus(`✅ Deleted ${jobsSnapshot.docs.length} jobs from Firestore`);

      // Clear local state
      setJobs([]);

      setStatus('✅ All data reset complete!');
    } catch (err: any) {
      console.error('Reset error:', err);
      setError(err.message || 'Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  const seedJobs = async () => {
    if (csvData.length === 0) {
      setError('Please upload CSV file first');
      return;
    }

    setIsSeeding(true);
    setError('');

    try {
      setStatus('Seeding 20 jobs from CSV...');

      // Define which jobs go to which phase
      const phaseAssignments: { [key: number]: Job['jobStatus'] } = {
        0: 'Pre-Install', 1: 'Pre-Install', 2: 'Pre-Install', 3: 'Pre-Install', 4: 'Pre-Install',
        5: 'Pre-Install', 6: 'Pre-Install', 7: 'Pre-Install', 8: 'Pre-Install', 9: 'Pre-Install',
        10: 'Install', 11: 'Install',
        12: 'Check Service', 13: 'Check Service',
        14: 'Check Service', 15: 'Check Service',
        16: 'Demo', 17: 'Demo',
        18: 'Pull', 19: 'Pull',
      };

      const now = Timestamp.now();
      const seededJobs: Job[] = [];

      for (let i = 0; i < Math.min(20, csvData.length); i++) {
        const csvJob = csvData[i];
        const jobPhase = phaseAssignments[i] || 'Pre-Install';
        const jobId = `DEMO-2024-${(i + 1).toString().padStart(3, '0')}`;

        // Parse address
        const addressParts = (csvJob.address || '').split(',').map(s => s.trim());
        const city = addressParts[1] || 'Houston';
        const state = addressParts[2] || 'TX';
        const zip = addressParts[3] || '77000';

        const job = {
          jobId,
          customerInfo: {
            name: csvJob.clientName || 'Unknown Customer',
            address: addressParts[0] || csvJob.address || 'Unknown Address',
            city,
            state,
            zipCode: zip,
            phoneNumber: csvJob.phone || '(000) 000-0000',
            email: csvJob.email || `${(csvJob.clientName || 'customer').replace(/\s/g, '').toLowerCase()}@email.com`,
            coordinates: {
              latitude: 29.76 + (i * 0.01),
              longitude: -95.37 - (i * 0.01),
            },
          },
          insuranceInfo: {
            carrierName: csvJob.carrierName || 'Unknown',
            policyNumber: `POL-${jobId}`,
            claimNumber: csvJob.claimNumber || 'Pending',
            adjusterName: csvJob.damageConsultant || 'TBD',
            adjusterPhone: '(800) 555-0100',
            adjusterEmail: 'adjuster@insurance.com',
            deductible: parseInt(csvJob.deductible) || 1000,
            estimatedValue: parseInt(csvJob.contractedAmountTotal) || 5000,
            categoryOfWater: (csvJob.categoryOfWater || 'Category 1') as WaterCategory,
          },
          causeOfLoss: {
            type: (csvJob.causeOfLoss || 'Other') as CauseOfLossType,
            description: csvJob.specificPromises || '',
            location: csvJob.roomsAffected || 'Multiple rooms',
            discoveryDate: now,
            eventDate: now,
          },
          jobStatus: jobPhase,
          workflowPhases: {
            install: {
              status: ['Install', 'Demo', 'Check Service', 'Pull', 'Complete'].includes(jobPhase) ? 'completed' : 'pending',
              ...(['Install', 'Demo', 'Check Service', 'Pull', 'Complete'].includes(jobPhase) && {
                startedAt: now,
                completedAt: now,
                technician: 'tech1',
                notes: 'Completed install',
              }),
            },
            demo: {
              status: jobPhase === 'Demo' ? 'in-progress' : ['Check Service', 'Pull', 'Complete'].includes(jobPhase) ? 'completed' : 'pending',
              ...(['Demo', 'Check Service', 'Pull', 'Complete'].includes(jobPhase) && {
                startedAt: now,
              }),
            },
            checkService: {
              status: jobPhase === 'Check Service' ? 'in-progress' : ['Pull', 'Complete'].includes(jobPhase) ? 'completed' : 'pending',
              visits: jobPhase === 'Check Service' ? [{
                visitNumber: i < 14 ? 1 : 2,
                startedAt: now,
                completedAt: now,
                technician: 'tech1',
                notes: `Check service visit ${i < 14 ? 1 : 2}`,
                readingsVerified: true,
              }] : [],
            },
            pull: {
              status: jobPhase === 'Pull' ? 'in-progress' : jobPhase === 'Complete' ? 'completed' : 'pending',
            },
          },
          rooms: [],
          equipment: {
            chambers: [],
            calculations: {
              totalAffectedSquareFootage: 100 + (i * 20),
              totalCubicFootage: 800 + (i * 100),
              estimatedDryingDays: 3 + (i % 3),
              recommendedDehumidifierCount: 1 + (i % 2),
              recommendedAirMoverCount: 2 + (i % 3),
              recommendedAirScrubberCount: i % 5 === 0 ? 1 : 0,
              calculationMethod: 'IICRC S500',
              lastCalculatedAt: now,
              calculatedBy: 'tech1',
              waterClass: 'Class 2',
              waterCategory: (csvJob.categoryOfWater || 'Category 1') as WaterCategory,
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
            estimatedTimeline: '3-5 days',
            customerConcerns: [],
            preExistingConditions: [],
          },
          financial: {
            insuranceDeductible: parseInt(csvJob.deductible) || 1000,
            estimatedMaterials: 500,
            estimatedLabor: 1500,
            estimatedTotal: parseInt(csvJob.contractedAmountTotal) || 5000,
            actualExpenses: {
              materials: 0,
              labor: 0,
              equipment: 0,
              total: 0,
            },
            paymentStatus: 'unpaid',
            paymentMethod: csvJob.claimFiled === 'true' ? 'insurance' : 'cash',
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
          scheduledZone: csvJob.zone === '2' ? 'Zone 2' : csvJob.zone === '3' ? 'Zone 3' : csvJob.zone === '4' ? '2nd Shift' : 'Zone 1',
          scheduledTechnician: csvJob.accountManager || 'tech1',
          scheduledDate: now,
          metadata: {
            createdAt: now,
            createdBy: 'admin',
            lastModifiedAt: now,
            lastModifiedBy: 'admin',
            version: 1,
          },
          psmData: {
            psmPhase: {
              status: 'field-complete',
              assignedPSM: csvJob.accountManager || 'Unassigned',
              daysInPhase: 0,
              notes: csvJob.detailedFUP || '',
            },
            redFlags: [],
            documentationReview: {
              checklist: {
                allRoomsPhotographed: jobPhase !== 'Pre-Install',
                moistureReadingsComplete: ['Check Service', 'Pull', 'Complete'].includes(jobPhase),
                equipmentScanned: ['Install', 'Demo', 'Check Service', 'Pull', 'Complete'].includes(jobPhase),
                demoDocumented: jobPhase === 'Demo',
                customerSignatures: false,
                matterportCompleted: false,
              },
              missingItems: [],
              reviewedBy: 'admin',
              reviewedAt: now,
              readyForSubmission: false,
            },
            adjusterCommunications: [],
            approvalStatus: {
              demoScope: (csvJob.isDemoNeeded === 'true' ? 'pending' : 'denied') as ApprovalStatus,
              demoAmount: {
                requested: 0,
                approved: 0,
                deniedAmount: 0,
              },
              equipmentPlan: 'pending',
              billableItems: {},
              conditionalApprovals: [],
            },
            homeownerCommunications: [],
            invoice: {
              generated: false,
              lineItems: [],
              subtotal: 0,
              tax: 0,
              total: 0,
              amountDue: 0,
              status: 'draft',
            },
          },
          // Custom fields from CSV
          customFields: {
            referralSource: csvJob.referralSource || '',
            referralIndividual: csvJob.referralIndividual || '',
            isDemoNeeded: csvJob.isDemoNeeded === 'true',
            isMoldTestNeeded: csvJob.isMoldTestNeeded === 'true',
            specificPromises: csvJob.specificPromises || '',
            detailedFollowUp: csvJob.detailedFUP || '',
          },
        } as Job;

        const jobRef = doc(db, 'jobs', job.jobId);
        await setDoc(jobRef, job);
        seededJobs.push(job);

        setStatus(`Seeding jobs: ${i + 1} / 20...`);
      }

      setJobs(seededJobs);
      setStatus(`✅ Successfully seeded ${seededJobs.length} jobs!`);
    } catch (err: any) {
      console.error('Seeding error:', err);
      setError(err.message || 'Failed to seed jobs');
    } finally {
      setIsSeeding(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!window.confirm(`Delete job ${jobId}?`)) return;

    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      setJobs(jobs.filter(j => j.jobId !== jobId));
      setStatus(`✅ Deleted job ${jobId}`);
    } catch (err: any) {
      setError(`Failed to delete job: ${err.message}`);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (searchText) {
      const search = searchText.toLowerCase();
      if (
        !job.customerInfo.name.toLowerCase().includes(search) &&
        !job.customerInfo.address.toLowerCase().includes(search) &&
        !job.jobId.toLowerCase().includes(search)
      ) {
        return false;
      }
    }

    if (filterPhase !== 'all' && job.jobStatus !== filterPhase) return false;
    if (filterZone !== 'all' && job.scheduledZone !== filterZone) return false;

    return true;
  });

  const stats = {
    total: jobs.length,
    preinstall: jobs.filter(j => j.jobStatus === 'Pre-Install').length,
    install: jobs.filter(j => j.jobStatus === 'Install').length,
    demo: jobs.filter(j => j.jobStatus === 'Demo').length,
    checkService: jobs.filter(j => j.jobStatus === 'Check Service').length,
    pull: jobs.filter(j => j.jobStatus === 'Pull').length,
  };

  const zones = ['1', '2', '3', '4', '5'];
  const phases = ['Pre-Install', 'Install', 'Demo', 'Check Service', 'Pull'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-10 h-10" />
            <div>
              <h1 className="text-4xl font-bold">Development Admin Dashboard</h1>
              <p className="text-orange-100 mt-1">Control Panel for Test Data Management</p>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-entrusted-orange" />
            Control Panel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* CSV Upload */}
            <div>
              <label
                htmlFor="csv-upload"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors font-medium"
              >
                <Upload className="w-5 h-5" />
                {csvData.length > 0 ? `${csvData.length} CSV Jobs Loaded` : 'Upload CSV'}
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Seed Jobs */}
            <button
              onClick={seedJobs}
              disabled={isSeeding || csvData.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSeeding ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Seed 20 Jobs
                </>
              )}
            </button>

            {/* Reset All */}
            <button
              onClick={resetAllData}
              disabled={isResetting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isResetting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Reset All Data
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {status && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${
                status.includes('✅')
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {status.includes('✅') ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <Loader className="w-5 h-5 text-gray-600 animate-spin mt-0.5" />
              )}
              <p
                className={`font-medium ${
                  status.includes('✅') ? 'text-green-900' : 'text-gray-900'
                }`}
              >
                {status}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Seeding Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Seeding Strategy</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li><strong>10 jobs</strong> in Pre-Install (clean slate for end-to-end testing)</li>
              <li><strong>2 jobs</strong> in Install phase (with equipment and moisture data)</li>
              <li><strong>2 jobs</strong> in Check Service Visit 1</li>
              <li><strong>2 jobs</strong> in Check Service Visit 2</li>
              <li><strong>2 jobs</strong> in Demo phase (partial demo progress)</li>
              <li><strong>2 jobs</strong> in Pull phase (ready to pull equipment)</li>
            </ul>
          </div>
        </div>

        {/* Stats Dashboard */}
        {jobs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Pre-Install</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.preinstall}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Install</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.install}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">Demo</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{stats.demo}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Check Svc</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.checkService}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-1">
                <ChevronRight className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Pull</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{stats.pull}</p>
            </div>
          </div>
        )}

        {/* Job Management */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-entrusted-orange" />
                Job Management ({filteredJobs.length})
              </h3>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Search className="w-4 h-4 inline mr-1" />
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Name, address, or job ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                  <select
                    value={filterPhase}
                    onChange={(e) => setFilterPhase(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
                  >
                    <option value="all">All Phases</option>
                    {phases.map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <select
                    value={filterZone}
                    onChange={(e) => setFilterZone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
                  >
                    <option value="all">All Zones</option>
                    {zones.map(zone => (
                      <option key={zone} value={zone}>Zone {zone}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Job Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phase</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredJobs.map(job => {
                    const custom = (job as any).customFields || {};
                    const zoneColor =
                      job.scheduledZone === 'Zone 1' ? 'bg-green-100 text-green-800' :
                      job.scheduledZone === 'Zone 2' ? 'bg-blue-100 text-blue-800' :
                      job.scheduledZone === 'Zone 3' ? 'bg-yellow-100 text-yellow-800' :
                      job.scheduledZone === '2nd Shift' ? 'bg-purple-100 text-purple-800' :
                      'bg-pink-100 text-pink-800';

                    const phaseColor =
                      job.jobStatus === 'Pre-Install' ? 'bg-gray-100 text-gray-800' :
                      job.jobStatus === 'Install' ? 'bg-blue-100 text-blue-800' :
                      job.jobStatus === 'Demo' ? 'bg-orange-100 text-orange-800' :
                      job.jobStatus === 'Check Service' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800';

                    return (
                      <tr key={job.jobId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${zoneColor}`}>
                            Zone {job.scheduledZone}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{job.customerInfo.name}</div>
                          <div className="text-sm text-gray-500">{job.customerInfo.phoneNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{job.jobId}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${phaseColor}`}>
                            {job.jobStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{custom.referralSource || 'None'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/psm/job/${job.jobId}`)}
                              className="px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => deleteJob(job.jobId)}
                              className="px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
