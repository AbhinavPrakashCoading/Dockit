// Custom hook for exam data and schema management - ONLY PARSED DOCUMENTS
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExamConfig } from '../types';
import { getExamIcon, getExamColor, loadParsedDocuments, getExamSchema, searchExams } from '@/features/exam/optimizedExamRegistry';

export const useExamData = () => {
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [popularExamsData, setPopularExamsData] = useState<any[]>([]);
  const [dynamicExams, setDynamicExams] = useState<ExamConfig[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedExamSchema, setSelectedExamSchema] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [filteredExams, setFilteredExams] = useState<any[]>([]);

  // Load only parsed documents from data folder
  useEffect(() => {
    const initializeParsedDocuments = async () => {
      setExamsLoading(true);
      
      try {
        console.log('🔄 Loading parsed documents only...');
        
        // Load parsed documents using imported function
        const parsedDocuments = await loadParsedDocuments();
        
        console.log(`📄 Loaded ${parsedDocuments.length} parsed documents`);
        
        // If no documents from API, use fallback for testing
        if (parsedDocuments.length === 0) {
          console.log('⚠️ No parsed documents found, creating fallback exam for testing...');
          // Create a fallback exam for testing
          const fallbackExam = {
            id: "jee-mains-2025-fallback",
            name: "JEE Mains 2025 (Test Mode)",
            category: "Engineering",
            logo: getExamIcon("jee"),
            color: getExamColor("jee"),
            hasSchema: true,
            isSchemaLoaded: true,
            schema: {
              exam: "JEE Mains 2025",
              documents: [
                { type: "Photo", requirements: { mandatory: true } },
                { type: "Signature", requirements: { mandatory: true } },
                { type: "ID Proof", requirements: { mandatory: true } },
                { type: "Class 10th Marksheet", requirements: { mandatory: true } },
                { type: "Class 12th Marksheet", requirements: { mandatory: true } },
                { type: "Category Certificate", requirements: { mandatory: false } },
                { type: "PwD Certificate", requirements: { mandatory: false } }
              ]
            },
            source: 'fallback',
            requiredDocuments: ["Photo", "Signature", "ID Proof", "Class 10th Marksheet", "Class 12th Marksheet", "Category Certificate", "PwD Certificate"],
            documentCount: 7,
            confidence: 1
          };
          
          console.log('✅ Using fallback exam for testing');
          setAvailableExams([fallbackExam]);
          setPopularExamsData([fallbackExam]);
          setDynamicExams([fallbackExam] as any);
          return;
        }
        
        // Convert parsed documents to exam format
        const parsedExams = parsedDocuments.map((doc: any) => ({
          id: doc.id,
          name: doc.examName,
          category: doc.examType || 'Parsed',
          logo: getExamIcon(doc.examType || doc.examName),
          color: getExamColor(doc.examType || doc.examName),
          hasSchema: true,
          isSchemaLoaded: true,
          schema: doc.parsedJson,
          source: 'parsed-document',
          requiredDocuments: doc.parsedJson?.documents?.map((d: any) => d.type) || [],
          documentCount: doc.documentCount || doc.parsedJson?.documents?.length || 0,
          confidence: doc.confidence || 1,
          createdAt: doc.createdAt,
          originalText: doc.originalText
        }));
        
        console.log(`✅ Converted ${parsedExams.length} parsed exams`);
        
        setAvailableExams(parsedExams);
        setPopularExamsData(parsedExams); // All parsed docs are "popular"
        setDynamicExams(parsedExams as any);
        
      } catch (error) {
        console.error('❌ Error loading parsed documents:', error);
        console.log('🔄 Using fallback exam due to error...');
        
        // Use fallback on error
        const fallbackExam = {
          id: "jee-mains-2025-error-fallback",
          name: "JEE Mains 2025 (Offline Mode)",
          category: "Engineering",
          logo: getExamIcon("jee"),
          color: getExamColor("jee"),
          hasSchema: true,
          isSchemaLoaded: true,
          schema: {
            exam: "JEE Mains 2025",
            documents: [
              { type: "Photo", requirements: { mandatory: true } },
              { type: "Signature", requirements: { mandatory: true } },
              { type: "ID Proof", requirements: { mandatory: true } }
            ]
          },
          source: 'fallback-error',
          requiredDocuments: ["Photo", "Signature", "ID Proof"],
          documentCount: 3,
          confidence: 1
        };
        
        setAvailableExams([fallbackExam]);
        setPopularExamsData([fallbackExam]);
        setDynamicExams([fallbackExam]);
      } finally {
        setExamsLoading(false);
      }
    };

    initializeParsedDocuments();
  }, []);

  // Filter exams based on search query
  const filterExams = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFilteredExams([]);
      return;
    }

    try {
      // Use imported search function
      const searchResults = await searchExams(searchQuery);
      setFilteredExams(searchResults);
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
      console.log('🔄 Loading schema for exam:', exam.id, exam.name);
      
      // Use imported getExamSchema function
      if (exam.id) {
        const schema = await getExamSchema(exam.id);
        console.log('✅ Schema loaded successfully:', schema ? 'Found' : 'Not found');
        setSelectedExamSchema(schema || exam.schema);
      } else {
        console.log('⚠️ No exam ID, using existing schema');
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
      console.error('❌ Error loading schema:', error);
      console.log('🔄 Using fallback schema for:', exam.name);
      
      // Use exam's existing schema as fallback
      setSelectedExamSchema(exam.schema || {
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