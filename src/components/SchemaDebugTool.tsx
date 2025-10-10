/**
 * Schema Loading Debug Tool
 * Tests if schemas are loading properly from the registry
 */

'use client';

import React, { useState } from 'react';
import { Play, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface SchemaTestResult {
  examId: string;
  examName: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  schema?: any;
  error?: string;
  requirementsCount: number;
  loadTime: number;
}

export const SchemaDebugTool: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, SchemaTestResult>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  const testExams = [
    { id: 'upsc-cse', name: 'UPSC CSE' },
    { id: 'jee-main', name: 'JEE Main' },
    { id: 'neet-ug', name: 'NEET UG' },
    { id: 'cat', name: 'CAT' },
    { id: 'ielts', name: 'IELTS' },
    { id: 'ssc-cgl', name: 'SSC CGL' },
    { id: 'gate', name: 'GATE' }
  ];

  const testSchemaLoading = async (examId: string, examName: string) => {
    const startTime = Date.now();
    
    setTestResults(prev => ({
      ...prev,
      [examId]: {
        examId,
        examName,
        status: 'loading',
        requirementsCount: 0,
        loadTime: 0
      }
    }));

    try {
      // Import the schema loading function
      const { getExamSchema } = await import('@/features/exam/optimizedExamRegistry');
      
      console.log(`Testing schema loading for ${examId}...`);
      const schema = await getExamSchema(examId);
      const loadTime = Date.now() - startTime;

      if (schema) {
        console.log(`✅ Schema loaded for ${examId}:`, schema);
        setTestResults(prev => ({
          ...prev,
          [examId]: {
            examId,
            examName,
            status: 'success',
            schema,
            requirementsCount: schema.requirements?.length || 0,
            loadTime
          }
        }));
      } else {
        console.log(`❌ No schema found for ${examId}`);
        setTestResults(prev => ({
          ...prev,
          [examId]: {
            examId,
            examName,
            status: 'error',
            error: 'No schema found',
            requirementsCount: 0,
            loadTime
          }
        }));
      }
    } catch (error) {
      const loadTime = Date.now() - startTime;
      console.error(`❌ Error loading schema for ${examId}:`, error);
      setTestResults(prev => ({
        ...prev,
        [examId]: {
          examId,
          examName,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          requirementsCount: 0,
          loadTime
        }
      }));
    }
  };

  const testAllSchemas = async () => {
    setIsTestingAll(true);
    setTestResults({});
    
    for (const exam of testExams) {
      await testSchemaLoading(exam.id, exam.name);
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsTestingAll(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader className="animate-spin text-blue-500" size={20} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Schema Loading Debug Tool</h1>
        <p className="text-gray-600">
          Test if schemas are loading properly from the registry for the upload modal.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={testAllSchemas}
            disabled={isTestingAll}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Play size={16} />
            {isTestingAll ? 'Testing...' : 'Test All Schemas'}
          </button>
        </div>

        {isTestingAll && (
          <div className="text-blue-600 text-sm">
            Testing schema loading for all exams...
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        
        {Object.keys(testResults).length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No test results yet. Click "Test All Schemas" to begin.
          </p>
        ) : (
          <div className="space-y-4">
            {testExams.map(exam => {
              const result = testResults[exam.id];
              if (!result) return null;

              return (
                <div key={exam.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold">{result.examName}</h3>
                        <p className="text-sm text-gray-500">ID: {result.examId}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-500">Load Time</div>
                      <div className="font-mono">{result.loadTime}ms</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-2 font-medium ${
                        result.status === 'success' ? 'text-green-600' : 
                        result.status === 'error' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Requirements:</span>
                      <span className="ml-2 font-medium">{result.requirementsCount} fields</span>
                    </div>
                  </div>

                  {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <div className="text-red-600 text-sm font-medium">Error:</div>
                      <div className="text-red-700 text-sm">{result.error}</div>
                    </div>
                  )}

                  {result.schema && result.schema.requirements && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="text-green-600 text-sm font-medium mb-2">
                        Requirements Found:
                      </div>
                      <div className="space-y-1">
                        {result.schema.requirements.slice(0, 3).map((req: any, idx: number) => (
                          <div key={idx} className="text-sm text-green-700">
                            • {req.displayName} ({req.mandatory ? 'Required' : 'Optional'})
                            {req.format && ` - ${req.format}`}
                            {req.maxSizeKB && ` - Max ${req.maxSizeKB}KB`}
                          </div>
                        ))}
                        {result.schema.requirements.length > 3 && (
                          <div className="text-sm text-green-600">
                            ... and {result.schema.requirements.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Individual Test Button */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => testSchemaLoading(exam.id, exam.name)}
                      disabled={result.status === 'loading'}
                      className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-50"
                    >
                      Retest
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(testResults).filter(r => r.status === 'success').length}
              </div>
              <div className="text-sm text-green-600">Successful</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(testResults).filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(testResults).reduce((sum, r) => sum + r.requirementsCount, 0)}
              </div>
              <div className="text-sm text-blue-600">Total Requirements</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};