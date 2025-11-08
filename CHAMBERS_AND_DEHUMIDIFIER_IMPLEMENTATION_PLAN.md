# DRYING CHAMBERS & DEHUMIDIFIER IMPLEMENTATION PLAN
## MIT Dry Logs App - Complete Chambers System Design

**Date:** November 2025
**Status:** PLANNING - Awaiting User Input
**Priority:** HIGH - Core IICRC Compliance Feature

---

## EXECUTIVE SUMMARY

**Current State:** The codebase has chamber TypeScript interfaces defined (`DryingChamber`, `ChamberCalculationInput`, `ChamberCalculationResult`) and calculation utilities in `/src/utils/iicrcCalculations.ts`, but chambers are **NOT** integrated into the Install workflow UI. Equipment calculations currently happen per-job, not per-chamber.

**Problem:**
1. Dehumidifiers are calculated at the job level, not the chamber level (IICRC violation)
2. Temperature & humidity readings are being taken per moisture reading per room (inefficient and non-standard)
3. No UI for techs to define chambers, assign rooms to chambers, or assign equipment to chambers
4. No clear relationship between dehumidifiers and the chambers they serve

**Solution:** Implement a comprehensive drying chamber system that follows IICRC S500 standards and water restoration industry best practices.

---

## TABLE OF CONTENTS

