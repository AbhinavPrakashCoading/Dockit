# Schema Extraction Module

A powerful TypeScript module that automatically extracts document requirements from exam form URLs or PDF files and returns structured JSON schemas.

## Features

- 🚀 **Fully Automated**: Zero manual text input required
- 📄 **Multi-format Support**: Works with both HTML pages and PDF documents
- 🧠 **Intelligent Analysis**: Uses regex patterns and NLP rules for accurate extraction
- 🔧 **Modular Design**: Clean separation of concerns with dedicated modules
- 📊 **Structured Output**: Returns clean, normalized JSON schemas
- 🌐 **Dynamic Content**: Supports JavaScript-heavy sites using Puppeteer
- ⚡ **High Performance**: Optimized for speed and reliability

## Installation

The module uses the following dependencies (already included in the project):

```bash
npm install axios cheerio pdf-parse puppeteer @types/pdf-parse
```

## Quick Start

```typescript
import { generateSchemaFromLink } from './src/lib/schema-extraction';

// Basic usage
const schema = await generateSchemaFromLink('https://ibpsonline.ibps.in/clerk25');
console.log(schema);
```

## API Reference

### `generateSchemaFromLink(link: string, options?: FetchOptions): Promise<ExamSchema>`

Main function that extracts document requirements from a URL.

**Parameters:**
- `link` (string): The URL to extract requirements from
- `options` (optional): Configuration options for fetching

**Returns:** Promise that resolves to an `ExamSchema` object

### FetchOptions

```typescript
interface FetchOptions {
  timeout?: number;           // Request timeout in milliseconds (default: 30000)
  userAgent?: string;         // Custom User-Agent string
  enableJavascript?: boolean; // Use Puppeteer for dynamic content (default: false)
  waitForSelector?: string;   // CSS selector to wait for in dynamic pages
  headers?: Record<string, string>; // Additional HTTP headers
}
```

### ExamSchema

```typescript
interface ExamSchema {
  exam: string;              // Name of the exam
  source: string;            // Original URL
  extractedAt: string;       // ISO timestamp of extraction
  documents: DocumentRequirement[]; // Array of document requirements
  metadata?: {
    url: string;
    contentType: string;
    extractionMethod: 'html' | 'pdf' | 'dynamic';
    confidence: number;      // Confidence score (0-1)
  };
}
```

### DocumentRequirement

```typescript
interface DocumentRequirement {
  type: string;              // Document type (e.g., "Photo", "Signature")
  requirements: {
    format?: string[];       // Accepted file formats
    maxSize?: string;        // Maximum file size
    minSize?: string;        // Minimum file size
    dimensions?: {
      width?: number;
      height?: number;
      ratio?: string;
    };
    description?: string;    // Human-readable description
    mandatory?: boolean;     // Whether document is required
  };
}
```

## Usage Examples

### Basic HTML Page Extraction

```typescript
import { generateSchemaFromLink } from './src/lib/schema-extraction';

const schema = await generateSchemaFromLink('https://ibpsonline.ibps.in/clerk25');

// Output example:
{
  "exam": "IBPS Clerk 2025",
  "source": "https://ibpsonline.ibps.in/clerk25",
  "extractedAt": "2025-10-13T10:30:00.000Z",
  "documents": [
    {
      "type": "Photo",
      "requirements": {
        "format": ["jpg", "jpeg"],
        "maxSize": "50 KB",
        "minSize": "20 KB",
        "dimensions": {
          "width": 200,
          "height": 230,
          "ratio": "200:230"
        },
        "mandatory": true,
        "description": "Recent passport size color photograph"
      }
    },
    {
      "type": "Signature",
      "requirements": {
        "format": ["jpg", "jpeg"],
        "maxSize": "40 KB",
        "dimensions": {
          "width": 140,
          "height": 60,
          "ratio": "140:60"
        },
        "mandatory": true,
        "description": "Clear signature in black ink"
      }
    }
  ],
  "metadata": {
    "url": "https://ibpsonline.ibps.in/clerk25",
    "contentType": "text/html",
    "extractionMethod": "html",
    "confidence": 0.85
  }
}
```

### PDF Document Extraction

```typescript
const schema = await generateSchemaFromLink('https://example.com/notification.pdf');
// Automatically detects PDF and extracts text content
```

### Dynamic Content with JavaScript

