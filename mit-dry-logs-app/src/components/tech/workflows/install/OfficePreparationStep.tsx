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
      {/* Job Information Summary - Non-Interactive Display */}
      <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Job Information
        </h3>

        <div className="grid grid-cols-1 gap-3 text-sm">
          {/* Customer Info */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Customer</p>
            <p className="font-medium text-gray-900">
              {job.customerName || job.firstName && job.lastName ? `${job.firstName} ${job.lastName}` : 'Not provided'}
            </p>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Property Address</p>
            <p className="text-gray-900">
              {job.address || job.street ? (
                <>
                  {job.street && <>{job.street}<br /></>}
                  {job.city && job.state && job.zip ? `${job.city}, ${job.state} ${job.zip}` : 'Address incomplete'}
                </>
              ) : 'Not provided'}
            </p>
          </div>

          {/* Contact Info */}
          {(job.phone || job.email || job.customerInfo?.phoneNumber || job.customerInfo?.email) && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Contact</p>
              <div className="space-y-1">
                {(job.phone || job.customerInfo?.phoneNumber) && (
                  <p className="text-gray-900">📞 {job.phone || job.customerInfo?.phoneNumber}</p>
                )}
                {(job.email || job.customerInfo?.email) && (
                  <p className="text-gray-900">✉️ {job.email || job.customerInfo?.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Job Details */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Job Details</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Job ID:</span>
                <span className="font-medium text-gray-900">{job.jobId || 'Not set'}</span>
              </div>
              {(job.claimNumber || job.insuranceInfo?.claimNumber) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Claim #:</span>
                  <span className="font-medium text-gray-900">{job.claimNumber || job.insuranceInfo?.claimNumber}</span>
                </div>
              )}
              {(job.insuranceCompany || job.insuranceInfo?.carrierName) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance:</span>
                  <span className="font-medium text-gray-900">{job.insuranceCompany || job.insuranceInfo?.carrierName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Job Type:</span>
                <span className="font-medium text-gray-900">{job.jobType || 'Water Damage'}</span>
              </div>
              {job.dateOfLoss && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Loss:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(job.dateOfLoss).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
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
