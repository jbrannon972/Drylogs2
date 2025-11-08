import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, Clock, Camera, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { useWorkflowStore } from '../../../../stores/workflowStore';
import { usePhotos } from '../../../../hooks/usePhotos';
import { useAuth } from '../../../../hooks/useAuth';

interface FrontDoorStepProps {
  job: any;
  onNext: () => void;
}

export const FrontDoorStep: React.FC<FrontDoorStepProps> = ({ job, onNext }) => {
  const { installData, updateWorkflowData } = useWorkflowStore();
  const { user } = useAuth();
  const { uploadPhoto, isUploading } = usePhotos();

  // Removed duplicate arrival tracking - it's now in Step 1 (ArrivalStep)
  const [frontEntrancePhoto, setFrontEntrancePhoto] = useState<string | null>(
    installData.frontEntrancePhoto || null
  );
  const [isAfterHours, setIsAfterHours] = useState(false);

  // EPA Compliance - Asbestos/Lead
  const [buildingYear, setBuildingYear] = useState<string>(installData.buildingYear || '');
  const [asbestosConcern, setAsbestosConcern] = useState<boolean>(installData.asbestosConcern || false);
  const [leadConcern, setLeadConcern] = useState<boolean>(installData.leadConcern || false);

  // Vulnerable Occupants
  const [vulnerableOccupants, setVulnerableOccupants] = useState({
    elderly: installData.vulnerableOccupants?.elderly || false,
    children: installData.vulnerableOccupants?.children || false,
    pets: installData.vulnerableOccupants?.pets || false,
    respiratory: installData.vulnerableOccupants?.respiratory || false,
    mobility: installData.vulnerableOccupants?.mobility || false,
    other: installData.vulnerableOccupants?.other || false,
    notes: installData.vulnerableOccupants?.notes || '',
  });

  const [checklist, setChecklist] = useState({
    introduced: false,
    groundRules: false,
    walkthrough: false,
    questions: false,
    utilities: false,
  });

  // Check if current time is after hours
  useEffect(() => {
    const checkAfterHours = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday

      // After 5pm weekdays or any time on weekends
      const afterHours = hour >= 17 || day === 0 || day === 6;
      setIsAfterHours(afterHours);
    };

    checkAfterHours();
  }, []);

  // Auto-detect hazard flags based on building year
  useEffect(() => {
    const year = parseInt(buildingYear);
    if (!isNaN(year)) {
      // Lead paint concern for pre-1978 buildings (EPA lead-based paint regulations)
      if (year < 1978 && !leadConcern) {
        setLeadConcern(true);
      }
      // Asbestos concern for pre-1980 buildings (EPA asbestos regulations)
      if (year < 1980 && !asbestosConcern) {
        setAsbestosConcern(true);
      }
    }
  }, [buildingYear, leadConcern, asbestosConcern]);

  // Save to workflow store
  useEffect(() => {
    updateWorkflowData('install', {
      frontEntrancePhoto,
      isAfterHours,
      buildingYear,
      asbestosConcern,
      leadConcern,
      vulnerableOccupants,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontEntrancePhoto, isAfterHours, buildingYear, asbestosConcern, leadConcern, vulnerableOccupants]);

  const handleFrontEntrancePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const url = await uploadPhoto(file, job.jobId, 'front-entrance', 'arrival', user.uid);
      if (url) setFrontEntrancePhoto(url);
    }
  };

  const handleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allComplete = frontEntrancePhoto && buildingYear && Object.values(checklist).every(v => v);

  return (
    <div className="space-y-6">
      {/* After Hours Warning */}
      {isAfterHours && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">After-Hours Service</h4>
              <p className="text-sm text-orange-800">
                This job is being performed after 5pm or on a weekend. Premium labor rates will apply.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Front Entrance Photo */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Front Entrance Photo *</h3>
        <p className="text-sm text-gray-600 mb-3">
          Take a photo of the property entrance for documentation.
        </p>

        {frontEntrancePhoto ? (
          <div>
            <img src={frontEntrancePhoto} alt="Front Entrance" className="max-h-48 rounded mb-2" />
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">✓ Front entrance documented</span>
            </div>
            <label className="btn-secondary cursor-pointer inline-block text-sm">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFrontEntrancePhoto}
                className="hidden"
                disabled={isUploading}
              />
              Replace Photo
            </label>
          </div>
        ) : (
          <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFrontEntrancePhoto}
              className="hidden"
              disabled={isUploading}
            />
            <Camera className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Take Photo of Front Entrance'}
          </label>
        )}
      </div>

      {/* Customer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Customer: {job.customerInfo.name}</h3>
        <p className="text-sm text-gray-700">Phone: {job.customerInfo.phoneNumber}</p>
      </div>

      {/* EPA Compliance - Property Hazards */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-900">Property Age & EPA Hazards *</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Required for EPA compliance. Pre-1978 buildings may contain lead paint. Pre-1980 buildings may contain asbestos.
        </p>

        {/* Building Year */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Building Year Built *
          </label>
          <input
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            value={buildingYear}
            onChange={(e) => setBuildingYear(e.target.value)}
            placeholder="e.g., 1975"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Hazard Warnings */}
        {buildingYear && parseInt(buildingYear) < 1980 && (
          <div className="space-y-3 mb-4">
            {parseInt(buildingYear) < 1978 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900 mb-1">⚠️ Lead Paint Warning (Pre-1978)</p>
                    <p className="text-red-800 text-xs">
                      EPA requires lead-safe work practices. Notify customer of potential lead-based paint.
                      Violation penalties up to $16,000/day. Do NOT sand, scrape, or create dust without proper containment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {parseInt(buildingYear) < 1980 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-900 mb-1">⚠️ Asbestos Warning (Pre-1980)</p>
                    <p className="text-orange-800 text-xs">
                      Common in: pipe insulation, floor tiles, ceiling tiles, roofing materials.
                      If suspected during demo, STOP WORK and notify MIT Lead. Licensed abatement may be required.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-start gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={asbestosConcern}
              onChange={(e) => setAsbestosConcern(e.target.checked)}
              className="mt-1"
            />
            <div className="text-sm">
              <p className="font-medium text-gray-900">Asbestos concern identified or suspected</p>
              <p className="text-xs text-gray-600">Check if building pre-1980 or materials suspected</p>
            </div>
          </label>

          <label className="flex items-start gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={leadConcern}
              onChange={(e) => setLeadConcern(e.target.checked)}
              className="mt-1"
            />
            <div className="text-sm">
              <p className="font-medium text-gray-900">Lead paint concern identified or suspected</p>
              <p className="text-xs text-gray-600">Check if building pre-1978 or paint suspected</p>
            </div>
          </label>
        </div>

        {(asbestosConcern || leadConcern) && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
            <p className="text-xs text-yellow-800">
              <strong>Action Required:</strong> Document concerns in notes. Notify MIT Lead before demo work.
              Customer must be informed in writing of potential hazards.
            </p>
          </div>
        )}
      </div>

      {/* Vulnerable Occupants Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Vulnerable Occupants</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Identify any vulnerable occupants for special safety considerations during restoration work.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={vulnerableOccupants.elderly}
              onChange={(e) => setVulnerableOccupants({ ...vulnerableOccupants, elderly: e.target.checked })}
            />
            <span className="text-sm">Elderly residents (65+)</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={vulnerableOccupants.children}
              onChange={(e) => setVulnerableOccupants({ ...vulnerableOccupants, children: e.target.checked })}
            />
            <span className="text-sm">Young children</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={vulnerableOccupants.pets}
              onChange={(e) => setVulnerableOccupants({ ...vulnerableOccupants, pets: e.target.checked })}
            />
            <span className="text-sm">Pets</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={vulnerableOccupants.respiratory}
              onChange={(e) => setVulnerableOccupants({ ...vulnerableOccupants, respiratory: e.target.checked })}
            />
            <span className="text-sm">Respiratory conditions</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={vulnerableOccupants.mobility}
              onChange={(e) => setVulnerableOccupants({ ...vulnerableOccupants, mobility: e.target.checked })}
            />
            <span className="text-sm">Mobility issues</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={vulnerableOccupants.other}
              onChange={(e) => setVulnerableOccupants({ ...vulnerableOccupants, other: e.target.checked })}
            />
            <span className="text-sm">Other concerns</span>
          </label>
        </div>

        {Object.values(vulnerableOccupants).slice(0, -1).some(v => v) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Notes
            </label>
            <textarea
              value={vulnerableOccupants.notes}
              onChange={(e) => setVulnerableOccupants({ ...vulnerableOccupants, notes: e.target.value })}
              placeholder="Additional details about accommodations needed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>
        )}

        {Object.values(vulnerableOccupants).slice(0, -1).some(v => v) && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2">
            <p className="text-xs text-blue-800">
              <strong>Customer Care:</strong> Extra attention to noise levels, access paths, and safety barriers.
              Communicate schedule changes promptly.
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Ground Rules Presentation</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.introduced}
              onChange={() => handleCheck('introduced')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">1. Introduce yourself and team</p>
              <p className="text-sm text-gray-600">Present Entrusted identification</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.groundRules}
              onChange={() => handleCheck('groundRules')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">2. Explain today's process</p>
              <p className="text-sm text-gray-600">Purpose, timeline, noise levels, access needs</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.walkthrough}
              onChange={() => handleCheck('walkthrough')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">3. Property walkthrough</p>
              <p className="text-sm text-gray-600">Tour affected areas, listen to customer's story</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.questions}
              onChange={() => handleCheck('questions')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">4. Address customer concerns</p>
              <p className="text-sm text-gray-600">Answer questions, establish communication preferences</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checklist.utilities}
              onChange={() => handleCheck('utilities')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">5. Confirm utility locations</p>
              <p className="text-sm text-gray-600">Electrical, gas, water shut-offs</p>
            </div>
          </label>
        </div>
      </div>

      {allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">All ground rules completed ✓</p>
        </div>
      )}
    </div>
  );
};
