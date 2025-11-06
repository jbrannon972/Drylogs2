/**
 * Jobs Store
 * Manages job data, filters, and current job state
 */

import { create } from 'zustand';
import { Job, JobFilters, JobStatus } from '../types';
import { toDate } from '../utils/dateUtils';

interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  filters: JobFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  deleteJob: (jobId: string) => void;
  setCurrentJob: (job: Job | null) => void;
  setFilters: (filters: Partial<JobFilters>) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getJobById: (jobId: string) => Job | undefined;
  getFilteredJobs: () => Job[];
  getJobsByStatus: (status: JobStatus) => Job[];
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  currentJob: null,
  filters: {},
  isLoading: false,
  error: null,

  setJobs: (jobs) => set({ jobs, error: null }),

  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, job],
    })),

  updateJob: (jobId, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.jobId === jobId ? { ...job, ...updates } : job
      ),
      currentJob:
        state.currentJob?.jobId === jobId
          ? { ...state.currentJob, ...updates }
          : state.currentJob,
    })),

  deleteJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.jobId !== jobId),
      currentJob: state.currentJob?.jobId === jobId ? null : state.currentJob,
    })),

  setCurrentJob: (job) => set({ currentJob: job }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () => set({ filters: {} }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Selectors
  getJobById: (jobId) => get().jobs.find((job) => job.jobId === jobId),

  getFilteredJobs: () => {
    const { jobs, filters } = get();
    let filtered = [...jobs];

    if (filters.status) {
      filtered = filtered.filter((job) => job.jobStatus === filters.status);
    }

    if (filters.zone) {
      filtered = filtered.filter((job) => job.scheduledZone === filters.zone);
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.customerInfo.name.toLowerCase().includes(search) ||
          job.customerInfo.address.toLowerCase().includes(search) ||
          job.jobId.toLowerCase().includes(search)
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter((job) => {
        const jobDate = toDate(job.scheduledDate);
        return (
          jobDate >= filters.dateRange!.start &&
          jobDate <= filters.dateRange!.end
        );
      });
    }

    return filtered;
  },

  getJobsByStatus: (status) =>
    get().jobs.filter((job) => job.jobStatus === status),
}));
