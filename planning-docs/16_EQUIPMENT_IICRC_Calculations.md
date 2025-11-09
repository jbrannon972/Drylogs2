# IICRC S500 Equipment Calculations Reference
## For MIT Dry Logs App Implementation

**Source:** ANSI/IICRC S500-2021 Standard for Professional Water Damage Restoration

---

## Water Damage Classifications

### Water Categories
- **Category 1 (Clean Water):** Originates from sanitary source, no health risk
- **Category 2 (Gray Water):** Contains contamination, potential health risk
- **Category 3 (Black Water):** Grossly contaminated, serious health risk

### Water Damage Classes
- **Class 1:** Less than 5% of surfaces affected (minimal absorption)
- **Class 2:** 5% to 40% of surfaces affected (moisture in materials)
- **Class 3:** More than 40% of surfaces affected (water saturates walls, ceilings)
- **Class 4:** Deeply saturated materials (hardwood, plaster, concrete)

---

## DEHUMIDIFIER CALCULATIONS

### Chart Factors by Class and Type

| Dehumidifier Type | Class 1 | Class 2 | Class 3 | Class 4 |
|-------------------|---------|---------|---------|---------|
| **Conventional Refrigerant** | 100 | 40 | 30 | N/A |
| **Low Grain Refrigerant (LGR)** | 100 | 50 | 40 | 40 |
| **Desiccant** | 1 ACH | 2 ACH | 3 ACH | 3 ACH |

### Calculation Formulas

**For Refrigerant Dehumidifiers (Conventional & LGR):**
```
Cubic Footage ÷ Chart Factor = Total PPD Required
Total PPD Required ÷ Dehumidifier AHAM Rating = Number of Dehumidifiers
```

**For Desiccant Dehumidifiers:**
```
Cubic Footage × ACH ÷ 60 = Total CFM Required
Total CFM Required ÷ Dehumidifier CFM Rating = Number of Dehumidifiers
```

### Example Calculation

**Scenario:**
- Room: 30' × 50' × 8' ceiling = 12,000 cubic feet
- Class: 2 (5-40% affected)
- Dehumidifier: LGR rated at 200 PPD (AHAM)

**Calculation:**
```
12,000 cf ÷ 50 (LGR Class 2 factor) = 240 PPD required
240 PPD ÷ 200 PPD (per unit) = 1.2 dehumidifiers
Round up to 2 dehumidifiers
```

### Critical Rules
- ✅ Always calculate cubic footage (L × W × H), not just square footage
- ✅ Always round up fractions to whole numbers
- ✅ Calculate per drying chamber, not entire structure
- ✅ Adjust based on psychrometric readings and material types

---

## AIR MOVER CALCULATIONS

### Primary Formula (Per Room)

**Base Rule:**
```
1 air mover per affected room (minimum)
```

**Additional Air Movers:**
```
+ 1 air mover per 50-70 sq ft of wet floor
+ 1 air mover per 100-150 sq ft of wet ceiling/upper walls
+ 1 air mover per 14 linear feet of affected wall (for vertical moisture)
```

### Industry Guidelines
- Hard flooring: 1 air mover per 400-500 sq ft
- Carpeted areas: 1 air mover per 300 sq ft
- Based on 2,800 CFM fan strength

### Example Calculation

**Scenario:**
- Room: Master Bedroom, 20' × 15' = 300 sq ft
- Wet floor: 200 sq ft
- Wet walls: 100 sq ft (upper)

**Calculation:**
```
1 air mover (base for room)
+ 200 sq ft floor ÷ 60 = 3.33 → 4 air movers
+ 100 sq ft walls ÷ 125 = 0.8 → 1 air mover
Total: 1 + 4 + 1 = 6 air movers
```

### Placement Best Practices
- Point air movers in same direction
- Deliver air at 5-45 degree angle
- Create linear airflow path of 10-16 feet
- Position to maximize evaporation from wet surfaces
- Always calculate room-by-room, never sum entire structure

