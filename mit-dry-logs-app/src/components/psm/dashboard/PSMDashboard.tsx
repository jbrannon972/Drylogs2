import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobsStore } from '../../../stores/jobsStore';
import { useAuth } from '../../../hooks/useAuth';
import { Job, PSMPhaseStatus } from '../../../types';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  LogOut,
  Printer,
  Search,
} from 'lucide-react';

interface FilterOptions {
  status: PSMPhaseStatus | 'all';
  zone: string;
  searchText: string;
  severity: 'all' | 'critical' | 'high';
}

export const PSMDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { jobs } = useJobsStore();

  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    zone: 'all',
    searchText: '',
    severity: 'all',
  });

  // PSM sees ALL jobs - they are the bridge to insurance
  // No filtering - PSM needs visibility into every job regardless of phase
  const psmJobs = jobs;

  // Apply filters
  const filteredJobs = psmJobs.filter(job => {
    if (filters.status !== 'all' && job.psmData?.psmPhase.status !== filters.status) {
      return false;
    }
    if (filters.zone !== 'all' && job.scheduledZone !== filters.zone) {
      return false;
    }
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      return (
        job.jobId.toLowerCase().includes(searchLower) ||
        job.customerInfo.name.toLowerCase().includes(searchLower) ||
        job.customerInfo.address.toLowerCase().includes(searchLower)
      );
    }
    if (filters.severity !== 'all') {
      const hasCriticalFlags = job.psmData?.redFlags.some(
        flag => !flag.resolved && flag.severity === filters.severity
      );
      if (!hasCriticalFlags) return false;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: psmJobs.length,
    critical: psmJobs.filter(j =>
      j.psmData?.redFlags.some(f => !f.resolved && f.severity === 'critical')
    ).length,
    pending: psmJobs.filter(j =>
      j.psmData?.psmPhase.status === 'reviewing' ||
      j.psmData?.psmPhase.status === 'field-complete'
    ).length,
    awaitingAdjuster: psmJobs.filter(j =>
      j.psmData?.psmPhase.status === 'awaiting-adjuster'
    ).length,
  };

  const getSeverityColor = (job: Job): string => {
    const criticalFlags = job.psmData?.redFlags.filter(
      f => !f.resolved && f.severity === 'critical'
    );
    const highFlags = job.psmData?.redFlags.filter(
      f => !f.resolved && f.severity === 'high'
    );

    if (criticalFlags && criticalFlags.length > 0) return 'border-l-4 border-l-red-500';
    if (highFlags && highFlags.length > 0) return 'border-l-4 border-l-orange-500';
    return 'border-l-4 border-l-gray-200';
  };

  const generateReport = (job: Job, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to job detail

    // Generate professional HTML report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Job Report - ${job.jobId}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
          }
          .header {
            border-bottom: 3px solid #ea580c;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ea580c;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 12px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 8px;
            line-height: 1.6;
          }
          .label {
            font-weight: 600;
            color: #4b5563;
          }
          .value {
            color: #1f2937;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
          }
          .status-install { background: #dbeafe; color: #1e40af; }
          .status-demo { background: #fef3c7; color: #92400e; }
          .status-check { background: #e0e7ff; color: #3730a3; }
          .status-pull { background: #dcfce7; color: #166534; }
          .status-complete { background: #d1fae5; color: #065f46; }
          .red-flag {
            background: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 12px;
            margin-bottom: 8px;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #ea580c;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
          }
          .print-button:hover {
            background: #c2410c;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">Print Report</button>

        <div class="header">
          <div class="logo">ENTRUSTED RESTORATION</div>
          <div style="font-size: 24px; font-weight: 600; margin-top: 8px;">Job Status Report</div>
          <div style="color: #6b7280; margin-top: 4px;">Generated: ${new Date().toLocaleString()}</div>
        </div>

        <!-- Job Information -->
        <div class="section">
          <div class="section-title">Job Information</div>
          <div class="info-grid">
            <div class="label">Job ID:</div>
            <div class="value">${job.jobId}</div>
            <div class="label">Status:</div>
            <div class="value"><span class="status-badge status-${job.jobStatus.toLowerCase().replace(' ', '-')}">${job.jobStatus}</span></div>
            <div class="label">Customer:</div>
            <div class="value">${job.customerInfo.name}</div>
            <div class="label">Address:</div>
            <div class="value">${job.customerInfo.address}, ${job.customerInfo.city}, ${job.customerInfo.state} ${job.customerInfo.zipCode}</div>
            <div class="label">Phone:</div>
            <div class="value">${job.customerInfo.phoneNumber}</div>
            <div class="label">Email:</div>
            <div class="value">${job.customerInfo.email}</div>
          </div>
        </div>

        <!-- Insurance Information -->
        <div class="section">
          <div class="section-title">Insurance Information</div>
          <div class="info-grid">
            <div class="label">Carrier:</div>
            <div class="value">${job.insuranceInfo.carrierName}</div>
            <div class="label">Claim Number:</div>
            <div class="value">${job.insuranceInfo.claimNumber}</div>
            <div class="label">Policy Number:</div>
            <div class="value">${job.insuranceInfo.policyNumber}</div>
            <div class="label">Adjuster:</div>
            <div class="value">${job.insuranceInfo.adjusterName}</div>
            <div class="label">Adjuster Phone:</div>
            <div class="value">${job.insuranceInfo.adjusterPhone}</div>
            <div class="label">Adjuster Email:</div>
            <div class="value">${job.insuranceInfo.adjusterEmail}</div>
            <div class="label">Deductible:</div>
            <div class="value">$${job.insuranceInfo.deductible.toLocaleString()}</div>
            <div class="label">Estimated Value:</div>
            <div class="value">$${job.insuranceInfo.estimatedValue.toLocaleString()}</div>
            <div class="label">Water Category:</div>
            <div class="value">${job.insuranceInfo.categoryOfWater}</div>
          </div>
        </div>

        <!-- Cause of Loss -->
        <div class="section">
          <div class="section-title">Cause of Loss</div>
          <div class="info-grid">
            <div class="label">Type:</div>
            <div class="value">${job.causeOfLoss.type}</div>
            <div class="label">Location:</div>
            <div class="value">${job.causeOfLoss.location}</div>
            <div class="label">Description:</div>
            <div class="value">${job.causeOfLoss.description}</div>
          </div>
        </div>

        <!-- PSM Status -->
        ${job.psmData ? `
        <div class="section">
          <div class="section-title">PSM Review Status</div>
          <div class="info-grid">
            <div class="label">PSM Phase:</div>
            <div class="value">${job.psmData.psmPhase.status.replace(/-/g, ' ').toUpperCase()}</div>
            <div class="label">Assigned PSM:</div>
            <div class="value">${job.psmData.psmPhase.assignedPSM}</div>
            <div class="label">Days in Phase:</div>
            <div class="value">${job.psmData.psmPhase.daysInPhase}</div>
            <div class="label">Scope Approved:</div>
            <div class="value">${job.psmData.approvalStatus.scopeApproved ? 'Yes' : 'No'}</div>
            <div class="label">Estimate Submitted:</div>
            <div class="value">${job.psmData.approvalStatus.estimateSubmitted ? 'Yes' : 'No'}</div>
            <div class="label">Estimate Approved:</div>
            <div class="value">${job.psmData.approvalStatus.estimateApproved ? 'Yes' : 'No'}</div>
            <div class="label">Current Estimate:</div>
            <div class="value">$${job.psmData.approvalStatus.currentEstimateAmount.toLocaleString()}</div>
          </div>
        </div>
        ` : ''}

        <!-- Red Flags -->
        ${job.psmData && job.psmData.redFlags.length > 0 ? `
        <div class="section">
          <div class="section-title">Red Flags</div>
          ${job.psmData.redFlags.map(flag => `
            <div class="red-flag">
              <strong>${flag.type.toUpperCase()} - ${flag.severity.toUpperCase()}</strong><br>
              ${flag.description}<br>
              <em>Status: ${flag.resolved ? 'RESOLVED' : 'UNRESOLVED'}</em>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- Financial Summary -->
        <div class="section">
          <div class="section-title">Financial Summary</div>
          <div class="info-grid">
            <div class="label">Estimated Total:</div>
            <div class="value">$${job.financial.estimatedTotal.toLocaleString()}</div>
            <div class="label">Actual Expenses:</div>
            <div class="value">$${job.financial.actualExpenses.total.toLocaleString()}</div>
            <div class="label">Payment Status:</div>
            <div class="value">${job.financial.paymentStatus.toUpperCase()}</div>
          </div>
        </div>

        <!-- Workflow Progress -->
        <div class="section">
          <div class="section-title">Workflow Progress</div>
          <div class="info-grid">
            <div class="label">Install:</div>
            <div class="value">${job.workflowPhases.install.status.toUpperCase()}</div>
            <div class="label">Demo:</div>
            <div class="value">${job.workflowPhases.demo.status.toUpperCase()}</div>
            <div class="label">Check Service:</div>
            <div class="value">${job.workflowPhases.checkService.status.toUpperCase()} (${job.workflowPhases.checkService.visits?.length || 0} visits)</div>
            <div class="label">Pull:</div>
            <div class="value">${job.workflowPhases.pull.status.toUpperCase()}</div>
          </div>
        </div>

        <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          This report was generated by Entrusted Restoration PSM Dashboard<br>
          For internal and insurance company use only
        </div>
      </body>
      </html>
    `;

    // Open report in new window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-poppins font-bold text-gray-900">
                PSM Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Project Support Management - ultrabridge
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">{user?.displayName}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Total Jobs</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">Critical Flags</span>
              </div>
              <p className="text-2xl font-bold text-red-700 mt-2">{stats.critical}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-700">Pending Review</span>
              </div>
              <p className="text-2xl font-bold text-orange-700 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">With Adjuster</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-2">{stats.awaitingAdjuster}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by ID, customer, or address..."
                value={filters.searchText}
                onChange={e => setFilters({ ...filters, searchText: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
              />
            </div>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value as PSMPhaseStatus | 'all' })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
            >
              <option value="all">All Status</option>
              <option value="field-complete">Field Complete</option>
              <option value="reviewing">Reviewing</option>
              <option value="awaiting-adjuster">Awaiting Adjuster</option>
              <option value="approved">Approved</option>
              <option value="invoiced">Invoiced</option>
            </select>
            <select
              value={filters.zone}
              onChange={e => setFilters({ ...filters, zone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
            >
              <option value="all">All Zones</option>
              <option value="Zone 1">Zone 1</option>
              <option value="Zone 2">Zone 2</option>
              <option value="Zone 3">Zone 3</option>
              <option value="2nd Shift">2nd Shift</option>
            </select>
            <select
              value={filters.severity}
              onChange={e => setFilters({ ...filters, severity: e.target.value as 'all' | 'critical' | 'high' })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical Only</option>
              <option value="high">High+ Only</option>
            </select>
          </div>
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No jobs match your filters</p>
            </div>
          ) : (
            filteredJobs.map(job => {
              const psmData = job.psmData;
              const unresolvedFlags = psmData?.redFlags.filter(f => !f.resolved) || [];
              const missingItems = psmData?.documentationReview.missingItems || [];

              return (
                <div
                  key={job.jobId}
                  className={`bg-white rounded-lg border ${getSeverityColor(job)} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => navigate(`/psm/job/${job.jobId}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            #{job.jobId}
                          </h3>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {job.scheduledZone}
                          </span>
                          {psmData?.psmPhase.status && (
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              psmData.psmPhase.status === 'field-complete' ? 'bg-yellow-100 text-yellow-700' :
                              psmData.psmPhase.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                              psmData.psmPhase.status === 'awaiting-adjuster' ? 'bg-orange-100 text-orange-700' :
                              psmData.psmPhase.status === 'approved' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {psmData.psmPhase.status.replace(/-/g, ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 font-medium">{job.customerInfo.name}</p>
                        <p className="text-gray-600 text-sm">{job.customerInfo.address}</p>

                        {/* Flags and Missing Items */}
                        <div className="flex items-center gap-4 mt-3">
                          {unresolvedFlags.length > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className={`w-4 h-4 ${
                                unresolvedFlags.some(f => f.severity === 'critical') ? 'text-red-500' : 'text-orange-500'
                              }`} />
                              <span className="text-sm text-gray-700">
                                {unresolvedFlags.length} flag{unresolvedFlags.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {missingItems.length > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="text-sm text-gray-700">
                                Missing: {missingItems.join(', ')}
                              </span>
                            </div>
                          )}
                          {unresolvedFlags.length === 0 && missingItems.length === 0 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-700">All documentation complete</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <button
                          onClick={(e) => generateReport(job, e)}
                          className="flex items-center gap-2 px-3 py-2 bg-entrusted-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                          title="Generate printable report for insurance"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print Report</span>
                        </button>
                        <p className="text-sm text-gray-600">
                          {psmData?.psmPhase.daysInPhase || 0} day{psmData?.psmPhase.daysInPhase !== 1 ? 's' : ''} in phase
                        </p>
                        {psmData?.psmPhase.assignedPSM && (
                          <p className="text-sm text-gray-900 font-medium">
                            Assigned: {psmData.psmPhase.assignedPSM}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
