import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/Button';
import { Input } from '../../../shared/Input';
import {
  Clipboard,
  Phone,
  Package,
  CheckCircle,
  AlertCircle,
  Info,
  Clock
} from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { useAuth } from '../../../../hooks/useAuth';

interface OfficePreparationStepProps {
  job: any;
}

export const OfficePreparationStep: React.FC<OfficePreparationStepProps> = ({ job }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();

  const [workOrderReviewed, setWorkOrderReviewed] = useState(
    installData.officePreparation?.workOrderReviewed || false
  );
  const [customerContactVerified, setCustomerContactVerified] = useState(
    installData.officePreparation?.customerContactVerified || false
  );
  const [insuranceInfoReviewed, setInsuranceInfoReviewed] = useState(
    installData.officePreparation?.insuranceInfoReviewed || false
  );

  const [customerCalled, setCustomerCalled] = useState(
    installData.officePreparation?.customerCommunication?.called || false
  );
  const [arrivalWindow, setArrivalWindow] = useState(
    installData.officePreparation?.customerCommunication?.arrivalWindow || '9-1'
  );
  const [customArrivalWindow, setCustomArrivalWindow] = useState(
    installData.officePreparation?.customerCommunication?.customArrivalWindow || ''
  );
  const [customerNotes, setCustomerNotes] = useState(
    installData.officePreparation?.customerCommunication?.customerNotes || ''
  );

  const [dehumidifiersLoaded, setDehumidifiersLoaded] = useState(
    installData.officePreparation?.equipmentLoaded?.dehumidifiers || 0
  );
  const [airMoversLoaded, setAirMoversLoaded] = useState(
    installData.officePreparation?.equipmentLoaded?.airMovers || 0
  );
  const [airScrubbersLoaded, setAirScrubbersLoaded] = useState(
    installData.officePreparation?.equipmentLoaded?.airScrubbers || 0
  );

  const [suppliesChecklist, setSuppliesChecklist] = useState({
    moistureMeter: installData.officePreparation?.equipmentLoaded?.suppliesChecklist?.moistureMeter || false,
    thermalCamera: installData.officePreparation?.equipmentLoaded?.suppliesChecklist?.thermalCamera || false,
    plasticSheeting: installData.officePreparation?.equipmentLoaded?.suppliesChecklist?.plasticSheeting || false,
    containmentMaterials: installData.officePreparation?.equipmentLoaded?.suppliesChecklist?.containmentMaterials || false,
    ppe: installData.officePreparation?.equipmentLoaded?.suppliesChecklist?.ppe || false,
    other: installData.officePreparation?.equipmentLoaded?.suppliesChecklist?.other || '',
  });

  const [preparationNotes, setPreparationNotes] = useState(
    installData.officePreparation?.preparationNotes || ''
  );

  // Timestamp - initialized once and never changes (prevents infinite loop)
  const [completedAt] = useState(() =>
    installData.officePreparation?.completedAt || new Date().toISOString()
  );

  useEffect(() => {
    updateWorkflowData('install', {
      officePreparation: {
        completed: true,
        completedBy: user?.uid,
        completedAt,

        workOrderReviewed,
        customerContactVerified,
        insuranceInfoReviewed,

        customerCommunication: {
          called: customerCalled,
          arrivalWindow,
          customArrivalWindow: arrivalWindow === 'custom' ? customArrivalWindow : undefined,
          customerNotes,
        },

        equipmentLoaded: {
          dehumidifiers: dehumidifiersLoaded,
          airMovers: airMoversLoaded,
          airScrubbers: airScrubbersLoaded,
          suppliesChecklist,
        },

        preparationNotes,
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    workOrderReviewed,
    customerContactVerified,
    insuranceInfoReviewed,
    customerCalled,
    arrivalWindow,
    customArrivalWindow,
    customerNotes,
    dehumidifiersLoaded,
    airMoversLoaded,
    airScrubbersLoaded,
    suppliesChecklist,
    preparationNotes,
    user,
    completedAt
  ]);

  const workOrderComplete = workOrderReviewed && customerContactVerified && insuranceInfoReviewed;
  const equipmentReady = (dehumidifiersLoaded > 0 || airMoversLoaded > 0 || airScrubbersLoaded > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clipboard className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Office Preparation (Optional)
            </h3>
            <p className="text-sm text-blue-700">
              Complete this step before leaving for the job site. Document your pre-departure preparation,
              customer communication, and equipment loaded. <strong>You can skip this step if you're already on-site.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Work Order Review */}
      <div className="border-2 border-gray-200 rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clipboard className="w-5 h-5 text-entrusted-orange" />
          Work Order Review
        </h4>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={workOrderReviewed}
              onChange={(e) => setWorkOrderReviewed(e.target.checked)}
              className="mt-1 h-5 w-5 text-entrusted-orange rounded focus:ring-entrusted-orange"
            />
            <div>
              <span className="font-medium text-gray-900">Work order reviewed and understood</span>
              <p className="text-sm text-gray-600">Job type, estimated duration, scope of work</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={customerContactVerified}
              onChange={(e) => setCustomerContactVerified(e.target.checked)}
              className="mt-1 h-5 w-5 text-entrusted-orange rounded focus:ring-entrusted-orange"
            />
            <div>
              <span className="font-medium text-gray-900">Customer contact info verified</span>
              <p className="text-sm text-gray-600">{job.customerInfo.phoneNumber} • {job.customerInfo.email}</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={insuranceInfoReviewed}
              onChange={(e) => setInsuranceInfoReviewed(e.target.checked)}
              className="mt-1 h-5 w-5 text-entrusted-orange rounded focus:ring-entrusted-orange"
            />
            <div>
              <span className="font-medium text-gray-900">Insurance information reviewed</span>
              <p className="text-sm text-gray-600">
                {job.insuranceInfo?.carrierName || 'No insurance info'} • Claim #{job.insuranceInfo?.claimNumber || 'N/A'}
              </p>
            </div>
          </label>
        </div>

        {workOrderComplete && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Work order review complete</span>
          </div>
        )}
      </div>

      {/* Customer Communication */}
      <div className="border-2 border-gray-200 rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-entrusted-orange" />
          Customer Communication
        </h4>

        <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors mb-4">
          <input
            type="checkbox"
            checked={customerCalled}
            onChange={(e) => setCustomerCalled(e.target.checked)}
            className="mt-1 h-5 w-5 text-entrusted-orange rounded focus:ring-entrusted-orange"
          />
          <div>
            <span className="font-medium text-gray-900">Customer called to confirm arrival window</span>
            <p className="text-sm text-gray-600">Spoke with customer about ETA and expectations</p>
          </div>
        </label>

        {customerCalled && (
          <div className="space-y-4 ml-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmed Arrival Window:
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="9-1"
                    checked={arrivalWindow === '9-1'}
                    onChange={(e) => setArrivalWindow(e.target.value as any)}
                    className="h-4 w-4 text-entrusted-orange focus:ring-entrusted-orange"
                  />
                  <span className="text-sm">9 AM - 1 PM</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="12-4"
                    checked={arrivalWindow === '12-4'}
                    onChange={(e) => setArrivalWindow(e.target.value as any)}
                    className="h-4 w-4 text-entrusted-orange focus:ring-entrusted-orange"
                  />
                  <span className="text-sm">12 PM - 4 PM</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="custom"
                    checked={arrivalWindow === 'custom'}
                    onChange={(e) => setArrivalWindow(e.target.value as any)}
                    className="h-4 w-4 text-entrusted-orange focus:ring-entrusted-orange"
                  />
                  <span className="text-sm">Custom</span>
                </label>
              </div>

              {arrivalWindow === 'custom' && (
                <input
                  type="text"
                  value={customArrivalWindow}
                  onChange={(e) => setCustomArrivalWindow(e.target.value)}
                  placeholder="e.g., 2-5 PM, After 3 PM"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Notes/Requests:
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                placeholder="Any special instructions, gate codes, pet info, access notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Equipment & Supplies Loaded */}
      <div className="border-2 border-gray-200 rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-entrusted-orange" />
          Equipment & Supplies Loaded
        </h4>

        <div className="space-y-4">
          {/* Equipment Counts */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Equipment loaded on truck:</p>
            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                label="Dehumidifiers"
                min="0"
                value={dehumidifiersLoaded}
                onChange={(e) => setDehumidifiersLoaded(parseInt(e.target.value) || 0)}
              />
              <Input
                type="number"
                label="Air Movers"
                min="0"
                value={airMoversLoaded}
                onChange={(e) => setAirMoversLoaded(parseInt(e.target.value) || 0)}
              />
              <Input
                type="number"
                label="Air Scrubbers"
                min="0"
                value={airScrubbersLoaded}
                onChange={(e) => setAirScrubbersLoaded(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Supplies Checklist */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Supplies packed:</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'moistureMeter', label: 'Moisture meter' },
                { key: 'thermalCamera', label: 'Thermal imaging camera' },
                { key: 'plasticSheeting', label: 'Plastic sheeting' },
                { key: 'containmentMaterials', label: 'Containment materials' },
                { key: 'ppe', label: 'PPE (gloves, masks, etc.)' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={suppliesChecklist[item.key as keyof typeof suppliesChecklist] as boolean}
                    onChange={(e) => setSuppliesChecklist({ ...suppliesChecklist, [item.key]: e.target.checked })}
                    className="h-4 w-4 text-entrusted-orange rounded focus:ring-entrusted-orange"
                  />
                  <span className="text-sm text-gray-900">{item.label}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              value={suppliesChecklist.other}
              onChange={(e) => setSuppliesChecklist({ ...suppliesChecklist, other: e.target.value })}
              placeholder="Other supplies..."
              className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange text-sm"
            />
          </div>
        </div>

        {equipmentReady && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Total equipment loaded:</strong> {dehumidifiersLoaded + airMoversLoaded + airScrubbersLoaded} units
            </p>
          </div>
        )}
      </div>

      {/* Additional Preparation Notes */}
      <div className="border-2 border-gray-200 rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-entrusted-orange" />
          Additional Preparation Notes
        </h4>
        <textarea
          value={preparationNotes}
          onChange={(e) => setPreparationNotes(e.target.value)}
          rows={4}
          placeholder="Any special considerations, concerns, or items to note before arrival..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange text-sm"
        />
      </div>

      {/* Completion Summary */}
      {(workOrderComplete || customerCalled || equipmentReady) && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Office Preparation Summary
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            {workOrderComplete && <li>✓ Work order reviewed and verified</li>}
            {customerCalled && <li>✓ Customer called - arrival window confirmed: {arrivalWindow === 'custom' ? customArrivalWindow : arrivalWindow}</li>}
            {equipmentReady && <li>✓ Equipment loaded: {dehumidifiersLoaded + airMoversLoaded + airScrubbersLoaded} units</li>}
          </ul>
          <p className="text-xs text-green-700 mt-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Ready to depart for job site
          </p>
        </div>
      )}
    </div>
  );
};
