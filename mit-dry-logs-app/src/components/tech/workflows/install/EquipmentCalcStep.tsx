import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '../../../shared/Button';
import { Wind, AlertCircle, Info, Calculator, CheckCircle } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { DehumidifierType, DryingChamber } from '../../../../types';
import { calculateChamberEquipment } from '../../../../utils/iicrcCalculations';

interface EquipmentCalcStepProps {
  job: any;
  onNext: () => void;
}

interface RoomData {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  insetsCubicFt?: number;
  offsetsCubicFt?: number;
  affectedFloorSqFt?: number;
  affectedWallsSqFt?: number;
  affectedCeilingSqFt?: number;
  damageClass?: 1 | 2 | 3 | 4;
  percentAffected?: number;
}

interface RoomAirMoverPlacement {
  roomName: string;
  total: number;
  base: number;
  floor: number;
  wall: number;
  placement: string;
}

interface ChamberCalculations {
  chamberId: string;
  chamberName: string;
  cubicFootage: number;
  dehumidifiers: number;
  airMovers: number;
  airScrubbers: number;
  formula: string;
  breakdown: string[];
  roomPlacements: RoomAirMoverPlacement[];
}

export const EquipmentCalcStep: React.FC<EquipmentCalcStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();

  const chambers: DryingChamber[] = useMemo(() => installData.chambers || [], [installData.chambers]);
  // STANDARDIZED: Use 'rooms' key (with fallback for migration)
  const rooms: RoomData[] = useMemo(() => installData.rooms || installData.roomAssessments || [], [installData.rooms, installData.roomAssessments]);
  const waterClassification = useMemo(() => installData.waterClassification || {}, [installData.waterClassification]);
  const overallDamageClass = useMemo(() => installData.overallDamageClass || 1, [installData.overallDamageClass]);

  const [dehumidifierType, setDehumidifierType] = useState<DehumidifierType>('Low Grain Refrigerant (LGR)');
  const [dehumidifierRating, setDehumidifierRating] = useState(200); // PPD
  const [chamberCalculations, setChamberCalculations] = useState<ChamberCalculations[]>([]);

  const lastSavedCalculationsRef = useRef<string | null>(null);

  // Perform calculations for all chambers
  const performCalculations = () => {
    if (chambers.length === 0) {
      console.warn('📊 EquipmentCalcStep: No chambers defined');
      return;
    }

    const calculations: ChamberCalculations[] = chambers.map(chamber => {
      const chamberRooms = rooms.filter(r => chamber.assignedRooms.includes(r.id));

      // Calculate cubic footage for this chamber
      const cubicFootage = chamberRooms.reduce((total, room) => {
        const baseCubicFt = room.length * room.width * room.height;
        const insets = room.insetsCubicFt || 0;
        const offsets = room.offsetsCubicFt || 0;
        return total + baseCubicFt + insets - offsets;
      }, 0);

      // Get chart factor based on class and dehumidifier type
      const chartFactors: Record<string, Record<number, number>> = {
        'Conventional Refrigerant': { 1: 100, 2: 40, 3: 30, 4: 0 },
        'Low Grain Refrigerant (LGR)': { 1: 100, 2: 50, 3: 40, 4: 40 },
        'Desiccant': { 1: 1, 2: 2, 3: 3, 4: 3 },
      };

      const chartFactor = chartFactors[dehumidifierType]?.[overallDamageClass] || 50;

      // Calculate dehumidifiers
      let dehumidifierCount: number;
      let dehumidifierFormula: string;

      if (dehumidifierType === 'Desiccant') {
        const totalCfmRequired = (cubicFootage * chartFactor) / 60;
        dehumidifierCount = Math.ceil(totalCfmRequired / dehumidifierRating);
        dehumidifierFormula = `${cubicFootage.toFixed(0)} cf × ${chartFactor} ACH ÷ 60 = ${totalCfmRequired.toFixed(0)} CFM ÷ ${dehumidifierRating} CFM/unit = ${dehumidifierCount} units`;
      } else {
        const ppdRequired = cubicFootage / chartFactor;
        dehumidifierCount = Math.ceil(ppdRequired / dehumidifierRating);
        dehumidifierFormula = `${cubicFootage.toFixed(0)} cf ÷ ${chartFactor} = ${ppdRequired.toFixed(1)} PPD ÷ ${dehumidifierRating} PPD/unit = ${dehumidifierCount} units`;
      }

      // Calculate air movers per room with placement suggestions
      const roomPlacements: RoomAirMoverPlacement[] = chamberRooms.map(room => {
        const floorSqFt = room.affectedFloorSqFt || 0;
        const wallSqFt = room.affectedWallsSqFt || 0;

        const base = 1; // 1 per affected room
        const floor = Math.ceil(floorSqFt / 60);
        const wall = Math.ceil(wallSqFt / 125);
        const total = base + floor + wall;

        // Generate placement suggestion
        let placement = '';
        if (floor > 0 && wall > 0) {
          placement = `Place ${floor} on floor, ${wall} on walls${base > 0 ? ', 1 general circulation' : ''}`;
        } else if (floor > 0) {
          placement = `Place ${floor} on floor${base > 0 ? ', 1 general circulation' : ''}`;
        } else if (wall > 0) {
          placement = `Place ${wall} on walls${base > 0 ? ', 1 general circulation' : ''}`;
        } else if (base > 0) {
          placement = 'Place 1 for general air circulation';
        }

        return {
          roomName: room.name,
          total,
          base,
          floor,
          wall,
          placement
        };
      });

      const totalWetFloorArea = chamberRooms.reduce((sum, r) => sum + (r.affectedFloorSqFt || 0), 0);
      const totalWetWallArea = chamberRooms.reduce((sum, r) => sum + (r.affectedWallsSqFt || 0), 0);

      const totalAirMovers = roomPlacements.reduce((sum, p) => sum + p.total, 0);

      const airMoverBreakdown = [
        `Base (${chamberRooms.length} rooms): ${roomPlacements.reduce((sum, p) => sum + p.base, 0)}`,
        `Floor (${totalWetFloorArea.toFixed(0)} sf ÷ 60): ${roomPlacements.reduce((sum, p) => sum + p.floor, 0)}`,
        `Wall (${totalWetWallArea.toFixed(0)} sf ÷ 125): ${roomPlacements.reduce((sum, p) => sum + p.wall, 0)}`,
      ];

      // Calculate air scrubbers (FOR ALL WATER CATEGORIES)
      const totalAffectedArea = chamberRooms.reduce((sum, r) =>
        sum + (r.affectedFloorSqFt || 0) + (r.affectedWallsSqFt || 0) + (r.affectedCeilingSqFt || 0), 0
      );
      const airScrubberCount = Math.ceil(totalAffectedArea / 250);

      return {
        chamberId: chamber.chamberId,
        chamberName: chamber.chamberName,
        cubicFootage,
        dehumidifiers: dehumidifierCount,
        airMovers: totalAirMovers,
        airScrubbers: airScrubberCount,
        formula: dehumidifierFormula,
        breakdown: airMoverBreakdown,
        roomPlacements,
      };
    });

    setChamberCalculations(calculations);

    // Save to workflow store
    const calcString = JSON.stringify({
      perChamber: calculations,
      dehumidifierType,
      dehumidifierRating,
    });

    if (calcString !== lastSavedCalculationsRef.current) {
      console.log('📊 EquipmentCalcStep: Chamber calculations changed, saving to workflow store');
      lastSavedCalculationsRef.current = calcString;

      const totalEquipment = calculations.reduce(
        (totals, chamber) => ({
          dehumidifiers: totals.dehumidifiers + chamber.dehumidifiers,
          airMovers: totals.airMovers + chamber.airMovers,
          airScrubbers: totals.airScrubbers + chamber.airScrubbers,
        }),
        { dehumidifiers: 0, airMovers: 0, airScrubbers: 0 }
      );

      updateWorkflowData('install', {
        equipmentCalculations: {
          perChamber: calculations,
          total: totalEquipment,
          dehumidifierType,
          dehumidifierRating,
        },
      });
    }
  };

  // Recalculate when settings change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performCalculations();
    }, 100);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dehumidifierType, dehumidifierRating]);

  // Recalculate when chambers or rooms change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performCalculations();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [chambers, rooms, overallDamageClass]);

  // Validation
  if (chambers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
        <p className="text-gray-700 mb-2">
          No drying chambers defined. Please go back and complete the "Define Chambers" step first.
        </p>
      </div>
    );
  }

  if (!overallDamageClass) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
        <p className="text-gray-700 mb-2">
          Overall damage class not found. Please ensure you have:
        </p>
        <ul className="text-left text-sm text-gray-600 max-w-md mx-auto space-y-1">
          <li>• Completed room assessments with affected area inputs</li>
          <li>• Defined chambers and assigned all rooms</li>
        </ul>
      </div>
    );
  }

  const totalEquipment = chamberCalculations.reduce(
    (totals, chamber) => ({
      dehumidifiers: totals.dehumidifiers + chamber.dehumidifiers,
      airMovers: totals.airMovers + chamber.airMovers,
      airScrubbers: totals.airScrubbers + chamber.airScrubbers,
    }),
    { dehumidifiers: 0, airMovers: 0, airScrubbers: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">IICRC Equipment Calculations (Per Chamber)</h4>
            <p className="text-sm text-blue-800">
              Equipment quantities are calculated PER CHAMBER using ANSI/IICRC S500-2021 standards.
              Each chamber is calculated independently based on its cubic footage and damage class.
            </p>
          </div>
        </div>
      </div>

      {/* Global Settings */}
      <div className="border rounded-lg p-5 bg-white">
        <h3 className="font-semibold text-gray-900 mb-4">Dehumidifier Specifications (All Chambers)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dehumidifier Type
            </label>
            <select
              value={dehumidifierType}
              onChange={(e) => setDehumidifierType(e.target.value as DehumidifierType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option>Conventional Refrigerant</option>
              <option>Low Grain Refrigerant (LGR)</option>
              <option>Desiccant</option>
            </select>
          </div>
          {dehumidifierType !== 'Desiccant' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AHAM Rating (PPD)
              </label>
              <input
                type="number"
                min="50"
                max="1000"
                step="10"
                value={dehumidifierRating}
                onChange={(e) => setDehumidifierRating(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Per-Chamber Calculations */}
      {chamberCalculations.map((calc, index) => (
        <div key={calc.chamberId} className="border-2 border-gray-300 rounded-lg p-5 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Wind className="w-6 h-6 text-orange-600" />
              {calc.chamberName}
            </h3>
            <div className="text-sm text-gray-600">
              {calc.cubicFootage.toFixed(0)} cubic feet
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Dehumidifiers */}
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center">
              <Wind className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900">{calc.dehumidifiers}</p>
              <p className="text-sm text-blue-700 font-medium">Dehumidifiers</p>
            </div>

            {/* Air Movers */}
            <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 text-center">
              <Wind className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-900">{calc.airMovers}</p>
              <p className="text-sm text-orange-700 font-medium">Air Movers</p>
            </div>

            {/* Air Scrubbers */}
            <div className={`rounded-lg p-4 text-center ${
              calc.airScrubbers > 0
                ? 'bg-purple-100 border-2 border-purple-300'
                : 'bg-gray-100 border-2 border-gray-300'
            }`}>
              <Wind className={`w-6 h-6 mx-auto mb-2 ${
                calc.airScrubbers > 0 ? 'text-purple-600' : 'text-gray-400'
              }`} />
              <p className={`text-3xl font-bold ${
                calc.airScrubbers > 0 ? 'text-purple-900' : 'text-gray-500'
              }`}>{calc.airScrubbers}</p>
              <p className={`text-sm font-medium ${
                calc.airScrubbers > 0 ? 'text-purple-700' : 'text-gray-500'
              }`}>Air Scrubbers</p>
            </div>
          </div>

          {/* Calculation Details */}
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Dehumidifier Calculation:</p>
              <p className="text-xs font-mono text-gray-800">{calc.formula}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Air Mover Breakdown:</p>
              {calc.breakdown.map((line, idx) => (
                <p key={idx} className="text-xs font-mono text-gray-800">{line}</p>
              ))}
            </div>
            {/* Room-by-Room Placement Suggestions */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-900 mb-2">Air Mover Placement (Per Room):</p>
              <div className="space-y-1">
                {calc.roomPlacements.map((room, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                    <span className="text-xs font-medium text-gray-700">{room.roomName}:</span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-orange-700">{room.total} units</span>
                      <p className="text-xs text-gray-600 italic">{room.placement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Total Summary */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">Total Equipment Required</h4>
            <p className="text-sm text-green-800">
              Combined requirements across all {chamberCalculations.length} chamber(s)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 text-center">
            <p className="text-4xl font-bold text-blue-900">{totalEquipment.dehumidifiers}</p>
            <p className="text-sm text-gray-600 mt-1">Dehumidifiers</p>
          </div>
          <div className="bg-white border-2 border-orange-300 rounded-lg p-4 text-center">
            <p className="text-4xl font-bold text-orange-900">{totalEquipment.airMovers}</p>
            <p className="text-sm text-gray-600 mt-1">Air Movers</p>
          </div>
          <div className="bg-white border-2 border-purple-300 rounded-lg p-4 text-center">
            <p className="text-4xl font-bold text-purple-900">{totalEquipment.airScrubbers}</p>
            <p className="text-sm text-gray-600 mt-1">Air Scrubbers</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div></div>
        <Button variant="primary" onClick={onNext}>
          Continue to Equipment Placement
        </Button>
      </div>
    </div>
  );
};
