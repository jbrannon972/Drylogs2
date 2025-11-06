/**
 * Firebase Jobs Service
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Job, JobStatus, Zone } from '../../types';

export const jobsService = {
  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<Job[]> {
    try {
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
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
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));

      if (!jobDoc.exists()) {
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
      const q = query(
        collection(db, 'jobs'),
        where('scheduledTechnician', '==', technicianId),
        orderBy('scheduledDate', 'desc')
      );

      const jobsSnapshot = await getDocs(q);
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
      const q = query(
        collection(db, 'jobs'),
        where('scheduledZone', '==', zone),
        orderBy('scheduledDate', 'desc')
      );

      const jobsSnapshot = await getDocs(q);
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
      const q = query(
        collection(db, 'jobs'),
        where('jobStatus', '==', status),
        orderBy('scheduledDate', 'desc')
      );

      const jobsSnapshot = await getDocs(q);
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
          createdAt: serverTimestamp(),
          createdBy: jobData.scheduledTechnician,
          lastModifiedAt: serverTimestamp(),
          lastModifiedBy: jobData.scheduledTechnician,
          version: 1,
        },
      };

      const docRef = await addDoc(collection(db, 'jobs'), newJob);

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
      await updateDoc(doc(db, 'jobs', jobId), {
        ...updates,
        'metadata.lastModifiedAt': serverTimestamp(),
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
      await deleteDoc(doc(db, 'jobs', jobId));
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
      await updateDoc(doc(db, 'jobs', jobId), {
        jobStatus: status,
        'metadata.lastModifiedAt': serverTimestamp(),
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
    return onSnapshot(doc(db, 'jobs', jobId), (doc) => {
      if (doc.exists()) {
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
    return onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const jobs = snapshot.docs.map((doc) => ({
        ...doc.data(),
        jobId: doc.id,
      })) as Job[];
      callback(jobs);
    });
  },
};
