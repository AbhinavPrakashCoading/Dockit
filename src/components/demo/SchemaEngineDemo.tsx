/**
 * Schema Engine Demo Component
 * Interactive demonstration of autonomous schema discovery and fetching
 * Updated: Fixed intervalRef issue
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Database, 
  Globe, 
  Eye, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  TrendingUp,
  Zap,
  MapPin,
  Calendar,
  Link,
  Download,
  Play,
  Pause,
  Settings,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DiscoverySource {
  name: string;
  baseUrl: string;
  searchPatterns: string[];
  selectors: {
    examLinks: string;
    examName: string;
    organization: string;
    deadlines: string;
  };
  priority: number;
  lastCrawled: Date;
  isActive: boolean;
  status: 'idle' | 'crawling' | 'success' | 'error';
}

interface ExamSchema {
  examId: string;
  version: number;
  generatedAt: Date;
  confidence: number;
  source: string;
  url: string;
  fields: {
    id: string;
    name: string;
    type: string;
    required: boolean;
    validation: any;
  }[];
  documentTypes: {
    type: string;
    specifications: any;
    examples: string[];
  }[];
  metadata: {
    formComplexity: string;
    estimatedSubmissionTime: number;
    successRate: number;
  };
}

interface DiscoveryStats {
  totalDiscoveredForms: number;
  activeMonitoringTasks: number;
  recentChanges: number;
  averageConfidence: number;
  formsByCategory: { [category: string]: number };
  priorityDistribution: { [priority: string]: number };
}

export function SchemaEngineDemo() {
  // Component state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverySources, setDiscoverySources] = useState<DiscoverySource[]>([]);
  const [discoveredSchemas, setDiscoveredSchemas] = useState<ExamSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<ExamSchema | null>(null);
  const [discoveryStats, setDiscoveryStats] = useState<DiscoveryStats | null>(null);
  const [autoDiscovery, setAutoDiscovery] = useState(false);
  const [discoveryLog, setDiscoveryLog] = useState<string[]>([]);
  const [showManualGeneration, setShowManualGeneration] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug log to verify intervalRef is created
  console.log('intervalRef created:', intervalRef);

  const formatDate = (date: Date | string): string => {
    try {
      console.log('formatDate input:', date, 'type:', typeof date);
      const dateObj = date instanceof Date ? date : new Date(date);
      console.log('formatDate dateObj:', dateObj);
      return dateObj.toLocaleTimeString();
    } catch (error) {
      console.error('formatDate error:', error);
      return 'Invalid Date';
    }
  };

  const formatDateTime = (date: Date | string): string => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateOnly = (date: Date | string): string => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Initialize demo data
  useEffect(() => {
    console.log('Initializing demo data...');
    initializeDemoData();
    // Don't load from API initially to avoid conflicts
    // loadFromAPI();
  }, []);

  const loadFromAPI = async () => {
    try {
      const [sourcesRes, schemasRes, statsRes] = await Promise.all([
        fetch('/api/schema-discovery?action=sources'),
        fetch('/api/schema-discovery?action=schemas'),
        fetch('/api/schema-discovery?action=stats')
      ]);

      if (sourcesRes.ok && schemasRes.ok && statsRes.ok) {
        const sources = await sourcesRes.json();
        const schemas = await schemasRes.json();
        const stats = await statsRes.json();

        // Convert date strings back to Date objects
        if (sources.success) {
          const sourcesWithDates = sources.data.map((source: any) => ({
            ...source,
            lastCrawled: new Date(source.lastCrawled)
          }));
          setDiscoverySources(sourcesWithDates);
        }
        
        if (schemas.success) {
          const schemasWithDates = schemas.data.map((schema: any) => ({
            ...schema,
            generatedAt: new Date(schema.generatedAt)
          }));
          setDiscoveredSchemas(schemasWithDates);
        }
        
        if (stats.success) setDiscoveryStats(stats.data);
        
        addToLog('📡 Loaded data from Schema Discovery API');
      }
    } catch (error) {
      console.error('Failed to load from API:', error);
      addToLog('⚠️ Using demo data (API unavailable)');
    }
  };

  // Auto discovery interval
  useEffect(() => {
    if (autoDiscovery) {
      intervalRef.current = setInterval(() => {
        runDiscovery();
      }, 10000); // Every 10 seconds for demo
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoDiscovery]);

  const initializeDemoData = () => {
    const now = new Date();
    const sources: DiscoverySource[] = [
      {
        name: 'Staff Selection Commission',
        baseUrl: 'https://ssc.nic.in',
        searchPatterns: ['/apply/', '/recruitment/', '/notification/'],
        selectors: {
          examLinks: 'a[href*="apply"], a[href*="recruitment"]',
          examName: 'h1, h2, .title, .exam-name',
          organization: '.org-name, .header .logo',
          deadlines: '.deadline, .last-date, [class*="date"]'
        },
        priority: 1,
        lastCrawled: new Date(now.getTime() - 3600000), // 1 hour ago
        isActive: true,
        status: 'idle'
      },
      {
        name: 'Union Public Service Commission',
        baseUrl: 'https://upsc.gov.in',
        searchPatterns: ['/examinations/', '/apply/', '/recruitment/'],
        selectors: {
          examLinks: 'a[href*="examinations"]',
          examName: '.exam-title',
          organization: '.upsc-header',
          deadlines: '.registration-dates'
        },
        priority: 1,
        lastCrawled: new Date(now.getTime() - 7200000), // 2 hours ago
        isActive: true,
        status: 'idle'
      },
      {
        name: 'Banking Personnel Selection Institute',
        baseUrl: 'https://www.ibps.in',
        searchPatterns: ['/recruitment/', '/apply/'],
        selectors: {
          examLinks: 'a[href*="recruitment"], a[href*="cwe"]',
          examName: '.exam-name, h1',
          organization: '.ibps-logo',
          deadlines: '.important-dates'
        },
        priority: 2,
        lastCrawled: new Date(now.getTime() - 1800000), // 30 minutes ago
        isActive: true,
        status: 'idle'
      },
      {
        name: 'National Testing Agency',
        baseUrl: 'https://nta.ac.in',
        searchPatterns: ['/examinations/', '/apply/'],
        selectors: {
          examLinks: 'a[href*="examinations"]',
          examName: '.exam-title',
          organization: '.nta-header',
          deadlines: '.registration-dates'
        },
        priority: 2,
        lastCrawled: new Date(now.getTime() - 5400000), // 1.5 hours ago
        isActive: true,
        status: 'idle'
      }
    ];

    setDiscoverySources(sources);
    
    // Initialize some demo schemas
    const schemas: ExamSchema[] = [
      {
        examId: 'ssc-cgl-2024',
        version: 1,
        generatedAt: new Date(now.getTime() - 1800000),
        confidence: 95,
        source: 'Staff Selection Commission',
        url: 'https://ssc.nic.in/apply/ssc-cgl-2024/',
        fields: [
          { id: 'name', name: 'Full Name', type: 'text', required: true, validation: { minLength: 2, maxLength: 100 } },
          { id: 'dob', name: 'Date of Birth', type: 'date', required: true, validation: { minAge: 18, maxAge: 32 } },
          { id: 'category', name: 'Category', type: 'select', required: true, validation: { options: ['General', 'OBC', 'SC', 'ST'] } },
          { id: 'photo', name: 'Passport Photo', type: 'file', required: true, validation: { fileType: 'image', maxSize: '100KB' } },
          { id: 'signature', name: 'Signature', type: 'file', required: true, validation: { fileType: 'image', maxSize: '50KB' } }
        ],
        documentTypes: [
          { type: 'passport_photo', specifications: { size: '3.5cm x 4.5cm', background: 'white' }, examples: ['passport_photo_sample.jpg'] },
          { type: 'signature', specifications: { size: '3cm x 1cm', background: 'white' }, examples: ['signature_sample.jpg'] }
        ],
        metadata: {
          formComplexity: 'medium',
          estimatedSubmissionTime: 15,
          successRate: 87
        }
      }
    ];

    setDiscoveredSchemas(schemas);
    updateDiscoveryStats(sources, schemas);
  };

  const updateDiscoveryStats = (sources: DiscoverySource[], schemas: ExamSchema[]) => {
    const stats: DiscoveryStats = {
      totalDiscoveredForms: schemas.length,
      activeMonitoringTasks: sources.filter(s => s.isActive).length,
      recentChanges: Math.floor(Math.random() * 5),
      averageConfidence: schemas.reduce((acc, s) => acc + s.confidence, 0) / schemas.length || 0,
      formsByCategory: {
        'Government': schemas.filter(s => s.source.includes('Commission')).length,
        'Banking': schemas.filter(s => s.source.includes('Banking')).length,
        'Railway': 0,
        'Defense': 0
      },
      priorityDistribution: {
        'High': sources.filter(s => s.priority === 1).length,
        'Medium': sources.filter(s => s.priority === 2).length,
        'Low': sources.filter(s => s.priority === 3).length
      }
    };
    setDiscoveryStats(stats);
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDiscoveryLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const generateSchemaManually = async () => {
    if (!manualUrl.trim() || isGenerating) return;
    
    setIsGenerating(true);
    addToLog(`🔧 Manually generating schema for: ${manualUrl}`);

    try {
      const response = await fetch('/api/schema-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_schema',
          data: { url: manualUrl, source: 'Manual Generation' }
        })
      });

      const result = await response.json();

      if (result.success) {
        const newSchema = {
          ...result.data,
          generatedAt: new Date(result.data.generatedAt)
        };
        setDiscoveredSchemas(prev => [newSchema, ...prev]);
        addToLog(`✅ Generated schema: ${newSchema.examId} (confidence: ${Math.round(newSchema.confidence)}%)`);
        toast.success('Schema generated successfully!');
        setManualUrl('');
        setShowManualGeneration(false);
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      addToLog(`❌ Manual generation failed: ${error}`);
      toast.error('Schema generation failed. Please try again.');
    }

    setIsGenerating(false);
  };

  const runDiscovery = async () => {
    if (isDiscovering) return;
    
    setIsDiscovering(true);
    addToLog('🔍 Starting autonomous schema discovery...');

    try {
      // Call the API to start discovery
      const response = await fetch('/api/schema-discovery?action=discover');
      const result = await response.json();

      if (result.success && result.data.discovered) {
        const newSchema = {
          ...result.data.schema,
          generatedAt: new Date(result.data.schema.generatedAt)
        };
        setDiscoveredSchemas(prev => [newSchema, ...prev]);
        addToLog(`✅ Found new schema: ${newSchema.examId} (confidence: ${Math.round(newSchema.confidence)}%)`);
        toast.success(`New schema discovered!`);
      } else {
        addToLog(`ℹ️ No new schemas found in this discovery cycle`);
      }

      // Simulate updating sources status
      const activeSources = discoverySources.filter(s => s.isActive);
      for (const source of activeSources) {
        setDiscoverySources(prev => prev.map(s => 
          s.name === source.name ? { 
            ...s, 
            status: Math.random() > 0.7 ? 'success' : 'idle',
            lastCrawled: new Date()
          } : s
        ));
        
        addToLog(`🌐 Processed ${source.name} (${source.baseUrl})`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for visual effect
      }
    } catch (error) {
      addToLog(`❌ Discovery failed: ${error}`);
      toast.error('Discovery failed. Please try again.');
    }
    
    addToLog('🎉 Discovery cycle completed!');
    setIsDiscovering(false);
    
    // Update stats
    updateDiscoveryStats(discoverySources, discoveredSchemas);
  };

  const getSourceStatusIcon = (status: string) => {
    switch (status) {
      case 'crawling':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schema Engine Demo</h1>
              <p className="text-gray-600">Real-time autonomous schema discovery and monitoring</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <button
              onClick={runDiscovery}
              disabled={isDiscovering}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDiscovering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Discovering...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Run Discovery
                </>
              )}
            </button>
            
            <button
              onClick={() => setAutoDiscovery(!autoDiscovery)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                autoDiscovery 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {autoDiscovery ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Auto Discovery
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Auto Discovery
                </>
              )}
            </button>

            <button
              onClick={() => setShowManualGeneration(!showManualGeneration)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Manual Generation
            </button>

            <button
              onClick={loadFromAPI}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>

          {/* Manual Generation Panel */}
          {showManualGeneration && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Manual Schema Generation</h3>
              </div>
              
              <div className="flex gap-3">
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="Enter exam form URL (e.g., https://ssc.nic.in/apply/new-exam/)"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={generateSchemaManually}
                  disabled={!manualUrl.trim() || isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Schema
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                Enter a URL to manually generate a schema. The system will analyze the form and extract field information.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Discovery Sources */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Discovery Sources</h2>
              </div>
              
              <div className="space-y-3">
                {discoverySources.map((source, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSourceStatusIcon(source.status)}
                        <span className="font-medium text-sm">{source.name}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        source.priority === 1 ? 'bg-red-100 text-red-600' :
                        source.priority === 2 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        P{source.priority}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <Link className="w-3 h-3" />
                        <span className="truncate">{source.baseUrl}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Last: {formatDate(source.lastCrawled)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            {discoveryStats && (
              <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold">Discovery Stats</h2>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Schemas</span>
                    <span className="font-semibold">{discoveryStats.totalDiscoveredForms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Sources</span>
                    <span className="font-semibold">{discoveryStats.activeMonitoringTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Confidence</span>
                    <span className="font-semibold">{Math.round(discoveryStats.averageConfidence)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recent Changes</span>
                    <span className="font-semibold">{discoveryStats.recentChanges}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Discovered Schemas */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold">Discovered Schemas</h2>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      {discoveredSchemas.length} active
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoveredSchemas.map((schema) => (
                    <div
                      key={schema.examId}
                      onClick={() => setSelectedSchema(schema)}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-sm">{schema.examId}</h3>
                          <p className="text-xs text-gray-500">{schema.source}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(schema.confidence)}`}>
                          {Math.round(schema.confidence)}%
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateOnly(schema.generatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{schema.fields.length} fields</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className={`px-1 py-0.5 rounded ${getComplexityColor(schema.metadata.formComplexity)}`}>
                            {schema.metadata.formComplexity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Discovery Log */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-semibold">Discovery Log</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-h-64 overflow-y-auto">
                  {discoveryLog.length === 0 ? (
                    <div className="text-gray-500">No activity yet. Click "Run Discovery" to start...</div>
                  ) : (
                    discoveryLog.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schema Detail Modal */}
        {selectedSchema && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedSchema.examId}</h2>
                  <p className="text-gray-600">{selectedSchema.source}</p>
                </div>
                <button
                  onClick={() => setSelectedSchema(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Schema Metadata */}
                <div>
                  <h3 className="font-semibold mb-3">Schema Information</h3>
                  
                  {/* URL and Source */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Link className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900">Source URL</p>
                        <p className="text-sm text-blue-700 break-all">{selectedSchema.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700">Discovered from: {selectedSchema.source}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Confidence</div>
                      <div className="font-semibold">{Math.round(selectedSchema.confidence)}%</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Version</div>
                      <div className="font-semibold">v{selectedSchema.version}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Complexity</div>
                      <div className="font-semibold capitalize">{selectedSchema.metadata.formComplexity}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Success Rate</div>
                      <div className="font-semibold">{selectedSchema.metadata.successRate}%</div>
                    </div>
                  </div>
                  
                  {/* Additional Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Generated At</div>
                      <div className="font-semibold">{formatDateTime(selectedSchema.generatedAt)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Est. Submission Time</div>
                      <div className="font-semibold">{selectedSchema.metadata.estimatedSubmissionTime} min</div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <h3 className="font-semibold mb-3">Form Fields ({selectedSchema.fields.length})</h3>
                  <div className="space-y-2">
                    {selectedSchema.fields.map((field, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{field.name}</span>
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                        {field.validation && (
                          <div className="text-xs text-gray-500 mt-1">
                            Validation: {JSON.stringify(field.validation)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Types */}
                <div>
                  <h3 className="font-semibold mb-3">Document Types</h3>
                  <div className="space-y-2">
                    {selectedSchema.documentTypes.map((docType, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="font-medium capitalize">{docType.type.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Specifications: {JSON.stringify(docType.specifications)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}