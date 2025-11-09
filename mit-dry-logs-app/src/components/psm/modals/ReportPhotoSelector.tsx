import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { JobPhoto } from '../../../types/photo';

interface ReportPhotoSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  exteriorPhotos: JobPhoto[];
  causeOfLossPhotos: JobPhoto[];
  onSelectExterior: (photoUrl: string) => void;
  onSelectCauseOfLoss: (photoUrl: string) => void;
  onProceed: (includeAllPhotos: boolean) => void;
}

type ModalStep = 'exterior' | 'cause-of-loss' | 'gallery-option';

export const ReportPhotoSelector: React.FC<ReportPhotoSelectorProps> = ({
  isOpen,
  onClose,
  exteriorPhotos,
  causeOfLossPhotos,
  onSelectExterior,
  onSelectCauseOfLoss,
  onProceed,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('exterior');
  const [selectedExteriorUrl, setSelectedExteriorUrl] = useState<string | null>(
    exteriorPhotos.length > 0 ? exteriorPhotos[0].url : null
  );
  const [selectedCauseOfLossUrl, setSelectedCauseOfLossUrl] = useState<string | null>(
    causeOfLossPhotos.length > 0 ? causeOfLossPhotos[0].url : null
  );

  if (!isOpen) return null;

  const getStepTitle = () => {
    switch (currentStep) {
      case 'exterior':
        return 'Select Exterior Photo';
      case 'cause-of-loss':
        return 'Select Cause of Loss Photo';
      case 'gallery-option':
        return 'Include Photo Gallery?';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'exterior':
        return 'Choose the property exterior photo to display in the report header';
      case 'cause-of-loss':
        return 'Choose the photo to display next to the cause of loss details';
      case 'gallery-option':
        return 'Choose whether to include all job photos in the report';
    }
  };

  const handleNext = () => {
    if (currentStep === 'exterior') {
      if (selectedExteriorUrl) {
        onSelectExterior(selectedExteriorUrl);
      }
      setCurrentStep('cause-of-loss');
    } else if (currentStep === 'cause-of-loss') {
      if (selectedCauseOfLossUrl) {
        onSelectCauseOfLoss(selectedCauseOfLossUrl);
      }
      setCurrentStep('gallery-option');
    }
  };

  const handleBack = () => {
    if (currentStep === 'cause-of-loss') {
      setCurrentStep('exterior');
    } else if (currentStep === 'gallery-option') {
      setCurrentStep('cause-of-loss');
    }
  };

  const handleProceedWithGallery = (includePhotos: boolean) => {
    onProceed(includePhotos);
    onClose();
  };

  const renderPhotoSelection = (
    photos: JobPhoto[],
    selectedUrl: string | null,
    onSelect: (url: string) => void,
    emptyMessage: string
  ) => {
    if (photos.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
          <p className="text-sm text-gray-400 mt-2">
            The report will be generated without this photo
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => onSelect(photo.url)}
            className={`relative rounded-lg overflow-hidden border-4 transition-all ${
              selectedUrl === photo.url
                ? 'border-entrusted-orange shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={`Photo ${photo.id}`}
              className="w-full h-64 object-cover"
            />
            {selectedUrl === photo.url && (
              <div className="absolute top-2 right-2 w-8 h-8 bg-entrusted-orange rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-sm">
              <div>{photo.roomName}</div>
              <div className="text-xs">{photo.timestamp.toDate().toLocaleString()}</div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{getStepTitle()}</h3>
            <p className="text-sm text-gray-500 mt-1">{getStepDescription()}</p>
            <div className="flex gap-2 mt-2">
              <div className={`h-1.5 w-16 rounded-full ${currentStep === 'exterior' ? 'bg-entrusted-orange' : 'bg-gray-300'}`} />
              <div className={`h-1.5 w-16 rounded-full ${currentStep === 'cause-of-loss' ? 'bg-entrusted-orange' : 'bg-gray-300'}`} />
              <div className={`h-1.5 w-16 rounded-full ${currentStep === 'gallery-option' ? 'bg-entrusted-orange' : 'bg-gray-300'}`} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'exterior' && renderPhotoSelection(
            exteriorPhotos,
            selectedExteriorUrl,
            setSelectedExteriorUrl,
            'No exterior photos found for this job'
          )}

          {currentStep === 'cause-of-loss' && renderPhotoSelection(
            causeOfLossPhotos,
            selectedCauseOfLossUrl,
            setSelectedCauseOfLossUrl,
            'No cause of loss photos found for this job'
          )}

          {currentStep === 'gallery-option' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center py-8">
                <p className="text-lg text-gray-700">
                  Would you like to include all job photos in the report?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Photos will be organized by room in a 2-column grid after the dry logs
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleProceedWithGallery(false)}
                  className="p-8 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">📄</div>
                    <p className="font-bold text-gray-900">No Photos</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Generate report without photo gallery
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleProceedWithGallery(true)}
                  className="p-8 border-2 border-entrusted-orange bg-orange-50 rounded-lg hover:bg-orange-100 transition-all"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">📸</div>
                    <p className="font-bold text-gray-900">Include All Photos</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Add photo gallery organized by room
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep !== 'gallery-option' && (
          <div className="p-6 border-t border-gray-200 flex gap-3 justify-between">
            <button
              onClick={currentStep === 'exterior' ? onClose : handleBack}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
            >
              {currentStep === 'exterior' ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-entrusted-orange text-white font-bold rounded-lg hover:bg-orange-600 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
