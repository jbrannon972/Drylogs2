import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { Camera, MapPin, Clock, CheckCircle, Image as ImageIcon, Thermometer } from 'lucide-react';
import { useBatchPhotos } from '../../../../hooks/useBatchPhotos';
import { useAuth } from '../../../../hooks/useAuth';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface ArrivalStepProps {
  job: any;
  onNext: () => void;
}

export const ArrivalStep: React.FC<ArrivalStepProps> = ({ job, onNext }) => {
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

  // Exterior environmental baseline (IICRC S500 requirement)
  const [exteriorTemp, setExteriorTemp] = useState<string>(
    installData.environmentalBaseline?.exterior?.temperature || ''
  );
  const [exteriorRH, setExteriorRH] = useState<string>(
    installData.environmentalBaseline?.exterior?.relativeHumidity || ''
  );
  const [hasMeterPhoto, setHasMeterPhoto] = useState<boolean>(
    installData.environmentalBaseline?.exterior?.hasMeterPhoto || false
  );

  // ULTRAFAULT: Save to workflow store when data changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateWorkflowData('install', {
        arrivalTime,
        travelTimeToSite,
        hasTruckPhoto,
        hasPropertyPhoto,
        environmentalBaseline: {
          ...(installData.environmentalBaseline || {}),
          exterior: {
            temperature: exteriorTemp,
            relativeHumidity: exteriorRH,
            hasMeterPhoto,
          },
        },
      });
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivalTime, travelTimeToSite, hasTruckPhoto, hasPropertyPhoto, exteriorTemp, exteriorRH, hasMeterPhoto]);

  const handleTruckPhotosCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && user) {
      // Queue all captured photos for background upload
      for (let i = 0; i < files.length; i++) {
        await queuePhoto(files[i], job.jobId, 'exterior', 'Exterior', 'arrival');
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
        await queuePhoto(files[i], job.jobId, 'exterior', 'Exterior', 'arrival');
      }
      // Mark as taken
      setHasPropertyPhoto(true);
      // Reset input so same files can be selected again
      e.target.value = '';
    }
  };

  const handleMeterPhotosCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && user) {
      // Queue all captured photos for background upload
      for (let i = 0; i < files.length; i++) {
        await queuePhoto(files[i], job.jobId, 'environmental-baseline', 'Environmental Baseline', 'arrival');
      }
      // Mark as taken
      setHasMeterPhoto(true);
      // Reset input so same files can be selected again
      e.target.value = '';
    }
  };

  const canProceed = hasTruckPhoto && hasPropertyPhoto && exteriorTemp && exteriorRH && hasMeterPhoto;

  return (
    <div className="space-y-6">
      {/* Job Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arrival Time
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

      {/* Truck Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Truck Location Photo *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {hasTruckPhoto && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Photos queued</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Take Photo */}
            <label className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-entrusted-orange hover:bg-orange-50 transition-all cursor-pointer active:scale-95">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleTruckPhotosCapture}
                className="hidden"
              />
              <Camera className="w-8 h-8 text-entrusted-orange mb-2" />
              <span className="text-sm font-bold text-gray-900">Take Photo</span>
              <span className="text-xs text-gray-500">Camera</span>
            </label>

            {/* Select Multiple */}
            <label className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer active:scale-95">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleTruckPhotosCapture}
                className="hidden"
              />
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-bold text-gray-900">Select Multiple</span>
              <span className="text-xs text-gray-500">Gallery</span>
            </label>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Required for safety documentation
          </p>
        </div>
      </div>

      {/* Property Exterior Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Exterior Photo *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {hasPropertyPhoto && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Photos queued</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Take Photo */}
            <label className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-entrusted-orange hover:bg-orange-50 transition-all cursor-pointer active:scale-95">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePropertyPhotosCapture}
                className="hidden"
              />
              <Camera className="w-8 h-8 text-entrusted-orange mb-2" />
              <span className="text-sm font-bold text-gray-900">Take Photo</span>
              <span className="text-xs text-gray-500">Camera</span>
            </label>

            {/* Select Multiple */}
            <label className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer active:scale-95">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePropertyPhotosCapture}
                className="hidden"
              />
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-bold text-gray-900">Select Multiple</span>
              <span className="text-xs text-gray-500">Gallery</span>
            </label>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Document property exterior
          </p>
        </div>
      </div>

      {/* Exterior Environmental Baseline - IICRC S500 Requirement */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Exterior Environmental Baseline</h3>
        </div>
        <p className="text-xs text-blue-700 mb-4">IICRC S500 requires exterior baseline readings for drying calculations</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outside Temperature (°F) *
            </label>
            <Input
              type="number"
              value={exteriorTemp}
              onChange={(e) => setExteriorTemp(e.target.value)}
              placeholder="72"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outside Relative Humidity (%) *
            </label>
            <Input
              type="number"
              value={exteriorRH}
              onChange={(e) => setExteriorRH(e.target.value)}
              placeholder="50"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Meter Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meter Reading Photo *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {hasMeterPhoto && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Photos queued</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Take Photo */}
              <label className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-entrusted-orange hover:bg-orange-50 transition-all cursor-pointer active:scale-95">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleMeterPhotosCapture}
                  className="hidden"
                />
                <Camera className="w-8 h-8 text-entrusted-orange mb-2" />
                <span className="text-sm font-bold text-gray-900">Take Photo</span>
                <span className="text-xs text-gray-500">Camera</span>
              </label>

              {/* Select Multiple */}
              <label className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer active:scale-95">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMeterPhotosCapture}
                  className="hidden"
                />
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-bold text-gray-900">Select Multiple</span>
                <span className="text-xs text-gray-500">Gallery</span>
              </label>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Photo of meter showing temperature and humidity readings
            </p>
          </div>
        </div>
      </div>

      {/* Safety Checklist */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Safety Checklist</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Safety cones placed</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">PPE equipped and ready</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Vehicle secured</span>
          </label>
        </div>
      </div>

      {!canProceed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            ⚠️ Please complete the following to proceed:
          </p>
          <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
            {!hasTruckPhoto && <li>Upload truck location photo</li>}
            {!hasPropertyPhoto && <li>Upload property exterior photo</li>}
            {!exteriorTemp && <li>Enter exterior temperature</li>}
            {!exteriorRH && <li>Enter exterior relative humidity</li>}
            {!hasMeterPhoto && <li>Upload meter reading photo</li>}
          </ul>
        </div>
      )}
    </div>
  );
};
