/**
 * Demo Admin Page
 * Import and manage demo jobs from CSV with rich customer data
 * Includes DISC profiles, referral tracking, and customer expectations
 */

import React, { useState } from 'react';
import { collection, doc, setDoc, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Job } from '../../types';
import {
  Database,
  Loader,
  CheckCircle,
  AlertCircle,
  Upload,
  Users,
  TrendingUp,
  FileText,
  Filter,
  Search,
} from 'lucide-react';

interface CSVJob {
  clientName: string;
  address: string;
  phone: string;
  email: string;
  referralSource: string;
  referralIndividual: string;
  accountManager: string;
  damageConsultant: string;
  servicesLanded: string;
  claimFiled: string;
  claimNumber: string;
  carrierName: string;
  insurancePolicyCap: string;
  deductible: string;
  preferredPlumber: string;
  customerDISC: string;
  customerValue: string;
  customerMindset: string;
  isPaymentMade: string;
  paymentTerms: string;
  paymentMethod: string;
  contractedAmountTotal: string;
  contractedAmountCashES: string;
  contractedAmountCashGC: string;
  contractedAmountCashMLD: string;
  zone: string;
  categoryOfWater: string;
  roomsAffected: string;
  causeOfLoss: string;
  causeOfLossStatus: string;
  flooringCabinetryAffected: string;
  isDemoNeeded: string;
  isMoldTestNeeded: string;
  specificPromises: string;
  detailedFUP: string;
}

