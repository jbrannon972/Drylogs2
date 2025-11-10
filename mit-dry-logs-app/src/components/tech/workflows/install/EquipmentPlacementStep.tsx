import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../shared/Button';
import {
  Wind, AlertCircle, Info, CheckCircle, QrCode, Plus, X, Camera
} from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { DryingChamber } from '../../../../types';

interface EquipmentPlacementStepProps {
  job: any;
  onNext: () => void;
}

interface PlacedEquipment {
  id: string;
  type: 'dehumidifier' | 'air-mover' | 'air-scrubber';
  serialNumber: string;
  assignedChamberId: string;
  assignedRoomId?: string;
  placedAt: Date;
  status: 'in-service';
}

export const EquipmentPlacementStep: React.FC<EquipmentPlacementStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();

  // Get data from previous steps
  const chambers: DryingChamber[] = installData.chambers || [];
  const rooms = installData.rooms || installData.roomAssessments || [];
  const equipmentCalc = installData.equipmentCalculations || null;

  // State
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>(
    installData.placedEquipment || []
  );
  const [selectedChamberId, setSelectedChamberId] = useState<string | null>(
    chambers.length > 0 ? chambers[0].chamberId : null
  );
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanningFor, setScanningFor] = useState<'dehumidifier' | 'air-mover' | 'air-scrubber' | null>(null);
  const [manualSerialInput, setManualSerialInput] = useState('');

  // Auto-save with ref-based change detection
  const prevDataRef = useRef({
    placedEquipment: JSON.stringify(installData.placedEquipment || [])
  });

  useEffect(() => {
    const currentStr = JSON.stringify(placedEquipment);

    if (prevDataRef.current.placedEquipment !== currentStr) {
      const timeoutId = setTimeout(() => {
        updateWorkflowData('install', {
          placedEquipment: placedEquipment
        });
        prevDataRef.current.placedEquipment = currentStr;
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [placedEquipment, updateWorkflowData]);

  // Get equipment counts for selected chamber
  const getEquipmentNeeded = () => {
    if (!equipmentCalc || !selectedChamberId) return null;

    const chamberCalc = equipmentCalc.perChamber.find(
      (c: any) => c.chamberId === selectedChamberId
    );

    if (!chamberCalc) return null;

    const placed = placedEquipment.filter(e => e.assignedChamberId === selectedChamberId);

    return {
      dehumidifiers: {
        needed: chamberCalc.dehumidifiers,
        placed: placed.filter(e => e.type === 'dehumidifier').length,
      },
      airMovers: {
        needed: chamberCalc.airMovers,
        placed: placed.filter(e => e.type === 'air-mover').length,
      },
      airScrubbers: {
        needed: chamberCalc.airScrubbers,
        placed: placed.filter(e => e.type === 'air-scrubber').length,
      },
    };
  };

  const openScanner = (type: 'dehumidifier' | 'air-mover' | 'air-scrubber') => {
    setScanningFor(type);
    setShowScanModal(true);
    setManualSerialInput('');
  };

  const handleScan = (serialNumber: string) => {
    if (!selectedChamberId || !scanningFor) return;

    const newEquipment: PlacedEquipment = {
      id: `equipment-${Date.now()}`,
      type: scanningFor,
      serialNumber: serialNumber.trim(),
      assignedChamberId: selectedChamberId,
      placedAt: new Date(),
      status: 'in-service',
    };

    setPlacedEquipment([...placedEquipment, newEquipment]);
    setShowScanModal(false);
    setScanningFor(null);
    setManualSerialInput('');
  };

  const handleManualAdd = () => {
    if (!manualSerialInput.trim()) {
      alert('Please enter a serial number');
      return;
    }

    handleScan(manualSerialInput);
  };

  const removeEquipment = (id: string) => {
    if (confirm('Remove this equipment from the job?')) {
      setPlacedEquipment(placedEquipment.filter(e => e.id !== id));
    }
  };

  const selectedChamber = chambers.find(c => c.chamberId === selectedChamberId);
  const equipmentNeeded = getEquipmentNeeded();

  if (!equipmentCalc) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Equipment Not Calculated</h4>
              <p className="text-sm text-yellow-800">
                Please complete the Equipment Calculation step first.
              </p>
            </div>
          </div>
        </div>
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
            <h4 className="font-medium text-blue-900 mb-1">Place Equipment by Chamber</h4>
            <p className="text-sm text-blue-800">
              Scan or manually enter serial numbers for each piece of equipment.
              Equipment will be marked "in service" and assigned to the selected chamber.
            </p>
          </div>
        </div>
      </div>

      {/* Chamber Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Chamber
        </label>
        <div className="grid grid-cols-2 gap-2">
          {chambers.map(chamber => (
            <button
              key={chamber.chamberId}
              onClick={() => setSelectedChamberId(chamber.chamberId)}
              className={`p-3 rounded-lg border-2 transition-colors text-left ${
                selectedChamberId === chamber.chamberId
                  ? 'border-entrusted-orange bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{chamber.chamberName}</div>
              <div className="text-xs text-gray-600">
                {chamber.assignedRooms.length} room(s)
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Needed Summary */}
      {selectedChamber && equipmentNeeded && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            {selectedChamber.chamberName} - Equipment Needed
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {equipmentNeeded.dehumidifiers.placed}/{equipmentNeeded.dehumidifiers.needed}
              </div>
              <div className="text-sm text-gray-600">Dehumidifiers</div>
              {equipmentNeeded.dehumidifiers.placed >= equipmentNeeded.dehumidifiers.needed && (
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mt-1" />
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {equipmentNeeded.airMovers.placed}/{equipmentNeeded.airMovers.needed}
              </div>
              <div className="text-sm text-gray-600">Air Movers</div>
              {equipmentNeeded.airMovers.placed >= equipmentNeeded.airMovers.needed && (
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mt-1" />
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {equipmentNeeded.airScrubbers.placed}/{equipmentNeeded.airScrubbers.needed}
              </div>
              <div className="text-sm text-gray-600">Air Scrubbers</div>
              {equipmentNeeded.airScrubbers.placed >= equipmentNeeded.airScrubbers.needed && (
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mt-1" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Buttons */}
      {selectedChamberId && (
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="secondary"
            onClick={() => openScanner('dehumidifier')}
            className="flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Add Dehumidifier
          </Button>
          <Button
            variant="secondary"
            onClick={() => openScanner('air-mover')}
            className="flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Add Air Mover
          </Button>
          <Button
            variant="secondary"
            onClick={() => openScanner('air-scrubber')}
            className="flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Add Air Scrubber
          </Button>
        </div>
      )}

      {/* Placed Equipment List */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          Placed Equipment ({placedEquipment.length} total)
        </h3>
        {placedEquipment.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Wind className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-600">No equipment placed yet</p>
            <p className="text-sm text-gray-500">Scan or add equipment above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {placedEquipment.map(equipment => {
              const chamber = chambers.find(c => c.chamberId === equipment.assignedChamberId);
              const typeLabels = {
                'dehumidifier': '🌬️ Dehumidifier',
                'air-mover': '💨 Air Mover',
                'air-scrubber': '🔄 Air Scrubber',
              };

              return (
                <div
                  key={equipment.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {typeLabels[equipment.type]}
                    </div>
                    <div className="text-sm text-gray-600">
                      S/N: {equipment.serialNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {chamber?.chamberName || 'Unknown Chamber'} • In Service
                    </div>
                  </div>
                  <button
                    onClick={() => removeEquipment(equipment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Overall Progress */}
      {equipmentCalc.total && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Overall Progress</h4>
          <div className="space-y-1 text-sm text-green-800">
            <p>
              • Dehumidifiers: {placedEquipment.filter(e => e.type === 'dehumidifier').length}/{equipmentCalc.total.dehumidifiers}
            </p>
            <p>
              • Air Movers: {placedEquipment.filter(e => e.type === 'air-mover').length}/{equipmentCalc.total.airMovers}
            </p>
            <p>
              • Air Scrubbers: {placedEquipment.filter(e => e.type === 'air-scrubber').length}/{equipmentCalc.total.airScrubbers}
            </p>
          </div>
        </div>
      )}

      {/* Scan/Manual Entry Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Add {scanningFor === 'dehumidifier' ? 'Dehumidifier' : scanningFor === 'air-mover' ? 'Air Mover' : 'Air Scrubber'}
              </h3>
              <button
                onClick={() => setShowScanModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* QR Scanner Placeholder */}
            <div className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
              <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">QR Scanner Would Appear Here</p>
              <p className="text-xs text-gray-500 mt-1">Use manual entry below for now</p>
            </div>

            {/* Manual Entry */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={manualSerialInput}
                  onChange={(e) => setManualSerialInput(e.target.value)}
                  placeholder="Enter or scan serial number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualAdd();
                    }
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowScanModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleManualAdd}
                  className="flex-1"
                >
                  Add Equipment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
