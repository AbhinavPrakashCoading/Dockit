import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  storeSchema,
  getSchema,
  getAllSchemas,
  deleteSchema,
  clearAllSchemas,
  getSchemaCount,
} from '@/lib/db';
import {
  validateSchema,
  validateExamForm,
  sanitizeExamForm,
  validateSchemaEntry,
  validateSchemaObject,
  hasRequiredFields,
  getSchemaSize,
  isSchemaWithinSizeLimit,
} from '@/lib/schema-utils';

describe('DB', () => {
  beforeEach(async () => {
    // Clear all schemas before each test
    await clearAllSchemas();
  });

  afterEach(async () => {
    // Clean up after each test
    await clearAllSchemas();
  });

  describe('Basic Operations', () => {
    it('stores and retrieves a schema', async () => {
      await storeSchema('JEE', {});
      const result = await getSchema('JEE');
      
      expect(result).toEqual({
        exam_form: 'JEE',
        schema: {},
      });
    });

    it('stores a schema with complex data', async () => {
      const complexSchema = {
        fields: [
          { name: 'name', type: 'string', required: true },
          { name: 'age', type: 'number', required: false },
        ],
        metadata: {
          version: '1.0',
          created: Date.now(),
        },
      };

      await storeSchema('UPSC', complexSchema);
      const result = await getSchema('UPSC');

      expect(result).toEqual({
        exam_form: 'UPSC',
        schema: complexSchema,
      });
    });

    it('returns null for non-existent schema', async () => {
      const result = await getSchema('NON_EXISTENT');
      expect(result).toBeNull();
    });

    it('updates an existing schema', async () => {
      await storeSchema('JEE', { version: 1 });
      await storeSchema('JEE', { version: 2 });
      
      const result = await getSchema('JEE');
      expect(result?.schema).toEqual({ version: 2 });
    });

    it('deletes a schema', async () => {
      await storeSchema('JEE', {});
      await deleteSchema('JEE');
      
      const result = await getSchema('JEE');
      expect(result).toBeNull();
    });
  });

  describe('Multiple Schemas', () => {
    it('stores and retrieves multiple schemas', async () => {
      await storeSchema('JEE', { exam: 'JEE' });
      await storeSchema('UPSC', { exam: 'UPSC' });
      await storeSchema('NEET', { exam: 'NEET' });

      const jee = await getSchema('JEE');
      const upsc = await getSchema('UPSC');
      const neet = await getSchema('NEET');

      expect(jee?.schema).toEqual({ exam: 'JEE' });
      expect(upsc?.schema).toEqual({ exam: 'UPSC' });
      expect(neet?.schema).toEqual({ exam: 'NEET' });
    });

    it('gets all schemas', async () => {
      await storeSchema('JEE', { exam: 'JEE' });
      await storeSchema('UPSC', { exam: 'UPSC' });

      const allSchemas = await getAllSchemas();
      expect(allSchemas).toHaveLength(2);
      expect(allSchemas.map((s) => s.exam_form)).toContain('JEE');
      expect(allSchemas.map((s) => s.exam_form)).toContain('UPSC');
    });

    it('clears all schemas', async () => {
      await storeSchema('JEE', {});
      await storeSchema('UPSC', {});
      await clearAllSchemas();

      const count = await getSchemaCount();
      expect(count).toBe(0);
    });

    it('gets schema count', async () => {
      await storeSchema('JEE', {});
      await storeSchema('UPSC', {});
      await storeSchema('NEET', {});

      const count = await getSchemaCount();
      expect(count).toBe(3);
    });
  });

  describe('Quota Management', () => {
    it('handles storing many schemas', async () => {
      // Store 55 schemas to test pruning (limit is 50)
      for (let i = 0; i < 55; i++) {
        await storeSchema(`EXAM_${i}`, { id: i });
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      const count = await getSchemaCount();
      // Should have pruned down from 55
      expect(count).toBeLessThan(55);
      // Should still be able to retrieve the most recent ones
      const latest = await getSchema('EXAM_54');
      expect(latest).not.toBeNull();
    }, 10000); // Increase timeout for this test
  });
});

describe('Schema Utils', () => {
  describe('validateSchema', () => {
    it('validates a correct schema', () => {
      const result = validateSchema({
        exam_form: 'JEE',
        schema: {},
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('rejects schema without exam_form', () => {
      const result = validateSchema({
        schema: {},
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('rejects schema without schema field', () => {
      const result = validateSchema({
        exam_form: 'JEE',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('rejects schema with wrong types', () => {
      const result = validateSchema({
        exam_form: 123,
        schema: 'not an object',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateExamForm', () => {
    it('validates correct exam forms', () => {
      expect(validateExamForm('JEE')).toBe(true);
      expect(validateExamForm('UPSC')).toBe(true);
      expect(validateExamForm('JEE_MAIN')).toBe(true);
      expect(validateExamForm('JEE-MAIN')).toBe(true);
      expect(validateExamForm('Exam123')).toBe(true);
    });

    it('rejects invalid exam forms', () => {
      expect(validateExamForm('')).toBe(false);
      expect(validateExamForm('JEE MAIN')).toBe(false);
      expect(validateExamForm('JEE@MAIN')).toBe(false);
      expect(validateExamForm('JEE#MAIN')).toBe(false);
    });
  });

  describe('sanitizeExamForm', () => {
    it('sanitizes exam forms', () => {
      expect(sanitizeExamForm('jee main')).toBe('JEE_MAIN');
      expect(sanitizeExamForm('JEE@Main')).toBe('JEE_MAIN');
      expect(sanitizeExamForm('  jee  ')).toBe('JEE');
      expect(sanitizeExamForm('jee___main')).toBe('JEE_MAIN');
    });
  });

  describe('validateSchemaObject', () => {
    it('validates valid schema objects', () => {
      expect(validateSchemaObject({})).toBe(true);
      expect(validateSchemaObject({ field: 'value' })).toBe(true);
    });

    it('rejects invalid schema objects', () => {
      expect(validateSchemaObject(null as any)).toBe(false);
      expect(validateSchemaObject('string' as any)).toBe(false);
      expect(validateSchemaObject(123 as any)).toBe(false);
    });
  });

  describe('validateSchemaEntry', () => {
    it('validates complete valid entry', () => {
      const result = validateSchemaEntry({
        exam_form: 'JEE',
        schema: { field: 'value' },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects entry with invalid exam form', () => {
      const result = validateSchemaEntry({
        exam_form: 'JEE MAIN',
        schema: {},
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]?.field).toBe('exam_form');
    });
  });

  describe('hasRequiredFields', () => {
    it('checks for required fields', () => {
      const schema = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      };

      expect(hasRequiredFields(schema, ['name', 'age'])).toBe(true);
      expect(hasRequiredFields(schema, ['name', 'phone'])).toBe(false);
      expect(hasRequiredFields(schema, [])).toBe(true);
    });
  });

  describe('getSchemaSize', () => {
    it('calculates schema size', () => {
      const smallSchema = {};
      const largeSchema = {
        data: Array(1000).fill('x'.repeat(100)),
      };

      expect(getSchemaSize(smallSchema)).toBeGreaterThan(0);
      expect(getSchemaSize(largeSchema)).toBeGreaterThan(getSchemaSize(smallSchema));
    });
  });

  describe('isSchemaWithinSizeLimit', () => {
    it('checks size limits', () => {
      const smallSchema = { field: 'value' };
      const largeSchema = {
        data: Array(10000).fill('x'.repeat(1000)),
      };

      expect(isSchemaWithinSizeLimit(smallSchema)).toBe(true);
      expect(isSchemaWithinSizeLimit(largeSchema)).toBe(false);
      expect(isSchemaWithinSizeLimit(smallSchema, 10)).toBe(false);
    });
  });
});
