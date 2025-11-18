import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { ActionsMenu } from './ActionsMenu';

interface WorkflowActionBarProps {
  jobId: string;
  currentStep: string;
  currentStepIndex: number;
  totalSteps: number;
  currentRoom?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  hideNavButtons?: boolean; // Hide Prev/Next when in room detail view
}

export const WorkflowActionBar: React.FC<WorkflowActionBarProps> = ({
  jobId,
  currentStep,
  currentStepIndex,
  totalSteps,
  currentRoom,
  onPrevious,
  onNext,
  canGoBack = true,
  canGoForward = true,
  hideNavButtons = false,
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  return (
    <>
      {/* Fixed bottom bar - 56px tall for easy thumb reach */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className={`flex items-center ${hideNavButtons ? 'justify-center' : 'justify-between'} px-2 py-2`}>
          {/* Previous Button - 90px wide - HIDDEN when in room detail view */}
          {!hideNavButtons && (
            <button
              onClick={onPrevious}
              disabled={!canGoBack || currentStepIndex === 0}
              className={`flex items-center gap-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                !canGoBack || currentStepIndex === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              }`}
              style={{ minWidth: '90px', minHeight: '48px' }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Prev</span>
            </button>
          )}

          {/* Actions Button - 160px wide, center */}
          <button
            onClick={() => setShowActionsMenu(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md"
            style={{ minWidth: '160px', minHeight: '48px' }}
          >
            <Zap className="w-5 h-5" />
            <span className="text-sm font-semibold">Actions</span>
          </button>

          {/* Next Button - 90px wide - HIDDEN when in room detail view */}
          {!hideNavButtons && (
            <button
              onClick={onNext}
              disabled={!canGoForward}
              className={`flex items-center gap-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                !canGoForward
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md'
              }`}
              style={{ minWidth: '90px', minHeight: '48px' }}
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Actions Menu - Slide up from bottom */}
      {showActionsMenu && (
        <ActionsMenu
          jobId={jobId}
          currentStep={currentStep}
          currentRoom={currentRoom}
          onClose={() => setShowActionsMenu(false)}
        />
      )}

      {/* Spacer to prevent content from being hidden under fixed bar */}
      <div style={{ height: '72px' }} />
    </>
  );
};
