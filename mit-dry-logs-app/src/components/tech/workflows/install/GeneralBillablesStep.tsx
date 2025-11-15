import React, { useState, useEffect } from 'react';
import {
  Package,
  Shield,
  Wrench,
  Droplets,
  Trash2,
  HardHat,
  FileText,
  Info,
  Mic,
  MicOff
} from 'lucide-react';

interface BillableItem {
  id: string;
  label: string;
  unit: 'each' | 'sqft' | 'linear-ft' | 'daily';
  performed: boolean;
  quantity: number;
  notes: string;
}

interface BillableCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: BillableItem[];
}

interface GeneralBillablesStepProps {
  job: any;
}

export const GeneralBillablesStep: React.FC<GeneralBillablesStepProps> = ({ job }) => {
  const [categories, setCategories] = useState<BillableCategory[]>([
    {
      id: 'structural',
      title: 'Structural Materials',
      icon: <Package className="w-5 h-5" />,
      items: [
        { id: 'insulation', label: 'Insulation Removal', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'insulationVacuum', label: 'Insulation - Vacuum Wall Framing', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'insulationTruss', label: 'Insulation - Clean Truss System', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'countertops', label: 'Countertops', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'backsplash', label: 'Backsplash', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'cabinetry', label: 'Cabinetry', unit: 'each', performed: false, quantity: 0, notes: '' },
      ]
    },
    {
      id: 'contents',
      title: 'Contents & Protection',
      icon: <Shield className="w-5 h-5" />,
      items: [
        { id: 'contents', label: 'Contents Manipulation', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'contentsBags', label: 'Contents (Bag for disposal)', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'applianceMoving', label: 'Appliance Moving', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'floorProtection', label: 'Floor Protection', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'plasticCoverings', label: 'Plastic Coverings', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'areaRugRedelivery', label: 'Area Rug Re-Delivery', unit: 'each', performed: false, quantity: 0, notes: '' },
      ]
    },
    {
      id: 'containment',
      title: 'Containment Setup',
      icon: <Shield className="w-5 h-5" />,
      items: [
        { id: 'containmentSqft', label: 'Containment', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'zipPoleSystem', label: 'Containment - Zip Pole System', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'zippers', label: 'Zippers', unit: 'each', performed: false, quantity: 0, notes: '' },
      ]
    },
    {
      id: 'specialized',
      title: 'Specialized Services',
      icon: <Wrench className="w-5 h-5" />,
      items: [
        { id: 'waterExtraction', label: 'Water Extraction', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'sprayAntiMicrobial', label: 'Spray Anti-Microbial', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'cleaning', label: 'Cleaning', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'finalCleaning', label: 'Final Cleaning (broom swept)', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'thermalImaging', label: 'Thermal Imaging', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'moldTesting', label: 'Mold Testing', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'leadTesting', label: 'Lead Testing', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'categoryTestingStrips', label: 'Category Testing Strips', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'drillHoles', label: 'Drill Holes', unit: 'each', performed: false, quantity: 0, notes: '' },
      ]
    },
    {
      id: 'equipment',
      title: 'Equipment Services',
      icon: <Droplets className="w-5 h-5" />,
      items: [
        { id: 'jobsiteMonitoring', label: 'Jobsite / Equipment Monitoring', unit: 'daily', performed: false, quantity: 0, notes: '' },
        { id: 'decontaminateDehus', label: 'Decontaminate Dehumidifiers', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'decontaminateAirScrubbers', label: 'Decontaminate Air Scrubbers', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'decontaminateAirMovers', label: 'Decontaminate Air Movers', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'toolRental', label: 'Tool Rental', unit: 'daily', performed: false, quantity: 0, notes: '' },
        { id: 'ladder', label: 'Ladder', unit: 'daily', performed: false, quantity: 0, notes: '' },
      ]
    },
    {
      id: 'materials',
      title: 'Materials & Supplies',
      icon: <HardHat className="w-5 h-5" />,
      items: [
        { id: 'plastic', label: 'Plastic', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'bubbleWrap', label: 'Bubble Wrap', unit: 'sqft', performed: false, quantity: 0, notes: '' },
        { id: 'lumber2x4', label: 'Lumber (2x4)', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'fullCoveralls', label: 'Full Coveralls', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'fullFaceRespirator', label: 'Full Face Respirator', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'halfFaceRespirator', label: 'Half Face Respirator', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'disposableGloves', label: 'Disposable Gloves', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'heavyDutyGloves', label: 'Heavy Duty Gloves', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'eyeProtection', label: 'Eye Protection', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'disposableMask', label: 'Disposable Mask', unit: 'each', performed: false, quantity: 0, notes: '' },
      ]
    },
    {
      id: 'disposal',
      title: 'Disposal & Logistics',
      icon: <Trash2 className="w-5 h-5" />,
      items: [
        { id: 'pod', label: 'POD', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'podDeliveryPickup', label: 'POD Delivery/Pickup Charge', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'pickupDumpCharge', label: 'Pickup Dump Charge', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'dumpsterBag', label: 'Dumpster Bag', unit: 'each', performed: false, quantity: 0, notes: '' },
      ]
    },
    {
      id: 'other',
      title: 'Other Services',
      icon: <FileText className="w-5 h-5" />,
      items: [
        { id: 'emergencyCallDuringHours', label: 'Emergency Call During Hours', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'emergencyCallAfterHours', label: 'Emergency Call After Hours', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'tempSinkHookup', label: 'Temp Sink Hookup', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'matterport', label: 'Matterport 3D Scan', unit: 'each', performed: false, quantity: 0, notes: '' },
        { id: 'other', label: 'Other (describe in notes)', unit: 'each', performed: false, quantity: 0, notes: '' },
      ]
    }
  ]);

  // Voice-to-text state
  const [recordingItem, setRecordingItem] = useState<{ categoryId: string; itemId: string } | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (recordingItem && finalTranscript) {
          const { categoryId, itemId } = recordingItem;
          const category = categories.find(c => c.id === categoryId);
          const item = category?.items.find(i => i.id === itemId);
          if (item) {
            const newNotes = item.notes + (item.notes ? ' ' : '') + finalTranscript.trim();
            updateItem(categoryId, itemId, 'notes', newNotes);
          }
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setRecordingItem(null);
      };

      recognitionInstance.onend = () => {
        setRecordingItem(null);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleVoiceRecording = (categoryId: string, itemId: string) => {
    if (!recognition) {
      alert('Voice recognition is not supported in your browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (recordingItem?.categoryId === categoryId && recordingItem?.itemId === itemId) {
      // Stop recording
      recognition.stop();
      setRecordingItem(null);
    } else {
      // Start recording
      if (recordingItem) {
        recognition.stop();
      }
      setRecordingItem({ categoryId, itemId });
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const updateItem = (categoryId: string, itemId: string, field: keyof BillableItem, value: any) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        };
      }
      return cat;
    }));
  };

  const getTotalItemsPerformed = () => {
    return categories.reduce((total, cat) =>
      total + cat.items.filter(item => item.performed).length, 0
    );
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'each': return 'Qty';
      case 'sqft': return 'Sq Ft';
      case 'linear-ft': return 'Lin Ft';
      case 'daily': return 'Days';
      default: return 'Qty';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">
              Additional Billable Work
            </h3>
            <p className="text-sm text-blue-700">
              Log any additional work performed during this install that hasn't been captured in previous steps.
              This includes materials, services, supplies, and specialized work. <strong>Only check items you actually performed.</strong>
            </p>
            <p className="text-xs text-blue-600 mt-2">
              {getTotalItemsPerformed()} item(s) logged
            </p>
          </div>
        </div>
      </div>

      {/* Categories - Always Expanded */}
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header - Not Clickable */}
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="text-entrusted-orange">
                  {category.icon}
                </div>
                <span className="font-medium text-gray-900">
                  {category.title}
                </span>
                <span className="text-sm text-gray-500">
                  ({category.items.filter(i => i.performed).length} of {category.items.length})
                </span>
              </div>
            </div>

            {/* Category Items - Always Visible */}
            <div className="p-4 bg-white space-y-4">
              {category.items.map(item => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-3 transition-all ${
                      item.performed ? 'border-entrusted-orange bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Item Checkbox and Label */}
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={item.performed}
                        onChange={(e) => updateItem(category.id, item.id, 'performed', e.target.checked)}
                        className="mt-1 h-5 w-5 text-entrusted-orange rounded focus:ring-entrusted-orange"
                      />
                      <label className="flex-1 font-medium text-gray-900 cursor-pointer">
                        {item.label}
                      </label>
                    </div>

                    {/* Quantity and Notes (only shown if performed) */}
                    {item.performed && (
                      <div className="ml-8 space-y-3">
                        {/* Quantity Input */}
                        <div className="flex items-center gap-3">
                          <label className="text-sm text-gray-700 w-20">
                            {getUnitLabel(item.unit)}:
                          </label>
                          <input
                            type="number"
                            min="0"
                            step={item.unit === 'sqft' ? '0.1' : '1'}
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(category.id, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500">
                            {item.unit === 'each' && 'item(s)'}
                            {item.unit === 'sqft' && 'sq ft'}
                            {item.unit === 'linear-ft' && 'linear ft'}
                            {item.unit === 'daily' && 'day(s)'}
                          </span>
                        </div>

                        {/* Notes with Voice-to-Text */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm text-gray-700">
                              Notes (optional):
                            </label>
                            <button
                              type="button"
                              onClick={() => toggleVoiceRecording(category.id, item.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                recordingItem?.categoryId === category.id && recordingItem?.itemId === item.id
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              title={recordingItem?.categoryId === category.id && recordingItem?.itemId === item.id ? 'Stop recording' : 'Start voice-to-text'}
                            >
                              {recordingItem?.categoryId === category.id && recordingItem?.itemId === item.id ? (
                                <>
                                  <MicOff className="w-3 h-3" />
                                  Recording...
                                </>
                              ) : (
                                <>
                                  <Mic className="w-3 h-3" />
                                  Voice
                                </>
                              )}
                            </button>
                          </div>
                          <textarea
                            value={item.notes}
                            onChange={(e) => updateItem(category.id, item.id, 'notes', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange text-sm"
                            placeholder="Type or use voice button to dictate..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {getTotalItemsPerformed() > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">
            ✓ Summary: {getTotalItemsPerformed()} billable items logged
          </h4>
          <div className="text-sm text-green-700 space-y-1">
            {categories.map(cat => {
              const performedItems = cat.items.filter(i => i.performed);
              if (performedItems.length === 0) return null;
              return (
                <div key={cat.id}>
                  <strong>{cat.title}:</strong> {performedItems.map(i => i.label).join(', ')}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Items Warning */}
      {getTotalItemsPerformed() === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600">
            No additional billable work logged. If you performed any of the work above, check the boxes and enter quantities.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You can skip this step if no additional work was performed.
          </p>
        </div>
      )}
    </div>
  );
};
