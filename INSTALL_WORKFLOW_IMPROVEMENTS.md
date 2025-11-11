# Install Workflow - Feedback & Improvements

## Executive Summary
Analysis of the MIT Tech Install Workflow with actionable improvements to streamline field operations, reduce documentation time, and improve data quality.

---

## Current Install Workflow Overview

### The 6-Step Process
1. **At the Office** - Review jobs, truck prep
2. **At the Property** - Arrival, clock in, review job details
3. **At the Front Door** - Customer intro, ground rules, walkthrough
4. **Inside the House** - Assessment, measurements, equipment placement
5. **Leaving the House** - Final documentation, customer walkthrough, payment
6. **Back at the Truck** - Equipment scanning, verify completion

---

## Derek Pool's Question

**Q:** "Can the app automatically decide what to inspect each day?"

**Suggested Rules:**
- Jobs with >5 Dehumidifiers require inspection
- Jobs running >5 days need review
- Jobs with skipped app sections should be flagged

**Solution:** Automated priority scoring system that flags high-risk jobs for Lead inspection daily.

```typescript
// Auto-calculate inspection priority
const priorityScore =
  (job.dehuCount > 5 ? 30 : 0) +
  (job.daysActive > 5 ? 25 : 0) +
  (job.hasSkippedSections ? 20 : 0);
```

---

## Critical Install Workflow Issues & Solutions

### **Issue 1: Repetitive Room Documentation**

**Current Problem:**
Techs must manually document every room with same steps:
- Name the room
- Take overall photos (4 corners)
- Capture measurements
- Take thermal imaging
- Record moisture meter readings
- Repeat for both affected AND unaffected rooms

**Impact:** 15-20 minutes per room, highly repetitive

**Solution: Smart Room Profiles**

Create persistent room data that carries through entire job lifecycle:

```typescript
interface RoomProfile {
  roomId: string;
  roomName: string;
  isAffected: boolean;
  measurements: {
    length: number;
    width: number;
    height: number;
    squareFootage: number;
  };
  baselinePhotos: Photo[];
  baselineReadings: MoistureReading[];
  chamberId?: string;
}
```

**Implementation:**
- Room created once during initial assessment
- Pre-populate room name suggestions (Kitchen, Master Bedroom, etc.)
- Auto-calculate square footage from L x W
- Photos tagged to room automatically
- Subsequent visits show "No changes since last visit?" quick confirm

**Time Savings:** ~50% reduction in room documentation time

---

### **Issue 2: Chamber Assignment Confusion**

**Current Problem:**
- Chamber definition happens mid-workflow after rooms are documented
- Difficult to visualize which rooms belong to which chamber
- Easy to miss unaffected rooms that can't be closed off

**Solution: Visual Chamber Builder**

Interactive drag-and-drop interface:

```
┌──────────────────────────────────────┐
│ CHAMBER ASSIGNMENT                   │
├──────────────────────────────────────┤
│                                      │
│  CHAMBER 1 (Drying Zone)             │
│  ┌────────────────────────────────┐  │
│  │ ✓ Kitchen                      │  │
│  │ ✓ Dining Room                  │  │
│  │ ✓ Hallway                      │  │
│  └────────────────────────────────┘  │
│                                      │
│  CHAMBER 2 (Drying Zone)             │
│  ┌────────────────────────────────┐  │
│  │ ✓ Master Bedroom               │  │
│  │ ✓ Master Bath                  │  │
│  └────────────────────────────────┘  │
│                                      │
│  UNAFFECTED (Baseline Only)          │
│  ┌────────────────────────────────┐  │
│  │ • Living Room                  │  │
│  │ • Garage                       │  │
│  └────────────────────────────────┘  │
│                                      │
│  [Auto-Calculate Equipment] →        │
└──────────────────────────────────────┘
```

**Features:**
- Visual grouping of rooms
- Drag rooms between chambers
- Highlight unaffected rooms that need baseline readings
- Auto-calculate equipment per chamber based on total SF

**File to Modify:** `src/components/tech/workflows/install/DefineChambersStep.tsx`

---

### **Issue 3: Equipment Calculation & Placement**

**Current Problem:**
- Equipment calc happens after chamber definition
- Techs must manually interpret IICRC recommendations
- Equipment placement documented separately from calculations

**Solution: Integrated Equipment Planning**

Real-time equipment recommendations as chambers are defined:

