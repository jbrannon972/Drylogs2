import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Calendar, MapPin, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import { Job, JobStatus } from '../../types';
import { format } from 'date-fns';

export const TechDashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, isLoading, filters, setFilters } = useJobs();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all'>('all');

  const filteredJobs = selectedStatus === 'all'
    ? jobs
    : jobs.filter(job => job.jobStatus === selectedStatus);

  const handleJobClick = (jobId: string) => {
    navigate(`/tech/job/${jobId}/install`);
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-entrusted-orange to-orange-600 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-poppins font-bold mb-2">
          Welcome back, {user?.displayName}!
        </h1>
        <p className="text-orange-100">
          You have {jobs.length} active job{jobs.length !== 1 ? 's' : ''} today
        </p>
      </div>

      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatusCard
          label="All Jobs"
          count={jobs.length}
          isActive={selectedStatus === 'all'}
          onClick={() => setSelectedStatus('all')}
        />
        {Object.entries(statusCounts).map(([status, count]) => (
          <StatusCard
            key={status}
            label={status}
            count={count}
            isActive={selectedStatus === status}
            onClick={() => setSelectedStatus(status as JobStatus)}
          />
        ))}
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
            <JobCard key={job.jobId} job={job} onClick={() => handleJobClick(job.jobId)} />
          ))
        )}
      </div>
    </div>
  );
};

interface StatusCardProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ label, count, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all ${
        isActive
          ? 'border-entrusted-orange bg-orange-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </button>
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
                Scheduled: {format(job.scheduledDate.toDate(), 'MMM d, yyyy h:mm a')}
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
