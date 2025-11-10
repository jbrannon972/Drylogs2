/**
 * Photo Management Admin Page
 *
 * Accessible at: /admin/photos
 *
 * Features:
 * - View photo statistics (Firestore + Storage)
 * - Delete all photos with one click
 * - Real-time progress reporting
 * - Comprehensive error handling
 */

import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import {
  Trash2,
  Image,
  Database,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Loader,
  RefreshCw,
  Home,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PhotoStats {
  firestoreCount: number;
  storageCount: number;
  lastUpdated: Date;
}

interface DeletionProgress {
  firestoreDeleted: number;
  firestoreTotal: number;
  storageDeleted: number;
  storageTotal: number;
  errors: string[];
  isComplete: boolean;
}

export const PhotoManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PhotoStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [progress, setProgress] = useState<DeletionProgress | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Count Firestore photos
      const photosSnapshot = await getDocs(collection(db, 'photos'));
      const firestoreCount = photosSnapshot.size;

      // Count Storage files
      let storageCount = 0;
      try {
        const storageRef = ref(storage, 'photos');
        const listResult = await listAll(storageRef);

        // Count all files including subfolders
        let allFiles: any[] = [...listResult.items];

        for (const folderRef of listResult.prefixes) {
          const folderResult = await listAll(folderRef);
          allFiles = [...allFiles, ...folderResult.items];

          for (const subfolderRef of folderResult.prefixes) {
            const subfolderResult = await listAll(subfolderRef);
            allFiles = [...allFiles, ...subfolderResult.items];
          }
        }

        storageCount = allFiles.length;
      } catch (err: any) {
        if (err.code !== 'storage/object-not-found') {
          throw err;
        }
      }

      setStats({
        firestoreCount,
        storageCount,
        lastUpdated: new Date(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load photo statistics');
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setShowConfirm(false);
    setIsDeleting(true);
    setError('');

    const deletionProgress: DeletionProgress = {
      firestoreDeleted: 0,
      firestoreTotal: 0,
      storageDeleted: 0,
      storageTotal: 0,
      errors: [],
      isComplete: false,
    };

    setProgress(deletionProgress);

    try {
      // ========================================
      // PART 1: DELETE FIRESTORE METADATA
      // ========================================
      const photosRef = collection(db, 'photos');
      const snapshot = await getDocs(photosRef);
      deletionProgress.firestoreTotal = snapshot.size;
      setProgress({ ...deletionProgress });

      for (const photoDoc of snapshot.docs) {
        try {
          await deleteDoc(doc(db, 'photos', photoDoc.id));
          deletionProgress.firestoreDeleted++;
          setProgress({ ...deletionProgress });
        } catch (error: any) {
          const errorMsg = `Firestore: ${photoDoc.id} - ${error.message}`;
          deletionProgress.errors.push(errorMsg);
          setProgress({ ...deletionProgress });
        }
      }

      // ========================================
      // PART 2: DELETE FIREBASE STORAGE FILES
      // ========================================
      const storagePhotosRef = ref(storage, 'photos');

      try {
        const listResult = await listAll(storagePhotosRef);
        let allFiles: any[] = [...listResult.items];

        for (const folderRef of listResult.prefixes) {
          const folderResult = await listAll(folderRef);
          allFiles = [...allFiles, ...folderResult.items];

          for (const subfolderRef of folderResult.prefixes) {
            const subfolderResult = await listAll(subfolderRef);
            allFiles = [...allFiles, ...subfolderResult.items];
          }
        }

        deletionProgress.storageTotal = allFiles.length;
        setProgress({ ...deletionProgress });

        for (const fileRef of allFiles) {
          try {
            await deleteObject(fileRef);
            deletionProgress.storageDeleted++;
            setProgress({ ...deletionProgress });
          } catch (error: any) {
            const errorMsg = `Storage: ${fileRef.fullPath} - ${error.message}`;
            deletionProgress.errors.push(errorMsg);
            setProgress({ ...deletionProgress });
          }
        }
      } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
          throw error;
        }
      }

      // Mark complete
      deletionProgress.isComplete = true;
      setProgress({ ...deletionProgress });

      // Reload stats
      await loadStats();
    } catch (err: any) {
      setError(err.message || 'Failed to delete photos');
      console.error('Deletion error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPhotos = (stats?.firestoreCount || 0) + (stats?.storageCount || 0);
  const hasPhotos = totalPhotos > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image className="w-8 h-8 text-entrusted-orange" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Photo Management</h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Firestore Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Firestore Collection</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {isLoading ? (
                <Loader className="w-8 h-8 animate-spin text-gray-400" />
              ) : (
                stats?.firestoreCount || 0
              )}
            </div>
            <p className="text-sm text-gray-600">Photo metadata documents</p>
          </div>

          {/* Storage Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Firebase Storage</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {isLoading ? (
                <Loader className="w-8 h-8 animate-spin text-gray-400" />
              ) : (
                stats?.storageCount || 0
              )}
            </div>
            <p className="text-sm text-gray-600">Photo files stored</p>
          </div>

          {/* Total Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Image className="w-6 h-6 text-entrusted-orange" />
              <h3 className="font-semibold text-gray-900">Total Photos</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {isLoading ? (
                <Loader className="w-8 h-8 animate-spin text-gray-400" />
              ) : (
                totalPhotos
              )}
            </div>
            <p className="text-sm text-gray-600">
              Combined items
              {stats && (
                <span className="ml-2 text-xs text-gray-500">
                  (updated {stats.lastUpdated.toLocaleTimeString()})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Error</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Deletion Progress */}
        {progress && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {progress.isComplete ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Loader className="w-5 h-5 animate-spin text-entrusted-orange" />
              )}
              {progress.isComplete ? 'Deletion Complete' : 'Deleting Photos...'}
            </h3>

            {/* Firestore Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Firestore Metadata</span>
                <span className="text-sm text-gray-600">
                  {progress.firestoreDeleted} / {progress.firestoreTotal}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress.firestoreTotal > 0 ? (progress.firestoreDeleted / progress.firestoreTotal) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Storage Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Storage Files</span>
                <span className="text-sm text-gray-600">
                  {progress.storageDeleted} / {progress.storageTotal}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress.storageTotal > 0 ? (progress.storageDeleted / progress.storageTotal) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Errors */}
            {progress.errors.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  {progress.errors.length} Error(s) Encountered
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {progress.errors.map((err, idx) => (
                    <p key={idx} className="text-xs text-yellow-800 mb-1">
                      {idx + 1}. {err}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {progress.isComplete && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-900">
                  ✅ Successfully deleted {progress.firestoreDeleted + progress.storageDeleted} items
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>

          <div className="flex gap-4">
            <button
              onClick={loadStats}
              disabled={isLoading || isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </button>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={!hasPhotos || isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Photos
            </button>
          </div>

          {!hasPhotos && !isLoading && (
            <p className="text-sm text-gray-600 mt-4">
              No photos to delete. The database is clean!
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Delete All Photos?
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                  <li>• <strong>{stats?.firestoreCount || 0}</strong> Firestore documents</li>
                  <li>• <strong>{stats?.storageCount || 0}</strong> Storage files</li>
                  <li>• <strong>{totalPhotos}</strong> total items</li>
                </ul>
                <p className="text-sm font-semibold text-red-700">
                  ⚠️ This action cannot be undone!
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
