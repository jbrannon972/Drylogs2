import React, { useState } from 'react';
import { Cloud, Home, Info, AlertTriangle, Camera, CheckCircle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { Button } from '../../../shared/Button';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';

interface EnvironmentalCheckStepProps {
  job: any;
  onNext: () => void;
}

export const EnvironmentalCheckStep: React.FC<EnvironmentalCheckStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  // Outside conditions
  const [outsideTemp, setOutsideTemp] = useState('');
  const [outsideHumidity, setOutsideHumidity] = useState('');

  // Reference room (unaffected area)
  const [referenceRoom, setReferenceRoom] = useState('');
  const [referenceTemp, setReferenceTemp] = useState('');
  const [referenceHumidity, setReferenceHumidity] = useState('');

  // PHASE 2: Split hygrometer photos (BOTH REQUIRED)
  const [referenceRoomPhoto, setReferenceRoomPhoto] = useState<string | null>(null);
  const [outsidePhoto, setOutsidePhoto] = useState<string | null>(null);

  React.useEffect(() => {
    updateWorkflowData('checkService', {
      environmental: {
        outsideTemp: parseFloat(outsideTemp) || 0,
        outsideHumidity: parseFloat(outsideHumidity) || 0,
        referenceRoom,
        referenceTemp: parseFloat(referenceTemp) || 0,
        referenceHumidity: parseFloat(referenceHumidity) || 0,
        referenceRoomPhoto, // PHASE 2: Reference room photo
        outsidePhoto, // PHASE 2: Outside photo
        timestamp: new Date().toISOString(),
      },
    });
  }, [outsideTemp, outsideHumidity, referenceRoom, referenceTemp, referenceHumidity, referenceRoomPhoto, outsidePhoto]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'reference' | 'outside') => {
    const file = e.target.files?.[0];
    if (file && user && job) {
      const url = await uploadPhoto(file, job.jobId, 'environmental', 'check-service', user.uid);
      if (url) {
        if (type === 'reference') {
          setReferenceRoomPhoto(url);
        } else {
          setOutsidePhoto(url);
        }
      }
    }
  };

  const isHighHumidity = () => {
    const refRH = parseFloat(referenceHumidity);
    return refRH > 60;
  };

  const getIdealRange = () => {
    // IICRC S500 standard: 30-60% RH, 70-75°F
    return {
      tempMin: 70,
      tempMax: 75,
      rhMin: 30,
      rhMax: 60,
    };
  };

  const isOutOfRange = (temp: string, humidity: string) => {
    const t = parseFloat(temp);
    const h = parseFloat(humidity);
    const ideal = getIdealRange();
    return t < ideal.tempMin || t > ideal.tempMax || h < ideal.rhMin || h > ideal.rhMax;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Environmental Baseline</h4>
            <p className="text-sm text-blue-800">
              Record outside conditions and unaffected reference room for comparison. This establishes your drying baseline per IICRC S500 standards.
            </p>
          </div>
        </div>
      </div>

      {/* Outside Conditions */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Outside Conditions</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°F) *
            </label>
            <Input
              type="number"
              step="0.1"
              value={outsideTemp}
              onChange={(e) => setOutsideTemp(e.target.value)}
              placeholder="72.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Humidity (%) *
            </label>
            <Input
              type="number"
              step="0.1"
              value={outsideHumidity}
              onChange={(e) => setOutsideHumidity(e.target.value)}
              placeholder="45.0"
            />
          </div>
        </div>

        {/* Outside Hygrometer Photo - REQUIRED */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Camera className="w-4 h-4 inline mr-1" />
            Outside Hygrometer Photo (Required) *
          </label>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-orange-900">
              <strong>REQUIRED:</strong> Photo of hygrometer showing outside conditions (temp & humidity)
            </p>
          </div>
          {outsidePhoto ? (
            <div>
              <img src={outsidePhoto} alt="Outside Hygrometer" className="max-h-48 rounded mb-3 border border-gray-300" />
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Photo captured</span>
              </div>
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(e, 'outside')}
                  className="hidden"
                  disabled={isUploading}
                />
                <Camera className="w-4 h-4" />
                Replace Photo
              </label>
            </div>
          ) : (
            <label className="btn-primary cursor-pointer inline-flex items-center gap-2 w-full justify-center py-6 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoUpload(e, 'outside')}
                className="hidden"
                disabled={isUploading}
              />
              <Camera className="w-5 h-5" />
              {isUploading ? 'Uploading...' : 'Take Outside Hygrometer Photo'}
            </label>
          )}
        </div>
      </div>

      {/* Reference Room */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Reference Room (Unaffected)</h3>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Room Name *
          </label>
          <Input
            type="text"
            value={referenceRoom}
            onChange={(e) => setReferenceRoom(e.target.value)}
            placeholder="e.g., Master Bedroom (upstairs)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Choose a room with no water damage for baseline comparison
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°F) *
            </label>
            <Input
              type="number"
              step="0.1"
              value={referenceTemp}
              onChange={(e) => setReferenceTemp(e.target.value)}
              placeholder="72.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Humidity (%) *
            </label>
            <Input
              type="number"
              step="0.1"
              value={referenceHumidity}
              onChange={(e) => setReferenceHumidity(e.target.value)}
              placeholder="45.0"
            />
          </div>
        </div>

        {/* Reference Room Hygrometer Photo - REQUIRED */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Camera className="w-4 h-4 inline mr-1" />
            Reference Room Hygrometer Photo (Required) *
          </label>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-orange-900">
              <strong>REQUIRED:</strong> Photo of hygrometer in reference room showing all readings (temp, RH, GPP if available)
            </p>
          </div>
          {referenceRoomPhoto ? (
            <div>
              <img src={referenceRoomPhoto} alt="Reference Room Hygrometer" className="max-h-48 rounded mb-3 border border-gray-300" />
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Photo captured</span>
              </div>
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(e, 'reference')}
                  className="hidden"
                  disabled={isUploading}
                />
                <Camera className="w-4 h-4" />
                Replace Photo
              </label>
            </div>
          ) : (
            <label className="btn-primary cursor-pointer inline-flex items-center gap-2 w-full justify-center py-6 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoUpload(e, 'reference')}
                className="hidden"
                disabled={isUploading}
              />
              <Camera className="w-5 h-5" />
              {isUploading ? 'Uploading...' : 'Take Reference Room Hygrometer Photo'}
            </label>
          )}
        </div>

        {referenceTemp && referenceHumidity && isOutOfRange(referenceTemp, referenceHumidity) && (
          <div className="mt-3 flex items-start gap-2 text-orange-600 bg-orange-50 p-3 rounded">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Conditions outside IICRC ideal range</p>
              <p className="text-xs mt-1">
                May require additional equipment or HVAC adjustment for optimal drying
              </p>
            </div>
          </div>
        )}

        {referenceHumidity && isHighHumidity() && (
          <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">High ambient humidity detected ({referenceHumidity}%)</p>
              <p className="text-xs mt-1">
                Consider adding dehumidifiers or increasing ventilation. High humidity will slow drying progress.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Data Capture Summary - PHASE 2: Require BOTH photos */}
      {referenceRoom && referenceTemp && referenceHumidity && outsideTemp && outsideHumidity && (
        <div className={`border-2 rounded-lg p-4 ${
          referenceRoomPhoto && outsidePhoto ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          {referenceRoomPhoto && outsidePhoto ? (
            <>
              <p className="text-sm text-green-800 font-medium">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Environmental baseline complete with both photos
              </p>
              <p className="text-xs text-green-700 mt-1">
                All moisture readings will be compared against these conditions
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-yellow-800 font-medium">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Both photos required to complete environmental baseline
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {!referenceRoomPhoto && '• Missing: Reference room hygrometer photo'}
                {!referenceRoomPhoto && !outsidePhoto && <br />}
                {!outsidePhoto && '• Missing: Outside hygrometer photo'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
