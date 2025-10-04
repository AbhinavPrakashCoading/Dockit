/**
 * Exam Schema Addition Flow Demo Component
 * Interactive demonstration of adding new exam schemas to the system
 */

'use client';

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Upload, 
  Globe, 
  Eye, 
  Brain, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Code,
  Target,
  ArrowRight,
  ArrowLeft,
  Save,
  Settings,
  Zap,
  Database,
  Link,
  Search,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ExamBasicInfo {
  examName: string;
  organizationName: string;
  examType: string;
  applicationUrl: string;
  description: string;
  applicationDeadline: string;
  examDate: string;
}

interface DetectedField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'date' | 'file' | 'select' | 'checkbox' | 'radio' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    fileTypes?: string[];
    maxSize?: string;
  };
  helpText?: string;
}

interface DocumentRequirement {
  id: string;
  name: string;
  type: 'photo' | 'signature' | 'document' | 'certificate';
  required: boolean;
  specifications: {
    format: string[];
    maxSize: string;
    dimensions?: string;
    background?: string;
    quality?: string;
  };
  examples: string[];
  description: string;
}

interface SchemaPreview {
  examId: string;
  basicInfo: ExamBasicInfo;
  fields: DetectedField[];
  documentRequirements: DocumentRequirement[];
  confidence: number;
  complexity: string;
  estimatedCompletionTime: number;
}

type FlowStep = 'basic-info' | 'url-analysis' | 'field-definition' | 'document-requirements' | 'review' | 'success';

