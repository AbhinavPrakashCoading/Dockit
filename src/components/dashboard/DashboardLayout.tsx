// Dashboard Layout Component - Main wrapper and context provider
'use client';

import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      {/* Toaster will be added back when sonner is available */}
    </div>
  );
};

export default DashboardLayout;