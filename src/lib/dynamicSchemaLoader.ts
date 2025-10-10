/**
 * Dynamic Schema Loader
 * Safely loads schemas without causing build errors when files are missing
 */

import React from 'react';

export interface Schema {
  examId: string;
  examName: string;
  version: string;
  category: string;
  requirements: any[];
  [key: string]: any;
}

export interface ExamConfig {
  id: string;
  name: string;
  category: string;
  logo: string;
  color: string;
  schemaPath?: string;
  requiredDocuments: string[];
  schema?: Schema | null;
}

/**
 * Available schema configurations
 * Only includes schemas that should be attempted to load
 */
const AVAILABLE_SCHEMAS: { [key: string]: Omit<ExamConfig, 'schema'> } = {
  upsc: {
    id: 'upsc',
    name: 'UPSC',
    category: 'Civil Services',
    logo: '🏛️',
    color: 'bg-blue-100 text-blue-600',
    schemaPath: '/schemas/upsc.json',
    requiredDocuments: ['photo', 'signature', 'idProof', 'ageProof', 'educationCertificate', 'experienceCertificate']
  },
  ssc: {
    id: 'ssc',
    name: 'SSC',
    category: 'Government',
    logo: '📋',
    color: 'bg-green-100 text-green-600',
    schemaPath: '/schemas/ssc.json',
    requiredDocuments: ['photo', 'signature', 'idProof', 'ageProof', 'educationCertificate']
  },
  ielts: {
    id: 'ielts',
    name: 'IELTS',
    category: 'Language Proficiency',
    logo: '🌍',
    color: 'bg-purple-100 text-purple-600',
    schemaPath: '/schemas/ielts.json',
    requiredDocuments: ['photo', 'signature', 'passport', 'identityProof']
  },
  cat: {
    id: 'cat',
    name: 'CAT',
    category: 'Management Entrance',
    logo: '📊',
    color: 'bg-orange-100 text-orange-600',
    schemaPath: '/schemas/new-exam-example.json',
    requiredDocuments: ['photo', 'signature']
  },
  jee: {
    id: 'jee',
    name: 'JEE Main',
    category: 'Engineering Entrance',
    logo: '⚙️',
    color: 'bg-indigo-100 text-indigo-600',
    schemaPath: '/schemas/jee-main.json',
    requiredDocuments: ['photo', 'signature', 'class12Certificate', 'categoryProof']
  },
  neet: {
    id: 'neet',
    name: 'NEET',
    category: 'Medical Entrance',
    logo: '🏥',
    color: 'bg-red-100 text-red-600',
    schemaPath: '/schemas/neet.json',
    requiredDocuments: ['photo', 'signature', 'class12Certificate', 'categoryProof']
  }
};

/**
 * Safely load a schema from the API
 */
async function loadSchemaFromAPI(examId: string): Promise<Schema | null> {
  try {
    const response = await fetch(`/api/schema-management?action=get&examId=${examId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.warn(`Schema not found for ${examId}:`, response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to load schema for ${examId}:`, error);
    return null;
  }
}

/**
 * Create fallback schema when actual schema is missing
 */
function createFallbackSchema(examConfig: Omit<ExamConfig, 'schema'>): Schema {
  return {
    examId: examConfig.id,
    examName: examConfig.name,
    version: '1.0.0-fallback',
    category: examConfig.category.toLowerCase().replace(/\s+/g, '-'),
    requirements: examConfig.requiredDocuments.map((doc, index) => ({
      id: doc,
      displayName: doc.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      description: `${doc.replace(/([A-Z])/g, ' $1').toLowerCase()} for ${examConfig.name} application`,
      type: 'Document',
      format: 'PDF/JPEG',
      maxSizeKB: 2000,
      mandatory: index < 2, // First 2 are mandatory (photo, signature)
      category: 'document'
    }))
  };
}

/**
 * Load all available exam schemas dynamically
 */
export async function loadAvailableExams(): Promise<ExamConfig[]> {
  const examConfigs = Object.values(AVAILABLE_SCHEMAS);
  const loadedExams: ExamConfig[] = [];

  // Load schemas in parallel
  const schemaPromises = examConfigs.map(async (config) => {
    const schema = await loadSchemaFromAPI(config.id);
    
    return {
      ...config,
      schema: schema || createFallbackSchema(config)
    };
  });

  try {
    const results = await Promise.allSettled(schemaPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        loadedExams.push(result.value);
      } else {
        // Even if loading fails, include exam with fallback schema
        const config = examConfigs[index];
        loadedExams.push({
          ...config,
          schema: createFallbackSchema(config)
        });
        console.warn(`Failed to load exam ${config.id}, using fallback:`, result.reason);
      }
    });

    return loadedExams;
  } catch (error) {
    console.error('Error loading exams:', error);
    
    // Return all exams with fallback schemas
    return examConfigs.map(config => ({
      ...config,
      schema: createFallbackSchema(config)
    }));
  }
}

/**
 * Load a specific exam schema
 */
export async function loadExamSchema(examId: string): Promise<ExamConfig | null> {
  const config = AVAILABLE_SCHEMAS[examId];
  if (!config) {
    console.warn(`Exam configuration not found for: ${examId}`);
    return null;
  }

  const schema = await loadSchemaFromAPI(examId);
  
  return {
    ...config,
    schema: schema || createFallbackSchema(config)
  };
}

/**
 * Get exam configuration without loading schema
 */
export function getExamConfig(examId: string): Omit<ExamConfig, 'schema'> | null {
  return AVAILABLE_SCHEMAS[examId] || null;
}

/**
 * Get all available exam IDs
 */
export function getAvailableExamIds(): string[] {
  return Object.keys(AVAILABLE_SCHEMAS);
}

/**
 * Check if an exam configuration exists
 */
export function hasExamConfig(examId: string): boolean {
  return examId in AVAILABLE_SCHEMAS;
}

/**
 * Add a new exam configuration dynamically
 */
export function addExamConfig(examConfig: Omit<ExamConfig, 'schema'>): void {
  AVAILABLE_SCHEMAS[examConfig.id] = examConfig;
}

/**
 * Remove an exam configuration
 */
export function removeExamConfig(examId: string): boolean {
  if (examId in AVAILABLE_SCHEMAS) {
    delete AVAILABLE_SCHEMAS[examId];
    return true;
  }
  return false;
}

/**
 * Hook for React components to load schemas
 */
export function useSchemaLoader() {
  const [exams, setExams] = React.useState<ExamConfig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadExams = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedExams = await loadAvailableExams();
      setExams(loadedExams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schemas');
      console.error('Schema loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadExams();
  }, [loadExams]);

  return {
    exams,
    loading,
    error,
    reload: loadExams
  };
}

// For compatibility with existing code
export default {
  loadAvailableExams,
  loadExamSchema,
  getExamConfig,
  getAvailableExamIds,
  hasExamConfig,
  addExamConfig,
  removeExamConfig,
  useSchemaLoader
};