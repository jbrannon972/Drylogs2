import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Calendar, MapPin, Clock, ChevronRight, AlertTriangle, Filter, X } from 'lucide-react';
import { Job, JobStatus } from '../../types';
import { format } from 'date-fns';
import { toDate } from '../../utils/dateUtils';

export const TechDashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, isLoading, filters, setFilters } = useJobs();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filteredJobs = selectedStatus === 'all'
    ? jobs
    : jobs.filter(job => job.jobStatus === selectedStatus);

  const handleJobClick = (job: Job) => {
    // Route to appropriate workflow based on job status
    const workflowRoutes: Record<JobStatus, string> = {
      'Pre-Install': 'install',
      'Install': 'install',
      'Demo': 'demo',
      'Check Service': 'check-service',
      'Pull': 'pull',
      'Complete': 'install', // fallback
      'On Hold': 'install', // fallback
    };

    const workflow = workflowRoutes[job.jobStatus];
    navigate(`/tech/job/${job.jobId}/${workflow}`);
  };

  const statusCounts = {
    'Pre-Install': jobs.filter(j => j.jobStatus === 'Pre-Install').length,
    'Install': jobs.filter(j => j.jobStatus === 'Install').length,
    'Demo': jobs.filter(j => j.jobStatus === 'Demo').length,
    'Check Service': jobs.filter(j => j.jobStatus === 'Check Service').length,
    'Pull': jobs.filter(j => j.jobStatus === 'Pull').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading your jobs..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Condensed Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.displayName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {jobs.length} active job{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowFilterModal(true)}
          className="relative flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-entrusted-orange transition-all"
        >
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filter</span>
          {selectedStatus !== 'all' && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-entrusted-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
              1
            </span>
          )}
        </button>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-gray-500">
                {selectedStatus === 'all'
                  ? 'You have no assigned jobs at this time'
                  : `No jobs in ${selectedStatus} status`}
              </p>
            </div>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <JobCard key={job.jobId} job={job} onClick={() => handleJobClick(job)} />
          ))
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md sm:mx-4 max-h-[80vh] flex flex-col animate-slide-up">
            {/* Filter Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-entrusted-orange" />
                <h3 className="font-bold text-gray-900">Filter Jobs</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div>
                <h4 className="font-bold text-sm text-gray-700 mb-3">Job Status</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                      selectedStatus === 'all'
                        ? 'border-entrusted-orange bg-orange-50 text-orange-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>All Jobs</span>
                    <span className="text-sm font-bold">{jobs.length}</span>
                  </button>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status as JobStatus)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                        selectedStatus === status
                          ? 'border-entrusted-orange bg-orange-50 text-orange-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span>{status}</span>
                      <span className="text-sm font-bold">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setSelectedStatus('all')}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                Clear Filter
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-3 bg-entrusted-orange text-white font-bold rounded-lg hover:bg-orange-600 transition-all"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const statusColors: Record<JobStatus, string> = {
    'Pre-Install': 'bg-gray-100 text-gray-800',
    'Install': 'bg-blue-100 text-blue-800',
    'Demo': 'bg-purple-100 text-purple-800',
    'Check Service': 'bg-yellow-100 text-yellow-800',
    'Pull': 'bg-green-100 text-green-800',
    'Complete': 'bg-green-600 text-white',
    'On Hold': 'bg-red-100 text-red-800',
  };

  return (
    <Card className="!p-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-poppins font-bold text-gray-900 mb-1">
              {job.customerInfo.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>{job.customerInfo.address}, {job.customerInfo.city}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                Scheduled: {format(toDate(job.scheduledDate), 'MMM d, yyyy')}
                {job.arrivalWindow && (
                  <span className="ml-2 text-entrusted-orange font-medium">
                    {job.arrivalWindow === '9-1' ? '9am-1pm' :
                     job.arrivalWindow === '12-4' ? '12pm-4pm' :
                     job.customArrivalStart && job.customArrivalEnd ?
                       `${job.customArrivalStart}-${job.customArrivalEnd}` :
                       ''}
                  </span>
                )}
              </span>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400" />
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[job.jobStatus]
            }`}
          >
            {job.jobStatus}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {job.insuranceInfo.categoryOfWater}
            </span>
            {job.insuranceInfo.categoryOfWater !== 'Category 1' && (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
