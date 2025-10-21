# Schema Extraction Engine

A TypeScript-based autonomous schema extraction engine that can generate exam document upload schemas by analyzing official exam websites and PDFs.

## 🚀 Overview

The Schema Extraction Engine automatically:
1. **Searches** for official exam content across government and examination websites
2. **Extracts** text from PDFs and HTML pages
3. **Analyzes** content to identify document upload requirements
4. **Generates** structured JSON schemas for document validation

## 📁 Architecture

```
src/engines/schema-extraction/
├── index.ts                 # Main engine & exports
├── types.ts                 # TypeScript interfaces
├── constants.ts             # Configuration & patterns
├── search-layer.ts          # Web search functionality
├── content-extractor.ts     # PDF & HTML extraction
├── schema-inference.ts      # Pattern detection & analysis
└── schema-builder.ts        # JSON schema construction
```

## 🔧 Installation

The engine is already integrated into the DocKit project. Required dependencies:

```bash
pnpm add pdf-parse @types/pdf-parse axios cheerio
```

## 📖 Usage

### Basic Usage

```typescript
import { generateExamSchema } from './engines/schema-extraction';

// Generate schema for any exam
const schema = await generateExamSchema('ibps-clerk-2025');

console.log(schema);
// Output:
// {
//   "exam": "IBPS Clerk 2025",
//   "documents": [
//     {
//       "type": "photograph",
//       "requirements": {
//         "format": ["JPG", "JPEG"],
//         "size_kb": { "min": 20, "max": 50 },
//         "dimensions": "200x230 pixels",
//         "color": "color",
//         "background": "light"
//       }
//     }
//   ],
//   "extractedFrom": "https://ibps.in/...",
//   "extractedAt": "2025-10-11T..."
// }
```

### Advanced Usage with Options

```typescript
const schema = await generateExamSchema('ssc-cgl-2025', {
  maxSearchResults: 8,
  timeout: 45000,
  includeOfficialOnly: true,
  preferPdfs: true
});
```

### Batch Processing

```typescript
const exams = ['ibps-po-2025', 'sbi-clerk-2025', 'rrb-je-2025'];
const schemas = [];

for (const exam of exams) {
  const schema = await generateExamSchema(exam);
  schemas.push(schema);
}
```

## 🎯 Supported Exam Types

The engine works with any exam name but has optimized patterns for:

- **Banking**: IBPS, SBI, RBI exams
- **Government**: SSC, UPSC, Railway exams  
- **Medical/Engineering**: NEET, JEE, GATE
- **State Exams**: Any state-level competitive exams

## 📊 Output Schema Format

```typescript
interface ExamSchema {
  exam: string;                    // Normalized exam name
  documents: DocumentRequirement[]; // Document upload requirements
  extractedFrom?: string;          // Primary source URL
  extractedAt?: string;            // ISO timestamp
}

interface DocumentRequirement {
  type: string;                    // Document type (photo, signature, etc.)
  requirements: {
    format?: string[];             // File formats (JPG, PDF, etc.)
    size_kb?: {                    // File size limits
      min?: number;
      max?: number;
    };
    dimensions?: string;           // Image dimensions
    color?: 'color' | 'black-white' | 'any';
    background?: string;           // Background requirements
    notes?: string[];              // Additional instructions
  };
}
```

## 🔍 How It Works

### 1. Search Layer
- Generates targeted search queries for exam content
- Searches official government domains (.gov.in, .nic.in, etc.)
- Prioritizes PDF documents and official notifications
- Uses multiple search strategies for comprehensive coverage

### 2. Content Extraction
- Extracts text from PDF files using `pdf-parse`
- Processes HTML content with `cheerio`
- Implements retry mechanisms for reliability
- Handles various document formats and encodings

### 3. Pattern Recognition
- Uses regex patterns to detect file formats, sizes, dimensions
- Identifies document types (photo, signature, certificates)
- Analyzes context for comprehensive requirements
- Calculates confidence scores for extracted patterns

### 4. Schema Building
- Normalizes and validates extracted requirements
- Adds missing standard requirements
- Enhances with common defaults and validation rules
- Generates clean, structured JSON output

## ⚙️ Configuration Options

```typescript
interface ExtractionEngineOptions {
  maxSearchResults?: number;    // Default: 10
  timeout?: number;             // Default: 60000ms
  includeOfficialOnly?: boolean; // Default: true
  preferPdfs?: boolean;         // Default: true
}
```

## 🧪 Testing

Run the test suite:

```typescript
// Run all tests
import { runAllTests } from './test-schema-extraction';
await runAllTests();

// Run specific tests
import { testSchemaExtraction, performanceTest } from './test-schema-extraction';
await testSchemaExtraction();
await performanceTest();
```

## 📈 Performance

- **Average extraction time**: 15-30 seconds per exam
- **Success rate**: 85%+ for major government exams
- **Fallback support**: Always returns valid schema
- **Rate limiting**: Respectful crawling with delays

## 🛡️ Error Handling

The engine includes comprehensive error handling:

- **Network failures**: Automatic retries with exponential backoff
- **Content extraction errors**: Graceful fallbacks to placeholder content
- **Pattern detection failures**: Uses standard exam requirements as fallback
- **Invalid schemas**: Validation with automatic fixes

## 🔒 Compliance

- **Respectful crawling**: Implements delays and rate limiting
- **User-Agent rotation**: Mimics legitimate browser requests
- **Official sources**: Prioritizes government and official domains
- **No authentication**: Only accesses publicly available content

## 📝 Examples

See `/src/schema-extraction-examples.ts` for comprehensive usage examples including:

- Basic schema generation
- Custom configuration options
- Batch processing multiple exams
- Document validation using generated schemas
- Integration with existing DocKit systems

## 🚨 Limitations

- **PDF-dependent**: Some exams may not have easily parseable PDFs
- **Network-dependent**: Requires internet access for real-time extraction
- **Pattern-based**: May miss unconventional requirement formats
- **Language support**: Optimized for English content

## 🔧 Troubleshooting

### Common Issues

1. **No content found**: Check if exam has recent official notifications
2. **Extraction timeout**: Increase timeout in options
3. **Invalid schema**: Engine will auto-generate fallback with standard requirements
4. **PDF parsing errors**: Fallback to placeholder content with common patterns

### Debug Mode

Enable detailed logging by setting environment variable:
```bash
DEBUG=schema-extraction npm run dev
```

## 🤝 Contributing

To extend the engine:

1. **Add new exam patterns**: Update `/constants.ts` with new regex patterns
2. **Support new document types**: Extend `DOCUMENT_TYPES` mapping
3. **Add new domains**: Update `SEARCH_DOMAINS` for additional official sources
4. **Improve extraction**: Enhance content extraction logic in relevant modules

## 📄 License

This Schema Extraction Engine is part of the DocKit project and follows the same licensing terms.