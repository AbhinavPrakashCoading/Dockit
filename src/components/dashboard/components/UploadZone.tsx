// Upload Zone Component with Drag & Drop
'use client';

import React, { useRef } from 'react';
import { Upload, FileText, Image, FileCheck } from 'lucide-react';

interface UploadZoneProps {
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onFilesSelected?: (files: File[]) => void;
  dragOver?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  disabled?: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ 
  onDrop, 
  onDragOver, 
  onDragLeave, 
  onFilesSelected,
  dragOver = false,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (onFilesSelected) {
      onFilesSelected(files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div 
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${dragOver 
            ? 'border-purple-400 bg-purple-50' 
            : disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-colors
            ${dragOver 
              ? 'bg-purple-100' 
              : disabled 
                ? 'bg-gray-100'
                : 'bg-gray-100 group-hover:bg-purple-100'
            }
          `}>
            {dragOver ? (
              <FileCheck className="w-8 h-8 text-purple-600" />
            ) : (
              <Upload className={`w-8 h-8 ${disabled ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
              {dragOver ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className={`text-sm mt-1 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
              {disabled 
                ? 'Upload disabled'
                : 'Drag and drop files here, or click to browse'
              }
            </p>
          </div>

          {!disabled && (
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </div>
              <div className="flex items-center space-x-1">
                <Image className="w-4 h-4" />
                <span>Images</span>
              </div>
              <div className="flex items-center space-x-1">
                <Upload className="w-4 h-4" />
                <span>Max {formatFileSize(maxFileSize)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {acceptedFileTypes.length > 0 && !disabled && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Supported formats: {acceptedFileTypes.join(', ')} • Max size: {formatFileSize(maxFileSize)}
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadZone;