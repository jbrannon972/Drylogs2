import React, { useState } from 'react';
import { Shield, Info } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface PPESuppliesStepProps {
  job: any;
  onNext: () => void;
}

export const PPESuppliesStep: React.FC<PPESuppliesStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const waterCategory = job.insuranceInfo?.categoryOfWater || 'Category 1';
  const requiresPPE = waterCategory === 'Category 2' || waterCategory === 'Category 3';

  const [ppeUsed, setPPEUsed] = useState({
    coveralls: 0,
    respirators: 0,
    gloves: 0,
    eyeProtection: 0,
    bootCovers: 0,
  });

  React.useEffect(() => {
    updateWorkflowData('demo', { ppeSupplies: ppeUsed });
  }, [ppeUsed]);

  const updatePPE = (item: keyof typeof ppeUsed, value: number) => {
    setPPEUsed(prev => ({ ...prev, [item]: value }));
  };

  if (!requiresPPE) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">PPE Not Required</h4>
              <p className="text-sm text-green-800">
                This is {waterCategory} (clean water). Standard safety equipment is sufficient.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`border rounded-lg p-4 ${
        waterCategory === 'Category 3' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start gap-3">
          <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            waterCategory === 'Category 3' ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <div>
            <h4 className={`font-medium mb-1 ${
              waterCategory === 'Category 3' ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {waterCategory} - PPE Required
            </h4>
            <p className={`text-sm ${
              waterCategory === 'Category 3' ? 'text-red-800' : 'text-yellow-800'
            }`}>
              Track PPE usage for billing purposes. All items used must be documented.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'coveralls', label: 'Full Coveralls' },
          { key: 'respirators', label: 'Respirators (N95/P100)' },
          { key: 'gloves', label: 'Disposable Gloves (pairs)' },
          { key: 'eyeProtection', label: 'Eye Protection' },
          { key: 'bootCovers', label: 'Boot Covers (pairs)' },
        ].map(({ key, label }) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => updatePPE(key as keyof typeof ppeUsed, Math.max(0, ppeUsed[key as keyof typeof ppeUsed] - 1))}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                −
              </button>
              <span className="text-2xl font-bold text-gray-900">{ppeUsed[key as keyof typeof ppeUsed]}</span>
              <button
                onClick={() => updatePPE(key as keyof typeof ppeUsed, ppeUsed[key as keyof typeof ppeUsed] + 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
