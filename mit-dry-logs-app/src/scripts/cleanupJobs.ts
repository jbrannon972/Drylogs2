/**
 * Cleanup Jobs Script
 * Removes duplicate jobs and shows what's in the database
 *
 * Run with: npm run cleanup
 */

import { collection, getDocs, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from './firebaseNode';

interface JobSummary {
  id: string;
  customerName: string;
  jobStatus: string;
  createdAt: any;
}

async function cleanupAndViewJobs() {
  console.log('🔍 Scanning database for jobs...\n');

  try {
    // Get all jobs
    const jobsQuery = query(collection(db, 'jobs'));
    const snapshot = await getDocs(jobsQuery);

    console.log(`📊 Found ${snapshot.size} total jobs in database\n`);

    // Organize jobs by customer name
    const jobsByCustomer = new Map<string, JobSummary[]>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const customerName = data.customerInfo?.name || 'Unknown';
      const jobSummary: JobSummary = {
        id: doc.id,
        customerName,
        jobStatus: data.jobStatus || 'Unknown',
        createdAt: data.metadata?.createdAt,
      };

      if (!jobsByCustomer.has(customerName)) {
        jobsByCustomer.set(customerName, []);
      }
      jobsByCustomer.get(customerName)!.push(jobSummary);
    });

    // Show all jobs
    console.log('📋 CURRENT JOBS IN DATABASE:');
    console.log('='.repeat(60));

    let duplicateCount = 0;
    const jobsToDelete: string[] = [];

    for (const [customerName, jobs] of jobsByCustomer) {
      console.log(`\n👤 ${customerName} (${jobs.length} job${jobs.length > 1 ? 's' : ''})`);

      jobs.forEach((job, index) => {
        const isDuplicate = jobs.length > 1 && index > 0;
        if (isDuplicate) {
          duplicateCount++;
          jobsToDelete.push(job.id);
        }

        console.log(`   ${isDuplicate ? '❌ DUPLICATE' : '✅'} ${job.jobStatus} (ID: ${job.id.substring(0, 8)}...)`);
      });
    }

    // Prompt for cleanup
    if (duplicateCount > 0) {
      console.log('\n' + '='.repeat(60));
      console.log(`\n⚠️  Found ${duplicateCount} duplicate job(s)`);
      console.log(`\nTo remove duplicates, I will keep the FIRST occurrence of each customer's job.`);
      console.log(`Jobs to delete: ${jobsToDelete.length}`);

      // Delete duplicates
      console.log('\n🗑️  Removing duplicates...');
      for (const jobId of jobsToDelete) {
        await deleteDoc(doc(db, 'jobs', jobId));
        console.log(`   ✓ Deleted job ${jobId.substring(0, 8)}...`);
      }

      console.log(`\n✅ Cleanup complete! Removed ${jobsToDelete.length} duplicate job(s)`);

      // Show updated count
      const updatedSnapshot = await getDocs(jobsQuery);
      console.log(`\n📊 Database now has ${updatedSnapshot.size} unique jobs\n`);
    } else {
      console.log('\n✅ No duplicates found! Database is clean.\n');
    }

    // Show summary by status
    console.log('='.repeat(60));
    console.log('\n📈 JOBS BY STATUS:');
    const statusCounts = new Map<string, number>();

    const finalSnapshot = await getDocs(jobsQuery);
    finalSnapshot.forEach((doc) => {
      const status = doc.data().jobStatus || 'Unknown';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    for (const [status, count] of statusCounts) {
      console.log(`   ${status}: ${count} job${count !== 1 ? 's' : ''}`);
    }

    console.log('\n✅ Done!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run if called directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] === __filename;

if (isMain) {
  cleanupAndViewJobs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
