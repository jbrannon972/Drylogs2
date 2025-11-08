import React, { useState } from 'react';
import { Job } from '../../../types';
import {
  FileText,
  Image,
  Home,
  Package,
  Hammer,
  Clock,
  DollarSign,
  FileCheck,
  CheckCircle,
} from 'lucide-react';

interface PresentationPanelProps {
  job: Job;
}

type TabType =
  | 'overview'
  | 'before-after'
  | 'rooms'
  | 'equipment'
  | 'demo'
  | 'timeline'
  | 'financials'
  | 'documents';

export const PresentationPanel: React.FC<PresentationPanelProps> = ({ job }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
    { id: 'before-after', label: 'Before/After', icon: <Image className="w-4 h-4" /> },
    { id: 'rooms', label: 'Rooms', icon: <Home className="w-4 h-4" /> },
    { id: 'equipment', label: 'Equipment', icon: <Package className="w-4 h-4" /> },
    { id: 'demo', label: 'Demo', icon: <Hammer className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'financials', label: 'Financials', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileCheck className="w-4 h-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab job={job} />;
      case 'before-after':
        return <BeforeAfterTab job={job} />;
      case 'rooms':
        return <RoomsTab job={job} />;
      case 'equipment':
        return <EquipmentTab job={job} />;
      case 'demo':
        return <DemoTab job={job} />;
      case 'timeline':
        return <TimelineTab job={job} />;
      case 'financials':
        return <FinancialsTab job={job} />;
      case 'documents':
        return <DocumentsTab job={job} />;
      default:
        return <OverviewTab job={job} />;
    }
  };

  return (
    <div className="bg-white rounded-lg border">
      {/* Tabs */}
      <div className="border-b overflow-x-auto">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-entrusted-orange text-entrusted-orange'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">{renderTabContent()}</div>
    </div>
  );
};

