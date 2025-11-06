import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Thermometer, Droplets, Wind, Home, MapPin, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface EnvironmentalBaselineStepProps {
  job: any;
  onNext: () => void;
}

export const EnvironmentalBaselineStep: React.FC<EnvironmentalBaselineStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const rooms = installData.rooms || [];
  const referenceRoom = rooms.find((r: any) => r.isReferenceRoom);

  // Outside baseline
  const [outsideTemp, setOutsideTemp] = useState(installData.environmentalBaseline?.outside?.temperature || '');
  const [outsideHumidity, setOutsideHumidity] = useState(installData.environmentalBaseline?.outside?.humidity || '');

  // Reference room baseline (if exists)
  const [refRoomTemp, setRefRoomTemp] = useState(installData.environmentalBaseline?.referenceRoom?.temperature || '');
  const [refRoomHumidity, setRefRoomHumidity] = useState(installData.environmentalBaseline?.referenceRoom?.humidity || '');
  const [refRoomMoisture, setRefRoomMoisture] = useState(installData.environmentalBaseline?.referenceRoom?.moisture || '');

  useEffect(() => {
    updateWorkflowData('install', {
      environmentalBaseline: {
        outside: {
          temperature: parseFloat(outsideTemp) || 0,
          humidity: parseFloat(outsideHumidity) || 0,
          recordedAt: new Date().toISOString(),
        },
        referenceRoom: referenceRoom ? {
          roomId: referenceRoom.id,
          roomName: referenceRoom.name,
          temperature: parseFloat(refRoomTemp) || 0,
          humidity: parseFloat(refRoomHumidity) || 0,
          moisture: parseFloat(refRoomMoisture) || 0,
          recordedAt: new Date().toISOString(),
        } : null,
      },
    });
  }, [outsideTemp, outsideHumidity, refRoomTemp, refRoomHumidity, refRoomMoisture]);

  const getDewPoint = (temp: number, humidity: number) => {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  };

  const getGPP = (temp: number, humidity: number) => {
    // Grains Per Pound calculation (simplified)
    const saturationPressure = 6.112 * Math.exp((17.67 * temp) / (temp + 243.5));
    const vaporPressure = (humidity / 100) * saturationPressure;
    return (0.622 * vaporPressure) / (14.696 - vaporPressure) * 7000;
  };

  const outsideTempNum = parseFloat(outsideTemp) || 0;
  const outsideHumidityNum = parseFloat(outsideHumidity) || 0;
  const refTempNum = parseFloat(refRoomTemp) || 0;
  const refHumidityNum = parseFloat(refRoomHumidity) || 0;

  const outsideDewPoint = outsideTempNum && outsideHumidityNum ? getDewPoint(outsideTempNum, outsideHumidityNum) : null;
  const outsideGPP = outsideTempNum && outsideHumidityNum ? getGPP(outsideTempNum, outsideHumidityNum) : null;
  const refDewPoint = refTempNum && refHumidityNum ? getDewPoint(refTempNum, refHumidityNum) : null;
  const refGPP = refTempNum && refHumidityNum ? getGPP(refTempNum, refHumidityNum) : null;

  const allDataComplete = outsideTemp && outsideHumidity && (!referenceRoom || (refRoomTemp && refRoomHumidity && refRoomMoisture));

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Establish Environmental Baseline</h4>
            <p className="text-sm text-blue-800">
              Record outside conditions and reference room readings. These establish the dry standard baseline for all moisture comparisons throughout the job.
            </p>
          </div>
        </div>
      </div>

      {/* Outside Conditions */}
      <div className="border-2 border-blue-300 rounded-lg p-5 bg-blue-50">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Outside Conditions</h3>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Step outside and record the current outdoor temperature and relative humidity.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Outside Temperature (°F) *
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="72.5"
              value={outsideTemp}
              onChange={(e) => setOutsideTemp(e.target.value)}
              className="text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Outside Humidity (%) *
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="55"
              value={outsideHumidity}
              onChange={(e) => setOutsideHumidity(e.target.value)}
              className="text-lg"
            />
          </div>
        </div>

        {/* Psychrometric Calculations - Outside */}
        {outsideDewPoint !== null && outsideGPP !== null && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600">Dew Point</p>
              <p className="text-lg font-bold text-blue-900">{outsideDewPoint.toFixed(1)}°F</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600">GPP (Grains/Lb)</p>
              <p className="text-lg font-bold text-blue-900">{outsideGPP.toFixed(1)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Reference Room Baseline */}
      {referenceRoom ? (
        <div className="border-2 border-green-300 rounded-lg p-5 bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Reference Room: {referenceRoom.name}</h3>
          </div>
          <div className="bg-green-100 border border-green-200 rounded p-3 mb-4">
            <p className="text-sm text-green-800">
              ⭐ This room is <strong>unaffected by water damage</strong> and will serve as your dry standard baseline for the entire job.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Temperature (°F) *
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="70.0"
                value={refRoomTemp}
                onChange={(e) => setRefRoomTemp(e.target.value)}
                className="text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Humidity (%) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="45"
                value={refRoomHumidity}
                onChange={(e) => setRefRoomHumidity(e.target.value)}
                className="text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Wind className="w-4 h-4" />
                Moisture (%) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="8.5"
                value={refRoomMoisture}
                onChange={(e) => setRefRoomMoisture(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Drywall/wood moisture content</p>
            </div>
          </div>

          {/* Psychrometric Calculations - Reference Room */}
          {refDewPoint !== null && refGPP !== null && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-xs text-gray-600">Dew Point</p>
                <p className="text-lg font-bold text-green-900">{refDewPoint.toFixed(1)}°F</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-xs text-gray-600">GPP (Grains/Lb)</p>
                <p className="text-lg font-bold text-green-900">{refGPP.toFixed(1)}</p>
              </div>
            </div>
          )}

          {/* Dry Standard Target */}
          {refRoomMoisture && parseFloat(refRoomMoisture) > 0 && (
            <div className="mt-4 bg-white border-2 border-green-400 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✓ Dry Standard Established</h4>
              <p className="text-sm text-green-800">
                All affected materials must reach <strong>{parseFloat(refRoomMoisture).toFixed(1)}%</strong> moisture content (or lower) to be considered dry.
              </p>
              <p className="text-xs text-green-700 mt-2">
                IICRC Standard: Affected materials should be within +2% of unaffected baseline
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">No Reference Room Selected</h4>
              <p className="text-sm text-yellow-800">
                Go back to "Add Rooms" step and mark an unaffected room as the Reference Room to establish a dry standard baseline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {allDataComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">✓ Environmental Baseline Complete</h4>
              <p className="text-sm text-green-800">
                Baseline conditions recorded successfully. These values will be used throughout the job for comparison and dry standard determination.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Psychrometric Science Explanation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-600" />
          Why This Matters
        </h4>
        <div className="space-y-2 text-xs text-gray-700">
          <p>
            <strong>Dew Point:</strong> The temperature at which moisture condenses. Lower = better for drying.
          </p>
          <p>
            <strong>GPP (Grains Per Pound):</strong> Absolute humidity measurement. Tracks actual moisture in the air regardless of temperature.
          </p>
          <p>
            <strong>Reference Room:</strong> Establishes the "normal" moisture level for this structure. All affected materials must return to this baseline.
          </p>
        </div>
      </div>
    </div>
  );
};
