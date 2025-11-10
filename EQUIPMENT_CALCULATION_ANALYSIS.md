# Equipment Calculation Analysis & Fix Plan

## 🚨 CURRENT PROBLEM

**Error at Step 7/14:** "Drying plan not found. Please complete the previous 'Plan the Job' step first."

**Root Cause:** The `PlanJobStep` was removed from the workflow per user feedback, BUT `EquipmentCalcStep` (Step 7) still depends on the data it created.

---

## 📊 WHAT THE CALCULATIONS NEED

### Equipment Types & Calculations:

1. **AIRMOVERS (per room)**
   - 1 per affected room (base)
   - 1 per 60 sq ft of wet **floor** area
   - 1 per 125 sq ft of wet **wall** area
   - Formula: `base + (wetFloor ÷ 60) + (wetWalls ÷ 125)`

2. **DEHUMIDIFIERS (per chamber)**
   - Based on **cubic footage** of chamber
   - Based on **damage class** (1-4)
   - Chart factor varies by dehu type and class
   - Example (LGR): `cubicFootage ÷ chartFactor = PPD needed`

3. **AIR SCRUBBERS (per chamber)** THIS IS FOR ALL, EVEN CAT 1
   - Only for Category 2 or 3 water
   - 1 per 250 sq ft of affected area
   - Formula: `totalAffectedSqFt ÷ 250`

---

## 🔍 DAMAGE CLASS (IICRC S500)

**Critical for dehumidifier calculations!**

| Class | % Affected | Description | Chart Factor (LGR) |
|-------|-----------|-------------|-------------------|
| **Class 1** | < 5% | Minimal absorption, slow evaporation | 100 cf/PPD |
| **Class 2** | 5-40% | Significant absorption, moderate evaporation | 50 cf/PPD |
| **Class 3** | > 40% | Greatest absorption, fast evaporation | 40 cf/PPD |
| **Class 4** | Any | Deep saturation (hardwood, plaster, concrete) | 40 cf/PPD |

**Calculation:**
```
Room Surface Area = (L×W floor) + (L×W ceiling) + (2×L×H walls) + (2×W×H walls)
Affected Area = wetFloorSqFt + wetWallSqFt + wetCeilingSqFt
% Affected = (Affected Area ÷ Total Surface Area) × 100
Overall Class = Highest class across all rooms
```

---

## 🗂️ DATA FLOW BREAKDOWN

### CURRENTLY CAPTURED (Working):

#### Step 4: CauseOfLossStep
- ✅ Water Category (1, 2, or 3)
- ✅ Cause of loss details
- Used for: Air scrubber requirement

#### Step 5: RoomAssessmentStep
- ✅ Room dimensions (length, width, height)
- ✅ Room type (bedroom, bathroom, etc.)
- ✅ Materials affected (list: "Drywall - Wall", "Carpet", etc.)
- ✅ Moisture readings
- ❌ **MISSING: Affected square footage per surface** 

#### Step 6: DefineChambersStep
- ✅ Groups rooms into chambers
- ✅ Calculates total cubic footage per chamber
- ❌ **MISSING: Damage class calculation**

---

### MISSING DATA (Broken):

#### What `dryingPlan` should contain:
```typescript
{
  overallClass: 1-4,              // ❌ NOT BEING CALCULATED!
  waterCategory: 1-3,             // ✅ From CauseOfLossStep
  totalFloorSqFt: number,         // ❌ Not tracked
  totalWallSqFt: number,          // ❌ Not tracked
  totalCeilingSqFt: number,       // ❌ Not tracked
  totalAffectedSqFt: number,      // ❌ Not tracked
  estimatedDays: number,          // ✅ From ScheduleWorkStep
}
```

#### What `roomsAffectedData` should contain (per room):
```typescript
{
  [roomId]: {
    floor: {
      totalSqFt: 120,              // L × W
      affectedSqFt: 80,            // ❌ NOT BEING CAPTURED!
      percentAffected: 66.7,       // ❌ NOT BEING CALCULATED!
    },
    walls: {
      totalSqFt: 480,              // 2(L×H) + 2(W×H)
      affectedSqFt: 240,           // ❌ NOT BEING CAPTURED!
      percentAffected: 50,         // ❌ NOT BEING CALCULATED!
    },
    ceiling: {
      totalSqFt: 120,              // L × W
      affectedSqFt: 0,             // ❌ NOT BEING CAPTURED!
      percentAffected: 0,          // ❌ NOT BEING CALCULATED!
    },
  }
}
```