export const DemoAdminPage: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [jobsCreated, setJobsCreated] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [csvData, setCSVData] = useState<CSVJob[]>([]);
  const [importedJobs, setImportedJobs] = useState<Job[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterDISC, setFilterDISC] = useState<string>('all');
  const [filterReferral, setFilterReferral] = useState<string>('all');

  const parseCSV = (csvText: string): CSVJob[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const jobs: CSVJob[] = [];

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

      jobs.push(job as CSVJob);
    }

    return jobs;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setCSVData(parsed);
      setStatus(`✅ Loaded ${parsed.length} jobs from CSV`);
    };
    reader.readAsText(file);
  };

  const convertCSVToJob = (csvJob: CSVJob, index: number): Job => {
    const jobId = `DEMO-2024-${(index + 1).toString().padStart(3, '0')}`;
    const now = Timestamp.now();

    // Parse address
    const addressParts = csvJob.address.split(',').map(s => s.trim());
    const city = addressParts[1] || 'Houston';
    const state = addressParts[2] || 'TX';
    const zip = addressParts[3] || '77000';

    // Determine job status based on services landed
    const hasES = csvJob.servicesLanded.includes('ES');
    const hasGC = csvJob.servicesLanded.includes('GC');
    const jobStatus = hasES && !hasGC ? 'Install' : hasES && hasGC ? 'Demo' : 'Pre-Install';

    const job: Job = {
      jobId,
      customerInfo: {
        name: csvJob.clientName,
        address: addressParts[0] || csvJob.address,
        city,
        state,
        zipCode: zip,
        phoneNumber: csvJob.phone,
        email: csvJob.email || `${csvJob.clientName.replace(/\s/g, '').toLowerCase()}@email.com`,
        coordinates: {
          latitude: 29.76 + (index * 0.01),
          longitude: -95.37 - (index * 0.01),
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
        categoryOfWater: csvJob.categoryOfWater || 'Category 1',
      },
      causeOfLoss: {
        type: csvJob.causeOfLoss || 'Unknown',
        description: csvJob.specificPromises || '',
        location: csvJob.roomsAffected || 'Multiple rooms',
        discoveryDate: now,
        eventDate: now,
      },
      jobStatus: jobStatus as Job['jobStatus'],
      workflowPhases: {
        install: {
          status: hasES ? 'completed' : 'pending',
          ...(hasES && {
            startedAt: now,
            completedAt: now,
            technician: 'tech1',
            notes: 'Completed install',
          }),
        },
        demo: {
          status: hasGC ? 'in-progress' : 'pending',
          ...(hasGC && {
            startedAt: now,
          }),
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
          totalAffectedSquareFootage: 100,
          totalCubicFootage: 800,
          estimatedDryingDays: 3,
          recommendedDehumidifierCount: 1,
          recommendedAirMoverCount: 2,
          recommendedAirScrubberCount: 0,
          calculationMethod: 'IICRC S500',
          lastCalculatedAt: now,
          calculatedBy: 'tech1',
          waterClass: 'Class 2',
          waterCategory: csvJob.categoryOfWater || 'Category 1',
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
        paymentStatus: csvJob.isPaymentMade === 'true' ? 'paid' : 'unpaid',
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
      scheduledZone: (csvJob.zone || 'Zone 1') as any,
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
            allRoomsPhotographed: false,
            moistureReadingsComplete: false,
            equipmentScanned: false,
            demoDocumented: csvJob.isDemoNeeded === 'true',
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
          demoScope: csvJob.isDemoNeeded === 'true' ? 'pending' : 'not-required',
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
      // Custom demo fields from CSV
      customFields: {
        referralSource: csvJob.referralSource,
        referralIndividual: csvJob.referralIndividual,
        customerDISC: csvJob.customerDISC,
        customerValue: csvJob.customerValue,
        customerMindset: csvJob.customerMindset,
        preferredPlumber: csvJob.preferredPlumber,
        isDemoNeeded: csvJob.isDemoNeeded === 'true',
        isMoldTestNeeded: csvJob.isMoldTestNeeded === 'true',
        specificPromises: csvJob.specificPromises,
        detailedFollowUp: csvJob.detailedFUP,
      },
    };

    return job;
  };

  const importToFirestore = async () => {
    if (csvData.length === 0) {
      setError('Please upload a CSV file first');
      return;
    }

    setIsImporting(true);
    setError('');
    setJobsCreated(0);

    try {
      setStatus('Converting CSV data to job format...');
      const jobs = csvData.map((csvJob, index) => convertCSVToJob(csvJob, index));
      setImportedJobs(jobs);

      setStatus(`Importing ${jobs.length} jobs to Firestore...`);

      for (const job of jobs) {
        const jobRef = doc(db, 'jobs', job.jobId);
        await setDoc(jobRef, job);
        setJobsCreated(prev => prev + 1);
      }

      setStatus(`✅ Successfully imported ${jobs.length} demo jobs!`);
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import jobs');
      setStatus('');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredJobs = importedJobs.filter(job => {
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

    if (filterDISC !== 'all') {
      const disc = (job as any).customFields?.customerDISC || '';
      if (!disc.includes(filterDISC)) return false;
    }

    if (filterReferral !== 'all') {
      const referral = (job as any).customFields?.referralSource || '';
      if (referral !== filterReferral) return false;
    }

    return true;
  });

  const stats = {
    total: importedJobs.length,
    demoNeeded: importedJobs.filter(j => (j as any).customFields?.isDemoNeeded).length,
    moldTestNeeded: importedJobs.filter(j => (j as any).customFields?.isMoldTestNeeded).length,
    hasInsurance: importedJobs.filter(j => j.financial.paymentMethod === 'insurance').length,
  };

  const discTypes = [...new Set(importedJobs.map(j => (j as any).customFields?.customerDISC).filter(Boolean))];
  const referralSources = [...new Set(importedJobs.map(j => (j as any).customFields?.referralSource).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-entrusted-orange" />
            <h1 className="text-3xl font-bold text-gray-900">Demo Admin Dashboard</h1>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">CSV Import</h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li>Upload CSV file with 20 demo jobs</li>
              <li>Includes customer DISC profiles, referral sources, and expectations</li>
              <li>Automatically creates jobs with all metadata</li>
              <li>Track demo needs, mold tests, and customer promises</li>
            </ul>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="csv-upload"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-entrusted-orange hover:bg-orange-50 cursor-pointer transition-colors"
              >
                <Upload className="w-6 h-6 text-gray-600" />
                <span className="font-medium text-gray-700">
                  {csvData.length > 0 ? `${csvData.length} jobs loaded` : 'Upload CSV File'}
                </span>
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {csvData.length > 0 && (
              <button
                onClick={importToFirestore}
                disabled={isImporting}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-entrusted-orange text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
              >
                {isImporting ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Importing to Firestore...
                  </>
                ) : (
                  <>
                    <Database className="w-6 h-6" />
                    Import {csvData.length} Jobs to Firestore
                  </>
                )}
              </button>
            )}

            {status && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${
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
                <div>
                  <p
                    className={`font-medium ${
                      status.includes('✅') ? 'text-green-900' : 'text-gray-900'
                    }`}
                  >
                    {status}
                  </p>
                  {jobsCreated > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Jobs imported: {jobsCreated} / {csvData.length}
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
        </div>

        {/* Stats Dashboard */}
        {importedJobs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Demo Needed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.demoNeeded}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Mold Test Needed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.moldTestNeeded}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Insurance Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.hasInsurance}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filters</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">DISC Type</label>
                  <select
                    value={filterDISC}
                    onChange={(e) => setFilterDISC(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
                  >
                    <option value="all">All Types</option>
                    {discTypes.map(disc => (
                      <option key={disc} value={disc}>{disc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referral Source</label>
                  <select
                    value={filterReferral}
                    onChange={(e) => setFilterReferral(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
                  >
                    <option value="all">All Sources</option>
                    {referralSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">
                  Imported Jobs ({filteredJobs.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DISC</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mold Test</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredJobs.map(job => {
                      const custom = (job as any).customFields || {};
                      return (
                        <tr key={job.jobId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{job.jobId}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{job.customerInfo.name}</div>
                            <div className="text-sm text-gray-500">{job.customerInfo.address}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                              {custom.customerDISC || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{custom.referralSource || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{job.scheduledZone}</td>
                          <td className="px-4 py-3">
                            {custom.isDemoNeeded ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {custom.isMoldTestNeeded ? (
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              job.jobStatus === 'Demo' ? 'bg-orange-100 text-orange-800' :
                              job.jobStatus === 'Install' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.jobStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
