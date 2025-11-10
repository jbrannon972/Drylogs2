# Install Workflow vs User Stories - Gap Analysis

**Date:** November 10, 2025
**Document Purpose:** Compare implemented Install Workflow with User Stories Excel to identify gaps and missing requirements

---

## Current Install Workflow (14 Steps)

| Step | Title | Description | Status |
|------|-------|-------------|--------|
| 1 | Office Preparation | Pre-departure prep (optional) | ✅ Implemented |
| 2 | Property Arrival | Clock in and document arrival | ✅ Implemented |
| 3 | Customer Introduction | Ground rules and walkthrough | ✅ Implemented |
| 4 | Cause of Loss | Source + water category/class | ✅ Implemented |
| 5 | Room Assessment | Dimensions, moisture, materials & pre-existing damage | ✅ Implemented |
| 6 | Define Drying Chambers | Group rooms into drying zones | ✅ Implemented |
| 7 | Equipment Calculation | IICRC per-room calculations | ✅ Implemented |
| 8 | Partial Demo | Demo work during install (optional) | ✅ Implemented |
| 9 | Equipment Placement | Scan & place equipment by chamber/room | ✅ Implemented |
| 10 | Additional Billable Work | Log additional services performed | ✅ Implemented |
| 11 | Final Photos | Document equipment setup | ✅ Implemented |
| 12 | Schedule Work | Plan Day 2+ visits (demo, checks, pull) | ✅ Implemented |
| 13 | Communicate Plan | Review plan with tech (not sent to customer) | ✅ Implemented |
| 14 | Complete | Finalize workflow and depart | ✅ Implemented |

---

## User Stories Mapping (MIT Tech Install Day)

### ✅ IMPLEMENTED - User Stories Covered by Current Workflow

| User Story | Title | Mapped to Install Step |
|------------|-------|------------------------|
| **3.8** | Guided step-by-step install workflow | **Entire Workflow** - All 14 steps provide guided progression |
| **3.9** | Log arrival/departure times with GPS | **Step 2: Property Arrival** - Arrival time, arrival window |
| **3.12** | Room-by-room moisture mapping with materials | **Step 5: Room Assessment** - Full moisture mapping per room |
| **3.13** | Establish dry standards per material type | **Step 5: Room Assessment** - Dry standards set per material |
| **3.14** | IICRC equipment recommendations | **Step 7: Equipment Calculation** - Auto-calculated recommendations |
| **3.15** | Create drying chambers by grouping rooms | **Step 6: Define Drying Chambers** - Chamber creation |
| **3.16** | Place and document equipment with photos | **Step 9: Equipment Placement** - Equipment placement + photos |
| **3.17** | Create 14-day job plan (Pillars) | **Step 12: Schedule Work** - Future visit planning |
| **3.19** | Explain drying process to customer | **Step 13: Communicate Plan** - Customer communication |

### ❌ MISSING - User Stories NOT in Current Workflow

| User Story | Title | Details | Priority |
|------------|-------|---------|----------|
| **3.10** | Outside humidity and temperature readings with photo validation | Should capture exterior environmental baseline with meter photo | 🔴 HIGH |
| **3.11** | Unaffected area readings for baseline comparison | Take psychrometric readings in dry rooms to establish drying standards | 🔴 HIGH |
| **3.18** | Initial dehumidifier readings after 20-30 minutes | Capture dehumidifier performance after warmup period | 🟡 MEDIUM |
| **3.20** | Coordinate subcontractor schedules | Schedule plumbers, electricians, etc. within job timeline | 🟡 MEDIUM |
| **3.21** | Capture Matterport documentation | Confirm Matterport completion and upload | 🟢 LOW |

### 📋 PARTIAL - User Stories Partially Covered

| User Story | Title | What's Covered | What's Missing |
|------------|-------|----------------|----------------|
| **3.1** | Receive job details from HubSpot | Job data is loaded | ❌ HubSpot integration not active |
| **3.2** | Review DC assessment and photos | Room data structure exists | ❌ DC handoff workflow not built |
| **3.3** | Verify customer contact info | Customer info displayed | ✅ Fully editable in job setup |
| **3.4** | Confirm insurance carrier info | Carrier fields exist | ❌ Carrier-specific protocols not shown |
| **3.5** | Log team members and assign roles | Job assignment exists | ❌ Multi-tech team tracking not built |
| **3.6** | Review health concerns/special requests | Fields exist in job data | ❌ Not prominently displayed in workflow |
| **3.7** | Access DC preliminary job plan | Job plan structure exists | ❌ DC handoff not integrated |

