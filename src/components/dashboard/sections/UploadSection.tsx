// Upload Section Component
'use client';

import React from 'react';
import { Upload, Plus, FileText, Zap, Search } from 'lucide-react';
import { DashboardSectionProps } from '../types';
import { useUploadWorkflow } from '../hooks/useUploadWorkflow';
import UploadZone from '../components/UploadZone';
import ExamSelectorModal from '../components/WorkflowModals/ExamSelectorModal';
import UploadModal from '../components/WorkflowModals/UploadModal';
import ProcessingModal from '../components/WorkflowModals/ProcessingModal';

interface UploadSectionProps extends DashboardSectionProps {
  onFilesUploaded?: (files: File[]) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ 
  user, 
  onSectionChange,
  onFilesUploaded 
}) => {
  const {
    currentStep,
    selectedExam,
    selectedExamSchema,
    schemaLoading,
    uploadedFiles,
    processingProgress,
    workflowSearchQuery,
    dragOver,
    exams,
    popularExams,
    filteredExams,
    examsLoading,
    
    // Actions
    setWorkflowSearchQuery,
    handleExamSelection,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFilesSelected,
    startWorkflow,
    nextStep,
    previousStep,
    resetWorkflow,
    startProcessing
  } = useUploadWorkflow();

  const handleQuickUpload = (files: File[]) => {
    handleFilesSelected(files);
    if (onFilesUploaded) {
      onFilesUploaded(files);
    }
  };

  const handleWorkflowExamSelect = (exam: any) => {
    handleExamSelection(exam);
    nextStep(); // Move to upload step
  };

  const handleUploadNext = () => {
    if (Object.keys(uploadedFiles).length > 0) {
      startProcessing();
      if (onFilesUploaded) {
        onFilesUploaded(Object.values(uploadedFiles));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-1">
            Upload and process your documents with automated validation
          </p>
        </div>
        <button
          onClick={() => startWorkflow('exam-selector')}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Smart Upload
        </button>
      </div>

      {/* Quick Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Quick Upload</h3>
            <UploadZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onFilesSelected={handleQuickUpload}
              dragOver={dragOver}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Or use Smart Upload for guided document processing
              </p>
              <button
                onClick={() => startWorkflow('exam-selector')}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Choose exam type for better validation →
              </button>
            </div>
          </div>
        </div>

        {/* Upload Options */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold mb-3">Upload Options</h4>
            <div className="space-y-3">
              <button
                onClick={() => startWorkflow('exam-selector')}
                className="w-full p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">Smart Upload</p>
                    <p className="text-sm text-purple-700">Guided validation with exam schemas</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {/* Handle bulk upload */}}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <Upload className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Bulk Upload</p>
                    <p className="text-sm text-blue-700">Upload multiple files at once</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSectionChange('documents')}
                className="w-full p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-left transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">View Documents</p>
                    <p className="text-sm text-green-700">Manage uploaded documents</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Popular Exams Quick Access */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold mb-3">Popular Exams</h4>
            <div className="space-y-2">
              {popularExams.slice(0, 4).map(exam => (
                <button
                  key={exam.id}
                  onClick={() => {
                    handleExamSelection(exam);
                    startWorkflow('upload');
                  }}
                  className="w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${exam.color} rounded-lg flex items-center justify-center text-xs font-bold text-white`}>
                      {exam.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{exam.name}</p>
                      <p className="text-xs text-gray-500">{exam.category}</p>
                    </div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => startWorkflow('exam-selector')}
                className="w-full p-2 text-center text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                <div className="flex items-center justify-center space-x-1">
                  <Search className="w-4 h-4" />
                  <span>Browse all exams</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold mb-3">Upload Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium mb-1">Supported Formats</p>
            <p>PDF, JPG, JPEG, PNG</p>
          </div>
          <div>
            <p className="font-medium mb-1">File Size</p>
            <p>Maximum 10MB per file</p>
          </div>
          <div>
            <p className="font-medium mb-1">Quality</p>
            <p>Clear, high-resolution scans work best</p>
          </div>
        </div>
      </div>

      {/* Workflow Modals */}
      <ExamSelectorModal
        isOpen={currentStep === 'exam-selector'}
        onClose={resetWorkflow}
        onExamSelect={handleWorkflowExamSelect}
        searchQuery={workflowSearchQuery}
        onSearchChange={setWorkflowSearchQuery}
        exams={exams}
        popularExams={popularExams}
        filteredExams={filteredExams}
        examsLoading={examsLoading}
      />

      <UploadModal
        isOpen={currentStep === 'upload'}
        onClose={resetWorkflow}
        onBack={previousStep}
        onNext={handleUploadNext}
        selectedExam={selectedExam}
        uploadedFiles={uploadedFiles}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onFilesSelected={handleFilesSelected}
        dragOver={dragOver}
      />

      <ProcessingModal
        isOpen={currentStep === 'processing'}
        onClose={resetWorkflow}
      />
    </div>
  );
};

export default UploadSection;