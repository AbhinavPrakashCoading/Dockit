// Packages Section Component
'use client';

import React from 'react';
import { Package, Download, CheckCircle, Calendar, FileArchive, Search, Filter } from 'lucide-react';
import { DashboardSectionProps, Document } from '../types';
import { useZipPackages } from '../hooks/useZipPackages';
import { toast } from 'react-hot-toast';

interface PackagesSectionProps extends DashboardSectionProps {
  documents?: Document[];
}

const PackagesSection: React.FC<PackagesSectionProps> = ({ 
  user, 
  onSectionChange,
  activeSection,
  setActiveSection,
  setCurrentStep,
  documents = []
}) => {
  const {
    zipPackages,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedExamType,
    setSelectedExamType,
    examTypes,
    downloadZipPackage,
    refetch
  } = useZipPackages();

  const handleGeneratePackage = () => {
    if (setActiveSection) setActiveSection('packages');
    if (setCurrentStep) setCurrentStep('exam-selector');
  };

  const handleDownloadPackage = async (zipId: string) => {
    try {
      await downloadZipPackage(zipId);
      toast.success('ZIP package downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download ZIP package');
      console.error('Download error:', error);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document ZIP Packages</h1>
          <p className="text-gray-600 mt-1">
            Create and manage document ZIP packages for exam submissions.
          </p>
        </div>
        <button
          onClick={handleGeneratePackage}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          Generate ZIP Package
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ZIP packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              {examTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Exam Types' : type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Package History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">ZIP Package History</h3>
          {zipPackages.length > 0 && (
            <button 
              onClick={refetch}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600">Loading ZIP packages...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <FileArchive className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{error}</p>
            <button 
              onClick={refetch}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700"
            >
              Try Again
            </button>
          </div>
        ) : zipPackages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No ZIP packages created yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first ZIP package to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zipPackages.map((zipPackage) => (
              <div 
                key={zipPackage.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <FileArchive className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate" title={zipPackage.filename}>
                        {zipPackage.filename}
                      </p>
                      <p className="text-xs text-gray-500">{zipPackage.examType.toUpperCase()}</p>
                    </div>
                  </div>
                  <button 
                    className="text-purple-600 hover:text-purple-700 transition-colors p-1"
                    onClick={() => handleDownloadPackage(zipPackage.id)}
                    title="Download ZIP package"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Created {formatTimeAgo(zipPackage.generatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Size: {formatFileSize(zipPackage.fileSize)}</span>
                    {zipPackage.rollNumber && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {zipPackage.rollNumber}
                      </span>
                    )}
                  </div>
                  {zipPackage.downloadCount > 0 && (
                    <div className="text-green-600">
                      Downloaded {zipPackage.downloadCount} time{zipPackage.downloadCount !== 1 ? 's' : ''}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs ${
                      zipPackage.storageType === 'cloud' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {zipPackage.storageType === 'cloud' ? 'Cloud' : 'Local'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagesSection;