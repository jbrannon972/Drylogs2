import React, { useState } from 'react';
import { X, Mic } from 'lucide-react';
import { useWorkflowStore } from '../../../stores/workflowStore';

interface QuickNotesModalProps {
  jobId: string;
  currentStep: string;
  onClose: () => void;
}

export const QuickNotesModal: React.FC<QuickNotesModalProps> = ({
  jobId,
  currentStep,
  onClose,
}) => {
  const { updateWorkflowData, installData } = useWorkflowStore();

  const [note, setNote] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Voice-to-text support (if available)
  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert('Voice input failed. Please try typing instead.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Voice input is not supported on this device. Please type your note.');
    }
  };

  const handleSave = () => {
    if (!note.trim()) {
      alert('Please enter a note before saving.');
      return;
    }

    const newNote = {
      id: `note-${Date.now()}`,
      content: note.trim(),
      createdAt: new Date().toISOString(),
      createdDuringStep: currentStep,
    };

    const existingNotes = installData.quickNotes || [];

    updateWorkflowData('install', {
      quickNotes: [...existingNotes, newNote],
    });

    alert('Note saved successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Quick Note</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note <span className="text-red-500">*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Type or speak your note..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              autoFocus
            />
          </div>

          {/* Voice Input Button */}
          <button
            onClick={startVoiceInput}
            disabled={isListening}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              isListening
                ? 'bg-red-100 text-red-800 border-2 border-red-500'
                : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            <span>{isListening ? 'Listening...' : 'Use Voice Input'}</span>
          </button>

          {/* Context Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800">
              <strong>Current Step:</strong> {currentStep}
            </p>
            <p className="text-xs text-green-800 mt-1">
              This note will be timestamped and saved to your workflow.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!note.trim()}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              !note.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};
