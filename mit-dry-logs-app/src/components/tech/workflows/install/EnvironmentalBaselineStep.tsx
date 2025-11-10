/**
 * US 3.11 - Unaffected Area Readings (Environmental Baseline)
 *
 * IICRC S500 requires establishing dry standards from unaffected areas
 * to properly calculate when affected materials reach "dry" status.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Thermometer, Droplets, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface UnaffectedReading {
  id: string;
  roomName: string;
  temperature: string;
  relativeHumidity: string;
  materialReadings: {
    material: string;
    reading: string;
  }[];
}

interface EnvironmentalBaselineStepProps {
  job: any;
}

const COMMON_MATERIALS = [
  'Drywall',
  'Wood Flooring',
  'Concrete',
  'Carpet',
  'Subfloor',
  'Baseboard',
  'Cabinet',
  'Tile',
  'Other',
];

export const EnvironmentalBaselineStep: React.FC<EnvironmentalBaselineStepProps> = ({ job }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();

  const [unaffectedReadings, setUnaffectedReadings] = useState<UnaffectedReading[]>(
    installData.unaffectedReadings || []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateWorkflowData('install', {
        unaffectedReadings,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unaffectedReadings]);

  const addUnaffectedRoom = () => {
    const newReading: UnaffectedReading = {
      id: 'unaffected-' + new Date().getTime(),
      roomName: '',
      temperature: '',
      relativeHumidity: '',
      materialReadings: [],
    };
    setUnaffectedReadings([...unaffectedReadings, newReading]);
  };

  const removeUnaffectedRoom = (id: string) => {
    setUnaffectedReadings(unaffectedReadings.filter(r => r.id !== id));
  };

  const updateReading = (id: string, field: keyof UnaffectedReading, value: any) => {
    setUnaffectedReadings(readings =>
      readings.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const addMaterialReading = (readingId: string) => {
    setUnaffectedReadings(readings =>
      readings.map(r => {
        if (r.id === readingId) {
          return {
            ...r,
            materialReadings: [
              ...r.materialReadings,
              { material: '', reading: '' },
            ],
          };
        }
        return r;
      })
    );
  };

  const removeMaterialReading = (readingId: string, materialIndex: number) => {
    setUnaffectedReadings(readings =>
      readings.map(r => {
        if (r.id === readingId) {
          return {
            ...r,
            materialReadings: r.materialReadings.filter((_, i) => i !== materialIndex),
          };
        }
        return r;
      })
    );
  };

  const updateMaterialReading = (
    readingId: string,
    materialIndex: number,
    field: 'material' | 'reading',
    value: string
  ) => {
    setUnaffectedReadings(readings =>
      readings.map(r => {
        if (r.id === readingId) {
          return {
            ...r,
            materialReadings: r.materialReadings.map((m, i) =>
              i === materialIndex ? { ...m, [field]: value } : m
            ),
          };
        }
        return r;
      })
    );
  };

  const hasMinimumData = unaffectedReadings.length > 0 &&
    unaffectedReadings.every(r =>
      r.roomName &&
      r.temperature &&
      r.relativeHumidity &&
      r.materialReadings.length > 0 &&
      r.materialReadings.every(m => m.material && m.reading)
    );

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
          <Thermometer className="w-5 h-5" />
          Establish Dry Standards (IICRC Required)
        </h3>
        <p className="text-sm text-orange-800 mb-2">
          IICRC S500 requires taking readings from <strong>unaffected areas</strong> to establish accurate dry standards.
        </p>
        <p className="text-sm text-orange-800">
          Take temperature, humidity, and material moisture readings from <strong>dry rooms</strong> (not affected by water damage).
          These serve as your baseline for determining when affected materials reach dry status.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to Use:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Select an unaffected room (bedroom, closet, etc. with no water damage)</li>
          <li>Take temperature and RH readings in that room</li>
          <li>Take material moisture readings for the same material types present in affected areas</li>
          <li>Repeat for at least one unaffected room (more is better for accuracy)</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Unaffected Area Readings
          </h3>
          <Button
            type="button"
            variant="secondary"
            onClick={addUnaffectedRoom}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Unaffected Room
          </Button>
        </div>

        {unaffectedReadings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No unaffected rooms added yet</p>
            <Button
              type="button"
              variant="primary"
              onClick={addUnaffectedRoom}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Unaffected Room
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {unaffectedReadings.map((reading, index) => (
              <div
                key={reading.id}
                className="bg-white border-2 border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    Unaffected Room #{index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeUnaffectedRoom(reading.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Name *
                  </label>
                  <Input
                    type="text"
                    value={reading.roomName}
                    onChange={(e) => updateReading(reading.id, 'roomName', e.target.value)}
                    placeholder="e.g., Master Bedroom, Hall Closet"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°F) *
                    </label>
                    <Input
                      type="number"
                      value={reading.temperature}
                      onChange={(e) => updateReading(reading.id, 'temperature', e.target.value)}
                      placeholder="72"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relative Humidity (%) *
                    </label>
                    <Input
                      type="number"
                      value={reading.relativeHumidity}
                      onChange={(e) => updateReading(reading.id, 'relativeHumidity', e.target.value)}
                      placeholder="45"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Material Moisture Readings *
                    </label>
                    <button
                      type="button"
                      onClick={() => addMaterialReading(reading.id)}
                      className="text-sm text-entrusted-orange hover:text-orange-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Material
                    </button>
                  </div>

                  {reading.materialReadings.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        No material readings yet
                      </p>
                      <button
                        type="button"
                        onClick={() => addMaterialReading(reading.id)}
                        className="text-sm text-entrusted-orange hover:text-orange-700 font-medium"
                      >
                        + Add Material Reading
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reading.materialReadings.map((material, matIndex) => (
                        <div
                          key={matIndex}
                          className="grid grid-cols-[1fr,100px,40px] gap-3 items-end"
                        >
                          <div>
                            <select
                              value={material.material}
                              onChange={(e) =>
                                updateMaterialReading(reading.id, matIndex, 'material', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange"
                            >
                              <option value="">Select Material</option>
                              {COMMON_MATERIALS.map(mat => (
                                <option key={mat} value={mat}>
                                  {mat}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Input
                              type="number"
                              value={material.reading}
                              onChange={(e) =>
                                updateMaterialReading(reading.id, matIndex, 'reading', e.target.value)
                              }
                              placeholder="12.5"
                              step="0.1"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMaterialReading(reading.id, matIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!hasMinimumData && unaffectedReadings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-semibold mb-1">
                Complete Required Fields
              </p>
              <p className="text-sm text-yellow-800">
                Each unaffected room must have: room name, temperature, RH, and at least one material reading.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasMinimumData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-semibold mb-1">
                Dry Standards Established
              </p>
              <p className="text-sm text-green-800">
                {unaffectedReadings.length} unaffected room(s) recorded. These readings will serve as dry standards for comparison.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
