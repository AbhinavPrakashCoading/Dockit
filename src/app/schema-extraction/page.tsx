'use client';'use client';'use client';



import React, { useState } from 'react';



export default function SchemaExtractionPage() {import React, { useState } from 'react';import React, { useState } from 'react';

  const [url, setUrl] = useState('');

import { Button } from '@/components/Button/Button';

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">export default function SchemaExtractionPage() {

      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-8">  const [url, setUrl] = useState('');interface DocumentRequirement {

          <h1 className="text-4xl font-bold text-gray-800 mb-2">

            📋 Schema Extraction Tool  type: string;

          </h1>

          <p className="text-gray-600">  return (  requirements: {

            Automatically extract document requirements from exam URLs

          </p>    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">    format?: string[];

        </div>

      <div className="max-w-6xl mx-auto">    maxSize?: string;

        <div className="bg-white rounded-lg shadow-lg p-6">

          <div className="mb-4">        <div className="text-center mb-8">    minSize?: string;

            <label className="block text-sm font-medium text-gray-700 mb-2">

              Enter Exam URL:          <h1 className="text-4xl font-bold text-gray-800 mb-2">    dimensions?: {

            </label>

            <input            📋 Schema Extraction Tool      width?: number;

              type="url"

              value={url}          </h1>      height?: number;

              onChange={(e) => setUrl(e.target.value)}

              placeholder="https://example.com/exam-form"          <p className="text-gray-600">      ratio?: string;

              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

            />            Automatically extract document requirements from exam URLs    };

          </div>

          </p>    description?: string;

          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

            🚀 Extract Schema        </div>    mandatory?: boolean;

          </button>

        </div>  };



        <div className="mt-8 text-center">        <div className="bg-white rounded-lg shadow-lg p-6">}

          <p className="text-gray-600 mb-4">Or try the new text-to-JSON converter:</p>

          <a           <div className="mb-4">

            href="/text-to-json"

            className="inline-block px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"            <label className="block text-sm font-medium text-gray-700 mb-2">interface ExamSchema {

          >

            📝 Text to JSON Converter              Enter Exam URL:  exam: string;

          </a>

        </div>            </label>  source: string;

      </div>

    </div>            <input  extractedAt: string;

  );

}              type="url"  documents: DocumentRequirement[];

              value={url}  metadata?: {

              onChange={(e) => setUrl(e.target.value)}    url: string;

              placeholder="https://example.com/exam-form"    contentType: string;

              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"    extractionMethod: 'html' | 'pdf' | 'dynamic';

            />    confidence: number;

          </div>    error?: string;

  };

          <button}

            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

          >export default function SchemaExtractionUI() {

            🚀 Extract Schema  const [url, setUrl] = useState('');

          </button>  const [loading, setLoading] = useState(false);

        </div>  const [schema, setSchema] = useState<ExamSchema | null>(null);

  const [error, setError] = useState<string | null>(null);

        <div className="mt-8 text-center">  const [history, setHistory] = useState<ExamSchema[]>([]);

          <p className="text-gray-600 mb-4">Or try the new text-to-JSON converter:</p>  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'history'>('url');

          <a   

            href="/text-to-json"  // Text-to-JSON state

            className="inline-block px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"  const [inputText, setInputText] = useState('');

          >  const [textLoading, setTextLoading] = useState(false);

            📝 Text to JSON Converter  const [suggestions, setSuggestions] = useState<any[]>([]);

          </a>  const [showSuggestions, setShowSuggestions] = useState(false);

        </div>

      </div>  // Example URLs for quick testing

    </div>  const exampleUrls = [

  );    'https://ibpsonline.ibps.in/clerk25',

}    'https://sbi.co.in/careers',
    'https://upsconline.nic.in',
    'https://ssc.nic.in'
  ];

  const extractSchema = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setSchema(null);

    try {
      // Call the API endpoint
      const response = await fetch('/api/extract-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url.trim(),
          options: {
            enableJavascript: true,
            timeout: 45000
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const extractedSchema: ExamSchema = await response.json();
      setSchema(extractedSchema);
      
      // Add to history if successful
      if (extractedSchema && extractedSchema.documents.length > 0) {
        setHistory(prev => [extractedSchema, ...prev.slice(0, 4)]); // Keep last 5
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract schema');
      console.error('Schema extraction failed:', err);
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
    link.download = `${schema.exam.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_schema.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setError(null);
  };

  // Text-to-JSON conversion functions
  const convertTextToJson = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to convert');
      return;
    }

    setTextLoading(true);
    setError(null);
    setSchema(null);

    try {
      const response = await fetch('/api/text-to-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: inputText.trim(),
          examName: inputText.match(/^.*(?:exam|application|form)/i)?.[0]?.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const convertedSchema: ExamSchema = await response.json();
      setSchema(convertedSchema);
      
      // Add to history if successful
      if (convertedSchema && convertedSchema.documents.length > 0) {
        setHistory(prev => [convertedSchema, ...prev.slice(0, 4)]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert text');
      console.error('Text-to-JSON conversion failed:', err);
    } finally {
      setTextLoading(false);
    }
  };

  const getSuggestions = async () => {
    if (!inputText.trim() || inputText.length < 10) return;

    try {
      const response = await fetch('/api/text-to-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: inputText.trim(),
          getSuggestions: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    }
  };

  const applySuggestion = (suggestion: any) => {
    setInputText(suggestion.example);
    setShowSuggestions(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📋 Schema Extraction Tool</h1>
        <p className="text-gray-600">
          Automatically extract document requirements from exam URLs and PDFs
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          🌐 Extract Schema from URL
        </h2>
        <p className="text-gray-600 mb-4">
          Enter an exam notification URL or PDF link to extract document requirements
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://ibpsonline.ibps.in/clerk25"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && extractSchema()}
            />
            <Button
              onClick={extractSchema}
              disabled={loading || !url.trim()}
              intent="primary"
              size="lg"
              className="min-w-[120px]"
            >
              {loading ? 'Extracting...' : 'Extract Schema'}
            </Button>
          </div>

          {/* Example URLs */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleUrls.map((exampleUrl, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm"
                  onClick={() => loadExample(exampleUrl)}
                >
                  {exampleUrl.replace('https://', '')}
                </span>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Extracting schema from URL...</p>
        </div>
      )}

      {/* Results Section */}
      {(schema || history.length > 0) && (
        <div className="space-y-4">
      {/* Main Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'url' 
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('url')}
          >
            🌐 URL Extraction
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'text' 
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('text')}
          >
            📝 Text to JSON
          </button>
          {(schema || history.length > 0) && (
            <button
              className={`px-6 py-3 font-medium ${activeTab === 'history' 
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('history')}
            >
              📚 History
            </button>
          )}
        </div>

        {/* URL Extraction Tab */}
        {activeTab === 'url' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              🌐 Extract Schema from URL
            </h2>
            <p className="text-gray-600 mb-4">
              Enter an exam notification URL or PDF link to extract document requirements
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://ibpsonline.ibps.in/clerk25"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && extractSchema()}
                />
                <Button
                  onClick={extractSchema}
                  disabled={loading || !url.trim()}
                  intent="primary"
                  size="lg"
                  className="min-w-[120px]"
                >
                  {loading ? 'Extracting...' : 'Extract Schema'}
                </Button>
              </div>

              {/* Example URLs */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleUrls.map((exampleUrl, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm"
                      onClick={() => loadExample(exampleUrl)}
                    >
                      {exampleUrl.replace('https://', '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text to JSON Tab */}
        {activeTab === 'text' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              📝 Convert Text to JSON Schema
            </h2>
            <p className="text-gray-600 mb-4">
              Enter unstructured text about document requirements and convert it to a structured JSON schema
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  placeholder={`Example:
IBPS Clerk Application Requirements:
1. Photograph: JPEG only, 50 KB max, 200x230 pixels, recent passport size
2. Signature: JPG format, 30 KB maximum, 140x60 pixels, black ink
3. Educational Certificate: PDF format, 1 MB max, all pages required
4. Identity Proof: PDF, 500 KB max, Aadhar/PAN/Passport accepted`}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (e.target.value.length > 20) {
                      getSuggestions();
                    }
                  }}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                {inputText.length > 0 && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1 rounded">
                    {inputText.length} chars
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={convertTextToJson}
                  disabled={textLoading || !inputText.trim()}
                  intent="primary"
                  size="lg"
                  className="min-w-[120px]"
                >
                  {textLoading ? 'Converting...' : 'Convert to JSON'}
                </Button>
                <Button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  disabled={!inputText.trim() || inputText.length < 10}
                  intent="secondary"
                  size="lg"
                >
                  💡 Get Format Suggestions
                </Button>
                <Button
                  onClick={() => setInputText('')}
                  intent="secondary"
                  size="lg"
                >
                  🗑️ Clear
                </Button>
              </div>

              {/* Format Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-blue-800">💡 Format Suggestions</h3>
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="bg-white border border-blue-200 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-blue-700">{suggestion.title}</h4>
                          <Button
                            onClick={() => applySuggestion(suggestion)}
                            size="sm"
                            intent="primary"
                          >
                            Use This
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {suggestion.example.substring(0, 200)}...
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Loading States */}
      {(loading || textLoading) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Extracting schema from URL...' : 'Converting text to JSON schema...'}
          </p>
        </div>
      )}

      {/* Results Section */}
      {(schema || history.length > 0) && (
        <div className="space-y-4">
          {/* Result Tab Navigation */}
          {schema && (
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium ${activeTab !== 'history' 
                  ? 'border-b-2 border-green-500 text-green-600' 
                  : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab(activeTab === 'url' ? 'url' : 'text')}
              >
                Current Result
              </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'history' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('history')}
            >
              History ({history.length})
            </button>
          </div>

          {/* Current Tab */}
          {activeTab === 'current' && schema && (
            <div className="space-y-4">
              {/* Schema Overview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      ✅ {schema.exam}
                    </h2>
                    <p className="text-gray-600 text-sm">{schema.source}</p>
                  </div>
                  <Button
                    onClick={downloadSchema}
                    intent="secondary"
                    size="sm"
                  >
                    📥 Download JSON
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Documents Found</p>
                    <p className="text-2xl font-bold text-blue-600">{schema.documents.length}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Confidence</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round((schema.metadata?.confidence || 0) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Method</p>
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                      {schema.metadata?.extractionMethod}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Content Type</p>
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                      {schema.metadata?.contentType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="grid gap-4">
                {schema.documents.map((doc, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        📄 {doc.type}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        doc.requirements.mandatory 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.requirements.mandatory ? "Mandatory" : "Optional"}
                      </span>
                    </div>
                    
                    {doc.requirements.description && (
                      <p className="text-gray-600 text-sm mb-4">{doc.requirements.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Formats */}
                      <div>
                        <p className="font-medium mb-1">Formats</p>
                        {doc.requirements.format ? (
                          <div className="flex flex-wrap gap-1">
                            {doc.requirements.format.map((format, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {format.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-xs">Not specified</p>
                        )}
                      </div>

                      {/* Size */}
                      <div>
                        <p className="font-medium mb-1">Size</p>
                        <div className="space-y-1">
                          {doc.requirements.maxSize && (
                            <p className="text-xs">Max: {doc.requirements.maxSize}</p>
                          )}
                          {doc.requirements.minSize && (
                            <p className="text-xs">Min: {doc.requirements.minSize}</p>
                          )}
                          {!doc.requirements.maxSize && !doc.requirements.minSize && (
                            <p className="text-xs text-gray-500">Not specified</p>
                          )}
                        </div>
                      </div>

                      {/* Dimensions */}
                      <div>
                        <p className="font-medium mb-1">Dimensions</p>
                        {doc.requirements.dimensions ? (
                          <div className="space-y-1">
                            <p className="text-xs">
                              {doc.requirements.dimensions.width} × {doc.requirements.dimensions.height} px
                            </p>
                            {doc.requirements.dimensions.ratio && (
                              <p className="text-xs text-gray-500">
                                Ratio: {doc.requirements.dimensions.ratio}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">Not specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Raw JSON */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">Raw JSON Schema</h3>
                <p className="text-gray-600 text-sm mb-4">Complete extracted schema data</p>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96 text-gray-800">
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
  );
}