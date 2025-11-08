import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { FileCheck, AlertCircle, Info, Droplets, Layers, Home } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface PlanJobStepProps {
  job: any;
  onNext: () => void;
}

export const PlanJobStep: React.FC<PlanJobStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const rooms = installData.rooms || [];
  const roomsAffectedData = installData.roomsAffectedData || {};
  const moistureReadings = installData.moistureReadings || [];
  const waterClassification = installData.waterClassification;

  const [dryingPlan, setDryingPlan] = useState({
    estimatedDays: '',
    monitoringSchedule: 'daily' as 'daily' | 'twice-daily',
    targetMoisture: '12',
    completionCriteria: '',
  });

  // Calculate totals from all rooms
  const calculateTotals = () => {
    let totalFloorSqFt = 0;
    let totalWallSqFt = 0;
    let totalCeilingSqFt = 0;
    let totalAffectedSqFt = 0;
    let totalSurfaceArea = 0;
    let highestClass = 1;

    rooms.forEach((room: any) => {
      const affectedData = roomsAffectedData[room.id];
      if (affectedData) {
        totalFloorSqFt += affectedData.floor.affectedSqFt || 0;
        totalWallSqFt += affectedData.walls.affectedSqFt || 0;
        totalCeilingSqFt += affectedData.ceiling.affectedSqFt || 0;

        const roomAffected = (affectedData.floor.affectedSqFt || 0) +
                            (affectedData.walls.affectedSqFt || 0) +
                            (affectedData.ceiling.affectedSqFt || 0);
        totalAffectedSqFt += roomAffected;

        // Determine class for this room
        const roomTotal = room.totalSurfaceArea || 0;
        if (roomTotal > 0) {
          const percentAffected = (roomAffected / roomTotal) * 100;
          let roomClass = 1;
          if (percentAffected > 40) roomClass = 3;
          else if (percentAffected >= 5) roomClass = 2;

          if (roomClass > highestClass) highestClass = roomClass;
        }
      }
      totalSurfaceArea += room.totalSurfaceArea || 0;
    });

    return {
      totalFloorSqFt,
      totalWallSqFt,
      totalCeilingSqFt,
      totalAffectedSqFt,
      totalSurfaceArea,
      overallClass: highestClass,
    };
  };

  const totals = calculateTotals();

  // Count readings
  const totalReadings = moistureReadings.length;
  const dryStandards = moistureReadings.filter((r: any) => r.isDryStandard).length;
  const affectedReadings = totalReadings - dryStandards;

  // Save drying plan
  const handleSave = () => {
    const plan = {
      waterCategory: waterClassification?.category || 1,
      overallClass: totals.overallClass,
      totalFloorSqFt: totals.totalFloorSqFt,
      totalWallSqFt: totals.totalWallSqFt,
      totalCeilingSqFt: totals.totalCeilingSqFt,
      totalAffectedSqFt: totals.totalAffectedSqFt,
      estimatedDays: parseInt(dryingPlan.estimatedDays) || 3,
      monitoringSchedule: dryingPlan.monitoringSchedule,
      targetMoisture: parseFloat(dryingPlan.targetMoisture),
      completionCriteria: dryingPlan.completionCriteria,
      createdAt: new Date().toISOString(),
    };

    updateWorkflowData('install', { dryingPlan: plan });
  };

  useEffect(() => {
    handleSave();
  }, [dryingPlan]);

  // Determine default drying days based on class
  useEffect(() => {
    if (!dryingPlan.estimatedDays) {
      let defaultDays = '3';
      if (totals.overallClass === 1) defaultDays = '2';
      else if (totals.overallClass === 2) defaultDays = '3';
      else if (totals.overallClass === 3) defaultDays = '4';
      else if (totals.overallClass === 4) defaultDays = '5';
      setDryingPlan({ ...dryingPlan, estimatedDays: defaultDays });
    }
  }, [totals.overallClass]);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Review & Plan the Job</h4>
            <p className="text-sm text-blue-800">
              Review all collected data and set drying goals. This plan will guide equipment calculations
              and daily monitoring throughout the job.
            </p>
          </div>
        </div>
      </div>

      {/* Job Summary */}
      <div className="border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-entrusted-orange" />
          Job Summary
        </h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Water Classification */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Water Classification</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="text-lg font-bold text-gray-900">
                Category {waterClassification?.category || '?'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {waterClassification?.category === 1 && 'Clean Water'}
                {waterClassification?.category === 2 && 'Gray Water'}
                {waterClassification?.category === 3 && 'Black Water'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Overall Damage Class</h4>
            <div className={`rounded-lg p-3 ${
              totals.overallClass === 3 ? 'bg-red-50' :
              totals.overallClass === 2 ? 'bg-yellow-50' :
              'bg-green-50'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Class</p>
              <p className="text-lg font-bold text-gray-900">
                Class {totals.overallClass}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {totals.overallClass === 1 && '<5% of surfaces affected'}
                {totals.overallClass === 2 && '5-40% of surfaces affected'}
                {totals.overallClass === 3 && '>40% of surfaces affected'}
                {totals.overallClass === 4 && 'Deeply saturated materials'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Affected Areas Breakdown */}
      <div className="border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-entrusted-orange" />
          Affected Areas Breakdown
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">{totals.totalFloorSqFt.toFixed(0)}</p>
            <p className="text-sm text-gray-600 mt-1">Floor Sq Ft</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-900">{totals.totalWallSqFt.toFixed(0)}</p>
            <p className="text-sm text-gray-600 mt-1">Wall Sq Ft</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-900">{totals.totalCeilingSqFt.toFixed(0)}</p>
            <p className="text-sm text-gray-600 mt-1">Ceiling Sq Ft</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-900">{totals.totalAffectedSqFt.toFixed(0)}</p>
            <p className="text-sm text-gray-600 mt-1">Total Affected</p>
          </div>
        </div>
      </div>

      {/* Moisture Readings Summary */}
      <div className="border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-entrusted-orange" />
          Moisture Readings Summary
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalReadings}</p>
            <p className="text-sm text-gray-600 mt-1">Total Readings</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">{dryStandards}</p>
            <p className="text-sm text-gray-600 mt-1">Dry Standards</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-900">{affectedReadings}</p>
            <p className="text-sm text-gray-600 mt-1">Affected Readings</p>
          </div>
        </div>
      </div>

      {/* Rooms Summary */}
      <div className="border rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-entrusted-orange" />
          Rooms Summary
        </h3>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-center">
            <span className="text-3xl font-bold text-gray-900">{rooms.length}</span>
            <span className="text-gray-600 ml-2">rooms documented</span>
          </p>
        </div>

        <div className="space-y-2">
          {rooms.slice(0, 5).map((room: any) => {
            const affectedData = roomsAffectedData[room.id];
            const roomAffected = affectedData
              ? (affectedData.floor.affectedSqFt + affectedData.walls.affectedSqFt + affectedData.ceiling.affectedSqFt)
              : 0;
            return (
              <div key={room.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <span className="text-gray-700">{room.name}</span>
                <span className="font-medium text-gray-900">{roomAffected.toFixed(0)} sq ft affected</span>
              </div>
            );
          })}
          {rooms.length > 5 && (
            <p className="text-sm text-gray-500 text-center pt-2">
              + {rooms.length - 5} more rooms
            </p>
          )}
        </div>
      </div>

      {/* Drying Plan Settings */}
      <div className="border-2 border-entrusted-orange rounded-lg p-5 bg-orange-50">
        <h3 className="font-semibold text-gray-900 mb-4">Set Drying Goals</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimated Drying Days *"
              type="number"
              min="1"
              max="14"
              placeholder="3"
              value={dryingPlan.estimatedDays}
              onChange={(e) => setDryingPlan({ ...dryingPlan, estimatedDays: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monitoring Schedule *
              </label>
              <select
                value={dryingPlan.monitoringSchedule}
                onChange={(e) => setDryingPlan({ ...dryingPlan, monitoringSchedule: e.target.value as 'daily' | 'twice-daily' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
              >
                <option value="daily">Daily Check</option>
                <option value="twice-daily">Twice Daily</option>
              </select>
            </div>
          </div>

          <Input
            label="Target Moisture % (for completion)"
            type="number"
            step="0.1"
            min="0"
            max="20"
            value={dryingPlan.targetMoisture}
            onChange={(e) => setDryingPlan({ ...dryingPlan, targetMoisture: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Completion Criteria
            </label>
            <textarea
              value={dryingPlan.completionCriteria}
              onChange={(e) => setDryingPlan({ ...dryingPlan, completionCriteria: e.target.value })}
              rows={3}
              placeholder="e.g., All materials at or below dry standard + 2%, no visible moisture, psychrometric readings normal..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
            />
          </div>
        </div>
      </div>

      {/* Validation Warnings */}
      {totalReadings === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> No moisture readings recorded. Consider going back to add initial readings.
              </p>
            </div>
          </div>
        </div>
      )}

      {!waterClassification && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Water classification not set. Go back to specify category.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {totalReadings > 0 && waterClassification && totals.totalAffectedSqFt > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">Job Plan Complete</h4>
              <p className="text-sm text-green-800">
                All required data has been collected. Continue to calculate equipment needs based on this plan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
