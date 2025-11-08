/**
 * useJobs Hook
 * Manages job data fetching and realtime updates
 */

import { useEffect, useState } from 'react';
import { useJobsStore } from '../stores/jobsStore';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useSyncStore } from '../stores/syncStore';
import { jobsService } from '../services/firebase/jobsService';
import { Job, JobStatus } from '../types';

export function useJobs(enableRealtime: boolean = true) {
  const { user } = useAuthStore();
  const { isOnline } = useSyncStore();
  const {
    jobs,
    currentJob,
    filters,
    isLoading,
    error,
    setJobs,
    updateJob,
    setCurrentJob,
    setFilters,
    clearFilters,
    setLoading,
    setError,
    getFilteredJobs,
  } = useJobsStore();

  const { addNotification } = useNotificationStore();
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // Fetch jobs based on user role
  useEffect(() => {
    if (!user || !isOnline) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        let fetchedJobs: Job[] = [];

        if (user.role === 'MIT_TECH') {
          // Techs see only their assigned jobs
          fetchedJobs = await jobsService.getJobsByTechnician(user.uid);
        } else if (user.role === 'MIT_LEAD') {
          // Leads see jobs in their zone
          fetchedJobs = await jobsService.getJobsByZone(user.zone);
        } else if (user.role === 'PSM' || user.role === 'ADMIN') {
          // PSM and Admins see all jobs - PSM is the bridge to insurance
          fetchedJobs = await jobsService.getAllJobs();
        }

        setJobs(fetchedJobs);
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        setError(error.message);
        addNotification('error', 'Error', 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Set up realtime listener
    if (enableRealtime) {
      const unsub = jobsService.subscribeToJobs((updatedJobs) => {
        // Filter based on user role
        let filteredJobs = updatedJobs;

        if (user.role === 'MIT_TECH') {
          filteredJobs = updatedJobs.filter(
            (job) => job.scheduledTechnician === user.uid
          );
        } else if (user.role === 'MIT_LEAD') {
          filteredJobs = updatedJobs.filter((job) => job.scheduledZone === user.zone);
        } else if (user.role === 'PSM' || user.role === 'ADMIN') {
          // PSM and Admins see all jobs
          filteredJobs = updatedJobs;
        }

        setJobs(filteredJobs);
      });

      setUnsubscribe(() => unsub);

      return () => {
        if (unsub) unsub();
      };
    }
  }, [user, isOnline, enableRealtime]);

  const updateJobData = async (jobId: string, updates: Partial<Job>) => {
    if (!user) return;

    try {
      if (isOnline) {
        await jobsService.updateJob(jobId, updates, user.uid);
        addNotification('success', 'Job Updated', 'Changes saved successfully');
      } else {
        // Add to offline queue
        // TODO: Implement offline queue
        addNotification('offline-mode', 'Offline Mode', 'Changes will sync when online');
      }

      updateJob(jobId, updates);
    } catch (error: any) {
      addNotification('error', 'Update Failed', error.message);
      throw error;
    }
  };

  const updateStatus = async (jobId: string, status: JobStatus) => {
    if (!user) return;

    try {
      if (isOnline) {
        await jobsService.updateJobStatus(jobId, status, user.uid);
        addNotification('success', 'Status Updated', `Job status changed to ${status}`);
      } else {
        addNotification('offline-mode', 'Offline Mode', 'Status will update when online');
      }

      updateJob(jobId, { jobStatus: status });
    } catch (error: any) {
      addNotification('error', 'Update Failed', error.message);
      throw error;
    }
  };

  const selectJob = async (jobId: string) => {
    try {
      const job = await jobsService.getJobById(jobId);
      setCurrentJob(job);
    } catch (error: any) {
      addNotification('error', 'Error', 'Failed to load job details');
      throw error;
    }
  };

  return {
    jobs: getFilteredJobs(),
    allJobs: jobs,
    currentJob,
    isLoading,
    error,
    filters,
    updateJob: updateJobData,
    updateStatus,
    selectJob,
    setFilters,
    clearFilters,
  };
}
