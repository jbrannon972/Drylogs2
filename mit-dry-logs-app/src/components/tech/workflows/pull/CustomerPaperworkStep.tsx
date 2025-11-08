import React, { useState } from 'react';
import { FileText, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface CustomerPaperworkStepProps {
  job: any;
  onNext: () => void;
}

export const CustomerPaperworkStep: React.FC<CustomerPaperworkStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();

  // Certificate of Satisfaction (CoS)
  const [cosSignature, setCosSignature] = useState('');
  const [cosSignedBy, setCosSignedBy] = useState('');
  const [cosSignedDate, setCosSignedDate] = useState(new Date().toISOString().split('T')[0]);

  // Drying Record Worksheet (DRW)
  const [needsDRW, setNeedsDRW] = useState(false);
  const [drwSignature, setDrwSignature] = useState('');
  const [drwSignedBy, setDrwSignedBy] = useState('');
  const [drwSignedDate, setDrwSignedDate] = useState(new Date().toISOString().split('T')[0]);

  // Customer Copy
  const [customerReceivedCopy, setCustomerReceivedCopy] = useState(false);

  React.useEffect(() => {
    updateWorkflowData('pull', {
      paperwork: {
        certificateOfSatisfaction: {
          signature: cosSignature,
          signedBy: cosSignedBy,
          signedDate: cosSignedDate,
          timestamp: new Date().toISOString(),
        },
        dryingRecordWorksheet: needsDRW ? {
          signature: drwSignature,
          signedBy: drwSignedBy,
          signedDate: drwSignedDate,
          timestamp: new Date().toISOString(),
        } : null,
        customerReceivedCopy,
      },
    });
  }, [cosSignature, cosSignedBy, cosSignedDate, needsDRW, drwSignature, drwSignedBy, drwSignedDate, customerReceivedCopy]);

  const isComplete = cosSignature && cosSignedBy && (!needsDRW || (drwSignature && drwSignedBy)) && customerReceivedCopy;

  const waterCategory = job.insuranceInfo?.categoryOfWater || 'Category 1';
  const recommendDRW = waterCategory !== 'Category 1';

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Customer Signatures Required</h4>
            <p className="text-sm text-blue-800">
              Obtain customer signatures on required paperwork before leaving the job site. This protects both the customer and Entrusted.
            </p>
          </div>
        </div>
      </div>

      {/* Certificate of Satisfaction */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Certificate of Satisfaction (CoS) *</h3>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Purpose:</span> Customer acknowledges that:
          </p>
          <ul className="text-sm text-gray-700 space-y-1 ml-4">
            <li>• All equipment has been removed</li>
            <li>• The drying process is complete</li>
            <li>• Work area has been cleaned</li>
            <li>• They are satisfied with the mitigation services</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Signature *
            </label>
            <Input
              type="text"
              value={cosSignature}
              onChange={(e) => setCosSignature(e.target.value)}
              placeholder="Customer to sign here"
            />
            <p className="text-xs text-gray-500 mt-1">
              In production, this would use a signature pad
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signed By (Print Name) *
            </label>
            <Input
              type="text"
              value={cosSignedBy}
              onChange={(e) => setCosSignedBy(e.target.value)}
              placeholder="Customer printed name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <Input
              type="date"
              value={cosSignedDate}
              onChange={(e) => setCosSignedDate(e.target.value)}
            />
          </div>
        </div>

        {cosSignature && cosSignedBy && (
          <div className="mt-3 flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">CoS completed</span>
          </div>
        )}
      </div>

      {/* Drying Record Worksheet */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Drying Record Worksheet (DRW)</h3>
        </div>

        {recommendDRW && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">
                <span className="font-medium">Recommended for {waterCategory}:</span> DRW documents the complete drying timeline and provides additional protection for insurance claims.
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={needsDRW}
              onChange={(e) => setNeedsDRW(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-gray-900">
              Customer is signing Drying Record Worksheet
            </span>
          </label>
        </div>

        {needsDRW && (
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">DRW includes:</span>
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Complete moisture reading history</li>
                <li>• Equipment placement and removal dates</li>
                <li>• Daily monitoring visit records</li>
                <li>• Final verification that all materials are dry</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Signature *
              </label>
              <Input
                type="text"
                value={drwSignature}
                onChange={(e) => setDrwSignature(e.target.value)}
                placeholder="Customer to sign here"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signed By (Print Name) *
              </label>
              <Input
                type="text"
                value={drwSignedBy}
                onChange={(e) => setDrwSignedBy(e.target.value)}
                placeholder="Customer printed name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <Input
                type="date"
                value={drwSignedDate}
                onChange={(e) => setDrwSignedDate(e.target.value)}
              />
            </div>

            {drwSignature && drwSignedBy && (
              <div className="mt-3 flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">DRW completed</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Copy */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Customer Copy</h3>

        <div className="mb-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={customerReceivedCopy}
              onChange={(e) => setCustomerReceivedCopy(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-gray-900">
              Customer received copy of all signed documents *
            </span>
          </label>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <p className="text-sm text-gray-700">
            Ensure customer has copies of CoS{needsDRW && ', DRW'}, and any other relevant documentation before leaving the job site.
          </p>
        </div>
      </div>

      {/* Completion Status */}
      {isComplete ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">✓ All Paperwork Complete</h4>
              <p className="text-sm text-green-800">
                All required signatures obtained and customer has received copies.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Complete all required fields before proceeding. Missing paperwork can delay payment.
          </p>
        </div>
      )}
    </div>
  );
};
