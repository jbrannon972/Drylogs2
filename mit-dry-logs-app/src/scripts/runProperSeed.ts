/**
 * Run Proper Seed Data
 *
 * This script:
 * 1. Clears existing jobs (optional)
 * 2. Seeds jobs with correct structure for PSM dashboard
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { properSeedJobs } from './properSeedData';

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearAllJobs() {
  console.log('🗑️  Clearing all existing jobs...');
  const jobsRef = collection(db, 'jobs');
  const snapshot = await getDocs(jobsRef);

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`✅ Deleted ${snapshot.docs.length} existing jobs`);
}

async function seedProperData() {
  console.log('🌱 Starting proper seed data process...\n');

  try {
    // Step 1: Clear existing jobs
    await clearAllJobs();
    console.log('');

    // Step 2: Seed new jobs with proper structure
    console.log('📝 Seeding jobs with proper structure...');

    for (const job of properSeedJobs) {
      const jobRef = doc(db, 'jobs', job.jobId);
      await setDoc(jobRef, job);
      console.log(`  ✓ ${job.jobId}: ${job.customerInfo.name} (${job.jobStatus})`);

      // Show PSM status if it exists
      if (job.psmData) {
        console.log(`    → PSM: ${job.psmData.psmPhase.status}`);
      } else {
        console.log(`    → No PSM data (still in field work)`);
      }
    }

    console.log('\n✅ Seed complete!');
    console.log('\nJobs created:');
    console.log(`  - ${properSeedJobs.length} total jobs`);
    console.log(`  - ${properSeedJobs.filter(j => j.psmData).length} jobs with PSM data (visible in PSM dashboard)`);
    console.log(`  - ${properSeedJobs.filter(j => !j.psmData).length} jobs still in field work`);

    console.log('\n📊 PSM Dashboard Jobs:');
    properSeedJobs
      .filter(j => j.psmData)
      .forEach(job => {
        console.log(`  - ${job.jobId}: ${job.psmData!.psmPhase.status}`);
      });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedProperData();
