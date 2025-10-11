// Packages Section Component
'use client';

import React from 'react';
import { Package, Download, CheckCircle } from 'lucide-react';
import { DashboardSectionProps, Document } from '../types';

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
  const handleGeneratePackage = () => {
    if (setActiveSection) setActiveSection('packages');
    if (setCurrentStep) setCurrentStep('exam-selector');
  };

  const validatedDocuments = documents.filter((doc: Document) => doc.status === 'validated');

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

      {/* Package History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ZIP Package History</h3>
        <div className="space-y-3">
          {validatedDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No ZIP packages created yet</p>
              <p className="text-xs text-gray-400 mt-1">Create your first ZIP package to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validatedDocuments.map((doc: Document) => (
                <div 
                  key={doc.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.examType}</p>
                      </div>
                    </div>
                    <button 
                      className="text-purple-600 hover:text-purple-700 transition-colors"
                      onClick={() => {
                        // Handle download logic here
                        console.log('Download package:', doc.id);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {doc.uploadDate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackagesSection;