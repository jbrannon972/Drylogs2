import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '../../../shared/Button';
import { Wind, AlertCircle, Info, Calculator, CheckCircle, QrCode, X, Plus, List, Trash2 } from 'lucide-react';
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

interface PlacedEquipment {
  id: string;
  type: 'dehumidifier' | 'air-mover' | 'air-scrubber';
  serialNumber: string;
  assignedChamberId: string;
  assignedRoomId?: string;
  placedAt: Date;
  status: 'in-service';
}

export const EquipmentCalcStep: React.FC<EquipmentCalcStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();

  const chambers: DryingChamber[] = useMemo(() => installData.chambers || [], [installData.chambers]);
  // STANDARDIZED: Use 'rooms' key (with fallback for migration)
  const rooms: RoomData[] = useMemo(() => installData.rooms || installData.roomAssessments || [], [installData.rooms, installData.roomAssessments]);
  const waterClassification = useMemo(() => installData.waterClassification || {}, [installData.waterClassification]);
  const overallDamageClass = useMemo(() => installData.overallDamageClass || 1, [installData.overallDamageClass]);

  // Hard-coded dehumidifier specs
  const dehumidifierType: DehumidifierType = 'Low Grain Refrigerant (LGR)';
  const dehumidifierRating = 170; // PPD
  const [chamberCalculations, setChamberCalculations] = useState<ChamberCalculations[]>([]);
  const [airMoversAfterDemo, setAirMoversAfterDemo] = useState<Set<string>>(
    new Set(installData.airMoversAfterDemo || [])
  );

  // Placement state
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>(
    installData.placedEquipment || []
  );
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanningFor, setScanningFor] = useState<{
    type: 'dehumidifier' | 'air-mover' | 'air-scrubber';
    chamberId: string;
    quantityNeeded?: number; // For air movers, how many are needed
  } | null>(null);
  const [manualSerialInput, setManualSerialInput] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [scannedCount, setScannedCount] = useState(0); // Track how many have been scanned in bulk operation
  const [viewingEquipmentForRoom, setViewingEquipmentForRoom] = useState<string | null>(null); // Room ID for equipment list modal

  const lastSavedCalculationsRef = useRef<string | null>(null);
  const prevPlacedEquipmentRef = useRef<string>(JSON.stringify(installData.placedEquipment || []));

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

      // Calculate dehumidifiers (using LGR formula)
      const ppdRequired = cubicFootage / chartFactor;
      const dehumidifierCount = Math.ceil(ppdRequired / dehumidifierRating);
      const dehumidifierFormula = `${cubicFootage.toFixed(0)} cf ÷ ${chartFactor} = ${ppdRequired.toFixed(1)} PPD ÷ ${dehumidifierRating} PPD/unit = ${dehumidifierCount} units`;

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
        airMoversAfterDemo: Array.from(airMoversAfterDemo),
      });
    }
  };

  // Toggle "install after demo" for a chamber's air movers
  const toggleAirMoversAfterDemo = (chamberId: string) => {
    setAirMoversAfterDemo(prev => {
      const next = new Set(prev);
      if (next.has(chamberId)) {
        next.delete(chamberId);
      } else {
        next.add(chamberId);
      }
      return next;
    });
  };

  // Equipment placement handlers - UPDATED to accept roomId directly
  const openScanner = (type: 'dehumidifier' | 'air-mover' | 'air-scrubber', chamberId: string, roomId: string, quantityNeeded?: number) => {
    setScanningFor({ type, chamberId, quantityNeeded });
    setShowScanModal(true);
    setManualSerialInput('');
    setScannedCount(0); // Reset bulk scan counter
    // Room is pre-selected since button is room-specific
    setSelectedRoomId(roomId);
  };

  const handleScan = (serialNumber: string) => {
    if (!scanningFor) return;

    if (!selectedRoomId) {
      alert('Please select a room for this equipment');
      return;
    }

    const newEquipment: PlacedEquipment = {
      id: `equipment-${Date.now()}-${Math.random()}`, // Ensure unique IDs for bulk scans
      type: scanningFor.type,
      serialNumber: serialNumber.trim(),
      assignedChamberId: scanningFor.chamberId,
      assignedRoomId: selectedRoomId,
      placedAt: new Date(),
      status: 'in-service',
    };

    setPlacedEquipment([...placedEquipment, newEquipment]);

    // Check if we're doing bulk scanning
    const quantityNeeded = scanningFor.quantityNeeded || 1;
    const newScannedCount = scannedCount + 1;

    if (newScannedCount < quantityNeeded) {
      // More scans needed - clear input and continue
      setScannedCount(newScannedCount);
      setManualSerialInput('');
    } else {
      // All scans complete - close modal
      setShowScanModal(false);
      setScanningFor(null);
      setManualSerialInput('');
      setSelectedRoomId('');
      setScannedCount(0);
    }
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

  // Get placed counts for a chamber
  const getPlacedCounts = (chamberId: string) => {
    const placed = placedEquipment.filter(e => e.assignedChamberId === chamberId);
    return {
      dehumidifiers: placed.filter(e => e.type === 'dehumidifier').length,
      airMovers: placed.filter(e => e.type === 'air-mover').length,
      airScrubbers: placed.filter(e => e.type === 'air-scrubber').length,
    };
  };

  // Save placed equipment when it changes
  useEffect(() => {
    const currentStr = JSON.stringify(placedEquipment);
    if (prevPlacedEquipmentRef.current !== currentStr) {
      const timeoutId = setTimeout(() => {
        updateWorkflowData('install', { placedEquipment });
        prevPlacedEquipmentRef.current = currentStr;
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [placedEquipment, updateWorkflowData]);

  // Recalculate when settings change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performCalculations();
    }, 100);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dehumidifierType, dehumidifierRating, airMoversAfterDemo]);

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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
        <p className="text-gray-700 mb-2">
          No drying chambers defined. Please go back and complete the "Define Chambers" step first.
        </p>
      </div>
    );
  }

  if (!overallDamageClass) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
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
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">IICRC Equipment Calculations</h4>
            <p className="text-sm text-blue-800">
              Equipment calculated using ANSI/IICRC S500-2021 standards:
            </p>
            <ul className="text-sm text-blue-800 list-disc ml-5 mt-2 space-y-1">
              <li><strong>Dehumidifiers & Air Scrubbers:</strong> Calculated per chamber based on cubic footage and damage class</li>
              <li><strong>Air Movers:</strong> Calculated per room based on affected floor and wall areas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Per-Chamber Calculations */}
      {chamberCalculations.map((calc, index) => {
        const chamberEquipment = placedEquipment.filter(e => e.assignedChamberId === calc.chamberId);
        const placedDehus = chamberEquipment.filter(e => e.type === 'dehumidifier').length;
        const placedScrubs = chamberEquipment.filter(e => e.type === 'air-scrubber').length;
        const placedMovers = chamberEquipment.filter(e => e.type === 'air-mover').length;

        return (
          <div key={calc.chamberId} className="border-2 border-gray-300 rounded-lg p-2 bg-gray-50">
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-gray-900">{calc.chamberName}</h3>
                <span className="text-xs text-gray-600">({calc.cubicFootage.toFixed(0)} cf)</span>
              </div>
              {/* Chamber-level equipment status badges */}
              <div className="flex flex-wrap gap-1">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  placedDehus >= calc.dehumidifiers
                    ? 'bg-green-100 text-green-800'
                    : placedDehus > 0
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Dehus {placedDehus}/{calc.dehumidifiers}{placedDehus >= calc.dehumidifiers ? ' ✓' : ''}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  placedScrubs >= calc.airScrubbers
                    ? 'bg-green-100 text-green-800'
                    : placedScrubs > 0
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Scrubs {placedScrubs}/{calc.airScrubbers}{placedScrubs >= calc.airScrubbers ? ' ✓' : ''}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  placedMovers >= calc.airMovers
                    ? 'bg-green-100 text-green-800'
                    : placedMovers > 0
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Movers {placedMovers}/{calc.airMovers}{placedMovers >= calc.airMovers ? ' ✓' : ''}
                </span>
              </div>
            </div>

          {/* Calculation Details - Collapsed by default */}
          <details className="mb-2">
            <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-900 p-2 bg-white rounded">
              Show calculation details
            </summary>
            <div className="space-y-2 mt-2">
              <div className="bg-white rounded p-2">
                <p className="text-xs font-medium text-gray-600">Dehumidifier:</p>
                <p className="text-xs font-mono text-gray-800">{calc.formula}</p>
              </div>
              <div className="bg-white rounded p-2">
                <p className="text-xs font-medium text-gray-600">Air Movers:</p>
                {calc.breakdown.map((line, idx) => (
                  <p key={idx} className="text-xs font-mono text-gray-800">{line}</p>
                ))}
              </div>
            </div>
          </details>

          {/* Rooms */}
          <div className="space-y-1">
            {(() => {
              const chamber = chambers.find(c => c.chamberId === calc.chamberId);
              const chamberRooms = chamber ? rooms.filter(r => chamber.assignedRooms.includes(r.id)) : [];

              return chamberRooms.map(room => {
                const roomEquipment = placedEquipment.filter(e => e.assignedRoomId === room.id);

                // Find recommended air mover count for this room
                const roomPlacement = calc.roomPlacements.find(rp => rp.roomName === room.name);
                const recommendedMovers = roomPlacement?.total || 0;
                const placedRoomMovers = roomEquipment.filter(e => e.type === 'air-mover').length;
                const placedRoomDehus = roomEquipment.filter(e => e.type === 'dehumidifier').length;
                const placedRoomScrubs = roomEquipment.filter(e => e.type === 'air-scrubber').length;

                return (
                  <div key={room.id} className="bg-white border border-gray-200 rounded p-2">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <button
                        onClick={() => setViewingEquipmentForRoom(room.id)}
                        className="flex items-center gap-1 text-base font-semibold text-gray-900 hover:text-blue-700 hover:underline transition-colors"
                      >
                        <List className="w-4 h-4" />
                        {room.name}
                      </button>
                      {recommendedMovers > 0 && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          placedRoomMovers >= recommendedMovers
                            ? 'bg-green-100 text-green-800'
                            : placedRoomMovers > 0
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {placedRoomMovers >= recommendedMovers
                            ? `${placedRoomMovers} Movers ✓`
                            : `${placedRoomMovers}/${recommendedMovers} Movers`
                          }
                        </span>
                      )}
                      {/* Show dehus placed in this room */}
                      {placedRoomDehus > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                          {placedRoomDehus} Dehu{placedRoomDehus > 1 ? 's' : ''}
                        </span>
                      )}
                      {/* Show scrubs placed in this room */}
                      {placedRoomScrubs > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-700 border border-purple-200">
                          {placedRoomScrubs} Scrub{placedRoomScrubs > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        variant="secondary"
                        onClick={() => openScanner('dehumidifier', calc.chamberId, room.id)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        Dehu
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => openScanner('air-scrubber', calc.chamberId, room.id)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        Scrub
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => openScanner('air-mover', calc.chamberId, room.id, recommendedMovers)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        Mover
                      </Button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
        );
      })}

      {/* Scan/Manual Entry Modal */}
      {showScanModal && scanningFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Add {scanningFor.type === 'dehumidifier' ? 'Dehumidifier' : scanningFor.type === 'air-mover' ? 'Air Mover' : 'Air Scrubber'}
                </h3>
                {scanningFor.quantityNeeded && scanningFor.quantityNeeded > 1 && (
                  <p className="text-sm text-orange-600 font-medium">
                    Scan {scannedCount + 1} of {scanningFor.quantityNeeded}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowScanModal(false);
                  setScanningFor(null);
                  setScannedCount(0);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* QR Scanner Placeholder */}
            <div className="mb-2 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
              <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">QR Scanner Would Appear Here</p>
              <p className="text-xs text-gray-500 mt-1">Use manual entry below for now</p>
            </div>

            {/* Manual Entry */}
            <div className="space-y-4">
              {/* Room Display - Pre-selected, not editable */}
              {selectedRoomId && (() => {
                const selectedRoom = rooms.find(r => r.id === selectedRoomId);
                return selectedRoom && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Placing in:</p>
                    <p className="font-semibold text-gray-900">{selectedRoom.name}</p>
                  </div>
                );
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number *
                </label>
                <input
                  type="text"
                  value={manualSerialInput}
                  onChange={(e) => setManualSerialInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && selectedRoomId) {
                      handleManualAdd();
                    }
                  }}
                  placeholder="Enter serial number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  autoFocus
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
                  disabled={!manualSerialInput.trim() || !selectedRoomId}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Add Equipment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment List Modal - View/Remove equipment in a room */}
      {viewingEquipmentForRoom && (() => {
        const room = rooms.find(r => r.id === viewingEquipmentForRoom);
        const roomEquipment = placedEquipment.filter(e => e.assignedRoomId === viewingEquipmentForRoom);

        if (!room) return null;

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Equipment in {room.name}
                </h3>
                <button
                  onClick={() => setViewingEquipmentForRoom(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {roomEquipment.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <List className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No equipment placed in this room yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {roomEquipment.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {equipment.type === 'dehumidifier' ? 'Dehumidifier' :
                           equipment.type === 'air-mover' ? 'Air Mover' :
                           'Air Scrubber'}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">{equipment.serialNumber}</p>
                      </div>
                      <button
                        onClick={() => removeEquipment(equipment.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 hover:text-red-800 transition-colors"
                        title="Remove equipment"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setViewingEquipmentForRoom(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
