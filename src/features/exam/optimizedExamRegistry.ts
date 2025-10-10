/**
 * Performance-Optimized Dashboard Exam Configuration
 * Uses lazy-loaded schema registry for better performance
 */

import { getSchemaMetadata, getSchema } from '@/features/exam/schemas/schemaRegistry';

// Lightweight exam display data (loaded immediately)
export const examDisplayData = [
  // Government Exams
  { id: 'upsc-cse', name: 'UPSC CSE', category: 'Civil Services', logo: '🏛️', color: 'bg-blue-100 text-blue-600' },
  { id: 'ssc-cgl', name: 'SSC CGL', category: 'Government', logo: '📋', color: 'bg-green-100 text-green-600' },
  { id: 'ibps-po', name: 'IBPS PO', category: 'Banking', logo: '🏦', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'sbi-po', name: 'SBI PO', category: 'Banking', logo: '🏛️', color: 'bg-blue-100 text-blue-600' },
  { id: 'rrb-ntpc', name: 'RRB NTPC', category: 'Railway', logo: '🚂', color: 'bg-red-100 text-red-600' },
  
  // Entrance Exams
  { id: 'jee-main', name: 'JEE Main', category: 'Engineering', logo: '⚙️', color: 'bg-orange-100 text-orange-600' },
  { id: 'jee-advanced', name: 'JEE Advanced', category: 'Engineering', logo: '⚡', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'neet-ug', name: 'NEET UG', category: 'Medical', logo: '🩺', color: 'bg-pink-100 text-pink-600' },
  { id: 'cat', name: 'CAT', category: 'Management', logo: '📊', color: 'bg-purple-100 text-purple-600' },
  { id: 'gate', name: 'GATE', category: 'Engineering', logo: '🎓', color: 'bg-teal-100 text-teal-600' },
  
  // International Exams
  { id: 'ielts', name: 'IELTS', category: 'Language', logo: '🌍', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'toefl', name: 'TOEFL', category: 'Language', logo: '🗣️', color: 'bg-cyan-100 text-cyan-600' },
  { id: 'gre', name: 'GRE', category: 'Graduate', logo: '🎯', color: 'bg-violet-100 text-violet-600' },
  { id: 'gmat', name: 'GMAT', category: 'Business', logo: '💼', color: 'bg-slate-100 text-slate-600' },
  { id: 'sat', name: 'SAT', category: 'Undergraduate', logo: '📝', color: 'bg-amber-100 text-amber-600' },
  
  // Professional Exams
  { id: 'ca-foundation', name: 'CA Foundation', category: 'Accounting', logo: '📊', color: 'bg-lime-100 text-lime-600' },
  { id: 'cfa-level1', name: 'CFA Level 1', category: 'Finance', logo: '💰', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'frm-part1', name: 'FRM Part 1', category: 'Risk Management', logo: '⚖️', color: 'bg-red-100 text-red-600' },
  
  // State Exams (Popular ones)
  { id: 'mpsc', name: 'MPSC', category: 'Maharashtra PSC', logo: '🏛️', color: 'bg-orange-100 text-orange-600' },
  { id: 'tnpsc', name: 'TNPSC', category: 'Tamil Nadu PSC', logo: '🏛️', color: 'bg-blue-100 text-blue-600' },
  { id: 'kpsc', name: 'KPSC', category: 'Karnataka PSC', logo: '🏛️', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'uppsc', name: 'UPPSC', category: 'UP PSC', logo: '🏛️', color: 'bg-green-100 text-green-600' },
  
  // Banking Exams
  { id: 'ibps-clerk', name: 'IBPS Clerk', category: 'Banking', logo: '📋', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'sbi-clerk', name: 'SBI Clerk', category: 'Banking', logo: '🏛️', color: 'bg-blue-100 text-blue-600' },
  { id: 'rbi-grade-b', name: 'RBI Grade B', category: 'Banking', logo: '🏦', color: 'bg-purple-100 text-purple-600' },
];

/**
 * Get exam display information with schema availability status
 */
export async function getExamsWithSchemaStatus() {
  const schemaMetadata = getSchemaMetadata();
  
  return examDisplayData.map(exam => ({
    ...exam,
    hasSchema: !!schemaMetadata[exam.id],
    isSchemaLoaded: schemaMetadata[exam.id]?.isLoaded || false
  }));
}

/**
 * Get exam schema on demand (lazy loaded)
 */
export async function getExamSchema(examId: string) {
  return await getSchema(examId);
}

/**
 * Get popular exams (with schemas available)
 */
export async function getPopularExams(limit = 6) {
  const examsWithStatus = await getExamsWithSchemaStatus();
  return examsWithStatus
    .filter(exam => exam.hasSchema)
    .slice(0, limit);
}

/**
 * Filter exams by category
 */
export async function getExamsByCategory(category: string) {
  const examsWithStatus = await getExamsWithSchemaStatus();
  return examsWithStatus.filter(exam => 
    exam.category.toLowerCase().includes(category.toLowerCase()) && exam.hasSchema
  );
}

/**
 * Search exams by name or category
 */
export async function searchExams(query: string) {
  if (!query.trim()) return [];
  
  const examsWithStatus = await getExamsWithSchemaStatus();
  const searchTerm = query.toLowerCase();
  
  return examsWithStatus.filter(exam => 
    (exam.name.toLowerCase().includes(searchTerm) || 
     exam.category.toLowerCase().includes(searchTerm)) &&
    exam.hasSchema
  );
}

export default {
  examDisplayData,
  getExamsWithSchemaStatus,
  getExamSchema,
  getPopularExams,
  getExamsByCategory,
  searchExams
};