import { Timestamp } from 'firebase/firestore';

export type PhotoCategory =
  | 'arrival'
  | 'assessment'
  | 'pre-demo'
  | 'post-demo'
  | 'equipment'
  | 'final'
  | 'exterior'
  | 'interior'
  | 'moisture-reading'
  | 'other';

export interface JobPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  jobId: string;
  roomId?: string;
  roomName: string;
  category: PhotoCategory;
  timestamp: Timestamp;
  uploadedBy: string;
  uploadedByName: string;
  step?: string;
  notes?: string;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    fileName?: string;
  };
}

export interface PhotosByDate {
  [date: string]: { // "2025-11-08"
    [roomName: string]: JobPhoto[];
  };
}

export interface PhotosByRoom {
  [roomName: string]: JobPhoto[];
}
