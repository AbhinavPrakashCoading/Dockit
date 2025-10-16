'use client';

import React, { useState } from 'react';

interface DocumentRequirement {
  type: string;
  requirements: {
    format?: string[];
    maxSize?: string;
    minSize?: string;
    dimensions?: {
      width?: number;
      height?: number;
      ratio?: string;
    };
    description?: string;
    mandatory?: boolean;
  };
}

interface ExamSchema {
  exam: string;
  source: string;
  extractedAt: string;
  documents: DocumentRequirement[];
  metadata?: {
    url: string;
    contentType: string;
    extractionMethod: 'html' | 'pdf' | 'dynamic';
    confidence: number;
    error?: string;
  };
}

export default function SchemaExtractionPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<ExamSchema | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [history, setHistory] = useState<ExamSchema[]>([]);
  const [progress, setProgress] = useState('');

  const extractSchema = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setSchema(null);
    setProgress('Starting extraction...');

    try {
      setProgress('Fetching content...');

      const response = await fetch('/api/extract-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.success) {
        setProgress('Extraction complete!');
        setSchema(result.schema);
        setHistory(prev => [result.schema, ...prev.slice(0, 9)]); // Keep last 10
        setTimeout(() => setProgress(''), 2000);
      } else {
        setError(result.error || 'Failed to extract schema');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadSchema = () => {
    if (!schema) return;

    const dataStr = JSON.stringify(schema, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schema.exam.toLowerCase().replace(/\s+/g, '-')}-schema.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📋 Schema Extraction Tool
          </h1>
          <p className="text-gray-600">
            Automatically extract document requirements from exam URLs
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Exam URL:
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/exam-form"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={extractSchema}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Extracting...
                </>
              ) : (
                <>🚀 Extract Schema</>
              )}
            </button>

            {schema && (
              <button
                onClick={downloadSchema}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                📥 Download JSON
              </button>
            )}
          </div>

          {progress && (
            <div className="mt-4 text-sm text-blue-600">
              {progress}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Quick Link */}
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4">Or try the new text-to-JSON converter:</p>
          <a 
            href="/text-to-json"
            className="inline-block px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
          >
            📝 Text to JSON Converter
          </a>
        </div>

        {/* Results Section */}
        {(schema || history.length > 0) && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'current'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Current Schema
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 font-medium text-sm ml-4 ${
                  activeTab === 'history'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                History ({history.length})
              </button>
            </div>

            {/* Current Schema Tab */}
            {activeTab === 'current' && schema && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">{schema.exam}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{schema.documents.length} documents</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {schema.metadata?.extractionMethod}
                    </span>
                    <span>{Math.round((schema.metadata?.confidence || 0) * 100)}% confidence</span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {schema.documents.map((doc, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold capitalize mb-3">{doc.type}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        {doc.requirements.format && (
                          <div>
                            <span className="font-medium text-gray-700">Format:</span>
                            <div className="text-gray-600">{doc.requirements.format.join(', ')}</div>
                          </div>
                        )}

                        {(doc.requirements.maxSize || doc.requirements.minSize) && (
                          <div>
                            <span className="font-medium text-gray-700">Size:</span>
                            <div className="text-gray-600">
                              {doc.requirements.minSize && `Min: ${doc.requirements.minSize}`}
                              {doc.requirements.minSize && doc.requirements.maxSize && ' | '}
                              {doc.requirements.maxSize && `Max: ${doc.requirements.maxSize}`}
                            </div>
                          </div>
                        )}

                        {doc.requirements.dimensions && (
                          <div>
                            <span className="font-medium text-gray-700">Dimensions:</span>
                            <div className="text-gray-600">
                              {doc.requirements.dimensions.width && doc.requirements.dimensions.height
                                ? `${doc.requirements.dimensions.width}x${doc.requirements.dimensions.height}px`
                                : doc.requirements.dimensions.ratio || 'Not specified'
                              }
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-medium text-gray-700">Required:</span>
                          <div className={`${doc.requirements.mandatory !== false ? 'text-red-600' : 'text-green-600'}`}>
                            {doc.requirements.mandatory !== false ? 'Yes' : 'Optional'}
                          </div>
                        </div>
                      </div>

                      {doc.requirements.description && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {doc.requirements.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Raw JSON Schema</h3>
                  <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-64">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
                    No extraction history yet. Extract some schemas to see them here.
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-50" 
                      onClick={() => { setSchema(item); setActiveTab('current'); }}
                    >
                      <h3 className="text-lg font-semibold">{item.exam}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                        <span>{item.source}</span>
                        <span>{new Date(item.extractedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-2">
                        <span>{item.documents.length} documents</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {item.metadata?.extractionMethod}
                        </span>
                        <span>{Math.round((item.metadata?.confidence || 0) * 100)}% confidence</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!schema && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">How to Use</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>1. Enter the URL of an exam notification page or PDF document</p>
              <p>2. Click "Extract Schema" to automatically analyze the page</p>
              <p>3. View the extracted document requirements in a structured format</p>
              <p>4. Download the JSON schema for integration with your applications</p>
              <br />
              <p className="text-gray-600">
                <strong>Supported:</strong> HTML pages, PDF documents, dynamic JavaScript content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}