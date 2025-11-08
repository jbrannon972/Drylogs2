import { Job, RedFlagSeverity } from '../types';

export interface JobPriority {
  jobId: string;
  score: number;
  reason: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Smart job prioritization algorithm
 * Returns jobs sorted by priority score (highest first)
 */
export const prioritizeJobs = (jobs: Job[]): JobPriority[] => {
  const priorities = jobs.map(job => calculatePriority(job));
  return priorities.sort((a, b) => b.score - a.score);
};

function calculatePriority(job: Job): JobPriority {
  let score = 0;
  const reasons: string[] = [];

  // 1. Critical Red Flags (+50 points)
  const criticalFlags = job.psmData?.redFlags.filter(
    f => !f.resolved && f.severity === 'critical'
  );
  if (criticalFlags && criticalFlags.length > 0) {
    score += 50 * criticalFlags.length;
    reasons.push(`${criticalFlags.length} critical flag(s)`);
  }

  // 2. High Red Flags (+25 points)
  const highFlags = job.psmData?.redFlags.filter(
    f => !f.resolved && f.severity === 'high'
  );
  if (highFlags && highFlags.length > 0) {
    score += 25 * highFlags.length;
    reasons.push(`${highFlags.length} high flag(s)`);
  }

  // 3. Days in PSM Phase (+5 points per day)
  const daysInPhase = job.psmData?.psmPhase.daysInPhase || 0;
  if (daysInPhase > 2) {
    score += daysInPhase * 5;
    reasons.push(`${daysInPhase} days in phase`);
  }

  // 4. Missing Documentation (+30 points)
  const missingItems = job.psmData?.documentationReview.missingItems || [];
  if (missingItems.length > 0) {
    score += 30;
    reasons.push(`${missingItems.length} missing items`);
  }

  // 5. Awaiting Adjuster Response (+40 points)
  if (job.psmData?.psmPhase.status === 'awaiting-adjuster') {
    const daysSinceSubmit = job.psmData.psmPhase.submittedToAdjusterAt
      ? Math.floor(
          (Date.now() - job.psmData.psmPhase.submittedToAdjusterAt.toMillis()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    if (daysSinceSubmit > 3) {
      score += 40;
      reasons.push(`awaiting adjuster ${daysSinceSubmit} days`);
    }
  }

  // 6. High Value Job (+20 points if > $10k)
  if (job.financial.estimatedTotal > 10000) {
    score += 20;
    reasons.push('high value job');
  }

  // 7. Field Complete but Not Reviewed (+15 points)
  if (job.psmData?.psmPhase.status === 'field-complete') {
    score += 15;
    reasons.push('ready for review');
  }

  // 8. Urgent Customer Concerns (+25 points)
  if (job.communication.customerConcerns.length > 2) {
    score += 25;
    reasons.push('multiple customer concerns');
  }

  // Determine urgency level
  let urgency: 'critical' | 'high' | 'medium' | 'low';
  if (score >= 100) urgency = 'critical';
  else if (score >= 50) urgency = 'high';
  else if (score >= 25) urgency = 'medium';
  else urgency = 'low';

  return {
    jobId: job.jobId,
    score,
    reason: reasons.join(', '),
    urgency,
  };
}

/**
 * Identify bottlenecks in PSM workflow
 */
export interface Bottleneck {
  type: 'missing-docs' | 'adjuster-delay' | 'approval-delay' | 'aging-jobs';
  count: number;
  averageDays: number;
  jobs: string[];
}

export const identifyBottlenecks = (jobs: Job[]): Bottleneck[] => {
  const bottlenecks: Bottleneck[] = [];

  // 1. Missing Documentation Bottleneck
  const jobsWithMissingDocs = jobs.filter(
    j => (j.psmData?.documentationReview.missingItems || []).length > 0
  );
  if (jobsWithMissingDocs.length > 0) {
    bottlenecks.push({
      type: 'missing-docs',
      count: jobsWithMissingDocs.length,
      averageDays: calculateAverageDays(jobsWithMissingDocs),
      jobs: jobsWithMissingDocs.map(j => j.jobId),
    });
  }

  // 2. Adjuster Delay Bottleneck
  const jobsAwaitingAdjuster = jobs.filter(
    j => j.psmData?.psmPhase.status === 'awaiting-adjuster'
  );
  const delayedAdjusterJobs = jobsAwaitingAdjuster.filter(j => {
    const daysSinceSubmit = j.psmData?.psmPhase.submittedToAdjusterAt
      ? Math.floor(
          (Date.now() - j.psmData.psmPhase.submittedToAdjusterAt.toMillis()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
    return daysSinceSubmit > 3;
  });

  if (delayedAdjusterJobs.length > 0) {
    bottlenecks.push({
      type: 'adjuster-delay',
      count: delayedAdjusterJobs.length,
      averageDays: calculateAverageDays(delayedAdjusterJobs),
      jobs: delayedAdjusterJobs.map(j => j.jobId),
    });
  }

  // 3. Approval Delay Bottleneck
  const jobsPendingApproval = jobs.filter(
    j =>
      j.psmData?.approvalStatus.demoScope === 'pending' ||
      j.psmData?.approvalStatus.equipmentPlan === 'pending'
  );
  if (jobsPendingApproval.length > 0) {
    bottlenecks.push({
      type: 'approval-delay',
      count: jobsPendingApproval.length,
      averageDays: calculateAverageDays(jobsPendingApproval),
      jobs: jobsPendingApproval.map(j => j.jobId),
    });
  }

  // 4. Aging Jobs (>7 days in PSM phase)
  const agingJobs = jobs.filter(j => (j.psmData?.psmPhase.daysInPhase || 0) > 7);
  if (agingJobs.length > 0) {
    bottlenecks.push({
      type: 'aging-jobs',
      count: agingJobs.length,
      averageDays: calculateAverageDays(agingJobs),
      jobs: agingJobs.map(j => j.jobId),
    });
  }

  return bottlenecks;
};

function calculateAverageDays(jobs: Job[]): number {
  const total = jobs.reduce((sum, j) => sum + (j.psmData?.psmPhase.daysInPhase || 0), 0);
  return Math.round(total / jobs.length);
}

/**
 * PSM Analytics
 */
export interface PSMAnalytics {
  totalJobs: number;
  averageTimeToApproval: number; // days
  approvalRate: number; // percentage
  documentationCompleteness: number; // percentage
  redFlagRate: number; // percentage
  topIssues: Array<{ issue: string; count: number }>;
}

export const calculatePSMAnalytics = (jobs: Job[]): PSMAnalytics => {
  const totalJobs = jobs.length;

  // Average time to approval
  const approvedJobs = jobs.filter(j => j.psmData?.psmPhase.status === 'approved');
  const approvalTimes = approvedJobs
    .filter(j => j.psmData?.psmPhase.startedReviewAt && j.psmData?.psmPhase.approvedByAdjusterAt)
    .map(j => {
      const start = j.psmData!.psmPhase.startedReviewAt!.toMillis();
      const end = j.psmData!.psmPhase.approvedByAdjusterAt!.toMillis();
      return (end - start) / (1000 * 60 * 60 * 24);
    });
  const averageTimeToApproval =
    approvalTimes.length > 0
      ? Math.round(approvalTimes.reduce((sum, t) => sum + t, 0) / approvalTimes.length)
      : 0;

  // Approval rate
  const approvalRate = totalJobs > 0 ? Math.round((approvedJobs.length / totalJobs) * 100) : 0;

  // Documentation completeness
  const completeJobs = jobs.filter(j => {
    const missingItems = j.psmData?.documentationReview.missingItems || [];
    return missingItems.length === 0;
  });
  const documentationCompleteness =
    totalJobs > 0 ? Math.round((completeJobs.length / totalJobs) * 100) : 0;

  // Red flag rate
  const jobsWithFlags = jobs.filter(
    j => (j.psmData?.redFlags || []).some(f => !f.resolved)
  );
  const redFlagRate = totalJobs > 0 ? Math.round((jobsWithFlags.length / totalJobs) * 100) : 0;

  // Top issues
  const issueCount: Record<string, number> = {};
  jobs.forEach(j => {
    (j.psmData?.redFlags || []).forEach(flag => {
      if (!flag.resolved) {
        issueCount[flag.type] = (issueCount[flag.type] || 0) + 1;
      }
    });
  });

  const topIssues = Object.entries(issueCount)
    .map(([issue, count]) => ({ issue: issue.replace(/-/g, ' '), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalJobs,
    averageTimeToApproval,
    approvalRate,
    documentationCompleteness,
    redFlagRate,
    topIssues,
  };
};
