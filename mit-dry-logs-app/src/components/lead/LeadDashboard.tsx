import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../shared/Card';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import {
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Job } from '../../types';
import { toDate } from '../../utils/dateUtils';

export const LeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, isLoading } = useJobs();
  const navigate = useNavigate();

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => !['Complete', 'On Hold'].includes(j.jobStatus)).length,
    complete: jobs.filter(j => j.jobStatus === 'Complete').length,
    redFlags: 0, // TODO: Calculate red flags
  };

  const todayJobs = jobs.filter(job => {
    const today = new Date();
    const jobDate = toDate(job.scheduledDate);
    return jobDate.toDateString() === today.toDateString();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-entrusted-orange to-orange-600 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-poppins font-bold mb-2">
          Lead Dashboard - {user?.zone}
        </h1>
        <p className="text-orange-100">
          Managing {stats.active} active jobs across your zone
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-8 h-8" />}
          label="Total Jobs"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<Clock className="w-8 h-8" />}
          label="Active Jobs"
          value={stats.active}
          color="orange"
        />
        <StatCard
          icon={<CheckCircle className="w-8 h-8" />}
          label="Completed"
          value={stats.complete}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle className="w-8 h-8" />}
          label="Red Flags"
          value={stats.redFlags}
          color="red"
        />
      </div>

      {/* Today's Schedule */}
      <Card title="Today's Schedule">
        {todayJobs.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No jobs scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayJobs.map(job => (
              <div
                key={job.jobId}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/lead/job/${job.jobId}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{job.customerInfo.name}</h4>
                    <p className="text-sm text-gray-600">{job.customerInfo.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{job.jobStatus}</p>
                    <p className="text-xs text-gray-500">Zone {job.scheduledZone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <p className="text-gray-500 text-center py-8">
          Activity feed coming soon...
        </p>
      </Card>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'orange' | 'green' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <Card className="!p-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </Card>
  );
};
