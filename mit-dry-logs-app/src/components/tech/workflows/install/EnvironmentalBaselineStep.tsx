import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import { PhotoCapture } from '../../../shared/PhotoCapture';
import { Thermometer, Droplets, MapPin, CheckCircle, Info } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface EnvironmentalBaselineStepProps {
  job: any;
}

export const EnvironmentalBaselineStep: React.FC<EnvironmentalBaselineStepProps> = ({ job }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();

  // Outside baseline
  const [outsideTemp, setOutsideTemp] = useState(installData.environmentalBaseline?.outside?.temperature || '');
  const [outsideHumidity, setOutsideHumidity] = useState(installData.environmentalBaseline?.outside?.humidity || '');
  const [hygrometerPhotos, setHygrometerPhotos] = useState<string[]>(installData.environmentalBaseline?.outside?.hygrometerPhotos || []);

  // Timestamp - initialized once and never change (prevents infinite loop)
  const [outsideRecordedAt] = useState(() =>
    installData.environmentalBaseline?.outside?.recordedAt || new Date().toISOString()
  );

  useEffect(() => {
    updateWorkflowData('install', {
      environmentalBaseline: {
        outside: {
          temperature: parseFloat(outsideTemp) || 0,
          humidity: parseFloat(outsideHumidity) || 0,
          hygrometerPhotos,
          recordedAt: outsideRecordedAt,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outsideTemp, outsideHumidity, hygrometerPhotos, outsideRecordedAt]);

  const getDewPoint = (temp: number, humidity: number) => {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  };

  const getGPP = (temp: number, humidity: number) => {
    // Grains Per Pound calculation (simplified)
    const saturationPressure = 6.112 * Math.exp((17.67 * temp) / (temp + 243.5));
    const vaporPressure = (humidity / 100) * saturationPressure;
    return (0.622 * vaporPressure) / (14.696 - vaporPressure) * 7000;
  };

  const outsideTempNum = parseFloat(outsideTemp) || 0;
  const outsideHumidityNum = parseFloat(outsideHumidity) || 0;

  const outsideDewPoint = outsideTempNum && outsideHumidityNum ? getDewPoint(outsideTempNum, outsideHumidityNum) : null;
  const outsideGPP = outsideTempNum && outsideHumidityNum ? getGPP(outsideTempNum, outsideHumidityNum) : null;

  const allDataComplete = outsideTemp && outsideHumidity && hygrometerPhotos.length > 0;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Establish Environmental Baseline</h4>
            <p className="text-sm text-blue-800">
              Record outside conditions to establish the environmental baseline for the job. Take photos of your hygrometer readings for documentation.
            </p>
          </div>
        </div>
      </div>

      {/* Outside Conditions */}
      <div className="border-2 border-blue-300 rounded-lg p-5 bg-blue-50">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Outside Conditions</h3>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Step outside and record the current outdoor temperature and relative humidity.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Outside Temperature (°F) *
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="72.5"
              value={outsideTemp}
              onChange={(e) => setOutsideTemp(e.target.value)}
              className="text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Outside Humidity (%) *
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="55"
              value={outsideHumidity}
              onChange={(e) => setOutsideHumidity(e.target.value)}
              className="text-lg"
            />
          </div>
        </div>

        {/* Psychrometric Calculations - Outside */}
        {outsideDewPoint !== null && outsideGPP !== null && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600">Dew Point</p>
              <p className="text-lg font-bold text-blue-900">{outsideDewPoint.toFixed(1)}°F</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600">GPP (Grains/Lb)</p>
              <p className="text-lg font-bold text-blue-900">{outsideGPP.toFixed(1)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hygrometer Photos */}
      <div className="border-2 border-gray-300 rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Hygrometer Photos</h3>
        <p className="text-sm text-gray-700 mb-4">
          Take photos of your hygrometer displaying the outside temperature and humidity readings.
        </p>
        <PhotoCapture
          jobId={job.jobId}
          stepId="environmental-baseline"
          photoType="hygrometer"
          label="Hygrometer Reading Photos"
          onPhotoCaptured={(url) => {
            setHygrometerPhotos([...hygrometerPhotos, url]);
          }}
          existingPhotos={hygrometerPhotos}
        />
      </div>

      {/* Success Indicator */}
      {allDataComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">✓ Environmental Baseline Complete</h4>
              <p className="text-sm text-green-800">
                Outside conditions and hygrometer photos recorded successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
