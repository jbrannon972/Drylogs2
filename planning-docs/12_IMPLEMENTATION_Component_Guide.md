# MIT DRY LOGS APP - COMPONENT IMPLEMENTATION GUIDE
## Practical Code Examples & Patterns

---

# TABLE OF CONTENTS

1. [Component Template Patterns](#component-template-patterns)
2. [Custom Hooks Implementation](#custom-hooks-implementation)
3. [Zustand Store Setup](#zustand-store-setup)
4. [Firebase Service Layer](#firebase-service-layer)
5. [Form Components with Validation](#form-components-with-validation)
6. [Real-time Updates](#real-time-updates)
7. [Offline-First Operations](#offline-first-operations)
8. [Photo Handling](#photo-handling)
9. [Responsive Design Patterns](#responsive-design-patterns)
10. [Error Handling & User Feedback](#error-handling--user-feedback)

---

# COMPONENT TEMPLATE PATTERNS

## Basic Component with Hooks

```typescript
// components/mit-tech/dashboard/DailyJobList.tsx

import React, { useEffect, useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import JobCard from '@/components/shared/cards/JobCard';
import { Spinner } from '@/components/shared/loaders/Spinner';
import { Job } from '@/types';

interface DailyJobListProps {
  filter?: 'all' | 'in-progress' | 'scheduled' | 'completed';
}

export const DailyJobList: React.FC<DailyJobListProps> = ({ 
  filter = 'all' 
}) => {
  const { user } = useAuth();
  const { jobs, loading, error, getJobsByTechnician } = useJobs();
  const { addNotification } = useNotifications();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  // Load jobs on mount
  useEffect(() => {
    if (user?.uid) {
      loadJobs();
    }
  }, [user]);

  // Filter jobs based on status
  useEffect(() => {
    const filtered = jobs.filter(job => {
      if (filter === 'in-progress') {
        return ['Install', 'Demo', 'Check Service', 'Pull'].includes(job.jobStatus);
      }
      if (filter === 'scheduled') {
        return job.jobStatus === 'Pre-Install';
      }
      if (filter === 'completed') {
        return job.jobStatus === 'Complete';
      }
      return true;
    });
    
    setFilteredJobs(filtered);
  }, [jobs, filter]);

  const loadJobs = async () => {
    try {
      await getJobsByTechnician(user!.uid);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error Loading Jobs',
        message: 'Failed to load your jobs. Please try again.'
      });
    }
  };

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadJobs}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Today's Jobs ({filteredJobs.length})
        </h2>
        <FilterDropdown currentFilter={filter} />
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No jobs scheduled for today</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {filteredJobs.map(job => (
            <JobCard 
              key={job.jobId} 
              job={job}
              onSelect={() => navigate(`/job/${job.jobId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyJobList;
```

## Component with Form State Management

```typescript
// components/shared/forms/RoomDimensionForm.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Room } from '@/types';

// Validation schema
const roomSchema = z.object({
  roomName: z.string().min(1, 'Room name is required'),
  length: z.number().positive('Length must be positive'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive').max(15, 'Typical ceiling height is 8-12 ft'),
  roomType: z.enum(['Bedroom', 'Bathroom', 'Kitchen', 'Living Room', 'Dining', 'Laundry', 'Other']),
  affectedStatus: z.enum(['affected', 'unaffected', 'partially-affected'])
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomDimensionFormProps {
  onSubmit: (room: Room) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Room>;
  isLoading?: boolean;
}

export const RoomDimensionForm: React.FC<RoomDimensionFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomName: initialData?.roomName || '',
      length: initialData?.dimensions.length,
      width: initialData?.dimensions.width,
      height: initialData?.dimensions.height || 8,
      roomType: initialData?.roomType || 'Bedroom',
      affectedStatus: initialData?.affectedStatus || 'affected'
    }
  });

  const length = watch('length');
  const width = watch('width');
  const height = watch('height');
  
  // Auto-calculate square footage
  const squareFootage = length && width ? Math.round(length * width) : 0;

  const onFormSubmit = async (data: RoomFormData) => {
    const room: Room = {
      roomId: initialData?.roomId || `room-${Date.now()}`,
      roomName: data.roomName,
      roomType: data.roomType,
      affectedStatus: data.affectedStatus,
      dimensions: {
        length: data.length,
        width: data.width,
        height: data.height,
        squareFootage
      },
      // ... other room fields
    };
    
    await onSubmit(room);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      
      {/* Room Name */}
      <div>
        <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
          Room Name *
        </label>
        <input
          {...register('roomName')}
          type="text"
          id="roomName"
          placeholder="e.g., Master Bedroom"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {errors.roomName && (
          <p className="mt-1 text-sm text-red-600">{errors.roomName.message}</p>
        )}
      </div>

      {/* Room Type */}
      <div>
        <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">
          Room Type *
        </label>
        <select
          {...register('roomType')}
          id="roomType"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="Bedroom">Bedroom</option>
          <option value="Bathroom">Bathroom</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Living Room">Living Room</option>
          <option value="Dining">Dining Room</option>
          <option value="Laundry">Laundry</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Dimensions Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700">
            Length (ft) *
          </label>
          <input
            {...register('length', { valueAsNumber: true })}
            type="number"
            id="length"
            step="0.5"
            min="1"
            max="50"
            placeholder="15"
            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
          />
          {errors.length && (
            <p className="mt-1 text-xs text-red-600">{errors.length.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700">
            Width (ft) *
          </label>
          <input
            {...register('width', { valueAsNumber: true })}
            type="number"
            id="width"
            step="0.5"
            min="1"
            max="50"
            placeholder="12"
            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
          />
          {errors.width && (
            <p className="mt-1 text-xs text-red-600">{errors.width.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700">
            Height (ft) *
          </label>
          <input
            {...register('height', { valueAsNumber: true })}
            type="number"
            id="height"
            step="0.5"
            min="1"
            max="15"
            placeholder="8"
            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
          />
          {errors.height && (
            <p className="mt-1 text-xs text-red-600">{errors.height.message}</p>
          )}
        </div>
      </div>

      {/* Auto-calculated Square Footage */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          <strong>Square Footage:</strong> {squareFootage} sq ft
        </p>
        <p className="text-xs text-blue-700">
          Volume: {squareFootage * height} cubic feet
        </p>
      </div>

      {/* Affected Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Affected Status *
        </label>
        <div className="space-y-2">
          {['affected', 'unaffected', 'partially-affected'].map((status) => (
            <label key={status} className="flex items-center">
              <input
                {...register('affectedStatus')}
                type="radio"
                value={status}
                className="h-4 w-4 text-orange-600"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">
                {status.replace('-', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Room'}
        </button>
      </div>
    </form>
  );
};

export default RoomDimensionForm;
```

---

# CUSTOM HOOKS IMPLEMENTATION

## useJobs Hook

```typescript
// hooks/useJobs.ts

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSyncStore } from '@/stores/syncStore';
import { Job } from '@/types';
import * as jobsService from '@/services/firebase/jobs';
import { idbService } from '@/services/offline/indexedDB';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isOnline } = useAuthStore();
  const { addToQueue } = useSyncStore();

  // Load jobs for a technician
  const getJobsByTechnician = useCallback(async (techId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let loadedJobs: Job[];
      
      if (isOnline) {
        // Fetch from Firebase
        loadedJobs = await jobsService.getJobsByTechnician(techId);
        
        // Cache locally
        for (const job of loadedJobs) {
          await idbService.saveJob(job);
        }
      } else {
        // Load from local cache
        loadedJobs = await idbService.getAllJobs();
      }
      
      setJobs(loadedJobs);
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Update job status
  const updateJobStatus = useCallback(async (jobId: string, status: string) => {
    const optimisticUpdate = jobs.map(j => 
      j.jobId === jobId ? { ...j, jobStatus: status } : j
    );
    setJobs(optimisticUpdate);
    
    try {
      if (isOnline) {
        await jobsService.updateJobStatus(jobId, status);
      } else {
        // Queue for sync
        await addToQueue('update', {
          type: 'job',
          id: jobId,
          data: { jobStatus: status }
        });
      }
    } catch (err) {
      // Rollback on error
      setJobs(jobs);
      setError('Failed to update job status');
    }
  }, [jobs, isOnline, addToQueue]);

  // Add room to job
  const addRoom = useCallback(async (jobId: string, room: any) => {
    try {
      if (isOnline) {
        await jobsService.addRoomToJob(jobId, room);
      } else {
        await addToQueue('update', {
          type: 'job',
          id: jobId,
          data: { [`rooms.${room.roomId}`]: room }
        });
      }
      
      // Update local state
      setJobs(jobs.map(j => 
        j.jobId === jobId 
          ? { ...j, rooms: [...(j.rooms || []), room] }
          : j
      ));
    } catch (err) {
      setError('Failed to add room');
      throw err;
    }
  }, [jobs, isOnline, addToQueue]);

  return {
    jobs,
    loading,
    error,
    getJobsByTechnician,
    updateJobStatus,
    addRoom
  };
};
```

## usePhotos Hook

```typescript
// hooks/usePhotos.ts

import { useCallback, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSyncStore } from '@/stores/syncStore';
import * as photosService from '@/services/firebase/photos';
import { idbService } from '@/services/offline/indexedDB';

export const usePhotos = (jobId: string) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const { isOnline, user } = useAuthStore();
  const { addToQueue } = useSyncStore();

  const captureAndUploadPhoto = useCallback(async (
    file: Blob,
    metadata: {
      room: string;
      step: string;
      caption: string;
    }
  ) => {
    setUploading(true);
    setError(null);
    
    try {
      const photoId = `photo-${Date.now()}`;
      
      if (isOnline) {
        // Upload to Firebase directly
        const url = await photosService.uploadPhoto(file, {
          jobId,
          photoId,
          ...metadata,
          uploadedBy: user!.uid,
          timestamp: new Date()
        });
        
        setProgress(100);
        return { photoId, url };
      } else {
        // Store locally and queue for upload
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
          reader.onload = async () => {
            const base64 = reader.result as string;
            
            const photo = {
              photoId,
              jobId,
              ...metadata,
              base64,
              syncStatus: 'pending',
              timestamp: Date.now(),
              uploadedBy: user!.uid
            };
            
            await idbService.savePhoto(photo);
            await addToQueue('create', {
              type: 'photo',
              data: photo
            });
            
            resolve({ photoId, url: base64 });
          };
          
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      setError('Failed to upload photo');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [jobId, isOnline, user, addToQueue]);

  return {
    uploading,
    progress,
    error,
    captureAndUploadPhoto
  };
};
```

## useRealtimeUpdates Hook

```typescript
// hooks/useRealtimeUpdates.ts

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { db } from '@/services/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useRealtimeUpdates = (
  collectionName: string,
  whereConditions?: Array<[string, string, any]>,
  onUpdate?: (data: any[]) => void
) => {
  const { isOnline } = useAuthStore();

  useEffect(() => {
    if (!isOnline) return; // Don't set up listener if offline

    let q = query(collection(db, collectionName));
    
    if (whereConditions) {
      const constraints = whereConditions.map(([field, operator, value]) => 
        where(field, operator as any, value)
      );
      q = query(collection(db, collectionName), ...constraints);
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      onUpdate?.(data);
    }, (error) => {
      console.error('Real-time update error:', error);
    });

    return () => unsubscribe();
  }, [collectionName, isOnline, whereConditions]);
};
```

---

# ZUSTAND STORE SETUP

## Auth Store

```typescript
// stores/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  role: 'MIT_TECH' | 'MIT_LEAD' | 'ADMIN' | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  token: string | null;
  
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setOnlineStatus: (online: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isOnline: true,
      token: null,
      
      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),
      
      setRole: (role) => set({ role }),
      
      setOnlineStatus: (online) => set({ isOnline: online }),
      
      logout: () => set({
        user: null,
        role: null,
        isAuthenticated: false,
        token: null
      })
    }),
    {
      name: 'auth-store',
      storage: localStorage
    }
  )
);
```

## Jobs Store

```typescript
// stores/jobsStore.ts

import { create } from 'zustand';
import { Job } from '@/types';

interface JobsStore {
  jobs: Job[];
  currentJob: Job | null;
  filters: {
    status?: string;
    zone?: string;
    searchText?: string;
  };
  
  setJobs: (jobs: Job[]) => void;
  setCurrentJob: (job: Job | null) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  addFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  getFilteredJobs: () => Job[];
}

export const useJobsStore = create<JobsStore>((set, get) => ({
  jobs: [],
  currentJob: null,
  filters: {},
  
  setJobs: (jobs) => set({ jobs }),
  
  setCurrentJob: (job) => set({ currentJob: job }),
  
  updateJob: (jobId, updates) => set((state) => ({
    jobs: state.jobs.map(j => 
      j.jobId === jobId ? { ...j, ...updates } : j
    ),
    currentJob: state.currentJob?.jobId === jobId 
      ? { ...state.currentJob, ...updates }
      : state.currentJob
  })),
  
  addFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  clearFilters: () => set({ filters: {} }),
  
  getFilteredJobs: () => {
    const { jobs, filters } = get();
    
    return jobs.filter(job => {
      if (filters.status && job.jobStatus !== filters.status) return false;
      if (filters.zone && job.scheduledZone !== filters.zone) return false;
      if (filters.searchText) {
        const text = filters.searchText.toLowerCase();
        return (
          job.customerInfo.name.toLowerCase().includes(text) ||
          job.customerInfo.address.toLowerCase().includes(text) ||
          job.jobId.toLowerCase().includes(text)
        );
      }
      return true;
    });
  }
}));
```

## Notifications Store

```typescript
// stores/notificationStore.ts

import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'offline-mode';
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = `notification-${Date.now()}`;
    
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
    
    // Auto-dismiss after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      }, notification.duration || 5000);
    }
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearAll: () => set({ notifications: [] })
}));
```

---

# FIREBASE SERVICE LAYER

## Jobs Service

```typescript
// services/firebase/jobs.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { Job } from '@/types';

const JOBS_COLLECTION = 'jobs';

export const getJobsByTechnician = async (techId: string): Promise<Job[]> => {
  const q = query(
    collection(db, JOBS_COLLECTION),
    where('scheduledTechnician', '==', techId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    jobId: doc.id
  })) as Job[];
};

export const getJobById = async (jobId: string): Promise<Job | null> => {
  const docRef = doc(db, JOBS_COLLECTION, jobId);
  const docSnap = await getDoc(docRef);
  
  return docSnap.exists() 
    ? { ...docSnap.data(), jobId: docSnap.id } as Job
    : null;
};

export const createJob = async (jobData: Omit<Job, 'jobId'>) => {
  const docRef = await addDoc(collection(db, JOBS_COLLECTION), {
    ...jobData,
    metadata: {
      ...jobData.metadata,
      createdAt: Timestamp.now()
    }
  });
  
  return docRef.id;
};

export const updateJobStatus = async (jobId: string, status: string) => {
  const jobRef = doc(db, JOBS_COLLECTION, jobId);
  await updateDoc(jobRef, {
    jobStatus: status,
    'metadata.lastModifiedAt': Timestamp.now()
  });
};

export const addRoomToJob = async (jobId: string, room: any) => {
  const jobRef = doc(db, JOBS_COLLECTION, jobId);
  const job = await getJobById(jobId);
  
  if (!job) throw new Error('Job not found');
  
  const updatedRooms = job.rooms ? [...job.rooms, room] : [room];
  
  await updateDoc(jobRef, {
    rooms: updatedRooms,
    'metadata.lastModifiedAt': Timestamp.now()
  });
};

export const addMoistureReading = async (
  jobId: string,
  roomId: string,
  reading: any
) => {
  const jobRef = doc(db, JOBS_COLLECTION, jobId);
  const job = await getJobById(jobId);
  
  if (!job) throw new Error('Job not found');
  
  const rooms = job.rooms?.map(r => {
    if (r.roomId === roomId) {
      return {
        ...r,
        moistureReadings: [...(r.moistureReadings || []), reading]
      };
    }
    return r;
  });
  
  await updateDoc(jobRef, {
    rooms,
    'metadata.lastModifiedAt': Timestamp.now()
  });
};
```

---

# FORM COMPONENTS WITH VALIDATION

## Moisture Reading Form

```typescript
// components/shared/forms/MoistureReadingForm.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const readingSchema = z.object({
  material: z.string().min(1, 'Material is required'),
  moisturePercentage: z.number().min(0).max(100, 'Must be 0-100%'),
  temperature: z.number().min(32).max(120, 'Typical temperature is 32-120°F'),
  humidity: z.number().min(0).max(100, 'Must be 0-100%'),
  readingType: z.enum(['pre-demo', 'post-demo', 'daily-check', 'final']),
  notes: z.string().optional()
});

type ReadingFormData = z.infer<typeof readingSchema>;

interface MoistureReadingFormProps {
  roomName: string;
  onSubmit: (data: ReadingFormData) => Promise<void>;
  onCancel: () => void;
}

export const MoistureReadingForm: React.FC<MoistureReadingFormProps> = ({
  roomName,
  onSubmit,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ReadingFormData>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      readingType: 'daily-check',
      temperature: 70,
      humidity: 50
    }
  });

  const moisturePercentage = watch('moisturePercentage');

  // Determine if readings indicate problem
  const isDry = moisturePercentage <= 12; // Typical dry threshold
  const statusColor = isDry ? 'text-green-600' : 'text-red-600';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm font-medium text-gray-900">Room: {roomName}</p>
      </div>

      {/* Material Type */}
      <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700">
          Material Type *
        </label>
        <select
          {...register('material')}
          id="material"
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Select material...</option>
          <option value="Drywall">Drywall</option>
          <option value="Flooring">Flooring</option>
          <option value="Subfloor">Subfloor</option>
          <option value="Wood Framing">Wood Framing</option>
          <option value="Carpet">Carpet</option>
          <option value="Concrete">Concrete</option>
          <option value="Insulation">Insulation</option>
        </select>
        {errors.material && (
          <p className="mt-1 text-sm text-red-600">{errors.material.message}</p>
        )}
      </div>

      {/* Moisture Reading */}
      <div>
        <label htmlFor="moisturePercentage" className="block text-sm font-medium text-gray-700">
          Moisture % *
        </label>
        <div className="flex gap-2">
          <input
            {...register('moisturePercentage', { valueAsNumber: true })}
            type="number"
            id="moisturePercentage"
            step="0.1"
            min="0"
            max="100"
            placeholder="0-100"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          <div className={`flex items-center px-3 py-2 rounded-lg font-medium ${statusColor}`}>
            {isDry ? '✓ DRY' : '✗ WET'}
          </div>
        </div>
        {errors.moisturePercentage && (
          <p className="mt-1 text-sm text-red-600">{errors.moisturePercentage.message}</p>
        )}
      </div>

      {/* Temperature & Humidity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
            Temperature (°F) *
          </label>
          <input
            {...register('temperature', { valueAsNumber: true })}
            type="number"
            id="temperature"
            step="0.1"
            placeholder="70"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          {errors.temperature && (
            <p className="text-xs text-red-600">{errors.temperature.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="humidity" className="block text-sm font-medium text-gray-700">
            Humidity (%) *
          </label>
          <input
            {...register('humidity', { valueAsNumber: true })}
            type="number"
            id="humidity"
            step="0.1"
            min="0"
            max="100"
            placeholder="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          {errors.humidity && (
            <p className="text-xs text-red-600">{errors.humidity.message}</p>
          )}
        </div>
      </div>

      {/* Reading Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reading Type *
        </label>
        <div className="space-y-2">
          {[
            { value: 'pre-demo', label: 'Pre-Demo' },
            { value: 'post-demo', label: 'Post-Demo' },
            { value: 'daily-check', label: 'Daily Check' },
            { value: 'final', label: 'Final' }
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center">
              <input
                {...register('readingType')}
                type="radio"
                value={value}
                className="h-4 w-4 text-orange-600"
              />
              <span className="ml-2 text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          rows={3}
          placeholder="Any observations about this reading..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Reading'}
        </button>
      </div>
    </form>
  );
};

export default MoistureReadingForm;
```

---

# RESPONSIVE DESIGN PATTERNS

## Tablet/Mobile Optimization

```typescript
// components/layout/MainLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const MainLayout: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar - Hidden on mobile, always visible on desktop */}
      {!isMobile && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Navbar */}
        <Navbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={isMobile}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Responsive padding */}
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 z-40">
            <Sidebar 
              isOpen={true}
              onToggle={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MainLayout;
```

## Grid Responsive Component

```typescript
// components/shared/JobCard.tsx - Responsive grid example

export const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <div className="
      grid gap-4
      grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
      p-4 md:p-6
    ">
      {/* Card for each job */}
      <div className="
        bg-white rounded-lg shadow-md 
        p-4 md:p-6 
        hover:shadow-lg transition-shadow
      ">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
          {job.customerInfo.name}
        </h3>
        
        <p className="text-sm md:text-base text-gray-600 mb-4">
          {job.customerInfo.address}
        </p>
        
        <div className="
          grid grid-cols-2 gap-2 md:gap-3
          text-xs md:text-sm
        ">
          <div className="bg-blue-50 p-2 md:p-3 rounded">
            <p className="font-medium">Status</p>
            <p className="text-blue-600">{job.jobStatus}</p>
          </div>
          <div className="bg-green-50 p-2 md:p-3 rounded">
            <p className="font-medium">Area</p>
            <p className="text-green-600">{job.equipment.calculations.totalAffectedSquareFootage} sq ft</p>
          </div>
        </div>

        {/* Buttons stack on mobile, side-by-side on larger screens */}
        <div className="
          flex gap-2 mt-4
          flex-col md:flex-row
        ">
          <button className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700">
            Start
          </button>
          <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

# ERROR HANDLING & USER FEEDBACK

## Global Error Boundary

```typescript
// components/ErrorBoundary.tsx

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Could log to error tracking service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-700 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Async Error Handling Pattern

```typescript
// Common pattern for handling async operations

const handleAsyncOperation = async (
  operation: () => Promise<void>,
  successMessage: string,
  errorMessage: string
) => {
  const { addNotification } = useNotifications();
  
  try {
    await operation();
    addNotification({
      type: 'success',
      title: 'Success',
      message: successMessage
    });
  } catch (error) {
    console.error(error);
    addNotification({
      type: 'error',
      title: 'Error',
      message: errorMessage || 'An error occurred. Please try again.'
    });
  }
};
```

---

**END OF COMPONENT IMPLEMENTATION GUIDE**

This guide provides practical, production-ready code examples for your developer to reference when implementing the MIT Dry Logs App components.
