import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';

/**
 * Schema definition for exam form schemas
 */
export interface ExamFormSchema {
  exam_form: string;
  schema: Record<string, any>;
}

/**
 * JSON Schema for validating schema structure
 */
const schemaDefinition: JSONSchemaType<ExamFormSchema> = {
  type: 'object',
  properties: {
    exam_form: {
      type: 'string',
      minLength: 1,
    },
    schema: {
      type: 'object',
      required: [],
      additionalProperties: true,
    },
  },
  required: ['exam_form', 'schema'],
  additionalProperties: false,
};

/**
 * Initialize AJV validator
 */
const ajv = new Ajv({
  allErrors: true,
  strict: true,
});

/**
 * Compiled validator for exam form schemas
 */
const validateSchemaStructure: ValidateFunction<ExamFormSchema> =
  ajv.compile(schemaDefinition);

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
    keyword?: string;
  }>;
}

/**
 * Validate a schema JSON object
 * @param data - The schema data to validate
 * @returns Validation result with errors if invalid
 */
export function validateSchema(data: unknown): ValidationResult {
  const valid = validateSchemaStructure(data);

  if (!valid && validateSchemaStructure.errors) {
    return {
      valid: false,
      errors: validateSchemaStructure.errors.map((err) => ({
        field: err.instancePath || err.schemaPath,
        message: err.message || 'Validation error',
        keyword: err.keyword,
      })),
    };
  }

  return { valid: true };
}

/**
 * Validate exam form identifier
 * @param examForm - The exam form string to validate
 * @returns True if valid, false otherwise
 */
export function validateExamForm(examForm: string): boolean {
  // Must be a non-empty string with alphanumeric characters, underscores, or hyphens
  const examFormRegex = /^[A-Za-z0-9_-]+$/;
  return examFormRegex.test(examForm) && examForm.length > 0;
}

/**
 * Sanitize exam form identifier
 * Removes invalid characters and normalizes the string
 * @param examForm - The exam form string to sanitize
 * @returns Sanitized exam form identifier
 */
export function sanitizeExamForm(examForm: string): string {
  return examForm
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .toUpperCase();
}

/**
 * Validate that a schema object is not empty and has valid structure
 * @param schema - The schema object to validate
 * @returns True if valid, false otherwise
 */
export function validateSchemaObject(
  schema: Record<string, any>
): boolean {
  // Schema should be an object
  if (typeof schema !== 'object' || schema === null) {
    return false;
  }

  // Schema can be empty for initial storage
  return true;
}

/**
 * Deep clone a schema object to prevent mutations
 * @param schema - The schema to clone
 * @returns Cloned schema
 */
export function cloneSchema(schema: Record<string, any>): Record<string, any> {
  return JSON.parse(JSON.stringify(schema));
}

/**
 * Validate a complete schema entry with exam form and schema
 * @param data - The complete schema entry to validate
 * @returns Validation result
 */
export function validateSchemaEntry(data: unknown): ValidationResult {
  // First validate the structure
  const structureValidation = validateSchema(data);
  if (!structureValidation.valid) {
    return structureValidation;
  }

  // Type assertion after validation
  const schemaEntry = data as ExamFormSchema;

  // Validate exam form
  if (!validateExamForm(schemaEntry.exam_form)) {
    return {
      valid: false,
      errors: [
        {
          field: 'exam_form',
          message:
            'Exam form must contain only alphanumeric characters, underscores, or hyphens',
        },
      ],
    };
  }

  // Validate schema object
  if (!validateSchemaObject(schemaEntry.schema)) {
    return {
      valid: false,
      errors: [
        {
          field: 'schema',
          message: 'Schema must be a valid object',
        },
      ],
    };
  }

  return { valid: true };
}

/**
 * Check if a schema has specific required fields
 * @param schema - The schema to check
 * @param requiredFields - Array of required field names
 * @returns True if all required fields exist
 */
export function hasRequiredFields(
  schema: Record<string, any>,
  requiredFields: string[]
): boolean {
  return requiredFields.every((field) => field in schema);
}

/**
 * Get schema size in bytes (approximate)
 * @param schema - The schema to measure
 * @returns Approximate size in bytes
 */
export function getSchemaSize(schema: Record<string, any>): number {
  return new Blob([JSON.stringify(schema)]).size;
}

/**
 * Check if schema is within size limits
 * @param schema - The schema to check
 * @param maxSizeInBytes - Maximum allowed size (default 5MB)
 * @returns True if within limits
 */
export function isSchemaWithinSizeLimit(
  schema: Record<string, any>,
  maxSizeInBytes: number = 5 * 1024 * 1024
): boolean {
  return getSchemaSize(schema) <= maxSizeInBytes;
}
