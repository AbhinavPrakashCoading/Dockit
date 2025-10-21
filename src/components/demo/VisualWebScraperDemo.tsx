/**
 * Visual Web Scraper Demo Component
 * Interactive demonstration of autonomous form scraping and analysis
 */

'use client';

import React, { useState, useRef } from 'react';
import { 
  Globe, 
  Search, 
  Eye, 
  Brain, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  Zap,
  FileText,
  Image as ImageIcon,
  Code,
  Target,
  TrendingUp,
  MapPin,
  Link,
  Settings,
  Play,
  Pause,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ScrapingTarget {
  url: string;
  name: string;
  organization: string;
  status: 'idle' | 'scraping' | 'analyzing' | 'complete' | 'error';
  progress: number;
}

interface DetectedField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'date' | 'file' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  placeholder?: string;
  validation?: string;
  acceptedFormats?: string[];
  maxSize?: number;
  selector: string;
  confidence: number;
}

interface VisualRequirement {
  type: 'photo' | 'signature' | 'document';
  specifications: {
    background?: string;
    dimensions?: string;
    format?: string;
    quality?: string;
    content?: string[];
  };
  exampleImage?: string;
  confidence: number;
}

interface ScrapingResult {
  examId: string;
  examName: string;
  organizationName: string;
  formUrl: string;
  lastUpdated: Date;
  detectedFields: DetectedField[];
  visualRequirements: VisualRequirement[];
  confidence: number;
  metadata: {
    complexity: string;
    fieldCount: number;
    estimatedTime: number;
    pageLoadTime: number;
    analysisTime: number;
  };
}

