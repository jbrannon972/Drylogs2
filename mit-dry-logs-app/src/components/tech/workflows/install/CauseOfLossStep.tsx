import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Droplets, AlertCircle, Info, Camera, Wrench, CheckCircle } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { SubcontractorRequestModal, SubcontractorRequestData } from '../../../shared/SubcontractorRequestModal';
import { UniversalPhotoCapture } from '../../../shared/UniversalPhotoCapture';
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
  const [causePhotos, setCausePhotos] = useState<string[]>(
    Array.isArray(installData.causeOfLoss?.photos)
      ? installData.causeOfLoss.photos
      : installData.causeOfLoss?.photo
        ? [installData.causeOfLoss.photo]
        : []
  );
  const [waterCategory, setWaterCategory] = useState<1 | 2 | 3 | null>(
    installData.waterClassification?.category || null
  );

  // Event Date - when water event occurred
  const [eventDate, setEventDate] = useState(
    installData.causeOfLoss?.eventDate || new Date().toISOString().split('T')[0]
  );
  // PHASE 1: Thermal imaging state removed - now handled in RoomAssessmentStep (per room)
  // PHASE 1: Cat 3 checklist simplified to reminder-only (detailed checklist moved to Demo workflow)

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
        photos: causePhotos,
        photo: causePhotos[0] || null, // Keep backward compatibility
        eventDate,
      },
      waterClassification: {
        category: waterCategory,
        determinedAt,
      },
      // PHASE 1: specializedServices.thermalImaging removed - now per-room in RoomAssessmentStep
      // PHASE 1: cat3Containment removed - detailed checklist moved to Demo workflow
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [causeType, causeLocation, causeNotes, causePhotos, waterCategory, eventDate, determinedAt]);

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

    console.log('Subcontractor request submitted successfully. MIT Lead will be notified.');
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

  const isComplete = causeType && causeLocation && causePhotos.length > 0 && waterCategory;

  return (
    <div className="space-y-4">
      {/* Cause Photo */}
      <div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Document the Water Source</h4>
            <p className="text-sm text-blue-800">
              Identify what caused the water damage and determine the water category. Take clear photos showing the source of water damage.
            </p>
          </div>
        </div>

        {user && (
          <UniversalPhotoCapture
            jobId={job.jobId}
            location="cause-of-loss"
            category="assessment"
            userId={user.uid}
            onPhotosUploaded={(urls) => {
              setCausePhotos(prev => [...prev, ...urls]);
            }}
            uploadedCount={causePhotos.length}
            label="Photos of Cause *"
            minimumPhotos={1}
          />
        )}
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

      {/* Event Date */}
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

      {/* PHASE 1: Thermal imaging moved to RoomAssessmentStep (per room, optional) */}
      {/* This section has been removed - see RoomAssessmentStep for thermal imaging */}

      {/* Water Category Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Water Category *</h3>
        <p className="text-sm text-gray-600 mb-2">
          Based on the source, determine the contamination level. This affects safety protocols and equipment requirements.
        </p>
        <div className="space-y-3">
          {waterCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => setWaterCategory(category.value as 1 | 2 | 3)}
              className={`w-full text-left p-3 rounded-lg transition-all ${getColorClasses(
                category.color,
                waterCategory === category.value
              )}`}
            >
              <div className="flex items-start gap-2">
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
        <div className="border rounded-lg p-3 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-2">
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

      {/* Category 3 Safety Reminders (Simplified) */}
      {waterCategory === 3 && (
        <div className="border-2 border-red-500 rounded-lg p-3 bg-red-50">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 text-lg mb-2">🚨 Category 3 Biohazard Alert</h4>
              <p className="text-sm text-red-800 mb-2">
                Grossly contaminated water (sewage, toilet overflow, rising flood water). Contains dangerous pathogens.
                <strong> OSHA compliance required before starting work.</strong>
              </p>

              <div className="bg-white border border-red-300 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 mb-2">Safety Reminders:</h5>
                <ul className="text-sm text-red-900 space-y-2">
                  <li>• <strong>Enhanced PPE Required:</strong> N95/P100 respirator, Tyvek suit, double gloves, goggles, rubber boots</li>
                  <li>• <strong>Containment Barriers:</strong> Plastic sheeting seals, negative air pressure, HEPA filtration</li>
                  <li>• <strong>Biohazard Disposal:</strong> Red bags for contaminated materials, no mixing with regular waste</li>
                  <li>• <strong>Cross-Contamination Prevention:</strong> Boot wash station, hand sanitizer, tool decontamination</li>
                  <li>• <strong>Customer Notification:</strong> Explain health risks, keep pets/children away from work zone</li>
                  <li>• <strong>Emergency Protocol:</strong> If exposed, seek immediate medical attention and notify supervisor</li>
                </ul>
              </div>

              <div className="mt-2 bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-xs text-red-900 font-medium">
                  ⚠️ OSHA Violation Risk: Failure to follow Cat 3 protocols can result in fines up to $15,625 per violation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Specialist Button */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2 mb-2">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
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
