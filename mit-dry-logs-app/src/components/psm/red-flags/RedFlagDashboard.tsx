import React, { useState } from 'react';
import { Job, RedFlag, RedFlagSeverity } from '../../../types';
import { AlertCircle, AlertTriangle, CheckCircle, X, Filter } from 'lucide-react';

interface RedFlagDashboardProps {
  jobs: Job[];
  onResolve: (jobId: string, flagId: string, resolution: string) => void;
}

export const RedFlagDashboard: React.FC<RedFlagDashboardProps> = ({ jobs, onResolve }) => {
  const [filterSeverity, setFilterSeverity] = useState<RedFlagSeverity | 'all'>('all');
  const [showResolved, setShowResolved] = useState(false);

  // Collect all red flags across all jobs
  const allFlags = jobs.flatMap(job =>
    (job.psmData?.redFlags || []).map(flag => ({
      ...flag,
      jobId: job.jobId,
      customerName: job.customerInfo.name,
      address: job.customerInfo.address,
    }))
  );

  // Filter flags
  const filteredFlags = allFlags.filter(flag => {
    if (!showResolved && flag.resolved) return false;
    if (filterSeverity !== 'all' && flag.severity !== filterSeverity) return false;
    return true;
  });

  // Group by severity
  const flagsBySeverity = {
    critical: filteredFlags.filter(f => f.severity === 'critical'),
    high: filteredFlags.filter(f => f.severity === 'high'),
    medium: filteredFlags.filter(f => f.severity === 'medium'),
    low: filteredFlags.filter(f => f.severity === 'low'),
  };

  const getSeverityIcon = (severity: RedFlagSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: RedFlagSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-poppins font-bold text-gray-900">Red Flag Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Automated quality control and documentation verification
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700 font-medium">Critical</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{flagsBySeverity.critical.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-700 font-medium">High</span>
          </div>
          <p className="text-3xl font-bold text-orange-700">{flagsBySeverity.high.length}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-700 font-medium">Medium</span>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{flagsBySeverity.medium.length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700 font-medium">Resolved</span>
          </div>
          <p className="text-3xl font-bold text-gray-700">
            {allFlags.filter(f => f.resolved).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as RedFlagSeverity | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={e => setShowResolved(e.target.checked)}
              className="w-4 h-4 text-entrusted-orange focus:ring-entrusted-orange border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Show Resolved</span>
          </label>
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {filteredFlags.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">
              {showResolved || filterSeverity !== 'all'
                ? 'No flags match your filters'
                : 'No unresolved flags - looking good!'}
            </p>
          </div>
        ) : (
          filteredFlags.map(flag => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onResolve={resolution => onResolve(flag.jobId, flag.id, resolution)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface FlagCardProps {
  flag: RedFlag & { jobId: string; customerName: string; address: string };
  onResolve: (resolution: string) => void;
}

const FlagCard: React.FC<FlagCardProps> = ({ flag, onResolve }) => {
  const [showResolve, setShowResolve] = useState(false);
  const [resolution, setResolution] = useState('');

  const getSeverityColor = (severity: RedFlagSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 border-l-4 border-l-red-500';
      case 'high':
        return 'bg-orange-50 border-orange-200 border-l-4 border-l-orange-500';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 border-l-4 border-l-yellow-500';
      default:
        return 'bg-gray-50 border-gray-200 border-l-4 border-l-gray-500';
    }
  };

  const handleResolve = () => {
    if (resolution.trim()) {
      onResolve(resolution);
      setShowResolve(false);
      setResolution('');
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getSeverityColor(flag.severity)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
              flag.severity === 'critical' ? 'bg-red-100 text-red-700' :
              flag.severity === 'high' ? 'bg-orange-100 text-orange-700' :
              flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {flag.severity}
            </span>
            <span className="text-sm text-gray-600">
              {flag.type.replace(/-/g, ' ')}
            </span>
          </div>
          <p className="font-medium text-gray-900 mb-1">Job #{flag.jobId}</p>
          <p className="text-sm text-gray-700">
            {flag.customerName} • {flag.address}
          </p>
        </div>
        {flag.resolved && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-700" />
            <span className="text-xs font-medium text-green-700">Resolved</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-900">{flag.description}</p>
      </div>

      <div className="text-xs text-gray-600 mb-3">
        Detected: {new Date(flag.detectedAt.toDate()).toLocaleString()}
      </div>

      {flag.resolved ? (
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs font-medium text-green-900 mb-1">Resolution:</p>
          <p className="text-sm text-green-800">{flag.resolutionNotes}</p>
          <p className="text-xs text-green-700 mt-2">
            Resolved by {flag.resolvedBy} on {new Date(flag.resolvedAt!.toDate()).toLocaleString()}
          </p>
        </div>
      ) : showResolve ? (
        <div className="space-y-2">
          <textarea
            value={resolution}
            onChange={e => setResolution(e.target.value)}
            rows={3}
            placeholder="Describe how this flag was resolved..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowResolve(false);
                setResolution('');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              disabled={!resolution.trim()}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowResolve(true)}
          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Resolve Flag
        </button>
      )}
    </div>
  );
};
