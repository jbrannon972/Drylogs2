import { Job, RedFlag, RedFlagType, RedFlagSeverity } from '../types';
import { Timestamp } from 'firebase/firestore';

/**
 * Auto-detect red flags based on job data
 * Called whenever job data is updated
 */
export const detectRedFlags = (job: Job): RedFlag[] => {
  const flags: RedFlag[] = [];

  // 1. Equipment Variance Detection
  const equipmentVarianceFlag = detectEquipmentVariance(job);
  if (equipmentVarianceFlag) flags.push(equipmentVarianceFlag);

  // 2. Missing Photos Detection
  const missingPhotosFlag = detectMissingPhotos(job);
  if (missingPhotosFlag) flags.push(missingPhotosFlag);

  // 3. Moisture Not Improving Detection
  const moistureFlag = detectMoistureNotImproving(job);
  if (moistureFlag) flags.push(moistureFlag);

  // 4. Demo Without Reason Detection
  const demoReasonFlag = detectDemoWithoutReason(job);
  if (demoReasonFlag) flags.push(demoReasonFlag);

  // 5. No Adjuster Approval Detection
  const approvalFlag = detectNoAdjusterApproval(job);
  if (approvalFlag) flags.push(approvalFlag);

  // 6. Cost Overrun Detection
  const costOverrunFlag = detectCostOverrun(job);
  if (costOverrunFlag) flags.push(costOverrunFlag);

  // 7. Timeline Delay Detection
  const timelineFlag = detectTimelineDelay(job);
  if (timelineFlag) flags.push(timelineFlag);

  return flags;
};

// 1. Equipment Variance Detection
function detectEquipmentVariance(job: Job): RedFlag | null {
  const calc = job.equipment.calculations;
  const actual = {
    dehumidifiers: job.equipment.chambers.reduce(
      (sum, ch) => sum + ch.dehumidifiers.length,
      0
    ),
    airMovers: job.equipment.chambers.reduce((sum, ch) => sum + ch.airMovers.length, 0),
    airScrubbers: job.equipment.chambers.reduce(
      (sum, ch) => sum + ch.airScrubbers.length,
      0
    ),
  };

  const dehuVariance = Math.abs(actual.dehumidifiers - calc.recommendedDehumidifierCount);
  const dehuPercent = (dehuVariance / calc.recommendedDehumidifierCount) * 100;

  const moverVariance = Math.abs(actual.airMovers - calc.recommendedAirMoverCount);
  const moverPercent = (moverVariance / calc.recommendedAirMoverCount) * 100;

  // Flag if variance > 20%
  if (dehuPercent > 20 || moverPercent > 20) {
    return {
      id: `equipment-variance-${Date.now()}`,
      type: 'equipment-variance',
      severity: dehuPercent > 50 || moverPercent > 50 ? 'critical' : 'high',
      description: `Equipment variance detected: Deployed ${actual.dehumidifiers} dehus (IICRC: ${calc.recommendedDehumidifierCount}), ${actual.airMovers} air movers (IICRC: ${calc.recommendedAirMoverCount}). Variance exceeds 20%.`,
      detectedAt: Timestamp.now(),
      resolved: false,
    };
  }

  return null;
}

// 2. Missing Photos Detection
function detectMissingPhotos(job: Job): RedFlag | null {
  const requiredSteps: Array<'arrival' | 'assessment' | 'final'> = [
    'arrival',
    'assessment',
    'final',
  ];

  const allPhotos = job.rooms.flatMap(r => r.photos);
  const missingSteps = requiredSteps.filter(
    step => !allPhotos.some(p => p.step === step)
  );

  if (missingSteps.length > 0) {
    // Check if job is complete - if so, it's critical
    const jobComplete = job.workflowPhases.pull.status === 'completed';

    return {
      id: `missing-photos-${Date.now()}`,
      type: 'missing-photos',
      severity: jobComplete ? 'critical' : 'medium',
      description: `Missing required photos: ${missingSteps.join(', ')}. Total photos: ${allPhotos.length}.`,
      detectedAt: Timestamp.now(),
      resolved: false,
    };
  }

  return null;
}

// 3. Moisture Not Improving Detection
function detectMoistureNotImproving(job: Job): RedFlag | null {
  // Only check if check service has been performed
  if (job.workflowPhases.checkService.visits.length < 2) {
    return null;
  }

  // Check each room's moisture trend
  for (const room of job.rooms) {
    const readings = room.moistureReadings.sort(
      (a, b) => a.recordedAt.toMillis() - b.recordedAt.toMillis()
    );

    if (readings.length < 2) continue;

    // Compare last 2 readings
    const latest = readings[readings.length - 1];
    const previous = readings[readings.length - 2];

    // If moisture increased or stayed the same after 2+ days
    const daysDiff =
      (latest.recordedAt.toMillis() - previous.recordedAt.toMillis()) /
      (1000 * 60 * 60 * 24);

    if (daysDiff >= 2 && latest.moisturePercentage >= previous.moisturePercentage) {
      return {
        id: `moisture-not-improving-${Date.now()}`,
        type: 'moisture-not-improving',
        severity: 'high',
        description: `Moisture readings not improving in ${room.roomName}. Day ${daysDiff.toFixed(0)}: ${previous.moisturePercentage}% → ${latest.moisturePercentage}%. Drying may be stalled.`,
        detectedAt: Timestamp.now(),
        resolved: false,
      };
    }
  }

  return null;
}

