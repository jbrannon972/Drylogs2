/**
 * Delete All Photos Script
 * Removes ALL photos from Firestore collection and Firebase Storage
 *
 * ⚠️  WARNING: This will permanently delete all photos!
 *
 * Run with: npm run delete-photos
 */

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseNode';

interface PhotoStats {
  firestoreCount: number;
  storageCount: number;
  firestoreDeleted: number;
  storageDeleted: number;
  errors: string[];
}

async function deleteAllPhotos() {
  console.log('🗑️  DELETE ALL PHOTOS SCRIPT');
  console.log('='.repeat(60));
  console.log('⚠️  WARNING: This will permanently delete ALL photos!');
  console.log('='.repeat(60));
  console.log('');

  const stats: PhotoStats = {
    firestoreCount: 0,
    storageCount: 0,
    firestoreDeleted: 0,
    storageDeleted: 0,
    errors: [],
  };

  try {
    // ========================================
    // PART 1: DELETE FIRESTORE METADATA
    // ========================================
    console.log('📊 PART 1: Scanning Firestore for photo metadata...\n');

    const photosRef = collection(db, 'photos');
    const snapshot = await getDocs(photosRef);
    stats.firestoreCount = snapshot.size;

    console.log(`   Found ${stats.firestoreCount} photo document(s) in Firestore\n`);

    if (stats.firestoreCount > 0) {
      console.log('🗑️  Deleting Firestore photo metadata...');

      for (const photoDoc of snapshot.docs) {
        try {
          await deleteDoc(doc(db, 'photos', photoDoc.id));
          stats.firestoreDeleted++;

          // Show progress every 10 deletions
          if (stats.firestoreDeleted % 10 === 0) {
            console.log(`   ✓ Deleted ${stats.firestoreDeleted}/${stats.firestoreCount} documents...`);
          }
        } catch (error: any) {
          const errorMsg = `Failed to delete Firestore doc ${photoDoc.id}: ${error.message}`;
          stats.errors.push(errorMsg);
          console.error(`   ✗ ${errorMsg}`);
        }
      }

      console.log(`\n✅ Firestore cleanup complete: ${stats.firestoreDeleted}/${stats.firestoreCount} documents deleted\n`);
    } else {
      console.log('✅ No Firestore photo metadata to delete\n');
    }

    // ========================================
    // PART 2: DELETE FIREBASE STORAGE FILES
    // ========================================
    console.log('='.repeat(60));
    console.log('📊 PART 2: Scanning Firebase Storage for photo files...\n');

    const storagePhotosRef = ref(storage, 'photos');

    try {
      // List all items in the photos folder (recursive)
      const listResult = await listAll(storagePhotosRef);

      // Count all files in all folders
      let allFiles: any[] = [...listResult.items];

      // If there are prefixes (folders), list their contents too
      for (const folderRef of listResult.prefixes) {
        const folderResult = await listAll(folderRef);
        allFiles = [...allFiles, ...folderResult.items];

        // Check subfolders (jobId/roomId structure)
        for (const subfolderRef of folderResult.prefixes) {
          const subfolderResult = await listAll(subfolderRef);
          allFiles = [...allFiles, ...subfolderResult.items];
        }
      }

      stats.storageCount = allFiles.length;
      console.log(`   Found ${stats.storageCount} photo file(s) in Firebase Storage\n`);

      if (stats.storageCount > 0) {
        console.log('🗑️  Deleting Firebase Storage files...');

        for (const fileRef of allFiles) {
          try {
            await deleteObject(fileRef);
            stats.storageDeleted++;

            // Show progress every 10 deletions
            if (stats.storageDeleted % 10 === 0) {
              console.log(`   ✓ Deleted ${stats.storageDeleted}/${stats.storageCount} files...`);
            }
          } catch (error: any) {
            const errorMsg = `Failed to delete Storage file ${fileRef.fullPath}: ${error.message}`;
            stats.errors.push(errorMsg);
            console.error(`   ✗ ${errorMsg}`);
          }
        }

        console.log(`\n✅ Storage cleanup complete: ${stats.storageDeleted}/${stats.storageCount} files deleted\n`);
      } else {
        console.log('✅ No Firebase Storage files to delete\n');
      }

    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.log('✅ No photos folder found in Firebase Storage (nothing to delete)\n');
      } else {
        throw error;
      }
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log('='.repeat(60));
    console.log('\n📋 DELETION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`\n📊 Firestore Photos Collection:`);
    console.log(`   - Found: ${stats.firestoreCount} documents`);
    console.log(`   - Deleted: ${stats.firestoreDeleted} documents`);
    console.log(`\n📁 Firebase Storage (photos/):`);
    console.log(`   - Found: ${stats.storageCount} files`);
    console.log(`   - Deleted: ${stats.storageDeleted} files`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
      stats.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log(`\n✅ No errors encountered`);
    }

    const totalDeleted = stats.firestoreDeleted + stats.storageDeleted;
    console.log(`\n🎉 TOTAL DELETED: ${totalDeleted} items`);
    console.log('\n✅ Photo deletion complete!\n');

  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error);
    throw error;
  }
}

// Run if called directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] === __filename;

if (isMain) {
  deleteAllPhotos()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default deleteAllPhotos;
