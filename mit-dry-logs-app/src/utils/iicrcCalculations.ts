/**
 * IICRC S500-2021 Equipment Calculations
 *
 * This module implements IICRC-compliant equipment calculations for
 * water damage restoration. All calculations follow the ANSI/IICRC S500
 * Standard for Professional Water Damage Restoration.
 *
 * @see /IICRC_EQUIPMENT_CALCULATIONS.md for detailed documentation
 */

import { WaterCategory, WaterClass, DehumidifierType, RoomDimensions } from '../types';

// ============================================================================
// CHART FACTORS (IICRC S500 Appendix B)
// ============================================================================

interface ChartFactors {
  'Conventional Refrigerant': {
    'Class 1': number;
    'Class 2': number;
    'Class 3': number;
    'Class 4': number;
  };
  'Low Grain Refrigerant (LGR)': {
    'Class 1': number;
    'Class 2': number;
    'Class 3': number;
    'Class 4': number;
  };
  'Desiccant': {
    'Class 1': number;
    'Class 2': number;
    'Class 3': number;
    'Class 4': number;
  };
}

const CHART_FACTORS: ChartFactors = {
  'Conventional Refrigerant': {
    'Class 1': 100,
    'Class 2': 40,
    'Class 3': 30,
    'Class 4': 0, // Not recommended
  },
  'Low Grain Refrigerant (LGR)': {
    'Class 1': 100,
    'Class 2': 50,
    'Class 3': 40,
    'Class 4': 40,
  },
  'Desiccant': {
    'Class 1': 1,
    'Class 2': 2,
    'Class 3': 3,
    'Class 4': 3,
  },
};

// ============================================================================
// DEHUMIDIFIER CALCULATIONS
// ============================================================================

export interface DehumidifierCalculationInput {
  dimensions: RoomDimensions;
  waterClass: WaterClass;
  dehumidifierType: DehumidifierType;
  dehumidifierRating: number; // PPD (Pints Per Day) at AHAM conditions or CFM for desiccant
}

export interface DehumidifierCalculationResult {
  cubicFootage: number;
  chartFactor: number;
  ppdRequired: number;
  dehumidifierCount: number;
  formula: string;
}

export function calculateDehumidifiers(
  input: DehumidifierCalculationInput
): DehumidifierCalculationResult {
  const { dimensions, waterClass, dehumidifierType, dehumidifierRating } = input;

  // Calculate cubic footage
  const cubicFootage = dimensions.length * dimensions.width * dimensions.height;

  // Get chart factor
  const chartFactor = CHART_FACTORS[dehumidifierType][waterClass];

  if (chartFactor === 0) {
    throw new Error(`${dehumidifierType} is not recommended for ${waterClass}`);
  }

  let dehumidifierCount: number;
  let formula: string;
  let ppdRequired: number;

  if (dehumidifierType === 'Desiccant') {
    // Desiccant formula: Cubic Footage × ACH ÷ 60 = Total CFM Required
    const totalCfmRequired = (cubicFootage * chartFactor) / 60;
    dehumidifierCount = Math.ceil(totalCfmRequired / dehumidifierRating);
    ppdRequired = totalCfmRequired;
    formula = `${cubicFootage} cf × ${chartFactor} ACH ÷ 60 = ${totalCfmRequired} CFM ÷ ${dehumidifierRating} CFM/unit = ${dehumidifierCount} units`;
  } else {
    // Refrigerant formula: Cubic Footage ÷ Chart Factor = PPD Required
    ppdRequired = cubicFootage / chartFactor;
    dehumidifierCount = Math.ceil(ppdRequired / dehumidifierRating);
    formula = `${cubicFootage} cf ÷ ${chartFactor} = ${ppdRequired.toFixed(1)} PPD ÷ ${dehumidifierRating} PPD/unit = ${dehumidifierCount} units`;
  }

  return {
    cubicFootage,
    chartFactor,
    ppdRequired,
    dehumidifierCount,
    formula,
  };
}

// ============================================================================
// AIR MOVER CALCULATIONS
// ============================================================================

export interface AirMoverCalculationInput {
  wetFloorArea: number; // square feet
  wetWallCeilingArea: number; // square feet (above 2 feet)
  linearWallFeet?: number; // for vertical moisture migration
  roomCount: number;
}

