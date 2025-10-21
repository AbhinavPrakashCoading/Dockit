// Custom hook for upload workflow state management
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useExamData } from './useExamData';
import { WorkflowState } from '../types';

export const useUploadWorkflow = () => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedExamSchema, setSelectedExamSchema] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});
  const [processingProgress, setProcessingProgress] = useState(0);
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const {
    exams,
    popularExams,
    examsLoading,
    handleExamSelection: examDataSelection
  } = useExamData();

  // Filter exams based on search query
  const filteredExams = exams.filter(exam => {
    if (!workflowSearchQuery.trim()) return true;
    return (
      exam.name.toLowerCase().includes(workflowSearchQuery.toLowerCase()) ||
      exam.category.toLowerCase().includes(workflowSearchQuery.toLowerCase())
    );
  });

  // Enhanced exam selection with schema loading
  const handleExamSelection = useCallback(async (exam: any) => {
    console.log('🔍 Upload workflow selecting exam:', exam.name);
    console.log('📊 Exam has schema:', !!exam.schema);
    console.log('📄 Schema has documents:', !!exam.schema?.documents);
    console.log('🔢 Document count:', exam.schema?.documents?.length || 0);
    
    setSelectedExam(exam);
    setSchemaLoading(true);
    
    try {
      await examDataSelection(exam);
      
      // For parsed documents, the schema should already be available
      if (exam.schema) {
        console.log('✅ Using exam schema directly');
        console.log('📋 Setting schema with documents:', exam.schema.documents?.length || 0);
        setSelectedExamSchema(exam.schema);
      } else {
        console.log('⚠️ No schema found in exam object');
        setSelectedExamSchema(null);
      }
    } catch (error) {
      console.error('❌ Error loading exam schema:', error);
      setSelectedExamSchema(null);
    } finally {
      setSchemaLoading(false);
      console.log('🏁 Schema loading complete');
    }
  }, [examDataSelection]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFilesSelected(files);
  }, []);

  // File selection handler
  const handleFilesSelected = useCallback((files: File[]) => {
    const newFiles: { [key: string]: File } = {};
    files.forEach(file => {
      newFiles[file.name] = file;
    });
    setUploadedFiles(prev => ({ ...prev, ...newFiles }));
  }, []);

  // Workflow control functions
  const startWorkflow = useCallback((step: string = 'exam-selector') => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep === 'exam-selector') {
      setCurrentStep('upload');
    } else if (currentStep === 'upload') {
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      setCurrentStep('processing');
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep === 'upload') {
      setCurrentStep('exam-selector');
    } else if (currentStep === 'review') {
      setCurrentStep('upload');
    } else if (currentStep === 'processing') {
      setCurrentStep('review');
    }
  }, [currentStep]);

  const resetWorkflow = useCallback(() => {
    setCurrentStep(null);
    setSelectedExam(null);
    setSelectedExamSchema(null);
    setUploadedFiles({});
    setProcessingProgress(0);
    setWorkflowSearchQuery('');
    setDragOver(false);
  }, []);

  // Start processing workflow
  const startProcessing = useCallback(() => {
    setCurrentStep('processing');
    setProcessingProgress(0);

    // Simulate processing progress
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep('validation'), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  }, []);

  const workflowState: WorkflowState = {
    currentStep,
    selectedExam,
    selectedExamSchema,
    schemaLoading,
    uploadedFiles,
    processingProgress,
    workflowSearchQuery
  };

  return {
    // State
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
    workflowState,

    // Actions
    setCurrentStep,
    setSelectedExam,
    setSelectedExamSchema,
    setUploadedFiles,
    setWorkflowSearchQuery,
    setDragOver,
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
  };
};