**This data WAS captured by `AffectedMaterialsStep` which is NOT in the current workflow.**

---

## 💡 SOLUTION OPTIONS

### **Option A: Add Affected Area Fields to RoomAssessmentStep** (RECOMMENDED) DO THIS!!!
**Pros:**
- Keeps workflow simple (no extra step)
- Data captured at point of room evaluation
- User already documenting materials in this step

**Cons:**
- Makes RoomAssessmentStep slightly more complex
- Need to explain what "affected sq ft" means

**Implementation:**
Add to each room during assessment:
- Floor affected sq ft (slider or input)
- Wall affected sq ft (slider or input)
- Ceiling affected sq ft (slider or input)

Calculate class automatically based on room totals.

---

### **Option B: Auto-Calculate from Materials List**
**Pros:**
- No additional user input needed
- Inferred from materials already selected

**Cons:**
- Less accurate (assumes 100% of material type = affected)
- Might overestimate affected area

**Implementation:**
When user selects materials (e.g., "Drywall - Wall", "Carpet"), assume:
- Carpet selected → 100% of floor affected
- Drywall - Wall selected → estimate wall area from room dimensions
- Would need smart estimation logic

---

### **Option C: Add Lightweight Step Between Assessment & Chambers**
**Pros:**
- Dedicated step for affected area input
- Clear separation of concerns
- Can show visual diagram

**Cons:**
- Adds another step to workflow (user wanted simplicity)

**Implementation:**
- New step: "Affected Area Mapping"
- Shows each room with surface breakdown
- User inputs % or sq ft affected per surface
- Calculates class automatically

---

### **Option D: Manual Class Selection (Quick Fix)**
**Pros:**
- Simplest immediate fix
- No workflow changes needed

**Cons:**
- Requires user to understand IICRC classes
- Less accurate than calculation
- Still doesn't capture affected sq ft for air movers

**Implementation:**
Add to DefineChambersStep or EquipmentCalcStep:
- Dropdown: "Select overall damage class (1-4)"
- Show IICRC class descriptions
- Save to dryingPlan.overallClass

---

## 🎯 MY RECOMMENDATION

### **Hybrid Approach: Enhance RoomAssessmentStep with Smart Defaults**

**During room assessment, for EACH material selected:**

1. **When user checks a material (e.g., "Drywall - Wall"):**
   ```
   [ ] Drywall - Wall
       → Automatically expand to show:
       "Approximately how much wall area is wet?"
       [ ] < 25%  [ ] 25-50%  [ ] 50-75%  [ ] 75-100%

       Auto-calculate: totalWallSqFt × percentage = affectedSqFt
   ```

2. **When user checks "Carpet":**
   ```
   [ ] Carpet
       → Automatically expand to show:
       "Approximately how much floor is wet?"
       [ ] < 25%  [ ] 25-50%  [ ] 50-75%  [ ] 75-100%

       Auto-calculate: totalFloorSqFt × percentage = affectedSqFt
   ```

3. **As user selects percentages:**
   - Auto-calculate affected sq ft in real-time
   - Show running total: "Total affected: 320 sq ft (22% of room)"
   - Auto-determine room class based on % affected

4. **After all rooms assessed:**
   - DefineChambersStep or EquipmentCalcStep calculates overall class
   - Uses highest class across all rooms
   - Saves to dryingPlan

**Benefits:**
- ✅ No extra workflow step
- ✅ Intuitive (% selections vs. sq ft math)
- ✅ Accurate class calculation
- ✅ Provides data for all equipment types
- ✅ Not overwhelming (only shows for selected materials)

---

## ❓ QUESTIONS FOR YOU

**Please answer these so I can implement the right solution:**

### 1. Workflow Preference
**Q:** Which approach feels best for your techs?
- [ ] **A) Add % affected sliders to RoomAssessmentStep** (my recommendation)
- [ ] **B) Auto-calculate from material selections** (less accurate but faster)
- [ ] **C) Add dedicated "Affected Area" step** (most accurate but adds a step) DO THIS
- [ ] **D) Manual class selection** (quick fix but less accurate)
- [ ] **E) Other idea?** (tell me)