export function ExamSchemaAdditionDemo() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('basic-info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [basicInfo, setBasicInfo] = useState<ExamBasicInfo>({
    examName: '',
    organizationName: '',
    examType: '',
    applicationUrl: '',
    description: '',
    applicationDeadline: '',
    examDate: ''
  });
  
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const [schemaPreview, setSchemaPreview] = useState<SchemaPreview | null>(null);
  const [editingField, setEditingField] = useState<DetectedField | null>(null);
  const [editingDocument, setEditingDocument] = useState<DocumentRequirement | null>(null);

  const examTypes = [
    'Civil Services',
    'Banking',
    'Railway',
    'SSC',
    'Teaching',
    'Engineering',
    'Medical',
    'Defence',
    'State Government',
    'Other'
  ];

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File Upload' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' },
    { value: 'textarea', label: 'Text Area' }
  ];

  const documentTypes = [
    { value: 'photo', label: 'Photograph' },
    { value: 'signature', label: 'Signature' },
    { value: 'document', label: 'Document' },
    { value: 'certificate', label: 'Certificate' }
  ];

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAnalysisLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleStepNavigation = (step: FlowStep) => {
    setCurrentStep(step);
  };

  const analyzeUrl = async () => {
    if (!basicInfo.applicationUrl.trim()) {
      toast.error('Please enter a valid application URL');
      return;
    }

    setIsProcessing(true);
    addToLog('🌐 Starting URL analysis...');
    
    // Simulate URL analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    addToLog(`📡 Fetching page: ${basicInfo.applicationUrl}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    addToLog('🔍 Analyzing form structure...');
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    addToLog('🎯 Detecting form fields...');
    
    // Generate realistic detected fields
    const mockFields: DetectedField[] = [
      {
        id: 'full_name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name as per documents',
        validation: { minLength: 2, maxLength: 100 },
        helpText: 'Name should match your government ID'
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter valid email address',
        helpText: 'All communications will be sent to this email'
      },
      {
        id: 'mobile',
        label: 'Mobile Number',
        type: 'text',
        required: true,
        placeholder: '10-digit mobile number',
        validation: { pattern: '^[0-9]{10}$' },
        helpText: 'Enter mobile number without country code'
      },
      {
        id: 'dob',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        helpText: 'As per your birth certificate'
      },
      {
        id: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: ['General', 'OBC', 'SC', 'ST', 'EWS'],
        helpText: 'Select your category as per government norms'
      },
      {
        id: 'qualification',
        label: 'Educational Qualification',
        type: 'select',
        required: true,
        options: ['Graduate', 'Post Graduate', 'Diploma', 'XII Pass'],
        helpText: 'Highest educational qualification completed'
      }
    ];

    const mockDocuments: DocumentRequirement[] = [
      {
        id: 'photo',
        name: 'Passport Size Photograph',
        type: 'photo',
        required: true,
        specifications: {
          format: ['jpg', 'jpeg', 'png'],
          maxSize: '100KB',
          dimensions: '3.5cm x 4.5cm',
          background: 'White or light colored',
          quality: 'Recent photograph (within 6 months)'
        },
        examples: ['passport-photo-sample.jpg'],
        description: 'Clear, recent photograph with plain background'
      },
      {
        id: 'signature',
        name: 'Signature',
        type: 'signature',
        required: true,
        specifications: {
          format: ['jpg', 'jpeg', 'png'],
          maxSize: '50KB',
          dimensions: '3cm x 1cm',
          background: 'White background only',
          quality: 'Clear, legible signature'
        },
        examples: ['signature-sample.jpg'],
        description: 'Signature on white paper, scanned clearly'
      }
    ];

    setDetectedFields(mockFields);
    setDocumentRequirements(mockDocuments);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    addToLog(`✅ Analysis complete! Found ${mockFields.length} fields and ${mockDocuments.length} document requirements`);
    
    setIsProcessing(false);
    toast.success('URL analysis completed successfully!');
    
    setTimeout(() => {
      setCurrentStep('field-definition');
    }, 1000);
  };

  const addNewField = () => {
    const newField: DetectedField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      helpText: ''
    };
    setEditingField(newField);
  };

  const saveField = (field: DetectedField) => {
    if (detectedFields.find(f => f.id === field.id)) {
      setDetectedFields(prev => prev.map(f => f.id === field.id ? field : f));
    } else {
      setDetectedFields(prev => [...prev, field]);
    }
    setEditingField(null);
    toast.success('Field saved successfully!');
  };

  const deleteField = (fieldId: string) => {
    setDetectedFields(prev => prev.filter(f => f.id !== fieldId));
    toast.success('Field deleted successfully!');
  };

  const addNewDocument = () => {
    const newDocument: DocumentRequirement = {
      id: `doc_${Date.now()}`,
      name: '',
      type: 'document',
      required: false,
      specifications: {
        format: ['pdf'],
        maxSize: '2MB'
      },
      examples: [],
      description: ''
    };
    setEditingDocument(newDocument);
  };

  const saveDocument = (document: DocumentRequirement) => {
    if (documentRequirements.find(d => d.id === document.id)) {
      setDocumentRequirements(prev => prev.map(d => d.id === document.id ? document : d));
    } else {
      setDocumentRequirements(prev => [...prev, document]);
    }
    setEditingDocument(null);
    toast.success('Document requirement saved successfully!');
  };

  const deleteDocument = (documentId: string) => {
    setDocumentRequirements(prev => prev.filter(d => d.id !== documentId));
    toast.success('Document requirement deleted successfully!');
  };

  const generatePreview = () => {
    const preview: SchemaPreview = {
      examId: `${basicInfo.organizationName.toLowerCase().replace(/\s+/g, '-')}-${basicInfo.examName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      basicInfo,
      fields: detectedFields,
      documentRequirements,
      confidence: 85 + Math.random() * 15,
      complexity: detectedFields.length > 8 ? 'High' : detectedFields.length > 4 ? 'Medium' : 'Low',
      estimatedCompletionTime: Math.ceil((detectedFields.length * 1.5) + (documentRequirements.length * 2))
    };
    
    setSchemaPreview(preview);
    setCurrentStep('review');
  };

  const submitSchema = async () => {
    setIsProcessing(true);
    addToLog('💾 Saving exam schema...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    addToLog('✅ Schema saved successfully!');
    
    setIsProcessing(false);
    setCurrentStep('success');
    toast.success('Exam schema added successfully!');
  };

  const resetFlow = () => {
    setCurrentStep('basic-info');
    setBasicInfo({
      examName: '',
      organizationName: '',
      examType: '',
      applicationUrl: '',
      description: '',
      applicationDeadline: '',
      examDate: ''
    });
    setDetectedFields([]);
    setDocumentRequirements([]);
    setAnalysisLog([]);
    setSchemaPreview(null);
    setEditingField(null);
    setEditingDocument(null);
  };

  const getStepIcon = (step: FlowStep) => {
    switch (step) {
      case 'basic-info': return <FileText className="w-5 h-5" />;
      case 'url-analysis': return <Globe className="w-5 h-5" />;
      case 'field-definition': return <Settings className="w-5 h-5" />;
      case 'document-requirements': return <ImageIcon className="w-5 h-5" />;
      case 'review': return <Eye className="w-5 h-5" />;
      case 'success': return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const isStepCompleted = (step: FlowStep) => {
    switch (step) {
      case 'basic-info': 
        return basicInfo.examName && basicInfo.organizationName && basicInfo.applicationUrl;
      case 'url-analysis': 
        return detectedFields.length > 0;
      case 'field-definition': 
        return detectedFields.length > 0;
      case 'document-requirements': 
        return documentRequirements.length > 0;
      case 'review': 
        return schemaPreview !== null;
      case 'success': 
        return currentStep === 'success';
      default: 
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exam Schema Addition Flow</h1>
              <p className="text-gray-600">Interactive demo for adding new exam schemas to the system</p>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              {(['basic-info', 'url-analysis', 'field-definition', 'document-requirements', 'review', 'success'] as FlowStep[]).map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      currentStep === step
                        ? 'bg-blue-100 text-blue-700'
                        : isStepCompleted(step)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => (isStepCompleted(step) || step === 'basic-info') && handleStepNavigation(step)}
                  >
                    {getStepIcon(step)}
                    <span className="text-sm font-medium capitalize">{step.replace('-', ' ')}</span>
                    {isStepCompleted(step) && currentStep !== step && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  {index < 5 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold capitalize">{currentStep.replace('-', ' ')}</h2>
              </div>
              
              <div className="p-6">
                {/* Basic Info Step */}
                {currentStep === 'basic-info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Name *
                        </label>
                        <input
                          type="text"
                          value={basicInfo.examName}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, examName: e.target.value }))}
                          placeholder="e.g., Civil Services Examination 2024"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name *
                        </label>
                        <input
                          type="text"
                          value={basicInfo.organizationName}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, organizationName: e.target.value }))}
                          placeholder="e.g., Union Public Service Commission"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Type *
                        </label>
                        <select
                          value={basicInfo.examType}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, examType: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select exam type</option>
                          {examTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Application URL *
                        </label>
                        <input
                          type="url"
                          value={basicInfo.applicationUrl}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, applicationUrl: e.target.value }))}
                          placeholder="https://example.com/apply"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Application Deadline
                        </label>
                        <input
                          type="date"
                          value={basicInfo.applicationDeadline}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Date
                        </label>
                        <input
                          type="date"
                          value={basicInfo.examDate}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, examDate: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={basicInfo.description}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the exam..."
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => setCurrentStep('url-analysis')}
                        disabled={!basicInfo.examName || !basicInfo.organizationName || !basicInfo.applicationUrl}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next: Analyze URL
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* URL Analysis Step */}
                {currentStep === 'url-analysis' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">URL Analysis</h3>
                      <p className="text-sm text-blue-700">
                        We'll analyze the application form URL to automatically detect fields and requirements.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Form URL
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="url"
                          value={basicInfo.applicationUrl}
                          onChange={(e) => setBasicInfo(prev => ({ ...prev, applicationUrl: e.target.value }))}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isProcessing}
                        />
                        <button
                          onClick={analyzeUrl}
                          disabled={isProcessing || !basicInfo.applicationUrl.trim()}
                          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4" />
                              Analyze Form
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {detectedFields.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3">Analysis Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-medium">Fields Detected</span>
                            </div>
                            <p className="text-2xl font-bold text-green-900 mt-1">{detectedFields.length}</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-700">
                              <ImageIcon className="w-5 h-5" />
                              <span className="font-medium">Document Requirements</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{documentRequirements.length}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {detectedFields.length > 0 && (
                      <div className="flex justify-between">
                        <button
                          onClick={() => setCurrentStep('basic-info')}
                          className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                        <button
                          onClick={() => setCurrentStep('field-definition')}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Next: Review Fields
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Field Definition Step */}
                {currentStep === 'field-definition' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Form Fields ({detectedFields.length})</h3>
                      <button
                        onClick={addNewField}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Field
                      </button>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {detectedFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{index + 1}</span>
                              <div>
                                <h4 className="font-medium">{field.label || 'Untitled Field'}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="capitalize">{field.type}</span>
                                  {field.required && (
                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">Required</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingField(field)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteField(field.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {field.helpText && (
                            <p className="text-sm text-gray-600">{field.helpText}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep('url-analysis')}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep('document-requirements')}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Next: Document Requirements
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Document Requirements Step */}
                {currentStep === 'document-requirements' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Document Requirements ({documentRequirements.length})</h3>
                      <button
                        onClick={addNewDocument}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Document
                      </button>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {documentRequirements.map((doc, index) => (
                        <div key={doc.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{index + 1}</span>
                              <div>
                                <h4 className="font-medium">{doc.name || 'Untitled Document'}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="capitalize">{doc.type}</span>
                                  {doc.required && (
                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">Required</span>
                                  )}
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    {doc.specifications.maxSize}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingDocument(doc)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteDocument(doc.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-gray-600">{doc.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep('field-definition')}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={generatePreview}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Next: Review Schema
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Review Step */}
                {currentStep === 'review' && schemaPreview && (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Schema Preview</h3>
                      <p className="text-sm text-blue-700">
                        Review the complete exam schema before saving it to the system.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Confidence Score</div>
                        <div className="text-2xl font-bold">{Math.round(schemaPreview.confidence)}%</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Complexity</div>
                        <div className="text-2xl font-bold">{schemaPreview.complexity}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Est. Time</div>
                        <div className="text-2xl font-bold">{schemaPreview.estimatedCompletionTime}min</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Basic Information</h4>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          <div><strong>Exam:</strong> {schemaPreview.basicInfo.examName}</div>
                          <div><strong>Organization:</strong> {schemaPreview.basicInfo.organizationName}</div>
                          <div><strong>Type:</strong> {schemaPreview.basicInfo.examType}</div>
                          <div><strong>URL:</strong> {schemaPreview.basicInfo.applicationUrl}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Form Fields ({schemaPreview.fields.length})</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {schemaPreview.fields.map(field => (
                            <div key={field.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <span>{field.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 capitalize">{field.type}</span>
                                {field.required && (
                                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">Required</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Document Requirements ({schemaPreview.documentRequirements.length})</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {schemaPreview.documentRequirements.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <span>{doc.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 capitalize">{doc.type}</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {doc.specifications.maxSize}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep('document-requirements')}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={submitSchema}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Schema
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Step */}
                {currentStep === 'success' && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Schema Added Successfully!</h3>
                    <p className="text-gray-600 mb-6">
                      The exam schema has been added to the system and is now available for processing applications.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={resetFlow}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Schema
                      </button>
                      <button
                        onClick={() => {/* Navigate to schema list */}}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Database className="w-4 h-4" />
                        View All Schemas
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Analysis Log */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Process Log</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-h-64 overflow-y-auto">
                  {analysisLog.length === 0 ? (
                    <div className="text-gray-500">Process log will appear here...</div>
                  ) : (
                    analysisLog.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {(detectedFields.length > 0 || documentRequirements.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">Schema Stats</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Form Fields</span>
                    <span className="font-semibold">{detectedFields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Document Requirements</span>
                    <span className="font-semibold">{documentRequirements.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required Fields</span>
                    <span className="font-semibold">{detectedFields.filter(f => f.required).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Completion</span>
                    <span className="font-semibold">
                      {Math.ceil((detectedFields.length * 1.5) + (documentRequirements.length * 2))}min
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Field Edit Modal */}
        {editingField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {detectedFields.find(f => f.id === editingField.id) ? 'Edit Field' : 'Add Field'}
                </h3>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Label *</label>
                    <input
                      type="text"
                      value={editingField.label}
                      onChange={(e) => setEditingField(prev => prev ? { ...prev, label: e.target.value } : null)}
                      placeholder="Field label"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      value={editingField.type}
                      onChange={(e) => setEditingField(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
                    <input
                      type="text"
                      value={editingField.placeholder || ''}
                      onChange={(e) => setEditingField(prev => prev ? { ...prev, placeholder: e.target.value } : null)}
                      placeholder="Placeholder text"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={editingField.required}
                      onChange={(e) => setEditingField(prev => prev ? { ...prev, required: e.target.checked } : null)}
                      className="rounded"
                    />
                    <label htmlFor="required" className="ml-2 text-sm font-medium text-gray-700">
                      Required Field
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Help Text</label>
                  <textarea
                    rows={2}
                    value={editingField.helpText || ''}
                    onChange={(e) => setEditingField(prev => prev ? { ...prev, helpText: e.target.value } : null)}
                    placeholder="Help text for users"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {editingField.type === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options (comma separated)</label>
                    <input
                      type="text"
                      value={editingField.options?.join(', ') || ''}
                      onChange={(e) => setEditingField(prev => prev ? { 
                        ...prev, 
                        options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                      } : null)}
                      placeholder="Option 1, Option 2, Option 3"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editingField && saveField(editingField)}
                  disabled={!editingField?.label}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Field
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Edit Modal */}
        {editingDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {documentRequirements.find(d => d.id === editingDocument.id) ? 'Edit Document' : 'Add Document'}
                </h3>
                <button
                  onClick={() => setEditingDocument(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Name *</label>
                    <input
                      type="text"
                      value={editingDocument.name}
                      onChange={(e) => setEditingDocument(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="Document name"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      value={editingDocument.type}
                      onChange={(e) => setEditingDocument(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size</label>
                    <input
                      type="text"
                      value={editingDocument.specifications.maxSize}
                      onChange={(e) => setEditingDocument(prev => prev ? { 
                        ...prev, 
                        specifications: { ...prev.specifications, maxSize: e.target.value }
                      } : null)}
                      placeholder="e.g., 2MB, 500KB"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="docRequired"
                      checked={editingDocument.required}
                      onChange={(e) => setEditingDocument(prev => prev ? { ...prev, required: e.target.checked } : null)}
                      className="rounded"
                    />
                    <label htmlFor="docRequired" className="ml-2 text-sm font-medium text-gray-700">
                      Required Document
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Formats (comma separated)</label>
                  <input
                    type="text"
                    value={editingDocument.specifications.format.join(', ')}
                    onChange={(e) => setEditingDocument(prev => prev ? { 
                      ...prev, 
                      specifications: { 
                        ...prev.specifications, 
                        format: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                      }
                    } : null)}
                    placeholder="pdf, jpg, png"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={editingDocument.description}
                    onChange={(e) => setEditingDocument(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Document requirements and guidelines"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setEditingDocument(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editingDocument && saveDocument(editingDocument)}
                  disabled={!editingDocument?.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}