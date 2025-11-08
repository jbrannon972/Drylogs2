# ULTRAFIELD Moisture Tracking System

## Overview

The ULTRAFIELD Moisture Tracking System provides complete moisture reading continuity from Install through Pull, tracking individual construction materials over time with full historical records, trend analysis, and photo documentation.

## Key Principles

### 1. **Construction Materials Only**
- Only track materials that can hold moisture
- **INCLUDES:** Drywall, flooring, baseboards, insulation, cabinetry, subfloors, etc.
- **EXCLUDES:** Appliances, mirrors, fixtures, non-porous items

### 2. **One Material = One Record**
- Each material/location combination gets ONE tracking record
- All readings for that material are stored in a chronological timeline
- Dry standard is established once and persists throughout the job

### 3. **Complete Historical Tracking**
- Every reading is preserved with timestamp, photo, technician, and conditions
- Trends are automatically calculated based on reading history
- Full visibility from initial wet state to final dry verification

### 4. **ULTRAFIELD Workflow**
- Step-by-step, focused interface
- One task at a time to reduce errors
- Mobile-optimized for field use

## Data Structure

### MaterialMoistureTracking
```typescript
{
  id: string;                    // Unique ID for this material/location
  roomId: string;                // Which room
  roomName: string;              // Room name for display
  material: ConstructionMaterialType;  // Type of material
  location: string;              // Specific location (e.g., "North wall, 2ft height")
  dryStandard: number;           // Baseline from unaffected area (set once)
  readings: MoistureReadingEntry[];  // Timeline of all readings
  createdAt: string;             // When tracking started
  lastReadingAt: string;         // Last reading timestamp
  status: 'wet' | 'drying' | 'dry';  // Current status
  trend: 'improving' | 'stable' | 'worsening' | 'unknown';  // Trend direction
}
```

### MoistureReadingEntry
```typescript
{
  timestamp: string;             // ISO string
  moisturePercent: number;       // Moisture reading
  temperature: number;           // Temp in Fahrenheit
  humidity: number;              // Relative humidity %
  photo?: string;                // Photo URL
  technicianId: string;          // Who took the reading
  technicianName: string;        // Tech name for display
  workflowPhase: 'install' | 'check-service' | 'pull';  // Which phase
  visitNumber?: number;          // For check services (1, 2, 3, etc.)
  notes?: string;                // Optional notes
}
```

## Workflow Integration

### Install Workflow - Initial Moisture Mapping

**File:** `MoistureMappingStepNew.tsx`

**Purpose:** Establish initial moisture tracking for all affected construction materials

**ULTRAFIELD Flow:**
1. **Select Material** - Choose from construction materials only
2. **Specify Location** - Enter specific location (e.g., "North wall, 2ft height, grid A3")
3. **Dry Standard** - Take reading from unaffected area of same material
4. **Wet Reading** - Take reading from affected area at specified location
5. **Photo** - Capture moisture meter display
6. **Complete** - Save and add another or move to next room

**Key Features:**
- Only shows construction materials (filters out appliances, etc.)
- Forces specific location entry for future reference
- Requires dry standard before wet reading
- Encourages photo documentation
- Shows all existing readings for current room
- Room-by-room progress tracking

**Data Saved:**
```typescript
moistureTracking: MaterialMoistureTracking[]
```

### Check Service Workflow - Progress Tracking

**File:** `RoomReadingsStepNew.tsx`

**Purpose:** Update existing material readings and track drying progress

**Flow:**
1. Display all materials from Install with current status
2. Show full reading history for each material
3. For each material:
   - Display dry standard (from Install)
   - Show last reading and trend
   - Add new reading
   - Take photo (optional)
   - Save to timeline

**Key Features:**
- **Automatic Material Loading** - Shows all materials tracked in Install
- **Visual Trend Indicators:**
  - 🡇 Green arrow = Improving (getting drier)
  - → Gray dash = Stable (no significant change)
  - 🡅 Red arrow = Worsening (getting wetter)
- **Status Badges:**
  - ✓ DRY = Within 2% of dry standard OR below 12%
  - ✗ WET = Above dry standard threshold
- **Reading History Timeline** - Expandable view of all past readings
- **Progress Dashboard:**
  - Total materials tracked
  - Dry materials count
  - Materials updated today
  - Overall drying progress percentage

**Visit Tracking:**
- Each check service visit is numbered (1, 2, 3, etc.)
- Readings are tagged with visit number
- History shows which visit each reading was taken

### Pull Workflow - Final Verification

**File:** `FinalMoistureVerification.tsx`

**Purpose:** Verify all materials are dry before pulling equipment

**Flow:**
1. Display all tracked materials with complete history
2. Show initial reading vs current reading
3. Verify each material:
   - Take final reading
   - Capture final photo
   - Confirm dry status
4. Overall status check:
   - ✓ All dry = Can pull equipment
   - ✗ Some wet = WARNING - Do not pull

**Key Features:**
- **Complete History Display** - Shows all readings from Install to now
- **Total Reduction Tracking** - Shows moisture % drop from initial to current
- **Days Tracked** - Calculates total drying time
- **Safety Warnings:**
  - Red alert if materials still wet
  - Prevents premature equipment pull
  - Suggests actions (extend drying, check circulation, etc.)
- **Final Verification Status:**
  - Must verify ALL materials before proceeding
  - Clear visual confirmation when all materials dry

## Construction Material Types

Only these materials are available for moisture tracking:

### Flooring Materials
- Carpet & Pad
- Hardwood Flooring
- Vinyl/Linoleum Flooring
- Tile Flooring
- Laminate Flooring
- Engineered Flooring
- Subfloor

### Drywall & Ceiling
- Drywall - Wall
- Drywall - Ceiling

