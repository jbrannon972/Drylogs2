import React, { useState } from 'react';
import { Job, AdjusterCommunication, CommunicationType } from '../../../types';
import { Timestamp } from 'firebase/firestore';
import { X, Phone, Mail, Users, MessageSquare, Calendar } from 'lucide-react';

interface AdjusterContactLogProps {
  job: Job;
  onClose: () => void;
  onSave: (communication: Omit<AdjusterCommunication, 'id'>) => void;
}

export const AdjusterContactLog: React.FC<AdjusterContactLogProps> = ({
  job,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    communicationType: 'call' as CommunicationType,
    summary: '',
    questionsAsked: [''],
    answersProvided: [''],
    nextStep: '',
    followUpDate: '',
  });

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questionsAsked: [...formData.questionsAsked, ''],
      answersProvided: [...formData.answersProvided, ''],
    });
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...formData.questionsAsked];
    updated[index] = value;
    setFormData({ ...formData, questionsAsked: updated });
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...formData.answersProvided];
    updated[index] = value;
    setFormData({ ...formData, answersProvided: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const communication: Omit<AdjusterCommunication, 'id'> = {
      communicationType: formData.communicationType,
      timestamp: Timestamp.now(),
      contactedBy: 'Current User', // Would come from auth
      summary: formData.summary,
      questionsAsked: formData.questionsAsked.filter(q => q.trim() !== ''),
      answersProvided: formData.answersProvided.filter(a => a.trim() !== ''),
      nextStep: formData.nextStep,
      followUpDate: formData.followUpDate
        ? Timestamp.fromDate(new Date(formData.followUpDate))
        : undefined,
    };

    onSave(communication);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-xl font-poppins font-bold text-gray-900">
              Log Adjuster Communication
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {job.insuranceInfo.adjusterName} • {job.insuranceInfo.carrierName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Communication Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Type
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: 'call', icon: Phone, label: 'Phone Call' },
                  { value: 'email', icon: Mail, label: 'Email' },
                  { value: 'meeting', icon: Users, label: 'Meeting' },
                  { value: 'portal-message', icon: MessageSquare, label: 'Portal' },
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, communicationType: type.value as CommunicationType })
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      formData.communicationType === type.value
                        ? 'border-entrusted-orange bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <textarea
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
                placeholder="Brief summary of the conversation..."
              />
            </div>

            {/* Questions & Answers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Questions Asked & Answers Provided
                </label>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="text-sm text-entrusted-orange hover:text-orange-600 font-medium"
                >
                  + Add Question
                </button>
              </div>
              <div className="space-y-4">
                {formData.questionsAsked.map((_, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Question {index + 1}
                      </label>
                      <input
                        type="text"
                        value={formData.questionsAsked[index]}
                        onChange={e => handleQuestionChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange text-sm"
                        placeholder="What did the adjuster ask?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Answer {index + 1}
                      </label>
                      <input
                        type="text"
                        value={formData.answersProvided[index]}
                        onChange={e => handleAnswerChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange text-sm"
                        placeholder="How did you respond?"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Step / Action Required
              </label>
              <input
                type="text"
                value={formData.nextStep}
                onChange={e => setFormData({ ...formData, nextStep: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
                placeholder="What needs to happen next?"
              />
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.followUpDate}
                  onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-entrusted-orange"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-entrusted-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Save Communication
          </button>
        </div>
      </div>
    </div>
  );
};
