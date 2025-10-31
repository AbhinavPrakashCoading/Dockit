/**
 * Demo: ONNX Schema Inference System
 * 
 * This file demonstrates how to use the ONNX-powered schema inference
 * for PDF form processing.
 */

// Example usage of the schema-gen API

const exampleUsage = async () => {
  const response = await fetch('/api/schema-gen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exam_form: 'JEE_MAIN_2024',
      url: 'https://example.com/jee-main-form.pdf', // Optional
    }),
  });

  const result = await response.json();
  
  console.log('Schema Generation Result:', {
    success: result.success,
    exam_form: result.exam_form,
    pages: result.pages,
    is_scanned: result.is_scanned,
    ocr_confidence: result.ocr_conf,
    coverage: result.coverage,
    field_count: Object.keys(result.schema || {}).length,
    issues: result.issues,
  });

  // Example schema output
  if (result.schema) {
    console.log('\nExtracted Schema Fields:');
    Object.entries(result.schema).forEach(([field, config]: [string, any]) => {
      console.log(`  ${field}:`, {
        type: config.type,
        pattern: config.pattern?.substring(0, 50) + '...',
        format: config.format,
        confidence: config.confidence,
      });
    });
  }
};

// Example: Mock data for different exam types

const mockSchemaJEE = {
  roll_no: {
    type: 'string',
    pattern: '^[A-Z0-9]{10,15}$',
    confidence: 0.92,
  },
  application_no: {
    type: 'string',
    pattern: '^APP[0-9]{12}$',
    confidence: 0.89,
  },
  name: {
    type: 'string',
    confidence: 0.95,
  },
  dob: {
    type: 'string',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    confidence: 0.91,
  },
  email: {
    type: 'string',
    format: 'email',
    confidence: 0.94,
  },
  phone: {
    type: 'string',
    pattern: '^\\+?\\d{10,12}$',
    confidence: 0.88,
  },
  father_name: {
    type: 'string',
    confidence: 0.87,
  },
  mother_name: {
    type: 'string',
    confidence: 0.86,
  },
  category: {
    type: 'string',
    pattern: '^(General|OBC|SC|ST|EWS)$',
    confidence: 0.93,
  },
  gender: {
    type: 'string',
    pattern: '^(Male|Female|Other)$',
    confidence: 0.95,
  },
  state: {
    type: 'string',
    confidence: 0.84,
  },
  district: {
    type: 'string',
    confidence: 0.82,
  },
  pincode: {
    type: 'string',
    pattern: '^\\d{6}$',
    confidence: 0.90,
  },
  subject: {
    type: 'string',
    confidence: 0.79,
  },
  exam_center: {
    type: 'string',
    confidence: 0.81,
  },
};

// Calculate coverage
const calculateCoverage = (schema: any) => {
  const EXPECTED_FIELDS = 20;
  const extractedFields = Object.keys(schema).length;
  return Math.min((extractedFields / EXPECTED_FIELDS) * 100, 100);
};

console.log('JEE Schema Coverage:', calculateCoverage(mockSchemaJEE).toFixed(2) + '%');

// Example: Validation using extracted schema

const validateFormData = (data: any, schema: any) => {
  const errors: string[] = [];
  
  Object.entries(schema).forEach(([field, config]: [string, any]) => {
    const value = data[field];
    
    if (!value) {
      errors.push(`Missing required field: ${field}`);
      return;
    }
    
    // Validate pattern if present
    if (config.pattern) {
      const pattern = new RegExp(config.pattern);
      if (!pattern.test(value)) {
        errors.push(`Invalid format for ${field}: ${value}`);
      }
    }
    
    // Validate type
    if (config.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} must be a number`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Example form data
const sampleFormData = {
  roll_no: 'JEE2024123456',
  application_no: 'APP789456123456',
  name: 'Rajesh Kumar Sharma',
  dob: '2005-03-15',
  email: 'rajesh.kumar@example.com',
  phone: '9876543210',
  father_name: 'Vijay Kumar Sharma',
  mother_name: 'Sunita Sharma',
  category: 'General',
  gender: 'Male',
  state: 'Uttar Pradesh',
  district: 'Lucknow',
  pincode: '226001',
  subject: 'Mathematics, Physics, Chemistry',
  exam_center: 'IIT Delhi',
};

const validation = validateFormData(sampleFormData, mockSchemaJEE);
console.log('\nValidation Result:', validation);

// Example: Progressive enhancement with confidence scores

const analyzeSchemaQuality = (schema: any) => {
  const fields = Object.entries(schema);
  const confidenceScores = fields.map(([, config]: [string, any]) => config.confidence || 0);
  
  const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
  const lowConfidenceFields = fields.filter(([, config]: [string, any]) => (config.confidence || 0) < 0.7);
  
  return {
    totalFields: fields.length,
    averageConfidence: avgConfidence.toFixed(3),
    lowConfidenceFields: lowConfidenceFields.map(([field]) => field),
    quality: avgConfidence > 0.8 ? 'High' : avgConfidence > 0.6 ? 'Medium' : 'Low',
  };
};

console.log('\nSchema Quality Analysis:', analyzeSchemaQuality(mockSchemaJEE));

// Example: Field type inference demonstration

const inferFieldTypeDemo = (fieldName: string, sampleValue: string) => {
  // Date detection
  if (/^\d{4}-\d{2}-\d{2}$/.test(sampleValue)) {
    return { type: 'string', format: 'date' };
  }
  
  // Email detection
  if (/^[\w\.-]+@[\w\.-]+\.\w+$/.test(sampleValue)) {
    return { type: 'string', format: 'email' };
  }
  
  // Phone detection
  if (/^\+?\d{10,12}$/.test(sampleValue)) {
    return { type: 'string', format: 'phone' };
  }
  
  // Number detection
  if (/^\d+$/.test(sampleValue)) {
    return { type: 'number' };
  }
  
  // Pincode detection
  if (/^\d{6}$/.test(sampleValue) && fieldName.includes('pin')) {
    return { type: 'string', format: 'pincode' };
  }
  
  return { type: 'string' };
};

console.log('\nField Type Inference Examples:');
console.log('  dob:', inferFieldTypeDemo('dob', '2005-03-15'));
console.log('  email:', inferFieldTypeDemo('email', 'test@example.com'));
console.log('  phone:', inferFieldTypeDemo('phone', '9876543210'));
console.log('  pincode:', inferFieldTypeDemo('pincode', '226001'));

export {
  exampleUsage,
  calculateCoverage,
  validateFormData,
  analyzeSchemaQuality,
  inferFieldTypeDemo,
  mockSchemaJEE,
};
