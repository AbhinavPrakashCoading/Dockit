// Document Card Component
'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2, 
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { Document, ViewMode } from '../types';

interface DocumentCardProps {
  doc: Document;
  viewMode?: ViewMode;
  onView?: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  isSelected?: boolean;
  onSelect?: (doc: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  doc, 
  viewMode = 'grid',
  onView,
  onDownload,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'enhancing': return 'text-purple-600 bg-purple-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return <CheckCircle className="w-4 h-4" />;
      case 'processing': 
      case 'enhancing': 
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (size: string) => {
    // If size is already formatted, return as is
    if (typeof size === 'string' && (size.includes('MB') || size.includes('KB') || size.includes('GB'))) {
      return size;
    }
    // Otherwise assume it's bytes and format
    const bytes = parseInt(size) || 0;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(doc);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setShowActions(false);
  };

  if (viewMode === 'grid') {
    return (
      <div 
        className={`bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer ${
          isSelected ? 'ring-2 ring-purple-500 border-purple-500' : ''
        }`}
        onClick={handleCardClick}
      >
        <div className="aspect-[3/4] bg-gray-50 relative">
          {doc.thumbnail ? (
            <img 
              src={doc.thumbnail} 
              alt={doc.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)} flex items-center gap-1`}>
              {getStatusIcon(doc.status)}
              <span className="capitalize">{doc.status}</span>
            </div>
          </div>

          {/* Cloud Storage Indicator */}
          {doc.location === 'drive' && (
            <div className="absolute top-3 left-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Cloud className="w-3 h-3 text-blue-600" />
              </div>
            </div>
          )}

          {/* Selection Checkbox */}
          {onSelect && (
            <div className="absolute bottom-3 left-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'bg-purple-600 border-purple-600' 
                  : 'bg-white border-gray-300 group-hover:border-purple-400'
              }`}>
                {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {doc.isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">{doc.processingStage || 'Processing'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h4 className="font-medium text-gray-900 text-sm truncate" title={doc.name}>
            {doc.name}
          </h4>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{doc.examType}</span>
            <span>{formatFileSize(doc.size)}</span>
          </div>
          
          {/* Quality Score */}
          {doc.validationScore && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Quality Score</span>
                <span className="font-medium text-gray-900">{doc.validationScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className={`h-1 rounded-full ${
                    doc.validationScore >= 80 ? 'bg-green-500' :
                    doc.validationScore >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${doc.validationScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Processing Stage */}
          {doc.processingStage && !doc.isProcessing && (
            <p className="text-xs text-blue-600 mt-2">{doc.processingStage}</p>
          )}

          {/* Upload Date */}
          <p className="text-xs text-gray-400 mt-1">{doc.uploadDate}</p>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div 
      className={`bg-white border border-gray-100 hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-purple-500 border-purple-500' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Selection Checkbox */}
          {onSelect && (
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-purple-600 border-purple-600' 
                : 'bg-white border-gray-300 hover:border-purple-400'
            }`}>
              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
          )}

          {/* Thumbnail or Icon */}
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center relative">
            {doc.thumbnail ? (
              <img 
                src={doc.thumbnail} 
                alt={doc.name} 
                className="w-full h-full rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <FileText className="w-5 h-5 text-gray-600" />
            )}
            {doc.location === 'drive' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Cloud className="w-2 h-2 text-white" />
              </div>
            )}
          </div>

          {/* Document Info */}
          <div>
            <h4 className="font-medium text-gray-900">{doc.name}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{doc.examType}</span>
              <span>{formatFileSize(doc.size)}</span>
              <span>{doc.uploadDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Quality Score */}
          {doc.validationScore && (
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{doc.validationScore}%</div>
              <div className="text-xs text-gray-500">Quality</div>
            </div>
          )}

          {/* Status */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)} flex items-center gap-1`}>
            {getStatusIcon(doc.status)}
            <span className="capitalize">{doc.status}</span>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                {onView && (
                  <button
                    onClick={(e) => handleActionClick(e, () => onView(doc))}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                )}
                {onDownload && (
                  <button
                    onClick={(e) => handleActionClick(e, () => onDownload(doc))}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={(e) => handleActionClick(e, () => onEdit(doc))}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => handleActionClick(e, () => onDelete(doc))}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;