```typescript
// IICRC S500 Calculations
interface EquipmentRecommendation {
  chamberId: string;
  totalSF: number;
  class: 1 | 2 | 3 | 4;
  dehumidifiers: {
    type: 'LGR' | 'Conventional';
    count: number;
    cfmPerUnit: number;
  };
  airMovers: {
    count: number;
    placement: string[];
  };
  airScrubbers?: {
    count: number;
    reason: string;
  };
}
```

**Display:**
```
CHAMBER 1 - 850 SF (Class 2)
├─ 2x LGR Dehumidifiers
├─ 8x Air Movers
│  ├─ Kitchen: 3 units
│  ├─ Dining: 2 units
│  └─ Hallway: 3 units
└─ 1x Air Scrubber (Cat 3 water)
```

**Improvement:**
- One-tap equipment placement from recommendations
- Visual room layout for equipment positioning
- Generate equipment list for truck prep on next visit

---

### **Issue 4: Photo Documentation Inefficiency**

**Current Problem:**
- No guidance on required photos per step
- Techs forget critical angles
- Photos not auto-organized by room/purpose
- Re-takes common due to poor quality

**Solution: Context-Aware Photo Capture**

Smart photo prompts based on workflow step:

```
📸 INSTALL - Room Assessment Photos

Kitchen
├─ ☐ Overall (4 corners)
│   └─ Tap to capture NE → SE → SW → NW
├─ ☐ Thermal imaging of affected walls
├─ ☐ Moisture meter readings (close-up)
└─ ☐ Water source / cause of loss

[Capture All Required] [Skip Optional]
```

**Features:**
- Auto-tag photos with: room name, workflow step, timestamp
- Required vs. optional photo indicators
- Block step completion if required photos missing
- AI quality check (blur detection, adequate lighting)

**File to Modify:** `src/components/shared/UniversalPhotoCapture.tsx`

---

### **Issue 5: Ground Rules & Customer Communication**

**Current Problem:**
Workflow references external "Ground Rules" 5-step process but doesn't show it in app:
1. Build Rapport
2. Lay the Ground Rules
3. Do Assessment
4. Discover/Uncover pain
5. Offer Solutions/Go Over Roadmap

**Solution: Embedded Communication Script**

Add quick-reference guide in app:

```
🗣️ CUSTOMER GROUND RULES

✓ Introduction
  "Hi, I'm [Name] with Entrusted Restoration"

✓ Purpose of Visit
  "Today we're here to assess the water damage and
   develop a drying plan to get your home back to normal"

✓ Timeline Expectations
  "This assessment will take about [X] hours"
  "Drying typically takes 3-5 days"

✓ What to Expect
  "We'll be taking photos, measurements, and moisture readings"
  "Equipment will run 24/7 - it's loud but necessary"

✓ Access & Communication
  "Who should we contact for access on return visits?"
  "Preferred method: Call / Text / Email?"

[Mark Complete] [View Full Script]
```

---

### **Issue 6: Pre-Existing Conditions Documentation**

**Current Step:** "Identify Pre-existing Conditions - Anything of concern not related to the loss (Damage, Pet Odor, etc.)"

**Problem:** Vague, no structured capture, easy to forget

**Solution: Pre-existing Condition Flags**

```typescript
interface PreExistingCondition {
  type: 'structural' | 'cosmetic' | 'odor' | 'pest' | 'mold' | 'other';
  severity: 'minor' | 'moderate' | 'severe';
  location: string; // room
  description: string;
  photos: Photo[];
  timestamp: Date;
}
```

**UI Enhancement:**
```
⚠️ PRE-EXISTING CONDITIONS

Kitchen
└─ 🔴 Water stain on ceiling (unrelated to loss)
    Photo: [IMG_001.jpg]

Master Bath
└─ 🟡 Cracked tile near tub
    Photo: [IMG_002.jpg]

[+ Add Pre-Existing Condition]
```

**Why Important:** Protects company from liability claims post-job

---

### **Issue 7: Moisture Mapping Workflow**

**Current Problem:**
- Room-by-room evaluation is time-consuming
- "Don't trust water steps" referenced but not defined in app
- Difficult to track edge of damage progression

**Solution: Progressive Damage Mapping**

