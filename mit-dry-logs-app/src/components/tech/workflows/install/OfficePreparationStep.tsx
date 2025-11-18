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
  Clock,
  FileText
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
    <div className="space-y-4">
      {/* Job Information Summary - Excel-style Table */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Job Information
          </h3>
        </div>

        {/* Excel-style table */}
        <div className="divide-y divide-gray-200">
          {/* Customer Name */}
          <div className="grid grid-cols-3 hover:bg-gray-50">
            <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-200">
              Customer
            </div>
            <div className="px-4 py-3 col-span-2 text-gray-900 text-sm">
              {job.customerName || (job.firstName && job.lastName ? `${job.firstName} ${job.lastName}` : 'Not provided')}
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-3 hover:bg-gray-50">
            <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-200">
              Address
            </div>
            <div className="px-4 py-3 col-span-2 text-gray-900 text-sm">
              {job.address || job.street ? (
                <>
                  {job.street && <>{job.street}</>}
                  {job.city && job.state && job.zip && <>, {job.city}, {job.state} {job.zip}</>}
                </>
              ) : 'Not provided'}
            </div>
          </div>

          {/* Phone */}
          {(job.phone || job.customerInfo?.phoneNumber) && (
            <div className="grid grid-cols-3 hover:bg-gray-50">
              <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-200">
                Phone
              </div>
              <div className="px-4 py-3 col-span-2 text-gray-900 text-sm">
                {job.phone || job.customerInfo?.phoneNumber}
              </div>
            </div>
          )}

          {/* Email */}
          {(job.email || job.customerInfo?.email) && (
            <div className="grid grid-cols-3 hover:bg-gray-50">
              <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-200">
                Email
              </div>
              <div className="px-4 py-3 col-span-2 text-gray-900 text-sm">
                {job.email || job.customerInfo?.email}
              </div>
            </div>
          )}

          {/* Job ID */}
          <div className="grid grid-cols-3 hover:bg-gray-50">
            <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-200">
              Job ID
            </div>
            <div className="px-4 py-3 col-span-2 text-gray-900 text-sm font-mono">
              {job.jobId || 'Not set'}
            </div>
          </div>

          {/* Claim Number */}
          {(job.claimNumber || job.insuranceInfo?.claimNumber) && (
            <div className="grid grid-cols-3 hover:bg-gray-50">
              <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-200">
                Claim #
              </div>
              <div className="px-4 py-3 col-span-2 text-gray-900 text-sm">
                {job.claimNumber || job.insuranceInfo?.claimNumber}
              </div>
            </div>
          )}

          {/* Insurance Company */}
          {(job.insuranceCompany || job.insuranceInfo?.carrierName) && (
            <div className="grid grid-cols-3 hover:bg-gray-50">
              <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-200">
                Insurance
              </div>
              <div className="px-4 py-3 col-span-2 text-gray-900 text-sm">
                {job.insuranceCompany || job.insuranceInfo?.carrierName}
              </div>
            </div>
          )}

          {/* Job Type */}
          <div className="grid grid-cols-3 hover:bg-gray-50">
            <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-200">
              Job Type
            </div>
            <div className="px-4 py-3 col-span-2 text-gray-900 text-sm">
              {job.jobType || 'Water Damage'}
            </div>
          </div>

          {/* Date of Loss */}
          {job.dateOfLoss && (
            <div className="grid grid-cols-3 hover:bg-gray-50">
              <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-200">
                Date of Loss
              </div>
              <div className="px-4 py-3 col-span-2 text-gray-900 text-sm">
                {new Date(job.dateOfLoss).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              Review the job information above, then proceed to the next step to begin the workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
