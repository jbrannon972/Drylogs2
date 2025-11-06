import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Wind, AlertCircle, Info, Calculator } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { DehumidifierType } from '../../../../types';

interface EquipmentCalcStepProps {
  job: any;
  onNext: () => void;
}

export const EquipmentCalcStep: React.FC<EquipmentCalcStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const dryingPlan = installData.dryingPlan || {};
  const waterClassification = installData.waterClassification || {};
  const rooms = installData.rooms || [];

  const [dehumidifierType, setDehumidifierType] = useState<DehumidifierType>('Low Grain Refrigerant (LGR)');
  const [dehumidifierRating, setDehumidifierRating] = useState(200); // PPD
  const [calculations, setCalculations] = useState<any>(null);

  // Calculate total cubic footage from all rooms
  const calculateCubicFootage = () => {
    return rooms.reduce((total: number, room: any) => {
      return total + (room.length * room.width * room.height);
    }, 0);
  };

  // Get IICRC chart factor based on class and dehumidifier type
  const getChartFactor = (damageClass: number, dehType: DehumidifierType): number => {
    const factors: Record<DehumidifierType, Record<number, number>> = {
      'Conventional Refrigerant': { 1: 100, 2: 40, 3: 30, 4: 30 },
      'Low Grain Refrigerant (LGR)': { 1: 100, 2: 50, 3: 40, 4: 40 },
      'Desiccant': { 1: 1, 2: 2, 3: 3, 4: 3 }, // ACH values
    };

    return factors[dehType]?.[damageClass] || 50;
  };

  // Perform IICRC calculations
  const performCalculations = () => {
    const cubicFootage = calculateCubicFootage();
    const damageClass = dryingPlan.overallClass || 2;
    const waterCategory = waterClassification.category || 1;
    const totalAffectedSqFt = dryingPlan.totalAffectedSqFt || 0;
    const totalFloorSqFt = dryingPlan.totalFloorSqFt || 0;
    const totalWallSqFt = dryingPlan.totalWallSqFt || 0;

    // DEHUMIDIFIER CALCULATION
    const chartFactor = getChartFactor(damageClass, dehumidifierType);
    let dehumidifierCount = 0;
    let calculationMethod = '';

    if (dehumidifierType === 'Desiccant') {
      // Desiccant uses ACH (Air Changes per Hour)
      const cfmRequired = (cubicFootage * chartFactor) / 60;
      dehumidifierCount = Math.ceil(cfmRequired / 2000); // Assuming 2000 CFM per desiccant unit
      calculationMethod = `Desiccant: ${cubicFootage} cf × ${chartFactor} ACH ÷ 60 = ${cfmRequired.toFixed(0)} CFM ÷ 2000 CFM/unit`;
    } else {
      // Refrigerant uses PPD (Pints Per Day)
      const ppdRequired = cubicFootage / chartFactor;
      dehumidifierCount = Math.ceil(ppdRequired / dehumidifierRating);
      calculationMethod = `${dehumidifierType}: ${cubicFootage} cf ÷ ${chartFactor} = ${ppdRequired.toFixed(0)} PPD ÷ ${dehumidifierRating} PPD/unit`;
    }

    // AIR MOVER CALCULATION
    // Base: 1 per room
    let airMoverCount = rooms.length;

    // Add based on floor area (1 per 60 sq ft of wet floor)
    const floorMovers = Math.ceil(totalFloorSqFt / 60);
    airMoverCount += floorMovers;

    // Add based on wall/ceiling area (1 per 125 sq ft)
    const wallCeilingMovers = Math.ceil(totalWallSqFt / 125);
    airMoverCount += wallCeilingMovers;

    const airMoverCalculation = `Base (${rooms.length} rooms) + Floor (${totalFloorSqFt.toFixed(0)} ÷ 60) + Walls (${totalWallSqFt.toFixed(0)} ÷ 125)`;

    // AIR SCRUBBER CALCULATION
    // Required for Category 2 or 3 water
    const airScrubberCount = (waterCategory >= 2)
      ? Math.ceil(totalAffectedSqFt / 250)
      : 0;

    const airScrubberCalculation = (waterCategory >= 2)
      ? `Category ${waterCategory}: ${totalAffectedSqFt.toFixed(0)} sq ft ÷ 250 sq ft/unit`
      : 'Not required for Category 1 water';

    const calc = {
      cubicFootage,
      totalAffectedSqFt,
      damageClass,
      waterCategory,
      dehumidifierType,
      dehumidifierRating,
      chartFactor,
      dehumidifiers: {
        count: dehumidifierCount,
        calculation: calculationMethod,
      },
      airMovers: {
        count: airMoverCount,
        calculation: airMoverCalculation,
      },
      airScrubbers: {
        count: airScrubberCount,
        calculation: airScrubberCalculation,
      },
    };

    setCalculations(calc);

    // Save to workflow store
    updateWorkflowData('install', {
      equipmentCalculations: calc,
    });
  };

  // Recalculate when dehumidifier settings change
  useEffect(() => {
    performCalculations();
  }, [dehumidifierType, dehumidifierRating, rooms, dryingPlan]);

  if (!dryingPlan.overallClass) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
        <p className="text-gray-700">
          Drying plan not found. Please complete the previous "Plan the Job" step first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">IICRC Equipment Calculations</h4>
            <p className="text-sm text-blue-800">
              Equipment quantities are calculated using ANSI/IICRC S500-2021 standards based on
              cubic footage, damage class, and affected areas.
            </p>
          </div>
        </div>
      </div>

      {/* Job Context */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 border rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Cubic Footage</p>
          <p className="text-2xl font-bold text-gray-900">{calculations?.cubicFootage.toFixed(0) || '0'}</p>
        </div>
        <div className="bg-gray-50 border rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Damage Class</p>
          <p className="text-2xl font-bold text-gray-900">Class {dryingPlan.overallClass}</p>
        </div>
        <div className="bg-gray-50 border rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Water Category</p>
          <p className="text-2xl font-bold text-gray-900">Cat {waterClassification.category}</p>
        </div>
      </div>

      {/* Dehumidifier Settings */}
      <div className="border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Dehumidifier Specifications</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dehumidifier Type
            </label>
            <select
              value={dehumidifierType}
              onChange={(e) => setDehumidifierType(e.target.value as DehumidifierType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
              />
            </div>
          )}
        </div>
      </div>

      {/* Calculations Results */}
      {calculations && (
        <div className="space-y-4">
          {/* Dehumidifiers */}
          <div className="border-2 border-blue-300 rounded-lg p-5 bg-blue-50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-600" />
                  Dehumidifiers
                </h3>
                <p className="text-xs text-gray-600">IICRC Chart Factor: {calculations.chartFactor}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-blue-900">{calculations.dehumidifiers.count}</p>
                <p className="text-sm text-gray-600">units</p>
              </div>
            </div>
            <div className="bg-white rounded p-3 mt-3">
              <p className="text-xs font-mono text-gray-700">
                {calculations.dehumidifiers.calculation}
              </p>
            </div>
          </div>

          {/* Air Movers */}
          <div className="border-2 border-orange-300 rounded-lg p-5 bg-orange-50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-orange-600" />
                  Air Movers
                </h3>
                <p className="text-xs text-gray-600">1 per room + floor/wall area coverage</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-orange-900">{calculations.airMovers.count}</p>
                <p className="text-sm text-gray-600">units</p>
              </div>
            </div>
            <div className="bg-white rounded p-3 mt-3">
              <p className="text-xs font-mono text-gray-700">
                {calculations.airMovers.calculation}
              </p>
            </div>
          </div>

          {/* Air Scrubbers */}
          <div className={`border-2 rounded-lg p-5 ${
            calculations.airScrubbers.count > 0
              ? 'border-purple-300 bg-purple-50'
              : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Wind className={`w-5 h-5 ${calculations.airScrubbers.count > 0 ? 'text-purple-600' : 'text-gray-400'}`} />
                  Air Scrubbers
                </h3>
                <p className="text-xs text-gray-600">
                  {calculations.airScrubbers.count > 0 ? 'Required for Category 2/3 water' : 'Not required for Category 1'}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${
                  calculations.airScrubbers.count > 0 ? 'text-purple-900' : 'text-gray-400'
                }`}>
                  {calculations.airScrubbers.count}
                </p>
                <p className="text-sm text-gray-600">units</p>
              </div>
            </div>
            <div className="bg-white rounded p-3 mt-3">
              <p className="text-xs font-mono text-gray-700">
                {calculations.airScrubbers.calculation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Total Equipment Summary */}
      {calculations && (
        <div className="bg-gradient-to-r from-entrusted-orange to-orange-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Total Equipment Required
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{calculations.dehumidifiers.count}</p>
              <p className="text-sm mt-1">Dehumidifiers</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{calculations.airMovers.count}</p>
              <p className="text-sm mt-1">Air Movers</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{calculations.airScrubbers.count}</p>
              <p className="text-sm mt-1">Air Scrubbers</p>
            </div>
          </div>
        </div>
      )}

      {/* IICRC Reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Calculation Standards</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <p>• <strong>Dehumidifiers:</strong> ANSI/IICRC S500-2021 Appendix B - Chart Factors</p>
          <p>• <strong>Air Movers:</strong> 1 per room + 1 per 60 sq ft floor + 1 per 125 sq ft walls/ceiling</p>
          <p>• <strong>Air Scrubbers:</strong> 1 per 250 sq ft for Category 2/3 water</p>
          <p className="mt-2">All calculations follow industry best practices and may be adjusted based on field conditions.</p>
        </div>
      </div>

      {/* Warning if no equipment calculated */}
      {calculations && (calculations.dehumidifiers.count === 0 || calculations.airMovers.count === 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">Warning: Insufficient Equipment</h4>
              <p className="text-sm text-red-800">
                The calculations show 0 equipment needed, which may indicate missing data.
                Please verify room dimensions and affected areas in previous steps.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
