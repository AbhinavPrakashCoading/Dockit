'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  Download, 
  Copy, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Settings,
  Clock,
  Database,
  Globe,
  FileImage,
  Eye,
  Code2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ExamSchema {
  exam: string;
  documents: Array<{
    type: string;
    requirements: {
      format?: string[];
      size_kb?: { min?: number; max?: number };
      size_mb?: { min?: number; max?: number };
      dimensions?: string;
      color?: string;
      background?: string;
      notes?: string[];
    };
  }>;
  extractedFrom?: string;
  extractedAt?: string;
}

interface GenerationStats {
  examName: string;
  duration: number;
  documentsFound: number;
  sourceUrl: string;
  timestamp: string;
}

export default function SchemaExtractionDevTool() {
  const [examName, setExamName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [generatedSchema, setGeneratedSchema] = useState<ExamSchema | null>(null);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [options, setOptions] = useState({
    maxSearchResults: 8,
    timeout: 45000,
    includeOfficialOnly: true,
    preferPdfs: true
  });
  const [history, setHistory] = useState<GenerationStats[]>([]);

  // Popular exam examples
  const examExamples = [
    'IBPS Clerk 2025',
    'SSC CGL 2025',
    'RRB NTPC 2025',
    'NEET 2025',
    'JEE Main 2025',
    'UPSC CSE 2025',
    'SBI PO 2025',
    'GATE 2025'
  ];

  const handleGenerateSchema = async () => {
    if (!examName.trim()) {
      toast.error('Please enter an exam name');
      return;
    }

    setIsGenerating(true);
    setProgress('Initializing schema extraction...');
    setGeneratedSchema(null);
    setStats(null);

    const startTime = Date.now();

    try {
      // Simulate progress updates
      const progressSteps = [
        'Searching for official exam content...',
        'Extracting content from PDFs and websites...',
        'Analyzing document requirements...',
        'Building structured schema...',
        'Validating and finalizing schema...'
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setProgress(progressSteps[currentStep]);
          currentStep++;
        }
      }, 2000);

      // Call the API
      const response = await fetch('/api/schema-extraction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examName: examName.trim(),
          options
        }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (data.success) {
        const duration = Date.now() - startTime;
        setGeneratedSchema(data.data.schema);
        
        const newStats: GenerationStats = {
          examName: data.data.schema.exam,
          duration,
          documentsFound: data.data.schema.documents.length,
          sourceUrl: data.data.schema.extractedFrom || 'Multiple sources',
          timestamp: new Date().toISOString()
        };
        
        setStats(newStats);
        setHistory(prev => [newStats, ...prev.slice(0, 9)]); // Keep last 10
        
        setProgress('Schema generated successfully!');
        toast.success(`Generated schema for ${data.data.schema.exam}`);
      } else {
        throw new Error(data.error || 'Schema generation failed');
      }

    } catch (error) {
      console.error('Schema generation failed:', error);
      setProgress('Generation failed');
      toast.error(`Failed to generate schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copySchemaToClipboard = () => {
    if (!generatedSchema) return;
    
    navigator.clipboard.writeText(JSON.stringify(generatedSchema, null, 2));
    toast.success('Schema copied to clipboard!');
  };

  const downloadSchema = () => {
    if (!generatedSchema) return;
    
    const blob = new Blob([JSON.stringify(generatedSchema, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedSchema.exam.toLowerCase().replace(/\s+/g, '-')}-schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Schema downloaded!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schema Extraction Engine</h1>
              <p className="text-gray-600">Autonomous exam schema generation dev tool</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>How it works:</strong> Enter any competitive exam name and the engine will automatically 
              search official websites, extract document requirements, and generate a structured JSON schema.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Search className="mr-2 h-5 w-5 text-blue-600" />
                Generate Schema
              </h2>

              {/* Exam Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g., IBPS Clerk 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isGenerating}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateSchema()}
                />
              </div>

              {/* Quick Examples */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Examples
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {examExamples.slice(0, 6).map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setExamName(example)}
                      disabled={isGenerating}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border disabled:opacity-50"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <Settings className="mr-1 h-4 w-4" />
                  Advanced Options
                </button>
                
                {showAdvancedOptions && (
                  <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-md">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max Search Results</label>
                      <input
                        type="number"
                        value={options.maxSearchResults}
                        onChange={(e) => setOptions(prev => ({ ...prev, maxSearchResults: parseInt(e.target.value) || 8 }))}
                        className="w-full text-sm px-2 py-1 border rounded"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Timeout (ms)</label>
                      <input
                        type="number"
                        value={options.timeout}
                        onChange={(e) => setOptions(prev => ({ ...prev, timeout: parseInt(e.target.value) || 45000 }))}
                        className="w-full text-sm px-2 py-1 border rounded"
                        min="10000"
                        max="120000"
                        step="5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={options.includeOfficialOnly}
                          onChange={(e) => setOptions(prev => ({ ...prev, includeOfficialOnly: e.target.checked }))}
                          className="mr-2"
                        />
                        Official sources only
                      </label>
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={options.preferPdfs}
                          onChange={(e) => setOptions(prev => ({ ...prev, preferPdfs: e.target.checked }))}
                          className="mr-2"
                        />
                        Prefer PDF documents
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateSchema}
                disabled={isGenerating || !examName.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Generate Schema</span>
                  </>
                )}
              </button>

              {/* Progress */}
              {isGenerating && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-blue-900">Processing...</span>
                  </div>
                  <p className="text-xs text-blue-700">{progress}</p>
                  <div className="mt-2 bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 w-3/5"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Generation History */}
            {history.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-gray-600" />
                  Recent Generations
                </h3>
                <div className="space-y-2">
                  {history.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <p className="font-medium">{item.examName}</p>
                        <p className="text-xs text-gray-500">{item.documentsFound} documents</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{(item.duration / 1000).toFixed(1)}s</p>
                        <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {stats && (
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{(stats.duration / 1000).toFixed(1)}s</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Documents</p>
                      <p className="font-semibold">{stats.documentsFound}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Source</p>
                      <p className="font-semibold text-xs">{stats.sourceUrl.includes('http') ? 'Official' : 'Fallback'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-green-600">Success</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {generatedSchema ? (
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Schema Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{generatedSchema.exam}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Generated {generatedSchema.documents.length} document requirements
                      </p>
                      {generatedSchema.extractedFrom && (
                        <p className="text-xs text-blue-600 mt-1">
                          Source: {generatedSchema.extractedFrom}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={copySchemaToClipboard}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={downloadSchema}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document Requirements */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Document Requirements</h4>
                  <div className="space-y-4">
                    {generatedSchema.documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <FileImage className="h-5 w-5 text-indigo-600 mr-2" />
                          <h5 className="font-semibold text-gray-900 capitalize">{doc.type}</h5>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {doc.requirements.format && (
                            <div>
                              <span className="font-medium text-gray-700">Format:</span>
                              <span className="ml-2 text-gray-600">{doc.requirements.format.join(', ')}</span>
                            </div>
                          )}
                          
                          {doc.requirements.size_kb && (
                            <div>
                              <span className="font-medium text-gray-700">Size:</span>
                              <span className="ml-2 text-gray-600">
                                {doc.requirements.size_kb.min 
                                  ? `${doc.requirements.size_kb.min}-${doc.requirements.size_kb.max} KB`
                                  : `Max ${doc.requirements.size_kb.max} KB`
                                }
                              </span>
                            </div>
                          )}
                          
                          {doc.requirements.dimensions && (
                            <div>
                              <span className="font-medium text-gray-700">Dimensions:</span>
                              <span className="ml-2 text-gray-600">{doc.requirements.dimensions}</span>
                            </div>
                          )}
                          
                          {doc.requirements.color && (
                            <div>
                              <span className="font-medium text-gray-700">Color:</span>
                              <span className="ml-2 text-gray-600 capitalize">{doc.requirements.color}</span>
                            </div>
                          )}
                          
                          {doc.requirements.background && (
                            <div>
                              <span className="font-medium text-gray-700">Background:</span>
                              <span className="ml-2 text-gray-600 capitalize">{doc.requirements.background}</span>
                            </div>
                          )}
                        </div>
                        
                        {doc.requirements.notes && doc.requirements.notes.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-700 block mb-1">Notes:</span>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {doc.requirements.notes.map((note, noteIndex) => (
                                <li key={noteIndex} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{note}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw JSON View */}
                <div className="border-t border-gray-200">
                  <details className="p-6">
                    <summary className="cursor-pointer flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      <Code2 className="h-4 w-4 mr-2" />
                      View Raw JSON Schema
                    </summary>
                    <pre className="mt-4 bg-gray-50 p-4 rounded-md text-xs overflow-auto max-h-96 border">
                      {JSON.stringify(generatedSchema, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="max-w-md mx-auto">
                  <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Schema Generated</h3>
                  <p className="text-gray-600 mb-6">
                    Enter an exam name and click "Generate Schema" to see the autonomous extraction in action.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-md text-left">
                    <h4 className="font-medium text-gray-900 mb-2">Try these examples:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• IBPS Clerk 2025</li>
                      <li>• SSC CGL 2025</li>
                      <li>• NEET 2025</li>
                      <li>• JEE Main 2025</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}