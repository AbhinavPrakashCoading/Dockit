# Schema Engine Demo

An interactive demonstration of Dockit's autonomous schema discovery and fetching capabilities. This demo shows how the system automatically discovers exam forms from various government and institutional websites, analyzes their structure, and generates schemas for document processing.

## 🚀 Features

### Real-time Schema Discovery
- **Autonomous Crawling**: Automatically discovers new exam forms from configured sources
- **Pattern Recognition**: Uses intelligent selectors to identify form elements
- **Confidence Scoring**: Each discovered schema includes a confidence score (75-99%)
- **Source Tracking**: Shows exactly where each schema was discovered from

### Discovery Sources
The demo monitors several major exam portals:
- **Staff Selection Commission (SSC)** - Priority 1
- **Union Public Service Commission (UPSC)** - Priority 1  
- **Banking Personnel Selection Institute (IBPS)** - Priority 2
- **National Testing Agency (NTA)** - Priority 2

### Schema Information
Each discovered schema includes:
- **Form Fields**: Complete field definitions with validation rules
- **Document Types**: Required document specifications (photos, signatures, etc.)
- **Metadata**: Complexity level, estimated submission time, success rates
- **Source URL**: Direct link to the original form

## 🎮 How to Use

### 1. Access the Demo
Navigate to: `http://localhost:3000/demo/schema-engine`

### 2. Discovery Controls
- **Run Discovery**: Manually trigger a discovery cycle
- **Auto Discovery**: Enable continuous discovery every 10 seconds
- **Manual Generation**: Generate schema for a specific URL
- **Refresh Data**: Reload data from the API

### 3. Interactive Features
- **View Sources**: See all configured discovery sources and their status
- **Browse Schemas**: Click on any discovered schema to view details
- **Live Log**: Watch real-time discovery activity
- **Statistics**: Monitor discovery performance metrics

## 🔧 Technical Implementation

### API Endpoints
- `GET /api/schema-discovery?action=sources` - Get discovery sources
- `GET /api/schema-discovery?action=schemas` - Get discovered schemas
- `GET /api/schema-discovery?action=stats` - Get discovery statistics
- `GET /api/schema-discovery?action=discover` - Trigger discovery
- `POST /api/schema-discovery` - Manual schema generation

### Schema Structure
```typescript
interface ExamSchema {
  examId: string;           // Unique identifier
  version: number;          // Schema version
  generatedAt: Date;        // Discovery timestamp
  confidence: number;       // Confidence score (0-100)
  source: string;          // Discovery source name
  url: string;             // Original form URL
  fields: FormField[];     // Form field definitions
  documentTypes: DocType[]; // Document requirements
  metadata: SchemaMetadata; // Additional information
}
```

### Discovery Sources
```typescript
interface DiscoverySource {
  name: string;            // Human-readable name
  baseUrl: string;         // Base website URL
  searchPatterns: string[]; // URL patterns to search
  selectors: {             // CSS selectors for extraction
    examLinks: string;
    examName: string;
    organization: string;
    deadlines: string;
  };
  priority: number;        // Discovery priority (1-3)
  lastCrawled: Date;       // Last crawl timestamp
  isActive: boolean;       // Enable/disable source
  status: string;          // Current status
}
```

## 📊 Demo Data

The demo includes realistic sample data:

### Sample Schemas
1. **SSC CGL 2024** (95% confidence)
   - 8 form fields including photo/signature
   - Medium complexity, 15min estimated time
   - 87% historical success rate

2. **UPSC Civil Services 2024** (92% confidence)
   - 7 form fields with optional subject selection
   - High complexity, 25min estimated time
   - 78% historical success rate

3. **IBPS PO 2024** (88% confidence)
   - 6 form fields with experience tracking
   - Medium complexity, 12min estimated time
   - 91% historical success rate

### Discovery Statistics
- Total discovered forms
- Active monitoring tasks
- Recent schema changes
- Average confidence scores
- Forms by category
- Priority distribution

## 🎯 Key Demonstrations

### 1. Autonomous Discovery
Watch as the system automatically:
- Crawls configured exam portals
- Identifies new exam forms
- Analyzes form structure
- Generates comprehensive schemas
- Updates monitoring status

### 2. Real-time Monitoring
See live updates for:
- Discovery source status
- New schema generation
- Confidence scoring
- Activity logging
- Performance metrics

### 3. Manual Generation
Test manual schema generation:
- Enter any exam form URL
- Watch analysis process
- View generated schema
- See field extraction
- Review confidence scores

## 🛠 Development

### Local Setup
1. Start development server: `npm run dev`
2. Navigate to schema demo: `/demo/schema-engine`
3. Interact with discovery features
4. Check browser console for debugging

### API Testing
Run the test script:
```bash
node test-schema-demo.js
```

### Customization
- Modify discovery sources in the API
- Adjust confidence thresholds
- Update schema field definitions
- Configure auto-discovery intervals

## 📈 Performance Metrics

The demo tracks:
- **Discovery Rate**: Schemas found per cycle
- **Confidence Levels**: Average confidence scores
- **Source Performance**: Success rates by source
- **Processing Time**: Schema generation speed
- **Change Detection**: Form update monitoring

## 🔍 What This Demonstrates

1. **Intelligent Web Scraping**: Automated discovery from multiple sources
2. **Form Analysis**: Deep understanding of form structure
3. **Schema Generation**: Automatic creation of validation rules
4. **Real-time Monitoring**: Continuous tracking of changes
5. **API Integration**: RESTful endpoints for all operations
6. **User Interface**: Interactive demo with live updates

## 🎨 UI Components

- **Discovery Sources Panel**: Shows all configured sources with status
- **Schema Gallery**: Interactive grid of discovered schemas
- **Discovery Log**: Real-time activity feed with timestamps
- **Statistics Dashboard**: Key metrics and performance data
- **Schema Detail Modal**: Complete schema information
- **Manual Generation Form**: Custom URL schema generation

This demo provides a comprehensive view of how Dockit's autonomous schema engine discovers, analyzes, and manages exam form schemas in real-time, showing the exact sources and confidence levels for each discovered schema.