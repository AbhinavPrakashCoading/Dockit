// Dashboard Data Provider - ensures consistent hook order
'use client';

import React from 'react';
import { User } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
import { useExamData } from '../hooks/useExamData';

interface DashboardDataProviderProps {
  user: User;
  shouldLoadData: boolean;
  children: (data: any) => React.ReactNode;
}

export const DashboardDataProvider: React.FC<DashboardDataProviderProps> = ({
  user,
  shouldLoadData,
  children
}) => {
  // Always call hooks in the same order
  const rawDashboardData = useDashboardData(user);
  const examData = useExamData();

  // Debug exam data from provider
  console.log('🏢 DashboardDataProvider exam data:');
  console.log('   - Exams from provider:', examData.exams.length);
  console.log('   - Popular exams from provider:', examData.popularExams.length);
  console.log('   - Loading from provider:', examData.examsLoading);

  // Use actual data when authenticated, fallback when not
  const dashboardData = shouldLoadData ? rawDashboardData : {
    documents: [],
    setDocuments: () => {},
    processingJobs: [],
    setProcessingJobs: () => {},
    notifications: [],
    addNotification: () => {},
    removeNotification: () => {},
    drafts: [],
    setDrafts: () => {},
    loading: false,
    updateDocument: () => {},
    refetch: async () => {}
  };

  return children({ dashboardData, examData });
};