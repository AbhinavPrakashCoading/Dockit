// Documents Section Component
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  CheckSquare,
  Square,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { DashboardSectionProps, Document, ViewMode } from '../types';
import { useDocuments } from '../hooks/useDocuments';
import DocumentCard from '../components/DocumentCard';

interface DocumentsSectionProps extends DashboardSectionProps {
  documents?: Document[];
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ 
  user, 
  onSectionChange,
  documents = []
}) => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    selectedDocuments,
    setSelectedDocuments,
    filteredDocuments,
    handleDocumentSelect,
    handleSelectAll,
    clearSelection
  } = useDocuments(documents);

  const [showBulkActions, setShowBulkActions] = useState(false);

  // Get unique exam types for filter dropdown
  const examTypes = useMemo(() => {
    const types = new Set(documents.map(doc => doc.examType));
    return Array.from(types);
  }, [documents]);

  // Document action handlers
  const handleViewDocument = (doc: Document) => {
    console.log('View document:', doc);
    // Implement view logic
  };

  const handleDownloadDocument = (doc: Document) => {
    console.log('Download document:', doc);
    // Implement download logic
  };

  const handleEditDocument = (doc: Document) => {
    console.log('Edit document:', doc);
    // Implement edit logic
  };

  const handleDeleteDocument = (doc: Document) => {
    console.log('Delete document:', doc);
    // Implement delete logic
  };

  // Bulk action handlers
  const handleBulkDownload = () => {
    console.log('Bulk download:', selectedDocuments);
    // Implement bulk download
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete:', selectedDocuments);
    // Implement bulk delete
  };

  const getStatusCounts = () => {
    return {
      total: documents.length,
      validated: documents.filter(d => d.status === 'validated').length,
      processing: documents.filter(d => ['processing', 'enhancing'].includes(d.status)).length,
      failed: documents.filter(d => d.status === 'failed').length,
      pending: documents.filter(d => d.status === 'pending').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your {user.isAuthenticated ? 'uploaded' : 'session'} documents.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter and View Mode - Group on smaller screens */}
          <div className="flex items-center gap-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              {examTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => onSectionChange('upload')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Status Overview */}
      {documents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{statusCounts.validated}</div>
            <div className="text-sm text-gray-600">Validated</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.processing}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{statusCounts.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedDocuments.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-purple-900">
                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
              </div>
              <button
                onClick={clearSelection}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDownload}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All Option for List View */}
      {documents.length > 0 && viewMode === 'list' && (
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0 ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>
              {selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0
                ? 'Deselect all'
                : 'Select all'
              }
            </span>
          </button>
          <div className="text-sm text-gray-500">
            {filteredDocuments.length} result{filteredDocuments.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        </div>
      )}

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {documents.length === 0 ? 'No documents yet' : 'No documents found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {documents.length === 0 
              ? 'Start by uploading your first document for processing.' 
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {documents.length === 0 && (
            <button
              onClick={() => onSectionChange('upload')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredDocuments.map((doc) => (
            <DocumentCard 
              key={doc.id} 
              doc={doc}
              viewMode={viewMode}
              onView={handleViewDocument}
              onDownload={handleDownloadDocument}
              onEdit={handleEditDocument}
              onDelete={handleDeleteDocument}
              isSelected={selectedDocuments.includes(doc.id)}
              onSelect={handleDocumentSelect}
            />
          ))}
        </div>
      )}

      {/* Pagination could be added here for large document sets */}
      {filteredDocuments.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </div>
          {/* Pagination controls could go here */}
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;