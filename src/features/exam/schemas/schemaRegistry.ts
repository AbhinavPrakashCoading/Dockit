import { ExamSchema } from '@/features/exam/examSchema';

/**
 * Performance-Optimized Schema Registry
 * Implements lazy loading and caching for better app performance
 */

// Schema category definitions for lazy loading
export type SchemaCategory = 'government' | 'entrance' | 'international' | 'professional' | 'state' | 'banking';

interface SchemaRegistryEntry {
  category: SchemaCategory;
  examId: string;
  examName: string;
  isLoaded: boolean;
  schema?: ExamSchema;
}

// Lightweight metadata for quick access (loaded on app start)
const schemaMetadata: Record<string, SchemaRegistryEntry> = {
  // Government Exams
  'upsc-cse': { category: 'government', examId: 'upsc-cse', examName: 'UPSC Civil Services', isLoaded: false },
  'ssc-cgl': { category: 'government', examId: 'ssc-cgl', examName: 'SSC CGL', isLoaded: false },
  'ibps-po': { category: 'government', examId: 'ibps-po', examName: 'IBPS PO', isLoaded: false },
  'sbi-po': { category: 'banking', examId: 'sbi-po', examName: 'SBI PO', isLoaded: false },
  'rrb-ntpc': { category: 'government', examId: 'rrb-ntpc', examName: 'RRB NTPC', isLoaded: false },
  
  // Entrance Exams
  'jee-main': { category: 'entrance', examId: 'jee-main', examName: 'JEE Main', isLoaded: false },
  'jee-advanced': { category: 'entrance', examId: 'jee-advanced', examName: 'JEE Advanced', isLoaded: false },
  'neet-ug': { category: 'entrance', examId: 'neet-ug', examName: 'NEET UG', isLoaded: false },
  'cat': { category: 'entrance', examId: 'cat', examName: 'CAT', isLoaded: false },
  'gate': { category: 'entrance', examId: 'gate', examName: 'GATE', isLoaded: false },
  'mat': { category: 'entrance', examId: 'mat', examName: 'MAT', isLoaded: false },
  'xat': { category: 'entrance', examId: 'xat', examName: 'XAT', isLoaded: false },
  'cmat': { category: 'entrance', examId: 'cmat', examName: 'CMAT', isLoaded: false },
  'snap': { category: 'entrance', examId: 'snap', examName: 'SNAP', isLoaded: false },
  'nmat': { category: 'entrance', examId: 'nmat', examName: 'NMAT', isLoaded: false },
  
  // International Exams
  'ielts': { category: 'international', examId: 'ielts', examName: 'IELTS', isLoaded: false },
  'toefl': { category: 'international', examId: 'toefl', examName: 'TOEFL', isLoaded: false },
  'gre': { category: 'international', examId: 'gre', examName: 'GRE', isLoaded: false },
  'gmat': { category: 'international', examId: 'gmat', examName: 'GMAT', isLoaded: false },
  'sat': { category: 'international', examId: 'sat', examName: 'SAT', isLoaded: false },
  'act': { category: 'international', examId: 'act', examName: 'ACT', isLoaded: false },
  'pte': { category: 'international', examId: 'pte', examName: 'PTE Academic', isLoaded: false },
  'duolingo': { category: 'international', examId: 'duolingo', examName: 'Duolingo English Test', isLoaded: false },
  
  // Professional Exams
  'ca-cpt': { category: 'professional', examId: 'ca-cpt', examName: 'CA Foundation', isLoaded: false },
  'cs-executive': { category: 'professional', examId: 'cs-executive', examName: 'CS Executive', isLoaded: false },
  'cma-foundation': { category: 'professional', examId: 'cma-foundation', examName: 'CMA Foundation', isLoaded: false },
  'frm': { category: 'professional', examId: 'frm', examName: 'FRM', isLoaded: false },
  'cfa': { category: 'professional', examId: 'cfa', examName: 'CFA', isLoaded: false },
  
  // State Exams (examples)
  'mpsc': { category: 'state', examId: 'mpsc', examName: 'MPSC', isLoaded: false },
  'kpsc': { category: 'state', examId: 'kpsc', examName: 'KPSC', isLoaded: false },
  'tnpsc': { category: 'state', examId: 'tnpsc', examName: 'TNPSC', isLoaded: false },
  'uppsc': { category: 'state', examId: 'uppsc', examName: 'UPPSC', isLoaded: false },
  'bpsc': { category: 'state', examId: 'bpsc', examName: 'BPSC', isLoaded: false },
  'gpsc': { category: 'state', examId: 'gpsc', examName: 'GPSC', isLoaded: false },
  'wbpsc': { category: 'state', examId: 'wbpsc', examName: 'WBPSC', isLoaded: false },
  'rpsc': { category: 'state', examId: 'rpsc', examName: 'RPSC', isLoaded: false },
  'hpsc': { category: 'state', examId: 'hpsc', examName: 'HPSC', isLoaded: false },
  'opsc': { category: 'state', examId: 'opsc', examName: 'OPSC', isLoaded: false },
  
  // Banking Exams
  'ibps-clerk': { category: 'banking', examId: 'ibps-clerk', examName: 'IBPS Clerk', isLoaded: false },
  'sbi-clerk': { category: 'banking', examId: 'sbi-clerk', examName: 'SBI Clerk', isLoaded: false },
  'rbi-grade-b': { category: 'banking', examId: 'rbi-grade-b', examName: 'RBI Grade B', isLoaded: false },
  'nabard': { category: 'banking', examId: 'nabard', examName: 'NABARD', isLoaded: false },
  'ibps-rrb': { category: 'banking', examId: 'ibps-rrb', examName: 'IBPS RRB', isLoaded: false }
};

