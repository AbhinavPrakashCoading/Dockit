import { ExamSchema } from '@/features/exam/examSchema';

/**
 * Performance-Optimized Schema Registry
 * Now only provides helper functions for parsed documents - no placeholder schemas
 */

// Schema category definitions for lazy loading
export type SchemaCategory = 'government' | 'entrance' | 'international' | 'professional' | 'state' | 'banking' | 'parsed';

interface SchemaRegistryEntry {
  category: SchemaCategory;
  examId: string;
  examName: string;
  isLoaded: boolean;
  schema?: ExamSchema;
}

// No longer using static metadata - all data comes from parsed documents
const schemaMetadata: Record<string, SchemaRegistryEntry> = {};

/**
 * Get schema metadata (now empty since we only use parsed documents)
 */
export function getSchemaMetadata(): Record<string, SchemaRegistryEntry> {
  console.log('⚠️ getSchemaMetadata called - no static schemas available, use parsed documents');
  return schemaMetadata;
}

/**
 * Get schema by ID (now redirects to parsed documents)
 */
export async function getSchema(examId: string): Promise<ExamSchema | null> {
  console.log(`⚠️ getSchema called for ${examId} - use parsed documents API instead`);
  
  try {
    // Redirect to parsed documents API
    const response = await fetch('/api/parsed-documents-fallback');
    if (response.ok) {
      const data = await response.json();
      const doc = data.data?.find((d: any) => d.id === examId);
      return doc?.parsedJson || null;
    }
  } catch (error) {
    console.error('Error getting schema from parsed documents:', error);
  }
  
  return null;
}

/**
 * Load schema by category (now returns empty since we use parsed documents)
 */
export async function loadSchemasByCategory(category: SchemaCategory): Promise<ExamSchema[]> {
  console.log(`⚠️ loadSchemasByCategory called for ${category} - use parsed documents API instead`);
  return [];
}

/**
 * Cache management (not needed for parsed documents)
 */
export function clearSchemaCache(): void {
  console.log('⚠️ clearSchemaCache called - not needed for parsed documents');
}

/**
 * Performance monitoring (not needed for parsed documents)
 */
export function getSchemaLoadingStats() {
  console.log('⚠️ getSchemaLoadingStats called - not applicable for parsed documents');
  return {
    totalSchemas: 0,
    loadedSchemas: 0,
    loadingTime: 0,
    cacheHitRate: 0
  };
}

/**
 * Get exams by category (now redirects to parsed documents)
 */
export function getExamsByCategory(category: SchemaCategory): string[] {
  console.log(`⚠️ getExamsByCategory called for ${category} - use parsed documents API instead`);
  return [];
}

/**
 * Check if schema is loaded (not applicable for parsed documents)
 */
export function isSchemaLoaded(examId: string): boolean {
  console.log(`⚠️ isSchemaLoaded called for ${examId} - not applicable for parsed documents`);
  return false;
}

/**
 * Get cache statistics (not applicable for parsed documents)
 */
export function getCacheStats() {
  console.log('⚠️ getCacheStats called - not applicable for parsed documents');
  return {
    totalExams: 0,
    loadedExams: 0,
    categories: 0,
    loadedCategories: 0
  };
}

/**
 * Preload category (not needed for parsed documents)
 */
export async function preloadCategory(category: SchemaCategory): Promise<void> {
  console.log(`⚠️ preloadCategory called for ${category} - not needed for parsed documents`);
}

export default {
  getSchemaMetadata,
  getExamsByCategory,
  getSchema,
  loadSchemasByCategory,
  clearSchemaCache,
  getSchemaLoadingStats,
  isSchemaLoaded,
  getCacheStats,
  preloadCategory
};