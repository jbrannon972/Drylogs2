import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { JobPhoto, PhotosByDate, PhotosByRoom } from '../../types/photo';

class PhotosService {
  /**
   * Get all photos for a specific job
   */
  async getPhotosByJobId(jobId: string): Promise<JobPhoto[]> {
    try {
      const photosRef = collection(db, 'photos');
      const q = query(
        photosRef,
        where('jobId', '==', jobId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as JobPhoto[];
    } catch (error) {
      console.error('Error fetching photos:', error);
      return [];
    }
  }

  /**
   * Group photos by date (YYYY-MM-DD format)
   */
  groupPhotosByDate(photos: JobPhoto[]): PhotosByDate {
    const grouped: PhotosByDate = {};

    photos.forEach(photo => {
      // Convert Firestore Timestamp to Date
      const date = photo.timestamp.toDate();
      const dateKey = date.toISOString().split('T')[0]; // "2025-11-08"

      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
      }

      const roomName = photo.roomName || 'Uncategorized';
      if (!grouped[dateKey][roomName]) {
        grouped[dateKey][roomName] = [];
      }

      grouped[dateKey][roomName].push(photo);
    });

    // Sort photos within each room by timestamp
    Object.keys(grouped).forEach(date => {
      Object.keys(grouped[date]).forEach(room => {
        grouped[date][room].sort((a, b) =>
          b.timestamp.toMillis() - a.timestamp.toMillis()
        );
      });
    });

    return grouped;
  }

  /**
   * Group photos by room
   */
  groupPhotosByRoom(photos: JobPhoto[]): PhotosByRoom {
    const grouped: PhotosByRoom = {};

    photos.forEach(photo => {
      const roomName = photo.roomName || 'Uncategorized';
      if (!grouped[roomName]) {
        grouped[roomName] = [];
      }
      grouped[roomName].push(photo);
    });

    // Sort photos within each room by timestamp (newest first)
    Object.keys(grouped).forEach(room => {
      grouped[room].sort((a, b) =>
        b.timestamp.toMillis() - a.timestamp.toMillis()
      );
    });

    return grouped;
  }

  /**
   * Get available dates (dates that have photos)
   */
  getAvailableDates(photosByDate: PhotosByDate): string[] {
    return Object.keys(photosByDate).sort().reverse(); // Newest first
  }

  /**
   * Get all unique room names from photos
   */
  getRoomNames(photos: JobPhoto[]): string[] {
    const rooms = new Set<string>();
    photos.forEach(photo => {
      rooms.add(photo.roomName || 'Uncategorized');
    });
    return Array.from(rooms).sort();
  }

  /**
   * Filter photos by date and room
   */
  filterPhotos(
    photosByDate: PhotosByDate,
    selectedDate: string,
    selectedRoom: string | null
  ): PhotosByRoom {
    const datePhotos = photosByDate[selectedDate] || {};

    if (!selectedRoom || selectedRoom === 'all') {
      return datePhotos;
    }

    return {
      [selectedRoom]: datePhotos[selectedRoom] || [],
    };
  }

  /**
   * Get total photo count for a specific date
   */
  getPhotoCountForDate(photosByDate: PhotosByDate, date: string): number {
    const datePhotos = photosByDate[date];
    if (!datePhotos) return 0;

    return Object.values(datePhotos).reduce(
      (total, photos) => total + photos.length,
      0
    );
  }
}

export const photosService = new PhotosService();