// Cache for loaded schemas
const schemaCache: Map<string, ExamSchema> = new Map();

// Lazy loading functions for each category
const categoryLoaders: Record<SchemaCategory, () => Promise<Record<string, ExamSchema>>> = {
  government: () => import('./governmentExams').then(m => m.governmentExams),
  entrance: () => import('./entranceExams').then(m => m.entranceExams),
  international: () => import('./internationalExams').then(m => m.internationalExams),
  professional: () => import('./professionalExams').then(m => m.professionalExams),
  state: () => import('./stateExams').then(m => m.stateExams),
  banking: () => import('./bankingExams').then(m => m.bankingExams)
};

/**
 * Get schema metadata without loading the full schema
 * Used for displaying exam lists efficiently
 */
export function getSchemaMetadata(): Record<string, Omit<SchemaRegistryEntry, 'schema'>> {
  return Object.fromEntries(
    Object.entries(schemaMetadata).map(([key, value]) => [
      key, 
      { category: value.category, examId: value.examId, examName: value.examName, isLoaded: value.isLoaded }
    ])
  );
}

/**
 * Get exams by category (metadata only)
 */
export function getExamsByCategory(category: SchemaCategory): string[] {
  return Object.keys(schemaMetadata).filter(examId => schemaMetadata[examId].category === category);
}

/**
 * Load and get a specific schema
 * Implements lazy loading and caching
 */
export async function getSchema(examId: string): Promise<ExamSchema | null> {
  // Check cache first
  if (schemaCache.has(examId)) {
    return schemaCache.get(examId)!;
  }

  // Check if exam exists in metadata
  const metadata = schemaMetadata[examId];
  if (!metadata) {
    console.warn(`Schema not found for exam: ${examId}`);
    return null;
  }

  try {
    // Load the category module
    const categorySchemas = await categoryLoaders[metadata.category]();
    
    // Cache all schemas from this category
    Object.entries(categorySchemas).forEach(([id, schema]) => {
      schemaCache.set(id, schema);
      if (schemaMetadata[id]) {
        schemaMetadata[id].isLoaded = true;
        schemaMetadata[id].schema = schema;
      }
    });

    return categorySchemas[examId] || null;
  } catch (error) {
    console.error(`Failed to load schema for ${examId}:`, error);
    return null;
  }
}

/**
 * Preload schemas for a specific category
 * Useful for prefetching when user navigates to a category
 */
export async function preloadCategory(category: SchemaCategory): Promise<void> {
  try {
    const categorySchemas = await categoryLoaders[category]();
    Object.entries(categorySchemas).forEach(([id, schema]) => {
      schemaCache.set(id, schema);
      if (schemaMetadata[id]) {
        schemaMetadata[id].isLoaded = true;
        schemaMetadata[id].schema = schema;
      }
    });
  } catch (error) {
    console.error(`Failed to preload category ${category}:`, error);
  }
}

/**
 * Check if a schema is loaded in cache
 */
export function isSchemaLoaded(examId: string): boolean {
  return schemaCache.has(examId);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    totalExams: Object.keys(schemaMetadata).length,
    loadedExams: schemaCache.size,
    categories: Object.keys(categoryLoaders).length,
    loadedCategories: new Set(
      Array.from(schemaCache.keys()).map(examId => schemaMetadata[examId]?.category).filter(Boolean)
    ).size
  };
}

/**
 * Integration point for autonomous discovery engine
 * This function will be called by the discovery engine to register new schemas
 */
export async function registerDiscoveredSchema(examId: string, schema: ExamSchema, category: SchemaCategory): Promise<void> {
  // Add to metadata
  schemaMetadata[examId] = {
    category,
    examId,
    examName: schema.examName,
    isLoaded: true,
    schema
  };
  
  // Add to cache
  schemaCache.set(examId, schema);
  
  console.log(`Registered new discovered schema: ${examId} in category: ${category}`);
}

/**
 * Future: Integration with autonomous schema discovery
 * This will be called by the discovery engine to update existing schemas
 */
export async function updateDiscoveredSchema(examId: string, updatedSchema: ExamSchema): Promise<void> {
  if (schemaMetadata[examId]) {
    // Update cache
    schemaCache.set(examId, updatedSchema);
    schemaMetadata[examId].schema = updatedSchema;
    
    console.log(`Updated discovered schema: ${examId}`);
  }
}

export default {
  getSchemaMetadata,
  getExamsByCategory,
  getSchema,
  preloadCategory,
  isSchemaLoaded,
  getCacheStats,
  registerDiscoveredSchema,
  updateDiscoveredSchema
};