```typescript
const schema = await generateSchemaFromLink('https://sbi.co.in/careers', {
  enableJavascript: true,
  timeout: 45000,
  waitForSelector: '.content, .main'
});
```

### Batch Processing

```typescript
import { SchemaExtractor } from './src/lib/schema-extraction';

const extractor = new SchemaExtractor();
const urls = [
  'https://ibpsonline.ibps.in/clerk25',
  'https://sbi.co.in/careers',
  'https://upsconline.nic.in'
];

const schemas = await extractor.processMultipleLinks(urls);
await extractor.cleanup(); // Important: cleanup resources
```

### Custom Text Analysis

```typescript
import { analyzeCustomText } from './src/lib/schema-extraction/examples';

const customText = `
  Upload recent passport size photograph (JPG format, max 50KB, 200x230 pixels).
  Submit signature in black ink (JPEG format, max 40KB).
`;

const schema = await analyzeCustomText(customText);
```

## Supported Document Types

The module automatically detects and extracts requirements for:

- **Photo/Photograph**: Passport photos, recent photos, color photos
- **Signature**: Digital signatures, handwritten signatures
- **Thumb Impression**: Left thumb, right thumb impressions
- **Educational Documents**: Marksheets, certificates, transcripts
- **Identity Proofs**: ID cards, driving license, passport
- **Address Proofs**: Utility bills, bank statements
- **Certificates**: Caste, income, experience certificates

## Extracted Attributes

For each document, the module extracts:

- **File Formats**: jpg, jpeg, png, pdf, etc.
- **Size Constraints**: Minimum and maximum file sizes
- **Dimensions**: Width, height, aspect ratios
- **Mandatory Status**: Whether document is required or optional
- **Descriptions**: Human-readable requirements

## Architecture

The module follows a clean, modular architecture:

```
src/lib/schema-extraction/
├── index.ts              # Main orchestrator
├── types.ts              # TypeScript interfaces
├── fetcher.ts            # Content fetching (HTTP + Puppeteer)
├── pdf-extractor.ts      # PDF text extraction
├── html-parser.ts        # HTML parsing and text extraction
├── text-analyzer.ts      # Pattern matching and NLP analysis
├── schema-builder.ts     # JSON schema construction
└── examples.ts           # Usage examples and tests
```

### Key Components

1. **ContentFetcher**: Handles HTTP requests and dynamic content loading
2. **PdfExtractor**: Extracts text from PDF documents using pdf-parse
3. **HtmlParser**: Parses HTML and extracts relevant sections using cheerio
4. **TextAnalyzer**: Applies regex patterns and NLP rules to detect requirements
5. **SchemaBuilder**: Constructs and validates the final JSON schema

## Error Handling

The module includes comprehensive error handling:

```typescript
try {
  const schema = await generateSchemaFromLink(url);
} catch (error) {
  // Handle network errors, parsing failures, etc.
  console.error('Extraction failed:', error);
}
```

Even when extraction fails, the function returns a minimal schema with error information:

```typescript
{
  "exam": "Extraction Failed",
  "source": "https://example.com",
  "extractedAt": "2025-10-13T10:30:00.000Z",
  "documents": [],
  "metadata": {
    "error": "Network timeout"
  }
}
```

## Performance

- **Fast Processing**: Typically processes pages in 2-5 seconds
- **Memory Efficient**: Streams content and cleans up resources
- **Rate Limiting**: Built-in delays for batch processing
- **Caching**: Reuses browser instances for multiple dynamic requests

## Testing

Run the included tests:

```typescript
import { runTests, performanceTest } from './src/lib/schema-extraction/examples';

// Run functionality tests
await runTests();

// Run performance benchmarks
await performanceTest();
```

## Limitations

- **Rate Limiting**: Be respectful when making multiple requests
- **Dynamic Content**: Some heavily JavaScript-dependent sites may require custom selectors
- **PDF Quality**: OCR is not included; relies on selectable text in PDFs
- **Language Support**: Optimized for English content

## Contributing

The module is designed to be easily extensible:

1. **Add new patterns** in `text-analyzer.ts`
2. **Support new document types** by extending the type definitions
3. **Improve parsing** by enhancing the HTML or PDF extraction logic
4. **Add new fetching methods** for specialized content types

## License

This module is part of the Dockit project and follows the same licensing terms.

## Support

For issues, feature requests, or questions, please refer to the main Dockit project documentation.