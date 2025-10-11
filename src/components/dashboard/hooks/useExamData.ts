// Custom hook for exam data and schema management
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExamConfig } from '../types';

// Legacy exams fallback data
const legacyExams = [
  { 
    id: 'upsc', 
    name: 'UPSC', 
    category: 'Civil Services', 
    logo: '🏛️', 
    color: 'bg-blue-100 text-blue-600',
    hasSchema: true,
    requiredDocuments: ['photo', 'signature', 'idProof', 'ageProof']
  },
  { 
    id: 'ssc', 
    name: 'SSC', 
    category: 'Government', 
    logo: '📋', 
    color: 'bg-green-100 text-green-600',
    hasSchema: true,
    requiredDocuments: ['photo', 'signature', 'idProof', 'ageProof']
  },
  { 
    id: 'ielts', 
    name: 'IELTS', 
    category: 'Language', 
    logo: '🌐', 
    color: 'bg-purple-100 text-purple-600',
    hasSchema: true,
    requiredDocuments: ['photo', 'signature', 'idProof']
  },
  { 
    id: 'ibps-po', 
    name: 'IBPS PO', 
    category: 'Banking', 
    logo: '🏦', 
    color: 'bg-indigo-100 text-indigo-600',
    hasSchema: true,
    requiredDocuments: ['photo', 'signature', 'idProof', 'educationCertificate']
  }
];

export const useExamData = () => {
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [popularExamsData, setPopularExamsData] = useState<any[]>([]);
  const [dynamicExams, setDynamicExams] = useState<ExamConfig[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedExamSchema, setSelectedExamSchema] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [filteredExams, setFilteredExams] = useState<any[]>([]);

  // Load optimized exams on component mount
  useEffect(() => {
    const loadExams = async () => {
      // Set examsLoading to false immediately to prevent blocking
      setExamsLoading(false);
      
      // Use fallback data immediately for fast loading
      setAvailableExams(legacyExams);
      setPopularExamsData(legacyExams.slice(0, 4));
      setDynamicExams(legacyExams as any);

      // Load real data in background if available
      try {
        const examRegistry = await import('@/features/exam/optimizedExamRegistry').catch(() => null);
        const dynamicLoader = await import('@/lib/dynamicSchemaLoader').catch(() => null);
        
        if (examRegistry?.getExamsWithSchemaStatus && examRegistry?.getPopularExams) {
          // Load optimized exam data in background
          const [examsWithStatus, popularExams] = await Promise.all([
            examRegistry.getExamsWithSchemaStatus(),
            examRegistry.getPopularExams(8)
          ]);
          
          setAvailableExams(examsWithStatus);
          setPopularExamsData(popularExams);
        }
        
        if (dynamicLoader?.loadAvailableExams) {
          // Load dynamic exams in background
          const loadedExams = await dynamicLoader.loadAvailableExams();
          setDynamicExams(loadedExams);
        }
      } catch (error) {
        console.log('Background exam loading failed, using fallback data');
        // Keep using fallback data
      }
    };

    loadExams();
  }, []);

  // Filter exams based on search query
  const filterExams = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFilteredExams([]);
      return;
    }

    try {
      // Try to use search functionality from exam registry
      const examRegistry = await import('@/features/exam/optimizedExamRegistry').catch(() => null);
      
      if (examRegistry?.searchExams) {
        const searchResults = await examRegistry.searchExams(searchQuery);
        setFilteredExams(searchResults);
      } else {
        // Fallback to local filtering
        const allExams = availableExams.length > 0 ? availableExams : dynamicExams;
        const localFiltered = allExams
          .filter(exam => exam.hasSchema || exam.schema)
          .filter(exam =>
            exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exam.category.toLowerCase().includes(searchQuery.toLowerCase())
          );
        setFilteredExams(localFiltered);
      }
    } catch (error) {
      console.error('Error filtering exams:', error);
      // Basic local filtering as final fallback
      const allExams = availableExams.length > 0 ? availableExams : dynamicExams;
      const localFiltered = allExams.filter(exam =>
        exam.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExams(localFiltered);
    }
  }, [availableExams, dynamicExams]);

  // Handle exam selection with schema loading
  const handleExamSelection = useCallback(async (exam: any) => {
    setSelectedExam(exam);
    setSchemaLoading(true);
    
    try {
      // Try to load schema from exam registry
      const examRegistry = await import('@/features/exam/optimizedExamRegistry').catch(() => null);
      
      if (examRegistry?.getExamSchema && exam.id) {
        const schema = await examRegistry.getExamSchema(exam.id);
        setSelectedExamSchema(schema);
      } else {
        // Use exam's existing schema or create a basic one
        setSelectedExamSchema(exam.schema || {
          examId: exam.id,
          examName: exam.name,
          requirements: exam.requiredDocuments?.map((doc: string) => ({
            id: doc,
            name: doc,
            required: true
          })) || []
        });
      }
    } catch (error) {
      console.error('Error loading schema:', error);
      // Basic fallback schema
      setSelectedExamSchema({
        examId: exam.id,
        examName: exam.name,
        requirements: [
          { id: 'photo', name: 'Passport Photo', required: true },
          { id: 'signature', name: 'Signature', required: true }
        ]
      });
    } finally {
      setSchemaLoading(false);
    }
  }, []);

  // Use optimized exams if available, fallback to dynamic exams
  const exams = availableExams.length > 0 ? availableExams : dynamicExams;

  // Popular exams (use optimized data if available)
  const popularExams = popularExamsData.length > 0 
    ? popularExamsData 
    : exams.filter(exam => exam.hasSchema || exam.schema).slice(0, 4);

  return {
    exams,
    popularExams,
    filteredExams,
    examsLoading,
    selectedExam,
    selectedExamSchema,
    schemaLoading,
    availableExams,
    popularExamsData,
    dynamicExams,
    handleExamSelection,
    filterExams,
    setSelectedExam,
    setSelectedExamSchema
  };
};