# Install Workflow Implementation Plan
## Based on Transcript Analysis (Two Discussion Sessions)

**Last Updated:** 2025-11-15
**Status:** Ready for Review
**Next Steps:** Review with team → Finalize decisions → Begin implementation

---

## Table of Contents
1. [Workflow Steps Restructuring](#1-workflow-steps-restructuring)
2. [Step-by-Step Changes](#2-step-by-step-changes)
3. [Major Functionality Changes](#3-major-functionality-changes)
4. [UI/UX Improvements](#4-uiux-improvements)
5. [Questions Requiring Clarification](#5-questions-requiring-clarification)
6. [Out of Scope Items](#6-out-of-scope-items)

---

## 1. Workflow Steps Restructuring

### Current vs. Proposed Step Count
- **Current:** 14 steps (with tabs in some steps)
- **Proposed:** 15-16 steps (remove tabs, split some combined steps)

### Steps to Add/Modify

| Action | Step Name | Reason |
|--------|-----------|--------|
| **SPLIT** | Arrival → Arrival + Environmental Baseline | Too much scrolling, tabs are confusing |
| **REMOVE** | Front Door Step | Redundant - only used twice a year |
| **KEEP** | All other steps | With modifications below |

---

## 2. Step-by-Step Changes

### STEP 1: Office Preparation
- **Status:** Low priority, minimal effort invested
- **Action:** Keep as placeholder for now

### STEP 2: Arrival (NEW - Split from old arrival)
- **Include:**
  - Arrival photos (truck location, exterior)
  - Property age input
  - EPA hazards (asbestos/lead warnings)

- **Changes:**
  1. **Move Property Age & EPA Hazards** from "Front Door" step to here
  2. **Smart Display Logic:**
     - If year < 1980 → Show asbestos warning
     - If year < 1978 → Show lead paint warning
     - Auto-populate based on year input
  3. **Remove** tabs - just scroll
  4. **Format EPA warnings:** Convert checkboxes to simplified bullet points
  5. **Purpose:** Safety reminder, not compliance tracking

### STEP 3: Environmental Baseline (NEW - Split from old arrival)
- **Include:**
  - Outside temperature
  - Relative humidity
  - Photos of hygrometer readings

- **Changes:**
  1. Split from Arrival to be separate step
  2. Remove tabs - embed photos in same view

### ~~STEP 3: Front Door~~ (REMOVED)
- **Decision:** Delete entirely
- **Reason:** Only valuable ~2 times per year out of 2,800 jobs (0.07% use case)

### STEP 4: Cause of Loss
- **Remove:**
  - ❌ Discovery Date field (insurance claim liability)

- **Changes to Category 3 Checklist:**
  1. Keep category selection dropdown
  2. **Remove** detailed PPE/containment checklist from this step
  3. **Add** simple 6-item reminders box (no sub-bullets)
  4. **Move** detailed checklist requirements to backend/demo step (when actually needed)
  5. **Add** visual separation between Category 3 selection and reminders

- **Photo Strategy:**
  - Keep "Choose from Gallery" option for cause of loss photos

### STEP 5: Add Rooms
- **No major changes**
- Existing functionality works well

### STEP 6: Unaffected Area Baseline

#### Photos
- **Change from:** Optional overall photos
- **Change to:**
  - **Mandatory 1-2 photos** of notable items
  - Prompt: "Take photos of things that stand out in this room"
  - Examples provided: Pre-existing damage, very dirty areas, scratched doors, cracked tiles
  - Purpose: Liability protection for adjacent rooms

#### Pre-existing Damage
- **Change from:** Optional field
- **Change to:** **Required Yes/No selection**
  - If YES → Require photos + notes
  - If NO → Acknowledgment that room is clean (protects against false claims)

#### Environmental Readings
- **Keep:** Temperature, humidity, hygrometer photos
- **Add requirement:** At least ONE unaffected room must have hygrometer readings for dry standard

#### Moisture Readings
- **REMOVE ENTIRELY** from unaffected rooms
- **Exception:** Still need dry standard readings (see Moisture Mapping section)

### STEP 7: Room Assessment (Room-by-Room)

#### Navigation Changes
1. **Remove redundant Next/Exit buttons** when inside a room
2. **Add:**
   - "Back to Rooms" button
   - "Next Room" button (or "Add Room" if no next room exists)
3. **Keep:** Exit button (saves and exits entire workflow with warning)

#### Room Info Tab
- **Scrolling:** Acceptable length, no need to split
- **Thermal Imaging:**
  - **Change from:** Optional
  - **Change to:** Required with override option
  - **Implementation:**
    - If skipped → Show warning: "You didn't use thermal imaging"
    - Provide options: Go back OR "I'm not using thermal on this job"
    - Track when techs consistently skip thermal (reporting flag)

#### Moisture Tab → See "Moisture Mapping" section below

#### Materials Tab → See "Materials for Removal" section below

### STEP 8: Moisture Mapping (MAJOR OVERHAUL)

#### Key Philosophy Change
- **OLD:** 1 reading per material type per room (e.g., one "drywall" reading)
- **NEW:** Multiple readings per material based on equipment placement

#### New Workflow
1. **Readings per Fan Rule:**
   - One moisture reading per air mover location
   - Example: 5 fans in room = 4 drywall readings + 2 flooring readings
   - Corresponds to equipment placement for drying curve tracking

2. **Physical Labeling System:**
   - Use numbered tape/stickers on walls (like garage sale stickers)
   - Tech writes numbers on wall for each reading location
   - Photos capture the numbered locations
   - Check service techs can easily find same spots

3. **Dry Standard Collection:**
   - Collect **once per material type** (doesn't change)
   - **First time** a material is selected → Prompt for dry standard
   - Subsequent selections of same material → Skip dry standard prompt
   - Works across all rooms (drywall dry standard same for whole house)

4. **Photo Requirements:**
   - Take photo of moisture meter showing reading
   - Photo should show numbered tape/sticker for location identification
   - Include location notes (optional but recommended)

#### UI Changes for Moisture Workflow
1. **Make it FAST** - most frequent action in app
2. **Suggested flow:**
   ```
   Click "Add Moisture Reading"
   ↓
   Select Material (dropdown: Drywall, Flooring, Baseboard, Cabinet, etc.)
   ↓
   Take Photo (of meter + numbered location)
   ↓
   Enter Reading value
   ↓
   [If first time for this material] → Enter Dry Standard
   ↓
   Save (returns to list showing all readings)
   ```

3. **Display Format:**
   - Show readings as list grouped by material
   - Each reading shows: Material name, Reading value, Location number/note, Photo thumbnail
   - Dry standard shown once at top of each material group

#### No Moisture Map/Diagram Needed
- **Decision:** Do NOT create floor plan diagrams
- **Rationale:**
  - Encircle's sketch feature is too clunky
  - Not required by IICRC standards
  - Good photos + numbered locations tell the story better
  - Focus on execution, not mapping
- **Alternative:** If map needed for invoice, PSM team creates it using Matterport/photos

### STEP 9: Materials for Removal

#### Keep Current Approach
- Expandable dropdown categories (Flooring, Drywall, Trim/Molding, etc.)
- Comprehensive list prevents forgetting items

#### Visual Improvements Needed
1. **Make headers visually distinct from materials:**
   - Headers: Larger, different color, bold
   - Materials: Smaller font, different background color
   - More items visible at once

2. **Auto-close behavior:**
   - Opening a category → Auto-closes other open categories
   - Clicking a material → Saves and auto-closes dropdown
   - Reduces scrolling and visual clutter

3. **Smart Suggestions:**
   - Auto-suggest materials at TOP of list based on wet moisture readings taken
   - Example: If took wet reading on "Carpet" → "Carpet" appears at top of suggestions
   - Below suggestions: Full categorized list with search

#### Required Fields per Material
- **Reason for Removal** (dropdown - auto-generated, editable)
- **Quantity**
- **Notes** (optional)

#### Photo Button Consistency
- Remove "Take Photo" text button
- Use standard photo boxes (same as everywhere else in app)
- Decide per material type:
  - Multi-photo scenarios → Include "Choose from Gallery"
  - Single required photo → "Take Photo" only

### STEP 10: Define Drying Chambers

#### Auto-Chamber Creation
- **Default:** Auto-create one chamber per floor level
- Tech can manually split chambers afterward

#### Chamber Assignment UI
1. **Show all rooms** in current chamber
2. **Dropdown per room** to reassign to different chamber
3. **Add/Remove Chambers** as needed
4. **Visual:** Room cards show chamber assignment clearly

#### Baseline Room Assignment
- **Add checkboxes** for baseline rooms:
  - "Include in Chamber"
  - "Exclude from Chamber"
- Some baseline rooms may need to be in chamber (can't isolate them)

#### NEW: Containment Barrier Tracking
- **Critical addition** for billing and efficiency

When "Chamber has Containment" is checked:
1. **Capture:**
   - Square feet of plastic used
   - Number of zipper doors installed
   - Number of zip poles used
   - Photos of containment barriers

2. **NEW FIELD: Space Reduction**
   - **Question:** "How much space (cubic feet) did you REDUCE from this chamber with containment?"
   - **Purpose:**
     - Reduces dehumidifier requirements
     - Shows efficiency to insurance
     - Billable item (containment barriers)
   - **Example:** 5-room chamber, contained off 500 sq ft dining area
   - Easier than calculating new chamber dimensions

3. **Display:**
   - Show original chamber cubic footage
   - Show reduction amount
   - Calculate equipment for reduced space

#### Class Display
- Auto-calculate and display class based on affected materials input
- Math should be verified (noted as "needs double-checking")

#### Size Display Issues
- Room cubic footage and floor level boxes seem too large
- Room cards seem too small
- **Adjust:** Make info boxes smaller, room cards larger (for 15-room projects)

#### Chamber Status Boxes
- **Current:** Green checkmarks at bottom of page
- **Consider:** Move to top OR keep at bottom
- **Add:** Info button tooltip for "Chamber Requirements" blue box text

### STEP 11: Partial Demo

#### Current Status
- **Marked as:** Needs significant work
- **Decision:** Put a pin in this for now

#### Strategy
1. Build complete **Demo workflow** first (separate workflow type)
2. Import/reuse demo components in Install workflow
3. Come back to this after Install workflow is stable

#### Conceptual Approach
- **Materials marked in Step 9** = Plan for whole project
- **Partial demo captures** = What was actually removed TODAY
- Can add materials not originally marked (discoveries)
- Should have dropdown for "Reason for Removal"

#### Fields Needed
- Room selection
- Time spent on demo (labor hours)
- Materials removed (possibly auto-populate from Step 9, allow additions)
- Quantity + Unit
- Reason dropdown
- Notes

### STEP 12: Equipment Calculation

#### Calculation Display
1. **By Chamber:**
   - Dehumidifiers needed (total for chamber)
   - Air Scrubbers needed (total for chamber)

2. **By Room** (within chamber):
   - Air Movers needed per room
   - Based on cubic footage and class

3. **Show Breakdown:**
   - "1 dehumidifier (base) + 1 (for floor) + 1 (for wall) = 3 total"
   - Keeps IICRC S500 compliance visible

#### Remove/Simplify
- ❌ Remove AHIM rating selection (hard-code the value)
- ❌ Remove "Install After Demo" checkbox (assume it's all planned for day 1 unless not placed)

#### Equipment Placement (MOVED HERE from Step 13)

**Major UI Change:** Add equipment buttons WITHIN each room section

**OLD approach:**
- Separate "Add Equipment" buttons at top
- Select room from dropdown
- Scan equipment

**NEW approach:**
```
CHAMBER A - Dehumidifiers Needed: 2
  [Add Dehumidifier] ← Click here

KITCHEN - Air Movers Needed: 3
  [Add Air Mover] ← Click here

BEDROOM - Air Movers Needed: 2
  [Add Air Mover] ← Click here
```

**Workflow:**
1. Click "Add Dehumidifier" (knows it's Chamber A)
2. Dropdown: "Which room in Chamber A?" (Kitchen, Bedroom, etc.)
3. Scan dehumidifier
4. Repeat for additional dehumidifiers
5. Click "Add Air Mover" in Kitchen
6. Scan air mover (auto-assigned to Kitchen)
7. Repeat until all equipment placed

**Benefits:**
- Fewer clicks
- Contextually obvious
- Rooms are right there visually
- Tracks which room has which equipment (important for homeowner claims)

#### Remove Text/Simplify
- Get rid of explanatory text about IICRC calculations
- Could be info button tooltip
- Focus on clean interface

### ~~STEP 13: Equipment Placement~~ (MERGED INTO STEP 12)
- See "Equipment Placement" section under Step 12 above

### STEP 13 (NEW): General Billables

#### Current Problem
- Huge overwhelming list
- Expandable dropdowns are clunky on mobile
- Hard to navigate

#### SOLUTION 1: Simplified Display
**Keep everything OPEN** (no expand/collapse)

Format each line item:
```
[✓] Decontaminated Air Scrubbers    [#]  📷  [Notes]
[✓] Floor Protection Walkway        [#]  📷  [Notes]
[✓] Contents Pack - Small Room      [#]  📷  [Notes]
[ ] Contents Pack - Large Room      [#]  📷  [Notes]
```

- Checkbox OR quantity field (some items are yes/no, others need quantity)
- Photo button (small icon)
- Notes button/field (small icon or inline)

**Visual Hierarchy:**
- **Headers** (Disposal & Logistics, Contents, Appliances, etc.):
  - Different color, larger font, bold
  - Show count: "Disposal & Logistics (3/7 items)"
- **Line items:**
  - Smaller font, normal weight
  - Clear visual separation from headers

#### SOLUTION 2: Quick Actions Access
- **Add "General Billables" to Quick Actions menu**
- Allows tech to add items in real-time throughout job:
  - "Oh, I need to log floor protection" → Quick Actions → Add it
  - "Just moved contents" → Quick Actions → Add it
- Reduces end-of-job data entry burden
- Prevents forgetting items

#### Future Enhancement
- AI voice-to-text: "Add billable item: floor protection, 200 square feet"
- Photo recognition: Auto-detect what item is in photo
- For now: Manual entry is acceptable

### STEP 14: Final Photos & Equipment Performance

#### Structure: Room-by-Room Walkthrough
Navigate through each room to:
1. Take final overall photos
2. Log equipment performance readings

#### Remove Tabs
- **OLD:** Tabs for "Photos" and "Equipment"
- **NEW:** Single scrollable view
  - Equipment readings at top
  - Photo upload below
  - All in one flow

#### Equipment Performance Readings
- **Timing:** After equipment runs 20-30 minutes
- **For each Dehumidifier in room:**
  - Inlet temperature
  - Outlet temperature
  - Inlet humidity
  - Outlet humidity
- **Show:** Which equipment is in this room (from Step 12 placement)

#### Room Navigation
- **Show progress:** "Test Room" ✓ | "Kitchen" (current) | "Bedroom"
- **Buttons:**
  - Previous Room
  - Next Room
  - Or click room name to jump

#### Visual Progress Indicators
- **Change from:** Progress percentage bar at top
- **Change to:** Green checkmarks on completed room cards
- Consistent with chamber completion indicators

#### Fix: Equipment Not Showing
- **Bug noted:** Equipment assigned to room not displaying
- Need to debug assignment linkage

### STEP 15: Schedule Work

#### Keep Core Concept
- Visual calendar/timeline showing planned work days
- Helps office see workload 3+ days out

#### Remove Auto-Calculation
- ❌ Delete "Estimated Drying Timeline" auto-calc
- Too many variables, not accurate enough

#### Manual Day Addition
Buttons to add:
- **Add Demo Day**
- **Add Check Service Day**
- **Add Pull Day**
- **Add Cap-Off** (separate scheduling)

#### Fields per Scheduled Day
- Date
- Arrival window (dropdown: 9am-1pm, 12pm-4pm, Custom)
- Estimated hours
- Team size
- Additional notes from current workflow template

#### Data Review Needed
- Review current workflow scheduling template
- Determine which fields to keep/modify
- Don't get too detailed yet

### STEP 16: Review Plan (Communicate with Homeowner)

#### Purpose
- Tech reviews everything before meeting with homeowner
- Customer-facing summary of entire job plan
- Ensures nothing missed in communication

#### Display Sections

**1. Rooms Assessed**
- List all affected rooms

**2. Wet Materials & Removal Plan** (per room)
- Materials detected as wet
- Materials planned for removal

**3. Scheduled Subcontractors**
- Plumber, electrician, etc.
- Contact info and scheduled date

**4. Equipment Placed**
- Dehumidifiers, air movers, air scrubbers
- By room and chamber

**5. Scheduled Future Work**
- Demo: [Date] [Time window]
- Check Service 1: [Date] [Time window]
- Check Service 2: [Date] [Time window]
- Pull: [Date] [Time window]

#### Make it Customer-Friendly
- **Could show homeowner** this screen
- Adds professionalism and transparency
- Some customers highly value digital documentation

#### Supervisor Review Feature
- **Add button:** "Submit for Supervisor Review"
- **Purpose:** Gives homeowner confidence ("my supervisor will review this")
- **Implementation options:**
  1. **Fake button** - just for show, proceeds anyway
  2. **Tracked review** - supervisor sees it but doesn't block progression
  3. **Required approval** - blocks until supervisor approves (NOT recommended)
- **Recommended:** Option 2 (tracked but non-blocking)

### STEP 17: Complete Install
- **No changes discussed**
- Capture departure time
- Final notes

---

## 3. Major Functionality Changes

### 3.1 Photo Capture Strategy

#### "Choose from Gallery" vs. "Take Photo"
**Rule:** Only include "Choose from Gallery" when taking many photos at once

**Take Photo ONLY:**
- Truck location
- Exterior of home
- Moisture meter readings
- Hygrometer readings
- Thermal imaging
- Any single required photo

**Take Photo + Choose from Gallery:**
- Cause of Loss (might take many)
- Room overall photos
- Material removal photos
- Final photos
- Any scenario where tech might take 10+ photos

#### Standardize Photo Button Appearance
- **Remove** text-only buttons like "Take Containment Photo"
- **Use** consistent photo box UI everywhere:
  - Square box with camera icon
  - "Take Photo" text
  - "Choose from Gallery" text (when applicable)
- Visual consistency helps tech instantly recognize photo requirements

### 3.2 Nested Workflow Navigation

#### Problem
- Workflow has nested levels (Main → Room → Room Details)
- Next/Exit buttons confusing
- Unclear what gets saved

#### Solution
**When entering nested workflow (e.g., room details):**
1. **Hide** main workflow Next/Previous buttons
2. **Show** only:
   - Back to [Parent] button (e.g., "Back to Rooms")
   - Exit button (top right - exits entire workflow)
3. Auto-save progress on navigation

**Visual Clarity:**
- User knows they're "inside" a room
- Can't accidentally skip past rooms
- Clear path back to room selection

### 3.3 Info Buttons / Tooltips

#### Current: Large Blue Instruction Boxes
- Takes up screen space
- Good for critical safety info
- Too much for every step

#### Proposed: Two-Tier System

**Tier 1 - Always Visible:**
- Critical safety information
- Compliance requirements (asbestos, lead, Category 3)
- Step-specific important context

**Tier 2 - Info Button Tooltips:**
- Helpful context but not critical
- "Why are we doing this?"
- IICRC standard references
- Click small (i) icon → Modal overlay appears with info

**Benefits:**
- Cleaner interface
- Info available when needed
- Don't overwhelm experienced techs
- Help newer techs learn

**Implementation Note:**
- Can add tooltips later
- Not required for initial launch

### 3.4 Auto-Close Behavior

**Apply to:**
- Material categories (Flooring, Drywall, etc.)
- Any expandable section with multiple items

**Behavior:**
- User opens "Flooring" category
- User then opens "Drywall" category
- "Flooring" auto-closes
- Only one category open at a time

**Benefits:**
- Less scrolling
- Less visual clutter
- Easier to track where you are

### 3.5 Data Persistence & Auto-Save

#### Current Issues
- Unclear when data saves
- Fear of losing work

#### Requirements
1. **Auto-save on navigation** (moving between steps/rooms)
2. **Auto-save on field blur** (when field loses focus)
3. **Exit button** shows warning but saves data
4. **Re-entering workflow** resumes exactly where left off

#### Visual Feedback
- Consider subtle "Saved" indicator
- Or save icon animation
- Don't need to be explicit if auto-save is reliable

---

## 4. UI/UX Improvements

### 4.1 Visual Hierarchy

#### Headers vs. Content
**Problem:** Everything looks the same
**Solution:** Clear visual differentiation

| Element | Styling |
|---------|---------|
| **Section Headers** | Larger font, bold, distinct color, more spacing |
| **Sub-headers** | Medium font, semi-bold |
| **Content/Fields** | Normal font, regular weight |
| **Help Text** | Smaller font, muted color |

### 4.2 Scrolling vs. Steps

#### Decision: Prefer Scrolling
**Reasons:**
- Tabs are confusing on mobile
- Easy to miss content in hidden tabs
- Scrolling is natural mobile behavior
- Predictable UX

**When to Add New Steps:**
- Logically distinct action
- Would require excessive scrolling (>3 screens)
- Different context/mindset needed

**When to Keep Scrolling:**
- Related information
- Same context
- Under 2-3 screens of content

### 4.3 Button Placement & Consistency

#### Exit Button
- **Always:** Top right corner
- **Behavior:** Shows warning, saves data, exits workflow
- **Style:** Consistent across all steps

#### Next/Previous Buttons
- **Main workflow:** Bottom of screen, always visible
- **Nested workflow:** Hidden (use "Back to [Parent]" instead)

#### Action Buttons
- **Quick Actions:** Top left or consistent location
- **Step-specific actions:** Within context (see Equipment Placement)

### 4.4 Mobile-First Considerations

#### Touch Targets
- Large enough for fingers
- Adequate spacing between clickable elements
- Avoid tiny dropdowns

#### Scrolling
- Natural, expected behavior
- Better than pagination on mobile
- Better than tabs on mobile

#### Visual Density
- Don't cram too much per screen
- White space is okay
- Prioritize most important info

---

## 5. Questions Requiring Clarification

### 5.1 Moisture Mapping Labels

**Question:** What physical labeling system should we recommend?

**Options:**
1. Numbered tape (write numbers on blue painter's tape)
2. Pre-printed numbered stickers (garage sale stickers)
3. Color-coded dots
4. Combination (numbers + colors)

**Considerations:**
- Ease of removal (stickers noted as taking 10 minutes to remove)
- Visibility in photos
- Cost
- Tech preference

**Decision needed:** ________________

---

### 5.2 Move Equipment Function

**Context:** Robert mentioned needing ability to move equipment between rooms

**Question:** Is this needed for INSTALL workflow, or only for Check Service/Demo/Pull?

**Current plan:** Only build for Check Service/Demo/Pull (not Install)

**Confirm:** Is this correct? ________________

---

### 5.3 Supervisor Review Requirements

**Question:** Should "Submit for Supervisor Review" be:

- [ ] **Option A:** Fake button for customer confidence only
- [ ] **Option B:** Tracked but non-blocking (supervisor sees it, job proceeds)
- [ ] **Option C:** Required approval (job blocked until supervisor approves)

**Implications:**
- Option A: Easiest, some ethical concerns
- Option B: Good balance, visibility for supervision
- Option C: Potential bottleneck, delays job progression

**Decision needed:** ________________

---

### 5.4 Voice-to-Text Priority

**Question:** How important is voice-to-text for notes fields?

**Context:**
- Mentioned as future enhancement
- Could reduce typing burden significantly
- Modern browsers support speech-to-text APIs

**Priority Level:**
- [ ] Critical for MVP
- [ ] Nice to have for MVP
- [ ] Post-MVP enhancement

**Decision needed:** ________________

---

### 5.5 General Billables Format

**Question:** Exact format for each billable line item?

**Current proposal:**
```
[✓] Item Name    [Qty Field]  [Photo Icon]  [Notes Icon]
```

**Questions:**
- Should Notes be inline text field or modal?
- Should Photo be required or optional per item?
- Should Quantity be text input or +/- buttons?
- Do we need Unit selection (sq ft, linear ft, each, etc.)?

**Decision needed:** ________________

---

### 5.6 Equipment Placement Timing

**Question:** When exactly should equipment be placed during install?

**Current assumption:** During Step 12 (Equipment Calculation) right after calculating needs

**Alternative:** Move to end during final walkthrough (Step 14)

**Pros of current (Step 12):**
- ✅ Equipment placed right after calculation
- ✅ Separate from performance readings (needs 20-30 min gap)
- ✅ Matches natural workflow

**Pros of alternative (Step 14):**
- ✅ Room-by-room at end
- ✅ Could combine with final photos
- ❌ But then equipment not running for performance check

**Decision:** Keep in Step 12, confirmed during discussion

---

### 5.7 Baseline Room Photos - Quantity

**Question:** Exactly how many photos required for unaffected baseline rooms?

**Current:** "1-2 photos of things that stand out"

**Clarify:**
- Minimum: 1 or 2?
- Maximum: Set a limit?
- Allow skip if nothing notable?

**Decision needed:** ________________

---

## 6. Out of Scope Items

### 6.1 Moisture Map / Floor Plan Diagram
- **Not building** - confirmed explicitly
- Rely on photos + numbered labels instead
- If needed for invoicing, PSM creates manually using Matterport

### 6.2 Demo Workflow (for now)
- **Defer until Install workflow complete**
- Partial demo in Install workflow is placeholder
- Will import/reuse components after Demo workflow built

### 6.3 Check Service Workflow
- **Not discussed in detail**
- Wait until Install and Demo are solid
- Should be easier to build after Install is done

### 6.4 Pull Workflow
- **Not discussed in detail**
- Wait until other workflows complete

### 6.5 Advanced AI Features
- Photo recognition (auto-identify materials)
- Voice-to-text notes (maybe include basic version)
- Intelligent auto-suggestions
- Automated reports

**Status:** Acknowledged as future enhancements, not MVP blockers

---

## 7. Implementation Priority

### Phase 1: Critical Path (Do First)
1. ✅ Workflow restructuring (split Arrival, remove Front Door)
2. ✅ Moisture mapping overhaul (multiple readings, dry standards)
3. ✅ Equipment placement UI redesign (buttons in rooms)
4. ✅ Navigation fixes (nested workflows, button visibility)
5. ✅ Unaffected room changes (required photos, pre-existing damage)

### Phase 2: Important Improvements
6. Materials visual hierarchy (headers, auto-close)
7. Photo button standardization
8. General billables simplification
9. Chamber containment tracking
10. Final photos workflow (remove tabs)

### Phase 3: Polish & Enhancements
11. Info button tooltips
12. Visual design consistency
13. Progress indicators (green checkmarks)
14. Schedule work refinements
15. Review plan customer-facing improvements

### Phase 4: Deferred
16. Demo workflow integration
17. Voice-to-text (if not in Phase 1-3)
18. Advanced supervisor review workflow
19. Move equipment function (if needed for Install)

---

## 8. Next Steps

### Before Implementation Begins

1. **Review this document** with Jason, Derek, Robert
2. **Answer clarification questions** in Section 5
3. **Prioritize** any conflicting requirements
4. **Confirm** technical feasibility of major changes
5. **Update user stories** to match new requirements

### Implementation Approach

**Recommended Order:**
1. Start with navigation/structure changes (easy wins)
2. Tackle moisture mapping (most complex, most important)
3. Build out equipment placement redesign
4. Polish UI/UX across all steps
5. Test with tech team for feedback
6. Iterate based on field testing

### Timeline Considerations

- Jason mentioned "spit shine by Monday"
- Demo workflow can wait
- Get Install workflow to Joshua before vacation
- Tech team can start working while Demo is figured out

---

## 9. Decision Log

| Topic | Decision | Decided By | Date |
|-------|----------|------------|------|
| Tabs vs Scrolling | Prefer scrolling | Robert, Derek | Day 1 |
| Front Door Step | Remove entirely | Robert (2/2800 jobs) | Day 1 |
| Moisture readings | Multiple per material | Robert, Team | Day 1 |
| Discovery Date field | Remove (insurance liability) | Jason | Day 1 |
| Unaffected room moisture | Remove (except dry standards) | Robert | Day 1 |
| Thermal imaging | Required with override | Team | Day 1 |
| Equipment placement UI | Buttons within rooms | Derek (genius idea) | Day 2 |
| Moisture mapping | No floor plan diagram | Derek, Robert | Day 1 |
| Materials format | Keep dropdowns, improve visuals | Team | Day 2 |
| General billables | Open list + Quick Actions | Team | Day 2 |
| Final photos tabs | Remove, just scroll | Robert, Derek | Day 2 |
| Schedule work | Manual day addition | Team | Day 2 |
| Review plan | Customer-facing, add supervisor button | Team | Day 2 |

---

## 10. Success Criteria

**How do we know this is working?**

1. **Tech Adoption:** Techs prefer app over paper dry logs
2. **Speed:** Install workflow completion time < current method
3. **Completeness:** No missing data that invoicing needs
4. **Insurance:** Adjusters accept documentation without pushback
5. **Quality:** Moisture mapping tells clear drying story
6. **Efficiency:** Office can see workload days in advance

**Metrics to Track:**
- Time to complete install workflow
- % of installs with complete data
- # of missing photos/readings flagged
- Tech feedback scores
- Insurance approval rates

---

## Document Control

**Created:** 2025-11-15
**Author:** Claude (based on transcript analysis)
**Reviewed By:** ________________
**Approved By:** ________________
**Approval Date:** ________________

**Change History:**

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-15 | 1.0 | Initial document creation from transcript | Claude |
|  |  |  |  |
|  |  |  |  |

---