---

## Features in App NOT in User Stories

### ✨ Additional Features Beyond User Stories

| Feature | Location | Rationale |
|---------|----------|-----------|
| **Office Preparation Step** | Step 1 (Optional) | Review job, insurance, customer info before departure |
| **Customer Introduction / Front Door** | Step 3 | Ground rules, access info, customer walkthrough |
| **Water Category & Class Documentation** | Step 4: Cause of Loss | IICRC compliance - Cat 1/2/3 and Class 1-4 |
| **Pre-existing Damage Documentation** | Step 5: Room Assessment | Liability protection - document existing damage |
| **Partial Demo During Install** | Step 8 (Optional) | Capture demo work performed on install day |
| **Additional Billable Work** | Step 10 | Track emergency extraction, antimicrobials, etc. |
| **Final Photos Step** | Step 11 | Dedicated step for equipment setup photos |
| **Communicate Plan (Internal)** | Step 13 | Internal tech review (not sent to customer per description) |
| **Arrival Window Selection** | Step 2: Arrival | 9-1, 12-4, or custom windows |
| **Travel Time Tracking** | Step 2: Arrival | From Arrival step implementation |

---

## Critical Gaps to Address

### 🔴 HIGH PRIORITY - IICRC Compliance Required

#### 1. Environmental Baseline Readings (User Story 3.10)
**Missing:** Outside humidity and temperature with photo validation

**Impact:**
- IICRC S500 requires environmental baselines
- Cannot properly calculate drying progress without exterior readings
- Insurance adjusters expect this documentation

**Recommended Implementation:**
```
Add to Step 2 (Property Arrival) or create new "Environmental Baseline" step:
- Outside temperature (°F)
- Outside relative humidity (%)
- Photo of meter reading (required)
- Weather conditions (optional dropdown)
```

**User Story to Add:**
```
US 3.10a: As a MIT Technician, I want to capture exterior temperature and relative humidity
with a photo of my meter, so that environmental baselines are established for drying calculations.

Acceptance Criteria:
- Outside temperature field (required)
- Outside RH% field (required)
- Photo of meter display (required)
- Readings validated for reasonableness
- Data used in drying calculations
```

---

#### 2. Unaffected Area Readings (User Story 3.11)
**Missing:** Baseline readings from dry rooms to establish drying goals

**Impact:**
- IICRC S500 requires dry standard establishment
- Cannot calculate when materials reach "dry" without baseline
- Current workflow may assume generic dry standards

**Recommended Implementation:**
```
Add to Step 5 (Room Assessment) or create new step before Room Assessment:
- Select unaffected room(s)
- Take temp/RH readings in dry areas
- Take material moisture readings in dry areas
- Use these as baselines for affected room comparisons
```

**User Story to Add:**
```
US 3.11a: As a MIT Technician, I want to take psychrometric readings in unaffected rooms,
so that I can establish accurate dry standards for comparison.

Acceptance Criteria:
- Can select multiple unaffected rooms
- Capture temp and RH in unaffected areas
- Take material readings (same material types as affected areas)
- System uses these as "dry standard" baselines
- Clearly labeled as "Unaffected Area Baseline"
```

---

### 🟡 MEDIUM PRIORITY - Operational Efficiency

#### 3. Initial Dehumidifier Performance Check (User Story 3.18)
**Missing:** 20-30 minute warmup readings

**Impact:**
- Best practice to verify equipment function immediately
- Catch equipment issues before leaving site
- Demonstrates equipment was operational at install

**Recommended Implementation:**
```
Add to Step 9 (Equipment Placement):
- After placing all dehumidifiers, trigger 20-minute timer
- Reminder notification to take readings
- Capture dehumidifier temp, RH, hours running
- Photo of each dehumidifier display
- Flag any equipment performing poorly
```

**User Story to Add:**
```
US 3.18a: As a MIT Technician, I want to take initial dehumidifier readings after 20-30 minutes
of operation, so that I verify equipment is functioning properly before I leave.

Acceptance Criteria:
- Timer reminder after equipment placement
- Capture temp and RH from each dehumidifier
- Photo of dehumidifier display
- Hours running documented
- Can flag equipment issues for replacement
```