```
MOISTURE MAPPING WORKFLOW

Start: Cause of Loss Location
└─ Kitchen sink supply line

Expanding Search (work outward):
├─ ✓ Kitchen - AFFECTED (readings 25%+)
├─ ✓ Dining Room - AFFECTED (readings 18%)
├─ ✓ Hallway - MINIMAL (readings 12%)
├─ ✓ Living Room - DRY (readings <10%) ← STOP
└─ ✓ Bedroom 1 - DRY (readings <10%) ← STOP

Edge of Damage Defined ✓
```

**Features:**
- Directional mapping from cause of loss
- Auto-stop prompts when 2+ consecutive dry rooms found
- Visual damage radius map
- Prevent missed affected areas

---

### **Issue 8: Equipment Scanning Timing**

**Current Workflow:** "Equipment Scanning - Scan equipment, assign room (and chamber), take photo"

**Problem:** When should scanning happen?
- Before placement? (not in final location)
- After placement? (equipment already running)
- Separate step from placement?

**Solution: Integrated Scan-and-Place**

```
EQUIPMENT PLACEMENT

Chamber 1 - Kitchen

Dehumidifier #1
├─ [Scan QR Code] →
├─ Location: Kitchen counter
├─ Power source verified: ✓
└─ 📸 Photo (wait 20min for readings)

Air Mover #1
├─ [Scan QR Code] →
├─ Location: Corner near sink
├─ Direction: Toward affected wall
└─ 📸 Photo

[Save & Continue to Next Equipment]
```

**Benefits:**
- Scan and document in one step
- Immediate room/chamber assignment
- Reminder to wait for dehu readings stabilization
- Complete equipment inventory before leaving

---

### **Issue 9: Job Plan Creation**

**Current Step:** "Job Plan: Create the plan for subsequent visits (demo schedule, check services, etc.)"

**Problem:** Too vague, no structure, easy to forget

**Solution: Automated Job Planning**

```typescript
interface JobPlan {
  demoScheduled: boolean;
  demoDate?: Date;
  demoType: 'full' | 'partial' | 'none';
  checkServiceInterval: 'daily' | 'every-2-days' | 'every-3-days';
  estimatedDryingDays: number;
  estimatedPullDate: Date;
  specialInstructions: string[];
}
```

**Auto-Generate Plan:**
```
📅 JOB PLAN

Drying Schedule:
├─ Check Service #1: Nov 13 (2 days)
├─ Check Service #2: Nov 15 (4 days)
└─ Estimated Pull: Nov 17 (6 days)

Demo Required: Yes
├─ Type: Partial (2' flood cut drywall)
├─ Scheduled: Nov 14
└─ Materials: 120 SF drywall, baseboard

Special Notes:
└─ Customer prefers morning visits (8-10am)
└─ Gate code: #1234

[Confirm Plan] [Modify]
```

---

## Install Workflow - Recommended Step Order

### **Current Order Issues:**
- "Mitigate and Install (this step can be done at any point)" - too flexible, causes confusion
- Equipment placement before chamber definition in some flows
- Plan communication happens too late

### **Improved Sequential Order:**

```
INSTALL WORKFLOW (INSIDE THE HOUSE)

1. Identify Pre-Existing Conditions
   └─ Document before any work begins

2. Start at Cause of Loss
   └─ Identify, photograph, classify water category

3. Room-by-Room Moisture Mapping
   └─ Work outward, find edge of damage
   └─ Document affected AND unaffected rooms

4. Define Drying Chambers
   └─ Visual chamber builder
   └─ Group rooms, identify baseline areas

5. Equipment Calculations (Auto)
   └─ IICRC recommendations per chamber
   └─ Review and adjust if needed

6. Develop & Communicate Plan
   └─ Customer conversation BEFORE equipment placement
   └─ Confirm demo needs, timeline, access

7. Light Mitigation (if approved)
   └─ Toe kicks, baseboards, carpet pad
   └─ Only if customer approved in step 6

8. Equipment Placement
   └─ Scan-and-place workflow
   └─ Follow recommendations from step 5

9. Final Documentation
   └─ Equipment photos (wait 20min for dehu readings)
   └─ Job plan creation
   └─ Complete required fields check

10. Customer Sign-Off
    └─ Review plan together
    └─ Confirm next visit date
    └─ Provide contact info
```

**Why This Order Works:**
- Customer communication BEFORE equipment deployment
- Logical flow from assessment → planning → execution
- No backtracking or repeated steps
- Customer involved at right moments

---

## Quick Wins (Implement Immediately)

