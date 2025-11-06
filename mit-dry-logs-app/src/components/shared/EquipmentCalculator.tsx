import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Wind, Droplets, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import {
  calculateChamberEquipment,
  ChamberCalculationInput,
  ChamberCalculationResult,
} from '../../utils/iicrcCalculations';
import { WaterCategory, WaterClass, DehumidifierType } from '../../types';

interface EquipmentCalculatorProps {
  rooms: any[];
  waterCategory?: WaterCategory;
  onCalculationComplete?: (result: ChamberCalculationResult) => void;
}

export const EquipmentCalculator: React.FC<EquipmentCalculatorProps> = ({
  rooms,
  waterCategory = 'Category 1',
  onCalculationComplete,
}) => {
  const [waterClass, setWaterClass] = useState<WaterClass>('Class 2');
  const [category, setCategory] = useState<WaterCategory>(waterCategory);
  const [dehumidifierType, setDehumidifierType] = useState<DehumidifierType>('Low Grain Refrigerant (LGR)');
  const [dehumidifierRating, setDehumidifierRating] = useState<number>(200);
  const [hasContainment, setHasContainment] = useState(false);
  const [result, setResult] = useState<ChamberCalculationResult | null>(null);

  const handleCalculate = () => {
    if (rooms.length === 0) {
      alert('Please add rooms before calculating equipment needs');
      return;
    }

    // Transform rooms data for calculation
    const chamberRooms = rooms.map(room => ({
      roomId: room.id || room.roomId,
      roomName: room.name || room.roomName,
      dimensions: {
        length: parseFloat(room.length) || 0,
        width: parseFloat(room.width) || 0,
        height: parseFloat(room.height) || 8,
        squareFootage: parseFloat(room.squareFootage) || 0,
      },
      wetFloorArea: parseFloat(room.squareFootage) || 0,
      wetWallCeilingArea: 0,
      linearWallFeet: 0,
    }));

    const input: ChamberCalculationInput = {
      chamberName: 'Chamber 1',
      rooms: chamberRooms,
      waterClass,
      waterCategory: category,
      dehumidifierType,
      dehumidifierRating,
      hasContainment,
    };

    const calculationResult = calculateChamberEquipment(input);
    setResult(calculationResult);

    if (onCalculationComplete) {
      onCalculationComplete(calculationResult);
    }
  };

  useEffect(() => {
    if (rooms.length > 0) {
      handleCalculate();
    }
  }, [rooms, waterClass, category, dehumidifierType, dehumidifierRating, hasContainment]);

  const totalArea = rooms.reduce((sum, r) => sum + (parseFloat(r.squareFootage) || 0), 0);
  const affectedPercentage = (totalArea / (totalArea + 100)) * 100; // Simplified calculation

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card title="IICRC S500 Configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Water Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WaterCategory)}
              className="input-field"
            >
              <option>Category 1</option>
              <option>Category 2</option>
              <option>Category 3</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {category === 'Category 1' && 'Clean water - no health risk'}
              {category === 'Category 2' && 'Gray water - contaminated'}
              {category === 'Category 3' && 'Black water - grossly contaminated'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Water Class *
            </label>
            <select
              value={waterClass}
              onChange={(e) => setWaterClass(e.target.value as WaterClass)}
              className="input-field"
            >
              <option>Class 1</option>
              <option>Class 2</option>
              <option>Class 3</option>
              <option>Class 4</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {waterClass === 'Class 1' && '< 5% of surfaces affected'}
              {waterClass === 'Class 2' && '5-40% of surfaces affected'}
              {waterClass === 'Class 3' && '> 40% of surfaces affected'}
              {waterClass === 'Class 4' && 'Deeply saturated materials'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dehumidifier Type *
            </label>
            <select
              value={dehumidifierType}
              onChange={(e) => setDehumidifierType(e.target.value as DehumidifierType)}
              className="input-field"
            >
              <option>Low Grain Refrigerant (LGR)</option>
              <option>Conventional Refrigerant</option>
              <option>Desiccant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dehumidifier Rating *
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={dehumidifierRating}
                onChange={(e) => setDehumidifierRating(parseInt(e.target.value))}
                placeholder="200"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {dehumidifierType === 'Desiccant' ? 'CFM' : 'PPD'}
              </span>
            </div>
          </div>

          {(category === 'Category 2' || category === 'Category 3') && (
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasContainment}
                  onChange={(e) => setHasContainment(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Containment barriers required
                </span>
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      {result && (
        <>
          <Card title="Equipment Requirements">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-900">{result.dehumidifiers.dehumidifierCount}</p>
                <p className="text-sm text-gray-600">Dehumidifiers</p>
                <p className="text-xs text-gray-500 mt-1">{result.dehumidifiers.ppdRequired.toFixed(0)} PPD required</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Wind className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-900">{result.airMovers.totalCount}</p>
                <p className="text-sm text-gray-600">Air Movers</p>
                <p className="text-xs text-gray-500 mt-1">{totalArea.toFixed(0)} sq ft coverage</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Wind className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-900">{result.airScrubbers.count}</p>
                <p className="text-sm text-gray-600">Air Scrubbers</p>
                <p className="text-xs text-gray-500 mt-1">
                  {result.airScrubbers.required ? 'Required' : 'Optional'}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Calculation Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Total Cubic Footage:</span>
                  <span className="font-medium text-gray-900">{result.totalCubicFootage.toFixed(0)} cf</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Total Affected Area:</span>
                  <span className="font-medium text-gray-900">{result.totalAffectedArea.toFixed(0)} sq ft</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Chart Factor ({waterClass}):</span>
                  <span className="font-medium text-gray-900">{result.dehumidifiers.chartFactor}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Estimated Drying Time:</span>
                  <span className="font-medium text-gray-900">{result.estimatedDryingDays} days</span>
                </div>
              </div>
            </div>

            {/* Formula */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-mono text-gray-600">{result.dehumidifiers.formula}</p>
            </div>
          </Card>

          {/* Recommendations */}
          <Card title="IICRC Recommendations">
            <div className="space-y-2">
              {result.recommendations.map((rec, index) => {
                const isWarning = rec.includes('⚠️');
                const isSuccess = rec.includes('✓');

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      isWarning
                        ? 'bg-yellow-50 border border-yellow-200'
                        : isSuccess
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    {isWarning ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    ) : isSuccess ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${
                      isWarning ? 'text-yellow-800' : isSuccess ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      {rec.replace('⚠️', '').replace('✓', '').trim()}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Source:</strong> ANSI/IICRC S500-2021 Standard for Professional Water Damage Restoration
              </p>
            </div>
          </Card>
        </>
      )}

      {rooms.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <Wind className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No rooms added yet</p>
            <p className="text-sm text-gray-500">Add rooms in the previous step to calculate equipment needs</p>
          </div>
        </Card>
      )}
    </div>
  );
};
