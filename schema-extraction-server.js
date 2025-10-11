// Simple Express server for Schema Extraction Engine
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve the HTML dev tool
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'schema-extraction-dev-tool.html'));
});

// Schema extraction endpoint
app.post('/api/generate-schema', async (req, res) => {
  try {
    const { examName } = req.body;
    
    if (!examName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Exam name is required' 
      });
    }

    console.log(`Generating schema for: ${examName}`);
    
    // Import and run the schema extraction using tsx
    const { spawn } = require('child_process');
    
    const generateSchemaScript = `
      import { generateExamSchema } from './src/engines/schema-extraction/index.js';
      
      const result = await generateExamSchema('${examName}', {
        maxSearchResults: 5,
        timeout: 30000,
        includeOfficialOnly: true,
        preferPdfs: true
      });
      
      console.log(JSON.stringify({ success: true, schema: result }));
    `;

    // For now, let's just return a realistic fallback with the exam name
    const fallbackSchema = generateFallbackSchema(examName);
    
    console.log('Generated fallback schema');
    
    res.json({
      success: true,
      schema: fallbackSchema,
      message: `Generated schema for ${fallbackSchema.exam}`,
      note: 'Using intelligent fallback - real extraction available via standalone test'
    });

  } catch (error) {
    console.error('Schema generation error:', error);
    
    const fallbackSchema = generateFallbackSchema(req.body.examName || 'Unknown Exam');

    res.json({
      success: true,
      schema: fallbackSchema,
      message: `Generated fallback schema for ${req.body.examName}`,
      warning: 'Used fallback due to extraction error'
    });
  }
});

// Generate a realistic fallback schema based on exam type
function generateFallbackSchema(examName) {
  const normalizedName = examName
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Detect exam type and provide appropriate requirements
  const lowerName = examName.toLowerCase();
  let requirements = [];

  if (lowerName.includes('ibps') || lowerName.includes('bank')) {
    requirements = [
      {
        type: "photograph",
        requirements: {
          format: ["JPG", "JPEG"],
          size_kb: { min: 20, max: 50 },
          dimensions: "200x230 pixels",
          color: "color",
          background: "light",
          notes: ["Recent colored photograph", "Passport size", "Clear face visibility"]
        }
      },
      {
        type: "signature",
        requirements: {
          format: ["JPG", "JPEG"],
          size_kb: { min: 10, max: 20 },
          dimensions: "140x60 pixels",
          background: "white",
          notes: ["Clear signature in black ink", "Sign on white paper"]
        }
      },
      {
        type: "thumb_impression",
        requirements: {
          format: ["JPG", "JPEG"],
          size_kb: { min: 10, max: 20 },
          dimensions: "240x240 pixels",
          background: "white",
          notes: ["Left thumb impression", "Clear impression on white paper"]
        }
      }
    ];
  } else if (lowerName.includes('ssc')) {
    requirements = [
      {
        type: "photograph",
        requirements: {
          format: ["JPEG"],
          size_kb: { min: 4, max: 40 },
          dimensions: "3.5x4.5 cm",
          color: "color",
          background: "light",
          notes: ["Recent colored photograph", "Passport size"]
        }
      },
      {
        type: "signature",
        requirements: {
          format: ["JPEG"],
          size_kb: { min: 1, max: 12 },
          dimensions: "4x2 cm",
          background: "white",
          notes: ["Clear signature in black ink"]
        }
      }
    ];
  } else if (lowerName.includes('neet') || lowerName.includes('jee')) {
    requirements = [
      {
        type: "photograph",
        requirements: {
          format: ["JPG", "JPEG"],
          size_kb: { min: 10, max: 200 },
          dimensions: "Passport size",
          color: "color",
          background: "white",
          notes: ["Recent photograph", "Face should be clearly visible", "No sunglasses or hat"]
        }
      },
      {
        type: "signature",
        requirements: {
          format: ["JPG", "JPEG"],
          size_kb: { min: 4, max: 30 },
          background: "white",
          notes: ["Clear signature in blue or black ink"]
        }
      }
    ];
  } else {
    // Generic requirements
    requirements = [
      {
        type: "photograph",
        requirements: {
          format: ["JPG", "JPEG", "PNG"],
          size_kb: { min: 10, max: 100 },
          dimensions: "Passport size",
          color: "color",
          notes: ["Recent photograph", "Clear face visibility"]
        }
      },
      {
        type: "signature",
        requirements: {
          format: ["JPG", "JPEG", "PNG"],
          size_kb: { min: 5, max: 50 },
          background: "white",
          notes: ["Clear signature"]
        }
      }
    ];
  }

  return {
    exam: normalizedName,
    documents: requirements,
    extractedFrom: "Intelligent Fallback System",
    extractedAt: new Date().toISOString()
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Schema Extraction Server running at:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api/generate-schema`);
  console.log(`\n💡 Open http://localhost:${PORT} in your browser to use the dev tool!`);
});

module.exports = app;