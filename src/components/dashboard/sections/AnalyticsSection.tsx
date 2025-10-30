// Analytics Section Component
'use client';

import React from 'react';
import { BarChart3, TrendingUp, FileText, Clock, Download, CheckCircle } from 'lucide-react';
import { DashboardSectionProps, Document } from '../types';
import StatsCard from '../components/StatsCard';

interface AnalyticsSectionProps extends DashboardSectionProps {
  documents?: Document[];
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ 
  user, 
  onSectionChange,
  documents = []
}) => {
  // Calculate analytics data
  const totalDocuments = documents.length;
  const validatedDocuments = documents.filter(doc => doc.status === 'validated').length;
  const processingDocuments = documents.filter(doc => doc.status === 'processing').length;
  const validationRate = totalDocuments > 0 ? Math.round((validatedDocuments / totalDocuments) * 100) : 0;

  // Generate recent activity from actual document data
  const recentActivity = documents
    .slice(0, 4) // Get last 4 documents
    .map(doc => ({
      action: `Document ${doc.status === 'validated' ? 'validated' : doc.status === 'processing' ? 'processing' : 'uploaded'}`,
      document: doc.name || 'Unknown document',
      time: doc.uploadDate ? new Date(doc.uploadDate).toLocaleString() : 'Recently',
      status: doc.status === 'validated' ? 'success' : doc.status === 'processing' ? 'processing' : 'info'
    }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track your document processing performance and usage statistics.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Documents"
          value={totalDocuments.toString()}
          icon={FileText}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Validated"
          value={validatedDocuments.toString()}
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatsCard
          title="Processing"
          value={processingDocuments.toString()}
          icon={Clock}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
        <StatsCard
          title="Success Rate"
          value={`${validationRate}%`}
          icon={TrendingUp}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Performance Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Processing Performance</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No processing data available</p>
              <p className="text-xs text-gray-400 mt-1">Upload documents to see performance metrics</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Success Rate</span>
                <span className="text-lg font-bold text-green-600">
                  {Math.round(((documents.filter(d => d.status === 'validated').length) / documents.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${((documents.filter(d => d.status === 'validated').length) / documents.length) * 100}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                  <p className="text-xs text-gray-500">Total Processed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{processingDocuments}</p>
                  <p className="text-xs text-gray-500">Currently Processing</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs text-gray-400 mt-1">Upload some documents to see activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.document}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Status Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status Breakdown</h3>
        {totalDocuments === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents to analyze</p>
            <p className="text-xs text-gray-400 mt-1">Upload some documents to see analytics</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Validated */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{documents.filter(d => d.status === 'validated').length}</p>
              <p className="text-xs font-medium text-gray-600">Validated</p>
            </div>

            {/* Processing */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-yellow-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-600">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900">{documents.filter(d => d.status === 'processing').length || 3}</p>
              <p className="text-xs font-medium text-gray-600">Processing</p>
            </div>

            {/* Failed */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-red-100">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{documents.filter(d => d.status === 'failed').length}</p>
              <p className="text-xs font-medium text-gray-600">Failed</p>
            </div>

            {/* Pending */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-gray-100">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{documents.filter(d => d.status === 'pending').length}</p>
              <p className="text-xs font-medium text-gray-600">Pending</p>
            </div>

            {/* Enhancing */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{documents.filter(d => d.status === 'enhancing').length}</p>
              <p className="text-xs font-medium text-gray-600">Enhancing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSection;