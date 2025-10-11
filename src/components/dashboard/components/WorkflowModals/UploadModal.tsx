// Upload Modal Component
'use client';

import React from 'react';
import { X, ArrowLeft, ArrowRight, FileText, Check, AlertTriangle } from 'lucide-react';
import UploadZone from '../UploadZone';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  selectedExam: any;
  uploadedFiles: { [key: string]: File };
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFilesSelected: (files: File[]) => void;
  dragOver: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onBack,
  onNext,
  selectedExam,
  uploadedFiles,
  onDrop,
  onDragOver,
  onDragLeave,
  onFilesSelected,
  dragOver
}) => {
  if (!isOpen) return null;

  const filesList = Object.values(uploadedFiles);
  const canProceed = filesList.length > 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeMapping = () => {
    return selectedExam?.schema?.documents?.reduce((acc: any, doc: any) => {
      acc[doc.type] = {
        name: doc.type.charAt(0).toUpperCase() + doc.type.slice(1),
        icon: '📄',
        required: doc.required || false
      };
      return acc;
    }, {}) || {};
  };

  const documentTypeMapping = getDocumentTypeMapping();

  return (
    <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold">Upload Documents</h2>
              {selectedExam && (
                <p className="text-sm text-gray-600">
                  for {selectedExam.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column - Upload Zone */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Your Documents</h3>
                <UploadZone
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onFilesSelected={onFilesSelected}
                  dragOver={dragOver}
                />
              </div>

              {/* Uploaded Files List */}
              {filesList.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Uploaded Files ({filesList.length})
                  </h4>
                  <div className="space-y-2">
                    {filesList.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Requirements */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Document Requirements</h3>
                {selectedExam?.schema?.documents ? (
                  <div className="space-y-3">
                    {selectedExam.schema.documents.map((doc: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">📄</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 capitalize">{doc.type}</h4>
                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                              {doc.requirements?.format && (
                                <p>Format: {Array.isArray(doc.requirements.format) 
                                  ? doc.requirements.format.join(', ') 
                                  : doc.requirements.format}</p>
                              )}
                              {doc.requirements?.size_kb && (
                                <p>Size: {doc.requirements.size_kb.min}KB - {doc.requirements.size_kb.max}KB</p>
                              )}
                              {doc.requirements?.dimensions && (
                                <p>Dimensions: {doc.requirements.dimensions}</p>
                              )}
                              {doc.requirements?.notes && (
                                <div className="mt-2">
                                  {doc.requirements.notes.map((note: string, noteIndex: number) => (
                                    <p key={noteIndex} className="text-xs text-gray-500">• {note}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {doc.required ? (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No specific requirements available</p>
                    <p className="text-xs">Upload your documents and we'll validate them</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            {filesList.length} file{filesList.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                canProceed
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;