### Trim & Molding
- Baseboards
- Shoe Molding
- Crown Molding
- Door Casing
- Window Casing
- Chair Rail
- Other Trim

### Insulation
- Insulation - Wall
- Insulation - Ceiling/Attic

### Tile & Backsplash
- Tile Walls
- Backsplash
- Tub Surround

### Cabinetry
- Base Cabinets
- Upper Cabinets
- Vanity
- Countertops
- Shelving

**NOT Included:**
- Appliances (dishwasher, refrigerator, washer, dryer, etc.)
- Fixtures (sinks, tubs, toilets, etc.)
- Mirrors
- Towel bars/accessories
- Other non-porous items

## IICRC Standards

### Dry Standard Definition
Material is considered **DRY** when:
1. Within 2% of dry standard reading, OR
2. Below 12% moisture content (IICRC general guideline)

### Best Practices
- **Consistent Locations:** Return to same exact locations for all readings
- **Same Time Daily:** Take readings at consistent times for accurate trends
- **Grid System:** Use a grid pattern (A1, A2, B1, etc.) for location tracking
- **Photo Documentation:** Photograph meter display for every reading
- **Environmental Conditions:** Record temperature and humidity with each reading

## Benefits

### For Technicians
- **Clear Instructions:** Step-by-step workflow eliminates guesswork
- **No Re-entry:** Materials entered once in Install, reused in all phases
- **Visual Feedback:** Immediate trend indicators and status badges
- **Mobile Optimized:** Large buttons, simple forms, camera integration

### For PSM/Management
- **Complete History:** Full moisture timeline from start to finish
- **Trend Analysis:** See if materials are drying properly
- **Quality Control:** Photo documentation for every reading
- **Safety Checks:** Prevents premature equipment pull
- **Insurance Documentation:** Complete record for claim submission

### For Customers
- **Transparency:** Can see exactly what's being monitored
- **Confidence:** Visual proof of drying progress
- **Safety:** Equipment not pulled until verified dry
- **Quality:** IICRC-compliant monitoring process

## Technical Implementation

### Key Helper Functions

```typescript
// Check if material is dry
isMaterialDry(currentReading: number, dryStandard: number): boolean {
  return currentReading <= dryStandard + 2 || currentReading <= 12;
}

// Calculate trend between two readings
getMoistureTrend(current: number, previous: number): 'improving' | 'stable' | 'worsening' {
  const diff = current - previous;
  if (Math.abs(diff) <= 0.5) return 'stable';
  return diff < 0 ? 'improving' : 'worsening';
}
```

### Data Flow

1. **Install:** Create `MaterialMoistureTracking` records
   - Stored in: `installData.moistureTracking`

2. **Check Service:** Update existing records with new readings
   - Read from: `installData.moistureTracking`
   - Update: Add new `MoistureReadingEntry` to readings array
   - Write to: `installData.moistureTracking` (source of truth)

3. **Pull:** Final verification using existing records
   - Read from: `installData.moistureTracking`
   - Update: Add final readings
   - Validate: All materials dry before allowing proceed

### State Management (Zustand)

```typescript
// In workflowStore
installData: {
  moistureTracking: MaterialMoistureTracking[];
  // ... other install data
}

// Update function
updateWorkflowData('install', { moistureTracking: updatedArray });
```

## Migration Notes

### From Old System
- Old system had standalone readings in each phase
- New system has unified tracking across all phases
- Old data structure: `moistureReadings: MoistureReading[]`
- New data structure: `moistureTracking: MaterialMoistureTracking[]`

### Backwards Compatibility
- Old components remain in place: `MoistureMappingStep.tsx`, `RoomReadingsStep.tsx`
- New components use "New" suffix: `MoistureMappingStepNew.tsx`, etc.
- Workflows need to be updated to use new components

## Future Enhancements

1. **Visual Charts** - Graph showing moisture over time
2. **Predictive Analysis** - Estimate days until dry based on trend
3. **Auto-alerts** - Notify PSM if materials not drying as expected
4. **Export Reports** - Generate PDF moisture logs for insurance
5. **Comparison View** - Side-by-side room comparisons
6. **Equipment Correlation** - Link equipment placement to drying performance

## Files Changed/Created

### Created
- `/src/types/index.ts` - Added new types for moisture tracking
- `/src/components/tech/workflows/install/MoistureMappingStepNew.tsx` - New Install component
- `/src/components/tech/workflows/check-service/RoomReadingsStepNew.tsx` - New Check Service component
- `/src/components/tech/workflows/pull/FinalMoistureVerification.tsx` - New Pull component

### Documentation
- `/ULTRAFIELD_MOISTURE_TRACKING_SYSTEM.md` - This file

## Testing Checklist

- [ ] Install: Create tracking records for multiple materials in multiple rooms
- [ ] Check Service: Update existing records, verify trend calculations
- [ ] Pull: Verify final status, test warnings for wet materials
- [ ] Photo upload works in all phases
- [ ] Trends calculate correctly (improving/stable/worsening)
- [ ] Dry status calculates correctly (within 2% of dry standard OR <12%)
- [ ] History timeline shows all readings in correct order
- [ ] Room navigation works correctly
- [ ] Data persists across workflow phases
- [ ] Mobile responsive on actual devices

## Summary

The ULTRAFIELD Moisture Tracking System provides complete moisture reading continuity from Install through Pull. By tracking individual construction materials with full historical records, trend analysis, and photo documentation, it ensures IICRC-compliant drying verification while providing transparency for customers and complete documentation for insurance claims.

**Key Innovation:** One material = one record throughout entire job lifecycle, eliminating data re-entry and providing unprecedented visibility into the drying process.
