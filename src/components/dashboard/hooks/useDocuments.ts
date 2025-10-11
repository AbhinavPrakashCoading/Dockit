// Custom hook for document management
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Document, ViewMode } from '../types';

export const useDocuments = (documents: Document[]) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Filter documents based on search and filter
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        doc.examType.toLowerCase().includes(query) ||
        doc.status.toLowerCase().includes(query)
      );
    }

    // Apply status/type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(doc => 
        doc.status === selectedFilter || 
        doc.examType === selectedFilter
      );
    }

    return filtered;
  }, [documents, searchQuery, selectedFilter]);

  // Handle individual document selection
  const handleDocumentSelect = useCallback((doc: Document) => {
    setSelectedDocuments(prev => {
      if (prev.includes(doc.id)) {
        return prev.filter(id => id !== doc.id);
      } else {
        return [...prev, doc.id];
      }
    });
  }, []);

  // Handle select all toggle
  const handleSelectAll = useCallback(() => {
    if (selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  }, [selectedDocuments.length, filteredDocuments]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedDocuments([]);
  }, []);

  // Get selected document objects
  const getSelectedDocuments = useCallback(() => {
    return documents.filter(doc => selectedDocuments.includes(doc.id));
  }, [documents, selectedDocuments]);

  // Filter documents by status
  const getDocumentsByStatus = useCallback((status: string) => {
    return documents.filter(doc => doc.status === status);
  }, [documents]);

  // Get documents by exam type
  const getDocumentsByExamType = useCallback((examType: string) => {
    return documents.filter(doc => doc.examType === examType);
  }, [documents]);

  // Search in specific fields
  const searchDocuments = useCallback((query: string, fields: string[] = ['name', 'examType']) => {
    if (!query.trim()) return documents;
    
    const searchTerm = query.toLowerCase();
    return documents.filter(doc => {
      return fields.some(field => {
        const value = doc[field as keyof Document];
        return value && String(value).toLowerCase().includes(searchTerm);
      });
    });
  }, [documents]);

  // Sort documents
  const sortDocuments = useCallback((sortBy: 'name' | 'date' | 'status' | 'examType', order: 'asc' | 'desc' = 'asc') => {
    return [...filteredDocuments].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.uploadDate).getTime();
          bValue = new Date(b.uploadDate).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'examType':
          aValue = a.examType;
          bValue = b.examType;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDocuments]);

  // Statistics
  const documentStats = useMemo(() => {
    const total = documents.length;
    const validated = documents.filter(d => d.status === 'validated').length;
    const processing = documents.filter(d => ['processing', 'enhancing'].includes(d.status)).length;
    const failed = documents.filter(d => d.status === 'failed').length;
    const pending = documents.filter(d => d.status === 'pending').length;
    
    return {
      total,
      validated,
      processing,
      failed,
      pending,
      validationRate: total > 0 ? Math.round((validated / total) * 100) : 0
    };
  }, [documents]);

  return {
    // State
    viewMode,
    searchQuery,
    selectedFilter,
    selectedDocuments,
    filteredDocuments,
    documentStats,
    
    // Setters
    setViewMode,
    setSearchQuery,
    setSelectedFilter,
    setSelectedDocuments,
    
    // Actions
    handleDocumentSelect,
    handleSelectAll,
    clearSelection,
    
    // Utilities
    getSelectedDocuments,
    getDocumentsByStatus,
    getDocumentsByExamType,
    searchDocuments,
    sortDocuments
  };
};