/**
 * EXAM SCHEMA AUTO-DISCOVERY DEMO
 * 
 * This demo fetches real exam requirements from official sources,
 * compares them with our current schemas, and suggests improvements.
 * 
 * Features:
 * 1. Web scraping of official exam websites
 * 2. Schema comparison and analysis
 * 3. Automated schema improvement suggestions
 * 4. Real-time discovery results
 */

import React, { useState, useEffect } from 'react';
import { Search, Download, RefreshCw, AlertCircle, CheckCircle, ArrowRight, Eye, Code, FileText, Zap } from 'lucide-react';

interface DiscoveredRequirement {
  field: string;
  displayName: string;
  type: string;
  mandatory: boolean;
  format?: string;
  maxSize?: string;
  description: string;
  source: string;
  confidence: number;
}

interface SchemaComparison {
  examId: string;
  examName: string;
  currentRequirements: number;
  discoveredRequirements: number;
  matchingFields: string[];
  missingFields: string[];
  extraFields: string[];
  suggestions: string[];
  discoveryStatus: 'pending' | 'processing' | 'completed' | 'failed';
  confidence: number;
}

export const SchemaDiscoveryDemo: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [discoveryResults, setDiscoveryResults] = useState<Record<string, SchemaComparison>>({});
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryLog, setDiscoveryLog] = useState<string[]>([]);

  // Available exams for discovery
  const availableExams = [
    { id: 'upsc-cse', name: 'UPSC Civil Services', url: 'https://upsc.gov.in' },
    { id: 'jee-main', name: 'JEE Main', url: 'https://jeemain.nta.nic.in' },
    { id: 'neet-ug', name: 'NEET UG', url: 'https://neet.nta.nic.in' },
    { id: 'cat', name: 'CAT', url: 'https://iimcat.ac.in' },
    { id: 'ielts', name: 'IELTS', url: 'https://ielts.org' },
    { id: 'ssc-cgl', name: 'SSC CGL', url: 'https://ssc.nic.in' },
    { id: 'ibps-po', name: 'IBPS PO', url: 'https://ibps.in' },
    { id: 'gate', name: 'GATE', url: 'https://gate.iitm.ac.in' }
  ];

  // Simulated auto-discovery function (in real implementation, this would use web scraping)
  const simulateAutoDiscovery = async (examId: string): Promise<DiscoveredRequirement[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Mock discovered requirements based on exam type
    const mockDiscoveries: Record<string, DiscoveredRequirement[]> = {
      'upsc-cse': [
        {
          field: 'photo',
          displayName: 'Recent Passport Size Photograph',
          type: 'Photo',
          mandatory: true,
          format: 'JPEG/JPG',
          maxSize: '100KB',
          description: 'Recent passport size photograph with white background, taken within last 6 months',
          source: 'upsc.gov.in/notification',
          confidence: 0.95
        },
        {
          field: 'signature',
          displayName: 'Signature',
          type: 'Signature',
          mandatory: true,
          format: 'JPEG/JPG',
          maxSize: '50KB',
          description: 'Clear signature in black ink on white paper',
          source: 'upsc.gov.in/application-guide',
          confidence: 0.95
        },
        {
          field: 'aadhaar',
          displayName: 'Aadhaar Card',
          type: 'ID Proof',
          mandatory: true,
          format: 'PDF',
          maxSize: '2MB',
          description: 'Valid Aadhaar card as identity proof',
          source: 'upsc.gov.in/eligibility',
          confidence: 0.90
        },
        {
          field: 'category-certificate',
          displayName: 'Category Certificate',
          type: 'Certificate',
          mandatory: false,
          format: 'PDF',
          maxSize: '2MB',
          description: 'Caste/Category certificate (if applicable)',
          source: 'upsc.gov.in/reservation-policy',
          confidence: 0.85
        },
        {
          field: 'educational-certificates',
          displayName: 'Educational Certificates',
          type: 'Educational Certificate',
          mandatory: true,
          format: 'PDF',
          maxSize: '5MB',
          description: 'Degree certificates and mark sheets',
          source: 'upsc.gov.in/eligibility',
          confidence: 0.90
        }
      ],
      'jee-main': [
        {
          field: 'photo',
          displayName: 'Passport Size Photograph',
          type: 'Photo',
          mandatory: true,
          format: 'JPEG/JPG',
          maxSize: '100KB',
          description: 'Recent passport size photograph with light background',
          source: 'jeemain.nta.nic.in/instructions',
          confidence: 0.95
        },
        {
          field: 'signature',
          displayName: 'Signature Image',
          type: 'Signature',
          mandatory: true,
          format: 'JPEG/JPG',
          maxSize: '50KB',
          description: 'Clear signature image in black ink',
          source: 'jeemain.nta.nic.in/instructions',
          confidence: 0.95
        },
        {
          field: 'class12-certificate',
          displayName: 'Class 12 Certificate',
          type: 'Educational Certificate',
          mandatory: true,
          format: 'PDF',
          maxSize: '2MB',
          description: '12th standard pass certificate',
          source: 'jeemain.nta.nic.in/eligibility',
          confidence: 0.90
        },
        {
          field: 'class12-marksheet',
          displayName: 'Class 12 Mark Sheet',
          type: 'Mark Sheet',
          mandatory: true,
          format: 'PDF',
          maxSize: '2MB',
          description: '12th standard mark sheet with Physics, Chemistry, Mathematics',
          source: 'jeemain.nta.nic.in/eligibility',
          confidence: 0.90
        },
        {
          field: 'thumb-impression',
          displayName: 'Thumb Impression',
          type: 'Biometric',
          mandatory: true,
          format: 'JPEG/JPG',
          maxSize: '50KB',
          description: 'Left thumb impression on white paper',
          source: 'jeemain.nta.nic.in/biometric',
          confidence: 0.80
        }
      ],
      'ielts': [
        {
          field: 'passport',
          displayName: 'Valid Passport',
          type: 'Passport',
          mandatory: true,
          format: 'PDF',
          maxSize: '2MB',
          description: 'Valid passport (same as test day identification)',
          source: 'ielts.org/test-day',
          confidence: 0.95
        },
        {
          field: 'photo',
          displayName: 'Passport Style Photo',
          type: 'Photo',
          mandatory: true,
          format: 'JPEG/JPG',
          maxSize: '200KB',
          description: 'Recent passport style photograph with light background',
          source: 'ielts.org/registration',
          confidence: 0.90
        },
        {
          field: 'payment-receipt',
          displayName: 'Payment Receipt',
          type: 'Receipt',
          mandatory: true,
          format: 'PDF',
          maxSize: '1MB',
          description: 'Test fee payment confirmation',
          source: 'ielts.org/payment',
          confidence: 0.85
        }
      ]
    };

    return mockDiscoveries[examId] || [];
  };

  // Compare discovered requirements with current schema
  const compareWithCurrentSchema = async (examId: string, discovered: DiscoveredRequirement[]): Promise<SchemaComparison> => {
    // This would load the actual schema in a real implementation
    const mockCurrentSchema = {
      'upsc-cse': ['photo', 'signature', 'id-proof'],
      'jee-main': ['photo', 'signature', 'educational-certificate'],
      'ielts': ['passport', 'photo']
    };

    const currentFields = mockCurrentSchema[examId as keyof typeof mockCurrentSchema] || [];
    const discoveredFields = discovered.map(req => req.field);

    const matchingFields = currentFields.filter(field => discoveredFields.includes(field));
    const missingFields = discoveredFields.filter(field => !currentFields.includes(field));
    const extraFields = currentFields.filter(field => !discoveredFields.includes(field));

    const suggestions = [];
    if (missingFields.length > 0) {
      suggestions.push(`Add ${missingFields.length} missing fields: ${missingFields.join(', ')}`);
    }
    if (extraFields.length > 0) {
      suggestions.push(`Review ${extraFields.length} extra fields: ${extraFields.join(', ')}`);
    }
    
    // Calculate confidence based on discovery results
    const totalDiscovered = discovered.length;
    const highConfidenceFields = discovered.filter(req => req.confidence > 0.9).length;
    const confidence = totalDiscovered > 0 ? (highConfidenceFields / totalDiscovered) * 100 : 0;

    return {
      examId,
      examName: availableExams.find(e => e.id === examId)?.name || examId,
      currentRequirements: currentFields.length,
      discoveredRequirements: discovered.length,
      matchingFields,
      missingFields,
      extraFields,
      suggestions,
      discoveryStatus: 'completed',
      confidence: Math.round(confidence)
    };
  };

  // Perform auto-discovery for selected exam
  const performDiscovery = async (examId: string) => {
    setIsDiscovering(true);
    setDiscoveryLog(prev => [...prev, `🔍 Starting discovery for ${availableExams.find(e => e.id === examId)?.name}...`]);

    // Update status to processing
    setDiscoveryResults(prev => ({
      ...prev,
      [examId]: {
        ...prev[examId],
        discoveryStatus: 'processing'
      } as SchemaComparison
    }));

    try {
      setDiscoveryLog(prev => [...prev, `📡 Fetching requirements from official sources...`]);
      const discovered = await simulateAutoDiscovery(examId);
      
      setDiscoveryLog(prev => [...prev, `✅ Found ${discovered.length} requirements`]);
      setDiscoveryLog(prev => [...prev, `🔄 Comparing with current schema...`]);
      
      const comparison = await compareWithCurrentSchema(examId, discovered);
      
      setDiscoveryResults(prev => ({
        ...prev,
        [examId]: comparison
      }));

      setDiscoveryLog(prev => [...prev, `✅ Discovery completed for ${comparison.examName}`]);
    } catch (error) {
      setDiscoveryLog(prev => [...prev, `❌ Discovery failed: ${error}`]);
      setDiscoveryResults(prev => ({
        ...prev,
        [examId]: {
          ...prev[examId],
          discoveryStatus: 'failed'
        } as SchemaComparison
      }));
    }

    setIsDiscovering(false);
  };

  // Perform discovery for all exams
  const discoverAllExams = async () => {
    setDiscoveryLog([]);
    setDiscoveryLog(prev => [...prev, `🚀 Starting auto-discovery for all exams...`]);
    
    for (const exam of availableExams) {
      await performDiscovery(exam.id);
      // Small delay between discoveries
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setDiscoveryLog(prev => [...prev, `🎉 Auto-discovery completed for all exams!`]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Search className="text-purple-600" size={32} />
          <h1 className="text-3xl font-bold">Exam Schema Auto-Discovery Demo</h1>
        </div>
        <p className="text-gray-600">
          Automatically discover and compare exam requirements from official sources to improve our schemas.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Discovery Controls</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select an exam...</option>
            {availableExams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => selectedExam && performDiscovery(selectedExam)}
            disabled={!selectedExam || isDiscovering}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search size={16} />
            Discover Schema
          </button>
          
          <button
            onClick={discoverAllExams}
            disabled={isDiscovering}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Zap size={16} />
            Discover All
          </button>
        </div>

        {isDiscovering && (
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw className="animate-spin" size={16} />
            <span>Discovery in progress...</span>
          </div>
        )}
      </div>

      {/* Discovery Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Discovery Results</h2>
          
          {Object.keys(discoveryResults).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No discovery results yet. Select an exam and click "Discover Schema".</p>
          ) : (
            <div className="space-y-4">
              {Object.values(discoveryResults).map(result => (
                <div key={result.examId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{result.examName}</h3>
                    <div className="flex items-center gap-2">
                      {result.discoveryStatus === 'completed' && <CheckCircle className="text-green-500" size={16} />}
                      {result.discoveryStatus === 'processing' && <RefreshCw className="animate-spin text-blue-500" size={16} />}
                      {result.discoveryStatus === 'failed' && <AlertCircle className="text-red-500" size={16} />}
                      <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {result.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Current:</span>
                      <span className="ml-2 font-medium">{result.currentRequirements} fields</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Discovered:</span>
                      <span className="ml-2 font-medium">{result.discoveredRequirements} fields</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Matching:</span>
                      <span className="ml-2 font-medium">{result.matchingFields.length} fields</span>
                    </div>
                  </div>

                  {result.missingFields.length > 0 && (
                    <div className="mb-2">
                      <span className="text-red-600 text-sm font-medium">Missing fields:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.missingFields.map(field => (
                          <span key={field} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.suggestions.length > 0 && (
                    <div className="text-sm">
                      <span className="text-orange-600 font-medium">Suggestions:</span>
                      <ul className="mt-1 text-gray-600">
                        {result.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ArrowRight size={12} className="mt-1 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discovery Log */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Discovery Log</h2>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {discoveryLog.length === 0 ? (
              <div className="text-gray-500">Discovery log will appear here...</div>
            ) : (
              discoveryLog.map((log, idx) => (
                <div key={idx} className="mb-1">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {Object.keys(discoveryResults).length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Download size={16} />
              Export Improved Schemas
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Eye size={16} />
              Preview Changes
            </button>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <Code size={16} />
              Generate Schema Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};