// 4. Demo Without Reason Detection
function detectDemoWithoutReason(job: Job): RedFlag | null {
  // Check if partial demo was performed during install
  if (job.workflowPhases.install.partialDemoPerformed) {
    const partialDemo = job.workflowPhases.install.partialDemoDetails;
    if (partialDemo) {
      const roomsWithoutReason = partialDemo.rooms.filter(
        r => !r.notes || r.notes.trim() === ''
      );

      if (roomsWithoutReason.length > 0) {
        return {
          id: `demo-no-reason-${Date.now()}`,
          type: 'demo-no-reason',
          severity: 'medium',
          description: `Partial demo performed in ${roomsWithoutReason.length} room(s) without IICRC justification: ${roomsWithoutReason.map(r => r.roomName).join(', ')}.`,
          detectedAt: Timestamp.now(),
          resolved: false,
        };
      }
    }
  }

  return null;
}

// 5. No Adjuster Approval Detection
function detectNoAdjusterApproval(job: Job): RedFlag | null {
  // Check if demo was performed but no approval documented
  const demoPerformed =
    job.workflowPhases.demo.status === 'completed' ||
    job.workflowPhases.install.partialDemoPerformed;

  if (demoPerformed) {
    const hasApproval = job.psmData?.approvalStatus.demoScope === 'approved';
    const hasAdjusterContact = (job.psmData?.adjusterCommunications || []).length > 0;

    if (!hasApproval && !hasAdjusterContact) {
      return {
        id: `no-adjuster-approval-${Date.now()}`,
        type: 'no-adjuster-approval',
        severity: 'critical',
        description: `Demo work completed without documented adjuster approval. No adjuster communications logged.`,
        detectedAt: Timestamp.now(),
        resolved: false,
      };
    }
  }

  return null;
}

// 6. Cost Overrun Detection
function detectCostOverrun(job: Job): RedFlag | null {
  const estimated = job.financial.estimatedTotal;
  const actual = job.financial.actualExpenses.total;

  if (actual === 0) return null; // No actuals recorded yet

  const overrun = actual - estimated;
  const overrunPercent = (overrun / estimated) * 100;

  if (overrunPercent > 15) {
    return {
      id: `cost-overrun-${Date.now()}`,
      type: 'cost-overrun',
      severity: overrunPercent > 30 ? 'critical' : 'high',
      description: `Cost overrun detected: Estimated $${estimated.toLocaleString()}, Actual $${actual.toLocaleString()} (+${overrunPercent.toFixed(1)}%).`,
      detectedAt: Timestamp.now(),
      resolved: false,
    };
  }

  return null;
}

// 7. Timeline Delay Detection
function detectTimelineDelay(job: Job): RedFlag | null {
  const estimatedDryingDays =
    job.dryingPlan?.dryingGoals.estimatedDryingDays ||
    job.equipment.calculations.estimatedDryingDays;

  if (!job.workflowPhases.install.completedAt) return null;

  const installDate = job.workflowPhases.install.completedAt.toDate();
  const today = new Date();
  const daysSinceInstall = Math.floor(
    (today.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If still drying after estimated days + 2 day buffer
  const isPullComplete = job.workflowPhases.pull.status === 'completed';

  if (!isPullComplete && daysSinceInstall > estimatedDryingDays + 2) {
    const daysOverdue = daysSinceInstall - estimatedDryingDays;

    return {
      id: `timeline-delay-${Date.now()}`,
      type: 'timeline-delay',
      severity: daysOverdue > 5 ? 'high' : 'medium',
      description: `Job timeline exceeded: ${daysSinceInstall} days since install (estimated ${estimatedDryingDays} days). ${daysOverdue} days overdue.`,
      detectedAt: Timestamp.now(),
      resolved: false,
    };
  }

  return null;
}

/**
 * Get a summary of documentation completeness
 */
export const getDocumentationCompleteness = (job: Job): {
  complete: boolean;
  missingItems: string[];
  completionPercent: number;
} => {
  const missingItems: string[] = [];

  // Check photos
  const allPhotos = job.rooms.flatMap(r => r.photos);
  const hasArrival = allPhotos.some(p => p.step === 'arrival' || p.step === 'assessment');
  const hasFinal = allPhotos.some(p => p.step === 'final');

  if (!hasArrival) missingItems.push('Arrival/Assessment Photos');
  if (!hasFinal && job.workflowPhases.pull.status === 'completed') {
    missingItems.push('Final Photos');
  }

  // Check moisture readings
  const hasMoistureReadings = job.rooms.some(r => r.moistureReadings.length > 0);
  if (!hasMoistureReadings) missingItems.push('Moisture Readings');

  // Check equipment
  const hasEquipment = job.equipment.chambers.length > 0;
  if (!hasEquipment) missingItems.push('Equipment Deployment');

  // Check signatures
  if (
    job.workflowPhases.pull.status === 'completed' &&
    !job.documentation.certificateOfSatisfaction.obtained
  ) {
    missingItems.push('Certificate of Satisfaction');
  }

  if (
    job.documentation.dryReleaseWaiver.needed &&
    !job.documentation.dryReleaseWaiver.obtained
  ) {
    missingItems.push('Dry Release Waiver');
  }

  // Calculate completion percentage
  const totalChecks = 6;
  const completedChecks = totalChecks - missingItems.length;
  const completionPercent = Math.round((completedChecks / totalChecks) * 100);

  return {
    complete: missingItems.length === 0,
    missingItems,
    completionPercent,
  };
};
