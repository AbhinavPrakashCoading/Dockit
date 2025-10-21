import React, { useState, useCallback } from 'react';

interface ParsedDocument {
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

interface TextToJsonResult {
  exam?: string;
  source: string;
  extractedAt: string;
  documents: ParsedDocument[];
  metadata: {
    method: 'text-parser';
    confidence: number;
    suggestions?: string[];
  };
}

const formatSuggestions = [
  {
    name: 'Exam Requirements Format',
    description: 'Standard format for exam document requirements',
    example: `Exam: UPSC Civil Services Examination 2025

Documents Required:
1. Photo - JPEG format, max 50KB, passport size (35x45mm), mandatory
2. Signature - JPG only, max 30KB, black ink, mandatory  
3. ID Proof - PDF format, max 2MB, Aadhaar/PAN/Passport, mandatory
4. Address Proof - PDF, max 1MB, utility bill/bank statement, mandatory
5. Educational Certificates - PDF, max 500KB per file, all degrees, mandatory`
  },
  {
    name: 'Simple List Format',
    description: 'Basic list of document requirements',
    example: `Photo: JPEG, 50KB max, passport size
Signature: JPG, 30KB, mandatory
ID Proof: PDF, 2MB, required
Educational docs: PDF, 500KB each`
  },
  {
    name: 'Detailed Requirements',
    description: 'Comprehensive format with all specifications',
    example: `Document Requirements for SBI PO 2025:

Photograph:
- Format: JPEG only
- Size: 40KB maximum, 4KB minimum  
- Dimensions: 200x200 pixels (1:1 ratio)
- Type: Recent color photograph
- Mandatory: Yes

Signature:
- Format: JPEG
- Size: 30KB maximum
- Dimensions: 140x60 pixels
- Description: Handwritten signature
- Mandatory: Yes

Category Certificate:
- Format: PDF
- Size: 300KB maximum
- Description: SC/ST/OBC certificate (if applicable)
- Mandatory: No`
  }
];

export default function TextToJsonConverter() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TextToJsonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    duplicates: string[];
    examName: string;
    originalData: any;
  } | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const parseTextToJson = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to convert');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/text-to-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎯 API Response received in UI:', data);
      console.log('📊 Documents in response:', data.documents?.length);
      setResult(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse text');
      console.error('Text parsing failed:', err);
    } finally {
      setLoading(false);
    }
  }, [inputText]);

  const useSuggestion = (index: number) => {
    setInputText(formatSuggestions[index].example);
    setSelectedSuggestion(index);
    setResult(null);
    setError(null);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOverwrite = async (targetFilename: string) => {
    if (!duplicateInfo) return;
    
    setSaving(true);
    setShowDuplicateDialog(false);
    
    try {
      const response = await fetch('/api/parsed-documents-fallback/save-with-overwrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...duplicateInfo.originalData,
          overwrite: true,
          targetFilename: targetFilename
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to overwrite: ${response.status}`);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to overwrite:', error);
      alert('Failed to overwrite document. Please try again.');
    } finally {
      setSaving(false);
      setDuplicateInfo(null);
    }
  };

  const handleCreateNew = async () => {
    if (!duplicateInfo) return;
    
    setSaving(true);
    setShowDuplicateDialog(false);
    
    try {
      const response = await fetch('/api/parsed-documents-fallback/save-with-overwrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...duplicateInfo.originalData,
          overwrite: false
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create new: ${response.status}`);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to create new:', error);
      alert('Failed to create new document. Please try again.');
    } finally {
      setSaving(false);
      setDuplicateInfo(null);
    }
  };

  const handleCancelSave = () => {
    setShowDuplicateDialog(false);
    setDuplicateInfo(null);
  };

  const saveToDatabase = async () => {
    if (!result) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const response = await fetch('/api/save-parsed-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsedJson: result,
          originalText: inputText,
          userId: null // You can add user authentication here
        }),
      });
      
      const data = await response.json();
      
      if (response.status === 409 && data.isDuplicate) {
        // Handle duplicate detection
        setDuplicateInfo({
          duplicates: data.duplicates,
          examName: data.examName,
          originalData: data.originalData
        });
        setShowDuplicateDialog(true);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }
      
      setSaveSuccess(true);
      
      // Show success message for 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to save to database:', error);
      alert('Failed to save to database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text_to_json_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setSelectedSuggestion(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📝 Text to JSON Converter
        </h2>
        <p className="text-gray-600">
          Convert unstructured document requirements into structured JSON schemas
        </p>
      </div>

      {/* Format Suggestions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          💡 Format Suggestions
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {formatSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                selectedSuggestion === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => useSuggestion(index)}
            >
              <h4 className="font-semibold text-blue-700 mb-1">
                {suggestion.name}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {suggestion.description}
              </p>
              <div className="text-xs text-blue-600 font-medium">
                Click to use template →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Text (Document Requirements):
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter document requirements text here...

Example:
Photo: JPEG format, max 50KB, passport size
Signature: JPG only, max 30KB, mandatory
ID Proof: PDF format, max 2MB, required"
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          />
          <div className="text-sm text-gray-500 mt-1">
            Characters: {inputText.length}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={parseTextToJson}
            disabled={loading || !inputText.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Converting...
              </>
            ) : (
              <>
                🔄 Convert to JSON
              </>
            )}
          </button>

          <button
            onClick={clearAll}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            🗑️ Clear All
          </button>

          {result && (
            <div className="flex gap-3">
              <button
                onClick={saveToDatabase}
                disabled={isSaving}
                className={`px-6 py-3 text-white rounded-lg flex items-center gap-2 ${
                  isSaving 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : saveSuccess 
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    ✅ Saved to Database
                  </>
                ) : (
                  <>
                    💾 Save to Database
                  </>
                )}
              </button>
              
              <button
                onClick={downloadJson}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                📥 Download JSON
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Structured View */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📋 Structured Output
            </h3>
            
            {result.exam && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-700">{result.exam}</h4>
                <p className="text-sm text-gray-600">
                  Confidence: {Math.round(result.metadata.confidence * 100)}%
                </p>
              </div>
            )}

            <div className="space-y-4">
              {result.documents.map((doc, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800 capitalize">
                      📄 {doc.type}
                    </h4>
                    {doc.requirements.mandatory !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        doc.requirements.mandatory
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.requirements.mandatory ? 'Required' : 'Optional'}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {doc.requirements.format && (
                      <p><strong>Format:</strong> {doc.requirements.format.join(', ')}</p>
                    )}
                    {doc.requirements.maxSize && (
                      <p><strong>Max Size:</strong> {doc.requirements.maxSize}</p>
                    )}
                    {doc.requirements.dimensions && (
                      <p><strong>Dimensions:</strong> {
                        doc.requirements.dimensions.ratio || 
                        `${doc.requirements.dimensions.width}x${doc.requirements.dimensions.height}`
                      }</p>
                    )}
                    {doc.requirements.description && (
                      <p><strong>Description:</strong> {doc.requirements.description}</p>
                    )}
                  </div>
                </div>
              ))}

              {result.documents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No documents were parsed. Try using a different format.
                </div>
              )}
            </div>

            {result.metadata.suggestions && result.metadata.suggestions.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Suggestions:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {result.metadata.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Raw JSON View */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📋 Raw JSON Output
            </h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Duplicate Confirmation Dialog */}
      {showDuplicateDialog && duplicateInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                ⚠️ Duplicate Documents Found
              </h3>
              <p className="text-gray-600">
                Documents for "{duplicateInfo.examName}" already exist:
              </p>
            </div>
            
            <div className="mb-6">
              <ul className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {duplicateInfo.duplicates.map((filename, index) => (
                  <li key={index} className="text-sm text-gray-700 mb-1 flex items-center justify-between">
                    <span className="truncate mr-2">{filename}</span>
                    <button
                      onClick={() => handleOverwrite(filename)}
                      disabled={saving}
                      className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded disabled:opacity-50"
                    >
                      Overwrite
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCreateNew}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Create New'}
              </button>
              <button
                onClick={handleCancelSave}
                disabled={saving}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Choose "Create New" to save alongside existing documents, or "Overwrite" to replace a specific document.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}