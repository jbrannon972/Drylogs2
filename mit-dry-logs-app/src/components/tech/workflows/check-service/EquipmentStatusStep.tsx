import React, { useState } from 'react';
import { Wind, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';

interface EquipmentStatusStepProps {
  job: any;
  onNext: () => void;
}

interface EquipmentCheck {
  equipmentId: string;
  type: string;
  serialNumber: string;
  location: string;
  status: 'operational' | 'issue' | 'offline';
  issueDescription?: string;
  hoursRun?: number;
}

export const EquipmentStatusStep: React.FC<EquipmentStatusStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const [equipmentChecks, setEquipmentChecks] = useState<EquipmentCheck[]>([]);

  // Get equipment from job data (this would come from install workflow)
  const installedEquipment = job.equipment || [];

  React.useEffect(() => {
    updateWorkflowData('checkService', {
      equipmentStatus: equipmentChecks,
      equipmentCheckTimestamp: new Date().toISOString(),
    });
  }, [equipmentChecks]);

  const checkEquipment = (equipmentId: string, status: 'operational' | 'issue' | 'offline') => {
    setEquipmentChecks(prev => {
      const existing = prev.find(e => e.equipmentId === equipmentId);
      const equipment = installedEquipment.find((e: any) => e.equipmentId === equipmentId);

      if (existing) {
        return prev.map(e => e.equipmentId === equipmentId ? { ...e, status } : e);
      }

      return [...prev, {
        equipmentId,
        type: equipment?.type || 'Unknown',
        serialNumber: equipment?.serialNumber || '',
        location: equipment?.location || '',
        status,
        hoursRun: 0,
      }];
    });
  };

  const updateIssueDescription = (equipmentId: string, description: string) => {
    setEquipmentChecks(prev =>
      prev.map(e => e.equipmentId === equipmentId ? { ...e, issueDescription: description } : e)
    );
  };

  const updateHoursRun = (equipmentId: string, hours: number) => {
    setEquipmentChecks(prev =>
      prev.map(e => e.equipmentId === equipmentId ? { ...e, hoursRun: hours } : e)
    );
  };

  const getEquipmentStatus = (equipmentId: string) => {
    return equipmentChecks.find(e => e.equipmentId === equipmentId);
  };

  const getStatusIcon = (status?: 'operational' | 'issue' | 'offline') => {
    if (!status) return null;
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'issue':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status?: 'operational' | 'issue' | 'offline') => {
    if (!status) return 'border-gray-300 bg-white';
    switch (status) {
      case 'operational':
        return 'border-green-500 bg-green-50';
      case 'issue':
        return 'border-orange-500 bg-orange-50';
      case 'offline':
        return 'border-red-500 bg-red-50';
    }
  };

  const allChecked = installedEquipment.length > 0 && equipmentChecks.length === installedEquipment.length;
  const issueCount = equipmentChecks.filter(e => e.status === 'issue' || e.status === 'offline').length;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Equipment Status Check</h4>
            <p className="text-sm text-blue-800">
              Verify all equipment is running properly. Document any issues for immediate resolution or replacement.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      {equipmentChecks.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {equipmentChecks.length}/{installedEquipment.length}
              </p>
              <p className="text-xs text-gray-600">Checked</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {equipmentChecks.filter(e => e.status === 'operational').length}
              </p>
              <p className="text-xs text-gray-600">Operational</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {issueCount}
              </p>
              <p className="text-xs text-gray-600">Issues</p>
            </div>
          </div>
        </div>
      )}

      {/* Equipment List */}
      {installedEquipment.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No equipment found on this job. Equipment should be added during Install workflow.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {installedEquipment.map((equipment: any) => {
            const check = getEquipmentStatus(equipment.equipmentId);
            return (
              <div
                key={equipment.equipmentId}
                className={`border-2 rounded-lg p-4 transition-all ${getStatusColor(check?.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Wind className="w-6 h-6 text-gray-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{equipment.type}</h4>
                      <p className="text-sm text-gray-600">{equipment.location}</p>
                      <p className="text-xs text-gray-500">SN: {equipment.serialNumber}</p>
                    </div>
                  </div>
                  {getStatusIcon(check?.status)}
                </div>

                {!check && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Equipment Status:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => checkEquipment(equipment.equipmentId, 'operational')}
                        className="p-3 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-all"
                      >
                        <CheckCircle className="w-5 h-5 mx-auto text-green-600 mb-1" />
                        <p className="text-xs font-medium">Running</p>
                      </button>
                      <button
                        onClick={() => checkEquipment(equipment.equipmentId, 'issue')}
                        className="p-3 border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-all"
                      >
                        <AlertTriangle className="w-5 h-5 mx-auto text-orange-600 mb-1" />
                        <p className="text-xs font-medium">Issue</p>
                      </button>
                      <button
                        onClick={() => checkEquipment(equipment.equipmentId, 'offline')}
                        className="p-3 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <XCircle className="w-5 h-5 mx-auto text-red-600 mb-1" />
                        <p className="text-xs font-medium">Offline</p>
                      </button>
                    </div>
                  </div>
                )}

                {check && (check.status === 'issue' || check.status === 'offline') && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe the issue *
                    </label>
                    <Input
                      type="text"
                      value={check.issueDescription || ''}
                      onChange={(e) => updateIssueDescription(equipment.equipmentId, e.target.value)}
                      placeholder="e.g., Filter needs cleaning, making unusual noise"
                    />
                  </div>
                )}

                {check && check.status === 'operational' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours Run (optional)
                    </label>
                    <Input
                      type="number"
                      value={check.hoursRun || ''}
                      onChange={(e) => updateHoursRun(equipment.equipmentId, parseInt(e.target.value) || 0)}
                      placeholder="24"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Track runtime for maintenance scheduling
                    </p>
                  </div>
                )}

                {check && (
                  <button
                    onClick={() => setEquipmentChecks(prev => prev.filter(e => e.equipmentId !== equipment.equipmentId))}
                    className="mt-3 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Change status
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Issues Alert */}
      {issueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">Equipment Issues Detected</h4>
              <p className="text-sm text-red-800">
                {issueCount} {issueCount === 1 ? 'unit needs' : 'units need'} attention.
                Consider adding replacement equipment in the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {allChecked && issueCount === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">
            ✓ All equipment operational - ready to proceed
          </p>
        </div>
      )}
    </div>
  );
};
