// Fast Loading Skeleton Component
'use client';

import React from 'react';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white border-r border-gray-200 h-screen">
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-16 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="w-12 h-8 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Cards Skeleton */}
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="w-48 h-6 bg-gray-300 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;