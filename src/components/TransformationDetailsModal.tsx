/**
 * 🎛️ Transformation Details Modal Component
 * 
 * This component displays detailed transformation logs and process information
 * to help users understand what happened during document processing.
 */

import React, { useState, useEffect } from 'react';
import { getTransformationDetails, TransformationDetails } from '@/features/transform/transformFile';

interface TransformationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transformationData?: TransformationDetails;
}

export function TransformationDetailsModal({ 
  isOpen, 
  onClose, 
  transformationData 
}: TransformationDetailsModalProps) {
  const [details, setDetails] = useState<TransformationDetails | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Get current transformation details
      const currentDetails = transformationData || getTransformationDetails();
      setDetails(currentDetails);
    }
  }, [isOpen, transformationData]);

  if (!isOpen || !details) return null;

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / 1024)}KB`;
  };

  const getCompressionColor = (ratio: number) => {
    if (ratio > 80) return 'text-green-600';
    if (ratio > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Transformation Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete processing log and analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            
            {/* File Size Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">File Size</h3>
              <div className="text-sm text-blue-700">
                <div>Original: {formatFileSize(details.originalSize)}</div>
                <div>Final: {formatFileSize(details.finalSize)}</div>
                <div className={`font-medium ${getCompressionColor(details.compressionRatio)}`}>
                  Ratio: {details.compressionRatio.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Format Change */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Format</h3>
              <div className="text-sm text-green-700">
                <div>{details.formatChange || 'No format change'}</div>
              </div>
            </div>

            {/* Quality Impact */}
            <div className={`rounded-lg p-4 ${details.isOvercompressed ? 'bg-red-50' : 'bg-purple-50'}`}>
              <h3 className={`font-medium mb-2 ${details.isOvercompressed ? 'text-red-900' : 'text-purple-900'}`}>
                Quality {details.isOvercompressed ? '🚨' : ''}
              </h3>
              <div className={`text-sm ${details.isOvercompressed ? 'text-red-700' : 'text-purple-700'}`}>
                {details.qualityReduction ? (
                  <div>
                    <div>Reduced to {details.qualityReduction.toFixed(0)}%</div>
                    {details.isOvercompressed && (
                      <div className="text-xs mt-1 font-medium">⚠️ Overcompressed</div>
                    )}
                  </div>
                ) : (
                  <div>No quality reduction</div>
                )}
              </div>
            </div>
          </div>

          {/* Processing Status */}
          {details.processing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                <span className="text-yellow-800 font-medium">Processing in progress...</span>
              </div>
            </div>
          )}

          {/* 🚨 Overcompression Warning Section */}
          {details.isOvercompressed && (
            <div className="mb-6">
              <h3 className="font-medium text-red-900 mb-3 flex items-center">
                <span className="text-red-500 mr-2">🚨</span>
                Overcompression Detected
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-700 mb-3">
                  <strong>Quality unnecessarily reduced!</strong> The file was compressed beyond the recommended 85% target.
                </div>
                <div className="text-xs text-red-600 space-y-1">
                  <div>• Target size: {details.targetSizeKB}KB (85% of {details.maxSizeKB}KB limit)</div>
                  <div>• Actual size: {Math.round(details.finalSize / 1024)}KB</div>
                  <div>• Consider increasing size limit or using a higher quality image</div>
                </div>
                {/* 🔴 Red Preview Button */}
                <div className="mt-3">
                  <button className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                    ⚠️ Preview Overcompressed File
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Warnings Section */}
          {details.warnings.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-orange-900 mb-3 flex items-center">
                <span className="text-orange-500 mr-2">⚠️</span>
                Warnings ({details.warnings.length})
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                {details.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-orange-700 mb-2 last:mb-0">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Steps */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-blue-500 mr-2">📋</span>
              Processing Steps ({details.steps.length})
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {details.steps.map((step, index) => (
                  <div key={index} className="flex items-start text-sm">
                    <span className="text-gray-400 mr-3 mt-0.5 font-mono text-xs">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-gray-700 flex-1">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Performance Insights</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Steps completed: {details.steps.length}</div>
              <div>• Warnings encountered: {details.warnings.length}</div>
              <div>• Size efficiency: {details.compressionRatio.toFixed(1)}% of original</div>
              {details.qualityReduction && (
                <div>• Quality preserved: {(100 - details.qualityReduction).toFixed(0)}%</div>
              )}
              {details.isOvercompressed && (
                <div className="text-red-600 font-medium">• ⚠️ File was overcompressed beyond optimal target</div>
              )}
              {details.targetSizeKB && details.maxSizeKB && (
                <div>• Target: {details.targetSizeKB}KB (85% of {details.maxSizeKB}KB limit)</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for using transformation details
export function useTransformationDetails() {
  const [details, setDetails] = useState<TransformationDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showDetails = () => {
    setDetails(getTransformationDetails());
    setIsModalOpen(true);
  };

  const hideDetails = () => {
    setIsModalOpen(false);
  };

  return {
    details,
    isModalOpen,
    showDetails,
    hideDetails,
    TransformationDetailsModal: (props: Omit<TransformationDetailsModalProps, 'isOpen' | 'onClose'>) => (
      <TransformationDetailsModal
        {...props}
        isOpen={isModalOpen}
        onClose={hideDetails}
        transformationData={details}
      />
    )
  };
}

// Sample usage component
export function DocumentUploadWithDetails() {
  const { showDetails, TransformationDetailsModal } = useTransformationDetails();

  const handleFileTransform = async (file: File, requirements: any) => {
    try {
      const result = await transformFile(file, requirements);
      // Show success with option to view details
      return (
        <div className="flex items-center space-x-2">
          <span>✅ Transformation successful!</span>
          <button 
            onClick={showDetails}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            View Details
          </button>
        </div>
      );
    } catch (error) {
      // Show error with automatic details display
      showDetails();
      throw error;
    }
  };

  return (
    <div>
      {/* Your upload UI here */}
      <TransformationDetailsModal />
    </div>
  );
}