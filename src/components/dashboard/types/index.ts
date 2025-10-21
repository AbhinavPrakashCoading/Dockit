// Dashboard component types and interfaces
export interface Document {
  id: string;
  name: string;
  examType: string;
  status: 'validated' | 'processing' | 'failed' | 'pending' | 'enhancing';
  uploadDate: string;
  size: string;
  validationScore?: number;
  location: 'drive' | 'local';
  thumbnail?: string;
  processingStage?: string;
  isProcessing?: boolean;
}

export interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAuthenticated: boolean;
  driveConnected?: boolean;
  storageUsed?: number;
  storageLimit?: number;
}

export interface ProcessingJob {
  id: string;
  documentName: string;
  stage: 'archive' | 'enhance' | 'analyze' | 'package';
  progress: number;
  estimatedTime?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  time: string;
}

export interface ExamConfig {
  id: string;
  name: string;
  category: string;
  logo: string | null;
  color: string;
  schemaPath?: string;
  requiredDocuments?: string[];
  hasSchema?: boolean;
  schema?: any;
}

export interface DraftData {
  id: string;
  name: string;
  examType: string;
  documents: Document[];
  createdAt: string;
  lastModified: string;
}

export type ActiveSection = 'overview' | 'upload' | 'documents' | 'packages' | 'analytics' | 'settings';
export type ViewMode = 'grid' | 'list';

export interface SidebarItem {
  id: ActiveSection;
  label: string;
  icon: any; // React component
}

export interface DocumentTypeMapping {
  [key: string]: {
    name: string;
    icon: string;
    required: boolean;
  };
}

export interface SchemaComparison {
  property: string;
  document: string;
  uploaded: string;
  expected: string;
  status: 'match' | 'mismatch';
  issue?: string;
}

export interface FileProgress {
  name: string;
  progress: number;
  status: 'complete' | 'processing' | 'queued';
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: any; // React component
  color: string;
  lightBackground?: string; // For guest-mode style light backgrounds
  iconColor?: string; // For guest-mode style colored icons
}

export interface DashboardSectionProps {
  user: User;
  onSectionChange: (section: ActiveSection) => void;
  activeSection?: string;
  setActiveSection?: (section: string) => void;
  setCurrentStep?: (step: string) => void;
}

export interface WorkflowState {
  currentStep: string | null;
  selectedExam: any;
  selectedExamSchema: any;
  schemaLoading: boolean;
  uploadedFiles: { [key: string]: File };
  processingProgress: number;
  workflowSearchQuery: string;
}