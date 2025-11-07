import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Droplets, AlertCircle, Info, Camera, Wrench, CheckCircle } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { SubcontractorRequestModal, SubcontractorRequestData } from '../../../shared/SubcontractorRequestModal';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

interface CauseOfLossStepProps {
  job: any;
  onNext: () => void;
}

export const CauseOfLossStep: React.FC<CauseOfLossStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const [showSubModal, setShowSubModal] = useState(false);

  const [causeType, setCauseType] = useState(installData.causeOfLoss?.type || '');
  const [causeLocation, setCauseLocation] = useState(installData.causeOfLoss?.location || '');
  const [causeNotes, setCauseNotes] = useState(installData.causeOfLoss?.notes || '');
  const [causePhoto, setCausePhoto] = useState<string | null>(installData.causeOfLoss?.photo || null);
  const [waterCategory, setWaterCategory] = useState<1 | 2 | 3 | null>(
    installData.waterClassification?.category || null
  );

  // New fields
  const [discoveryDate, setDiscoveryDate] = useState(
    installData.causeOfLoss?.discoveryDate || new Date().toISOString().split('T')[0]
  );
  const [eventDate, setEventDate] = useState(
    installData.causeOfLoss?.eventDate || new Date().toISOString().split('T')[0]
  );
  const [thermalImagingUsed, setThermalImagingUsed] = useState(
    installData.specializedServices?.thermalImaging || false
  );

  // Cat 3 Biohazard Containment Checklist (OSHA Compliance)
  const [cat3Checklist, setCat3Checklist] = useState({
    ppeConfirmed: installData.cat3Containment?.ppeConfirmed || false,
    containmentBarriers: installData.cat3Containment?.containmentBarriers || false,
    negativeAirSetup: installData.cat3Containment?.negativeAirSetup || false,
    wasteContainment: installData.cat3Containment?.wasteContainment || false,
    crossContaminationPrevention: installData.cat3Containment?.crossContaminationPrevention || false,
    customerNotified: installData.cat3Containment?.customerNotified || false,
  });

  // Timestamp - initialized once and never changes (prevents infinite loop)
  const [determinedAt] = useState(() =>
    installData.waterClassification?.determinedAt || new Date().toISOString()
  );

  useEffect(() => {
    updateWorkflowData('install', {
      causeOfLoss: {
        type: causeType,
        location: causeLocation,
        notes: causeNotes,
        photo: causePhoto,
        discoveryDate,
        eventDate,
      },
      waterClassification: {
        category: waterCategory,
        determinedAt,
      },
      specializedServices: {
        thermalImaging: thermalImagingUsed,
      },
      cat3Containment: waterCategory === 3 ? cat3Checklist : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [causeType, causeLocation, causeNotes, causePhoto, waterCategory, discoveryDate, eventDate, thermalImagingUsed, cat3Checklist, determinedAt]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadPhoto(file, job.jobId, 'cause-of-loss', 'assessment', user.uid);
      if (url) setCausePhoto(url);
    }
  };

  const toggleCat3Checklist = (key: keyof typeof cat3Checklist) => {
    setCat3Checklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubcontractorRequest = async (data: SubcontractorRequestData) => {
    if (!user) return;

    // Upload photos if any
    const photoUrls: string[] = [];
    for (const photo of data.photos) {
      const url = await uploadPhoto(photo, job.jobId, data.location, 'assessment', user.uid);
      if (url) photoUrls.push(url);
    }

    // Create subcontractor request document
    const requestData = {
      jobId: job.jobId,
      requestedBy: user.uid,
      requestedAt: Timestamp.now(),
      specialistType: data.specialistType,
      otherSpecialistType: data.specialistType === 'Other' ? data.otherSpecialistType : null,
      urgency: data.urgency,
      location: data.location,
      issueDescription: data.issueDescription,
      photos: photoUrls,
      customerAware: data.customerAware,
      status: 'pending',
    };

    await addDoc(collection(db, 'subcontractorRequests'), requestData);

    alert('Subcontractor request submitted successfully. MIT Lead will be notified.');
  };

  const causeTypes = [
    { value: 'Burst Pipe', examples: 'Supply line, drain pipe, fixture' },
    { value: 'Appliance Leak', examples: 'Dishwasher, washing machine, water heater' },
    { value: 'Roof Leak', examples: 'Missing shingles, ice dam, flashing failure' },
    { value: 'Flooding', examples: 'Natural disaster, storm surge, river overflow' },
    { value: 'Sewage Backup', examples: 'Main line blockage, septic failure' },
    { value: 'Ice Dam', examples: 'Gutter overflow, roof ice buildup' },
    { value: 'HVAC Leak', examples: 'AC condensation, furnace overflow' },
    { value: 'Tub/Sink Overflow', examples: 'Left running, clogged drain' },
    { value: 'Toilet Overflow', examples: 'Clog, supply line failure' },
    { value: 'Other', examples: 'Describe in notes' },
  ];

  const waterCategories = [
    {
      value: 1,
      title: 'Category 1 - Clean Water',
      description: 'From sanitary source, no health risk',
      examples: ['Broken water supply line', 'Tub overflow (clean water)', 'Melting ice/snow'],
      color: 'blue',
    },
    {
      value: 2,
      title: 'Category 2 - Gray Water',
      description: 'Contains contamination, potential health risk',
      examples: ['Washing machine overflow', 'Dishwasher overflow', 'Toilet (urine only)'],
      color: 'yellow',
    },
    {
      value: 3,
      title: 'Category 3 - Black Water',
      description: 'Grossly contaminated, serious health risk',
      examples: ['Sewage backup', 'Toilet (feces)', 'Rising flood water', 'Standing water with growth'],
      color: 'red',
    },
  ];

  const getColorClasses = (color: string, selected: boolean) => {
    const base = selected ? 'border-2' : 'border';
    if (color === 'blue') {
      return `${base} ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`;
    } else if (color === 'yellow') {
      return `${base} ${selected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`;
    } else if (color === 'red') {
      return `${base} ${selected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`;
    }
    return '';
  };

  const cat3ChecklistComplete = waterCategory === 3 ? Object.values(cat3Checklist).every(v => v) : true;
  const isComplete = causeType && causeLocation && causePhoto && waterCategory && cat3ChecklistComplete;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Document the Water Source</h4>
            <p className="text-sm text-blue-800">
              Identify what caused the water damage and determine the water category for proper safety protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Cause Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo of Cause *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {causePhoto ? (
            <div>
              <img src={causePhoto} alt="Cause of Loss" className="max-h-64 mx-auto mb-2 rounded" />
              <p className="text-sm text-green-600 font-medium mb-2">✓ Photo uploaded</p>
              <label className="btn-secondary cursor-pointer inline-block text-sm">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                Replace Photo
              </label>
            </div>
          ) : (
            <div>
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <label className="btn-primary cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? 'Uploading...' : 'Take Photo of Water Source'}
              </label>
              <p className="text-xs text-gray-500 mt-2">Photo required for insurance claim</p>
            </div>
          )}
        </div>
      </div>

      {/* Cause Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What Caused the Water Damage? *
        </label>
        <select
          value={causeType}
          onChange={(e) => setCauseType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:outline-none"
        >
          <option value="">Select cause of loss...</option>
          {causeTypes.map((cause) => (
            <option key={cause.value} value={cause.value}>
              {cause.value} - {cause.examples}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location of Source *
        </label>
        <input
          type="text"
          value={causeLocation}
          onChange={(e) => setCauseLocation(e.target.value)}
          placeholder="e.g., Kitchen sink supply line, Master bathroom toilet"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:outline-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={causeNotes}
          onChange={(e) => setCauseNotes(e.target.value)}
          rows={3}
          placeholder="Additional observations about the water source or circumstances..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:outline-none"
        />
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discovery Date *
          </label>
          <input
            type="date"
            value={discoveryDate}
            onChange={(e) => setDiscoveryDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">When the damage was first noticed</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">When the water event occurred (if known)</p>
        </div>
      </div>

      {/* Specialized Services */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Specialized Services</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select any specialized services needed for this job. These will be added to the estimate.
        </p>

        <div className="space-y-3">
          {/* Thermal Imaging */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={thermalImagingUsed}
                onChange={(e) => setThermalImagingUsed(e.target.checked)}
                className="w-5 h-5 text-entrusted-orange border-gray-300 rounded focus:ring-entrusted-orange mt-0.5"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Thermal Imaging</p>
                <p className="text-sm text-gray-600 mt-1">
                  Use thermal camera to detect hidden moisture behind walls, under floors, or in ceilings. Required for comprehensive moisture mapping.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Water Category Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Water Category *</h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on the source, determine the contamination level. This affects safety protocols and equipment requirements.
        </p>
        <div className="space-y-3">
          {waterCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => setWaterCategory(category.value as 1 | 2 | 3)}
              className={`w-full text-left p-4 rounded-lg transition-all ${getColorClasses(
                category.color,
                waterCategory === category.value
              )}`}
            >
              <div className="flex items-start gap-3">
                <Droplets className={`w-5 h-5 flex-shrink-0 mt-1 ${
                  category.color === 'blue' ? 'text-blue-600' :
                  category.color === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{category.title}</h4>
                    {waterCategory === category.value && (
                      <span className="px-2 py-0.5 bg-entrusted-orange text-white text-xs rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{category.description}</p>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Examples:</p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {category.examples.map((example, idx) => (
                        <li key={idx}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category 2/3 Warning */}
      {waterCategory === 2 && (
        <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
            <div>
              <h4 className="font-medium mb-1 text-yellow-900">Category 2 Safety Requirements</h4>
              <ul className="text-sm space-y-1 text-yellow-800">
                <li>✓ Air scrubbers required during drying</li>
                <li>✓ Enhanced PPE required (gloves, mask, protective clothing)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Category 3 Biohazard Containment Checklist (OSHA Compliance) */}
      {waterCategory === 3 && (
        <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-1">🚨 CATEGORY 3 BIOHAZARD - OSHA CONTAINMENT REQUIRED</h4>
              <p className="text-sm text-red-800 mb-3">
                Sewage/black water contains pathogens (E. coli, Hepatitis A, etc.). OSHA requires strict containment protocols.
                Complete ALL checklist items before starting work.
              </p>
            </div>
          </div>

          <div className="bg-white border border-red-300 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-3">Containment Protocol Checklist *</h5>
            <p className="text-xs text-gray-600 mb-4">
              All items must be completed for OSHA compliance and worker safety.
            </p>

            <div className="space-y-3">
              {/* PPE Confirmed */}
              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cat3Checklist.ppeConfirmed}
                  onChange={() => toggleCat3Checklist('ppeConfirmed')}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">1. Enhanced PPE Confirmed</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-0.5 ml-4">
                    <li>• Nitrile gloves (double layer recommended)</li>
                    <li>• N95 or P100 respirator (not surgical mask)</li>
                    <li>• Tyvek suit or waterproof protective clothing</li>
                    <li>• Safety goggles or face shield</li>
                    <li>• Rubber boots (no cloth shoes)</li>
                  </ul>
                </div>
              </label>

              {/* Containment Barriers */}
              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cat3Checklist.containmentBarriers}
                  onChange={() => toggleCat3Checklist('containmentBarriers')}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">2. Containment Barriers Installed</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-0.5 ml-4">
                    <li>• Plastic sheeting (6-mil minimum) sealing work area</li>
                    <li>• Critical barriers (doorways, HVAC vents, adjacent rooms)</li>
                    <li>• Floor protection in transit paths</li>
                    <li>• Dedicated entry/exit point marked</li>
                  </ul>
                </div>
              </label>

              {/* Negative Air Setup */}
              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cat3Checklist.negativeAirSetup}
                  onChange={() => toggleCat3Checklist('negativeAirSetup')}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">3. Negative Air Pressure Established</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-0.5 ml-4">
                    <li>• Air scrubbers with HEPA filtration running</li>
                    <li>• Exhaust vented outside (not to unaffected areas)</li>
                    <li>• Negative pressure prevents contamination spread</li>
                    <li>• Verify air flows INTO work area (not out)</li>
                  </ul>
                </div>
              </label>

              {/* Waste Containment */}
              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cat3Checklist.wasteContainment}
                  onChange={() => toggleCat3Checklist('wasteContainment')}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">4. Biohazard Waste Disposal Plan</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-0.5 ml-4">
                    <li>• Red biohazard bags for contaminated materials</li>
                    <li>• Separate containers for sharps/hard debris</li>
                    <li>• Designated disposal area outside work zone</li>
                    <li>• Do NOT mix with regular construction waste</li>
                  </ul>
                </div>
              </label>

              {/* Cross-Contamination Prevention */}
              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cat3Checklist.crossContaminationPrevention}
                  onChange={() => toggleCat3Checklist('crossContaminationPrevention')}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">5. Cross-Contamination Prevention</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-0.5 ml-4">
                    <li>• Shoe covers or boot wash station at exit</li>
                    <li>• Hand sanitizer/wash station accessible</li>
                    <li>• No food/drink in work area</li>
                    <li>• Tools/equipment decontaminated before removal</li>
                  </ul>
                </div>
              </label>

              {/* Customer Notification */}
              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cat3Checklist.customerNotified}
                  onChange={() => toggleCat3Checklist('customerNotified')}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">6. Customer Notification Complete</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-0.5 ml-4">
                    <li>• Explained biohazard risks and health concerns</li>
                    <li>• Advised to avoid contaminated areas</li>
                    <li>• Pets/children must be kept away from work zone</li>
                    <li>• Provided timeline for safe re-entry</li>
                  </ul>
                </div>
              </label>
            </div>

            {/* Completion Status */}
            {Object.values(cat3Checklist).every(v => v) ? (
              <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  ✓ All containment protocols confirmed. Safe to proceed with Cat 3 work.
                </p>
              </div>
            ) : (
              <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">
                  Complete all checklist items before starting Cat 3 biohazard work (
                  {Object.values(cat3Checklist).filter(v => v).length}/6 completed)
                </p>
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-xs text-red-900">
              <strong>OSHA Violation Risk:</strong> Failure to follow Cat 3 protocols can result in fines up to $15,625 per violation.
              In case of exposure (skin contact, ingestion), seek immediate medical attention and report to MIT Lead.
            </p>
          </div>
        </div>
      )}

      {/* Request Specialist Button */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Need a Specialist?</h4>
            <p className="text-sm text-blue-700">
              If you identified a need for a plumber, electrician, or other specialist during assessment, you can request one now.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowSubModal(true)}
          className="flex items-center gap-2"
        >
          <Wrench className="w-4 h-4" />
          Request Specialist
        </Button>
      </div>

      {/* Validation Warning */}
      {!isComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                Please complete all required fields (photo, cause type, location, and water category) before continuing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subcontractor Request Modal */}
      {showSubModal && (
        <SubcontractorRequestModal
          jobId={job.jobId}
          rooms={installData.rooms || []}
          onClose={() => setShowSubModal(false)}
          onSubmit={handleSubcontractorRequest}
        />
      )}
    </div>
  );
};
