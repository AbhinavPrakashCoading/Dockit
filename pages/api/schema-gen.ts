import type { NextApiRequest, NextApiResponse } from 'next';
import * as pdfjsLib from 'pdfjs-dist';
import { storeSchema, getCachedPDF, cachePDF } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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
 * Extract text from PDF using pdf.js
 * @param pdfData - The PDF data as ArrayBuffer
 * @returns Object containing raw_text, pages count, and is_scanned flag
 */
async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<{
  raw_text: string;
  pages: number;
  is_scanned: boolean;
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

    return {
      raw_text: fullText,
      pages: numPages,
      is_scanned,
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
    const { raw_text, pages, is_scanned } = await extractTextFromPDF(pdfData);

    // Store schema with partial data (stub layout for now)
    await storeSchema(exam_form, {
      exam_form,
      raw_text,
      pages,
      is_scanned,
      layout: {}, // Stub layout for now
      timestamp: Date.now(),
    });

    return res.status(200).json({
      success: true,
      exam_form,
      raw_text,
      pages,
      is_scanned,
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
