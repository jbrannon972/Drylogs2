import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Calendar, Clock, AlertCircle, Info, Plus, Trash2, Wrench } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { SubcontractorRequestModal, SubcontractorRequestData } from '../../../shared/SubcontractorRequestModal';
import { useAuth } from '../../../../hooks/useAuth';
import { usePhotos } from '../../../../hooks/usePhotos';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

interface ScheduleWorkStepProps {
  job: any;
  onNext: () => void;
}

interface ScheduledVisit {
  id: string;
  day: number;
  type: 'demo' | 'check' | 'pull';
  date: string;
  arrivalWindow: string;
  estimatedHours: string;
  teamSize: string;
  notes: string;
}

export const ScheduleWorkStep: React.FC<ScheduleWorkStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto } = usePhotos();
  const [visits, setVisits] = useState<ScheduledVisit[]>(installData.scheduledVisits || []);
  const [estimatedDryingDays, setEstimatedDryingDays] = useState(
    installData.dryingPlan?.estimatedDays || '3'
  );
  const [showSubModal, setShowSubModal] = useState(false);

  // ULTRAFAULT FIX: Use ref to prevent infinite loop by tracking previous values
  const prevDataRef = useRef({
    visits: JSON.stringify(installData.scheduledVisits || []),
    days: installData.dryingPlan?.estimatedDays || '3'
  });

  // Auto-save only when data actually changes
  useEffect(() => {
    const currentVisitsStr = JSON.stringify(visits);
    const currentDays = estimatedDryingDays;

    // Only update if values actually changed from what we loaded from store
    if (
      prevDataRef.current.visits !== currentVisitsStr ||
      prevDataRef.current.days !== currentDays
    ) {
      const timeoutId = setTimeout(() => {
        updateWorkflowData('install', {
          scheduledVisits: visits,
          dryingPlan: {
            ...installData.dryingPlan,
            estimatedDays: parseInt(estimatedDryingDays) || 3,
          },
        });
        // Update ref to prevent re-triggering
        prevDataRef.current = {
          visits: currentVisitsStr,
          days: currentDays
        };
      }, 500); // Increased debounce

      return () => clearTimeout(timeoutId);
    }
  }, [visits, estimatedDryingDays, updateWorkflowData, installData.dryingPlan]);

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

  const addVisit = (type: 'demo' | 'check' | 'pull') => {
    const dayNumber = visits.length + 2; // Day 1 is install, so start at Day 2
    const installDate = new Date();
    const visitDate = new Date(installDate);
    visitDate.setDate(visitDate.getDate() + dayNumber - 1);

    const newVisit: ScheduledVisit = {
      id: Date.now().toString(),
      day: dayNumber,
      type,
      date: visitDate.toISOString().split('T')[0],
      arrivalWindow: type === 'demo' ? '08:00-09:00' : '10:00-14:00',
      estimatedHours: type === 'demo' ? '4' : type === 'check' ? '1' : '3',
      teamSize: type === 'demo' ? '2' : '1',
      notes: '',
    };

    setVisits([...visits, newVisit]);
  };

  const removeVisit = (id: string) => {
    setVisits(visits.filter(v => v.id !== id));
  };

  const updateVisit = (id: string, field: string, value: string) => {
    setVisits(visits.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const getVisitIcon = (type: string) => {
    if (type === 'demo') return '🔨';
    if (type === 'check') return '📋';
    if (type === 'pull') return '📦';
    return '📅';
  };

  const getVisitColor = (type: string) => {
    if (type === 'demo') return 'orange';
    if (type === 'check') return 'blue';
    if (type === 'pull') return 'green';
    return 'gray';
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Plan Day-by-Day Work Schedule</h4>
            <p className="text-sm text-blue-800">
              Schedule demo work, check services, and equipment pull. Each visit creates a work order for the team.
            </p>
          </div>
        </div>
      </div>

      {/* Estimated Drying Timeline */}
      <div className="border rounded-lg p-3 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">Estimated Drying Timeline</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Estimated Drying Days"
            type="number"
            min="1"
            max="14"
            value={estimatedDryingDays}
            onChange={(e) => setEstimatedDryingDays(e.target.value)}
          />
          <div className="pt-6">
            <p className="text-sm text-gray-600">
              Based on damage class and affected area, job will take approximately{' '}
              <strong>{estimatedDryingDays} days</strong> to dry.
            </p>
          </div>
        </div>
      </div>

      {/* Scheduled Visits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Scheduled Visits (Day 2+)</h3>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => addVisit('demo')}
              className="text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Demo
            </Button>
            <Button
              variant="secondary"
              onClick={() => addVisit('check')}
              className="text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Check
            </Button>
            <Button
              variant="secondary"
              onClick={() => addVisit('pull')}
              className="text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Pull
            </Button>
          </div>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Calendar className="w-16 h-16 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-600 font-medium mb-2">No visits scheduled yet</p>
            <p className="text-sm text-gray-500 mb-2">Add demo, check services, and pull visits</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.sort((a, b) => a.day - b.day).map((visit) => (
              <div
                key={visit.id}
                className={`border-2 rounded-lg p-3 ${
                  visit.type === 'demo' ? 'border-orange-200 bg-orange-50' :
                  visit.type === 'check' ? 'border-blue-200 bg-blue-50' :
                  'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="text-3xl flex-shrink-0">{getVisitIcon(visit.type)}</div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">
                          Day {visit.day} -{' '}
                          {visit.type === 'demo' ? 'Demo Work' :
                           visit.type === 'check' ? 'Check Service' :
                           'Equipment Pull'}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeVisit(visit.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={visit.date}
                          onChange={(e) => updateVisit(visit.id, 'date', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-entrusted-orange"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Arrival Window
                        </label>
                        <input
                          type="text"
                          value={visit.arrivalWindow}
                          onChange={(e) => updateVisit(visit.id, 'arrivalWindow', e.target.value)}
                          placeholder="08:00-09:00"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-entrusted-orange"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Estimated Hours
                        </label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={visit.estimatedHours}
                          onChange={(e) => updateVisit(visit.id, 'estimatedHours', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-entrusted-orange"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Team Size
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="6"
                          value={visit.teamSize}
                          onChange={(e) => updateVisit(visit.id, 'teamSize', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-entrusted-orange"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notes / Work to be done
                      </label>
                      <textarea
                        value={visit.notes}
                        onChange={(e) => updateVisit(visit.id, 'notes', e.target.value)}
                        rows={2}
                        placeholder={
                          visit.type === 'demo' ? 'e.g., Remove 200 sqft drywall in master bath, demo carpet in hallway' :
                          visit.type === 'check' ? 'e.g., Take moisture readings, check equipment, adjust as needed' :
                          'e.g., Final readings, pull all equipment, site restoration'
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-entrusted-orange"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Suggestions */}
      {visits.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 mb-2">Typical Job Schedule</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• <strong>Day 1 (Today):</strong> Install equipment, initial readings</p>
            <p>• <strong>Day 2:</strong> Demo work (remove affected materials)</p>
            <p>• <strong>Days 3-5:</strong> Check services (monitor progress, adjust equipment)</p>
            <p>• <strong>Final Day:</strong> Pull equipment when dry standards met</p>
          </div>
        </div>
      )}

      {/* Request Specialist Button */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2 mb-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Need a Specialist for Future Work?</h4>
            <p className="text-sm text-blue-700">
              If you identified work that requires a specialist (plumber, electrician, etc.), request scheduling now.
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

      {/* Summary */}
      {visits.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-medium text-green-900 mb-2">Work Schedule Summary</h4>
          <div className="space-y-1 text-sm text-green-800">
            <p>• Total visits scheduled: <strong>{visits.length}</strong></p>
            <p>• Demo days: <strong>{visits.filter(v => v.type === 'demo').length}</strong></p>
            <p>• Check services: <strong>{visits.filter(v => v.type === 'check').length}</strong></p>
            <p>• Equipment pulls: <strong>{visits.filter(v => v.type === 'pull').length}</strong></p>
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
