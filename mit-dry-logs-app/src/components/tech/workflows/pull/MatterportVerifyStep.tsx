import React, { useState } from 'react';
import { Video, CheckCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface MatterportVerifyStepProps {
  job: any;
  onNext: () => void;
}

export const MatterportVerifyStep: React.FC<MatterportVerifyStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();

  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanUrl, setScanUrl] = useState('');
  const [scannedBy, setScannedBy] = useState('');
  const [scanDate, setScanDate] = useState(new Date().toISOString().split('T')[0]);
  const [skipReason, setSkipReason] = useState('');
  const [scanSkipped, setScanSkipped] = useState(false);

  React.useEffect(() => {
    updateWorkflowData('pull', {
      matterport: scanSkipped ? {
        completed: false,
        skipped: true,
        skipReason,
      } : {
        completed: scanCompleted,
        url: scanUrl,
        scannedBy,
        scanDate,
        timestamp: new Date().toISOString(),
      },
    });
  }, [scanCompleted, scanUrl, scannedBy, scanDate, scanSkipped, skipReason]);

  const requiresScan = job.propertyType === 'commercial' || job.insuranceInfo?.claimAmount > 10000;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Matterport 3D Scan Verification</h4>
            <p className="text-sm text-blue-800">
              Verify that a Matterport 3D scan was completed for this job. This provides comprehensive documentation and protects against future disputes.
            </p>
          </div>
        </div>
      </div>

      {/* Scan Requirement Notice */}
      {requiresScan && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">Matterport Scan Recommended</h4>
              <p className="text-sm text-orange-800">
                This job {job.propertyType === 'commercial' ? 'is a commercial property' : 'has a high claim value'}. Matterport documentation is strongly recommended for comprehensive records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* About Matterport */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">About Matterport Scans</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Creates a complete 3D walkthrough of the property</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Documents exact conditions and scope of work</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Provides measurements and spatial data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Protects against scope creep and disputes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-entrusted-orange">•</span>
            <span>Can be shared with insurance adjusters and contractors</span>
          </li>
        </ul>
      </div>

      {/* Scan Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Matterport Scan Status *
        </label>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
            <input
              type="radio"
              checked={scanCompleted && !scanSkipped}
              onChange={() => {
                setScanCompleted(true);
                setScanSkipped(false);
              }}
              className="w-5 h-5 mt-0.5"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Scan Completed</p>
              <p className="text-sm text-gray-600">
                Matterport scan was completed and uploaded
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
            <input
              type="radio"
              checked={scanSkipped}
              onChange={() => {
                setScanSkipped(true);
                setScanCompleted(false);
              }}
              className="w-5 h-5 mt-0.5"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Scan Not Done</p>
              <p className="text-sm text-gray-600">
                Matterport scan was not completed for this job
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Scan Completed Form */}
      {scanCompleted && !scanSkipped && (
        <div className="border border-blue-500 rounded-lg p-4 bg-blue-50">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            Scan Details
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matterport URL *
              </label>
              <Input
                type="url"
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                placeholder="https://my.matterport.com/show/?m=..."
              />
              {scanUrl && (
                <a
                  href={scanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1"
                >
                  View scan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scanned By *
              </label>
              <Input
                type="text"
                value={scannedBy}
                onChange={(e) => setScannedBy(e.target.value)}
                placeholder="Name of person who completed scan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scan Date *
              </label>
              <Input
                type="date"
                value={scanDate}
                onChange={(e) => setScanDate(e.target.value)}
              />
            </div>
          </div>

          {scanUrl && scannedBy && (
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Matterport scan verified</span>
            </div>
          )}
        </div>
      )}

      {/* Scan Skipped Form */}
      {scanSkipped && (
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Reason for No Scan</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explain why scan was not completed *
            </label>
            <textarea
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Customer declined, small scope job, equipment not available..."
            />
          </div>

          {requiresScan && skipReason && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Note:</span> This job was flagged for Matterport documentation. Ensure customer understands the benefits of 3D scanning for insurance claims.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Completion Status */}
      {scanCompleted && scanUrl && scannedBy ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">✓ Matterport Scan Verified</h4>
              <p className="text-sm text-green-800">
                3D scan completed by {scannedBy} on {new Date(scanDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : scanSkipped && skipReason ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Scan Not Done</h4>
              <p className="text-sm text-gray-600">
                Reason documented - ready to proceed
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            Select scan status and complete required information.
          </p>
        </div>
      )}

      {/* Benefits Reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <span className="font-medium">Pro Tip:</span> Matterport scans increase average claim settlement by 15-20% and reduce scope disputes. Consider offering this service to all customers.
        </p>
      </div>
    </div>
  );
};
