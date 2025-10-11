// Integration example: Adding Schema Extraction Engine to EnhancedSchemaManager

import React, { useState } from 'react';
import { generateExamSchema } from '../engines/schema-extraction';
import { Zap, RefreshCw, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AutoGenerateSchemaProps {
  onSchemaGenerated: (schema: any) => void;
}

export const AutoGenerateSchema: React.FC<AutoGenerateSchemaProps> = ({ onSchemaGenerated }) => {
  const [examName, setExamName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  const handleGenerateSchema = async () => {
    if (!examName.trim()) {
      toast.error('Please enter an exam name');
      return;
    }

    setIsGenerating(true);
    setProgress('Initializing schema extraction...');

    try {
      // Update progress during extraction
      const progressUpdates = [
        'Searching for official exam content...',
        'Extracting content from PDFs and websites...',
        'Analyzing document requirements...',
        'Building structured schema...',
        'Validating and finalizing schema...'
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressUpdates.length) {
          setProgress(progressUpdates[currentStep]);
          currentStep++;
        }
      }, 3000);

      // Generate schema using the extraction engine
      const schema = await generateExamSchema(examName, {
        maxSearchResults: 8,
        timeout: 45000,
        includeOfficialOnly: true,
        preferPdfs: true
      });

      clearInterval(progressInterval);
      setProgress('Schema generated successfully!');

      // Convert to DocKit format
      const dockitSchema = {
        examId: schema.exam.toLowerCase().replace(/\s+/g, '-'),
        examName: schema.exam,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        requirements: schema.documents.map(doc => ({
          id: doc.type,
          name: doc.type.charAt(0).toUpperCase() + doc.type.slice(1),
          description: `Upload ${doc.type} as per the requirements below`,
          type: 'file',
          required: true,
          validation: {
            fileTypes: doc.requirements.format || ['JPG', 'JPEG', 'PDF'],
            maxSize: doc.requirements.size_kb?.max ? doc.requirements.size_kb.max * 1024 : 5 * 1024 * 1024,
            minSize: doc.requirements.size_kb?.min ? doc.requirements.size_kb.min * 1024 : 1024,
            dimensions: doc.requirements.dimensions,
            colorMode: doc.requirements.color,
            background: doc.requirements.background,
            notes: doc.requirements.notes || []
          }
        })),
        metadata: {
          extractedFrom: schema.extractedFrom,
          extractedAt: schema.extractedAt,
          engine: 'schema-extraction-v1.0'
        }
      };

      toast.success(`Schema generated for ${schema.exam}`);
      onSchemaGenerated(dockitSchema);

    } catch (error) {
      console.error('Schema generation failed:', error);
      toast.error('Failed to generate schema. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="mr-2 h-5 w-5 text-blue-600" />
          Auto-Generate Schema
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Name
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g., IBPS Clerk 2025, SSC CGL 2025, NEET 2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter any competitive exam name. The engine will automatically find and analyze official requirements.
            </p>
          </div>

          {isGenerating && (
            <div className="bg-white p-4 rounded-md border">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Generating Schema...</p>
                  <p className="text-xs text-gray-500">{progress}</p>
                </div>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${isGenerating ? '60%' : '100%'}` }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateSchema}
            disabled={isGenerating || !examName.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">How it works:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Searches official exam websites and PDFs</li>
          <li>• Extracts document upload requirements automatically</li>
          <li>• Generates structured schema with validation rules</li>
          <li>• Includes file formats, sizes, dimensions, and notes</li>
          <li>• Falls back to standard requirements if needed</li>
        </ul>
      </div>
    </div>
  );
};

// Example usage in EnhancedSchemaManager
export const EnhancedSchemaManagerWithAutoGenerate: React.FC = () => {
  const [schemas, setSchemas] = useState<any[]>([]);
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);

  const handleSchemaGenerated = (newSchema: any) => {
    setSchemas(prev => [...prev, newSchema]);
    setShowAutoGenerate(false);
    
    // Save to backend
    fetch('/api/schema-management', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        schema: newSchema
      })
    }).then(response => response.json())
      .then(data => {
        if (data.success) {
          toast.success('Schema saved successfully!');
        } else {
          toast.error('Failed to save schema');
        }
      })
      .catch(error => {
        console.error('Save error:', error);
        toast.error('Failed to save schema');
      });
  };

  return (
    <div className="space-y-6">
      {/* Header with Auto-Generate button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schema Manager</h2>
        <button
          onClick={() => setShowAutoGenerate(!showAutoGenerate)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2"
        >
          <Zap className="h-4 w-4" />
          <span>Auto-Generate Schema</span>
        </button>
      </div>

      {/* Auto-Generate Panel */}
      {showAutoGenerate && (
        <AutoGenerateSchema onSchemaGenerated={handleSchemaGenerated} />
      )}

      {/* Existing schemas list */}
      <div className="grid gap-4">
        {schemas.map((schema, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{schema.examName}</h3>
                <p className="text-sm text-gray-500">
                  {schema.requirements?.length || 0} requirements • Version {schema.version}
                </p>
                {schema.metadata?.extractedFrom && (
                  <p className="text-xs text-blue-600 mt-1">
                    Auto-generated from: {schema.metadata.extractedFrom}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-800">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoGenerateSchema;