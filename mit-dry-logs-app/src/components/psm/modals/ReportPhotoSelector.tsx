import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { JobPhoto } from '../../../types/photo';

interface ReportPhotoSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  exteriorPhotos: JobPhoto[];
  onSelectExterior: (photoUrl: string) => void;
  onProceed: (includeAllPhotos: boolean) => void;
}

export const ReportPhotoSelector: React.FC<ReportPhotoSelectorProps> = ({
  isOpen,
  onClose,
  exteriorPhotos,
  onSelectExterior,
  onProceed,
}) => {
  const [selectedExteriorUrl, setSelectedExteriorUrl] = useState<string | null>(
    exteriorPhotos.length > 0 ? exteriorPhotos[0].url : null
  );
  const [showPhotoGalleryOption, setShowPhotoGalleryOption] = useState(false);

  if (!isOpen) return null;

  const handleExteriorSelect = (url: string) => {
    setSelectedExteriorUrl(url);
  };

  const handleNext = () => {
    if (selectedExteriorUrl) {
      onSelectExterior(selectedExteriorUrl);
      setShowPhotoGalleryOption(true);
    }
  };

  const handleProceedWithGallery = (includePhotos: boolean) => {
    onProceed(includePhotos);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {showPhotoGalleryOption ? 'Include Photo Gallery?' : 'Select Exterior Photo'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {showPhotoGalleryOption
                ? 'Choose whether to include all job photos in the report'
                : 'Choose the property exterior photo to display in the report header'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {!showPhotoGalleryOption ? (
          <>
            {/* Exterior Photo Selection */}
            <div className="flex-1 overflow-y-auto p-6">
              {exteriorPhotos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No exterior photos found for this job</p>
                  <p className="text-sm text-gray-400 mt-2">
                    The report will be generated without an exterior photo
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {exteriorPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => handleExteriorSelect(photo.url)}
                      className={`relative rounded-lg overflow-hidden border-4 transition-all ${
                        selectedExteriorUrl === photo.url
                          ? 'border-entrusted-orange shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={`Exterior photo ${photo.id}`}
                        className="w-full h-64 object-cover"
                      />
                      {selectedExteriorUrl === photo.url && (
                        <div className="absolute top-2 right-2 w-8 h-8 bg-entrusted-orange rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-sm">
                        {photo.timestamp.toDate().toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedExteriorUrl && exteriorPhotos.length > 0}
                className="px-6 py-3 bg-entrusted-orange text-white font-bold rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Photo Gallery Option */}
            <div className="flex-1 overflow-y-auto p-6">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};
