/**
 * Firebase Jobs Service - React Native Version
 */

import firestore from '@react-native-firebase/firestore';
import { Job, JobStatus, Zone } from '../../types';

// Type alias for compatibility
type FirebaseFirestoreTypes = typeof firestore;

export const jobsService = {
  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<Job[]> {
    try {
      const jobsSnapshot = await firestore().collection('jobs').get();
      return jobsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        jobId: doc.id,
      })) as Job[];
    } catch (error: any) {
      console.error('Get all jobs error:', error);
      throw new Error(error.message || 'Failed to fetch jobs');
    }
  },

  /**
   * Get job by ID
   */
  async getJobById(jobId: string): Promise<Job | null> {
    try {
      const jobDoc = await firestore().collection('jobs').doc(jobId).get();

      if (!jobDoc.exists) {
        return null;
      }

      return {
        ...jobDoc.data(),
        jobId: jobDoc.id,
      } as Job;
    } catch (error: any) {
      console.error('Get job by ID error:', error);
      throw new Error(error.message || 'Failed to fetch job');
    }
  },

  /**
   * Get jobs by technician
   */
  async getJobsByTechnician(technicianId: string): Promise<Job[]> {
    try {
      const jobsSnapshot = await firestore()
        .collection('jobs')
        .where('scheduledTechnician', '==', technicianId)
        .orderBy('scheduledDate', 'desc')
        .get();

      return jobsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        jobId: doc.id,
      })) as Job[];
    } catch (error: any) {
      console.error('Get jobs by technician error:', error);
      throw new Error(error.message || 'Failed to fetch jobs');
    }
  },

  /**
   * Get jobs by zone
   */
  async getJobsByZone(zone: Zone): Promise<Job[]> {
    try {
      const jobsSnapshot = await firestore()
        .collection('jobs')
        .where('scheduledZone', '==', zone)
        .orderBy('scheduledDate', 'desc')
        .get();

      return jobsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        jobId: doc.id,
      })) as Job[];
    } catch (error: any) {
      console.error('Get jobs by zone error:', error);
      throw new Error(error.message || 'Failed to fetch jobs');
    }
  },

  /**
   * Get jobs by status
   */
  async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    try {
      const jobsSnapshot = await firestore()
        .collection('jobs')
        .where('jobStatus', '==', status)
        .orderBy('scheduledDate', 'desc')
        .get();

      return jobsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        jobId: doc.id,
      })) as Job[];
    } catch (error: any) {
      console.error('Get jobs by status error:', error);
      throw new Error(error.message || 'Failed to fetch jobs');
    }
  },

  /**
   * Create new job
   */
  async createJob(jobData: Omit<Job, 'jobId' | 'metadata'>): Promise<Job> {
    try {
      const newJob = {
        ...jobData,
        metadata: {
          createdAt: firestore.FieldValue.serverTimestamp(),
          createdBy: jobData.scheduledTechnician,
          lastModifiedAt: firestore.FieldValue.serverTimestamp(),
          lastModifiedBy: jobData.scheduledTechnician,
          version: 1,
        },
      };

      const docRef = await firestore().collection('jobs').add(newJob);

      return {
        ...newJob,
        jobId: docRef.id,
      } as Job;
    } catch (error: any) {
      console.error('Create job error:', error);
      throw new Error(error.message || 'Failed to create job');
    }
  },

  /**
   * Update job
   */
  async updateJob(jobId: string, updates: Partial<Job>, userId: string): Promise<void> {
    try {
      await firestore()
        .collection('jobs')
        .doc(jobId)
        .update({
          ...updates,
          'metadata.lastModifiedAt': firestore.FieldValue.serverTimestamp(),
          'metadata.lastModifiedBy': userId,
        });
    } catch (error: any) {
      console.error('Update job error:', error);
      throw new Error(error.message || 'Failed to update job');
    }
  },

  /**
   * Delete job
   */
  async deleteJob(jobId: string): Promise<void> {
    try {
      await firestore().collection('jobs').doc(jobId).delete();
    } catch (error: any) {
      console.error('Delete job error:', error);
      throw new Error(error.message || 'Failed to delete job');
    }
  },

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, status: JobStatus, userId: string): Promise<void> {
    try {
      await firestore()
        .collection('jobs')
        .doc(jobId)
        .update({
          jobStatus: status,
          'metadata.lastModifiedAt': firestore.FieldValue.serverTimestamp(),
          'metadata.lastModifiedBy': userId,
        });
    } catch (error: any) {
      console.error('Update job status error:', error);
      throw new Error(error.message || 'Failed to update job status');
    }
  },

  /**
   * Listen to job changes (realtime)
   */
  subscribeToJob(jobId: string, callback: (job: Job) => void) {
    return firestore()
      .collection('jobs')
      .doc(jobId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          callback({
            ...doc.data(),
            jobId: doc.id,
          } as Job);
        }
      });
  },

  /**
   * Listen to all jobs (realtime)
   */
  subscribeToJobs(callback: (jobs: Job[]) => void) {
    return firestore()
      .collection('jobs')
      .onSnapshot((snapshot) => {
        const jobs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          jobId: doc.id,
        })) as Job[];
        callback(jobs);
      });
  },
};
