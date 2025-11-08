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
  Filter,
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
  const { user } = useAuth();
  const { jobs } = useJobsStore();

  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    zone: 'all',
    searchText: '',
    severity: 'all',
  });

  // Filter jobs for PSM review
  const psmJobs = jobs.filter(job => {
    // Jobs that have completed field work
    const fieldComplete =
      job.workflowPhases.install.status === 'completed' ||
      job.workflowPhases.demo.status === 'completed' ||
      job.workflowPhases.checkService.status === 'completed' ||
      job.workflowPhases.pull.status === 'completed';

    return fieldComplete;
  });

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

                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {psmData?.psmPhase.daysInPhase || 0} day{psmData?.psmPhase.daysInPhase !== 1 ? 's' : ''} in phase
                        </p>
                        {psmData?.psmPhase.assignedPSM && (
                          <p className="text-sm text-gray-900 font-medium mt-1">
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