### **1. Required Photo Checklist**
Add to current Install workflow:
```tsx
const INSTALL_REQUIRED_PHOTOS = {
  'cause-of-loss': ['overall', 'close-up', 'thermal'],
  'room-assessment': ['4-corners', 'moisture-readings'],
  'equipment-placement': ['dehu-with-readings', 'air-mover-layout']
};

// Block step completion if missing
if (!allRequiredPhotosComplete()) {
  showError("Missing required photos");
}
```

**File:** `src/components/tech/workflows/install/ArrivalStep.tsx`

### **2. Auto-Calculate Square Footage**
```tsx
const squareFootage = (length * width).toFixed(0);
// Pre-fill in form, allow manual override
```

**File:** `src/components/tech/workflows/install/AddRoomsStep.tsx`

### **3. Pre-Existing Condition Modal**
Add prominent button at start of assessment:
```tsx
<Button onClick={openPreExistingModal}>
  ⚠️ Document Pre-Existing Condition
</Button>
```

**File:** `src/components/tech/workflows/install/RoomAssessmentStep.tsx`

---

## Implementation Priorities

### **Phase 1: Data Collection Improvements** (Week 1-2)
- ✅ Required photo checklist
- ✅ Auto-calculate square footage
- ✅ Pre-existing condition structured capture
- ✅ Equipment runtime auto-calculation

### **Phase 2: Workflow Intelligence** (Week 3-4)
- ✅ Room profile persistence
- ✅ Visual chamber builder
- ✅ Integrated equipment calc & placement
- ✅ Context-aware photo prompts

### **Phase 3: Customer Experience** (Week 5-6)
- ✅ Embedded ground rules script
- ✅ Automated job planning
- ✅ Progressive moisture mapping
- ✅ Real-time job plan sharing with office

---

## Files to Modify

### High Priority
```
src/components/tech/workflows/install/
├── AddRoomsStep.tsx                 (room profiles, auto-calc)
├── DefineChambersStep.tsx           (visual builder)
├── EquipmentCalcStep.tsx            (integrate with placement)
├── EquipmentPlacementStep.tsx       (scan-and-place)
├── RoomAssessmentStep.tsx           (pre-existing conditions)
├── ArrivalStep.tsx                  (photo requirements)
└── CommunicatePlanStep.tsx          (embedded script)
```

### Supporting Services
```
src/services/
├── roomHistory.ts                   (NEW - persistence)
├── equipmentCalculations.ts         (NEW - IICRC formulas)
└── photoValidation.ts               (NEW - quality checks)
```

### Shared Components
```
src/components/shared/
├── UniversalPhotoCapture.tsx        (context-aware prompts)
├── PreExistingModal.tsx             (structured capture)
└── ChamberBuilder.tsx               (NEW - visual UI)
```

---

## Success Metrics

### **Efficiency Gains**
- **Room documentation time:** Target 50% reduction (currently ~15min/room)
- **Photo re-take rate:** Target <5% (currently ~20%)
- **Equipment placement accuracy:** Target 95%+ match to IICRC calcs

### **Quality Improvements**
- **Missing required photos:** Target 0% (currently ~15% jobs missing photos)
- **Pre-existing documentation:** Target 100% (currently inconsistent)
- **Customer complaints:** Track reduction in "miscommunication" issues

### **Business Impact**
- **Job completion time:** Target 20% faster installs
- **Invoice delays:** Reduce delays due to missing documentation by 80%
- **Re-work rate:** Reduce return visits for missed rooms/equipment by 50%

---

## Questions for Review

1. **Chamber Definition:** Should chamber assignment happen before or after customer communication?
2. **Light Mitigation:** Should toe kick/baseboard removal require explicit customer approval, or implied in plan?
3. **Unaffected Rooms:** What's minimum number of baseline readings required? (Currently unclear)
4. **Equipment Scanning:** Should QR codes be mandatory or allow manual entry as fallback?
5. **Job Plan:** Should estimated pull date auto-sync to scheduling system?

---

## Summary

The Install workflow is comprehensive but can be significantly improved through:

**🎯 Automation** - Auto-calculate SF, equipment, job timelines
**🎯 Intelligence** - Context-aware photos, progressive damage mapping
**🎯 Structure** - Pre-existing conditions, chamber visualization
**🎯 Efficiency** - Room profiles, scan-and-place, required field validation

**Recommended Next Step:** Prioritize Phase 1 quick wins for immediate impact, then build toward Phase 2 workflow intelligence features.
