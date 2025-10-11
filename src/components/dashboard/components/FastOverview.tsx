// Fast Overview Component
'use client';

import React from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Package } from 'lucide-react';

interface FastOverviewProps {
  onSectionChange?: (section: string) => void;
  onGeneratePackage?: () => void;
}

const FastOverview: React.FC<FastOverviewProps> = ({ 
  onSectionChange, 
  onGeneratePackage 
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Dockit</h1>
        <p className="text-gray-600 mt-1">
          Your intelligent document processing dashboard
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validated</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Generate ZIP Package - Prominent Button */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Generate ZIP Package</h3>
            <p className="text-purple-100">Create document packages for exam submissions</p>
          </div>
          <button
            onClick={() => {
              if (onGeneratePackage) {
                onGeneratePackage();
              } else if (onSectionChange) {
                onSectionChange('packages');
              }
            }}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
          >
            <Package className="w-5 h-5" />
            Generate Package
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onSectionChange?.('upload')}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Upload Documents</h4>
            <p className="text-sm text-gray-600 mt-1">Start processing your documents</p>
          </button>

          <button 
            onClick={() => onSectionChange?.('documents')}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">View Documents</h4>
            <p className="text-sm text-gray-600 mt-1">Manage your document library</p>
          </button>

          <button 
            onClick={() => onSectionChange?.('analytics')}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">View Analytics</h4>
            <p className="text-sm text-gray-600 mt-1">Track processing performance</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FastOverview;