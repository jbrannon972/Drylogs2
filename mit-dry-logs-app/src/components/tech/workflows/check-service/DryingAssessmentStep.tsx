import React, { useState } from 'react';
import { Calendar, Info, TrendingDown, AlertTriangle } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface DryingAssessmentStepProps {
  job: any;
  onNext: () => void;
}

export const DryingAssessmentStep: React.FC<DryingAssessmentStepProps> = ({ job, onNext }) => {
  const { checkServiceData, updateWorkflowData } = useWorkflowStore();
  const [estimatedDays, setEstimatedDays] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (estimatedDays !== null) {
      updateWorkflowData('checkService', {
        dryingAssessment: {
          estimatedDaysRemaining: estimatedDays,
          assessmentDate: new Date().toISOString(),
          notes,
        },
      });
    }
  }, [estimatedDays, notes]);

  // Calculate drying progress from room readings
  const calculateDryingProgress = () => {
    const roomReadings = checkServiceData?.roomReadings || [];
    if (roomReadings.length === 0) return null;

    let totalReadings = 0;
    let dryReadings = 0;
    let totalMoisture = 0;

    roomReadings.forEach((room: any) => {
      room.readings.forEach((reading: any) => {
        totalReadings++;
        totalMoisture += reading.currentReading;
        if (reading.isDry) dryReadings++;
      });
    });

    const avgMoisture = totalReadings > 0 ? totalMoisture / totalReadings : 0;
    const percentDry = totalReadings > 0 ? (dryReadings / totalReadings) * 100 : 0;

    return {
      totalReadings,
      dryReadings,
      percentDry: Math.round(percentDry),
      avgMoisture: avgMoisture.toFixed(1),
    };
  };

  // Estimate days remaining based on moisture levels and drying rate
  const estimateDaysRemaining = () => {
    const progress = calculateDryingProgress();
    if (!progress) return null;

    const { avgMoisture, percentDry } = progress;
    const avgMoistureNum = parseFloat(avgMoisture);

    // IICRC dry standard: < 12%
    if (avgMoistureNum < 12) return 0;

    // Basic estimation formula (can be refined with historical data)
    // Typical drying rate: 2-4% per day with proper equipment
    const assumedDryingRate = 3; // % per day
    const moistureToRemove = avgMoistureNum - 12;
    const estimatedDays = Math.ceil(moistureToRemove / assumedDryingRate);

    return Math.max(0, estimatedDays);
  };

  const progress = calculateDryingProgress();
  const autoEstimate = estimateDaysRemaining();

  React.useEffect(() => {
    if (autoEstimate !== null && estimatedDays === null) {
      setEstimatedDays(autoEstimate);
    }
  }, [autoEstimate]);

  const daysSinceStart = () => {
    if (!job.startDate) return 0;
    const start = new Date(job.startDate);
    const today = new Date();
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getProgressColor = () => {
    if (!progress) return 'text-gray-600';
    if (progress.percentDry >= 80) return 'text-green-600';
    if (progress.percentDry >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDryingTrend = () => {
    if (!progress) return null;
    const days = daysSinceStart();
    if (days === 0) return null;

    const expectedProgress = days * 20; // Expect ~20% per day
    const actualProgress = progress.percentDry;

    if (actualProgress >= expectedProgress) {
      return {
        status: 'on-track',
        message: 'Drying is progressing as expected',
        color: 'text-green-600',
      };
    } else if (actualProgress >= expectedProgress * 0.7) {
      return {
        status: 'slow',
        message: 'Drying slower than expected - may need more equipment',
        color: 'text-orange-600',
      };
    } else {
      return {
        status: 'behind',
        message: 'Drying significantly behind schedule - immediate action needed',
        color: 'text-red-600',
      };
    }
  };

  const trend = getDryingTrend();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Drying Progress Assessment</h4>
            <p className="text-sm text-blue-800">
              Calculate estimated completion date based on current moisture levels and drying rate.
            </p>
          </div>
        </div>
      </div>

      {!progress ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No moisture readings found. Complete the Room Readings step first to calculate drying progress.
          </p>
        </div>
      ) : (
        <>
          {/* Current Progress */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">Current Drying Status</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-3xl font-bold ${getProgressColor()}`}>
                  {progress.percentDry}%
                </p>
                <p className="text-xs text-gray-600">Materials Dry</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {progress.avgMoisture}%
                </p>
                <p className="text-xs text-gray-600">Avg Moisture</p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentDry}%` }}
              />
            </div>

            <div className="mt-3 text-sm text-gray-600">
              {progress.dryReadings} of {progress.totalReadings} materials are below 12% (IICRC dry standard)
            </div>
          </div>

          {/* Timeline */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Drying Timeline
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{daysSinceStart()}</p>
                <p className="text-xs text-gray-600">Days Since Start</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-entrusted-orange">
                  {estimatedDays !== null ? estimatedDays : autoEstimate}
                </p>
                <p className="text-xs text-gray-600">Est. Days Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {daysSinceStart() + (estimatedDays !== null ? estimatedDays : autoEstimate || 0)}
                </p>
                <p className="text-xs text-gray-600">Total Days</p>
              </div>
            </div>

            {/* Manual Override */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjust Estimated Days Remaining
              </label>
              <input
                type="number"
                min="0"
                value={estimatedDays !== null ? estimatedDays : autoEstimate || 0}
                onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-calculated based on current moisture levels. Adjust based on your assessment.
              </p>
            </div>
          </div>

          {/* Drying Trend */}
          {trend && (
            <div className={`border rounded-lg p-4 ${
              trend.status === 'on-track' ? 'bg-green-50 border-green-200' :
              trend.status === 'slow' ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {trend.status === 'on-track' ? (
                  <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    trend.status === 'slow' ? 'text-orange-600' : 'text-red-600'
                  }`} />
                )}
                <div>
                  <h4 className={`font-medium mb-1 ${
                    trend.status === 'on-track' ? 'text-green-900' :
                    trend.status === 'slow' ? 'text-orange-900' :
                    'text-red-900'
                  }`}>
                    Drying Progress: {trend.status === 'on-track' ? 'On Track' : trend.status === 'slow' ? 'Slow' : 'Behind Schedule'}
                  </h4>
                  <p className={`text-sm ${
                    trend.status === 'on-track' ? 'text-green-800' :
                    trend.status === 'slow' ? 'text-orange-800' :
                    'text-red-800'
                  }`}>
                    {trend.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Any observations about drying progress, conditions, or concerns..."
            />
          </div>

          {/* Completion Check */}
          {progress.percentDry === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Ready for Equipment Pull!</h4>
                  <p className="text-sm text-green-800">
                    All materials are below 12% moisture. This job is ready for final verification and equipment removal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