// Overview Tab
const OverviewTab: React.FC<{ job: Job }> = ({ job }) => {
  const totalAffectedSqFt = job.rooms.reduce((sum, room) => {
    return sum + (room.affectedAreas?.totalAffectedArea || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-poppins font-bold text-gray-900 mb-2">
          {job.customerInfo.name} - Water Damage Restoration
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Address</p>
            <p className="font-medium text-gray-900">{job.customerInfo.address}</p>
            <p className="text-gray-700">
              {job.customerInfo.city}, {job.customerInfo.state} {job.customerInfo.zipCode}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Contact</p>
            <p className="font-medium text-gray-900">{job.customerInfo.phoneNumber}</p>
            <p className="text-gray-700">{job.customerInfo.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Loss Date</p>
          <p className="font-medium text-gray-900">
            {new Date(job.causeOfLoss.eventDate.toDate()).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Discovery Date</p>
          <p className="font-medium text-gray-900">
            {new Date(job.causeOfLoss.discoveryDate.toDate()).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Cause of Loss</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-medium text-gray-900 mb-1">{job.causeOfLoss.type}</p>
          <p className="text-sm text-gray-700 mb-2">{job.causeOfLoss.description}</p>
          <p className="text-xs text-gray-600">Location: {job.causeOfLoss.location}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Water Classification</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Category</p>
            <p className="text-lg font-bold text-blue-700">
              {job.insuranceInfo.categoryOfWater}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Overall Class</p>
            <p className="text-lg font-bold text-orange-700">
              {job.dryingPlan?.overallClass ? `Class ${job.dryingPlan.overallClass}` : 'TBD'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Scope Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Rooms Affected:</span>
            <span className="font-medium text-gray-900">{job.rooms.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Total Affected Area:</span>
            <span className="font-medium text-gray-900">{totalAffectedSqFt.toFixed(0)} sq ft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Estimated Dry Time:</span>
            <span className="font-medium text-gray-900">
              {job.dryingPlan?.dryingGoals.estimatedDryingDays || job.equipment.calculations.estimatedDryingDays} days
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-entrusted-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          Export Full Report (PDF)
        </button>
        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Email to Adjuster
        </button>
      </div>
    </div>
  );
};

// Before/After Tab
const BeforeAfterTab: React.FC<{ job: Job }> = ({ job }) => {
  const arrivalPhotos = job.rooms.flatMap(r =>
    r.photos.filter(p => p.step === 'arrival' || p.step === 'assessment')
  );
  const finalPhotos = job.rooms.flatMap(r =>
    r.photos.filter(p => p.step === 'final' || p.step === 'post-demo')
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Before & After Comparison</h3>
      {arrivalPhotos.length > 0 || finalPhotos.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Before</p>
            <div className="space-y-3">
              {arrivalPhotos.slice(0, 3).map(photo => (
                <div key={photo.photoId} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-600">{photo.caption}</p>
                    <p className="text-xs text-gray-500">{photo.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">After</p>
            <div className="space-y-3">
              {finalPhotos.slice(0, 3).map(photo => (
                <div key={photo.photoId} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-600">{photo.caption}</p>
                    <p className="text-xs text-gray-500">{photo.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No photos available</p>
        </div>
      )}
    </div>
  );
};

// Rooms Tab
const RoomsTab: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Room-by-Room Breakdown</h3>
      <div className="space-y-4">
        {job.rooms.map(room => (
          <div key={room.roomId} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{room.roomName}</h4>
                <p className="text-sm text-gray-600">{room.roomType}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  room.affectedStatus === 'affected'
                    ? 'bg-red-100 text-red-700'
                    : room.affectedStatus === 'partially-affected'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {room.affectedStatus.replace(/-/g, ' ')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Dimensions</p>
                <p className="font-medium text-gray-900">
                  {room.dimensions.length}' × {room.dimensions.width}' × {room.dimensions.height}'
                </p>
              </div>
              <div>
                <p className="text-gray-600">Square Footage</p>
                <p className="font-medium text-gray-900">{room.dimensions.squareFootage} sq ft</p>
              </div>
              <div>
                <p className="text-gray-600">Affected Area</p>
                <p className="font-medium text-gray-900">
                  {room.affectedAreas?.totalAffectedArea.toFixed(0) || 0} sq ft
                </p>
              </div>
            </div>
            {room.affectedAreas && (
              <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-gray-600">Floor</p>
                  <p className="font-medium text-gray-900">
                    {room.affectedAreas.floor.affectedSqFt.toFixed(0)} sq ft (
                    {room.affectedAreas.floor.percentAffected.toFixed(0)}%)
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Walls</p>
                  <p className="font-medium text-gray-900">
                    {room.affectedAreas.walls.affectedSqFt.toFixed(0)} sq ft (
                    {room.affectedAreas.walls.percentAffected.toFixed(0)}%)
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Ceiling</p>
                  <p className="font-medium text-gray-900">
                    {room.affectedAreas.ceiling.affectedSqFt.toFixed(0)} sq ft (
                    {room.affectedAreas.ceiling.percentAffected.toFixed(0)}%)
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Equipment Tab
const EquipmentTab: React.FC<{ job: Job }> = ({ job }) => {
  const totalDehumidifiers = job.equipment.chambers.reduce(
    (sum, ch) => sum + ch.dehumidifiers.length,
    0
  );
  const totalAirMovers = job.equipment.chambers.reduce(
    (sum, ch) => sum + ch.airMovers.length,
    0
  );
  const totalAirScrubbers = job.equipment.chambers.reduce(
    (sum, ch) => sum + ch.airScrubbers.length,
    0
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Equipment Manifest</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Dehumidifiers</p>
          <p className="text-2xl font-bold text-blue-700">{totalDehumidifiers}</p>
          <p className="text-xs text-gray-600 mt-1">
            IICRC Calc: {job.equipment.calculations.recommendedDehumidifierCount}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Air Movers</p>
          <p className="text-2xl font-bold text-green-700">{totalAirMovers}</p>
          <p className="text-xs text-gray-600 mt-1">
            IICRC Calc: {job.equipment.calculations.recommendedAirMoverCount}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Air Scrubbers</p>
          <p className="text-2xl font-bold text-purple-700">{totalAirScrubbers}</p>
          <p className="text-xs text-gray-600 mt-1">
            IICRC Calc: {job.equipment.calculations.recommendedAirScrubberCount}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-900 mb-2">IICRC Calculation Details</p>
        <p className="text-xs text-gray-700">{job.equipment.calculations.calculationDetails}</p>
      </div>

      <div className="space-y-3">
        {job.equipment.chambers.map(chamber => (
          <div key={chamber.chamberId} className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{chamber.chamberName}</h4>
            <div className="text-sm space-y-1">
              <p className="text-gray-700">
                {chamber.dehumidifiers.length} Dehumidifiers, {chamber.airMovers.length} Air Movers,{' '}
                {chamber.airScrubbers.length} Air Scrubbers
              </p>
              <p className="text-xs text-gray-600">
                Rooms: {chamber.assignedRooms.join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Demo Tab
const DemoTab: React.FC<{ job: Job }> = ({ job }) => {
  const demoPerformed =
    job.workflowPhases.demo.status === 'completed' ||
    job.workflowPhases.install.partialDemoPerformed;

  if (!demoPerformed) {
    return (
      <div className="text-center py-12">
        <Hammer className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600">No demo work performed</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Demo Work Summary</h3>
      <p className="text-sm text-gray-600">
        Demo work documentation and IICRC justifications
      </p>
      {/* Demo details would go here */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        Demo documentation available. View full details in field documentation.
      </div>
    </div>
  );
};

// Timeline Tab
const TimelineTab: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Project Timeline</h3>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="w-24 text-sm text-gray-600">
            {new Date(job.metadata.createdAt.toDate()).toLocaleDateString()}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Job Created</p>
            <p className="text-sm text-gray-600">by {job.metadata.createdBy}</p>
          </div>
        </div>
        {/* Additional timeline items */}
      </div>
    </div>
  );
};

// Financials Tab
const FinancialsTab: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Financial Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Estimated Total</p>
          <p className="text-2xl font-bold text-gray-900">
            ${job.financial.estimatedTotal.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Deductible</p>
          <p className="text-2xl font-bold text-gray-900">
            ${job.insuranceInfo.deductible.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Documents Tab
const DocumentsTab: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Documents & Signatures</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Certificate of Satisfaction</p>
            <p className="text-sm text-gray-600">Customer signature required</p>
          </div>
          {job.documentation.certificateOfSatisfaction.obtained ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Dry Release Waiver</p>
            <p className="text-sm text-gray-600">
              {job.documentation.dryReleaseWaiver.needed ? 'Required' : 'Not required'}
            </p>
          </div>
          {job.documentation.dryReleaseWaiver.obtained ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : job.documentation.dryReleaseWaiver.needed ? (
            <Clock className="w-5 h-5 text-gray-400" />
          ) : (
            <span className="text-sm text-gray-500">N/A</span>
          )}
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Matterport Scan</p>
            <p className="text-sm text-gray-600">3D property scan</p>
          </div>
          {job.documentation.matterportScan.completed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};
