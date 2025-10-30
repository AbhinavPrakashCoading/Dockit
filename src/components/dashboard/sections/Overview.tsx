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
  BarChart3,
  AlertTriangle
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
    <div className="space-y-6 md:space-y-8 min-h-full">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
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
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 md:px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
        >
          <Package className="w-4 h-4" />
          <span>Generate Zip</span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Total Documents"
          value={documents.length.toString()}
          icon={FileText}
          color="bg-blue-100"
          lightBackground="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Processing"
          value={documents.filter(d => ['processing', 'enhancing'].includes(d.status)).length.toString()}
          icon={RefreshCw}
          color="bg-yellow-100"
          lightBackground="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="Validated"
          value={documents.filter(d => d.status === 'validated').length.toString()}
          icon={CheckCircle}
          color="bg-green-100"
          lightBackground="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Issues"
          value={documents.filter(d => d.status === 'failed').length.toString()}
          icon={AlertTriangle}
          color="bg-red-100"
          lightBackground="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Generate ZIP Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Generate ZIP Package
            </h2>
            <p className="text-purple-100 text-sm md:text-base">
              Create document packages for exam submissions
            </p>
          </div>
          <button
            onClick={() => {
              onSectionChange('packages');
              setCurrentStep?.('exam-selector');
            }}
            className="bg-white text-purple-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Package className="w-5 h-5" />
            <span>Generate Package</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => onSectionChange('upload')}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
              Upload Documents
            </h3>
            <p className="text-sm text-gray-600">Start processing your documents</p>
            <div className="flex items-center gap-1 text-purple-600 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Get started</span>
            </div>
          </button>

          <button 
            onClick={() => onSectionChange('documents')}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              View Documents
            </h3>
            <p className="text-sm text-gray-600">Manage your document library</p>
            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Get started</span>
            </div>
          </button>

          <button 
            onClick={() => onSectionChange('analytics')}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
              View Analytics
            </h3>
            <p className="text-sm text-gray-600">Track processing performance</p>
            <div className="flex items-center gap-1 text-orange-600 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Get started</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Documents - Less Prominent */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user.isAuthenticated ? 'Recent Documents' : 'Session Documents'}
          </h3>
          <div className="space-y-3">
            {documents.slice(0, 3).map((doc) => (
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
            ))}
            
            {documents.length > 3 && (
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
      )}

      {/* Processing Queue - Relocated and Optional */}
      {processingJobs.length > 0 && (
        <ProcessingQueue processingJobs={processingJobs} />
      )}
    </div>
  );
};

export default Overview;