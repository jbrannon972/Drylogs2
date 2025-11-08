import React, { useState, useEffect } from 'react';
import { Camera, Hammer, Droplets, FileText, AlertTriangle, X } from 'lucide-react';
import { PreExistingModal } from './modals/PreExistingModal';
import { DemoModal } from './modals/DemoModal';
import { SubcontractorModal } from './modals/SubcontractorModal';
import { QuickNotesModal } from './modals/QuickNotesModal';
import { SafetyFlagModal } from './modals/SafetyFlagModal';

interface ActionsMenuProps {
  jobId: string;
  currentStep: string;
  currentRoom?: string;
  onClose: () => void;
}

type ActionType = 'preexisting' | 'demo' | 'sub' | 'notes' | 'safety' | null;

export const ActionsMenu: React.FC<ActionsMenuProps> = ({
  jobId,
  currentStep,
  currentRoom,
  onClose,
}) => {
  const [activeModal, setActiveModal] = useState<ActionType>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Slide up animation on mount
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for slide-down animation
  };

  const handleActionClick = (action: ActionType) => {
    setActiveModal(action);
  };

  const handleModalClose = () => {
    setActiveModal(null);
    handleClose();
  };

  const actions = [
    {
      id: 'preexisting' as ActionType,
      icon: Camera,
      label: 'Add Pre-Existing Damage',
      description: 'Document damage found mid-workflow',
      color: 'text-purple-600',
    },
    {
      id: 'demo' as ActionType,
      icon: Hammer,
      label: 'Log Demo Work',
      description: 'Record demolition performed',
      color: 'text-orange-600',
    },
    {
      id: 'sub' as ActionType,
      icon: Droplets,
      label: 'Request Subcontractor',
      description: 'Plumber, electrician, HVAC, etc.',
      color: 'text-blue-600',
    },
    {
      id: 'notes' as ActionType,
      icon: FileText,
      label: 'Quick Notes',
      description: 'Voice or text notes',
      color: 'text-green-600',
    },
    {
      id: 'safety' as ActionType,
      icon: AlertTriangle,
      label: 'Flag Safety Issue',
      description: 'Hazards, Cat 3, urgent concerns',
      color: 'text-red-600',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-200 z-40 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Slide-up menu */}
      <div
        className={`fixed inset-x-0 bg-white rounded-t-2xl shadow-2xl z-50 transition-all duration-200 ease-out ${
          isVisible ? 'bottom-0' : '-bottom-full'
        }`}
        style={{ maxHeight: '80vh' }}
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

        <div className="px-4 pb-20 pt-2 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 20px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Action buttons - 60px tall tap targets */}
          <div className="space-y-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  style={{ minHeight: '60px' }}
                >
                  <div className={`${action.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{action.label}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cancel button */}
          <button
            onClick={handleClose}
            className="w-full py-4 mt-6 text-center text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'preexisting' && (
        <PreExistingModal jobId={jobId} currentRoom={currentRoom} onClose={handleModalClose} />
      )}
      {activeModal === 'demo' && (
        <DemoModal jobId={jobId} currentRoom={currentRoom} onClose={handleModalClose} />
      )}
      {activeModal === 'sub' && (
        <SubcontractorModal jobId={jobId} currentStep={currentStep} onClose={handleModalClose} />
      )}
      {activeModal === 'notes' && (
        <QuickNotesModal jobId={jobId} currentStep={currentStep} onClose={handleModalClose} />
      )}
      {activeModal === 'safety' && (
        <SafetyFlagModal jobId={jobId} currentStep={currentStep} onClose={handleModalClose} />
      )}
    </>
  );
};
