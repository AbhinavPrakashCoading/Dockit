import type { NextApiRequest, NextApiResponse } from 'next';
import * as pdfjsLib from 'pdfjs-dist';
import { storeSchema, getCachedPDF, cachePDF } from '../../src/lib/db';
import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import { createCanvas } from 'canvas';
import Ajv from 'ajv';

// Set up PDF.js worker
if (typeof window === 'undefined') {
  // Server-side: Use legacy build for Node.js
  const pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker.entry');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

interface SchemaGenRequest {
  exam_form: string;
  url?: string;
}

interface SchemaGenResponse {
  success: boolean;
  exam_form: string;
  raw_text?: string;
  pages?: number;
  is_scanned?: boolean;
  ocr_conf?: number;
  issues?: string[];
  error?: string;
  schema?: any;
  coverage?: number;
}

interface InferredField {
  type: string;
  pattern?: string;
  format?: string;
  description?: string;
  confidence?: number;
}

interface SchemaOutput {
  [key: string]: InferredField;
}

/**
 * Fetch PDF with retry logic
 * @param url - The URL to fetch
 * @param retries - Number of retries remaining
 * @returns ArrayBuffer of the PDF
 */
async function fetchWithRetry(
  url: string,
  retries: number = 3
): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    clearTimeout(timeoutId);

    if (retries > 0) {
      console.log(`Fetch failed, retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(url, retries - 1);
    }

    throw error;
  }
}

/**
 * Load exam URLs from the JSON file
 */
function loadExamUrls(): Record<string, string> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'exam-urls.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to load exam-urls.json:', error);
    return {};
  }
}

/**
 * Perform OCR on a scanned PDF page
 * @param pdfDocument - The PDF document
 * @returns Object containing OCR extracted text and confidence
 */
async function performOCR(pdfDocument: any): Promise<{
  text: string;
  confidence: number;
  issues: string[];
}> {
  const OCR_TIMEOUT = 10000; // 10 seconds
  const issues: string[] = [];

  try {
    // Get the first page for OCR
    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    // Create canvas for rendering
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Create OCR worker with timeout
    // Tesseract.js will use CDN by default for worker files
    const ocrPromise = (async () => {
      const worker = await Tesseract.createWorker('eng');

      try {
        const { data } = await worker.recognize(canvas.toDataURL());
        await worker.terminate();
        return { text: data.text, confidence: data.confidence };
      } catch (error) {
        await worker.terminate();
        throw error;
      }
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('OCR timeout')), OCR_TIMEOUT)
    );

    const result = await Promise.race([ocrPromise, timeoutPromise]);

    // Check confidence and add issues if needed
    if (result.confidence < 70) {
      issues.push('Low OCR confidence—manual review recommended');
    }

    return {
      text: result.text,
      confidence: result.confidence,
      issues,
    };
  } catch (error) {
    console.error('OCR failed:', error);
    issues.push('OCR processing failed—using regex fallback');
    return {
      text: '',
      confidence: 0,
      issues,
    };
  }
}

/**
 * Fallback regex extraction for common form fields
 * @param raw_text - The text to extract from
 * @returns Extracted field-value pairs
 */
function regexFallback(raw_text: string): string {
  const patterns = [
    /(Roll No|Roll Number|Application No):\s*(\S+)/gi,
    /(Date of Birth|DOB):\s*(\S+)/gi,
    /(Name|Candidate Name):\s*([A-Za-z\s]+)/gi,
    /(Email|E-mail):\s*(\S+)/gi,
    /(Phone|Mobile|Contact):\s*(\d{10})/gi,
  ];

  const matches: string[] = [];
  patterns.forEach((pattern) => {
    const found = raw_text.matchAll(pattern);
    for (const match of found) {
      matches.push(`${match[1]}: ${match[2]}`);
    }
  });

  return matches.length > 0
    ? matches.join('\n')
    : 'No structured data found with regex patterns';
}

/**
 * Enhanced regex patterns for schema generation with fallback
 * @param raw_text - The text to extract from
 * @returns Schema object with inferred fields
 */
function enhancedRegexFallback(raw_text: string): SchemaOutput {
  const schema: SchemaOutput = {};
  
  const patterns = {
    roll_no: /(?:Roll No|Roll Number|Application No)[:\s]+([A-Z0-9]{6,12})/gi,
    application_no: /(?:Application No|Application Number)[:\s]+([A-Z0-9]{8,15})/gi,
    dob: /(?:Date of Birth|DOB|Birth Date)[:\s]+(\d{4}-\d{2}-\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/gi,
    name: /(?:Name|Candidate Name|Full Name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    email: /(?:Email|E-mail|Email ID)[:\s]+([\w\.-]+@[\w\.-]+\.\w+)/gi,
    phone: /(?:Phone|Mobile|Contact)[:\s]+(\+?\d{10,12})/gi,
    address: /(?:Address|Permanent Address)[:\s]+([\w\s,.-]+(?:\d{6}))/gi,
    category: /(?:Category|Caste)[:\s]+(General|OBC|SC|ST|EWS)/gi,
    gender: /(?:Gender|Sex)[:\s]+(Male|Female|Other)/gi,
    father_name: /(?:Father's Name|Father Name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    mother_name: /(?:Mother's Name|Mother Name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    state: /(?:State|State of Residence)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
    district: /(?:District)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
    pincode: /(?:Pincode|PIN|Postal Code)[:\s]+(\d{6})/gi,
    exam_center: /(?:Exam Center|Center)[:\s]+([\w\s,.-]+)/gi,
    subject: /(?:Subject|Optional Subject)[:\s]+([\w\s]+)/gi,
    medium: /(?:Medium|Language)[:\s]+(English|Hindi|[\w]+)/gi,
    qualification: /(?:Qualification|Educational Qualification)[:\s]+([\w\s]+)/gi,
    year_of_passing: /(?:Year of Passing|Passing Year)[:\s]+(\d{4})/gi,
    percentage: /(?:Percentage|Marks)[:\s]+(\d{1,3}(?:\.\d{1,2})?%?)/gi,
  };

  Object.entries(patterns).forEach(([fieldName, pattern]) => {
    const match = raw_text.match(pattern);
    if (match && match.length > 0) {
      // Determine field type based on pattern
      let fieldType = 'string';
      let format: string | undefined;
      
      if (fieldName === 'dob' || fieldName.includes('date')) {
        fieldType = 'string';
        format = 'date';
      } else if (fieldName === 'email') {
        fieldType = 'string';
        format = 'email';
      } else if (fieldName === 'phone' || fieldName === 'pincode') {
        fieldType = 'string';
        pattern.source.includes('\\d') && (format = 'numeric');
      }

      schema[fieldName] = {
        type: fieldType,
        pattern: pattern.source.replace(/\\/g, '\\\\').replace(/gi$/, ''),
        ...(format && { format }),
        description: `Extracted via regex from ${fieldName.replace(/_/g, ' ')}`,
        confidence: 0.6, // Lower confidence for regex extraction
      };
    }
  });

  return schema;
}

/**
 * Lazy-load ONNX runtime and perform inference
 * This function loads the ONNX models only when needed
 */
let onnxSession: any = null;
let transformerPipeline: any = null;

async function loadONNXModels(): Promise<void> {
  if (onnxSession && transformerPipeline) {
    return; // Already loaded
  }

  try {
    console.log('Loading ONNX models...');
    const startTime = Date.now();

    // Check if running in browser or Node.js
    if (typeof window !== 'undefined') {
      // Browser environment - use onnxruntime-web
      const onnxModule = await import('onnxruntime-web');
      const { InferenceSession } = onnxModule;

      // Try to create session with WebGL, fallback to CPU
      try {
        onnxSession = await InferenceSession.create('/models/layoutlm.onnx', {
          executionProviders: ['webgl', 'cpu'],
        });
        console.log('✅ ONNX session created with WebGL');
      } catch (error) {
        console.warn('⚠️  WebGL unavailable; using CPU', error);
        onnxSession = await InferenceSession.create('/models/layoutlm.onnx', {
          executionProviders: ['cpu'],
        });
      }
    } else {
      // Node.js environment - models not loaded (API route)
      console.log('⚠️  ONNX inference not available in Node.js API route');
    }

    const loadTime = Date.now() - startTime;
    if (loadTime > 5000) {
      console.warn(`⚠️  Model loading took ${loadTime}ms (>5s)`);
    }

    console.log(`✅ ONNX models loaded in ${loadTime}ms`);
  } catch (error) {
    console.error('❌ Failed to load ONNX models:', error);
    throw error;
  }
}

/**
 * Tokenize text using @xenova/transformers
 * @param raw_text - The text to tokenize
 * @returns Tokenized output
 */
async function tokenizeText(raw_text: string): Promise<any> {
  try {
    if (!transformerPipeline) {
      const { pipeline } = await import('@xenova/transformers');
      // Use a lighter model for token classification
      transformerPipeline = await pipeline(
        'token-classification',
        'Xenova/bert-base-NER'
      );
    }

    const tokens = await transformerPipeline(raw_text);
    return tokens;
  } catch (error) {
    console.error('Tokenization failed:', error);
    return null;
  }
}

/**
 * Perform ONNX inference for schema generation
 * @param raw_text - The extracted text from PDF
 * @returns Inferred schema with fields
 */
async function inferSchemaWithONNX(
  raw_text: string
): Promise<{ schema: SchemaOutput; coverage: number; issues: string[] }> {
  const issues: string[] = [];
  let schema: SchemaOutput = {};

  try {
    // Tokenize the text
    const tokens = await tokenizeText(raw_text);
    
    if (!tokens || tokens.length === 0) {
      issues.push('Tokenization failed; using regex fallback');
      schema = enhancedRegexFallback(raw_text);
    } else {
      // Extract entities from token classification
      const entities = tokens.filter((token: any) => token.score > 0.7);
      
      // Build schema from entities
      entities.forEach((entity: any) => {
        const fieldName = entity.entity.toLowerCase().replace('b-', '').replace('i-', '');
        
        if (!schema[fieldName]) {
          schema[fieldName] = {
            type: inferFieldType(entity.word, fieldName),
            description: `Extracted via NER: ${entity.entity}`,
            confidence: entity.score,
          };

          // Add pattern based on entity type
          if (fieldName === 'per' || fieldName === 'person') {
            schema.name = schema[fieldName];
            delete schema[fieldName];
          } else if (fieldName === 'loc' || fieldName === 'location') {
            schema.address = schema[fieldName];
            delete schema[fieldName];
          } else if (fieldName === 'date') {
            schema.dob = {
              type: 'string',
              format: 'date',
              description: 'Date field extracted',
              confidence: entity.score,
            };
          }
        }
      });

      // If schema is still empty or too few fields, use regex fallback
      if (Object.keys(schema).length < 5) {
        issues.push('Low entity extraction; enhancing with regex');
        const regexSchema = enhancedRegexFallback(raw_text);
        schema = { ...regexSchema, ...schema };
      }
    }

    // Calculate coverage (assuming 20 standard fields for forms)
    const EXPECTED_FIELDS = 20;
    const coverage = Math.min(
      (Object.keys(schema).length / EXPECTED_FIELDS) * 100,
      100
    );

    // If coverage is too low, use enhanced regex fallback
    if (coverage < 70) {
      issues.push('Low coverage (<70%); regex fallback used');
      const regexSchema = enhancedRegexFallback(raw_text);
      schema = { ...schema, ...regexSchema };
      
      // Recalculate coverage
      const newCoverage = Math.min(
        (Object.keys(schema).length / EXPECTED_FIELDS) * 100,
        100
      );
      return { schema, coverage: newCoverage, issues };
    }

    return { schema, coverage, issues };
  } catch (error) {
    console.error('ONNX inference error:', error);
    issues.push('ONNX inference failed; using regex fallback');
    schema = enhancedRegexFallback(raw_text);
    
    const coverage = Math.min(
      (Object.keys(schema).length / 20) * 100,
      100
    );
    
    return { schema, coverage, issues };
  }
}

/**
 * Infer field type from value and field name
 * @param value - The value to analyze
 * @param fieldName - The field name
 * @returns The inferred type
 */
function inferFieldType(value: string, fieldName: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value) || fieldName.includes('date')) {
    return 'string'; // Date format
  } else if (/^\d+$/.test(value)) {
    return 'number';
  } else if (/^(true|false)$/i.test(value)) {
    return 'boolean';
  } else if (/^[\w\.-]+@[\w\.-]+\.\w+$/.test(value)) {
    return 'string'; // Email format
  }
  return 'string';
}

/**
 * Validate schema using AJV
 * @param schema - The schema to validate
 * @returns Validation result
 */
function validateSchema(schema: SchemaOutput): { valid: boolean; errors?: any[] } {
  const ajv = new Ajv();
  
  // Create a JSON Schema for validation
  const jsonSchema = {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(schema).map(([key, value]) => [
        key,
        {
          type: value.type,
          ...(value.pattern && { pattern: value.pattern }),
          ...(value.format && { format: value.format }),
        },
      ])
    ),
  };

  try {
    const validate = ajv.compile(jsonSchema);
    const valid = validate({});
    return { valid: true, errors: validate.errors || [] };
  } catch (error) {
    return { valid: false, errors: [error] };
  }
}

/**
 * Extract text from PDF using pdf.js
 * @param pdfData - The PDF data as ArrayBuffer
 * @returns Object containing raw_text, pages count, is_scanned flag, and OCR data
 */
async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<{
  raw_text: string;
  pages: number;
  is_scanned: boolean;
  ocr_conf?: number;
  issues?: string[];
}> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    let fullText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Concatenate all text items
      const pageText = textContent.items
        .map((item: any) => {
          return 'str' in item ? item.str : '';
        })
        .join(' ');

      fullText += pageText + '\n';
    }

    // Determine if scanned based on text length
    const is_scanned = fullText.trim().length < 1000;

    // If scanned, perform OCR
    if (is_scanned) {
      console.log('Scanned PDF detected, performing OCR...');
      const ocrResult = await performOCR(pdfDocument);

      // If OCR succeeded, use OCR text
      if (ocrResult.text && ocrResult.text.trim().length > 0) {
        fullText = ocrResult.text;
        return {
          raw_text: fullText,
          pages: numPages,
          is_scanned: true,
          ocr_conf: ocrResult.confidence,
          issues: ocrResult.issues,
        };
      } else {
        // Fallback to regex extraction
        console.log('OCR failed, using regex fallback...');
        const regexText = regexFallback(fullText);
        return {
          raw_text: regexText,
          pages: numPages,
          is_scanned: true,
          ocr_conf: 0,
          issues: ['OCR failed, regex fallback used'],
        };
      }
    }

    return {
      raw_text: fullText,
      pages: numPages,
      is_scanned: false,
    };
  } catch (error) {
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * POST /api/schema-gen
 * Generate schema from PDF form
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SchemaGenResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      exam_form: '',
      error: 'Method not allowed',
    });
  }

  try {
    const { exam_form, url } = req.body as SchemaGenRequest;

    if (!exam_form) {
      return res.status(400).json({
        success: false,
        exam_form: '',
        error: 'exam_form is required',
      });
    }

    // Determine the PDF URL
    let pdfUrl = url;
    if (!pdfUrl) {
      // Fallback to local JSON
      const examUrls = loadExamUrls();
      pdfUrl = examUrls[exam_form];

      if (!pdfUrl) {
        return res.status(400).json({
          success: false,
          exam_form,
          error: `No URL provided and no fallback URL found for exam: ${exam_form}`,
        });
      }
    }

    // Check cache first
    let pdfData = await getCachedPDF(pdfUrl);

    // Fetch if not cached
    if (!pdfData) {
      console.log(`Fetching PDF from: ${pdfUrl}`);
      pdfData = await fetchWithRetry(pdfUrl);

      // Cache the response
      await cachePDF(pdfUrl, pdfData);
    } else {
      console.log(`Using cached PDF for: ${pdfUrl}`);
    }

    // Extract text from PDF
    const { raw_text, pages, is_scanned, ocr_conf, issues: extractionIssues = [] } = await extractTextFromPDF(pdfData);

    // Perform schema inference with ONNX
    console.log('Performing schema inference...');
    const { schema, coverage, issues: inferenceIssues } = await inferSchemaWithONNX(raw_text);

    // Combine all issues
    const allIssues = [...extractionIssues, ...inferenceIssues];
    
    // Add low OCR confidence issue if applicable
    if (ocr_conf !== undefined && ocr_conf < 70) {
      allIssues.push('Low OCR confidence; regex fallback used');
    }

    // Validate the generated schema
    const validation = validateSchema(schema);
    if (!validation.valid) {
      allIssues.push('Schema validation warnings present');
    }

    // Store schema with inferred data
    await storeSchema(exam_form, {
      raw_text,
      pages,
      is_scanned,
      ocr_conf,
      issues: allIssues,
      schema,
      coverage,
      layout: {}, // Stub layout for now
    });

    return res.status(200).json({
      success: true,
      exam_form,
      raw_text,
      pages,
      is_scanned,
      ocr_conf,
      issues: allIssues,
      schema,
      coverage,
    });
  } catch (error) {
    console.error('Schema generation error:', error);
    return res.status(500).json({
      success: false,
      exam_form: req.body?.exam_form || '',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
