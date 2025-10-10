'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Plus,
  Settings,
  Bell,
  User,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit,
  Grid3X3,
  List,
  Clock,
  HardDrive,
  Zap,
  TrendingUp,
  Package,
  Menu,
  AlignJustify,
  X,
  ChevronDown,
  FolderOpen,
  Cloud,
  Shield,
  Activity,
  BarChart3,
  Archive,
  RefreshCw,
  AlertTriangle,
  Home,
  LogOut,
  Smartphone,
  Wifi,
  WifiOff,
  ArrowLeft,
  ArrowRight,
  Loader
} from 'lucide-react';
import { DraftsList } from '@/components/draft/DraftsList';
import { draftService, DraftData } from '@/features/draft/draftService';
import { clientStorageService } from '@/features/storage/ClientStorageService';
import { EnhancedUploadSection } from '@/components/EnhancedUploadSection';
import { DatabaseStatusIndicator } from '@/components/DatabaseStatusIndicator';
import { PWAInstallPrompt, PWAStatusIndicator, usePWA } from '@/components/PWA';
import { ClientPWAInstallPrompt, ClientPWAStatusIndicator } from '@/components/ClientPWA';
import { hybridStorage } from '@/features/storage/HybridStorageService';
import { OptimizedExamLogo } from '@/components/OptimizedExamLogo';
import { RealExamLogo } from '@/components/RealExamLogo';
import toast from 'react-hot-toast';

// Import dynamic schema loader (replaces static imports)
import { loadAvailableExams, type ExamConfig } from '@/lib/dynamicSchemaLoader';

// Import performance-optimized exam registry
import { getExamsWithSchemaStatus, getPopularExams, searchExams, getExamSchema } from '@/features/exam/optimizedExamRegistry';

interface Document {
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

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAuthenticated: boolean;
  driveConnected?: boolean;
  storageUsed?: number;
  storageLimit?: number;
}