export interface AirMoverCalculationResult {
  baseCount: number; // 1 per room
  floorCount: number;
  wallCeilingCount: number;
  linearWallCount: number;
  totalCount: number;
  breakdown: string[];
}

export function calculateAirMovers(
  input: AirMoverCalculationInput
): AirMoverCalculationResult {
  const { wetFloorArea, wetWallCeilingArea, linearWallFeet = 0, roomCount } = input;

  // Base: 1 air mover per affected room
  const baseCount = roomCount;

  // Floor: 1 air mover per 50-70 sq ft (using 60 as midpoint)
  const floorCount = Math.ceil(wetFloorArea / 60);

  // Wall/Ceiling: 1 air mover per 100-150 sq ft (using 125 as midpoint)
  const wallCeilingCount = Math.ceil(wetWallCeilingArea / 125);

  // Linear wall: 1 air mover per 14 linear feet
  const linearWallCount = linearWallFeet > 0 ? Math.ceil(linearWallFeet / 14) : 0;

  const totalCount = baseCount + floorCount + wallCeilingCount + linearWallCount;

  const breakdown = [
    `Base (rooms): ${baseCount}`,
    `Floor (${wetFloorArea} sf ÷ 60): ${floorCount}`,
    `Wall/Ceiling (${wetWallCeilingArea} sf ÷ 125): ${wallCeilingCount}`,
  ];

  if (linearWallCount > 0) {
    breakdown.push(`Linear wall (${linearWallFeet} lf ÷ 14): ${linearWallCount}`);
  }

  return {
    baseCount,
    floorCount,
    wallCeilingCount,
    linearWallCount,
    totalCount,
    breakdown,
  };
}

// ============================================================================
// AIR SCRUBBER CALCULATIONS
// ============================================================================

export interface AirScrubberCalculationInput {
  totalAffectedArea: number; // square feet
  waterCategory: WaterCategory;
  hasContainment: boolean;
}

export interface AirScrubberCalculationResult {
  required: boolean;
  count: number;
  reason: string;
}

export function calculateAirScrubbers(
  input: AirScrubberCalculationInput
): AirScrubberCalculationResult {
  const { totalAffectedArea, waterCategory, hasContainment } = input;

  // Air scrubbers required for Category 2 and 3 water
  const required = waterCategory === 'Category 2' || waterCategory === 'Category 3';

  if (!required) {
    return {
      required: false,
      count: 0,
      reason: 'Category 1 water (clean) - air scrubbers not required',
    };
  }

  // Industry standard: 1 air scrubber per 250 sq ft
  const count = Math.ceil(totalAffectedArea / 250);

  const reason = `${waterCategory} water requires air scrubbers. ${totalAffectedArea} sf ÷ 250 = ${count} unit(s)`;

  return {
    required,
    count,
    reason,
  };
}

// ============================================================================
// COMPREHENSIVE CHAMBER CALCULATION
// ============================================================================

export interface ChamberCalculationInput {
  chamberName: string;
  rooms: {
    roomId: string;
    roomName: string;
    dimensions: RoomDimensions;
    wetFloorArea: number;
    wetWallCeilingArea: number;
    linearWallFeet?: number;
  }[];
  waterClass: WaterClass;
  waterCategory: WaterCategory;
  dehumidifierType: DehumidifierType;
  dehumidifierRating: number;
  hasContainment: boolean;
}

export interface ChamberCalculationResult {
  chamberName: string;
  totalCubicFootage: number;
  totalAffectedArea: number;
  dehumidifiers: DehumidifierCalculationResult;
  airMovers: AirMoverCalculationResult;
  airScrubbers: AirScrubberCalculationResult;
  estimatedDryingDays: number;
  recommendations: string[];
}