export function VisualWebScraperDemo() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isCustomUrl, setIsCustomUrl] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<ScrapingTarget | null>(null);
  const [scrapingResults, setScrapingResults] = useState<ScrapingResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ScrapingResult | null>(null);
  const [scrapingLog, setScrapingLog] = useState<string[]>([]);
  const [isScraping, setIsScraping] = useState(false);

  const predefinedTargets = [
    {
      url: 'https://ssc.nic.in/apply/ssc-cgl-2024/',
      name: 'SSC CGL 2024',
      organization: 'Staff Selection Commission',
      status: 'idle' as const,
      progress: 0
    },
    {
      url: 'https://upsc.gov.in/examinations/civil-services-2024/',
      name: 'Civil Services 2024',
      organization: 'Union Public Service Commission',
      status: 'idle' as const,
      progress: 0
    },
    {
      url: 'https://www.ibps.in/recruitment/po-2024/',
      name: 'IBPS PO 2024',
      organization: 'Banking Personnel Selection Institute',
      status: 'idle' as const,
      progress: 0
    }
  ];

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setScrapingLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const simulateFormScraping = async (target: ScrapingTarget) => {
    setIsScraping(true);
    setCurrentTarget({ ...target, status: 'scraping', progress: 0 });
    addToLog(`🌐 Starting form analysis for: ${target.name}`);

    // Phase 1: Page Loading
    addToLog(`📡 Loading page: ${target.url}`);
    setCurrentTarget(prev => prev ? { ...prev, progress: 10 } : null);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Phase 2: DOM Analysis
    addToLog(`🔍 Analyzing page structure and form elements`);
    setCurrentTarget(prev => prev ? { ...prev, status: 'analyzing', progress: 30 } : null);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Phase 3: Field Detection
    addToLog(`🎯 Detecting form fields and input types`);
    setCurrentTarget(prev => prev ? { ...prev, progress: 50 } : null);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Phase 4: Visual Analysis
    addToLog(`👁️ Analyzing visual requirements and example images`);
    setCurrentTarget(prev => prev ? { ...prev, progress: 70 } : null);
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Phase 5: Schema Generation
    addToLog(`⚙️ Generating intelligent schema with validation rules`);
    setCurrentTarget(prev => prev ? { ...prev, progress: 90 } : null);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate realistic result
    const result: ScrapingResult = {
      examId: `${target.organization.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      examName: target.name,
      organizationName: target.organization,
      formUrl: target.url,
      lastUpdated: new Date(),
      detectedFields: [
        {
          id: 'full_name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your full name as per documents',
          validation: 'minLength:2,maxLength:100',
          selector: 'input[name="fullName"]',
          confidence: 95
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'Enter valid email address',
          validation: 'email',
          selector: 'input[type="email"]',
          confidence: 98
        },
        {
          id: 'mobile',
          label: 'Mobile Number',
          type: 'text',
          required: true,
          placeholder: '10-digit mobile number',
          validation: 'pattern:^[0-9]{10}$',
          selector: 'input[name="mobile"]',
          confidence: 92
        },
        {
          id: 'dob',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          validation: 'minAge:18,maxAge:35',
          selector: 'input[type="date"]',
          confidence: 90
        },
        {
          id: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          validation: 'options:General,OBC,SC,ST',
          selector: 'select[name="category"]',
          confidence: 88
        },
        {
          id: 'photo',
          label: 'Passport Size Photo',
          type: 'file',
          required: true,
          acceptedFormats: ['jpg', 'jpeg', 'png'],
          maxSize: 100,
          validation: 'fileType:image,maxSize:100KB',
          selector: 'input[type="file"][accept*="image"]',
          confidence: 93
        },
        {
          id: 'signature',
          label: 'Signature',
          type: 'file',
          required: true,
          acceptedFormats: ['jpg', 'jpeg', 'png'],
          maxSize: 50,
          validation: 'fileType:image,maxSize:50KB',
          selector: 'input[type="file"][name*="signature"]',
          confidence: 91
        }
      ],
      visualRequirements: [
        {
          type: 'photo',
          specifications: {
            background: 'Plain white or light colored background',
            dimensions: '3.5cm x 4.5cm (passport size)',
            format: 'JPEG/PNG, minimum 200 DPI',
            quality: 'Clear, recent photograph (within 6 months)',
            content: ['Single person visible', 'Face clearly visible', 'Neutral expression', 'No head covering (except religious)']
          },
          exampleImage: '/examples/passport-photo-sample.jpg',
          confidence: 87
        },
        {
          type: 'signature',
          specifications: {
            background: 'White background only',
            dimensions: '3cm x 1cm',
            format: 'JPEG/PNG, black or blue ink',
            quality: 'Clear, legible signature',
            content: ['Single signature only', 'Dark ink (black/blue)', 'Clear contrast', 'No background text']
          },
          exampleImage: '/examples/signature-sample.jpg',
          confidence: 85
        }
      ],
      confidence: 91,
      metadata: {
        complexity: Math.random() > 0.5 ? 'medium' : 'high',
        fieldCount: 7,
        estimatedTime: 12 + Math.floor(Math.random() * 8),
        pageLoadTime: 2.3 + Math.random() * 1.5,
        analysisTime: 4.1 + Math.random() * 2.2
      }
    };

    setCurrentTarget(prev => prev ? { ...prev, status: 'complete', progress: 100 } : null);
    addToLog(`✅ Analysis complete! Generated schema with ${result.detectedFields.length} fields (${result.confidence}% confidence)`);
    
    setScrapingResults(prev => [result, ...prev]);
    toast.success(`Successfully analyzed ${target.name}!`);
    
    setTimeout(() => {
      setIsScraping(false);
      setCurrentTarget(null);
    }, 1000);
  };

  const startScraping = async (target?: ScrapingTarget) => {
    if (isScraping) return;

    let targetToUse: ScrapingTarget;

    if (target) {
      targetToUse = target;
    } else if (isCustomUrl && targetUrl.trim()) {
      targetToUse = {
        url: targetUrl.trim(),
        name: 'Custom Form',
        organization: 'Custom Analysis',
        status: 'idle',
        progress: 0
      };
    } else {
      toast.error('Please select a target or enter a custom URL');
      return;
    }

    await simulateFormScraping(targetToUse);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scraping':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'analyzing':
        return <Brain className="w-4 h-4 animate-pulse text-purple-500" />;
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'file': return <ImageIcon className="w-4 h-4" />;
      case 'email': return <Target className="w-4 h-4" />;
      case 'date': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Visual Web Scraper Demo</h1>
              <p className="text-gray-600">Autonomous form analysis and intelligent schema generation</p>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Scraping Targets</h3>
            
            {/* Predefined Targets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {predefinedTargets.map((target, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => startScraping(target)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(target.status)}
                      <h4 className="font-medium">{target.name}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{target.organization}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Link className="w-3 h-3" />
                    <span className="truncate">{target.url}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom URL */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="customUrl"
                  checked={isCustomUrl}
                  onChange={(e) => setIsCustomUrl(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="customUrl" className="font-medium">Custom URL Analysis</label>
              </div>
              
              {isCustomUrl && (
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="Enter form URL to analyze (e.g., https://example.com/form)"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => startScraping()}
                    disabled={isScraping || !targetUrl.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isScraping ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Analyze Form
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Analysis */}
          <div className="lg:col-span-1">
            {currentTarget && (
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold">Current Analysis</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{currentTarget.name}</span>
                      {getStatusIcon(currentTarget.status)}
                    </div>
                    <p className="text-sm text-gray-600">{currentTarget.organization}</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{currentTarget.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${currentTarget.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Status: <span className="capitalize font-medium">{currentTarget.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Log */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold">Analysis Log</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-h-64 overflow-y-auto">
                  {scrapingLog.length === 0 ? (
                    <div className="text-gray-500">No activity yet. Click a target to start analysis...</div>
                  ) : (
                    scrapingLog.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">Analysis Results</h2>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      {scrapingResults.length} analyzed
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {scrapingResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
                    <p className="text-gray-600">Select a target above to start form analysis</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scrapingResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedResult(result)}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium">{result.examName}</h3>
                            <p className="text-sm text-gray-600">{result.organizationName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(result.metadata.complexity)}`}>
                              {result.metadata.complexity}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                              {result.confidence}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{result.detectedFields.length} fields</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>{result.visualRequirements.length} requirements</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{result.metadata.estimatedTime}min</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Result Detail Modal */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedResult.examName}</h2>
                  <p className="text-gray-600">{selectedResult.organizationName}</p>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Analysis Summary */}
                <div>
                  <h3 className="font-semibold mb-3">Analysis Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Confidence Score</div>
                      <div className="font-semibold">{selectedResult.confidence}%</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Fields Detected</div>
                      <div className="font-semibold">{selectedResult.detectedFields.length}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Complexity</div>
                      <div className="font-semibold capitalize">{selectedResult.metadata.complexity}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Estimated Time</div>
                      <div className="font-semibold">{selectedResult.metadata.estimatedTime}min</div>
                    </div>
                  </div>
                </div>

                {/* Source Information */}
                <div>
                  <h3 className="font-semibold mb-3">Source Information</h3>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Link className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900">Form URL</p>
                        <p className="text-sm text-blue-700 break-all">{selectedResult.formUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detected Fields */}
                <div>
                  <h3 className="font-semibold mb-3">Detected Form Fields ({selectedResult.detectedFields.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedResult.detectedFields.map((field, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getFieldTypeIcon(field.type)}
                            <span className="font-medium">{field.label}</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{field.confidence}%</span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Selector: <code className="bg-gray-100 px-1 rounded">{field.selector}</code></div>
                          {field.validation && <div>Validation: {field.validation}</div>}
                          {field.placeholder && <div>Placeholder: "{field.placeholder}"</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Requirements */}
                <div>
                  <h3 className="font-semibold mb-3">Visual Requirements</h3>
                  <div className="space-y-3">
                    {selectedResult.visualRequirements.map((req, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            <span className="font-medium capitalize">{req.type.replace('_', ' ')}</span>
                          </div>
                          <span className="text-xs text-gray-500">{req.confidence}% confidence</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {req.specifications.background && (
                            <div><strong>Background:</strong> {req.specifications.background}</div>
                          )}
                          {req.specifications.dimensions && (
                            <div><strong>Dimensions:</strong> {req.specifications.dimensions}</div>
                          )}
                          {req.specifications.format && (
                            <div><strong>Format:</strong> {req.specifications.format}</div>
                          )}
                          {req.specifications.quality && (
                            <div><strong>Quality:</strong> {req.specifications.quality}</div>
                          )}
                          {req.specifications.content && (
                            <div>
                              <strong>Content Requirements:</strong>
                              <ul className="list-disc list-inside ml-4 mt-1">
                                {req.specifications.content.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
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