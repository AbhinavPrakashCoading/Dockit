import React, { useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { storeSchema } from '../src/lib/db';
import { schemaProcessingService } from '../src/features/schema/SchemaProcessingService';

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface InferredField {
  type: string;
  pattern?: string;
  format?: string;
  required?: boolean;
  description?: string;
  confidence?: number;
}

interface SchemaOutput {
  [key: string]: InferredField;
}

interface ValidationReport {
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  complianceScore: number;
  issues: any[];
  recommendations: string[];
}

export default function SchemaGenPage() {
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<SchemaOutput | null>(null);
  const [coverage, setCoverage] = useState<number>(0);
  const [issues, setIssues] = useState<string[]>([]);
  const [examForm, setExamForm] = useState<string>('');
  const [valReport, setValReport] = useState<ValidationReport | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);
      
      setExamForm(data.exam_form as string);

      const res = await fetch('/api/schema-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      const result = await res.json() as {
        schema?: SchemaOutput;
        coverage?: number;
        issues?: string[];
      };
      
      setSchema(result.schema || {});
      setCoverage(result.coverage || 0);
      setIssues(result.issues || []);
      
      toast.success('Schema generated successfully!');
    } catch (error) {
      console.error('Schema generation error:', error);
      toast.error('Failed to generate schema');
    } finally {
      setLoading(false);
    }
  };

  const editField = (key: string, prop: string, value: any) => {
    if (!schema) return;

    const updated = {
      ...schema,
      [key]: {
        ...schema[key],
        [prop]: value,
      },
    };
    
    setSchema(updated);
    debounceSave(updated);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSave = useCallback(
    debounce(async (updatedSchema: SchemaOutput) => {
      if (!examForm) return;
      
      try {
        await storeSchema(examForm, updatedSchema);
        toast.success('Schema updated');
      } catch (error) {
        console.error('Save error:', error);
        toast.error('Failed to save schema');
      }
    }, 500),
    [examForm]
  );

  const deleteField = (key: string) => {
    if (!schema) return;

    const updated = { ...schema };
    delete updated[key];
    
    setSchema(updated);
    debounceSave(updated);
  };

  const handleTestSample = async () => {
    if (!examForm) {
      toast.error('Please generate a schema first');
      return;
    }

    try {
      const mockFile = new File(['mock PDF content'], 'sample.pdf', {
        type: 'application/pdf',
      });

      const valRes = await schemaProcessingService.processFiles(
        [mockFile],
        examForm
      );
      
      setValReport(valRes.validationReport);
      toast.success('Test completed!');
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Schema Generator
        </h1>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="exam_form"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Exam Form
              </label>
              <input
                id="exam_form"
                name="exam_form"
                type="text"
                required
                placeholder="e.g., JEE Main 2026"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                URL (optional)
              </label>
              <input
                id="url"
                name="url"
                type="url"
                placeholder="https://example.com/document.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Schema'}
            </button>
          </form>
        </div>

        {/* Schema Table */}
        {schema && Object.keys(schema).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Generated Schema
            </h2>
            
            <div className="overflow-x-auto">
              <table
                data-testid="schema-table"
                className="w-full border-collapse"
              >
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">
                      Field
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">
                      Pattern
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">
                      Format
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">
                      Required
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(schema).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900 border font-medium">
                        {key}
                      </td>
                      <td className="px-4 py-2 border">
                        <select
                          value={value.type || 'string'}
                          onChange={(e) =>
                            editField(key, 'type', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="string">string</option>
                          <option value="date">date</option>
                          <option value="number">number</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={value.pattern || ''}
                          onChange={(e) =>
                            editField(key, 'pattern', e.target.value)
                          }
                          placeholder="Regex pattern"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={value.format || ''}
                          onChange={(e) =>
                            editField(key, 'format', e.target.value)
                          }
                          placeholder="Format"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <input
                          type="checkbox"
                          checked={!!value.required}
                          onChange={(e) =>
                            editField(key, 'required', e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => deleteField(key)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Metrics Section */}
        {schema && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Schema Metrics
            </h2>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Coverage
                </span>
                <span
                  className="text-sm font-bold text-gray-900"
                  aria-live="polite"
                >
                  {coverage}%
                </span>
              </div>
              <progress
                value={coverage || 0}
                max="100"
                data-testid="coverage-bar"
                className="w-full h-3 rounded overflow-hidden"
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none',
                }}
              />
              <style jsx>{`
                progress::-webkit-progress-bar {
                  background-color: #e5e7eb;
                  border-radius: 0.25rem;
                }
                progress::-webkit-progress-value {
                  background-color: #3b82f6;
                  border-radius: 0.25rem;
                }
                progress::-moz-progress-bar {
                  background-color: #3b82f6;
                  border-radius: 0.25rem;
                }
              `}</style>
            </div>

            {issues && issues.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Issues & Warnings
                </h3>
                <ul data-testid="issues" className="space-y-2">
                  {issues.map((issue, idx) => (
                    <li
                      key={idx}
                      className={`text-sm px-3 py-2 rounded ${
                        issue.includes('Passthrough')
                          ? 'bg-blue-50 text-blue-800 info'
                          : 'bg-yellow-50 text-yellow-800 warning'
                      }`}
                    >
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Test Sample Section */}
        {schema && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Schema
            </h2>
            
            <button
              data-testid="test-sample"
              onClick={handleTestSample}
              className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors mb-4"
            >
              Test on Sample Document
            </button>

            {valReport && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Validation Preview
                </summary>
                <pre
                  data-testid="val-preview"
                  className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 overflow-x-auto text-xs"
                >
                  {JSON.stringify(valReport, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
