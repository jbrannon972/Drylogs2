# Photo Documentation Implementation Plan
## Based on Workflow Feedback - Ready for Development

**Document Version:** 1.0
**Date:** November 9, 2025
**Status:** APPROVED - Ready for Implementation

---

## Executive Summary

This document translates stakeholder feedback into concrete implementation specifications for photo documentation enhancements across all 4 workflows. All requirements are based on approved feedback from the comprehensive workflow analysis.

**Core Principle:** TRACKED MATERIALS SYSTEM
- Materials tracked from Install → Check Service → Pull
- Track by room + material type (e.g., "Master Bedroom - Wall Drywall")
- Once material reaches dry standard, stop tracking it
- Photos linked across all workflows by room and material

---

## Table of Contents

1. [Tracked Materials System (Cross-Workflow)](#tracked-materials-system)
2. [Install Workflow Photo Requirements](#install-workflow)
3. [Demo Workflow Photo Requirements](#demo-workflow)
4. [Check Service Workflow Photo Requirements](#check-service-workflow)
5. [Pull Workflow Photo Requirements](#pull-workflow)
6. [Implementation Phases](#implementation-phases)

---

## Tracked Materials System (Cross-Workflow)

### Overview
**THE BIGGEST CHANGE:** Implement a system that tracks materials across all workflows to prove drying progression.

### How It Works

#### Install Workflow - Creating Tracked Materials
When tech takes moisture readings during room assessment:
1. Material is above dry standard → **Auto-add to tracked materials list**
2. Store: Room name, Material type, Initial moisture %, Photo, Date/Time
3. Optional: Tech can add notes for next visit (e.g., "behind toilet, 2 inches from floor")

**Example:**
- Room: Master Bedroom
- Material: Wall Drywall
- Initial Reading: 32%
- Photo: [meter showing 32% + wall being tested]
- Notes: "Left side near window"
- Status: WET - Track on next visit

#### Check Service Workflow - Following Tracked Materials
When tech starts Check Service:
1. System shows list of all tracked materials (grouped by room)
2. Tech goes room-by-room testing SAME materials
3. For each material:
   - Take new moisture reading
   - Photo with meter visible
   - If ≤ dry standard: Mark as DRY (stop tracking)
   - If > dry standard: Keep tracking
4. Tech can add additional materials if new wet spots found

**Example:**
Visit 2:
- Master Bedroom - Wall Drywall: 28% → Photo → Still WET
Visit 4:
- Master Bedroom - Wall Drywall: 14% → Photo → MARKED DRY (stop tracking)

#### Pull Workflow - Final Verification
1. System shows remaining tracked materials (anything not marked dry)
2. Tech verifies each one is ≤ dry standard
3. Photos required for final proof
4. If material still wet → Option to create Drying Release Waiver (DRW)

### Multiple Readings Per Material
**Important:** Tech may test same material multiple times in one visit
- Example: Test 5 spots on wall drywall
- Record HIGHEST reading (e.g., 28%)
- Take photos of ALL wet readings (5 photos)
- Store all photos, but primary reading is the highest

### Data Structure

```typescript
interface TrackedMaterial {
  id: string;
  jobId: string;
  roomName: string;
  materialType: string; // "Wall Drywall", "Subfloor", "Carpet Pad", etc.

  // Initial reading (from Install)
  initialReading: {
    moisturePercent: number;
    photoUrl: string;
    timestamp: Date;
    notes?: string;
  };

  // Subsequent readings (from Check Service visits)
  readings: Array<{
    visitNumber: number;
    moisturePercent: number;
    photoUrls: string[]; // Multiple photos if multiple test spots
    timestamp: Date;
    notes?: string;
  }>;

  // Final reading (from Pull)
  finalReading?: {
    moisturePercent: number;
    photoUrl: string;
    timestamp: Date;
    markedDry: boolean;
  };

  status: 'WET' | 'DRY' | 'DRW'; // DRW = Drying Release Waiver
  dryStandard: number; // e.g., 15 for drywall, 12 for wood
}
```

### UI Flow

#### Install - Room Assessment Step
After tech enters room dimensions:
1. **Overall Photos** (4+ required)
   - Wide shot
   - Damage close-ups (2+)

2. **Thermal Imaging** (if needed)
   - "Do you want to capture thermal images for this room?"
   - If YES → Photo capture for thermal imaging

3. **Moisture Readings**
   - For each reading:
     - Select material type
     - Enter moisture %
     - **Required:** Photo with meter showing reading
     - Optional: Notes for next visit
   - If moisture > dry standard → Auto-added to tracked materials list

#### Check Service - Room Readings Step
1. System displays: "You have 12 tracked materials to verify"
2. Group by room:
   ```
   Master Bedroom (3 materials)
   - Wall Drywall (was 32%)
   - Subfloor (was 45%)
   - Carpet Pad (was 38%)

   Guest Bath (2 materials)
   - Wall Drywall (was 28%)
   - Floor Tile (was 22%)
   ```
3. Tech clicks room → Shows tracked materials for that room
4. For each material:
   - Display previous reading
   - Display previous photo (for reference)
   - Show notes from last visit
   - **New Reading Input:**
     - Moisture %
     - Photo (required)
     - If ≤ dry standard → "Mark as DRY?"
     - Optional: Updated notes
5. Option to add new materials if found

#### Pull - Final Moisture Verification Step
1. Show all remaining WET materials
2. For each:
   - Display history (Install 32% → Visit 2 28% → Visit 4 18%)
   - Require final reading
   - Require final photo
   - Must be ≤ dry standard OR create DRW
3. If all dry → Proceed
4. If any still wet → Prompt:
   ```
   WARNING: 2 materials still above dry standard
   - Master Bedroom - Wall Drywall: 16% (standard: 15%)
   - Guest Bath - Subfloor: 14% (standard: 12%)

   Options:
   [ ] Continue drying (reschedule pull)
   [ ] Create Drying Release Waiver (customer accepts risk)
   ```

---

## Install Workflow Photo Requirements

### Step 1: Property Arrival
**Current:** Truck photo, exterior building
**Keep as-is** ✅

### Step 2: Customer Introduction
**Current:** Front entrance
**Keep as-is** ✅

### Step 3: Cause of Loss
**Current:** Water source photo
**Keep as-is** ✅

### Step 4: Room Assessment ⚠️ MAJOR CHANGES

**Current:** All photos optional
**NEW:** Structured photo requirements per room

#### Flow Per Room:
1. **Room Dimensions** (L×W×H)

2. **Pre-Existing Damage Check**
   - Prompt: "Does this room have pre-existing damage?"
   - If YES → **Require photos** (as many as needed)
   - If NO → Skip

3. **Overall Photos** (REQUIRED - MINIMUM 4)
   - Prompt: "Capture overall room condition"
   - Required:
     - 1 wide shot
     - 2+ damage close-ups
     - 1+ moisture-affected area
   - Cannot proceed to next room without 4+ photos

4. **Thermal Imaging** (NEW LOCATION - moved from Step 3)
   - Prompt: "Do you want to capture thermal images for this room?"
   - If YES → Photo capture interface
   - Photos to capture:
     - Thermal image showing moisture migration
     - Thermal of hidden areas (behind baseboards, walls, ceiling)
   - **Only during Install workflow** (not repeated on Pull)

5. **Moisture Readings**
   - For each reading:
     - Select material type (dropdown)
     - Enter moisture %
     - **REQUIRED: Photo showing meter display + material being tested**
     - **MINIMUM: 2 moisture reading photos per room**
     - Optional: Notes for tracking
   - If moisture > dry standard → Auto-add to tracked materials
   - Can take multiple photos per material (record highest reading)

6. **Material Assessment** (existing 42+ materials)
   - Mark affected/removal
   - Link to moisture readings

**Blocking Logic:**
- Cannot proceed without 4+ overall photos
- Cannot proceed without 2+ moisture reading photos (if room has moisture)
- If pre-existing damage flagged, must have photos

### Step 5: Define Drying Chambers
**NEW:** Chamber containment documentation

Prompt per chamber:
```
Has a containment barrier been set up to reduce chamber size?
[ ] YES
[ ] NO

If YES:
- Photo of containment barrier setup (REQUIRED)
- Plastic used (sq ft): _____
- Zipper door used? YES/NO
- Zip poles used? YES/NO → If YES, how many? _____
```

### Step 6: Partial Demo
**Current:** Optional demo progress photos
**CHANGE:** If "Was demo completed?" = YES → Launch mini demo workflow
- Mini demo = simplified version of full Demo workflow
- Captures: Pre-demo photos, post-demo photos, debris documentation

### Step 12: Final Photos ⚠️ ENHANCED

**Current:** 4+ equipment setup photos
**NEW:** Room-by-room equipment documentation with QR scanning

Flow:
1. Prompt: "Walk through each room with equipment"
2. For each room:
   - Overall photo showing equipment placement
   - Scan QR code on each piece of equipment (tracks location)
   - Dehumidifier: Photo showing display (settings at runtime 0)
   - Air movers: Photo showing placement relative to materials
   - Air scrubbers (if Cat 2/3): Photo showing placement
3. Final overall showing entire setup

**Blocking Logic:** Cannot complete without scanning all deployed equipment

### Step 13: Complete
**Keep as-is** ✅

---

## Demo Workflow Photo Requirements

### Step 1: Clock In
**Keep as-is** ✅

### Step 2: Pre-Demo Photos
**Keep as-is** ✅

### Step 3: Demo Execution
**Keep as-is** (room-by-room tracking)

### Step 4: Exposed Materials ⚠️ ENHANCED
**Current:** Assessment of newly exposed areas
**NEW:** **MANDATORY photos** of hidden damage

Prompt:
```
For each room with demo work:
- Wall cavities: Photo required if exposed
- Subfloor: Photo required if exposed
- Structural damage: Photo required if found (rot, warping)
- Insulation: Photo required if contaminated

Tag all photos as "Post-Demo - Exposed Materials"
```

**Blocking Logic:** If demo occurred in room, must have exposed materials photos

### Step 5: Post-Demo Readings ⚠️ ENHANCED
**Current:** Moisture logged, photos optional
**NEW:** **REQUIRED photos** with meter display

- For each newly exposed material:
  - Select material type
  - Enter moisture %
  - **REQUIRED: Photo with meter + exposed material**
  - If > dry standard → Add to tracked materials

### Step 6: Debris & Disposal ⚠️ ENHANCED
**Current:** Mentions dumpster/debris but doesn't enforce
**NEW:** Disposal method-specific photo requirements

Prompt:
```
Select disposal method:
[ ] Dumpster → Photo of full dumpster with load visible (REQUIRED)
[ ] Bags → Photo of bags + count (REQUIRED) → "How many bags?" _____
[ ] Loose materials → "Any materials not in bags?"
    If YES → Photo required + description
[ ] Other → Photo + description
```

### Step 7: PPE & Supplies ⚠️ MAJOR EXPANSION NEEDED
**Current:** Basic tracking
**NEW:** Comprehensive PPE documentation with photos

**RESEARCH REQUIRED:** Expand this step with industry-standard PPE questions
- Not just Cat 3 jobs - all jobs need proper PPE documentation
- Photo requirements for containment barriers, PPE in use, safety signage

**Prompt:**
```
PPE & Safety Measures:
- [ ] Respirators used? → Photo
- [ ] Protective suits? → Photo
- [ ] Gloves? → Type: _____
- [ ] Eye protection?
- [ ] Containment barriers? → Photo
- [ ] Negative air pressure? → Photo of equipment
- [ ] Safety signage posted? → Photo
- [ ] Other: _____

**PHOTO REQUIRED if Cat 2/Cat 3 or if PPE used**
```

**ACTION ITEM:** Research OSHA/IICRC PPE requirements for comprehensive list

### Step 8: Post-Demo Photos
**Keep as-is** ✅

### Step 9: Equipment Adjustment ⚠️ ENHANCED
**Current:** Equipment adjusted, no photos
**NEW:** Equipment documentation (like Step 12 of Install)

Flow:
1. Room-by-room equipment check
2. Scan QR codes (update equipment locations)
3. Photo of adjusted equipment placement
4. Overall photo showing new equipment distribution

### Step 10: Complete Demo
**Keep as-is** ✅

---

## Check Service Workflow Photo Requirements

### Step 1: Start Visit
**Keep as-is** ✅

### Step 2: Environmental Check ⚠️ CRITICAL ADDITION
**Current:** Readings logged, no photos
**NEW:** **MANDATORY photos - once per chamber per visit**

Prompt per chamber:
```
Chamber: Master Bedroom + Guest Bath
- Place hygrometer in chamber
- **REQUIRED: Photo showing meter with temp, RH, GPP visible**
- Enter readings:
  - Temperature: _____
  - Relative Humidity: _____
  - GPP: _____
```

**Blocking Logic:** Cannot proceed without environmental photo for each chamber

### Step 3: Room Readings ⚠️ COMPLETELY REDESIGNED

**Current:** Manual room-by-room readings
**NEW:** Tracked materials-driven workflow

#### Flow:
1. **Display Tracked Materials Summary:**
   ```
   You have 12 materials to check across 4 rooms

   Master Bedroom (3 wet materials)
   Guest Bath (2 wet materials)
   Kitchen (4 wet materials)
   Hallway (3 wet materials)
   ```

2. **Room-by-Room Workflow:**
   - Click room → Shows tracked materials for that room
   - For each material:
     ```
     Wall Drywall
     Last reading: 28% (Visit 2)
     Dry standard: 15%
     Notes: "Left side near window"
     [Previous photo displayed for reference]

     New Reading:
     - Moisture %: _____
     - Photo (REQUIRED) ← Show meter + material
     - Status: [ ] Still Wet [ ] Mark as DRY
     - Notes: _____ (optional)
     ```

3. **Multiple Test Spots:**
   - "Did you test multiple spots for this material?"
   - If YES → Allow multiple photos
   - Record highest reading as primary
   - Store all photos

4. **Add New Materials:**
   - Button: "+ Found new wet material"
   - Same flow as Install moisture readings
   - Auto-add to tracked materials

**CRITICAL:** Once material marked DRY, stop tracking on future visits

**Blocking Logic:**
- Must test all WET materials (cannot skip)
- Each material requires photo
- If skip a day/visit, don't flag as error (per user feedback)

### Step 4: Equipment Status ⚠️ ENHANCED
**Current:** Equipment verified, runtime logged
**NEW:** **REQUIRED photos** of dehumidifier displays

Prompt per dehumidifier:
```
Dehumidifier #12345
- Photo showing display (REQUIRED)
  - Runtime hours visible
  - Settings visible (temp, RH if available)
- Equipment functioning? YES/NO
- Issues noted: _____
```

**Note:** Don't need serial number visible (tracked via QR from install)

### Step 5: Drying Assessment
**NEW:** Auto-generate drying curve

After all readings captured:
- System generates drying curve graph (moisture % over time)
- Shows per material being tracked
- Displays estimated days remaining
- **No auto-send** (available for PSM to view in dashboard)

### Step 6: Equipment Adjust
**Keep as-is** ✅

### Step 7: Complete Visit ⚠️ ENHANCED
**NEW:** Final room condition photos (like Step 12 of Install)

Prompt:
```
Final Closeout:
- Walk through each affected room
- Overall photo showing current conditions (REQUIRED per room)
- Scan equipment QR codes (verify still in place)
- Any changes observed? _____
```

**Blocking Logic:** Require overall photo for each room with equipment

---

## Pull Workflow Photo Requirements

### Step 1: Start Pull
**CHANGE:** Remove MIT Lead approval requirement
- Just clock in and start

### Step 2: Final Moisture Verification ⚠️ COMPLETELY REDESIGNED

**Current:** Manual final readings
**NEW:** Tracked materials verification (uses dry standard, not hardcoded 12%/15%)

#### Flow:
1. **Display Remaining Tracked Materials:**
   ```
   8 materials still marked WET - Verify dry standard achieved

   Master Bedroom (2 materials)
   - Wall Drywall (Last: 18%, Standard: 15%)
   - Subfloor (Last: 14%, Standard: 12%)

   Guest Bath (1 material)
   - Wall Drywall (Last: 16%, Standard: 15%)
   ...
   ```

2. **For Each Material:**
   ```
   Wall Drywall - Master Bedroom
   History:
   - Install: 32%
   - Visit 2: 28%
   - Visit 4: 18%
   Dry Standard: 15%

   Final Reading:
   - Moisture %: _____
   - Photo (REQUIRED) ← meter + material
   - At/below dry standard? [Auto-calculated]
   ```

3. **If Material Still Wet:**
   ```
   WARNING: Wall Drywall reading 16% (standard: 15%)

   Options:
   [ ] Reschedule pull (continue drying)
   [ ] Create Drying Release Waiver (DRW)
   ```

4. **Drying Release Waiver (DRW):**
   - Explain to customer: Material not fully dry, accepting early removal
   - Customer signature required
   - Document reason for early pull
   - Photo of wet material required

**Blocking Logic:** All materials must be ≤ dry standard OR have DRW signed

### Step 3: Equipment Removal ⚠️ ENHANCED

**Current:** Equipment scanned, no photos
**NEW:** Runtime documentation + truck loading photo

#### Per Dehumidifier:
1. **Before Removal:**
   - Photo of display showing **total runtime hours** (REQUIRED)
   - Scan QR code (mark as removed)

2. **After Loading:**
   - Overall photo of equipment in truck (REQUIRED)
   - "All equipment loaded and accounted for"

**Note:** Don't need individual equipment condition photos - just overall truck photo

### Step 4: Final Photos ⚠️ ENHANCED

**Current:** Dry conditions documentation
**NEW:** Room-by-room final overalls (mandatory for all worked rooms)

#### Flow:
1. System shows: "Rooms worked on this job: Master Bedroom, Guest Bath, Kitchen"
2. For each room:
   ```
   Master Bedroom - Final Photos
   - Overall photo (REQUIRED) ← Empty room, dry conditions
   - Any concerns? _____
   ```

**Blocking Logic:** Require final overall for every room worked

**Before/After Comparisons:** Not required in app (PSM Dashboard will generate)

### Step 5: Customer Paperwork ⚠️ ENHANCED

**Current:** Signature + DRW if needed
**NEW:** Multiple signatures with specific language

#### Signatures Required:
1. **Completion Acceptance**
   - "Work complete, property dry to industry standards"
   - Customer signature

2. **Equipment Removal Acknowledgment**
   - "All equipment removed, no damage to property"
   - Customer signature

3. **Final Walkthrough**
   - "Customer satisfied with services provided"
   - Customer signature

4. **Drying Release Waiver (if applicable)**
   - Only if pulling equipment while materials still wet
   - "Customer accepts risk of early equipment removal"
   - Customer signature

### Step 6: Payment Collection
**Keep as-is** ✅

### Step 7: Matterport Verify
**CHANGE:**
- **NOT captured during Pull**
- **Captured during FIRST CHECK SERVICE AFTER DEMO**
- Standard on every job
- Just verify completion during Pull

Prompt:
```
Matterport 3D Scan:
- Was Matterport scan completed? YES/NO
- If NO → Flag for follow-up
```

### Step 8: Complete Job
**Keep as-is** ✅

---

## Implementation Phases

### Phase 1: Critical Infrastructure (PRIORITY)
**Goal:** Tracked materials system + mandatory moisture photos

**Duration:** 2-3 weeks

**Features:**
1. **Tracked Materials Data Structure**
   - Database schema for TrackedMaterial
   - Link materials across workflows
   - Auto-add when moisture > dry standard
   - Mark as DRY when ≤ dry standard

2. **Install - Room Assessment Enhancement**
   - Require 4+ overall photos per room
   - Require 2+ moisture meter photos per room
   - Block progression without photos
   - Thermal imaging moved to room assessment

3. **Check Service - Tracked Materials Workflow**
   - Display tracked materials list (grouped by room)
   - Require photos for each material being tracked
   - Allow marking materials as DRY
   - Stop tracking dry materials

4. **Pull - Final Verification**
   - Show remaining wet materials
   - Require final photos
   - Dry standard validation
   - DRW creation if needed

**Success Criteria:**
- Material tracked from Install → Pull
- Photos required and captured
- Drying progression visible

---

### Phase 2: Equipment & Environmental Documentation
**Goal:** Equipment tracking, environmental baselines, room closeouts

**Duration:** 2 weeks

**Features:**
1. **Install - Step 12 Enhancement**
   - Room-by-room equipment documentation
   - QR code scanning for equipment tracking
   - Photos of equipment placement

2. **Check Service - Environmental Photos**
   - Mandatory hygrometer photos per chamber
   - Equipment runtime photos (dehumidifiers)
   - Room condition closeout photos

3. **Pull - Equipment Removal**
   - Runtime total photos before removal
   - Equipment in truck photo
   - Room-by-room final overalls

**Success Criteria:**
- Equipment location tracked
- Environmental conditions documented
- Equipment runtime proven

---

### Phase 3: Demo Workflow Enhancements
**Goal:** Post-demo documentation, debris tracking, PPE

**Duration:** 1-2 weeks

**Features:**
1. **Demo - Exposed Materials Photos**
   - Mandatory photos of wall cavities, subfloor
   - Post-demo moisture readings with photos

2. **Demo - Debris Documentation**
   - Disposal method selection
   - Photos based on method (dumpster/bags/loose)

3. **Demo - PPE Expansion**
   - Research OSHA/IICRC requirements
   - Comprehensive PPE checklist with photos
   - Not just Cat 3 - all jobs

4. **Install - Mini Demo Workflow**
   - If "Was demo completed?" = YES
   - Launch simplified demo workflow
   - Capture key demo photos during install

**Success Criteria:**
- Hidden damage documented
- Debris quantity tracked
- PPE compliance proven

---

### Phase 4: Specialized Features
**Goal:** Containment barriers, pre-existing damage, drying curves

**Duration:** 1-2 weeks

**Features:**
1. **Install - Chamber Containment**
   - Optional containment barrier documentation
   - Photos + details (plastic sq ft, zippers, poles)

2. **Install - Pre-Existing Damage**
   - Conditional photo requirement (only if flagged)
   - Clear separation from new damage

3. **Check Service - Drying Curve**
   - Auto-generate moisture % graph over time
   - Per material visualization
   - Available in PSM dashboard

4. **Pull - Enhanced Signatures**
   - 4 separate signature captures
   - Specific language per signature type

**Success Criteria:**
- Edge cases handled
- Data visualization working
- Professional documentation

---

### Phase 5: Matterport Integration
**Goal:** 3D scanning workflow integration

**Duration:** 1 week

**Features:**
1. **Check Service - Matterport Capture**
   - Trigger on FIRST check service AFTER demo
   - Standard on every job
   - Link to job record

2. **Pull - Matterport Verification**
   - Confirm scan completed
   - Flag if missing

**Success Criteria:**
- Matterport captured at right time
- Linked to job

---

## Development Estimates

### Total Timeline: 6-8 weeks

**Phase 1:** 2-3 weeks (CRITICAL - Start immediately)
**Phase 2:** 2 weeks
**Phase 3:** 1-2 weeks
**Phase 4:** 1-2 weeks
**Phase 5:** 1 week

### Parallel Development Opportunities:
- Phase 2 & 3 can be developed in parallel (different workflows)
- Phase 4 features are independent (can be split across sprints)

---

## Next Steps

1. **Review & Approve:** Stakeholder approval of this plan
2. **Technical Design:** Database schema for tracked materials
3. **UI/UX Mockups:** Photo capture flows for each workflow
4. **Start Phase 1:** Begin tracked materials system development

---

**APPROVED BY:** [Stakeholder]
**DATE:** [Date]
**READY FOR DEVELOPMENT:** YES

---

**END OF IMPLEMENTATION PLAN**