1. [What Are Drying Chambers?](#what-are-drying-chambers)
2. [IICRC Standards Research Summary](#iicrc-standards-research-summary)
3. [Current Codebase Analysis](#current-codebase-analysis)
4. [Workflow Integration Points](#workflow-integration-points)
5. [Temperature & Humidity Reading Strategy](#temperature--humidity-reading-strategy)
6. [Implementation Options](#implementation-options)
7. [Questions for Jason](#questions-for-jason)
8. [Recommended Implementation](#recommended-implementation)
9. [Technical Specifications](#technical-specifications)
10. [Acceptance Criteria](#acceptance-criteria)

---

## WHAT ARE DRYING CHAMBERS?

### Definition

**A drying chamber is a contained airspace where equipment works together to dry materials.** It can be:
- A single room with a closed door
- Multiple connected rooms treated as one zone
- A section of a structure isolated with poly containment barriers
- An entire floor or wing of a building

### Key Principles (IICRC S500-2021)

✅ **Equipment is calculated PER CHAMBER, not per entire job**
✅ **One dehumidifier can serve multiple rooms if they're in the same chamber**
✅ **Temperature and humidity readings are taken PER CHAMBER (ambient conditions)**
✅ **Moisture readings are taken PER ROOM PER MATERIAL (material-specific)**
✅ **Chambers must have adequate air circulation between assigned rooms**

### Real-World Examples

**Example 1: Small Residential**
- **Chamber A:** "Main Floor" (Kitchen + Dining Room + Living Room)
  - 3 rooms, 1,200 cf total
  - 1 LGR dehumidifier (200 PPD)
  - 4 air movers
  - 1 temp/humidity reading per day (ambient for whole chamber)

**Example 2: Large Commercial**
- **Chamber A:** "West Wing - First Floor" (Offices 101-105)
  - 5 rooms, 3,500 cf total
  - 2 LGR dehumidifiers (200 PPD each)
  - 8 air movers
  - 1 temp/humidity reading per day per chamber
- **Chamber B:** "West Wing - Second Floor" (Offices 201-205)
  - Separate calculation, separate readings

**Example 3: Category 3 Water with Containment**
- **Chamber A:** "Contaminated Zone" (Basement bathrooms)
  - Poly containment barriers
  - Negative air pressure
  - 1 LGR dehumidifier + 1 air scrubber
  - Separate temp/humidity monitoring

---

## IICRC STANDARDS RESEARCH SUMMARY

### Research Sources
- ANSI/IICRC S500-2021 Standard for Professional Water Damage Restoration
- IICRC Approved Calculation Sheets (2024)
- Industry publications (Restoration & Remediation Magazine, Cleanfax)
- Existing codebase documentation (`IICRC_EQUIPMENT_CALCULATIONS.md`)

### Key Findings

#### 1. Chamber-Based Calculations (IICRC S500 Section 12.1.22)

> "Equipment calculations should be performed for each drying chamber based on the total cubic footage and affected surface area within that chamber."

**What This Means:**
- Calculate cubic footage for ALL rooms in the chamber combined
- Apply IICRC chart factors to chamber total, not individual rooms
- Place equipment strategically within the chamber to serve all rooms

#### 2. Psychrometric Monitoring (IICRC S500 Section 12.1.24)

> "Restorers should monitor temperature, humidity, and drying progress using psychrometric instruments."

**Standard Practice:**
- **Ambient conditions (temp/humidity):** 1 reading per chamber per day
- **Material moisture readings:** 3-5 readings per room per material type per day
- Readings should be taken at consistent times and locations

#### 3. Equipment Adjustment Triggers (IICRC S500 Section 12.1.25)

> "If moisture measurements do not confirm satisfactory drying, restorers should adjust drying procedures and equipment placement, or possibly add or change equipment."

**Red Flags Requiring Adjustment:**
- No moisture reduction after 48 hours
- Humidity above 50% RH after 72 hours
- Temperature outside 70-90°F range
- Uneven drying between rooms in same chamber

#### 4. Dehumidifier Capacity per Chamber

**Chart Factors (LGR Dehumidifiers):**
| Water Class | Cubic Feet per PPD |
|-------------|-------------------|
| Class 1 | 100 cf/PPD |
| Class 2 | 50 cf/PPD |
| Class 3 | 40 cf/PPD |
| Class 4 | 40 cf/PPD |

**Example:**
- Chamber with 2,000 cf, Class 2 damage
- 2,000 cf ÷ 50 = 40 PPD required
- 40 PPD ÷ 200 PPD (per dehumidifier) = 0.2 → **1 dehumidifier**

---

## CURRENT CODEBASE ANALYSIS

### What's Already Built ✅

#### 1. TypeScript Types (`/src/types/index.ts`)

```typescript
export interface DryingChamber {
  chamberId: string;
  chamberName: string;
  assignedRooms: string[];              // Room IDs in this chamber
  deploymentDate: Timestamp;
  removalDate?: Timestamp;
  status: EquipmentStatus;
  dehumidifiers: Dehumidifier[];        // Equipment assigned to chamber
  airMovers: AirMover[];
  airScrubbers: AirScrubber[];
}

export interface JobEquipment {
  chambers: DryingChamber[];            // Array of chambers
  calculations: EquipmentCalculations;
}

export interface Room {
  // ... other fields
  dryingChamber?: string;               // Chamber ID this room belongs to
  // ... other fields
}
```

#### 2. Calculation Utilities (`/src/utils/iicrcCalculations.ts`)

```typescript
// Already implemented!
export function calculateChamberEquipment(
  input: ChamberCalculationInput
): ChamberCalculationResult {
  // Calculates dehumidifiers, air movers, air scrubbers
  // Based on all rooms in the chamber combined
}
```

#### 3. Equipment Calculation Step (`/src/components/tech/workflows/install/EquipmentCalcStep.tsx`)

**Currently:** Calculates equipment for entire job
**Should:** Calculate equipment per chamber

### What's Missing ❌

1. **No UI to create/manage chambers in Install workflow**
2. **No UI to assign rooms to chambers**
3. **No chamber selection in Equipment Calculation step**
4. **No chamber-specific temp/humidity readings**
5. **Moisture readings don't distinguish between chamber ambient vs. material-specific**
6. **Equipment deployment doesn't ask "which chamber?"**
7. **Check Service workflow doesn't have chamber-level readings**

---

## WORKFLOW INTEGRATION POINTS

### Install Workflow - Where Chambers Fit

```
INSTALL WORKFLOW (17 steps):
├─ 1. Office Preparation
├─ 2. Arrival
├─ 3. Front Door
├─ 4. Cause of Loss
├─ 5. Water Classification
├─ 6. Add Rooms               ✓ Rooms created here
├─ 7. Room Evaluation
├─ 8. Affected Materials
├─ 9. Moisture Mapping
├─ 10. Plan the Job
├─ 🆕 10.5 DEFINE CHAMBERS     ← NEW STEP (or part of step 10)
├─ 11. Equipment Calculations  ← MODIFIED: Calculate per chamber
├─ 12. Equipment Deployment    ← MODIFIED: Assign equipment to chambers
├─ 13. Environmental Baseline  ← MODIFIED: Take chamber ambient readings
├─ 14. Partial Demo (if needed)
├─ 15. General Billables
├─ 16. Schedule Work
├─ 17. Complete

Check Service Workflow:
├─ 1. Arrival
├─ 2. Environmental Check      ← MODIFIED: Chamber-level temp/humidity
├─ 3. Moisture Readings        ← Material-specific, per room
├─ 4. Equipment Status
├─ 5. Equipment Adjustments    ← Can adjust per chamber
├─ 6. Complete
```

---

## TEMPERATURE & HUMIDITY READING STRATEGY

### Industry Standard Practice

| Reading Type | Frequency | Location | Purpose |
|-------------|-----------|----------|---------|
| **Ambient Temp/Humidity** | 1x per chamber per day | Center of chamber or near dehumidifier | Monitor drying conditions |
| **Material Moisture** | 3-5x per room per day | Specific materials (drywall, subfloor, etc.) | Track drying progress |
| **Psychrometric Data** | 1x per chamber per day | Using thermo-hygrometer | Calculate vapor pressure |

### Current Implementation Problem

**Current (WRONG):**
```typescript
// Moisture reading form asks for temp/humidity EVERY TIME
interface MoistureReading {
  material: string;
  moisturePercentage: number;
  temperature: number;          // ❌ Asked per reading
  humidity: number;              // ❌ Asked per reading
  readingType: string;
}
```

**What Happens:** Tech takes 20 moisture readings in 5 rooms and has to enter temperature/humidity 20 times (same value!)

**Correct Approach:**
```typescript
// Chamber-level ambient reading (once per chamber per day)
interface ChamberAmbientReading {
  chamberId: string;
  temperature: number;
  humidity: number;
  timestamp: Timestamp;
  takenBy: string;
}

// Material-specific reading (no temp/humidity)
interface MoistureReading {
  material: string;
  moisturePercentage: number;
  readingType: string;
  chamberId: string;  // Links to chamber for ambient conditions
}
```

### Proposed Solution

**Option A: Separate Step (Preferred)**
- Add "Environmental Check" step before moisture readings
- Tech enters temp/humidity once per chamber
- All moisture readings in that chamber reference this ambient reading

**Option B: Smart Default**
- First moisture reading in a chamber prompts for temp/humidity
- Subsequent readings in same chamber auto-fill with same values
- Tech can override if conditions changed

**Option C: Dehumidifier Reading**
- Temp/humidity entered once per dehumidifier (they have built-in sensors)
- All rooms served by that dehumidifier inherit the reading

---

## IMPLEMENTATION OPTIONS

### OPTION 1: AUTOMATIC CHAMBER CREATION (Simplest)

**How It Works:**
- System automatically creates 1 chamber per job by default
- Chamber name: "Main Drying Area"
- All rooms automatically assigned to this chamber
- Tech can split into multiple chambers if needed (advanced option)

**Pros:**
- ✅ Minimal workflow disruption
- ✅ Works for 80% of residential jobs (single chamber)
- ✅ Tech doesn't need to understand chambers
- ✅ Easy to implement

**Cons:**
- ❌ Not accurate for large jobs
- ❌ Doesn't support containment zones
- ❌ Doesn't match IICRC best practices for complex jobs

---

### OPTION 2: GUIDED CHAMBER CREATION (Recommended)

**How It Works:**
- After "Plan the Job" step, new step: "Define Drying Chambers"
- System suggests chambers based on:
  - Room adjacency (rooms near each other = same chamber)
  - Water category (Category 3 = separate chamber)
  - Floor level (different floors = different chambers)
- Tech reviews suggestions and can:
  - Accept default (1 chamber for whole job)
  - Accept suggested chambers
  - Manually create/edit chambers
- Visual drag-and-drop interface to assign rooms to chambers

**Example UI:**
```
┌─────────────────────────────────────────────────────┐
│ Define Drying Chambers                              │
├─────────────────────────────────────────────────────┤
│ We recommend 2 chambers for this job:              │
│                                                      │
│ 📦 Chamber A: "Main Floor"                          │
│    └─ Kitchen, Living Room, Dining Room            │
│    └─ 1,800 cf total                               │
│    └─ Water Category: 1                             │
│                                                      │
│ 📦 Chamber B: "Basement" (CONTAINMENT)             │
│    └─ Basement Bathroom, Laundry Room              │
│    └─ 900 cf total                                 │
│    └─ Water Category: 3 (requires isolation)       │
│                                                      │
│ [Accept Recommendations] [Customize Chambers]      │
└─────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ IICRC compliant
- ✅ Accurate for complex jobs
- ✅ Educates techs about chambers
- ✅ Supports containment zones
- ✅ Flexible for all job types

**Cons:**
- ❌ Additional workflow step
- ❌ Requires tech training
- ❌ More complex UI

---

### OPTION 3: CHAMBER-FREE SIMPLIFIED MODEL (Not Recommended)

**How It Works:**
- No chambers in UI at all
- Calculate equipment per room individually
- Sum all equipment for total job requirements
- Take temp/humidity readings per room (not per chamber)

**Pros:**
- ✅ Simplest possible UI
- ✅ No new concepts for techs

**Cons:**
- ❌ NOT IICRC COMPLIANT
- ❌ Over-calculates equipment (expensive)
- ❌ Inefficient data entry
- ❌ Can't support containment properly
- ❌ Doesn't match industry standard practice

---

## QUESTIONS FOR JASON

Please answer these questions so I can finalize the implementation plan:

### 1. Chamber Creation Approach

**Which option do you prefer?**
- [ ] **Option 1:** Automatic (1 chamber per job, can split if needed)
- [ ] **Option 2:** Guided (system suggests, tech reviews/customizes)
- [ ] **Option 3:** Manual only (tech creates all chambers from scratch)
- [ ] **Other:** ______________________________

**Follow-up:** How often do your jobs require multiple chambers?
- [ ] Rarely (< 10% of jobs)
- [ ] Sometimes (10-30% of jobs)
- [ ] Frequently (30-50% of jobs)
- [ ] Almost always (> 50% of jobs)

### 2. Temperature & Humidity Readings

**Where should temp/humidity be entered?**
- [ ] **Option A:** Separate "Environmental Check" step (once per chamber per visit)
- [ ] **Option B:** First moisture reading prompts, then auto-fills for subsequent readings
- [ ] **Option C:** Per dehumidifier (since they have built-in sensors)
- [ ] **Option D:** Keep current approach (per moisture reading) - NOT RECOMMENDED

**Follow-up:** Do your dehumidifiers have digital displays showing temp/humidity?
- [ ] Yes, all of them
- [ ] Some do, some don't
- [ ] No, we use separate hygrometers
- [ ] I don't know

### 3. Workflow Integration

**Where should "Define Chambers" step go?**
- [ ] **After Step 10** (Plan the Job) - as Step 10.5
- [ ] **Part of Step 10** (Plan the Job) - embedded in same step
- [ ] **After Step 11** (Equipment Calculations) - adjust chambers after seeing equipment needs
- [ ] **Other:** ______________________________

### 4. Equipment Assignment

**When equipment is scanned/deployed, should tech select which chamber?**
- [ ] **Yes, always** - Tech must select chamber for every piece of equipment
- [ ] **Yes, but default to nearest chamber** - System suggests, tech can override
- [ ] **No, assign automatically** - System assigns based on room location
- [ ] **Other:** ______________________________

### 5. Check Service Workflow

**How should Check Service handle chambers?**
- [ ] **Option A:** Show chamber-level summary first, then drill into rooms
- [ ] **Option B:** Show all rooms flat, but group by chamber visually
- [ ] **Option C:** Let tech choose chamber, then see rooms in that chamber
- [ ] **Other:** ______________________________

### 6. Chamber Naming

**How should chambers be named by default?**
- [ ] **By floor level:** "First Floor", "Second Floor", "Basement"
- [ ] **By location:** "East Wing", "West Wing", "Main Area"
- [ ] **Generic numbers:** "Chamber A", "Chamber B", "Chamber C"
- [ ] **Let tech name them freely** (no default)
- [ ] **Other:** ______________________________

### 7. Containment Zones

**Do you use poly containment barriers for Category 2/3 water?**
- [ ] Yes, frequently (need to track containment in app)
- [ ] Sometimes (optional feature)
- [ ] Rarely (don't need this feature)
- [ ] No, never

**Follow-up if Yes:** Should containment setup be a required step in Install workflow?
- [ ] Yes, required for Category 2/3
- [ ] No, just document it in notes

### 8. Complexity vs. Simplicity

**Rate your preference (1-5):**

**I prefer accuracy and IICRC compliance (even if more complex):**
1 (Simple) ☐☐☐☐☐ 5 (Accurate)

**I prefer speed and ease of use (even if less precise):**
1 (Accurate) ☐☐☐☐☐ 5 (Simple)

**My techs are comfortable with technology:**
1 (Struggle) ☐☐☐☐☐ 5 (Excel)

### 9. Current Pain Points

**What's frustrating about the current equipment/readings workflow?**
(Free text)
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

### 10. Future Considerations

**Will you need to track equipment movement between chambers?**
- [ ] Yes (equipment can be moved between chambers during drying)
- [ ] No (equipment stays in assigned chamber until pull)
- [ ] Maybe (not sure yet)

---

## RECOMMENDED IMPLEMENTATION

**Based on IICRC standards and industry best practices, I recommend:**

### Phase 1: Core Chamber System (Week 1-2)

**1.1 Add Chamber Management Step (Install Workflow Step 10.5)**
- Appears after "Plan the Job"
- System suggests 1-3 chambers based on:
  - Floor level (different floors = different chambers)
  - Water category (Category 3 = separate containment chamber)
  - Total cubic footage (> 5,000 cf → consider splitting)
- Tech can accept default (1 chamber) or customize
- Drag-and-drop interface to assign rooms to chambers
- Chamber naming: "First Floor", "Basement", etc.

**1.2 Update Equipment Calculation Step (Step 11)**
- Calculate equipment PER CHAMBER (not whole job)
- Show breakdown by chamber:
  ```
  Chamber A (First Floor - 3 rooms):
  - 2,400 cf total
  - 2 dehumidifiers (200 PPD LGR)
  - 6 air movers
  - 0 air scrubbers (Category 1 water)

  Chamber B (Basement - 2 rooms):
  - 1,200 cf total
  - 1 dehumidifier (200 PPD LGR)
  - 4 air movers
  - 1 air scrubber (Category 2 water)

  Total Equipment: 3 dehumidifiers, 10 air movers, 1 air scrubber
  ```

**1.3 Update Equipment Deployment Step (Step 12)**
- When scanning equipment, prompt: "Which chamber?"
- Show map/list of chambers with room names
- Default to "Chamber A" if only one chamber

**1.4 Add Chamber Ambient Reading (New Feature)**
- New step: "Environmental Baseline" (Step 13)
- Tech enters temp/humidity ONCE per chamber
- Timestamp recorded
- Used for all moisture readings in that chamber
- Can update if conditions change

### Phase 2: Check Service Integration (Week 3)

**2.1 Environmental Check Step**
- Show each chamber as a card
- Current temp/humidity
- Last reading timestamp
- Update button for each chamber
- Historical chart of conditions

**2.2 Moisture Readings Step**
- Grouped by chamber
- Shows chamber ambient conditions at top
- Material readings below (no temp/humidity entry)

**2.3 Equipment Adjustment Step**
- Show chambers with current equipment
- Allow adding/removing equipment per chamber
- Show calculation recommendations per chamber

### Phase 3: Advanced Features (Week 4-5)

**3.1 Containment Tracking**
- Checkbox: "This chamber has containment barriers"
- Photo documentation of containment setup
- Negative pressure verification checklist

**3.2 Chamber Performance Metrics**
- Drying progress chart per chamber
- Comparison: Chamber A vs Chamber B drying rate
- Red flag detection: "Chamber B not drying as expected"

**3.3 Equipment Movement Tracking**
- Move equipment between chambers
- Track movement history
- Update calculations automatically

---

## TECHNICAL SPECIFICATIONS

### Database Schema Changes

**Firestore Collections:**

```typescript
// No changes to collections - use existing Job document structure

// Jobs > {jobId} document structure:
{
  equipment: {
    chambers: [
      {
        chamberId: "chamber-001",
        chamberName: "First Floor",
        assignedRooms: ["room-1", "room-2", "room-3"],
        deploymentDate: Timestamp,
        status: "active",
        hasContainment: false,
        dehumidifiers: [
          { serialNumber: "DH-2024-001", scanCode: "QR-001", deploymentTime: Timestamp }
        ],
        airMovers: [ /* ... */ ],
        airScrubbers: [ /* ... */ ],
        ambientReadings: [
          {
            timestamp: Timestamp,
            temperature: 72,
            humidity: 48,
            takenBy: "tech-uid-123"
          }
        ]
      }
    ],
    calculations: {
      // Existing structure, but add perChamber breakdown
      perChamber: {
        "chamber-001": {
          cubicFootage: 2400,
          dehumidifiers: 2,
          airMovers: 6,
          airScrubbers: 0,
          formula: "2400 cf ÷ 50 = 48 PPD ÷ 200 = 2 units"
        }
      }
    }
  },
  rooms: [
    {
      roomId: "room-1",
      roomName: "Kitchen",
      dryingChamber: "chamber-001",  // Links to chamber
      // ... existing fields
    }
  ]
}
```

### API Changes

**New Functions:**

```typescript
// /src/services/firebase/chambers.ts (NEW FILE)

export async function createChamber(
  jobId: string,
  chamberData: Partial<DryingChamber>
): Promise<string> { /* ... */ }

export async function assignRoomsToChamber(
  jobId: string,
  chamberId: string,
  roomIds: string[]
): Promise<void> { /* ... */ }

export async function addAmbientReading(
  jobId: string,
  chamberId: string,
  reading: ChamberAmbientReading
): Promise<void> { /* ... */ }

export async function getChambersForJob(
  jobId: string
): Promise<DryingChamber[]> { /* ... */ }
```

### UI Components

**New Components:**

```
/src/components/tech/workflows/install/
  ├─ DefineCh ambersStep.tsx              (NEW - Step 10.5)
  ├─ ChamberCard.tsx                     (NEW - Reusable chamber display)
  ├─ ChamberSuggestionEngine.tsx         (NEW - Smart chamber suggestions)
  └─ RoomAssignmentDragDrop.tsx          (NEW - Drag rooms to chambers)

/src/components/tech/workflows/check-service/
  ├─ ChamberAmbientReadingForm.tsx       (NEW - Temp/humidity per chamber)
  └─ ChamberPerformanceDashboard.tsx     (NEW - Chamber comparison)

/src/components/shared/
  └─ ChamberSelector.tsx                 (NEW - Select chamber dropdown)
```

### Modified Components

```typescript
// EquipmentCalcStep.tsx - Calculate per chamber
// Equipment DeploymentStep.tsx - Add chamber selection
// EnvironmentalBaselineStep.tsx - Add chamber ambient readings
// MoistureReadingForm.tsx - Remove temp/humidity fields (use chamber ambient)
```

---

## ACCEPTANCE CRITERIA

### Definition of Done

**Phase 1 Complete When:**
- [ ] Tech can create 1-5 chambers per job
- [ ] Tech can assign rooms to chambers (drag-and-drop)
- [ ] Equipment calculations happen per chamber
- [ ] Equipment deployment asks "which chamber?"
- [ ] Ambient temp/humidity entered once per chamber
- [ ] Moisture readings NO LONGER ask for temp/humidity
- [ ] Install workflow builds successfully
- [ ] All TypeScript errors resolved

**Phase 2 Complete When:**
- [ ] Check Service workflow shows chambers
- [ ] Environmental Check step updates chamber ambient conditions
- [ ] Moisture readings grouped by chamber
- [ ] Equipment adjustments can happen per chamber

**Phase 3 Complete When:**
- [ ] Containment tracking implemented
- [ ] Equipment movement between chambers tracked
- [ ] Chamber performance metrics dashboard
- [ ] PSM Dashboard shows chamber-level data

### Testing Checklist

**Scenarios to Test:**
1. Single-chamber residential job (3 rooms, 1 chamber)
2. Multi-chamber residential (2 floors = 2 chambers)
3. Commercial job with containment (Category 3 water separate chamber)
4. Job where chambers are adjusted mid-drying
5. Check Service with temp/humidity updates per chamber
6. Equipment movement from Chamber A to Chamber B

---

## NEXT STEPS

### 1. Jason Answers Questions Above
- Review all questions in "Questions for Jason" section
- Provide answers and preferences
- Add any additional requirements

### 2. I Finalize Design
- Incorporate Jason's feedback
- Create detailed wireframes
- Write user stories for each feature

### 3. Begin Development
- Phase 1: Core chamber system (2 weeks)
- Phase 2: Check Service integration (1 week)
- Phase 3: Advanced features (2 weeks)

### 4. Testing & Iteration
- Test with real jobs
- Gather tech feedback
- Refine UI/UX

---

## APPENDIX A: IICRC COMPLIANCE CHECKLIST

**This implementation will ensure:**
- ✅ Equipment calculated per drying chamber (S500 Section 12.1.22)
- ✅ Psychrometric monitoring per chamber (S500 Section 12.1.24)
- ✅ Proper chart factors applied (S500 Appendix B)
- ✅ Adjustment triggers monitored (S500 Section 12.1.25)
- ✅ Containment zones documented (Category 2/3 requirements)
- ✅ Equipment deployment tracked and verified
- ✅ Historical data for adjuster negotiations

---

## APPENDIX B: REFERENCE MATERIALS

### IICRC Documents Consulted
- ANSI/IICRC S500-2021 Standard (Sections 12.1.22 - 12.1.26)
- IICRC Approved Calculation Sheets (Rev 3.1.22)
- US Imperial Initial Dehumidification Recommendation Factors

### Industry Best Practices
- "The IICRC S500 Approach to Determining Initial Equipment Usage" (R&R Magazine, 2007)
- "Ten Steps to Dry according to IICRC S500 Standard" (Coast View Restoration)
- "Dehumidification Capacity in Structural Drying" (C&R Magazine)

### Existing Codebase Files
- `/src/types/index.ts` - Lines 327-398 (DryingChamber interfaces)
- `/src/utils/iicrcCalculations.ts` - Lines 223-333 (calculateChamberEquipment function)
- `/IICRC_EQUIPMENT_CALCULATIONS.md` - Full equipment calculation documentation

---

**END OF PLAN DOCUMENT**

**Status:** Awaiting Jason's input on questions above
**Next Action:** Jason reviews and answers questions
**Timeline:** Implementation can begin 24-48 hours after approval

---

**Built on Trust. Excellence is the standard.**