---

#### 4. Subcontractor Coordination (User Story 3.20)
**Missing:** Schedule plumbers, electricians, specialists

**Impact:**
- Delays project if subs aren't coordinated early
- MIT Lead currently handles this manually
- Could be captured by tech during install

**Recommended Implementation:**
```
Add to Step 12 (Schedule Work) or create separate "Subcontractor Needs" step:
- Checkbox: "Subcontractor needed?"
- If yes, select type(s): Plumber, Electrician, HVAC, Mold Test, Other
- Describe work needed
- Urgency level (Before Demo, Before Pull, As Needed)
- Notes for MIT Lead/PSM
```

**User Story to Add:**
```
US 3.20a: As a MIT Technician, I want to identify subcontractor needs during install,
so that coordination can begin immediately and work is properly sequenced.

Acceptance Criteria:
- Can flag subcontractor needs (plumber, electrician, etc.)
- Describe scope of sub work needed
- Set urgency/timing requirements
- MIT Lead/PSM receives notification
- Sub coordination tracked in job timeline
```

---

#### 5. Matterport Documentation (User Story 3.21)
**Missing:** Matterport completion tracking

**Impact:**
- Billable service not being tracked
- Documentation completeness unclear
- Adjuster may not receive Matterport link

**Recommended Implementation:**
```
Add to Step 11 (Final Photos) or create checkbox in multiple steps:
- Checkbox: "Matterport capture completed?"
- If yes: Enter Matterport URL
- Upload confirmation
- Auto-add to billable services
```

**User Story to Add:**
```
US 3.21a: As a MIT Technician, I want to confirm Matterport documentation is complete
and uploaded, so that we can bill for this service and provide it to the adjuster.

Acceptance Criteria:
- Checkbox to confirm Matterport complete
- Field to enter Matterport URL
- Automatically adds Matterport to billable services
- Link accessible to PSM for adjuster submission
- Can mark as "Not Applicable" if not required
```

---

### 🟢 LOW PRIORITY - Nice to Have

#### 6. Multi-Tech Team Tracking (User Story 3.5)
**Missing:** Log multiple techs and assign roles

**Current State:** Single tech assignment per job

**Recommended Implementation:**
- Add team member selection in Office Prep or Arrival
- Track labor hours per tech
- Assign lead tech designation

---

#### 7. Carrier-Specific Requirements Display (User Story 3.4)
**Missing:** Show carrier protocols and requirements

**Current State:** Insurance fields exist but no protocol guidance

**Recommended Implementation:**
- Build carrier profile system
- Display carrier-specific requirements at relevant steps
- Flag required approvals/forms

---

## Features to Document in User Stories

### New User Stories Needed for Existing Features

#### Office Preparation Step
```
US 3.0a: As a MIT Technician, I want to review job details, customer information,
and insurance carrier requirements before leaving the office, so that I arrive fully prepared.

Acceptance Criteria:
- Customer profile accessible
- Insurance carrier and policy info displayed
- Special instructions/notes visible
- Can review DC assessment if available
- Optional step (can skip if reviewing in vehicle)
```

#### Customer Introduction / Front Door
```
US 3.3a: As a MIT Technician, I want to conduct a structured customer introduction
covering ground rules and property access, so that expectations are set and I understand the property layout.

Acceptance Criteria:
- Ground rules checklist (restroom access, parking, pets, security, etc.)
- Customer walkthrough discussion points
- Access preferences documented
- Emergency contacts confirmed
- Sets professional tone for engagement
```

#### Water Category & Class Assignment
```
US 3.12a: As a MIT Technician, I want to determine and document water category (1/2/3)
and water class (1-4) for each affected area, so that proper IICRC drying protocols are applied.

Acceptance Criteria:
- Water category selection (Cat 1, 2, 3) with descriptions
- Water class calculation (Class 1-4) based on affected materials
- Category/class saved per room or per job
- Influences equipment calculations
- IICRC compliant documentation
```

#### Pre-existing Damage Documentation
```
US 3.13a: As a MIT Technician, I want to photograph and document any pre-existing damage
or conditions, so that liability boundaries are clearly established.

Acceptance Criteria:
- Checkbox per room: "Pre-existing damage present?"
- Photo capture of pre-existing conditions
- Description field for condition details
- Timestamp and location tags
- Separate from water damage documentation
```

