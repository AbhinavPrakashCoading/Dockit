// Overview Section Component
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  HardDrive, 
  Shield, 
  Package,
  Plus,
  BarChart3
} from 'lucide-react';
import { DashboardSectionProps } from '../types';
import StatsCard from '../components/StatsCard';
import ProcessingQueue from '../components/ProcessingQueue';

interface OverviewProps extends DashboardSectionProps {
  documents?: any[];
  processingJobs?: any[];
}

const Overview: React.FC<OverviewProps> = ({ 
  user, 
  onSectionChange, 
  setCurrentStep,
  documents = [], 
  processingJobs = [] 
}) => {
  const getUserDisplayName = () => {
    if (user.isAuthenticated && user.name) {
      return user.name.split(' ')[0]; // First name only
    }
    return user.isAuthenticated ? 'User' : 'Guest';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="text-gray-600 mt-1">
            {user.isAuthenticated 
              ? "Here's what's happening with your documents today."
              : "You're in guest mode. Files are processed locally and not saved permanently."
            }
          </p>
        </div>
        <button
          onClick={() => {
            onSectionChange('packages');
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          Generate Zip
        </button>
      </div>

      {!user.isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Guest Mode Active</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Your files are processed locally and won't be saved permanently. Create an account to enable cloud storage and document history.
              </p>
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signup"
                  className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-sm text-yellow-600 hover:text-yellow-700"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Documents"
          value={documents.length.toString()}
          change={undefined} // Remove fake percentage changes
          icon={FileText}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Validated"
          value={documents.filter(d => d.status === 'validated').length.toString()}
          change={undefined} // Remove fake percentage changes
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatsCard
          title="Processing"
          value={documents.filter(d => ['processing', 'enhancing'].includes(d.status)).length.toString()}
          icon={RefreshCw}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatsCard
          title={user.isAuthenticated ? "Storage Used" : "Session Active"}
          value={user.isAuthenticated ? `${user.storageUsed || 0}GB` : "Local"}
          change={user.isAuthenticated && (user.storageUsed || 0) > 0 ? `${Math.round(((user.storageUsed || 0) / (user.storageLimit || 1)) * 100)}%` : undefined}
          icon={user.isAuthenticated ? HardDrive : Shield}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onSectionChange('upload')}
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Upload</span>
            </button>
            
            <button 
              onClick={() => {
                onSectionChange('packages');
                setCurrentStep?.('exam-selector');
              }}
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Generate ZIP</span>
            </button>
            
            <button 
              onClick={() => onSectionChange('documents')}
              className="flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Documents</span>
            </button>
            
            <button 
              onClick={() => onSectionChange('analytics')}
              className="flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Analytics</span>
            </button>
          </div>
        </div>

        <ProcessingQueue processingJobs={processingJobs} />
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user.isAuthenticated ? 'Recent Documents' : 'Session Documents'}
          </h3>
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents yet</p>
                <button
                  onClick={() => onSectionChange('upload')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2 flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Upload your first document
                </button>
              </div>
            ) : (
              documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {doc.thumbnail ? (
                        <img src={doc.thumbnail} alt={doc.name} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.examType} • {doc.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'validated' ? 'bg-green-100 text-green-800' :
                      doc.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      doc.status === 'enhancing' ? 'bg-purple-100 text-purple-800' :
                      doc.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))
            )}
            
            {documents.length > 5 && (
              <div className="text-center pt-3">
                <button
                  onClick={() => onSectionChange('documents')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View all documents →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;