'use client';

import React from 'react';
import TextToJsonConverter from '@/components/TextToJsonConverter/TextToJsonConverter';

export default function TextToJsonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝➡️🔧 Text to JSON Converter
          </h1>
          <p className="text-gray-600 text-lg">
            Transform unstructured document requirements into structured JSON schemas
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
            <span>✨ AI-Powered Parsing</span>
            <span>📋 Format Suggestions</span>
            <span>🔄 Live Preview</span>
            <span>📥 JSON Export</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-800">Smart Parsing</h3>
            <p className="text-sm text-gray-600">Automatically detects document types, formats, and requirements</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl mb-2">💡</div>
            <h3 className="font-semibold text-gray-800">Format Suggestions</h3>
            <p className="text-sm text-gray-600">Get helpful templates and examples for better results</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-semibold text-gray-800">Live Preview</h3>
            <p className="text-sm text-gray-600">See structured output as you type with confidence scores</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-800">Instant Export</h3>
            <p className="text-sm text-gray-600">Download JSON schemas ready for integration</p>
          </div>
        </div>

        {/* Main Converter Component */}
        <TextToJsonConverter />

        {/* Usage Examples */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📚 Usage Examples
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                ✅ Good Input Format
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
                <div className="text-green-600">// Example 1: Simple Format</div>
                <div>Photo: JPEG format, max 50KB, passport size, mandatory</div>
                <div>Signature: JPG only, 30KB maximum, black ink</div>
                <br />
                <div className="text-green-600">// Example 2: Detailed Format</div>
                <div>SBI PO Application 2025:</div>
                <div>1. Photograph - JPEG only, 40KB max, 200x200px</div>
                <div>2. Signature - JPEG, 30KB, 140x60 pixels</div>
                <div>3. Educational Docs - PDF, 1MB max, required</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                ❌ Avoid These Formats  
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
                <div className="text-red-600">// Too vague</div>
                <div>Upload documents</div>
                <div>Some files needed</div>
                <br />
                <div className="text-red-600">// Missing details</div>
                <div>Photo</div>
                <div>Certificate</div>
                <br />
                <div className="text-red-600">// Unclear format</div>
                <div>Photo and signature and other docs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">
              🔧 Supported Patterns
            </h3>
            <ul className="space-y-2 text-blue-700">
              <li>• <strong>Document Types:</strong> Photo, Signature, ID Proof, Educational, Category, Address</li>
              <li>• <strong>File Formats:</strong> JPEG, JPG, PNG, PDF, DOC, DOCX</li>
              <li>• <strong>Size Specifications:</strong> KB, MB with min/max values</li>
              <li>• <strong>Dimensions:</strong> Pixels, ratios, passport size</li>
              <li>• <strong>Requirements:</strong> Mandatory, optional, required status</li>
            </ul>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-3">
              ✨ Key Features
            </h3>
            <ul className="space-y-2 text-green-700">
              <li>• <strong>Smart Detection:</strong> Automatically identifies exam names and document types</li>
              <li>• <strong>Format Recognition:</strong> Parses file formats, sizes, and dimensions</li>
              <li>• <strong>Confidence Scoring:</strong> Shows parsing accuracy for each element</li>
              <li>• <strong>Helpful Suggestions:</strong> Provides tips for improving input quality</li>
              <li>• <strong>JSON Export:</strong> Downloads structured schemas for integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}