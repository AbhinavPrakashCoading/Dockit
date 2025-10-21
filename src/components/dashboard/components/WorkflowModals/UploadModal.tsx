// Enhanced Upload Modal Component with Document Mapping
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, FileText, Check, AlertTriangle, Upload, Plus, Trash2, Eye, Download, ChevronDown } from 'lucide-react';
import UploadZone from '../UploadZone';

interface DocumentMapping {
  [requirementType: string]: File | null;
}

interface DocumentSubtype {
  id: string;
  label: string;
  description?: string;
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
  onDocumentMapping?: (mapping: { [key: string]: File }) => void;
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
  onDocumentMapping,
  dragOver
}) => {
  // State for document mapping and UI control
  const [documentMapping, setDocumentMapping] = useState<DocumentMapping>({});
  const [activeUploadRequirement, setActiveUploadRequirement] = useState<string | null>(null);
  const [unmappedFiles, setUnmappedFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<{[key: string]: string}>({});
  const [selectedSubtypes, setSelectedSubtypes] = useState<{[key: string]: string}>({});
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({});
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  if (!isOpen) return null;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const openDropdownKeys = Object.keys(openDropdowns).filter(key => openDropdowns[key]);
      
      for (const key of openDropdownKeys) {
        const dropdownElement = dropdownRefs.current[key];
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenDropdowns(prev => ({
            ...prev,
            [key]: false
          }));
        }
      }
    };

    if (Object.values(openDropdowns).some(isOpen => isOpen)) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdowns]);

  // Helper function to parse document type and extract subtypes
  const parseDocumentType = (docType: string): DocumentSubtype[] => {
    // Only create dropdown if there's actually a "/" in the document type name
    if (!docType.includes('/')) {
      return [];
    }

    // Split by forward slashes and create subtypes
    const parts = docType.split('/').map(part => part.trim());
    
    // Need at least 2 parts to create a dropdown
    if (parts.length < 2) {
      return [];
    }

    // Special handling for different patterns
    if (docType.includes('ID Proof')) {
      // For "ID Proof Aadhaar/Passport/Driving License/Voter ID/PAN Card"
      // First part might be "ID Proof Aadhaar", extract just the ID types
      const firstPart = parts[0];
      const baseType = firstPart.includes('ID Proof') ? firstPart.replace('ID Proof', '').trim() : firstPart;
      
      // Create array starting with the cleaned first part, then add rest
      const idTypes = baseType ? [baseType, ...parts.slice(1)] : parts;
      
      return idTypes.map((type, index) => ({
        id: `id_${index}`,
        label: type.trim(),
        description: `${type.trim()} document`
      }));
    } 
    
    if (docType.includes('Class') && (docType.includes('10th') || docType.includes('12th'))) {
      // For "Class 10th Marksheet/Pass Certificate" or "Class 12th Marksheet/Admit Card/Certificate"
      const classNumber = docType.includes('10th') ? '10th' : '12th';
      const firstPart = parts[0];
      const baseType = firstPart.includes('Class') ? firstPart.replace(/Class\s+\d+th\s*/, '').trim() : firstPart;
      
      // Create array starting with the cleaned first part, then add rest
      const certTypes = baseType ? [baseType, ...parts.slice(1)] : parts;
      
      return certTypes.map((type, index) => ({
        id: `class_${classNumber}_${index}`,
        label: type.trim(),
        description: `${classNumber} ${type.trim().toLowerCase()}`
      }));
    }
    
    // Generic handling for any other types with "/"
    return parts.map((type, index) => ({
      id: `subtype_${index}`,
      label: type.trim(),
      description: type.trim()
    }));
  };

  // Check if document type has multiple options (simplified - just check for "/")
  const hasMultipleOptions = (docType: string): boolean => {
    return docType.includes('/') && docType.split('/').length > 1;
  };

  // Get display name for document type (first option or custom name)
  const getDisplayName = (docType: string): string => {
    const selectedSubtype = selectedSubtypes[docType];
    if (selectedSubtype) {
      const subtypes = parseDocumentType(docType);
      const selected = subtypes.find(sub => sub.id === selectedSubtype);
      return selected?.label || docType;
    }

    // Extract base name for display
    if (docType.includes('ID Proof')) {
      return selectedSubtype ? selectedSubtype : 'ID Proof';
    } else if (docType.includes('Class 10th')) {
      return selectedSubtype ? selectedSubtype : 'Class 10th Certificate';
    } else if (docType.includes('Class 12th')) {
      return selectedSubtype ? selectedSubtype : 'Class 12th Certificate';
    } else if (docType.includes('Category Certificate')) {
      return selectedSubtype ? selectedSubtype : 'Category Certificate';
    } else if (docType.includes('PwD Certificate')) {
      return selectedSubtype ? selectedSubtype : 'PwD Certificate';
    }

    return docType;
  };

  // Handle subtype selection
  const handleSubtypeSelect = (docType: string, subtypeId: string) => {
    setSelectedSubtypes(prev => ({
      ...prev,
      [docType]: subtypeId
    }));
    setOpenDropdowns(prev => ({
      ...prev,
      [docType]: false
    }));
  };

  // Toggle dropdown
  const toggleDropdown = (docType: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [docType]: !prev[docType]
    }));
  };

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

  // Show all requirements (both required and optional)
  const filteredRequirements = documentRequirements;

  // Handle clicking on a requirement card to enable upload mode
  const handleRequirementClick = useCallback((requirementType: string) => {
    console.log('📋 Requirement card clicked - enabling upload for:', requirementType);
    setActiveUploadRequirement(requirementType);
    // Don't open file picker here - just set the active requirement
    // The right side upload zone will handle the actual file upload
  }, []);

  // Download utility function
  const downloadFile = useCallback((file: File, filename?: string) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`📥 Downloaded file: ${filename || file.name}`);
  }, []);

  // Handle file upload - when files are uploaded, map them to active requirement
  const handleFileUpload = useCallback(async (files: File[]) => {
    console.log('📤 Files uploaded:', files.length);
    
    if (activeUploadRequirement && files.length > 0) {
      const file = files[0];
      
      // Get the requirement for this document type
      const requirement = documentRequirements.find((req: any) => req.type === activeUploadRequirement);
      if (!requirement) {
        console.log('❌ No requirement found for:', activeUploadRequirement);
        setUploadErrors(prev => ({
          ...prev,
          [activeUploadRequirement]: 'Requirement definition not found'
        }));
        setActiveUploadRequirement(null);
        return;
      }

      
      // Basic validation
      const maxSizeKB = 5000; // 5MB limit for initial upload
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      
      // Validate file type first
      if (!allowedTypes.includes(file.type)) {
        console.log('❌ Invalid file type:', file.type);
        setUploadErrors(prev => ({
          ...prev,
          [activeUploadRequirement]: 'Invalid file type. Please upload JPEG, PNG, or PDF files only.'
        }));
        setActiveUploadRequirement(null);
        return;
      }
      
      // Smart compression feasibility check
      const targetMaxKB = getMaxSizeKB(requirement);
      const currentSizeKB = Math.round(file.size / 1024);
      const compressionRatio = currentSizeKB / targetMaxKB;
      
      console.log(`📊 Compression analysis: ${currentSizeKB}KB → ${targetMaxKB}KB (${compressionRatio.toFixed(1)}x compression needed)`);
      
      // Warn for extreme compression requirements but allow attempt
      if (compressionRatio > 10) {
        console.log(`⚠️ Extreme compression needed: ${compressionRatio.toFixed(1)}x`);
        // Could add a confirmation dialog here, but let's try the improved compression first
      }
      
      // Only reject if absolutely impossible (>50x compression for images, >20x for PDFs)
      const isImage = file.type.startsWith('image/');
      const maxAcceptableRatio = isImage ? 50 : 20;
      
      if (compressionRatio > maxAcceptableRatio) {
        console.log(`❌ Compression impossible: ${compressionRatio.toFixed(1)}x ratio needed`);
        const recommendation = getFileSizeRecommendation(requirement);
        const errorMessage = `File too large for compression (${compressionRatio.toFixed(1)}x reduction needed). Current: ${currentSizeKB}KB, Target: ${targetMaxKB}KB. Recommended max: ${recommendation.recommendedMaxKB}KB. ${recommendation.tips.join(', ')}.`;
        setUploadErrors(prev => ({
          ...prev,
          [activeUploadRequirement]: errorMessage
        }));
        setActiveUploadRequirement(null);
        return;
      }
      
      // Validate initial upload size (prevent huge files from even starting)
      if (file.size > maxSizeKB * 1024) {
        console.log('❌ File too large for upload:', file.size);
        setUploadErrors(prev => ({
          ...prev,
          [activeUploadRequirement]: `File size too large (max ${maxSizeKB}KB for upload)`
        }));
        setActiveUploadRequirement(null);
        return;
      }

      // File validation passed - store original file for processing later
      console.log('✅ File validation passed. Storing for processing:', {
        fileName: file.name,
        requirementType: activeUploadRequirement,
        originalSize: formatFileSize(file.size),
        targetSize: `${targetMaxKB}KB`,
        compressionNeeded: `${compressionRatio.toFixed(1)}x`
      });

      // Clear any previous errors and map the original file (will be processed in ProcessingModal)
      setUploadErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[activeUploadRequirement];
        return newErrors;
      });
      
      // Store the original file - transformation will happen in ProcessingModal
      handleFileMapping(activeUploadRequirement, file);
      setActiveUploadRequirement(null);
    } else {
      // Call the original onFilesSelected for general uploads
      onFilesSelected(files);
    }
  }, [activeUploadRequirement, onFilesSelected, documentRequirements]);

  // Helper functions to extract requirements from schema
  const getRequiredFormat = (requirement: any) => {
    const formats = requirement.requirements?.format || requirement.format;
    if (Array.isArray(formats)) {
      // Convert to MIME type
      const format = formats[0].toLowerCase();
      if (format.includes('jpg') || format.includes('jpeg')) return 'image/jpeg';
      if (format.includes('png')) return 'image/png';
      if (format.includes('pdf')) return 'application/pdf';
    }
    return 'image/jpeg'; // default
  };

  const getMaxSizeKB = (requirement: any) => {
    const maxSize = requirement.requirements?.maxSize || requirement.maxSize;
    if (typeof maxSize === 'string') {
      // Parse size like "200 KB"
      const match = maxSize.match(/(\d+)\s*KB/i);
      if (match) return parseInt(match[1]);
    }
    if (typeof maxSize === 'number') return maxSize;
    return 1024; // default 1MB
  };

  // Get file size recommendations based on requirement
  const getFileSizeRecommendation = (requirement: any) => {
    const targetKB = getMaxSizeKB(requirement);
    const type = requirement.type || 'document';
    
    // Recommend file sizes that work well with compression
    let recommendedMaxKB = targetKB * 5; // 5x target for good compression
    let tips: string[] = [];
    
    if (type.toLowerCase().includes('photo')) {
      recommendedMaxKB = Math.min(targetKB * 8, 2000); // Max 2MB for photos
      tips = [
        'Use JPEG format for photos',
        'Reduce camera resolution before taking photo',
        'Crop to show only required area'
      ];
    } else if (type.toLowerCase().includes('signature')) {
      recommendedMaxKB = Math.min(targetKB * 10, 500); // Max 500KB for signatures
      tips = [
        'Use black ink on white paper',
        'Scan/photo in good lighting',
        'Crop closely around signature'
      ];
    } else if (type.toLowerCase().includes('id') || type.toLowerCase().includes('certificate')) {
      recommendedMaxKB = Math.min(targetKB * 6, 3000); // Max 3MB for documents
      tips = [
        'Scan in PDF format if possible',
        'Use 300 DPI for documents',
        'Ensure text is clearly readable'
      ];
    }
    
    return {
      recommendedMaxKB: Math.round(recommendedMaxKB),
      targetKB,
      tips
    };
  };

  // Handle mapping a file to a specific requirement
  const handleFileMapping = useCallback((requirementType: string, file: File) => {
    console.log('🔗 Mapping file to requirement:', { requirementType, fileName: file.name });
    const newMapping = {
      ...documentMapping,
      [requirementType]: file
    };
    setDocumentMapping(newMapping);
    
    // Notify parent component about the mapping update
    if (onDocumentMapping) {
      // Filter out null values before passing to parent
      const validMapping: { [key: string]: File } = {};
      Object.entries(newMapping).forEach(([key, file]) => {
        if (file) validMapping[key] = file;
      });
      onDocumentMapping(validMapping);
    }
    
    // Remove from unmapped files if it was there
    setUnmappedFiles(prev => prev.filter(f => f.name !== file.name));
  }, [documentMapping, onDocumentMapping]);

  // Handle removing a mapped file
  const handleRemoveMapping = useCallback((requirementType: string) => {
    console.log('🗑️ Removing mapping for:', requirementType);
    const file = documentMapping[requirementType];
    if (file) {
      setUnmappedFiles(prev => [...prev, file]);
    }
    const newMapping = { ...documentMapping };
    delete newMapping[requirementType];
    setDocumentMapping(newMapping);
    
    // Notify parent component about the mapping update
    if (onDocumentMapping) {
      // Filter out null values before passing to parent
      const validMapping: { [key: string]: File } = {};
      Object.entries(newMapping).forEach(([key, file]) => {
        if (file) validMapping[key] = file;
      });
      onDocumentMapping(validMapping);
    }
  }, [documentMapping, onDocumentMapping]);

  // Check if we can proceed (all required documents mapped)
  const requiredDocs = documentRequirements.filter((doc: any) => 
    doc.requirements?.mandatory || doc.required || false
  );
  const mappedRequiredDocs = requiredDocs.filter((doc: any) => 
    documentMapping[doc.type]
  );
  const canProceed = mappedRequiredDocs.length === requiredDocs.length;

  // Handle file preview
  const handleFilePreview = useCallback((file: File) => {
    console.log('👁️ Previewing file:', file.name);
    // Create a blob URL for the file
    const url = URL.createObjectURL(file);
    
    // Open in new window/tab based on file type
    if (file.type.startsWith('image/')) {
      // For images, create a simple preview window
      const img = new Image();
      img.onload = () => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Preview: ${file.name}</title></head>
              <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#f0f0f0;">
                <img src="${url}" style="max-width:100%;max-height:100%;object-fit:contain;" />
              </body>
            </html>
          `);
        }
      };
      img.src = url;
    } else {
      // For PDFs and other files, open directly
      window.open(url, '_blank');
    }
  }, []);

  // Get requirement status
  const getRequirementStatus = (requirementType: string, isRequired: boolean) => {
    const hasMappedFile = !!documentMapping[requirementType];
    const hasError = !!uploadErrors[requirementType];
    
    if (hasError) return 'failed';
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
            {/* Left Column - Document Type Selector */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Document Type</h3>
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
                              ? 'border-green-300 bg-green-50 hover:border-green-400'
                              : status === 'failed'
                              ? 'border-red-300 bg-red-50 hover:border-red-400'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          } ${activeUploadRequirement === doc.type ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                status === 'completed'
                                  ? 'bg-green-100'
                                  : status === 'failed'
                                  ? 'bg-red-100'
                                  : 'bg-gray-100'
                              }`}>
                                <span className="text-sm">{getRequirementIcon(doc.type)}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {hasMultipleOptions(doc.type) ? (
                                    <div 
                                      className="relative flex-1"
                                      ref={(el) => { dropdownRefs.current[doc.type] = el; }}
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleDropdown(doc.type);
                                        }}
                                        className="flex items-center justify-between w-full font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded border text-left"
                                      >
                                        <span className="capitalize">{getDisplayName(doc.type)}</span>
                                        <ChevronDown 
                                          size={16} 
                                          className={`transition-transform ${openDropdowns[doc.type] ? 'rotate-180' : ''}`}
                                        />
                                      </button>
                                      
                                      {openDropdowns[doc.type] && (
                                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                          {parseDocumentType(doc.type).map((subtype) => (
                                            <button
                                              key={subtype.id}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleSubtypeSelect(doc.type, subtype.id);
                                              }}
                                              className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                                selectedSubtypes[doc.type] === subtype.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                              }`}
                                            >
                                              <div className="font-medium">{subtype.label}</div>
                                              {subtype.description && (
                                                <div className="text-sm text-gray-500">{subtype.description}</div>
                                              )}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <h4 className="font-medium text-gray-900 capitalize">{doc.type}</h4>
                                  )}
                                  
                                  {status === 'completed' && (
                                    <Check className="w-4 h-4 text-green-600" />
                                  )}
                                  {status === 'failed' && (
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
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
                                            downloadFile(mappedFile, `${doc.type}_${mappedFile.name}`);
                                          }}
                                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                                          title="Download file"
                                        >
                                          <Download size={16} />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleFilePreview(mappedFile);
                                          }}
                                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                          title="Preview file"
                                        >
                                          <Eye size={16} />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMapping(doc.type);
                                          }}
                                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                                          title="Remove file"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Show error message */}
                                {uploadErrors[doc.type] && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                    <div className="flex items-center gap-2 text-red-700">
                                      <AlertTriangle size={16} />
                                      <span className="text-sm font-medium">Upload Failed</span>
                                    </div>
                                    <p className="text-xs text-red-600 mt-1">{uploadErrors[doc.type]}</p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUploadErrors(prev => {
                                          const newErrors = { ...prev };
                                          delete newErrors[doc.type];
                                          return newErrors;
                                        });
                                      }}
                                      className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                                    >
                                      Clear error and try again
                                    </button>
                                  </div>
                                )}
                                
                                {/* Upload prompt when no file mapped and no error */}
                                {!mappedFile && !uploadErrors[doc.type] && (
                                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                                    <div className={`w-4 h-4 rounded-full ${activeUploadRequirement === doc.type ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                    <span>
                                      {activeUploadRequirement === doc.type 
                                        ? 'Upload zone is ready for this document'
                                        : 'Click to enable upload for this document'
                                      }
                                    </span>
                                  </div>
                                )}
                                
                                <div className="text-sm text-gray-600 mt-2 space-y-1">
                                  {doc.requirements?.format && (
                                    <p>📄 Format: {Array.isArray(doc.requirements.format) 
                                      ? doc.requirements.format.join(', ') 
                                      : doc.requirements.format}</p>
                                  )}
                                  {doc.requirements?.size_kb && (
                                    <p>📏 Size: {doc.requirements.size_kb.min}KB - {doc.requirements.size_kb.max}KB</p>
                                  )}
                                  {doc.requirements?.dimensions && (
                                    <p>📐 Dimensions: {doc.requirements.dimensions}</p>
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
                    <p className="text-xs">Use general upload on the right</p>
                  </div>
                )}
              </div>
              
              {/* Progress Summary */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Upload Progress</span>
                  <span className="text-sm text-blue-600">
                    {mappedRequiredDocs.length} / {requiredDocs.length} required
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${requiredDocs.length > 0 ? (mappedRequiredDocs.length / requiredDocs.length) * 100 : 0}%` }}
                  />
                </div>
                {Object.keys(documentMapping).length > 0 && (
                  <div className="mt-3 text-xs text-gray-600">
                    ✅ {Object.keys(documentMapping).length} document{Object.keys(documentMapping).length !== 1 ? 's' : ''} uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Document Upload Area */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
                
                {/* Active Upload Indicator */}
                {activeUploadRequirement && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="font-medium">
                        Upload zone active for: <span className="capitalize">{activeUploadRequirement}</span>
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Upload files below and they will be automatically mapped to this document type
                    </p>
                  </div>
                )}
                
                {/* Upload Zone */}
                <UploadZone
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onFilesSelected={handleFileUpload}
                  dragOver={dragOver}
                />
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {activeUploadRequirement 
                    ? `Files will be mapped to: ${activeUploadRequirement}`
                    : 'Select document type from left panel first'
                  }
                </p>
              </div>

              {/* Uploaded Documents Display */}
              {Object.keys(documentMapping).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                  <div className="space-y-3">
                    {Object.entries(documentMapping).map(([type, file]) => (
                      <div key={type} className="border rounded-lg p-3 bg-green-50 border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">{getRequirementIcon(type)}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-gray-900 capitalize">{type}</h5>
                                <Check className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FileText className="w-4 h-4" />
                                <span className="font-medium">{file?.name}</span>
                                <span className="text-xs">({formatFileSize(file?.size || 0)})</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (file) downloadFile(file, `${type}_${file.name}`);
                              }}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Download file"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (file) handleFilePreview(file);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Preview file"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMapping(type);
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Remove file"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Files (if any) */}
              {filesList.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">General Uploads</h4>
                  <div className="space-y-2">
                    {filesList.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadFile(file)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Download file"
                          >
                            <Download size={16} />
                          </button>
                          <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                            Unmapped
                          </div>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-orange-600 mt-2">
                      💡 Tip: Select document type from left panel to properly categorize these files
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            {mappedRequiredDocs.length} of {requiredDocs.length} required documents uploaded
          </div>
          <div className="flex items-center space-x-3">
            {Object.keys(documentMapping).length > 0 && (
              <button
                onClick={() => {
                  Object.entries(documentMapping).forEach(([type, file]) => {
                    if (file) {
                      setTimeout(() => downloadFile(file, `${type}_${file.name}`), 100);
                    }
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download size={16} />
                Download All
              </button>
            )}
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