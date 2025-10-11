// Dashboard component exports
// Note: Import components directly from their files for better TypeScript support
// Example: import Dashboard from '@/components/dashboard/Dashboard';

export { default as DashboardLayout } from './DashboardLayout';
export { default as DashboardSidebar } from './DashboardSidebar';
export { default as DashboardHeader } from './DashboardHeader';

// Section exports
export { default as Overview } from './sections/Overview';
export { default as UploadSection } from './sections/UploadSection';
export { default as DocumentsSection } from './sections/DocumentsSection';
export { default as PackagesSection } from './sections/PackagesSection';
export { default as AnalyticsSection } from './sections/AnalyticsSection';
export { default as SettingsSection } from './sections/SettingsSection';

// Component exports
export { default as StatsCard } from './components/StatsCard';
export { default as ProcessingQueue } from './components/ProcessingQueue';
export { default as DocumentCard } from './components/DocumentCard';
export { default as UploadZone } from './components/UploadZone';

// Modal exports
export { default as ExamSelectorModal } from './components/WorkflowModals/ExamSelectorModal';
export { default as UploadModal } from './components/WorkflowModals/UploadModal';
export { default as ProcessingModal } from './components/WorkflowModals/ProcessingModal';

// Hook exports
export { useDashboardData } from './hooks/useDashboardData';
export { useExamData } from './hooks/useExamData';
export { useDocuments } from './hooks/useDocuments';
export { useUploadWorkflow } from './hooks/useUploadWorkflow';

// Type exports
export * from './types';