# Field App Workflow Feedback & Improvements

## Document Overview
Analysis of MIT Field App workflows for Lead and Tech processes with actionable improvements.

---

## Comments & Questions Addressed

### **Derek Pool's Question: Automatic Daily Inspection Prioritization**

**Q:** "Can the app automatically decide what to inspect each day?"

**Suggested Priority Rules:**
1. **Large Dehumidifier Count** - Projects with >5 Dehus require inspection
2. **Long-Running Jobs** - Projects active >5 days need review
3. **Skipped App Sections** - Any incomplete MIT app steps flagged for review

### **Solution: Smart Job Prioritization System**

```typescript
// Implementation in jobPrioritization.ts
interface InspectionPriority {
  jobId: string;
  priorityScore: number;
  flags: string[];
  recommendedAction: string;
}

function calculateDailyInspections(jobs: Job[]): InspectionPriority[] {
  return jobs
    .map(job => ({
      jobId: job.id,
      priorityScore:
        (job.dehuCount > 5 ? 30 : 0) +
        (job.daysActive > 5 ? 25 : 0) +
        (job.hasSkippedSections ? 20 : 0) +
        (job.hasRedFlags ? 15 : 0),
      flags: buildFlagsList(job),
      recommendedAction: determineAction(job)
    }))
    .filter(p => p.priorityScore > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
```

**Implementation Steps:**
1. Add automated daily priority queue on Lead Dashboard
2. Surface top 5 priority jobs each morning with reason codes
3. Include one-tap "Start Inspection" workflow
4. Track inspection completion rates for accountability

---

## MIT Lead Workflow Improvements

### Current Gaps:
- Manual job selection for spot checks (inefficient)
- No automated alerting for critical conditions
- Equipment verification reactive rather than proactive

### **Recommended Enhancements:**

#### 1. **Automated Job Flagging**
- Auto-flag jobs missing critical data fields
- Real-time alerts for moisture readings trending wrong direction
- Equipment discrepancy detection (scanned vs. documented)

#### 2. **Dashboard Intelligence**
```
Priority Queue Display:
┌─────────────────────────────────────┐
│ TODAY'S PRIORITY INSPECTIONS        │
├─────────────────────────────────────┤
│ 🔴 Job #1234 - 8 Dehus, Day 6      │
│    → Missing Day 5 readings         │
│ 🟠 Job #5678 - Skipped materials    │
│    → Demo step incomplete           │
│ 🟡 Job #9012 - 7 days active        │
│    → Review drying curve            │
└─────────────────────────────────────┘
```

#### 3. **Equipment Tracking Automation**
- GPS-based equipment location tracking
- Auto-match scanned equipment to job assignments
- Alert on unreturned equipment past expected pull date

---

## MIT Tech Workflow Improvements

### Current Process Strengths:
✅ Clear 6-step structure (Office → Property → Front Door → Inside → Leaving → Truck → Office)
✅ Comprehensive documentation requirements
✅ Customer communication built-in

### **Areas for Enhancement:**

#### 1. **Room-by-Room Workflow Optimization**

**Current Issue:** Repetitive room documentation across Install/Demo/Check/Pull

**Solution:** Progressive room profile system
- Room data persists across workflow stages
- Only capture deltas (changes) on subsequent visits
- Pre-populate previous readings for comparison

```typescript
// Example: Smart Room Assessment
interface RoomHistory {
  roomId: string;
  lastReadings: MoistureReading[];
  equipmentAssigned: Equipment[];
  photoTimeline: Photo[];
  changesDetected: boolean;
}

// On CHECK SERVICE - only prompt for changes
if (!room.changesDetected) {
  showQuickConfirm("No changes since last visit?");
} else {
  showFullAssessmentForm();
}
```

#### 2. **Equipment Scanning Efficiency**

**Current:** Scan equipment multiple times (placement, checks, removal)

**Improvement:** Smart scanning with memory
- "Quick Re-scan" option if equipment unchanged
- Batch scanning for rooms with multiple units
- Auto-calculate runtime hours from last scan timestamp

#### 3. **Photo Organization Intelligence**

**Current:** Manual photo labeling and organization

**Enhancement:** Context-aware photo capture
- Auto-tag photos with: room name, workflow step, timestamp
- Suggest photo types based on current step
- Flag missing required photos before step completion

```
Install Step → Suggests:
  ☐ Room overall (4 corners)
  ☐ Thermal imaging
  ☐ Moisture meter readings
  ☐ Equipment placement
```

#### 4. **Partial Demo & Partial Pull Support**

