import React, { useState } from 'react';
import { Cloud, Home, Info, AlertTriangle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface EnvironmentalCheckStepProps {
  job: any;
  onNext: () => void;
}

export const EnvironmentalCheckStep: React.FC<EnvironmentalCheckStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();

  // Outside conditions
  const [outsideTemp, setOutsideTemp] = useState('');
  const [outsideHumidity, setOutsideHumidity] = useState('');

  // Reference room (unaffected area)
  const [referenceRoom, setReferenceRoom] = useState('');
  const [referenceTemp, setReferenceTemp] = useState('');
  const [referenceHumidity, setReferenceHumidity] = useState('');

  React.useEffect(() => {
    updateWorkflowData('checkService', {
      environmental: {
        outsideTemp: parseFloat(outsideTemp) || 0,
        outsideHumidity: parseFloat(outsideHumidity) || 0,
        referenceRoom,
        referenceTemp: parseFloat(referenceTemp) || 0,
        referenceHumidity: parseFloat(referenceHumidity) || 0,
        timestamp: new Date().toISOString(),
      },
    });
  }, [outsideTemp, outsideHumidity, referenceRoom, referenceTemp, referenceHumidity]);

  const isHighHumidity = () => {
    const refRH = parseFloat(referenceHumidity);
    return refRH > 60;
  };

  const getIdealRange = () => {
    // IICRC S500 standard: 30-60% RH, 70-75°F
    return {
      tempMin: 70,
      tempMax: 75,
      rhMin: 30,
      rhMax: 60,
    };
  };

  const isOutOfRange = (temp: string, humidity: string) => {
    const t = parseFloat(temp);
    const h = parseFloat(humidity);
    const ideal = getIdealRange();
    return t < ideal.tempMin || t > ideal.tempMax || h < ideal.rhMin || h > ideal.rhMax;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Environmental Baseline</h4>
            <p className="text-sm text-blue-800">
              Record outside conditions and unaffected reference room for comparison. This establishes your drying baseline per IICRC S500 standards.
            </p>
          </div>
        </div>
      </div>

      {/* IICRC Standard Reference */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">IICRC S500 Standard</h3>
        <p className="text-sm text-gray-700 mb-2">Ideal Drying Conditions:</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Temperature: 70-75°F</li>
          <li>• Relative Humidity: 30-60%</li>
          <li>• Reference room should be unaffected by water damage</li>
        </ul>
      </div>

      {/* Outside Conditions */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Outside Conditions</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°F) *
            </label>
            <Input
              type="number"
              step="0.1"
              value={outsideTemp}
              onChange={(e) => setOutsideTemp(e.target.value)}
              placeholder="72.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Humidity (%) *
            </label>
            <Input
              type="number"
              step="0.1"
              value={outsideHumidity}
              onChange={(e) => setOutsideHumidity(e.target.value)}
              placeholder="45.0"
            />
          </div>
        </div>
      </div>

      {/* Reference Room */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Reference Room (Unaffected)</h3>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Room Name *
          </label>
          <Input
            type="text"
            value={referenceRoom}
            onChange={(e) => setReferenceRoom(e.target.value)}
            placeholder="e.g., Master Bedroom (upstairs)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Choose a room with no water damage for baseline comparison
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°F) *
            </label>
            <Input
              type="number"
              step="0.1"
              value={referenceTemp}
              onChange={(e) => setReferenceTemp(e.target.value)}
              placeholder="72.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Humidity (%) *
            </label>
            <Input
              type="number"
              step="0.1"
              value={referenceHumidity}
              onChange={(e) => setReferenceHumidity(e.target.value)}
              placeholder="45.0"
            />
          </div>
        </div>

        {referenceTemp && referenceHumidity && isOutOfRange(referenceTemp, referenceHumidity) && (
          <div className="mt-3 flex items-start gap-2 text-orange-600 bg-orange-50 p-3 rounded">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Conditions outside IICRC ideal range</p>
              <p className="text-xs mt-1">
                May require additional equipment or HVAC adjustment for optimal drying
              </p>
            </div>
          </div>
        )}

        {referenceHumidity && isHighHumidity() && (
          <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">High ambient humidity detected ({referenceHumidity}%)</p>
              <p className="text-xs mt-1">
                Consider adding dehumidifiers or increasing ventilation. High humidity will slow drying progress.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Data Capture Summary */}
      {referenceRoom && referenceTemp && referenceHumidity && outsideTemp && outsideHumidity && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">
            ✓ Environmental baseline recorded
          </p>
          <p className="text-xs text-green-700 mt-1">
            All moisture readings will be compared against these conditions
          </p>
        </div>
      )}
    </div>
  );
};
