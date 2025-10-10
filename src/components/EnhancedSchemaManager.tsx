/**
 * Enhanced Schema Management Dev Tool
 * Comprehensive interface for managing exam schemas
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  FileText,
  Settings,
  Zap,
  Globe,
  Save,
  Eye,
  Code,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Schema {
  examId: string;
  examName: string;
  version: string;
  lastUpdated: string;
  requirementsCount: number;
  size: number;
}

interface SchemaStats {
  totalSchemas: number;
  totalRequirements: number;
  averageRequirements: number;
  totalSize: number;
  lastUpdated: number | null;
}

interface EnhancementResult {
  examId: string;
  currentRequirements: number;
  enhancedRequirements: number;
  addedFields: string[];
  improvedValidations: string[];
  sources: string[];
}

export const EnhancedSchemaManager: React.FC = () => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [stats, setStats] = useState<SchemaStats | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'enhance' | 'discover' | 'analytics'>('overview');
  const [enhancement, setEnhancement] = useState<EnhancementResult | null>(null);

  // Discovery form
  const [discoveryQuery, setDiscoveryQuery] = useState('');
  const [discoveryResults, setDiscoveryResults] = useState<any>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // New schema form (keeping for backup)
  const [newSchema, setNewSchema] = useState({
    examId: '',
    examName: '',
    category: 'government',
    requirements: []
  });

  useEffect(() => {
    loadSchemas();
    loadStats();
  }, []);

  const loadSchemas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/schema-management?action=list');
      const data = await response.json();
      
      if (data.success) {
        // Ensure schemas is always an array with valid data
        const validSchemas = (data.data?.schemas || []).filter((schema: any) => 
          schema && typeof schema === 'object' && schema.examId
        );
        setSchemas(validSchemas);
      } else {
        toast.error('Failed to load schemas');
        setSchemas([]); // Set to empty array on error
      }
    } catch (error) {
      console.error('Error loading schemas:', error);
      toast.error('Error loading schemas');
      setSchemas([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/schema-management?action=stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const enhanceUPSCSchema = async () => {
    try {
      setIsLoading(true);
      toast.loading('Enhancing UPSC CSE schema...', { id: 'enhance' });

      const response = await fetch('/api/schema-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance',
          examId: 'upsc-cse',
          enhancementData: {
            sources: [
              'https://upsc.gov.in',
              'official-notifications',
              'previous-year-requirements',
              'comprehensive-research'
            ],
            improvements: [
              'Add comprehensive document requirements',
              'Enhanced validation rules',
              'Detailed specifications',
              'Common mistake guidelines'
            ]
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setEnhancement(data.data.enhancement);
        toast.success('UPSC CSE schema enhanced successfully!', { id: 'enhance' });
        loadSchemas();
        loadStats();
      } else {
        toast.error(`Enhancement failed: ${data.error}`, { id: 'enhance' });
      }
    } catch (error) {
      toast.error('Error enhancing schema', { id: 'enhance' });
    } finally {
      setIsLoading(false);
    }
  };

  const viewSchema = async (examId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/schema-management?action=read&examId=${examId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedSchema(data.data.schema);
        setActiveTab('manage');
      } else {
        toast.error('Failed to load schema details');
      }
    } catch (error) {
      toast.error('Error loading schema');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSchema = async (examId: string) => {
    if (!confirm(`Are you sure you want to delete schema '${examId}'?`)) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/schema-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          examId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Schema '${examId}' deleted successfully`);
        loadSchemas();
        loadStats();
      } else {
        toast.error(`Failed to delete schema: ${data.error}`);
      }
    } catch (error) {
      toast.error('Error deleting schema');
    } finally {
      setIsLoading(false);
    }
  };

  const createSchema = async () => {
    try {
      setIsLoading(true);
      const schema = {
        examId: newSchema.examId,
        examName: newSchema.examName,
        version: '1.0.0',
        lastUpdated: new Date(),
        requirements: [
          {
            id: 'photo',
            type: 'Photo',
            displayName: 'Recent Photograph',
            description: 'Recent passport size photograph',
            format: 'JPEG',
            maxSizeKB: 100,
            dimensions: '200x200',
            category: 'photo',
            mandatory: true,
            validationRules: [
              {
                type: 'strict',
                rule: 'file_size_limit',
                message: 'Photo file size must not exceed 100KB',
                field: 'photo',
                canOverride: false
              }
            ]
          }
        ]
      };

      const response = await fetch('/api/schema-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          examId: newSchema.examId,
          schema,
          category: newSchema.category
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Schema '${newSchema.examId}' created successfully`);
        setNewSchema({ examId: '', examName: '', category: 'government', requirements: [] });
        loadSchemas();
        loadStats();
        setActiveTab('overview');
      } else {
        toast.error(`Failed to create schema: ${data.error}`);
      }
    } catch (error) {
      toast.error('Error creating schema');
    } finally {
      setIsLoading(false);
    }
  };

  const discoverSchema = async () => {
    try {
      setIsDiscovering(true);
      toast.loading('Analyzing your request and discovering schema...', { id: 'discover' });

      // Parse natural language query
      const parsedQuery = parseNaturalLanguageQuery(discoveryQuery);
      
      // Get URLs and scrape data
      const discoveryResponse = await fetch('/api/intelligent-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: discoveryQuery,
          parsedData: parsedQuery,
          action: 'natural_language_discovery'
        })
      });

      const discoveryData = await discoveryResponse.json();
      
      if (discoveryData.success) {
        setDiscoveryResults(discoveryData.data);
        toast.success('Schema discovered successfully!', { id: 'discover' });
        
        // Auto-create schema if user confirms
        if (discoveryData.data.schema && confirm('Create this discovered schema automatically?')) {
          await createDiscoveredSchema(discoveryData.data.schema);
        }
      } else {
        toast.error(`Discovery failed: ${discoveryData.error}`, { id: 'discover' });
      }
    } catch (error) {
      toast.error('Error during schema discovery', { id: 'discover' });
    } finally {
      setIsDiscovering(false);
    }
  };

  const parseNaturalLanguageQuery = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Extract exam name
    let examName = '';
    let examId = '';
    let year = '';
    let websites: string[] = [];
    
    // Common exam patterns
    const examPatterns = {
      'jee main': { name: 'JEE Main', id: 'jee-main', sites: ['https://jeemain.nta.nic.in', 'https://nta.ac.in'] },
      'jee mains': { name: 'JEE Main', id: 'jee-main', sites: ['https://jeemain.nta.nic.in', 'https://nta.ac.in'] },
      'neet': { name: 'NEET UG', id: 'neet-ug', sites: ['https://neet.nta.nic.in', 'https://nta.ac.in'] },
      'upsc': { name: 'UPSC Civil Services', id: 'upsc-cse', sites: ['https://upsc.gov.in'] },
      'ssc cgl': { name: 'SSC CGL', id: 'ssc-cgl', sites: ['https://ssc.nic.in'] },
      'gate': { name: 'GATE', id: 'gate', sites: ['https://gate.iitd.ac.in', 'https://gate.iisc.ac.in'] },
      'cat': { name: 'CAT', id: 'cat', sites: ['https://iimcat.ac.in'] },
      'bank po': { name: 'Bank PO', id: 'bank-po', sites: ['https://www.ibps.in'] },
      'railway': { name: 'Railway Recruitment', id: 'railway', sites: ['https://www.rrbcdg.gov.in'] }
    };

    // Find matching exam
    for (const [pattern, data] of Object.entries(examPatterns)) {
      if (lowerQuery.includes(pattern)) {
        examName = data.name;
        examId = data.id;
        websites = data.sites;
        break;
      }
    }

    // Extract year
    const yearMatch = query.match(/20\d{2}/);
    if (yearMatch) {
      year = yearMatch[0];
      examId = examId ? `${examId}-${year}` : examId;
    }

    // If no specific exam found, try to extract from context
    if (!examName) {
      const words = query.split(' ');
      examName = words.filter(word => 
        word.length > 2 && 
        !['the', 'for', 'and', 'exam', 'registration', 'generate', 'schema'].includes(word.toLowerCase())
      ).join(' ');
      examId = examName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    return {
      examName,
      examId,
      year,
      websites,
      originalQuery: query,
      intent: lowerQuery.includes('registration') ? 'registration' : 'general',
      confidence: examName ? 0.9 : 0.5
    };
  };

  const createDiscoveredSchema = async (schema: any) => {
    try {
      const response = await fetch('/api/schema-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          examId: schema.examId,
          schema,
          category: schema.category || 'entrance'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Schema '${schema.examId}' created from discovery!`);
        loadSchemas();
        loadStats();
        setActiveTab('overview');
      } else {
        toast.error(`Failed to create discovered schema: ${data.error}`);
      }
    } catch (error) {
      toast.error('Error creating discovered schema');
    }
  };

  const filteredSchemas = (schemas || []).filter(schema => {
    if (!schema || typeof schema !== 'object') return false;
    const examName = schema.examName || '';
    const examId = schema.examId || '';
    const searchLower = (searchTerm || '').toLowerCase();
    return examName.toLowerCase().includes(searchLower) || 
           examId.toLowerCase().includes(searchLower);
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-md bg-blue-50">
            <Database className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Enhanced Schema Manager</h1>
            <p className="text-sm text-gray-600">Comprehensive exam schema management and enhancement tool</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSchemas}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-blue-50">
                <FileText className="text-blue-600" size={18} />
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Schemas</span>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSchemas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-green-50">
                <BarChart3 className="text-green-600" size={18} />
              </div>
              <div>
                <span className="text-sm text-gray-600">Requirements</span>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequirements}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-purple-50">
                <Monitor className="text-purple-600" size={18} />
              </div>
              <div>
                <span className="text-sm text-gray-600">Avg/Schema</span>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRequirements}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-orange-50">
                <Settings className="text-orange-600" size={18} />
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Size</span>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalSize)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-100">
        <nav className="flex space-x-3 bg-gray-50 p-2 rounded-md">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'manage', label: 'Manage', icon: Settings },
            { id: 'enhance', label: 'Enhance', icon: Zap },
            { id: 'discover', label: 'Discover', icon: Search },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                aria-current={activeTab === tab.id ? 'true' : undefined}
                className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-white shadow text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search schemas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
          </div>

          {/* Schema List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin mr-2" size={24} />
              <span>Loading schemas...</span>
            </div>
          ) : filteredSchemas.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 w-20 h-20 flex items-center justify-center rounded-full bg-gray-100">
                <FileText className="text-gray-400" size={36} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No schemas found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No schemas match your search criteria.' : 'No schemas available. Create your first schema to get started.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setActiveTab('discover')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                >
                  <Search size={16} />
                  Discover Schema
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchemas.map((schema) => (
              <div key={schema.examId} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{schema.examName}</h3>
                    <p className="text-sm text-gray-500">{schema.examId}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    v{schema.version}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Requirements</span>
                    <span className="font-medium">{schema.requirementsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size</span>
                    <span className="font-medium">{formatBytes(schema.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span className="font-medium">{new Date(schema.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewSchema(schema.examId)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() => viewSchema(schema.examId)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteSchema(schema.examId)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 flex items-center justify-center"
                    title="Delete schema"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'enhance' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Schema Enhancement Tool</h2>
            <p className="text-gray-600 mb-6">
              Enhance existing schemas with comprehensive requirements, validation rules, and specifications.
            </p>

            {/* UPSC Enhancement Section */}
            <div className="border border-orange-200 rounded-lg p-4 mb-6 bg-orange-50">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="text-orange-600" size={24} />
                <h3 className="text-lg font-semibold text-orange-900">UPSC CSE Schema Enhancement</h3>
              </div>
              <p className="text-orange-800 mb-4">
                The current UPSC CSE schema is limited. Click below to enhance it with comprehensive document requirements, 
                detailed specifications, and improved validation rules.
              </p>
              <button
                onClick={enhanceUPSCSchema}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                <Zap size={16} />
                {isLoading ? 'Enhancing...' : 'Enhance UPSC CSE Schema'}
              </button>
            </div>

            {/* Enhancement Results */}
            {enhancement && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <h3 className="text-lg font-semibold text-green-900">Enhancement Complete!</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-green-700">Before</p>
                    <p className="text-xl font-bold text-green-900">{enhancement.currentRequirements}</p>
                    <p className="text-xs text-green-600">requirements</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">After</p>
                    <p className="text-xl font-bold text-green-900">{enhancement.enhancedRequirements}</p>
                    <p className="text-xs text-green-600">requirements</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Added</p>
                    <p className="text-xl font-bold text-green-900">{enhancement.addedFields.length}</p>
                    <p className="text-xs text-green-600">new fields</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Enhanced</p>
                    <p className="text-xl font-bold text-green-900">{enhancement.improvedValidations.length}</p>
                    <p className="text-xs text-green-600">validations</p>
                  </div>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-green-800 font-medium">View Added Fields</summary>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {enhancement.addedFields.map((field, index) => (
                      <span key={index} className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Search className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Intelligent Schema Discovery</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Use natural language to describe the exam you want to create a schema for. Our AI will understand your request, 
              find the official website, and automatically extract all document requirements with formats and specifications.
            </p>

            {/* Natural Language Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe what you need</label>
                <textarea
                  value={discoveryQuery}
                  onChange={(e) => setDiscoveryQuery(e.target.value)}
                  placeholder="Example: Generate the schema for JEE Main exam registration 2025&#10;Example: Create schema for NEET UG application form with all document requirements&#10;Example: I need the document requirements for UPSC Civil Services examination"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={discoverSchema}
                  disabled={!discoveryQuery.trim() || isDiscovering}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Search size={16} className={isDiscovering ? 'animate-spin' : ''} />
                  {isDiscovering ? 'Discovering...' : 'Discover Schema'}
                </button>
                
                {discoveryQuery && (
                  <button
                    onClick={() => {
                      setDiscoveryQuery('');
                      setDiscoveryResults(null);
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Examples */}
            <div className="mt-6 border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Generate schema for JEE Main exam registration 2025",
                  "Create NEET UG application document requirements",
                  "UPSC Civil Services examination form schema",
                  "SSC CGL registration document specifications",
                  "GATE 2025 application form requirements",
                  "CAT exam registration documents needed"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setDiscoveryQuery(example)}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>

            {/* Discovery Results */}
            {discoveryResults && (
              <div className="mt-6 border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-600" size={24} />
                  <h3 className="text-lg font-semibold text-green-900">Discovery Complete!</h3>
                </div>
                
                {/* Enhanced Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-green-700">Exam Detected</p>
                      <p className="font-semibold text-green-900">{discoveryResults.examName}</p>
                      {discoveryResults.examDetails?.matchedDifferentiators?.length > 0 && (
                        <p className="text-xs text-green-600">
                          Matched: {discoveryResults.examDetails.matchedDifferentiators.join(', ')}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Document Requirements</p>
                      <p className="font-semibold text-green-900">{discoveryResults.requirements?.length || 0}</p>
                      {discoveryResults.fieldAnalysis && (
                        <p className="text-xs text-green-600">
                          {discoveryResults.fieldAnalysis.totalFieldsDetected} total fields detected
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Confidence</p>
                      <p className="font-semibold text-green-900">{(discoveryResults.confidence * 100).toFixed(0)}%</p>
                      <p className="text-xs text-green-600">
                        {discoveryResults.examDetails?.matchType} match
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Source Reliability</p>
                      <p className="font-semibold text-green-900">
                        {discoveryResults.sources?.reliability ? (discoveryResults.sources.reliability * 100).toFixed(0) + '%' : 'N/A'}
                      </p>
                      <p className="text-xs text-green-600">
                        {discoveryResults.sources?.allSources?.length || 0} sources
                      </p>
                    </div>
                  </div>
                </div>

                {/* Field Analysis */}
                {discoveryResults.fieldAnalysis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-3">Field Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-blue-700">Document Fields</p>
                        <p className="font-semibold text-blue-900">{discoveryResults.fieldAnalysis.fieldCategories.documents}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Personal Info</p>
                        <p className="font-semibold text-blue-900">{discoveryResults.fieldAnalysis.fieldCategories.personal}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Contact Fields</p>
                        <p className="font-semibold text-blue-900">{discoveryResults.fieldAnalysis.fieldCategories.contact}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Academic Fields</p>
                        <p className="font-semibold text-blue-900">{discoveryResults.fieldAnalysis.fieldCategories.academic}</p>
                      </div>
                    </div>
                    
                    {/* Non-document fields (excluded from schema) */}
                    {discoveryResults.fieldAnalysis.nonDocumentFields?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-700 mb-1">
                          Fields detected but excluded from schema (non-document):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {discoveryResults.fieldAnalysis.nonDocumentFields.map((field: string, index: number) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Requirements Preview */}
                {discoveryResults.requirements && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Document Requirements Generated:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {discoveryResults.requirements.map((req: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">{req.displayName}</h5>
                            <span className={`text-xs px-2 py-1 rounded ${
                              req.mandatory ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {req.mandatory ? 'Required' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{req.description}</p>
                          {req.specifications && (
                            <div className="text-xs text-gray-500">
                              {req.format && <span>Format: {req.format}</span>}
                              {req.maxSizeKB && <span className="ml-2">Max: {req.maxSizeKB}KB</span>}
                              {req.dimensions && <span className="ml-2">Size: {req.dimensions}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Sources */}
                {discoveryResults.sources && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Source Information</h4>
                    
                    {/* Primary Source */}
                    {discoveryResults.sources.primarySource && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 font-medium">Primary Source:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a 
                            href={discoveryResults.sources.primarySource} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {discoveryResults.sources.primarySource}
                          </a>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Primary
                          </span>
                        </div>
                        {discoveryResults.sources.lastVerified && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last verified: {discoveryResults.sources.lastVerified}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* All Sources */}
                    {discoveryResults.sources.allSources?.length > 1 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700">
                          View All Sources ({discoveryResults.sources.allSources.length})
                        </summary>
                        <div className="mt-2 space-y-2">
                          {discoveryResults.sources.allSources.map((source: string, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <a 
                                href={source} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                {source}
                              </a>
                              <span className="text-xs text-gray-500">
                                {discoveryResults.sources.sourceTitles?.[index] || 'Official Website'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}

                {/* Processing Steps */}
                {discoveryResults.processingSteps && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                      View Processing Steps ({discoveryResults.processingSteps.length})
                    </summary>
                    <div className="mt-2 space-y-1">
                      {discoveryResults.processingSteps.map((step: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  {discoveryResults.schema && (
                    <button
                      onClick={() => createDiscoveredSchema(discoveryResults.schema)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Save size={16} />
                      Create Schema
                    </button>
                  )}
                  
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Eye size={16} className="inline mr-2" />
                    View All Schemas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage' && selectedSchema && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selectedSchema.examName}</h2>
              <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                v{selectedSchema.version}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Requirements</p>
                <p className="text-2xl font-bold">{selectedSchema.requirements?.length || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Mandatory</p>
                <p className="text-2xl font-bold">
                  {selectedSchema.requirements?.filter((req: any) => req.mandatory).length || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Optional</p>
                <p className="text-2xl font-bold">
                  {selectedSchema.requirements?.filter((req: any) => !req.mandatory).length || 0}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Requirements</h3>
              {selectedSchema.requirements?.map((req: any, index: number) => (
                <div key={req.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{req.displayName}</h4>
                    <div className="flex items-center gap-2">
                      {req.mandatory ? (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                      )}
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {req.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                  {req.format && (
                    <p className="text-xs text-gray-500">
                      Format: {req.format} | Max Size: {req.maxSizeKB}KB
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Schema JSON</h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                {JSON.stringify(selectedSchema, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Schema Distribution</h3>
              <div className="space-y-3">
                {(schemas || []).map((schema) => {
                  const maxRequirements = Math.max(...(schemas || []).map(s => s?.requirementsCount || 0));
                  const percentage = maxRequirements > 0 ? ((schema?.requirementsCount || 0) / maxRequirements) * 100 : 0;
                  
                  return (
                    <div key={schema?.examId || Math.random()} className="flex justify-between items-center">
                      <span className="text-sm">{schema?.examName || 'Unknown Exam'}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-8">{schema?.requirementsCount || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Schema Validation</span>
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">File System Access</span>
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Endpoints</span>
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Enhancement Engine</span>
                  <CheckCircle className="text-green-600" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};