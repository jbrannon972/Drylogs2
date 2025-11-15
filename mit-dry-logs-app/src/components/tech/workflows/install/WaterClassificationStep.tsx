import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Droplets, AlertCircle, Info } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface WaterClassificationStepProps {
  job: any;
  onNext: () => void;
}

export const WaterClassificationStep: React.FC<WaterClassificationStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const [waterCategory, setWaterCategory] = useState<1 | 2 | 3 | null>(
    installData.waterClassification?.category || null
  );
  const [notes, setNotes] = useState(installData.waterClassification?.notes || '');

  // Timestamp - initialized once and never changes (prevents infinite loop)
  const [determinedAt] = useState(() =>
    installData.waterClassification?.determinedAt || new Date().toISOString()
  );

  useEffect(() => {
    if (waterCategory) {
      updateWorkflowData('install', {
        waterClassification: {
          category: waterCategory,
          notes,
          determinedAt,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waterCategory, notes, determinedAt]);

  const categories = [
    {
      value: 1,
      title: 'Category 1 - Clean Water',
      description: 'Originates from a sanitary water source',
      examples: ['Broken water supply line', 'Tub or sink overflow (clean water)', 'Melting ice/snow', 'Toilet tank (no contaminants)'],
      color: 'blue',
      risk: 'No substantial health risk',
    },
    {
      value: 2,
      title: 'Category 2 - Gray Water',
      description: 'Contains contamination, may cause discomfort or sickness',
      examples: ['Washing machine overflow', 'Toilet overflow (urine only)', 'Dishwasher overflow', 'Aquarium spill'],
      color: 'yellow',
      risk: 'May cause discomfort or sickness if consumed',
    },
    {
      value: 3,
      title: 'Category 3 - Black Water',
      description: 'Grossly contaminated, contains pathogenic agents',
      examples: ['Sewage backup', 'Toilet overflow (feces)', 'Rising flood water', 'Standing water with microbial growth'],
      color: 'red',
      risk: 'Serious health risk - contains pathogenic agents',
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

  const getBadgeClasses = (color: string) => {
    if (color === 'blue') return 'bg-blue-100 text-blue-800';
    if (color === 'yellow') return 'bg-yellow-100 text-yellow-800';
    if (color === 'red') return 'bg-red-100 text-red-800';
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Determine Water Category</h4>
            <p className="text-sm text-blue-800">
              Identify the source and contamination level of the water intrusion. This determines
              safety protocols and equipment requirements (e.g., air scrubbers for Category 2/3).
            </p>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Select Water Category</h3>
        <div className="space-y-4">
          {categories.map((category) => (
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
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900">{category.title}</h4>
                    {waterCategory === category.value && (
                      <span className="px-2 py-0.5 bg-entrusted-orange text-white text-xs rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{category.description}</p>

                  <div className="mb-2">
                    <p className={`text-xs font-medium mb-2 ${getBadgeClasses(category.color)
                      .replace('bg-', 'text-')}`}>
                      Common Examples:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {category.examples.map((example, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-gray-400 flex-shrink-0">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getBadgeClasses(category.color)}`}>
                    <strong>Health Risk:</strong> {category.risk}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      {waterCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Describe the water source, observations, or any additional details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
          />
        </div>
      )}

      {/* Category 2/3 Warning */}
      {(waterCategory === 2 || waterCategory === 3) && (
        <div className={`border rounded-lg p-3 ${
          waterCategory === 3 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-2">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              waterCategory === 3 ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <h4 className={`font-medium mb-1 ${
                waterCategory === 3 ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {waterCategory === 3 ? 'Category 3 Requirements' : 'Category 2 Requirements'}
              </h4>
              <ul className={`text-sm space-y-1 ${
                waterCategory === 3 ? 'text-red-800' : 'text-yellow-800'
              }`}>
                <li>• Air scrubbers will be required during drying</li>
                <li>• Enhanced PPE required for technicians</li>
                <li>• Additional safety protocols must be followed</li>
                {waterCategory === 3 && (
                  <>
                    <li>• Containment barriers may be necessary</li>
                    <li>• Disposal procedures for contaminated materials</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warning */}
      {!waterCategory && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                You must select a water category before continuing to the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* IICRC Reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          <strong>Reference:</strong> ANSI/IICRC S500-2021 Standard for Professional Water Damage Restoration
        </p>
      </div>
    </div>
  );
};