---

## AIR SCRUBBER CALCULATIONS

### When Required
- ✅ Category 2 or 3 water (contaminated)
- ✅ Drawing air from potentially contaminated cavities
- ✅ During demolition (even if contained)
- ✅ Customer health concerns present
- ✅ Visible mold or particulate in air

### Calculation Formula

**Industry Standard:**
```
1 air scrubber per 250 sq ft of affected area
```

**Negative Pressure Applications:**
```
Air scrubber CFM should exceed total air mover CFM in chamber by 10-20%
```

### Example Calculation

**Scenario:**
- Affected area: 1,200 sq ft
- Category: 3 (black water)
- Containment required

**Calculation:**
```
1,200 sq ft ÷ 250 = 4.8 → 5 air scrubbers
```

### Placement Guidelines
- Position to capture aerosolized particles
- Use inline HEPA filters when exhausting contaminated cavities
- Create negative pressure in contaminated zones
- Professional judgment based on:
  - AFD capacity (CFM rating)
  - Structural obstructions
  - Level of contamination
  - Size of containment area

---

## IMPLEMENTATION NOTES FOR APP

### Required Inputs
1. **Room dimensions** (length, width, height)
2. **Water category** (1, 2, or 3)
3. **Water damage class** (1, 2, 3, or 4)
4. **Affected areas:**
   - Floor square footage
   - Wall square footage
   - Ceiling square footage
5. **Dehumidifier specifications:**
   - Type (Conventional, LGR, Desiccant)
   - AHAM rating (PPD) or CFM rating

### Calculation Logic Flow

```typescript
// 1. Calculate cubic footage
const cubicFootage = length * width * height;

// 2. Select chart factor based on class + dehumidifier type
const chartFactor = getChartFactor(damageClass, dehumidifierType);

// 3. Calculate dehumidifiers
const ppdRequired = cubicFootage / chartFactor;
const dehumidifierCount = Math.ceil(ppdRequired / dehumidifierRating);

// 4. Calculate air movers
let airMoverCount = 1; // Base per room
airMoverCount += Math.ceil(wetFloorArea / 60);
airMoverCount += Math.ceil(wetWallCeilingArea / 125);

// 5. Calculate air scrubbers (if Category 2 or 3)
const airScrubberCount = waterCategory >= 2
  ? Math.ceil(totalAffectedArea / 250)
  : 0;
```

### Validation Rules
- ❌ Prevent negative dimensions
- ❌ Prevent invalid class/category combinations
- ✅ Always round up equipment counts
- ✅ Show warnings for unusual configurations
- ✅ Allow override with justification notes

### Display Requirements
- Show calculation breakdown (transparent to user)
- Display IICRC standard reference
- Indicate recommended vs. actual equipment placed
- Flag when actual < recommended (red flag)

---

## ADJUSTMENT TRIGGERS

Per IICRC S500 Section 12.1.25:
> "If moisture measurements do not confirm satisfactory drying, restorers should adjust drying procedures and equipment placement, or possibly add or change equipment to increase drying capability."

### App Should Monitor:
1. Daily moisture readings not decreasing
2. Humidity levels not improving
3. Temperature outside ideal range (70-90°F)
4. Equipment running less than expected hours
5. Psychrometric readings indicating insufficient capacity

### Red Flags to Display:
- ⚠️ Equipment count below IICRC recommendation
- ⚠️ No progress in moisture readings after 48 hours
- ⚠️ Humidity above 50% after 72 hours
- ⚠️ Equipment not scanned/verified at install

---

## REFERENCES

- ANSI/IICRC S500-2021: Standard for Professional Water Damage Restoration
- IICRC Approved Calculation Sheets (2024)
- US Imperial Initial Dehumidification Recommendation Factors and Formulas (Rev 3.1.22)

**Last Updated:** November 2025
**Implementation:** MIT Dry Logs App v1.0
