/**
 * Fix Job Assignments Script
 * Updates all jobs to use the actual demo user UIDs instead of hardcoded 'tech1'
 *
 * Run with: npm run fix-assignments
 */

import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from './firebaseNode';

async function fixJobAssignments() {
  console.log('🔧 Fixing job assignments...\n');

  try {
    // Step 1: Find actual demo tech user UID
    console.log('👤 Finding demo tech user...');
    const usersQuery = query(collection(db, 'users'), where('email', '==', 'tech@demo.com'));
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      console.error('❌ ERROR: Demo tech user not found!');
      console.log('   Please create demo users first using the setup page.');
      return;
    }

    const techDoc = usersSnapshot.docs[0];
    const actualTechUid = techDoc.id;
    const techData = techDoc.data();
    console.log(`   ✓ Found: ${techData.displayName} (${techData.email})`);
    console.log(`   ✓ UID: ${actualTechUid}\n`);

    // Step 2: Find actual demo lead user UID (if exists)
    const leadQuery = query(collection(db, 'users'), where('email', '==', 'lead@demo.com'));
    const leadSnapshot = await getDocs(leadQuery);
    const actualLeadUid = leadSnapshot.empty ? null : leadSnapshot.docs[0].id;

    if (actualLeadUid) {
      const leadData = leadSnapshot.docs[0].data();
      console.log(`   ✓ Found lead: ${leadData.displayName} (${leadData.email})`);
      console.log(`   ✓ UID: ${actualLeadUid}\n`);
    }

    // Step 3: Update all jobs
    console.log('📋 Updating job assignments...');
    const jobsQuery = query(collection(db, 'jobs'));
    const jobsSnapshot = await getDocs(jobsQuery);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const jobDoc of jobsSnapshot.docs) {
      const jobData = jobDoc.data();
      const jobId = jobDoc.id;
      const customerName = jobData.customerInfo?.name || 'Unknown';

      // Check if job needs updating
      const needsUpdate =
        jobData.scheduledTechnician === 'tech1' ||
        jobData.metadata?.createdBy === 'tech1' ||
        jobData.metadata?.lastModifiedBy === 'tech1' ||
        jobData.workflowPhases?.install?.technician === 'tech1' ||
        jobData.workflowPhases?.demo?.technician === 'tech1' ||
        jobData.workflowPhases?.pull?.technician === 'tech1' ||
        jobData.equipment?.calculations?.calculatedBy === 'tech1';

      if (needsUpdate) {
        const updates: any = {};

        // Update scheduled technician
        if (jobData.scheduledTechnician === 'tech1') {
          updates.scheduledTechnician = actualTechUid;
        }

        // Update metadata
        if (jobData.metadata?.createdBy === 'tech1') {
          updates['metadata.createdBy'] = actualTechUid;
        }
        if (jobData.metadata?.lastModifiedBy === 'tech1') {
          updates['metadata.lastModifiedBy'] = actualTechUid;
        }

        // Update workflow phases
        if (jobData.workflowPhases?.install?.technician === 'tech1') {
          updates['workflowPhases.install.technician'] = actualTechUid;
        }
        if (jobData.workflowPhases?.demo?.technician === 'tech1') {
          updates['workflowPhases.demo.technician'] = actualTechUid;
        }
        if (jobData.workflowPhases?.pull?.technician === 'tech1') {
          updates['workflowPhases.pull.technician'] = actualTechUid;
        }

        // Update equipment calculations
        if (jobData.equipment?.calculations?.calculatedBy === 'tech1') {
          updates['equipment.calculations.calculatedBy'] = actualTechUid;
        }

        await updateDoc(doc(db, 'jobs', jobId), updates);
        console.log(`   ✓ Updated: ${customerName} (${jobData.jobStatus})`);
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Job assignment fix complete!`);
    console.log(`   Updated: ${updatedCount} job(s)`);
    console.log(`   Skipped: ${skippedCount} job(s) (already correct)`);
    console.log(`\n📱 Now log in as tech@demo.com to see all ${updatedCount} assigned jobs!\n`);

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
  fixJobAssignments()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
