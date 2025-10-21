/**
 * AI Document Verification Demo Component
 * Shows the intelligent document type verification in action
 */

'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Brain, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Zap,
  Image as ImageIcon,
  CreditCard,
  Award,
  FileImage,
  Users,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documentTypeVerifier, DocumentVerificationResult } from '@/features/verification/DocumentTypeVerifier';
import { detectDocumentType, getDocumentConfig } from '@/features/processing/DocumentTypeProcessor';

interface AnalysisResult {
  filename: string;
  fileSize: number;
  filenameGuess: string;
  aiVerification: DocumentVerificationResult;
  processingTime: number;
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'passport_photo':
    case 'upsc_photo':
    case 'ssc_photo':
      return <Users className="w-5 h-5" />;
    case 'aadhar_card':
    case 'pan_card':
      return <CreditCard className="w-5 h-5" />;
    case 'marksheet':
    case 'degree_certificate':
      return <Award className="w-5 h-5" />;
    case 'signature':
      return <MessageSquare className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'text-green-600 bg-green-100';
  if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export function AIDocumentVerificationDemo() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        analyzeDocument(file);
      } else {
        toast.error(`Unsupported file type: ${file.type}`);
      }
    });
  };

  const analyzeDocument = async (file: File) => {
    setIsAnalyzing(true);
    const startTime = Date.now();
    
    try {
      toast.loading(`🤖 AI analyzing ${file.name}...`, { id: file.name });
      
      // Step 1: Filename-based detection (old method)
      const filenameGuess = detectDocumentType(file.name, file.size);
      
      // Step 2: AI-powered verification (new method)
      const aiVerification = await documentTypeVerifier.verifyDocumentType(file, filenameGuess);
      
      const processingTime = Date.now() - startTime;
      
      const result: AnalysisResult = {
        filename: file.name,
        fileSize: file.size,
        filenameGuess,
        aiVerification,
        processingTime
      };
      
      setResults(prev => [result, ...prev]);
      
      toast.success(
        `✅ Analysis complete: ${aiVerification.verifiedType} (${Math.round(aiVerification.confidence * 100)}% confidence)`,
        { id: file.name, duration: 4000 }
      );
      
    } catch (error) {
      toast.error(`❌ Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: file.name
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-10 h-10 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Document Verification</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Upload documents to see our AI system analyze them using OCR, Computer Vision, and pattern matching 
          to accurately detect document types beyond simple filename guessing.
        </p>
        
        {/* Technology Stack */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Computer Vision</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>OCR (Tesseract.js)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Pattern Matching</span>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>ML Classification</span>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragOver 
            ? 'border-purple-400 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          {isAnalyzing ? (
            <>
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <h3 className="text-lg font-medium text-gray-900">AI Analyzing Document...</h3>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Upload Documents for AI Analysis</h3>
            </>
          )}
          <p className="text-gray-600">
            Drop files here or click to browse • Supports: PDF, JPG, PNG
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                {/* File Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">{result.filename}</h3>
                      <p className="text-sm text-gray-500">
                        {Math.round(result.fileSize / 1024)}KB • Analyzed in {result.processingTime}ms
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.aiVerification.confidence)}`}>
                    {Math.round(result.aiVerification.confidence * 100)}% confidence
                  </div>
                </div>

                {/* Comparison: Filename vs AI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filename Detection */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Filename Detection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getDocumentIcon(result.filenameGuess)}
                      <span className="font-medium">{result.filenameGuess}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Basic pattern matching</p>
                  </div>

                  {/* AI Verification */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">AI Verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getDocumentIcon(result.aiVerification.verifiedType)}
                      <span className="font-medium">{result.aiVerification.verifiedType}</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">OCR + CV + Pattern Analysis</p>
                  </div>
                </div>

                {/* AI Analysis Details */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium text-blue-900 flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>AI Analysis Details</span>
                  </h4>
                  
                  {/* Extracted Data */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">Dimensions:</span>
                      <p className="text-blue-700">
                        {result.aiVerification.dimensions.width} × {result.aiVerification.dimensions.height}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Image Quality:</span>
                      <p className="text-blue-700">
                        {Math.round(result.aiVerification.fileMetadata.quality)}%
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Elements Found:</span>
                      <p className="text-blue-700">
                        {result.aiVerification.extractedData.detectedElements?.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Extracted Text Preview */}
                  {result.aiVerification.extractedData.text && result.aiVerification.extractedData.text.length > 0 && (
                    <div>
                      <span className="font-medium text-blue-800">Extracted Text (first 3 lines):</span>
                      <div className="bg-white p-2 rounded border text-xs text-gray-700 font-mono">
                        {result.aiVerification.extractedData.text.slice(0, 3).map((line, i) => (
                          <div key={i}>{line || '(empty line)'}</div>
                        ))}
                        {result.aiVerification.extractedData.text.length > 3 && (
                          <div className="text-gray-500">... and {result.aiVerification.extractedData.text.length - 3} more lines</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Reasons */}
                  {result.aiVerification.reasons.length > 0 && (
                    <div>
                      <span className="font-medium text-blue-800">Verification Reasons:</span>
                      <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        {result.aiVerification.reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Warnings and Recommendations */}
                {(result.aiVerification.warnings.length > 0 || result.aiVerification.recommendations.length > 0) && (
                  <div className="space-y-3">
                    {result.aiVerification.warnings.length > 0 && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Warnings</span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                          {result.aiVerification.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.aiVerification.recommendations.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Info className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Recommendations</span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                          {result.aiVerification.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Documents Suggestion */}
      {results.length === 0 && (
        <div className="text-center text-gray-500 space-y-2">
          <p>Try uploading sample documents like:</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="bg-gray-100 px-3 py-1 rounded">Passport Photos</span>
            <span className="bg-gray-100 px-3 py-1 rounded">Aadhar Cards</span>
            <span className="bg-gray-100 px-3 py-1 rounded">PAN Cards</span>
            <span className="bg-gray-100 px-3 py-1 rounded">Marksheets</span>
            <span className="bg-gray-100 px-3 py-1 rounded">Admit Cards</span>
            <span className="bg-gray-100 px-3 py-1 rounded">Signatures</span>
          </div>
        </div>
      )}
    </div>
  );
}