#### Partial Demo During Install
```
US 3.31a: As a MIT Technician, I want to document any demolition work performed
during the install visit, so that billable demo is captured accurately.

Acceptance Criteria:
- Optional step if no demo performed
- Material types removed (drywall, baseboard, etc.)
- Quantity/sqft of removal per material
- Room-by-room breakdown
- Photos of demo work
- Automatically adds to billable services
```

#### Additional Billable Work Tracking
```
US 3.22a: As a MIT Technician, I want to log additional billable services performed
during install (extraction, antimicrobials, specialty drying), so that all revenue is captured.

Acceptance Criteria:
- Selectable billable services list
- Quantity/unit tracking per service
- Room/area assignment
- Time tracking for labor-based billing
- Notes field for details
- Auto-populates pricing if available
```

#### Final Setup Photos
```
US 3.16a: As a MIT Technician, I want to take comprehensive photos of the completed
equipment setup, so that installation is fully documented before I leave.

Acceptance Criteria:
- Dedicated step for final photos
- Room-by-room setup photos
- Dehumidifier placement per chamber
- Air mover placement per room
- Overview photos showing complete setup
- Photos organized by location
```

#### Internal Plan Communication
```
US 3.19a: As a MIT Technician, I want to review the complete mitigation plan
with my team lead before departing, so that next steps are confirmed and coordinated.

Acceptance Criteria:
- Internal communication (not sent to customer)
- Summary of work completed
- Equipment placed and locations
- Scheduled future visits
- Any concerns or issues flagged
- MIT Lead/PSM can review plan
```

---

## Recommended Action Plan

### Phase 1: Critical IICRC Compliance (Complete First)
1. ✅ Add **Environmental Baseline Step** (exterior temp/RH with photo)
2. ✅ Add **Unaffected Area Readings** (dry room baselines)
3. ✅ Update **Room Assessment** to use baselines for dry standard calculations

### Phase 2: Operational Efficiency (Complete Second)
4. ✅ Add **Initial Dehumidifier Check** (20-30 min readings)
5. ✅ Add **Subcontractor Coordination** (identify needs during install)
6. ✅ Add **Matterport Tracking** (completion confirmation)

### Phase 3: Enhanced Features (Complete Third)
7. ⏳ Build **Multi-Tech Team Tracking** (assign multiple techs per job)
8. ⏳ Build **Carrier-Specific Protocols** (display requirements per carrier)
9. ⏳ Build **DC Handoff Integration** (receive DC assessment data)

### Phase 4: Documentation Cleanup
10. 📝 Document all existing features as user stories
11. 📝 Update User Stories Excel with new entries
12. 📝 Create traceability matrix (User Story → Feature → Code)

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| **User Stories for Install** | 14 core stories | From US 3.8-3.21 |
| **User Stories Implemented** | 9 stories | 64% coverage |
| **User Stories Missing** | 5 stories | Need to add |
| **Additional Features Built** | 9 features | Not in user stories |
| **Install Workflow Steps** | 14 steps | All functional |
| **New User Stories Needed** | 14 stories | To document existing features |

---

## Conclusion

The Install Workflow is **well-built and comprehensive**, but has some critical gaps for IICRC compliance:

### ✅ Strengths:
- Complete guided workflow (14 steps)
- Room-by-room moisture mapping
- IICRC equipment calculations
- Drying chamber management
- Equipment placement tracking
- Job planning and scheduling
- Comprehensive photo documentation

### ❌ Critical Gaps:
- **No exterior environmental baseline** (IICRC required)
- **No unaffected area readings** (IICRC required)
- **No initial dehumidifier performance check** (best practice)
- Missing subcontractor coordination
- Missing Matterport tracking

### 📋 Next Steps:
1. Add the 5 missing features from User Stories 3.10, 3.11, 3.18, 3.20, 3.21
2. Create 14 new user stories to document existing features
3. Update planning-docs/27_REQUIREMENTS_User_Stories.xlsx with new stories
4. Implement Phase 1 (IICRC compliance) immediately

---

**Document Version:** 1.0
**Last Updated:** November 10, 2025
**Author:** Claude Code Analysis
