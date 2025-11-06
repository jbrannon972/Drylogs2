import React, { useState } from 'react';
import { Trash2, Camera, Info } from 'lucide-react';
import { Input } from '../../../shared/Input';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';

interface DebrisDisposalStepProps {
  job: any;
  onNext: () => void;
}

export const DebrisDisposalStep: React.FC<DebrisDisposalStepProps> = ({ job, onNext }) => {
  const { updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();
  const [truckLoads, setTruckLoads] = useState(0);
  const [dumpsterBags, setDumpsterBags] = useState(0);
  const [largeDumpster, setLargeDumpster] = useState(false);
  const [debrisPhoto, setDebrisPhoto] = useState<string | null>(null);

  React.useEffect(() => {
    updateWorkflowData('demo', {
      debris: {
        truckLoads,
        dumpsterBags,
        largeDumpster,
        photo: debrisPhoto,
      },
    });
  }, [truckLoads, dumpsterBags, largeDumpster, debrisPhoto]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadPhoto(file, job.jobId, 'debris', 'demo', user.uid);
      if (url) setDebrisPhoto(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Debris Removal Documentation</h4>
            <p className="text-sm text-blue-800">
              Track disposal method and quantities. Photo required for billing verification.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Truck Loads (Van/Pickup)
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTruckLoads(Math.max(0, truckLoads - 1))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              −
            </button>
            <span className="text-2xl font-bold text-gray-900">{truckLoads}</span>
            <button
              onClick={() => setTruckLoads(truckLoads + 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dumpster Bags
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDumpsterBags(Math.max(0, dumpsterBags - 1))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              −
            </button>
            <span className="text-2xl font-bold text-gray-900">{dumpsterBags}</span>
            <button
              onClick={() => setDumpsterBags(dumpsterBags + 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={largeDumpster}
              onChange={(e) => setLargeDumpster(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Large Dumpster (Rolloff)</span>
          </label>
        </div>
      </div>

      {/* Debris Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Debris Photo (Loaded Truck/Dumpster) *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {debrisPhoto ? (
            <div>
              <img src={debrisPhoto} alt="Debris" className="max-h-64 mx-auto mb-2 rounded" />
              <p className="text-sm text-green-600 font-medium">✓ Photo uploaded</p>
            </div>
          ) : (
            <div>
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <label className="btn-primary cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? 'Uploading...' : 'Photo Debris Removal'}
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
