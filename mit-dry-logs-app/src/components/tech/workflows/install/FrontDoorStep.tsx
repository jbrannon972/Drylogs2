import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface FrontDoorStepProps {
  job: any;
  onNext: () => void;
}

export const FrontDoorStep: React.FC<FrontDoorStepProps> = ({ job, onNext }) => {
  const [checklist, setChecklist] = useState({
    introduced: false,
    groundRules: false,
    walkthrough: false,
    questions: false,
    utilities: false,
  });

  const handleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allComplete = Object.values(checklist).every(v => v);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Customer: {job.customerInfo.name}</h3>
        <p className="text-sm text-gray-700">Phone: {job.customerInfo.phoneNumber}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Ground Rules Presentation</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.introduced}
              onChange={() => handleCheck('introduced')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">1. Introduce yourself and team</p>
              <p className="text-sm text-gray-600">Present Entrusted identification</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.groundRules}
              onChange={() => handleCheck('groundRules')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">2. Explain today's process</p>
              <p className="text-sm text-gray-600">Purpose, timeline, noise levels, access needs</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.walkthrough}
              onChange={() => handleCheck('walkthrough')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">3. Property walkthrough</p>
              <p className="text-sm text-gray-600">Tour affected areas, listen to customer's story</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.questions}
              onChange={() => handleCheck('questions')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">4. Address customer concerns</p>
              <p className="text-sm text-gray-600">Answer questions, establish communication preferences</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.utilities}
              onChange={() => handleCheck('utilities')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">5. Confirm utility locations</p>
              <p className="text-sm text-gray-600">Electrical, gas, water shut-offs</p>
            </div>
          </label>
        </div>
      </div>

      {allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">All ground rules completed ✓</p>
        </div>
      )}
    </div>
  );
};