export function calculateChamberEquipment(
  input: ChamberCalculationInput
): ChamberCalculationResult {
  const {
    chamberName,
    rooms,
    waterClass,
    waterCategory,
    dehumidifierType,
    dehumidifierRating,
    hasContainment,
  } = input;

  // Calculate totals across all rooms
  const totalCubicFootage = rooms.reduce(
    (sum, room) => sum + (room.dimensions.length * room.dimensions.width * room.dimensions.height),
    0
  );

  const totalAffectedArea = rooms.reduce(
    (sum, room) => sum + room.dimensions.squareFootage,
    0
  );

  const totalWetFloorArea = rooms.reduce((sum, room) => sum + room.wetFloorArea, 0);
  const totalWetWallCeilingArea = rooms.reduce((sum, room) => sum + room.wetWallCeilingArea, 0);
  const totalLinearWallFeet = rooms.reduce((sum, room) => sum + (room.linearWallFeet || 0), 0);

  // Calculate dehumidifiers
  const dehumidifiers = calculateDehumidifiers({
    dimensions: {
      length: 1,
      width: 1,
      height: totalCubicFootage, // Hack to pass total cubic footage
      squareFootage: totalAffectedArea,
    },
    waterClass,
    dehumidifierType,
    dehumidifierRating,
  });

  // Calculate air movers
  const airMovers = calculateAirMovers({
    wetFloorArea: totalWetFloorArea,
    wetWallCeilingArea: totalWetWallCeilingArea,
    linearWallFeet: totalLinearWallFeet,
    roomCount: rooms.length,
  });

  // Calculate air scrubbers
  const airScrubbers = calculateAirScrubbers({
    totalAffectedArea,
    waterCategory,
    hasContainment,
  });

  // Estimate drying days based on class
  const estimatedDryingDays = estimateDryingTime(waterClass, totalAffectedArea);

  // Generate recommendations
  const recommendations = generateRecommendations({
    waterClass,
    waterCategory,
    dehumidifierCount: dehumidifiers.dehumidifierCount,
    airMoverCount: airMovers.totalCount,
    airScrubberCount: airScrubbers.count,
    hasContainment,
  });

  return {
    chamberName,
    totalCubicFootage,
    totalAffectedArea,
    dehumidifiers,
    airMovers,
    airScrubbers,
    estimatedDryingDays,
    recommendations,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function estimateDryingTime(waterClass: WaterClass, affectedArea: number): number {
  // Industry estimates for drying time
  const baseDAYS: Record<WaterClass, number> = {
    'Class 1': 2,
    'Class 2': 3,
    'Class 3': 5,
    'Class 4': 7,
  };

  let days = baseDAYS[waterClass];

  // Add days for large areas
  if (affectedArea > 1000) {
    days += Math.ceil((affectedArea - 1000) / 500);
  }

  return days;
}

interface RecommendationInput {
  waterClass: WaterClass;
  waterCategory: WaterCategory;
  dehumidifierCount: number;
  airMoverCount: number;
  airScrubberCount: number;
  hasContainment: boolean;
}

function generateRecommendations(input: RecommendationInput): string[] {
  const recommendations: string[] = [];

  // Dehumidifier recommendations
  if (input.dehumidifierCount === 0) {
    recommendations.push('⚠️ No dehumidifiers calculated - verify room dimensions and water class');
  } else if (input.dehumidifierCount > 10) {
    recommendations.push(`Consider dividing into multiple drying chambers (${input.dehumidifierCount} dehumidifiers is high)`);
  }

  // Air mover recommendations
  if (input.airMoverCount < 2) {
    recommendations.push('⚠️ Minimum 2 air movers recommended for proper circulation');
  }

  // Air scrubber recommendations
  if ((input.waterCategory === 'Category 2' || input.waterCategory === 'Category 3') && input.airScrubberCount === 0) {
    recommendations.push(`⚠️ ${input.waterCategory} water requires air scrubbers for contamination control`);
  }

  // Containment recommendations
  if ((input.waterCategory === 'Category 2' || input.waterCategory === 'Category 3') && !input.hasContainment) {
    recommendations.push('Set up containment barriers for contaminated water');
  }

  // Class 4 recommendations
  if (input.waterClass === 'Class 4') {
    recommendations.push('Class 4 materials may require specialty drying methods (heat drying, injectidry)');
    recommendations.push('Consider extended drying time and additional moisture monitoring');
  }

  // Good configuration
  if (recommendations.length === 0) {
    recommendations.push('✓ Equipment configuration meets IICRC S500 standards');
  }

  return recommendations;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateWaterClass(affectedPercentage: number): WaterClass {
  if (affectedPercentage < 5) return 'Class 1';
  if (affectedPercentage <= 40) return 'Class 2';
  return 'Class 3';
}

export function requiresClass4Treatment(materialType: string): boolean {
  const class4Materials = ['hardwood', 'plaster', 'concrete', 'stone', 'brick'];
  return class4Materials.some(mat => materialType.toLowerCase().includes(mat));
}