interface ProcessingJob {
  id: string;
  documentName: string;
  stage: 'archive' | 'enhance' | 'analyze' | 'package';
  progress: number;
  estimatedTime?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Component state
  const [activeSection, setActiveSection] = useState<'overview' | 'upload' | 'documents' | 'packages' | 'analytics' | 'settings'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedExamSchema, setSelectedExamSchema] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  const [processingProgress, setProcessingProgress] = useState(0);
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');
  
  // Data state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [drafts, setDrafts] = useState<DraftData[]>([]);

  // Supported exams with schemas - Add new exams here with their schemas
  // To add a new exam:
  // 1. Import the schema file at the top: import newExamSchema from '@/schemas/newExam.json';
  // 2. Add the exam object following the structure below
  // 3. Ensure requiredDocuments match documentTypeMapping keys
  // State for optimized exam loading
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [popularExamsData, setPopularExamsData] = useState<any[]>([]);
  const [dynamicExams, setDynamicExams] = useState<ExamConfig[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);

  // Load optimized exams on component mount
  useEffect(() => {
    const loadOptimizedExams = async () => {
      try {
        setExamsLoading(true);
        
        // Load dynamic exams first (replaces legacy exams)
        const loadedExams = await loadAvailableExams();
        setDynamicExams(loadedExams);
        
        // Load optimized exam data in parallel
        const [examsWithStatus, popularExams] = await Promise.all([
          getExamsWithSchemaStatus(),
          getPopularExams(8)
        ]);
        
        setAvailableExams(examsWithStatus);
        setPopularExamsData(popularExams);
      } catch (error) {
        console.error('Failed to load optimized exams:', error);
        
        // Fallback: Load dynamic exams only
        try {
          const fallbackExams = await loadAvailableExams();
          setDynamicExams(fallbackExams);
          setAvailableExams(fallbackExams.map(exam => ({ 
            ...exam, 
            hasSchema: true, 
            isSchemaLoaded: true 
          })));
        } catch (fallbackError) {
          console.error('Failed to load fallback exams:', fallbackError);
          toast.error('Failed to load exam data. Please refresh the page.');
        }
        setPopularExamsData(legacyExams.slice(0, 4));
      } finally {
        setExamsLoading(false);
      }
    };

    if (mounted) {
      loadOptimizedExams();
    }
  }, [mounted]);

  // Use optimized exams if available, fallback to dynamic exams
  const exams = availableExams.length > 0 ? availableExams : dynamicExams;

  /*
  Example of adding a new exam:
  
  1. Add the exam configuration to dynamicSchemaLoader.ts AVAILABLE_SCHEMAS:
     'new_exam': {
       id: 'new_exam',
       name: 'New Exam',
       category: 'Category Name',
       logo: '📝',
       color: 'bg-amber-100 text-amber-600',
       schemaPath: '/schemas/new-exam.json',
       requiredDocuments: ['photo', 'signature', 'idProof'] // Must match documentTypeMapping keys
     }
  
  2. The schema will be loaded dynamically from the API - no imports needed!
     }
  */

  // Document type mapping with proper icons and labels
  const documentTypeMapping: { [key: string]: { name: string; icon: string; required: boolean } } = {
    photo: { name: 'Passport Photo', icon: '📷', required: true },
    signature: { name: 'Signature', icon: '✍️', required: true },
    idProof: { name: 'ID Proof', icon: '🆔', required: true },
    ageProof: { name: 'Age Proof', icon: '📅', required: true },
    educationCertificate: { name: 'Education Certificate', icon: '🎓', required: true },
    experienceCertificate: { name: 'Experience Certificate', icon: '💼', required: false },
    passport: { name: 'Passport', icon: '📖', required: true },
    identityProof: { name: 'Identity Proof', icon: '🪪', required: true },
  };

  // Get document types for selected exam
  const getDocumentTypes = (exam: any, schema: any = null) => {
    // Use schema if available
    if (schema?.requirements) {
      return schema.requirements.map((req: any) => ({
        id: req.id,
        name: req.displayName,
        icon: getDocumentIcon(req.type),
        required: req.mandatory,
        type: req.type,
        description: req.description,
        format: req.format,
        maxSizeKB: req.maxSizeKB,
        dimensions: req.dimensions
      }));
    }

    // Check if exam object has requiredDocuments (legacy)
    if (exam?.requiredDocuments) {
      return exam.requiredDocuments.map((docType: string) => ({
        id: docType,
        name: documentTypeMapping[docType]?.name || docType,
        icon: documentTypeMapping[docType]?.icon || '📄',
        required: documentTypeMapping[docType]?.required ?? true,
      }));
    }

    // Fallback to generic document types
    return [
      { id: 'id', name: 'Government ID', required: true, icon: '🪪' },
      { id: 'marksheet', name: 'Mark Sheet', required: true, icon: '📄' },
      { id: 'certificate', name: 'Certificate', required: true, icon: '🏆' },
      { id: 'transcript', name: 'Transcript', required: false, icon: '📋' },
      { id: 'recommendation', name: 'Recommendation Letter', required: false, icon: '✉️' },
    ];
  };

  // Get icon for document type
  const getDocumentIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'Photo': '📷',
      'Signature': '✍️',
      'ID Proof': '🪪',
      'Age Proof': '📅',
      'Educational Certificate': '🎓',
      'Mark Sheet': '📄',
      'Degree Certificate': '🏆',
      'Character Certificate': '📋',
      'Caste Certificate': '📜',
      'Income Certificate': '💰',
      'Disability Certificate': '♿',
      'Experience Certificate': '💼',
      'NOC': '📝',
      'Medical Certificate': '🩺',
      'Domicile Certificate': '🏠',
      'Migration Certificate': '📋',
      'Transfer Certificate': '📋',
      'Passport': '📖',
      'Visa': '📄',
      'Language Proficiency': '🗣️',
      'Transcript': '📋',
      'Recommendation Letter': '✉️',
      'Statement of Purpose': '📝',
      'Resume': '📄',
      'Portfolio': '🎨'
    };
    return iconMap[type] || '📄';
  };

  // Handle exam selection with schema loading
  const handleExamSelection = async (exam: any) => {
    console.log('🎯 Exam selected:', exam);
    setSelectedExam(exam);
    setSelectedExamSchema(null);
    setSchemaLoading(true);

    try {
      if (exam.hasSchema) {
        console.log('📋 Loading schema for:', exam.id);
        const schema = await getExamSchema(exam.id);
        
        if (schema) {
          console.log('✅ Schema loaded successfully:', schema);
          console.log('📄 Requirements found:', schema.requirements?.length || 0);
          setSelectedExamSchema(schema);
          toast.success(`Schema loaded for ${exam.name}`);
        } else {
          console.log('❌ No schema returned for:', exam.id);
          toast.error(`No schema available for ${exam.name}`);
        }
      } else {
        console.log('ℹ️ No schema available for:', exam.id);
        toast.error(`Schema not available for ${exam.name}`);
      }
    } catch (error) {
      console.error('💥 Schema loading failed:', error);
      toast.error(`Failed to load requirements for ${exam.name}`);
    } finally {
      setSchemaLoading(false);
    }
  };

  const schemaComparison = [
    {
      property: 'File Size',
      document: 'Government ID',
      uploaded: '180 KB',
      expected: '200 KB (minimum)',
      status: 'mismatch',
      issue: 'File size below minimum requirement'
    },
    {
      property: 'Format',
      document: 'Mark Sheet',
      uploaded: 'JPG',
      expected: 'PDF',
      status: 'mismatch',
      issue: 'Invalid file format'
    },
    {
      property: 'Dimensions',
      document: 'Government ID',
      uploaded: '800 x 600 px',
      expected: '1200 x 900 px',
      status: 'match'
    },
    {
      property: 'Resolution',
      document: 'Certificate',
      uploaded: '150 DPI',
      expected: '300 DPI (minimum)',
      status: 'mismatch',
      issue: 'Resolution too low'
    },
    {
      property: 'Color Mode',
      document: 'Mark Sheet',
      uploaded: 'RGB',
      expected: 'RGB',
      status: 'match'
    },
    {
      property: 'File Name',
      document: 'Certificate',
      uploaded: 'cert.pdf',
      expected: '[name]_certificate.pdf',
      status: 'mismatch',
      issue: 'Naming convention not followed'
    },
  ];

  const fileProgress = [
    { name: 'Government_ID.pdf', progress: 100, status: 'complete' },
    { name: 'Marksheet_2024.pdf', progress: 75, status: 'processing' },
    { name: 'Certificate.pdf', progress: 45, status: 'processing' },
    { name: 'Transcript.pdf', progress: 0, status: 'queued' },
  ];

  // Filter exams based on search (optimized)
  const [filteredExams, setFilteredExams] = useState<any[]>([]);
  
  useEffect(() => {
    const filterExams = async () => {
      if (!workflowSearchQuery.trim()) {
        setFilteredExams(exams.filter(exam => exam.hasSchema || exam.schema));
        return;
      }
      
      try {
        const searchResults = await searchExams(workflowSearchQuery);
        setFilteredExams(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to local filtering
        const localFiltered = exams
          .filter(exam => exam.hasSchema || exam.schema)
          .filter(exam =>
            exam.name.toLowerCase().includes(workflowSearchQuery.toLowerCase()) ||
            exam.category.toLowerCase().includes(workflowSearchQuery.toLowerCase())
          );
        setFilteredExams(localFiltered);
      }
    };

    filterExams();
  }, [workflowSearchQuery, exams]);

  // Popular exams (use optimized data if available)
  const popularExams = popularExamsData.length > 0 
    ? popularExamsData 
    : exams.filter(exam => exam.hasSchema || exam.schema).slice(0, 4);

  // Initialize storage service
  // Storage service for API communication
  const storageService = clientStorageService;

  // User object based on session
  const user: User = {
    id: (session?.user as any)?.id || undefined,
    name: session?.user?.name || null,
    email: session?.user?.email || null,
    image: session?.user?.image || null,
    isAuthenticated: !!session?.user,
    driveConnected: !!session?.user,
    storageUsed: session?.user ? 2.4 : 0, // Only show storage for authenticated users
    storageLimit: session?.user ? 15 : 0
  };

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user data on mount
  useEffect(() => {
    if (mounted) {
      loadUserData();
    }
  }, [mounted, session]);

  const loadUserData = useCallback(async () => {
    try {
      // Load user's drafts
      const userDrafts = await draftService.getAllDrafts(user.email || undefined);
      setDrafts(userDrafts);

      // Load user documents from storage service
      const userDocuments = await storageService.getUserDocuments();
      
      setDocuments(userDocuments);

      // Set up appropriate notifications
      if (user.isAuthenticated) {
        setNotifications([
          { 
            id: '1', 
            type: 'success', 
            message: `Welcome back! You have ${userDrafts.length} saved drafts.`, 
            time: '2 mins ago' 
          }
        ]);
      } else {
        setNotifications([
          { 
            id: '1', 
            type: 'info', 
            message: 'Guest session active. Files are processed locally and not saved permanently.', 
            time: 'now' 
          }
        ]);
        
        if (userDrafts.length > 0) {
          setNotifications(prev => [
            ...prev,
            {
              id: '2',
              type: 'warning',
              message: `${userDrafts.length} session draft(s) found. Consider creating an account to save permanently.`,
              time: 'now'
            }
          ]);
        }
      }

      // Mock processing jobs if there are any pending documents
      const pendingDocs = userDocuments.filter(doc => ['processing', 'enhancing', 'pending'].includes(doc.status));
      if (pendingDocs.length > 0) {
        setProcessingJobs(
          pendingDocs.map((doc, index) => ({
            id: `job_${doc.id}`,
            documentName: doc.name,
            stage: index % 2 === 0 ? 'enhance' : 'analyze',
            progress: Math.floor(Math.random() * 80) + 10, // 10-90%
            estimatedTime: `${Math.floor(Math.random() * 5) + 1} mins`
          }))
        );
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set minimal error state
      setDocuments([]);
      setDrafts([]);
      setNotifications([
        {
          id: 'error',
          type: 'error',
          message: 'Failed to load dashboard data. Please refresh the page.',
          time: 'now'
        }
      ]);
    }
  }, [user.email, user.isAuthenticated]);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'packages', label: 'ZIP Packages', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'enhancing': return 'text-purple-600 bg-purple-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return <CheckCircle className="w-4 h-4" />;
      case 'processing': 
      case 'enhancing': 
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleSignOut = async () => {
    if (user.isAuthenticated) {
      await signOut({ callbackUrl: '/' });
    } else {
      // Guest mode - just redirect to home
      router.push('/');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Redirect to upload page for actual file handling
    router.push('/upload');
  };

  const getUserDisplayName = () => {
    if (user.name) {
      return user.name.split(' ')[0]; // First name only
    }
    return user.isAuthenticated ? 'User' : 'Guest';
  };

  // Workflow helper functions
  const handleFileUpload = (docType: string, files: FileList) => {
    setUploadedFiles(prev => ({
      ...prev,
      [docType]: files[0]
    }));
  };

  const startProcessing = () => {
    setCurrentStep('processing');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setProcessingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setCurrentStep('validation'), 500);
      }
    }, 200);
  };

  const resetWorkflow = () => {
    setCurrentStep(null);
    setSelectedExam(null);
    setUploadedFiles({});
    setProcessingProgress(0);
    setWorkflowSearchQuery('');
  };

  const StatsCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ProcessingQueue = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Processing Queue</h3>
        <Activity className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {processingJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active processing jobs</p>
          </div>
        ) : (
          processingJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{job.documentName}</span>
                <span className="text-xs text-gray-500">{job.estimatedTime} remaining</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 capitalize">{job.stage} stage</span>
                <span className="text-xs font-medium text-gray-900">{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const DocumentCard = ({ doc }: { doc: Document }) => (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {viewMode === 'grid' ? (
        <>
          <div className="aspect-[3/4] bg-gray-50 relative">
            {doc.thumbnail ? (
              <img src={doc.thumbnail} alt={doc.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)} flex items-center gap-1`}>
                {getStatusIcon(doc.status)}
                <span className="capitalize">{doc.status}</span>
              </div>
            </div>
            {doc.location === 'drive' && (
              <div className="absolute top-3 left-3">
                <Cloud className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h4 className="font-medium text-gray-900 text-sm truncate">{doc.name}</h4>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{doc.examType}</span>
              <span>{doc.size}</span>
            </div>
            {doc.validationScore && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Quality Score</span>
                  <span className="font-medium text-gray-900">{doc.validationScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-1 rounded-full"
                    style={{ width: `${doc.validationScore}%` }}
                  />
                </div>
              </div>
            )}
            {doc.processingStage && (
              <p className="text-xs text-blue-600 mt-2 animate-pulse">{doc.processingStage}</p>
            )}
          </div>
        </>
      ) : (
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{doc.name}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{doc.examType}</span>
                <span>{doc.size}</span>
                <span>{doc.uploadDate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {doc.validationScore && (
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{doc.validationScore}%</div>
                <div className="text-xs text-gray-500">Quality</div>
              </div>
            )}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)} flex items-center gap-1`}>
              {getStatusIcon(doc.status)}
              <span className="capitalize">{doc.status}</span>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const UploadZone = () => (
    <div 
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
        dragOver 
          ? 'border-purple-400 bg-purple-50' 
          : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => router.push('/upload')}
    >
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
      <p className="text-gray-600 mb-4">Drag & drop files here or click to browse</p>
      <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
        Select Files
      </button>
      <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-500">
        <span>Supported: PDF, ZIP, DOC, JPG</span>
        <span>Max: 50MB</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
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
                  setActiveSection('packages');
                  setCurrentStep('exam-selector');
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
                value={user.isAuthenticated ? `${user.storageUsed}GB` : "Local"}
                change={user.isAuthenticated && user.storageUsed! > 0 ? `${Math.round((user.storageUsed! / user.storageLimit!) * 100)}%` : undefined}
                icon={user.isAuthenticated ? HardDrive : Shield}
                color="bg-gradient-to-r from-orange-500 to-orange-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProcessingQueue />
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {user.isAuthenticated ? 'Recent Documents' : 'Session Documents'}
                </h3>
                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No documents yet</p>
                      <Link
                        href="/upload"
                        className="text-sm text-purple-600 hover:text-purple-700 mt-2 inline-block"
                      >
                        Upload your first document
                      </Link>
                    </div>
                  ) : (
                    documents.slice(0, 3).map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.examType} • {doc.uploadDate}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {documents.length > 0 && (
                  <button 
                    onClick={() => setActiveSection('documents')}
                    className="block text-center text-sm text-purple-600 hover:text-purple-700 mt-4 font-medium cursor-pointer"
                  >
                    View All Documents
                  </button>
                )}
              </div>
            </div>

            {/* Drafts Section */}
            {drafts.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Drafts</h3>
                <DraftsList />
              </div>
            )}
          </div>
        );

      case 'upload':
        return <EnhancedUploadSection onFilesUploaded={(files) => {
          console.log('Files uploaded:', files);
          toast.success(`${files.length} file(s) ready for processing!`);
        }} />;

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                <p className="text-gray-600 mt-1">
                  Manage and organize your {user.isAuthenticated ? 'uploaded' : 'session'} documents.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="UPSC">UPSC</option>
                  <option value="SSC">SSC</option>
                  <option value="IELTS">IELTS</option>
                </select>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-600 mb-6">Start by uploading your first document for processing.</p>
                <Link
                  href="/upload"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Link>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>
        );

      case 'packages':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document ZIP Packages</h1>
                <p className="text-gray-600 mt-1">
                  Create and manage document ZIP packages for exam submissions.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveSection('packages');
                  setCurrentStep('exam-selector');
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Generate ZIP Package
              </button>
            </div>

            {/* Package History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ZIP Package History</h3>
              <div className="space-y-3">
                {documents.filter(doc => doc.status === 'validated').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No ZIP packages created yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first ZIP package to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.filter(doc => doc.status === 'validated').map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.examType}</p>
                            </div>
                          </div>
                          <button className="text-purple-600 hover:text-purple-700">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {doc.uploadDate}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">Coming Soon</h2>
            <p className="text-gray-600 mt-2">This section is under development.</p>
          </div>
        );
    }
  };

  // Don't render until hydrated
  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4">
          {sidebarCollapsed ? (
            // Just the burger menu when collapsed
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow"
            >
              <AlignJustify className="w-4 h-4 text-white" />
            </button>
          ) : (
            // Logo icon + text when expanded
            <div className="flex items-center space-x-3">
              {/* Logo icon acts as burger menu toggle */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow"
                title="Toggle Menu"
              >
                <FileText className="w-4 h-4 text-white" />
              </button>
              {/* Text acts as home button */}
              <button
                onClick={() => setActiveSection('overview')}
                className="font-bold text-gray-900 hover:text-purple-600 transition-colors"
                title="Go to Overview"
              >
                ExamDoc
              </button>
            </div>
          )}
        </div>

        <nav className="mt-8">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                  activeSection === item.id ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600' : 'text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          {!sidebarCollapsed && user.isAuthenticated && user.storageUsed! > 0 && (
            <>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium">{Math.round((user.storageUsed! / user.storageLimit!) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 h-1 rounded-full"
                    style={{ width: `${(user.storageUsed! / user.storageLimit!) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {user.storageUsed}GB of {user.storageLimit}GB used
                </div>
              </div>
              
              {/* Database Status Indicator */}
              <DatabaseStatusIndicator />
              
              {/* PWA Status Indicator */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <ClientPWAStatusIndicator />
              </div>
            </>
          )}
          
          {/* Show PWA indicator for guest users too */}
          {!sidebarCollapsed && !user.isAuthenticated && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <ClientPWAStatusIndicator />
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className={`fixed top-0 right-0 left-0 bg-white border-b border-gray-200 z-20 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="flex items-center justify-end px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2 text-center">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              {user.isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600">Drive Connected</span>
                  </div>
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4 text-gray-400" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-gray-600">Guest Session</span>
                  </div>
                  <Link
                    href="/auth/signin"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} pt-20`}>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Navigation (hidden on desktop) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <div className="grid grid-cols-5 py-2">
          {sidebarItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex flex-col items-center py-2 px-1 ${
                  activeSection === item.id ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <Link
        href="/upload"
        className="fixed bottom-20 right-4 md:hidden w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Toast Notifications Area */}
      <div className="fixed top-20 right-4 space-y-2 z-40">
        {/* React Hot Toast will render here */}
      </div>

      {/* PWA Install Prompt */}
      <ClientPWAInstallPrompt />

      {/* Workflow Modals */}
      {/* Step 1: Exam Selector Modal */}
      {currentStep === 'exam-selector' && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-bold">Choose Your Exam</h2>
              <button
                onClick={() => setCurrentStep(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search exams..."
                    value={workflowSearchQuery}
                    onChange={(e) => setWorkflowSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    autoComplete="off"
                  />
                </div>
                <button
                  disabled
                  className="px-4 py-3 bg-gray-100 text-gray-400 border border-gray-300 rounded-lg cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
                  title="Request Schema (Coming Soon)"
                >
                  <Plus size={16} />
                  Request Schema
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Popular Exams - only show when not searching */}
              {!workflowSearchQuery && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Popular Exams</h3>
                  {examsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {popularExams.map(exam => (
                      <button
                        key={exam.id}
                        onClick={() => {
                          handleExamSelection(exam);
                          setCurrentStep('upload');
                        }}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center"
                      >
                        <div className={`w-16 h-16 ${exam.color} rounded-full flex items-center justify-center mx-auto mb-2 relative`}>
                          <RealExamLogo 
                            examId={exam.id} 
                            examName={exam.name}
                            size={48}
                            className="rounded-full"
                            variant="card"
                            priority={true}
                          />
                          {(exam.hasSchema || exam.schema) && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="font-semibold">{exam.name}</p>
                        <p className="text-xs text-gray-500">{exam.category}</p>
                        {(exam.hasSchema || exam.schema) && (
                          <p className="text-xs text-green-600 mt-1">✓ Schema Available</p>
                        )}
                      </button>
                    ))}
                    </div>
                  )}
                </div>
              )}

              {/* All Exams */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {workflowSearchQuery ? `Search Results for "${workflowSearchQuery}"` : 'All Exams'}
                </h3>
                {examsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredExams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredExams.map(exam => (
                      <button
                        key={exam.id}
                        onClick={() => {
                          handleExamSelection(exam);
                          setCurrentStep('upload');
                        }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition flex items-center gap-4"
                      >
                        <div className={`w-12 h-12 ${exam.color} rounded-lg flex items-center justify-center flex-shrink-0 relative`}>
                          <RealExamLogo 
                            examId={exam.id} 
                            examName={exam.name}
                            size={32}
                            className="rounded-lg"
                            variant="list"
                          />
                          {(exam.hasSchema || exam.schema) && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{exam.name}</p>
                          <p className="text-sm text-gray-500">{exam.category}</p>
                          {(exam.hasSchema || exam.schema) && (
                            <p className="text-xs text-green-600">✓ Schema Available</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No exams found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Upload Documents Modal */}
      {currentStep === 'upload' && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep('exam-selector')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-bold">Upload Documents</h2>
                  <p className="text-sm text-gray-500">
                    For {selectedExam?.name}
                    {schemaLoading && <span> - Loading requirements...</span>}
                    {selectedExamSchema && <span> ✓ Schema loaded</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentStep(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Debug Info - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 text-sm">
                  <div className="font-semibold mb-2">🔧 Debug Info:</div>
                  <div>Selected Exam: {selectedExam?.name || 'None'}</div>
                  <div>Has Schema Flag: {selectedExam?.hasSchema ? '✅' : '❌'}</div>
                  <div>Schema Loading: {schemaLoading ? '⏳' : '✅'}</div>
                  <div>Schema Loaded: {selectedExamSchema ? '✅' : '❌'}</div>
                  <div>Requirements Count: {selectedExamSchema?.requirements?.length || 0}</div>
                  <div>Document Types Generated: {selectedExam ? getDocumentTypes(selectedExam, selectedExamSchema).length : 0}</div>
                </div>
              )}

              {schemaLoading && (
                <div className="text-center py-8">
                  <Loader className="animate-spin mx-auto mb-4 text-purple-600" size={32} />
                  <p className="text-gray-500">Loading exam requirements...</p>
                </div>
              )}
              
              {!schemaLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedExam && getDocumentTypes(selectedExam, selectedExamSchema).map((docType: { id: string; name: string; icon: string; required: boolean; description?: string; format?: string; maxSizeKB?: number }) => (
                    <div key={docType.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{docType.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold">{docType.name}</h3>
                          {docType.description && (
                            <p className="text-xs text-gray-500">{docType.description}</p>
                          )}
                        </div>
                        {docType.required && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                        )}
                        {selectedExamSchema && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Schema Validated</span>
                        )}
                      </div>
                      
                      {/* Show format requirements if available */}
                      {(docType.format || docType.maxSizeKB) && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {docType.format && <span>Format: {docType.format} </span>}
                          {docType.maxSizeKB && <span>Max Size: {docType.maxSizeKB}KB</span>}
                        </div>
                      )}
                      
                      {uploadedFiles[docType.id] ? (
                        <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-600" size={24} />
                            <div>
                              <p className="font-medium text-green-900">{uploadedFiles[docType.id].name}</p>
                              <p className="text-sm text-green-600">Uploaded successfully</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const newFiles = { ...uploadedFiles };
                              delete newFiles[docType.id];
                              setUploadedFiles(newFiles);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition min-h-[140px]">
                          <Upload className="text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600 mb-1 text-center">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400 text-center">
                            {docType.format ? `${docType.format}` : 'PDF, JPG, PNG'} 
                            {docType.maxSizeKB ? ` (Max ${docType.maxSizeKB}KB)` : ' (Max 10MB)'}
                          </p>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => e.target.files && handleFileUpload(docType.id, e.target.files)}
                            accept={docType.format ? `.${docType.format.toLowerCase()}` : '.pdf,.jpg,.jpeg,.png'}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {!selectedExam && (
                <div className="text-center py-8 text-gray-500">
                  <p>No exam selected</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setCurrentStep('exam-selector')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('review')}
                disabled={Object.keys(uploadedFiles).length === 0}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Adapt Panel */}
      {currentStep === 'review' && (
        <div className="fixed inset-0 backdrop-blur-lg z-50">
          <div className="absolute right-0 top-0 h-full w-full md:w-[700px] bg-white shadow-2xl border-l-4 border-purple-500 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-bold">Review & Adapt</h2>
                  <p className="text-sm text-gray-500">Verify schema mapping</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentStep(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Info Banner */}
            <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-blue-900 font-medium">Schema Comparison</p>
                <p className="text-xs text-blue-700 mt-1">
                  We've compared your uploaded documents with the expected schema. Review any mismatches below.
                </p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {schemaComparison.map((item, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 ${
                      item.status === 'match'
                        ? 'border-green-200 bg-green-50'
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{item.property}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{item.document}</p>
                      </div>
                      {item.status === 'match' ? (
                        <span className="flex items-center gap-1 text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                          <CheckCircle size={14} />
                          Match
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded">
                          <AlertCircle size={14} />
                          Mismatch
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Uploaded</p>
                        <p className="text-sm font-medium">{item.uploaded}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Required</p>
                        <p className="text-sm font-medium">{item.expected}</p>
                      </div>
                    </div>
                    {item.issue && (
                      <div className="pt-2 border-t border-orange-200">
                        <p className="text-xs text-orange-700">⚠️ {item.issue}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Requirements Met</span>
                  <span className="text-sm font-bold text-green-600">
                    {schemaComparison.filter(i => i.status === 'match').length} / {schemaComparison.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(schemaComparison.filter(i => i.status === 'match').length / schemaComparison.length) * 100}%`
                    }}
                  />
                </div>
                {schemaComparison.filter(i => i.status === 'mismatch').length > 0 && (
                  <p className="text-xs text-orange-600 mt-3">
                    ⚠️ Some documents don't meet requirements. You can still proceed, but may face issues during submission.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setCurrentStep('upload')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Back
              </button>
              <button
                onClick={startProcessing}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Process Documents
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Processing Documents Modal */}
      {currentStep === 'processing' && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-300 max-w-2xl w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Processing Documents</h2>
              <p className="text-gray-500 mt-1">Please wait while we process your files</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Overall Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-bold text-purple-600">{processingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>

              {/* Individual File Progress */}
              <div className="space-y-4">
                {fileProgress.map((file, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <FileText className="text-gray-400" size={20} />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      {file.status === 'complete' && (
                        <CheckCircle className="text-green-600" size={20} />
                      )}
                      {file.status === 'processing' && (
                        <Loader className="text-purple-600 animate-spin" size={20} />
                      )}
                      {file.status === 'queued' && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Queued</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            file.status === 'complete' ? 'bg-green-600' : 'bg-purple-600'
                          }`}
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{file.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Validation Complete Modal */}
      {currentStep === 'validation' && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-300 max-w-lg w-full">
            {/* Success Icon */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Validation Complete!</h2>
              <p className="text-gray-600">All documents have been successfully validated and are ready for download.</p>
            </div>

            {/* Validation Summary */}
            <div className="px-8 pb-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documents Processed</span>
                  <span className="font-semibold">{fileProgress.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Validation Status</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle size={16} />
                    Passed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exam</span>
                  <span className="font-semibold">{selectedExam?.name}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={resetWorkflow}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Start New
              </button>
              <button
                onClick={() => {
                  alert('ZIP file downloaded!');
                  resetWorkflow();
                }}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download ZIP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;