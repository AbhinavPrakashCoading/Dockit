'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileComparisonTable } from '@/components/confirm-page/FileComparisonTable';
import { ProcessButton } from '@/components/confirm-page/ProcessButton';
import { ProcessedPreview } from '@/components/confirm-page/ProcessedPreview';
import { DownloadZipButton } from '@/components/confirm-page/DownloadZipButton';
import { GuestModeHeader } from '@/components/ClientOnlyGuestMode';
import { transformFile } from '@/features/transform/transformFile';
import { DocumentRequirement } from '@/features/exam/types';
import { staticSchemas } from '@/features/exam/staticSchemas';
import { ExtendedFile, hasDocumentType } from '@/types/ExtendedFile';
import { convertParsedDocumentToExamSchema, type ParsedSchema } from '@/lib/schema-format-normalizer';

// Declare global window interface
declare global {
  interface Window {
    uploadedFiles?: File[];
  }
}

export default function ConfirmPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [schema, setSchema] = useState<DocumentRequirement[]>([]);
  const [processed, setProcessed] = useState<File[]>([]);
  const [ready, setReady] = useState(false);

  /**
   * Improved requirement matching that considers multiple matching strategies
   */
  const findMatchingRequirement = (file: File, requirements: DocumentRequirement[]): DocumentRequirement | null => {
    const fileName = file.name.toLowerCase();
    
    // Strategy 1: Check if file has document type metadata and match by type
    if (hasDocumentType(file) && file.documentType) {
      const byDocumentType = requirements.find(req => 
        file.documentType!.toLowerCase().includes(req.type.toLowerCase()) ||
        req.type.toLowerCase().includes(file.documentType!.toLowerCase())
      );
      if (byDocumentType) {
        console.log(`✅ Matched "${file.name}" by document type "${file.documentType}" to requirement "${byDocumentType.type}"`);
        return byDocumentType;
      }
    }
    
    // Strategy 2: Match by filename containing requirement type
    const byFileName = requirements.find(req => 
      fileName.includes(req.type.toLowerCase())
    );
    if (byFileName) {
      console.log(`✅ Matched "${file.name}" by filename to requirement "${byFileName.type}"`);
      return byFileName;
    }
    
    // Strategy 3: Match by aliases
    const byAlias = requirements.find(req => 
      req.aliases?.some(alias => 
        fileName.includes(alias.toLowerCase()) ||
        (hasDocumentType(file) && file.documentType?.toLowerCase().includes(alias.toLowerCase()))
      )
    );
    if (byAlias) {
      console.log(`✅ Matched "${file.name}" by alias to requirement "${byAlias.type}"`);
      return byAlias;
    }
    
    // Strategy 4: Fuzzy matching for common document types
    const documentTypeKeywords = [
      { keywords: ['aadhaar', 'aadhar', 'id', 'identity'], type: 'ID Proof' },
      { keywords: ['photo', 'photograph', 'pic', 'passport'], type: 'Photo' },
      { keywords: ['signature', 'sign'], type: 'Signature' }
    ];
    
    for (const mapping of documentTypeKeywords) {
      const matchesKeyword = mapping.keywords.some(keyword => 
        fileName.includes(keyword) || 
        (hasDocumentType(file) && file.documentType?.toLowerCase().includes(keyword))
      );
      
      if (matchesKeyword) {
        const matchedReq = requirements.find(req => req.type === mapping.type);
        if (matchedReq) {
          console.log(`✅ Matched "${file.name}" by keyword fuzzy matching to requirement "${matchedReq.type}"`);
          return matchedReq;
        }
      }
    }
    
    console.warn(`❌ No requirement match found for file "${file.name}"${hasDocumentType(file) ? ` with document type "${file.documentType}"` : ''}`);
    return null;
  };

  useEffect(() => {
    const examId = localStorage.getItem('selectedExam');
    if (!examId) {
      router.replace('/select');
      return;
    }

    // Load and set schema - ENHANCED: Support both static and dynamic schemas
    const loadSchema = async () => {
      try {
        console.log(`🔍 Loading schema for exam: ${examId}`);
        
        // Try static schemas first (legacy)
        const staticSchemaData = staticSchemas[examId];
        if (staticSchemaData) {
          console.log(`✅ Found static schema for ${examId}`);
          setSchema(staticSchemaData.requirements || []);
          return;
        }
        
        // Try dynamic parsed schemas (new system)
        console.log(`🔍 Static schema not found, trying parsed documents for ${examId}`);
        try {
          const response = await fetch(`/api/parsed-documents-fallback`);
          if (response.ok) {
            const documents = await response.json();
            
            // Find matching document by examId or examType
            const matchingDoc = documents.find((doc: any) => 
              doc.id === examId || 
              doc.examType === examId ||
              doc.parsedJson?.exam?.toLowerCase().includes(examId.toLowerCase())
            );
            
            if (matchingDoc) {
              console.log(`✅ Found parsed schema for ${examId}:`, matchingDoc.examName);
              const convertedSchema = convertParsedDocumentToExamSchema(matchingDoc);
              console.log(`📋 Converted requirements:`, convertedSchema.requirements);
              setSchema(convertedSchema.requirements);
              return;
            }
          }
        } catch (apiError) {
          console.warn(`⚠️ Failed to load parsed documents:`, apiError);
        }
        
        // Final fallback to legacy JSON schema
        console.log(`🔍 Trying legacy JSON schema for ${examId}`);
        const mod = await import(`@/schemas/${examId}.json`);
        setSchema(mod.default.requirements || []);
        console.log(`✅ Loaded legacy schema for ${examId}`);
        
      } catch (err) {
        console.error('❌ Failed to load any schema:', err);
        router.replace('/select');
      }
    };
    loadSchema();

    // Set files with document type inference
    const uploaded = window.uploadedFiles || [];
    if (uploaded.length === 0) {
      router.replace('/upload');
    } else {
      // Tag files with inferred document types based on filename patterns
      const taggedFiles = uploaded.map(file => {
        let documentType = '';
        const fileName = file.name.toLowerCase();
        
        // Infer document type from filename (this simulates the upload process tagging)
        if (fileName.includes('aadhaar') || fileName.includes('aadhar') || fileName.includes('id')) {
          documentType = 'ID Proof Aadhaar/Passport/Driving License/Voter ID/PAN Card';
        } else if (fileName.includes('photo') || fileName.includes('passport')) {
          documentType = 'Photo';
        } else if (fileName.includes('sign')) {
          documentType = 'Signature';
        }
        
        // Create extended file with document type
        const extendedFile = Object.assign(file, { documentType });
        console.log(`📋 Tagged file "${file.name}" with document type: "${documentType}"`);
        return extendedFile;
      });
      
      setFiles(taggedFiles);
    }
  }, [router]);

  const handleProcess = async () => {
    const transformed: File[] = [];
    
    console.log(`🔄 Processing ${files.length} files with ${schema.length} requirements`);

    for (const file of files) {
      console.log(`\n📄 Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      // Use improved requirement matching
      const matchedReq = findMatchingRequirement(file, schema);

      if (!matchedReq) {
        console.error(`❌ No matching requirement found for ${file.name}`);
        continue;
      }

      console.log(`🎯 Using requirement: ${matchedReq.type}`, {
        format: matchedReq.format,
        maxSizeKB: matchedReq.maxSizeKB,
        mandatory: matchedReq.mandatory
      });

      try {
        const fixed = await transformFile(file, matchedReq);
        console.log(`✅ Transformation completed for ${file.name} → ${fixed.name}`);
        transformed.push(fixed);
      } catch (err) {
        console.error(`❌ Failed to process ${file.name}:`, err);
      }
    }

    console.log(`🎉 Processed ${transformed.length}/${files.length} files successfully`);
    setProcessed(transformed);
    setReady(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 space-y-8">
      <GuestModeHeader />
      <h1 className="text-xl font-semibold text-center">📦 Confirm & Process Uploads</h1>

      <FileComparisonTable files={files} schema={schema} />
      <ProcessButton onProcess={handleProcess} />

      {ready && (
        <>
          <ProcessedPreview files={processed} />
          <DownloadZipButton files={processed} schema={schema} />
        </>
      )}
    </main>
  );
}
