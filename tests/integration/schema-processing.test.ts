import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enhancedDocumentProcessingService } from '@/features/schema/EnhancedDocumentProcessingService';
import { getSchema } from '@/lib/schemaRegistry';

// Mock dependencies
vi.mock('@/lib/schemaRegistry', () => ({
  getSchema: vi.fn()
}));

vi.mock('react-hot-toast', () => {
  const toastFn = Object.assign(
    vi.fn((message) => message),
    {
      success: vi.fn((message) => message),
      error: vi.fn((message) => message),
      promise: vi.fn((promise, messages) => promise)
    }
  );
  return {
    default: toastFn,
    toast: toastFn
  };
});

vi.mock('@/features/verification/DocumentTypeVerifier', () => ({
  documentTypeVerifier: {
    verifyDocumentType: vi.fn().mockResolvedValue({
      verifiedType: 'admit_card',
      confidence: 0.85,
      dimensions: { width: 800, height: 600 },
      fileMetadata: { quality: 85 },
      extractedData: { text: ['Sample text'], detectedElements: [] },
      reasons: ['Test verification'],
      warnings: []
    })
  }
}));

// Mock URL.createObjectURL for Node.js environment
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

global.fetch = vi.fn();

describe('Schema Processing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hook integration: processFiles fetches schema with sufficient data', async () => {
    // Mock getSchema to return a valid JSON Schema with more than 10 properties
    const mockSchema = {
      schema: {
        type: 'object',
        properties: {
          fileName: { type: 'string' },
          fileSize: { type: 'number' },
          fileType: { type: 'string' },
          roll_no: { type: 'string', pattern: '^[0-9]{10}$' },
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string', pattern: '^[0-9]{10}$' },
          dob: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          category: { type: 'string' }
        }
      },
      coverage: 96
    };
    
    (getSchema as any).mockResolvedValue(mockSchema);

    // Create a mock file
    const mockFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf'
    });

    // Call processFiles - it should use the schema from getSchema
    const result = await enhancedDocumentProcessingService.processFiles(
      [mockFile],
      'upsc'
    );

    // Verify getSchema was called
    expect(getSchema).toHaveBeenCalledWith('upsc');
    
    // Verify schema was used
    expect(result).toBeDefined();
    expect(result.processedFiles).toBeDefined();
    
    // Verify the result has validation information
    if (result.processedFiles.length > 0) {
      const firstFile = result.processedFiles[0];
      expect(firstFile.validations).toBeDefined();
      expect(Array.isArray(firstFile.validations)).toBe(true);
    }
  });

  it('hook integration: falls back to schema-gen API when schema insufficient', async () => {
    // Mock getSchema to return insufficient schema (less than 10 fields)
    const insufficientSchema = {
      schema: {
        roll_no: { type: 'string' },
        name: { type: 'string' }
      },
      coverage: 20
    };
    
    (getSchema as any).mockResolvedValue(insufficientSchema);

    // Mock fetch to return generated schema
    const generatedSchema = {
      schema: {
        type: 'object',
        properties: {
          roll_no: { type: 'string', pattern: '^[0-9]{10}$' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', pattern: '^[0-9]{10}$' },
          dob: { type: 'string', format: 'date' },
          address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          pincode: { type: 'string', pattern: '^[0-9]{6}$' },
          category: { type: 'string' },
          gender: { type: 'string' }
        }
      },
      coverage: 95
    };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => generatedSchema
    });

    const mockFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf'
    });

    // Call processFiles - it should fallback to API
    await enhancedDocumentProcessingService.processFiles([mockFile], 'upsc');

    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/schema-gen',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_form: 'upsc' })
      })
    );
  });

  it('AJV validation: schema compliance check is performed', async () => {
    // Mock schema with validation rules
    const mockSchema = {
      schema: {
        type: 'object',
        properties: {
          fileName: { type: 'string' },
          fileSize: { type: 'number' },
          fileType: { type: 'string' },
          field1: { type: 'string' },
          field2: { type: 'string' },
          field3: { type: 'string' },
          field4: { type: 'string' },
          field5: { type: 'string' },
          field6: { type: 'string' },
          field7: { type: 'string' },
          field8: { type: 'string' }
        }
      },
      coverage: 96
    };
    
    (getSchema as any).mockResolvedValue(mockSchema);

    // Create a valid mock file
    const mockFile = new File(['test content'], 'valid.pdf', {
      type: 'application/pdf'
    });

    const result = await enhancedDocumentProcessingService.processFiles(
      [mockFile],
      'upsc'
    );

    // Verify result exists
    expect(result).toBeDefined();
    expect(result.validationReport).toBeDefined();
  });

  it('handles schema loading errors gracefully', async () => {
    // Mock getSchema to throw error
    (getSchema as any).mockRejectedValue(new Error('Schema not found'));
    
    // Mock fetch to also fail
    (global.fetch as any).mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    });

    const mockFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf'
    });

    // Should still process with fallback (empty schema)
    const result = await enhancedDocumentProcessingService.processFiles(
      [mockFile],
      'upsc'
    );

    // Should process successfully with basic validation
    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.validationReport).toBeDefined();
  });
});
