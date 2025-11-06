// Stub components for Install workflow steps
// These will be fully implemented in the next iteration

import React from 'react';

interface StepProps {
  job: any;
  onNext: () => void;
}

export const PreExistingStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Document any pre-existing conditions not related to the water loss.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Pre-existing conditions interface coming soon...</p>
    </div>
  </div>
);

export const CauseOfLossStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Identify and document the cause of loss.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Cause of loss documentation coming soon...</p>
    </div>
  </div>
);

export const AffectedRoomsStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Document materials affected in each room.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Affected materials interface coming soon...</p>
    </div>
  </div>
);

export const EquipmentCalcStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Calculate equipment needs using IICRC S500 standards.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Equipment calculator coming soon...</p>
    </div>
  </div>
);

export const EquipmentPlaceStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Place and scan equipment in designated chambers.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Equipment placement and scanning coming soon...</p>
    </div>
  </div>
);

export const CommunicatePlanStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Review the mitigation plan with the customer.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Plan communication interface coming soon...</p>
    </div>
  </div>
);

export const FinalPhotosStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Take final documentation photos of the setup.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Final photo capture coming soon...</p>
    </div>
  </div>
);

export const ReviewStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Review all collected data before completing.</p>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Review interface coming soon...</p>
    </div>
  </div>
);

export const CompleteStep: React.FC<StepProps> = ({ job, onNext }) => (
  <div>
    <p className="text-gray-600 mb-4">Finalize the install and prepare to depart.</p>
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <p className="text-sm text-green-800 font-medium">✓ Install workflow complete!</p>
    </div>
  </div>
);
