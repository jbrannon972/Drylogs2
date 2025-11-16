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
  MicOff,
  Camera,
  StickyNote,
  X
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { useBatchPhotos } from '../../../../hooks/useBatchPhotos';

interface BillableItem {
  id: string;
  label: string;
  unit: 'each' | 'sqft' | 'linear-ft' | 'daily';
  performed: boolean;
  quantity: number;
  notes: string;
  photos: string[];
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
  const { user } = useAuth();
  const { queuePhoto } = useBatchPhotos();
  const [categories, setCategories] = useState<BillableCategory[]>([
    {
      id: 'structural',
      title: 'Structural Materials',
      icon: <Package className="w-4 h-4" />,
      items: [
        { id: 'insulation', label: 'Insulation Removal', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'insulationVacuum', label: 'Insulation - Vacuum Wall Framing', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'insulationTruss', label: 'Insulation - Clean Truss System', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'countertops', label: 'Countertops', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'backsplash', label: 'Backsplash', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'cabinetry', label: 'Cabinetry', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
      ]
    },
    {
      id: 'contents',
      title: 'Contents & Protection',
      icon: <Shield className="w-4 h-4" />,
      items: [
        { id: 'contents', label: 'Contents Manipulation', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'contentsBags', label: 'Contents (Bag for disposal)', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'applianceMoving', label: 'Appliance Moving', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'floorProtection', label: 'Floor Protection', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'plasticCoverings', label: 'Plastic Coverings', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'areaRugRedelivery', label: 'Area Rug Re-Delivery', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
      ]
    },
    {
      id: 'containment',
      title: 'Containment Setup',
      icon: <Shield className="w-4 h-4" />,
      items: [
        { id: 'containmentSqft', label: 'Containment', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'zipPoleSystem', label: 'Containment - Zip Pole System', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'zippers', label: 'Zippers', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
      ]
    },
    {
      id: 'specialized',
      title: 'Specialized Services',
      icon: <Wrench className="w-4 h-4" />,
      items: [
        { id: 'waterExtraction', label: 'Water Extraction', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'sprayAntiMicrobial', label: 'Spray Anti-Microbial', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'cleaning', label: 'Cleaning', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'finalCleaning', label: 'Final Cleaning (broom swept)', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'thermalImaging', label: 'Thermal Imaging', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'moldTesting', label: 'Mold Testing', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'leadTesting', label: 'Lead Testing', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'categoryTestingStrips', label: 'Category Testing Strips', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'drillHoles', label: 'Drill Holes', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
      ]
    },
    {
      id: 'equipment',
      title: 'Equipment Services',
      icon: <Droplets className="w-4 h-4" />,
      items: [
        { id: 'jobsiteMonitoring', label: 'Jobsite / Equipment Monitoring', unit: 'daily', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'decontaminateDehus', label: 'Decontaminate Dehumidifiers', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'decontaminateAirScrubbers', label: 'Decontaminate Air Scrubbers', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'decontaminateAirMovers', label: 'Decontaminate Air Movers', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'toolRental', label: 'Tool Rental', unit: 'daily', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'ladder', label: 'Ladder', unit: 'daily', performed: false, quantity: 0, notes: '', photos: [] },
      ]
    },
    {
      id: 'materials',
      title: 'Materials & Supplies',
      icon: <HardHat className="w-4 h-4" />,
      items: [
        { id: 'plastic', label: 'Plastic', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'bubbleWrap', label: 'Bubble Wrap', unit: 'sqft', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'lumber2x4', label: 'Lumber (2x4)', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'fullCoveralls', label: 'Full Coveralls', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'fullFaceRespirator', label: 'Full Face Respirator', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'halfFaceRespirator', label: 'Half Face Respirator', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'disposableGloves', label: 'Disposable Gloves', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'heavyDutyGloves', label: 'Heavy Duty Gloves', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'eyeProtection', label: 'Eye Protection', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'disposableMask', label: 'Disposable Mask', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
      ]
    },
    {
      id: 'disposal',
      title: 'Disposal & Logistics',
      icon: <Trash2 className="w-4 h-4" />,
      items: [
        { id: 'pod', label: 'POD', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'podDeliveryPickup', label: 'POD Delivery/Pickup Charge', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'pickupDumpCharge', label: 'Pickup Dump Charge', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'dumpsterBag', label: 'Dumpster Bag', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
      ]
    },
    {
      id: 'other',
      title: 'Other Services',
      icon: <FileText className="w-4 h-4" />,
      items: [
        { id: 'emergencyCallDuringHours', label: 'Emergency Call During Hours', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'emergencyCallAfterHours', label: 'Emergency Call After Hours', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'tempSinkHookup', label: 'Temp Sink Hookup', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'matterport', label: 'Matterport 3D Scan', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
        { id: 'other', label: 'Other (describe in notes)', unit: 'each', performed: false, quantity: 0, notes: '', photos: [] },
      ]
    }
  ]);

  // Voice-to-text state
  const [recordingItem, setRecordingItem] = useState<{ categoryId: string; itemId: string } | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Notes modal state
  const [notesModal, setNotesModal] = useState<{ categoryId: string; itemId: string } | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
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
  }, [categories, recordingItem]);

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

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>, categoryId: string, itemId: string) => {
    const files = e.target.files;
    if (files && files.length > 0 && user) {
      const category = categories.find(c => c.id === categoryId);
      const item = category?.items.find(i => i.id === itemId);

      for (let i = 0; i < files.length; i++) {
        await queuePhoto(
          files[i],
          job.jobId,
          `billable-${itemId}`,
          `Billable: ${item?.label || itemId}`,
          'billables'
        );
      }

      // Mark photo as taken (we'll just add a placeholder URL)
      updateItem(categoryId, itemId, 'photos', [...(item?.photos || []), `photo-${Date.now()}`]);

      // Reset input
      e.target.value = '';
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
      case 'each': return '';
      case 'sqft': return 'sq ft';
      case 'linear-ft': return 'lin ft';
      case 'daily': return 'days';
      default: return '';
    }
  };

  const getNotesModalItem = () => {
    if (!notesModal) return null;
    const category = categories.find(c => c.id === notesModal.categoryId);
    return category?.items.find(i => i.id === notesModal.itemId);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Additional Billable Work</h3>
            <p className="text-sm text-blue-700">
              Log additional work performed during this install. <strong>{getTotalItemsPerformed()} items logged</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Categories - Always Open */}
      <div className="space-y-3">
        {categories.map(category => {
          const performedCount = category.items.filter(i => i.performed).length;

          return (
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header - Larger, Bold, Distinct Color */}
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-entrusted-orange to-orange-500">
                <div className="text-white">
                  {category.icon}
                </div>
                <span className="font-bold text-white text-base">
                  {category.title}
                </span>
                <span className="text-xs text-white/90 ml-auto">
                  {performedCount}/{category.items.length}
                </span>
              </div>

              {/* Items - Compact Inline Format */}
              <div className="bg-white divide-y divide-gray-100">
                {category.items.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-2 text-sm transition-colors ${
                      item.performed ? 'bg-orange-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.performed}
                      onChange={(e) => updateItem(category.id, item.id, 'performed', e.target.checked)}
                      className="h-4 w-4 text-entrusted-orange rounded focus:ring-entrusted-orange flex-shrink-0"
                    />

                    {/* Item Name - Smaller font */}
                    <label className="flex-1 text-gray-900 cursor-pointer min-w-0">
                      {item.label}
                    </label>

                    {/* Quantity Input - Only when performed */}
                    {item.performed && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step={item.unit === 'sqft' ? '0.1' : '1'}
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(category.id, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-entrusted-orange"
                          placeholder="0"
                        />
                        {getUnitLabel(item.unit) && (
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {getUnitLabel(item.unit)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Photo Button */}
                    {item.performed && (
                      <label className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer flex-shrink-0 ${
                        item.photos.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handlePhotoCapture(e, category.id, item.id)}
                          className="hidden"
                          multiple
                        />
                        <Camera className="w-3 h-3" />
                        {item.photos.length > 0 && (
                          <span className="text-xs font-medium">{item.photos.length}</span>
                        )}
                      </label>
                    )}

                    {/* Notes Button */}
                    {item.performed && (
                      <button
                        onClick={() => setNotesModal({ categoryId: category.id, itemId: item.id })}
                        className={`flex items-center gap-1 px-2 py-1 rounded flex-shrink-0 ${
                          item.notes ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <StickyNote className="w-3 h-3" />
                        {item.notes && <span className="text-xs">✓</span>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {getTotalItemsPerformed() > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm font-medium text-green-900">
            ✓ {getTotalItemsPerformed()} billable items logged
          </p>
        </div>
      )}

      {/* Notes Modal */}
      {notesModal && getNotesModalItem() && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{getNotesModalItem()?.label}</h3>
              <button
                onClick={() => setNotesModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Notes:</label>
                <button
                  onClick={() => toggleVoiceRecording(notesModal.categoryId, notesModal.itemId)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    recordingItem?.categoryId === notesModal.categoryId && recordingItem?.itemId === notesModal.itemId
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {recordingItem?.categoryId === notesModal.categoryId && recordingItem?.itemId === notesModal.itemId ? (
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
                value={getNotesModalItem()?.notes || ''}
                onChange={(e) => updateItem(notesModal.categoryId, notesModal.itemId, 'notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange"
                placeholder="Type notes or use voice button to dictate..."
              />
            </div>

            <button
              onClick={() => setNotesModal(null)}
              className="w-full px-4 py-2 bg-entrusted-orange text-white rounded-lg font-medium hover:bg-orange-600"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