### 2. Affected Area Input Method
**Q:** How should techs indicate affected area per surface?
- [ ] **Percentage sliders** (< 25%, 25-50%, 50-75%, 75-100%)
- [ ] **Simple buttons** (Small / Medium / Large / Complete)
- [ ] **Direct sq ft input** (type number) THIS ONE
- [ ] **Visual diagram** (tap areas on room diagram)

### 3. When to Calculate Class
**Q:** When should we calculate the overall damage class?
- [ ] **Real-time during room assessment** (shows class as you go)
- [ ] **At DefineChambersStep** (calculates before equipment calc) AND THIS ONE
- [ ] **At EquipmentCalcStep** (calculates on-demand) THIS ONE 

### 4. Default Assumptions
**Q:** If tech skips affected area input, what should we assume?
- [ ] **Conservative (25% affected)** → likely Class 1-2
- [ ] **Moderate (50% affected)** → likely Class 2
- [ ] **Aggressive (75% affected)** → likely Class 3
- [ ] **Force input (block progress)** → most accurate FORCE IT

### 5. Class Override
**Q:** Should techs be able to override the calculated class?
- [ ] **Yes** - show calculated class but allow manual override NO
- [ ] **No** - always use calculated class (IICRC compliant)

### 6. Air Mover Detail Level
**Q:** For air movers per room, do you want:
- [ ] **Simple total per room** ("3 air movers")
- [ ] **Breakdown by purpose** ("1 base + 1 floor + 1 wall")
- [ ] **With placement suggestions** ("Place 2 on floor, 1 on wall") THIS ONE

---

## 🛠️ NEXT STEPS AFTER YOU ANSWER

Once you answer the questions above, I will:

1. **Implement the affected area capture** (based on your preference)
2. **Add class calculation logic** (in the right step)
3. **Fix EquipmentCalcStep** to use the new data
4. **Test the complete flow** (rooms → chambers → equipment)
5. **Verify IICRC formulas** are correct
6. **Add helpful UI** (show class, totals, recommendations)

---

## 📚 REFERENCE: COMPLETE CALCULATION FORMULAS

### Damage Class (S500 Standard)
```javascript
function calculateRoomClass(room, affectedData) {
  const totalSurface = (room.length * room.width * 2) +      // floor + ceiling
                       (room.length * room.height * 2) +     // 2 walls
                       (room.width * room.height * 2);       // 2 walls

  const totalAffected = affectedData.floor.affectedSqFt +
                        affectedData.walls.affectedSqFt +
                        affectedData.ceiling.affectedSqFt;

  const percentAffected = (totalAffected / totalSurface) * 100;

  if (percentAffected > 40) return 3;      // Class 3
  if (percentAffected >= 5) return 2;      // Class 2
  return 1;                                 // Class 1
}

function calculateOverallClass(rooms) {
  return Math.max(...rooms.map(r => calculateRoomClass(r)));
}
```

### Dehumidifiers (per chamber)
```javascript
const chartFactors = {
  'LGR': { 1: 100, 2: 50, 3: 40, 4: 40 },
  'Conventional': { 1: 100, 2: 40, 3: 30, 4: 0 },
};

const ppdNeeded = chamberCubicFt / chartFactors[type][overallClass];
const dehusNeeded = Math.ceil(ppdNeeded / equipmentCapacity);
```

### Air Movers (per room)
```javascript
const baseMovers = 1;  // One per affected room
const floorMovers = Math.ceil(wetFloorSqFt / 60);
const wallMovers = Math.ceil(wetWallSqFt / 125);
const totalMovers = baseMovers + floorMovers + wallMovers;
```

### Air Scrubbers (per chamber)
```javascript
if (waterCategory >= 2) {
  const scrubbersNeeded = Math.ceil(totalAffectedSqFt / 250);
} else {
  const scrubbersNeeded = 0;  // Category 1 doesn't need scrubbers
}
```

---

**PLEASE ANSWER THE 6 QUESTIONS ABOVE SO I CAN FIX THIS!** 🙏
