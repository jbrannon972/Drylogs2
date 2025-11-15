import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Camera, MapPin, Clock, CheckCircle, Image as ImageIcon, AlertTriangle, Shield, Info } from 'lucide-react';
import { useBatchPhotos } from '../../../../hooks/useBatchPhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface ArrivalStepProps {
  job: any;
}

export const ArrivalStep: React.FC<ArrivalStepProps> = ({ job }) => {
  const { user } = useAuth();
  const { queuePhoto } = useBatchPhotos();
  const { installData, updateWorkflowData } = useWorkflowStore();

  // Initialize from saved data or current time
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  const [arrivalTime, setArrivalTime] = useState(
    installData.arrivalTime || `${hours}:${minutes}`
  );
  const [travelTimeToSite, setTravelTimeToSite] = useState(
    installData.travelTimeToSite || 0
  );
  const [hasTruckPhoto, setHasTruckPhoto] = useState<boolean>(
    installData.hasTruckPhoto || false
  );
  const [hasPropertyPhoto, setHasPropertyPhoto] = useState<boolean>(
    installData.hasPropertyPhoto || false
  );
  const [propertyAge, setPropertyAge] = useState<string>(
    installData.propertyAge || ''
  );

  // ULTRAFAULT: Save to workflow store when data changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateWorkflowData('install', {
        arrivalTime,
        travelTimeToSite,
        hasTruckPhoto,
        hasPropertyPhoto,
        propertyAge: parseInt(propertyAge) || 0,
      });
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivalTime, travelTimeToSite, hasTruckPhoto, hasPropertyPhoto, propertyAge]);

  const handleTruckPhotosCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && user) {
      // Queue all captured photos for background upload
      for (let i = 0; i < files.length; i++) {
        await queuePhoto(files[i], job.jobId, 'truck-location', 'Truck Location', 'arrival');
      }
      // Mark as taken
      setHasTruckPhoto(true);
      // Reset input so same files can be selected again
      e.target.value = '';
    }
  };

  const handlePropertyPhotosCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && user) {
      // Queue all captured photos for background upload
      for (let i = 0; i < files.length; i++) {
        await queuePhoto(files[i], job.jobId, 'property-exterior', 'Property Exterior', 'arrival');
      }
      // Mark as taken
      setHasPropertyPhoto(true);
      // Reset input so same files can be selected again
      e.target.value = '';
    }
  };

  const propertyYearNum = parseInt(propertyAge) || 0;
  const showAsbestosWarning = propertyYearNum > 0 && propertyYearNum < 1980;
  const showLeadWarning = propertyYearNum > 0 && propertyYearNum < 1978;
  const canProceed = hasTruckPhoto && hasPropertyPhoto && propertyAge;

  return (
    <div className="space-y-4">
      {/* Job Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">Job Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>{job.customerInfo.address}, {job.customerInfo.city}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4" />
            <span>Scheduled: {new Date(job.scheduledDate.seconds * 1000).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Clock In */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arrival Time *
          </label>
          <Input
            type="time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Time to Site (minutes)
          </label>
          <Input
            type="number"
            value={travelTimeToSite}
            onChange={(e) => setTravelTimeToSite(parseInt(e.target.value) || 0)}
            placeholder="0"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Drive time from office/home</p>
        </div>
      </div>

      {/* Property Age & EPA Hazards */}
      <div className="border-2 border-gray-300 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Property Age & EPA Hazards</h3>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year Built *
          </label>
          <Input
            type="number"
            value={propertyAge}
            onChange={(e) => setPropertyAge(e.target.value)}
            placeholder="1985"
            min="1800"
            max={new Date().getFullYear()}
          />
          <p className="text-xs text-gray-500 mt-1">Required for EPA hazard assessment</p>
        </div>

        {/* EPA Hazard Warnings - Smart Display */}
        {(showAsbestosWarning || showLeadWarning) && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mt-3">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">⚠️ EPA Hazard Alert</h4>
                <p className="text-sm text-red-800 mb-2">
                  This property was built {showAsbestosWarning ? 'before 1980' : 'before 1978'}. Be aware of the following potential hazards:
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {showAsbestosWarning && (
                <div className="bg-white border border-red-200 rounded p-2">
                  <p className="font-medium text-red-900 mb-2">🔴 Asbestos Hazard (Pre-1980)</p>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>Do not disturb ceiling tiles, insulation, or flooring without testing</li>
                    <li>Use HEPA filtration if demolition is required</li>
                    <li>Wet methods for dust control</li>
                    <li>Contact supervisor if asbestos is suspected</li>
                  </ul>
                </div>
              )}

              {showLeadWarning && (
                <div className="bg-white border border-red-200 rounded p-2">
                  <p className="font-medium text-red-900 mb-2">🔴 Lead Paint Hazard (Pre-1978)</p>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>Assume all painted surfaces contain lead</li>
                    <li>Minimize dust generation during demo</li>
                    <li>Use wet methods when sanding or scraping</li>
                    <li>Proper PPE and hand washing required</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {propertyAge && !showAsbestosWarning && !showLeadWarning && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                ✓ No EPA hazard warnings for structures built in {propertyAge} or later
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Truck Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Truck Location Photo *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
          {hasTruckPhoto && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Photo captured ✓</span>
            </div>
          )}

          <label className="flex flex-col items-center justify-center p-5 border-2 border-gray-200 rounded-lg hover:border-entrusted-orange hover:bg-orange-50 transition-all cursor-pointer active:scale-95">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleTruckPhotosCapture}
              className="hidden"
            />
            <Camera className="w-10 h-10 text-entrusted-orange mb-2" />
            <span className="text-base font-bold text-gray-900">Take Photo</span>
            <span className="text-sm text-gray-500">Document truck location for safety</span>
          </label>
        </div>
      </div>

      {/* Property Exterior Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Exterior Photo *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
          {hasPropertyPhoto && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Photo captured ✓</span>
            </div>
          )}

          <label className="flex flex-col items-center justify-center p-5 border-2 border-gray-200 rounded-lg hover:border-entrusted-orange hover:bg-orange-50 transition-all cursor-pointer active:scale-95">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePropertyPhotosCapture}
              className="hidden"
            />
            <Camera className="w-10 h-10 text-entrusted-orange mb-2" />
            <span className="text-base font-bold text-gray-900">Take Photo</span>
            <span className="text-sm text-gray-500">Document property exterior</span>
          </label>
        </div>
      </div>

      {/* Success Indicator */}
      {canProceed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">✓ Arrival Step Complete</h4>
              <p className="text-sm text-green-800">
                All required information captured. Click Next to continue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {!canProceed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            ⚠️ Please complete the following to proceed:
          </p>
          <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
            {!hasTruckPhoto && <li>Take truck location photo</li>}
            {!hasPropertyPhoto && <li>Take property exterior photo</li>}
            {!propertyAge && <li>Enter year built</li>}
          </ul>
        </div>
      )}
    </div>
  );
};