**Current Gap:** Full workflow required, no partial completion

**Solution:** Granular room-level status tracking
- Mark individual rooms as "Demo Complete"
- Support multi-visit demo schedules
- Partial equipment pulls with room-level tracking

---

## Critical Workflow Gaps to Address

### 1. **Ground Rules Document Reference**
**Issue:** Tech workflow references external "Ground Rules" document
**Fix:** Embed quick-reference checklist in app or link to PDF

### 2. **Chamber-to-Room Assignment Clarity**
**Issue:** Chamber definition happens mid-workflow, can cause confusion
**Fix:** Visual chamber builder with drag-drop room assignment

### 3. **Payment Collection Edge Cases**
**Issue:** "Cash jobs only" not clearly defined upfront
**Fix:** Job card flagging + payment workflow only enabled for applicable jobs

### 4. **Matterport Integration**
**Issue:** Manual verification checkbox insufficient
**Fix:** Direct Matterport API integration showing scan status + link

---

## Implementation Priorities

### **Phase 1: High-Impact, Low-Effort** (Sprint 1-2)
1. ✅ Automated daily inspection priority queue
2. ✅ Smart photo capture with auto-tagging
3. ✅ Equipment runtime auto-calculation
4. ✅ Red flag auto-detection for missing data

### **Phase 2: Workflow Intelligence** (Sprint 3-4)
1. Room history persistence across visits
2. Progressive documentation (deltas only)
3. Visual chamber builder
4. Partial demo/pull support

### **Phase 3: Advanced Features** (Sprint 5-6)
1. Equipment GPS tracking
2. Matterport API integration
3. Predictive drying curves
4. ML-based photo quality validation

---

## Technical Implementation Notes

### Files to Modify:
- `src/components/lead/LeadDashboard.tsx` - Add priority queue
- `src/utils/jobPrioritization.ts` - Implement scoring algorithm
- `src/components/shared/UniversalPhotoCapture.tsx` - Add context-aware suggestions
- `src/stores/workflowStore.ts` - Add room history tracking
- `src/components/tech/workflows/install/DefineChambersStep.tsx` - Visual builder

### New Services Needed:
```typescript
// src/services/inspectionPriority.ts
export class InspectionPriorityService {
  calculateDailyPriorities(): InspectionPriority[]
  shouldInspectJob(job: Job): boolean
  getInspectionReason(job: Job): string[]
}

// src/services/roomHistory.ts
export class RoomHistoryService {
  getRoomHistory(jobId: string, roomId: string): RoomHistory
  detectChanges(current: Room, previous: Room): boolean
  getPreviousReadings(roomId: string): MoistureReading[]
}
```

---

## Success Metrics

Track these KPIs to measure improvement:

1. **Lead Efficiency**
   - Time spent finding jobs to inspect (target: -50%)
   - Inspection completion rate (target: 95%+)
   - Equipment discrepancies detected (track reduction)

2. **Tech Productivity**
   - Time per room documentation (target: -30%)
   - Photo re-take rate (target: <5%)
   - Missing data at job completion (target: <2%)

3. **Quality**
   - Jobs flagged for missing info (track reduction)
   - Customer complaint rate (track improvement)
   - Invoice delay due to incomplete docs (target: 0)

---

## Quick Wins (Implement This Week)

1. **Add priority score to existing job cards**
   ```tsx
   {job.priorityScore > 20 && (
     <Badge color="red">Priority Inspection</Badge>
   )}
   ```

2. **Auto-populate equipment scan timestamps**
   ```tsx
   const runtimeHours = (Date.now() - equipment.lastScanTime) / 3600000;
   ```

3. **Photo step suggestions in workflow**
   ```tsx
   const requiredPhotos = WORKFLOW_PHOTO_MAP[currentStep];
   // Show checklist to tech
   ```

---

## Questions for Stakeholder Review

1. **Derek's Proposal:** Should inspection rules be configurable by Lead, or fixed algorithm?
2. **Partial Pulls:** How should equipment removal be tracked when only some rooms are pulled?
3. **Payment Collection:** Should app enforce payment before marking job complete?
4. **Matterport:** Is API access available, or continue manual verification?

---

## Conclusion

The current workflows are comprehensive but can benefit from:
- **Automation** of repetitive decisions (inspection priority)
- **Intelligence** in data capture (context-aware photos, room history)
- **Flexibility** for real-world scenarios (partial demo/pull)

**Recommended Next Step:** Review this document with team, prioritize Phase 1 items, and begin implementation sprint planning.
