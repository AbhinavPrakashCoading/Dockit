// New Streamlined Dashboard Component with Lazy Loading
'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './DashboardLayout';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { ActiveSection, User } from './types';
import { useDashboardData } from './hooks/useDashboardData';
import { useExamData } from './hooks/useExamData';
import ExamSelectorModal from './components/WorkflowModals/ExamSelectorModal';
import UploadModal from './components/WorkflowModals/UploadModal';
import ProcessingModal from './components/WorkflowModals/ProcessingModal';
import DashboardSkeleton from './components/DashboardSkeleton';
import { usePerformanceMonitor } from './utils/PerformanceMonitor';
import FastOverview from './components/FastOverview';

// Lazy load sections for code splitting and performance
// Preload Overview since it's the default section
const Overview = lazy(() => import('./sections/Overview'));
const UploadSection = lazy(() => 
  import('./sections/UploadSection').then(module => {
    // Preload frequently used sections
    import('./sections/DocumentsSection');
    return module;
  })
);
const DocumentsSection = lazy(() => import('./sections/DocumentsSection'));
const PackagesSection = lazy(() => import('./sections/PackagesSection'));
const AnalyticsSection = lazy(() => import('./sections/AnalyticsSection'));
const SettingsSection = lazy(() => import('./sections/SettingsSection'));

// Loading component for lazy sections
const SectionLoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      <span className="text-gray-600">Loading...</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Performance monitoring
  usePerformanceMonitor('Dashboard');
  
  // UI State
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');

  // User data
  const user: User = {
    id: (session?.user as any)?.id,
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
    isAuthenticated: !!session?.user,
    driveConnected: true, // You can implement this logic
    storageUsed: 2.5, // You can fetch this from your backend
    storageLimit: 15, // You can fetch this from your backend
  };

  // Fast mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Early loading state for better UX
  if (!mounted || status === 'loading') {
    return <DashboardSkeleton />;
  }

  // Conditional data hooks - only load when needed
  const shouldLoadData = mounted && status === 'authenticated';
  
  // Data hooks - only instantiate when ready
  const dashboardData = shouldLoadData ? useDashboardData(user) : {
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

  const examData = shouldLoadData ? useExamData() : {
    exams: [],
    popularExams: [],
    filteredExams: [],
    examsLoading: false,
    selectedExam: null,
    selectedExamSchema: null,
    schemaLoading: false,
    handleExamSelection: () => {},
    filterExams: () => {}
  };

  const {
    documents,
    setDocuments,
    processingJobs,
    setProcessingJobs,
    notifications,
    addNotification,
    removeNotification,
    drafts,
    setDrafts,
    loading,
    updateDocument,
    refetch
  } = dashboardData;

  // Exam data hook
  const {
    exams,
    popularExams,
    filteredExams,
    examsLoading,
    selectedExam,
    selectedExamSchema,
    schemaLoading,
    handleExamSelection,
    filterExams
  } = examData;

  // Common props for all sections
  const sectionProps = {
    user,
    onSectionChange: setActiveSection,
    activeSection: activeSection as string,
    setActiveSection: (section: string) => setActiveSection(section as ActiveSection),
    setCurrentStep,
    currentStep,
    workflowSearchQuery,
    setWorkflowSearchQuery,
    exams,
    popularExams,
    filteredExams,
    examsLoading,
    selectedExam,
    selectedExamSchema,
    schemaLoading,
    handleExamSelection,
    filterExams,
    documents,
    setDocuments,
    processingJobs,
    notifications,
    addNotification,
    removeNotification,
    updateDocument,
    refetch
  };

  const renderContent = () => {
    return (
      <Suspense fallback={<SectionLoadingSpinner />}>
        {activeSection === 'overview' && (
          shouldLoadData ? (
            <Overview 
              {...sectionProps} 
              processingJobs={processingJobs}
            />
          ) : (
            <FastOverview 
              onSectionChange={(section) => setActiveSection(section as ActiveSection)}
              onGeneratePackage={() => {
                setActiveSection('packages');
                setCurrentStep('exam-selector');
              }}
            />
          )
        )}
        {activeSection === 'upload' && (
          <UploadSection {...sectionProps} />
        )}
        {activeSection === 'documents' && (
          <DocumentsSection {...sectionProps} />
        )}
        {activeSection === 'packages' && (
          <PackagesSection {...sectionProps} />
        )}
        {activeSection === 'analytics' && (
          <AnalyticsSection {...sectionProps} />
        )}
        {activeSection === 'settings' && (
          <SettingsSection {...sectionProps} />
        )}
      </Suspense>
    );
  };

  return (
    <DashboardLayout>
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
      />
      <DashboardHeader
        user={user}
        sidebarCollapsed={sidebarCollapsed}
        notifications={notifications}
      />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} pt-20`}>
        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      {/* Workflow Modals */}
      {currentStep === 'exam-selector' && (
        <ExamSelectorModal
          isOpen={true}
          onClose={() => setCurrentStep(null)}
          onExamSelect={handleExamSelection}
          searchQuery={workflowSearchQuery}
          onSearchChange={setWorkflowSearchQuery}
          exams={exams}
          popularExams={popularExams}
          filteredExams={filteredExams}
          examsLoading={examsLoading}
        />
      )}
      
      {currentStep === 'upload' && selectedExam && (
        <UploadModal
          isOpen={true}
          onClose={() => setCurrentStep(null)}
          onBack={() => setCurrentStep('exam-selector')}
          onNext={() => setCurrentStep('processing')}
          selectedExam={selectedExam}
          uploadedFiles={{}}
          onDrop={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onFilesSelected={(files) => console.log('Files selected:', files)}
          dragOver={false}
        />
      )}
      
      {currentStep === 'processing' && (
        <ProcessingModal
          isOpen={true}
          onClose={() => setCurrentStep(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;