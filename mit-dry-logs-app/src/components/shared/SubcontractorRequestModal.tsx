import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, Clock, Camera } from 'lucide-react';
import { Button } from './Button';

export type SpecialistType =
  | 'Plumber'
  | 'Electrician'
  | 'HVAC Technician'
  | 'Asbestos Abatement'
  | 'Mold Remediation'
  | 'Structural Engineer'
  | 'Roofing Contractor'
  | 'Other';

export type UrgencyLevel = 'emergency' | 'urgent' | 'standard';

export interface SubcontractorRequestData {
  specialistType: SpecialistType;
  urgency: UrgencyLevel;
  location: string; // Room name
  issueDescription: string;
  photos: File[];
  customerAware: boolean;
  otherSpecialistType?: string;
}

interface SubcontractorRequestModalProps {
  jobId: string;
  rooms: any[];
  onClose: () => void;
  onSubmit: (data: SubcontractorRequestData) => Promise<void>;
}

export const SubcontractorRequestModal: React.FC<SubcontractorRequestModalProps> = ({
  jobId,
  rooms,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<SubcontractorRequestData>({
    specialistType: 'Plumber',
    urgency: 'standard',
    location: '',
    issueDescription: '',
    photos: [],
    customerAware: false,
    otherSpecialistType: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 photos
    const newPhotos = [...formData.photos, ...files].slice(0, 5);
    setFormData({ ...formData, photos: newPhotos });

    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls([...photoPreviewUrls, ...newUrls].slice(0, 5));
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newUrls = photoPreviewUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
    setPhotoPreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.location) {
      alert('Please select a room/location');
      return;
    }
    if (!formData.issueDescription.trim()) {
      alert('Please describe the issue');
      return;
    }
    if (formData.specialistType === 'Other' && !formData.otherSpecialistType?.trim()) {
      alert('Please specify the type of specialist needed');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyIcon = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return '⚡';
      case 'urgent':
        return '🔴';
      case 'standard':
        return '🟡';
    }
  };

  const getUrgencyLabel = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return 'Emergency (same day)';
      case 'urgent':
        return 'Urgent (within 24 hrs)';
      case 'standard':
        return 'Standard (within 2-3 days)';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-entrusted-orange" />
            <h2 className="text-xl font-poppins font-bold text-gray-900">
              Request Specialist / Subcontractor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Specialist Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialist Type: <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Plumber',
                'Electrician',
                'HVAC Technician',
                'Asbestos Abatement',
                'Mold Remediation',
                'Structural Engineer',
                'Roofing Contractor',
                'Other',
              ].map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.specialistType === type
                      ? 'border-entrusted-orange bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="specialistType"
                    value={type}
                    checked={formData.specialistType === type}
                    onChange={(e) =>
                      setFormData({ ...formData, specialistType: e.target.value as SpecialistType })
                    }
                    className="h-4 w-4 text-entrusted-orange focus:ring-entrusted-orange"
                  />
                  <span className="text-sm font-medium text-gray-900">{type}</span>
                </label>
              ))}
            </div>

            {/* Other Specialist Type */}
            {formData.specialistType === 'Other' && (
              <input
                type="text"
                value={formData.otherSpecialistType}
                onChange={(e) => setFormData({ ...formData, otherSpecialistType: e.target.value })}
                placeholder="Specify specialist type..."
                className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange"
              />
            )}
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency: <span className="text-red-600">*</span>
            </label>
            <div className="space-y-2">
              {(['emergency', 'urgent', 'standard'] as UrgencyLevel[]).map((urgency) => (
                <label
                  key={urgency}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.urgency === urgency
                      ? 'border-entrusted-orange bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={urgency}
                    checked={formData.urgency === urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as UrgencyLevel })}
                    className="h-4 w-4 text-entrusted-orange focus:ring-entrusted-orange"
                  />
                  <span className="text-xl">{getUrgencyIcon(urgency)}</span>
                  <span className="text-sm font-medium text-gray-900">{getUrgencyLabel(urgency)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location/Room: <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange"
            >
              <option value="">-- Select room/location --</option>
              {rooms.map((room) => (
                <option key={room.roomId} value={room.roomName}>
                  {room.roomName}
                </option>
              ))}
              <option value="Exterior">Exterior</option>
              <option value="Roof">Roof</option>
              <option value="Foundation">Foundation</option>
              <option value="Whole Property">Whole Property</option>
            </select>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Description: <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              rows={4}
              placeholder="Describe what the specialist needs to address and why..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entrusted-orange focus:border-entrusted-orange text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about the problem, safety concerns, and any immediate actions taken.
            </p>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (optional, max 5):
            </label>
            <div className="space-y-3">
              {photoPreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photoPreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {photoPreviewUrls.length < 5 && (
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-entrusted-orange transition-colors">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Customer Aware */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.customerAware}
                onChange={(e) => setFormData({ ...formData, customerAware: e.target.checked })}
                className="mt-1 h-4 w-4 text-entrusted-orange rounded focus:ring-entrusted-orange"
              />
              <div>
                <span className="font-medium text-blue-900">Customer has been informed</span>
                <p className="text-sm text-blue-700 mt-1">
                  I have notified the customer about the need for this specialist and any associated costs.
                </p>
              </div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
