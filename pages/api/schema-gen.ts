import type { NextApiRequest, NextApiResponse } from 'next';
import * as pdfjsLib from 'pdfjs-dist';
import { storeSchema, getCachedPDF, cachePDF } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import { createCanvas } from 'canvas';

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
    const { raw_text, pages, is_scanned, ocr_conf, issues } = await extractTextFromPDF(pdfData);

    // Store schema with partial data (stub layout for now)
    await storeSchema(exam_form, {
      exam_form,
      raw_text,
      pages,
      is_scanned,
      ocr_conf,
      issues,
      layout: {}, // Stub layout for now
      timestamp: Date.now(),
    });

    return res.status(200).json({
      success: true,
      exam_form,
      raw_text,
      pages,
      is_scanned,
      ocr_conf,
      issues,
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
