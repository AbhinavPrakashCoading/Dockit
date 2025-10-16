// New Streamlined Dashboard Component with Lazy Loading
'use client';

import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './DashboardLayout';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { ActiveSection, User } from './types';
import { useDashboardData } from './hooks/useDashboardData';
import { useExamData } from './hooks/useExamData';
import { DashboardDataProvider } from './hooks/DashboardDataProvider';
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
  
  return (
    <DashboardDataProvider user={user} shouldLoadData={shouldLoadData}>
      {({ dashboardData, examData }) => (
        <DashboardContent 
          user={user}
          shouldLoadData={shouldLoadData}
          dashboardData={dashboardData}
          examData={examData}
        />
      )}
    </DashboardDataProvider>
  );
};

// Separate component for dashboard content
const DashboardContent: React.FC<{
  user: User;
  shouldLoadData: boolean;
  dashboardData: any;
  examData: any;
}> = ({ user, shouldLoadData, dashboardData, examData }) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');
  
  // State for tracking uploaded and processed files
  const [workflowUploadedFiles, setWorkflowUploadedFiles] = useState<{ [key: string]: File }>({});
  const [workflowDocumentMapping, setWorkflowDocumentMapping] = useState<{ [key: string]: File }>({});
  const [workflowTransformedFiles, setWorkflowTransformedFiles] = useState<{ [key: string]: File }>({});

  // Create stable references for empty objects to prevent infinite re-renders
  const emptyUploadedFiles = useMemo(() => ({}), []);
  const emptyDocumentMapping = useMemo(() => ({}), []);

  // Handle workflow file uploads
  const handleWorkflowFilesSelected = useCallback((files: File[]) => {
    console.log('📤 Workflow files selected:', files.length);
    const newUploadedFiles = { ...workflowUploadedFiles };
    files.forEach((file, index) => {
      newUploadedFiles[`file_${Date.now()}_${index}`] = file;
    });
    setWorkflowUploadedFiles(newUploadedFiles);
  }, [workflowUploadedFiles]);

  // Handle document mapping from UploadModal
  const handleDocumentMapping = useCallback((mapping: { [key: string]: File }) => {
    console.log('🔗 Document mapping updated:', Object.keys(mapping));
    setWorkflowDocumentMapping(mapping);
  }, []);

  // Handle processing completion from ProcessingModal
  const handleProcessingComplete = useCallback((transformedFiles: { [key: string]: File }) => {
    console.log('✅ Processing completed with transformed files:', Object.keys(transformedFiles));
    setWorkflowTransformedFiles(transformedFiles);
    
    // You could also trigger additional actions here like:
    // - Navigate to a success page
    // - Show a success notification
    // - Auto-download the files
    // - Move to the next step in your workflow
  }, []);

  // Reset workflow when closing
  const resetWorkflow = useCallback(() => {
    console.log('🔄 Resetting workflow');
    setCurrentStep(null);
    setWorkflowUploadedFiles({});
    setWorkflowDocumentMapping({});
    setWorkflowTransformedFiles({});
  }, []);

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

  // Debug exam data for main Dashboard
  console.log('📊 Main Dashboard exam data:');
  console.log('   - Exams count:', exams.length);
  console.log('   - Popular exams count:', popularExams.length);
  console.log('   - Loading:', examsLoading);
  if (exams.length > 0) {
    console.log('   - First exam:', exams[0]);
  }

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
          onClose={() => {
            console.log('🚪 Main Dashboard modal closed');
            setCurrentStep(null);
          }}
          onExamSelect={(exam) => {
            console.log('🎯 Main Dashboard exam selected:', exam.name);
            console.log('📋 Exam data received:', exam);
            handleExamSelection(exam);
            setCurrentStep('upload');
          }}
          searchQuery={workflowSearchQuery}
          onSearchChange={setWorkflowSearchQuery}
          exams={exams || []}
          popularExams={popularExams || []}
          filteredExams={filteredExams || []}
          examsLoading={examsLoading}
        />
      )}
      
      {currentStep === 'upload' && selectedExam && (
        <UploadModal
          isOpen={true}
          onClose={resetWorkflow}
          onBack={() => setCurrentStep('exam-selector')}
          onNext={() => setCurrentStep('processing')}
          selectedExam={selectedExam}
          uploadedFiles={workflowUploadedFiles}
          onDrop={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onFilesSelected={handleWorkflowFilesSelected}
          dragOver={false}
          onDocumentMapping={handleDocumentMapping}
        />
      )}
      
      {currentStep === 'processing' && (
        <ProcessingModal
          isOpen={true}
          onClose={resetWorkflow}
          selectedExam={selectedExam}
          uploadedFiles={workflowUploadedFiles}
          documentMapping={workflowDocumentMapping}
          onProcessingComplete={handleProcessingComplete}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;