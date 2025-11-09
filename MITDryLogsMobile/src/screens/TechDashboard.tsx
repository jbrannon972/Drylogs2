import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../stores/authStore';
import { useJobsStore } from '../stores/jobsStore';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Job, JobStatus } from '../types';
import { format } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TechDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { jobs, isLoading } = useJobsStore();
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredJobs =
    selectedStatus === 'all'
      ? jobs
      : jobs.filter((job) => job.jobStatus === selectedStatus);

  const statusCounts = {
    'Pre-Install': jobs.filter((j) => j.jobStatus === 'Pre-Install').length,
    Install: jobs.filter((j) => j.jobStatus === 'Install').length,
    Demo: jobs.filter((j) => j.jobStatus === 'Demo').length,
    'Check Service': jobs.filter((j) => j.jobStatus === 'Check Service').length,
    Pull: jobs.filter((j) => j.jobStatus === 'Pull').length,
  };

  const handleJobPress = (job: Job) => {
    const workflowRoutes: Record<JobStatus, keyof RootStackParamList> = {
      'Pre-Install': 'InstallWorkflow',
      Install: 'InstallWorkflow',
      Demo: 'DemoWorkflow',
      'Check Service': 'CheckServiceWorkflow',
      Pull: 'PullWorkflow',
      Complete: 'InstallWorkflow',
      'On Hold': 'InstallWorkflow',
    };

    const route = workflowRoutes[job.jobStatus];
    navigation.navigate(route, { jobId: job.jobId });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading your jobs..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeTitle}>
          Welcome back, {user?.displayName}!
        </Text>
        <Text style={styles.welcomeSubtitle}>
          You have {jobs.length} active job{jobs.length !== 1 ? 's' : ''} today
        </Text>
      </View>

      {/* Status Filter Cards */}
      <View style={styles.statusFilters}>
        <StatusCard
          label="All Jobs"
          count={jobs.length}
          isActive={selectedStatus === 'all'}
          onPress={() => setSelectedStatus('all')}
        />
        {Object.entries(statusCounts).map(([status, count]) => (
          <StatusCard
            key={status}
            label={status}
            count={count}
            isActive={selectedStatus === status}
            onPress={() => setSelectedStatus(status as JobStatus)}
          />
        ))}
      </View>

      {/* Jobs List */}
      <View style={styles.jobsList}>
        {filteredJobs.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedStatus === 'all'
                  ? 'You have no assigned jobs at this time'
                  : `No jobs in ${selectedStatus} status`}
              </Text>
            </View>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              onPress={() => handleJobPress(job)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

interface StatusCardProps {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  label,
  count,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.statusCard, isActive && styles.statusCardActive]}
    >
      <Text style={styles.statusCount}>{count}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const statusColors: Record<JobStatus, { bg: string; text: string }> = {
    'Pre-Install': { bg: '#F3F4F6', text: '#374151' },
    Install: { bg: '#DBEAFE', text: '#1E40AF' },
    Demo: { bg: '#E9D5FF', text: '#6B21A8' },
    'Check Service': { bg: '#FEF3C7', text: '#92400E' },
    Pull: { bg: '#D1FAE5', text: '#065F46' },
    Complete: { bg: '#10B981', text: '#fff' },
    'On Hold': { bg: '#FEE2E2', text: '#991B1B' },
  };

  const statusColor = statusColors[job.jobStatus];

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Not scheduled';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Card onPress={onPress} style={styles.jobCard}>
      <View style={styles.jobCardContent}>
        <Text style={styles.jobTitle}>{job.customerInfo.name}</Text>
        <Text style={styles.jobAddress}>
          {job.customerInfo.address}, {job.customerInfo.city}
        </Text>
        <Text style={styles.jobDate}>
          Scheduled: {formatDate(job.scheduledDate)}
        </Text>

        <View style={styles.jobFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor.bg },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {job.jobStatus}
            </Text>
          </View>
          <Text style={styles.waterCategory}>
            {job.insuranceInfo.categoryOfWater}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  welcomeHeader: {
    backgroundColor: '#FF6B35',
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#FED7AA',
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  statusCard: {
    flex: 1,
    minWidth: 140,
    padding: 16,
    margin: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statusCardActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF7ED',
  },
  statusCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  jobsList: {
    padding: 16,
  },
  jobCard: {
    marginBottom: 12,
  },
  jobCardContent: {
  },
  jobTitle: {
    marginBottom: 4,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  jobAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  jobDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  waterCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
