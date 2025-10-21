// Enhanced Upload Modal Component with Document Mapping
'use client';

import React, { useState, useCallback } from 'react';
import { X, ArrowLeft, ArrowRight, FileText, Check, AlertTriangle, Upload, Plus, Trash2, Eye } from 'lucide-react';
import UploadZone from '../UploadZone';

interface DocumentMapping {
  [requirementType: string]: File | null;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  selectedExam: any;
  selectedExamSchema?: any;
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
  selectedExamSchema,
  uploadedFiles,
  onDrop,
  onDragOver,
  onDragLeave,
  onFilesSelected,
  dragOver
}) => {
  // State for document mapping and UI control
  const [documentMapping, setDocumentMapping] = useState<DocumentMapping>({});
  const [showOptionalDocs, setShowOptionalDocs] = useState(false);
  const [activeUploadRequirement, setActiveUploadRequirement] = useState<string | null>(null);
  const [unmappedFiles, setUnmappedFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  // Debug logging
  console.log('🎯 Enhanced UploadModal rendering with exam:', selectedExam?.name);
  console.log('📊 Selected exam object:', selectedExam);
  console.log('🔧 Selected exam schema:', selectedExamSchema);

  const filesList = Object.values(uploadedFiles);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentRequirements = () => {
    // Use selectedExamSchema first, fallback to selectedExam.schema
    const schema = selectedExamSchema || selectedExam?.schema;
    console.log('📄 Using schema:', !!schema);
    console.log('📄 Schema documents:', schema?.documents?.length || 0);
    return schema?.documents || [];
  };

  const documentRequirements = getDocumentRequirements();

  // Filter requirements based on optional toggle
  const filteredRequirements = documentRequirements.filter((doc: any) => {
    const isRequired = doc.requirements?.mandatory || doc.required || false;
    return showOptionalDocs ? true : isRequired;
  });

  // Handle clicking on a requirement card to start upload
  const handleRequirementClick = useCallback((requirementType: string) => {
    console.log('📋 Requirement card clicked:', requirementType);
    setActiveUploadRequirement(requirementType);
    
    // Create a file input for this specific requirement
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        handleFileMapping(requirementType, files[0]);
      }
      setActiveUploadRequirement(null);
    };
    input.click();
  }, []);

  // Handle mapping a file to a specific requirement
  const handleFileMapping = useCallback((requirementType: string, file: File) => {
    console.log('🔗 Mapping file to requirement:', { requirementType, fileName: file.name });
    setDocumentMapping(prev => ({
      ...prev,
      [requirementType]: file
    }));
    
    // Remove from unmapped files if it was there
    setUnmappedFiles(prev => prev.filter(f => f.name !== file.name));
  }, []);

  // Handle removing a mapped file
  const handleRemoveMapping = useCallback((requirementType: string) => {
    console.log('🗑️ Removing mapping for:', requirementType);
    const file = documentMapping[requirementType];
    if (file) {
      setUnmappedFiles(prev => [...prev, file]);
    }
    setDocumentMapping(prev => {
      const newMapping = { ...prev };
      delete newMapping[requirementType];
      return newMapping;
    });
  }, [documentMapping]);

  // Check if we can proceed (all required documents mapped)
  const requiredDocs = documentRequirements.filter((doc: any) => 
    doc.requirements?.mandatory || doc.required || false
  );
  const mappedRequiredDocs = requiredDocs.filter((doc: any) => 
    documentMapping[doc.type]
  );
  const canProceed = mappedRequiredDocs.length === requiredDocs.length;

  // Get requirement status
  const getRequirementStatus = (requirementType: string, isRequired: boolean) => {
    const hasMappedFile = !!documentMapping[requirementType];
    if (hasMappedFile) return 'completed';
    if (isRequired) return 'required';
    return 'optional';
  };

  // Get requirement icon
  const getRequirementIcon = (requirementType: string) => {
    const type = requirementType.toLowerCase();
    if (type.includes('photo')) return '📷';
    if (type.includes('signature')) return '✍️';
    if (type.includes('id') || type.includes('identity')) return '🆔';
    if (type.includes('marksheet') || type.includes('certificate')) return '📜';
    if (type.includes('category')) return '🏷️';
    if (type.includes('pwd') || type.includes('disability')) return '♿';
    return '📄';
  };

  return (
    <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
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
          <div className="flex items-center gap-4">
            {/* Optional Documents Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show Optional</span>
              <button
                onClick={() => setShowOptionalDocs(!showOptionalDocs)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  showOptionalDocs ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    showOptionalDocs ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column - Document Requirements */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Document Requirements</h3>
                {documentRequirements.length > 0 ? (
                  <div className="space-y-3">
                    {filteredRequirements.map((doc: any, index: number) => {
                      const isRequired = doc.requirements?.mandatory || doc.required || false;
                      const status = getRequirementStatus(doc.type, isRequired);
                      const mappedFile = documentMapping[doc.type];
                      
                      return (
                        <div
                          key={index}
                          onClick={() => handleRequirementClick(doc.type)}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            status === 'completed'
                              ? 'border-green-300 bg-green-50'
                              : status === 'required'
                              ? 'border-red-300 bg-red-50 hover:border-red-400'
                              : 'border-gray-200 hover:border-blue-300'
                          } ${activeUploadRequirement === doc.type ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                status === 'completed'
                                  ? 'bg-green-100'
                                  : status === 'required'
                                  ? 'bg-red-100'
                                  : 'bg-blue-100'
                              }`}>
                                <span className="text-sm">{getRequirementIcon(doc.type)}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 capitalize">{doc.type}</h4>
                                  {status === 'completed' && (
                                    <Check className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                                
                                {/* Show mapped file */}
                                {mappedFile && (
                                  <div className="mt-2 p-2 bg-white rounded border">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium">{mappedFile.name}</span>
                                        <span className="text-xs text-gray-500">
                                          ({formatFileSize(mappedFile.size)})
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Preview functionality would be implemented here
                                            console.log('Preview file:', mappedFile.name);
                                          }}
                                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                        >
                                          <Eye size={16} />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMapping(doc.type);
                                          }}
                                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Upload prompt when no file mapped */}
                                {!mappedFile && (
                                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                    <Plus size={16} />
                                    <span>Click to upload {doc.type}</span>
                                  </div>
                                )}
                                
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
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              {isRequired ? (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Requirement notes */}
                          {doc.requirements?.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              {doc.requirements.notes.map((note: string, noteIndex: number) => (
                                <p key={noteIndex} className="text-xs text-gray-500 mb-1">• {note}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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

            {/* Right Column - Upload Zone & Mapped Files Summary */}
            <div className="space-y-6">
              {/* General Upload Zone */}
              <div>
                <h3 className="text-lg font-semibold mb-4">General Upload</h3>
                <UploadZone
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onFilesSelected={onFilesSelected}
                  dragOver={dragOver}
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can also drag files directly to requirement cards for automatic mapping
                </p>
              </div>

              {/* Mapping Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Document Mapping Summary
                </h4>
                
                {/* Mapped Documents */}
                {Object.keys(documentMapping).length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h5 className="text-sm font-medium text-green-700">Mapped Documents ({Object.keys(documentMapping).length})</h5>
                    {Object.entries(documentMapping).map(([type, file]) => (
                      <div key={type} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">{type}:</span>
                          <span className="text-sm text-gray-600">{file?.name}</span>
                        </div>
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Unmapped Files */}
                {filesList.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">
                      Uploaded Files ({filesList.length})
                    </h5>
                    {filesList.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Progress Indicator */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Required Documents</span>
                    <span className="text-sm text-blue-600">
                      {mappedRequiredDocs.length} / {requiredDocs.length}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${requiredDocs.length > 0 ? (mappedRequiredDocs.length / requiredDocs.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            {mappedRequiredDocs.length} of {requiredDocs.length} required documents uploaded
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