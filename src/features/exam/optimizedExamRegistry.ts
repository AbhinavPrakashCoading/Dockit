/**
 * Performance-Optimized Dashboard Exam Configuration
 * Now only loads from parsed documents - no placeholder schemas
 */

// This registry now only provides helper functions for parsed documents
// All exam data comes from the data/parsed-documents folder

/**
 * Get exam icon based on exam type/name
 */
export function getExamIcon(examType: string): string {
  const type = examType?.toLowerCase() || '';
  
  // Engineering
  if (type.includes('jee') || type.includes('engineering')) return '⚙️';
  if (type.includes('gate')) return '🎓';
  
  // Medical
  if (type.includes('neet') || type.includes('medical')) return '🩺';
  
  // Government/Civil Services
  if (type.includes('upsc') || type.includes('civil') || type.includes('psc')) return '🏛️';
  if (type.includes('ssc')) return '📋';
  
  // Banking
  if (type.includes('bank') || type.includes('ibps') || type.includes('sbi') || type.includes('rbi')) return '🏦';
  
  // Management
  if (type.includes('cat') || type.includes('management') || type.includes('mba')) return '📊';
  if (type.includes('gmat')) return '💼';
  
  // Language
  if (type.includes('ielts') || type.includes('toefl') || type.includes('language')) return '�';
  
  // Professional
  if (type.includes('ca') || type.includes('accounting')) return '📊';
  if (type.includes('cfa') || type.includes('finance')) return '💰';
  if (type.includes('frm') || type.includes('risk')) return '⚖️';
  
  // Default
  return '📄';
}

/**
 * Get exam color based on exam type/name
 */
export function getExamColor(examType: string): string {
  const type = examType?.toLowerCase() || '';
  
  // Engineering
  if (type.includes('jee') || type.includes('engineering')) return 'bg-orange-100 text-orange-600';
  if (type.includes('gate')) return 'bg-teal-100 text-teal-600';
  
  // Medical
  if (type.includes('neet') || type.includes('medical')) return 'bg-pink-100 text-pink-600';
  
  // Government/Civil Services
  if (type.includes('upsc') || type.includes('civil')) return 'bg-blue-100 text-blue-600';
  if (type.includes('ssc')) return 'bg-green-100 text-green-600';
  if (type.includes('psc')) return 'bg-indigo-100 text-indigo-600';
  
  // Banking
  if (type.includes('bank') || type.includes('ibps') || type.includes('sbi')) return 'bg-blue-100 text-blue-600';
  if (type.includes('rbi')) return 'bg-purple-100 text-purple-600';
  
  // Management
  if (type.includes('cat') || type.includes('management') || type.includes('mba')) return 'bg-purple-100 text-purple-600';
  if (type.includes('gmat')) return 'bg-slate-100 text-slate-600';
  
  // Language
  if (type.includes('ielts')) return 'bg-emerald-100 text-emerald-600';
  if (type.includes('toefl')) return 'bg-cyan-100 text-cyan-600';
  
  // Professional
  if (type.includes('ca') || type.includes('accounting')) return 'bg-lime-100 text-lime-600';
  if (type.includes('cfa') || type.includes('finance')) return 'bg-emerald-100 text-emerald-600';
  if (type.includes('frm') || type.includes('risk')) return 'bg-red-100 text-red-600';
  
  // Default
  return 'bg-gray-100 text-gray-600';
}

/**
 * Load parsed documents from API
 */
export async function loadParsedDocuments() {
  try {
    console.log('🔄 Attempting to load parsed documents from API...');
    const response = await fetch('/api/parsed-documents-fallback');
    
    if (!response.ok) {
      console.error('❌ API response not ok:', response.status, response.statusText);
      throw new Error(`Failed to load parsed documents: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully loaded parsed documents:', data.data?.length || 0, 'documents');
    return data.data || [];
  } catch (error) {
    console.error('❌ Error loading parsed documents:', error);
    
    // Return empty array as fallback - this will allow the app to continue working
    // even if there are no parsed documents yet
    console.log('🔄 Returning empty array as fallback');
    return [];
  }
}

/**
 * Get exam schema from parsed document
 */
export async function getExamSchema(examId: string) {
  try {
    console.log('🔄 Loading schema for exam ID:', examId);
    const parsedDocs = await loadParsedDocuments();
    const doc = parsedDocs.find((d: any) => d.id === examId);
    
    if (doc) {
      console.log('✅ Found document with schema:', doc.examName);
      return doc.parsedJson || null;
    } else {
      console.log('⚠️ No document found for exam ID:', examId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting exam schema:', error);
    return null;
  }
}

/**
 * Search exams in parsed documents
 */
export async function searchExams(query: string) {
  const parsedDocs = await loadParsedDocuments();
  const searchTerm = query.toLowerCase();
  
  return parsedDocs
    .filter((doc: any) => 
      doc.examName?.toLowerCase().includes(searchTerm) ||
      doc.examType?.toLowerCase().includes(searchTerm)
    )
    .map((doc: any) => ({
      id: doc.id,
      name: doc.examName,
      category: doc.examType || 'Parsed',
      logo: getExamIcon(doc.examType || doc.examName),
      color: getExamColor(doc.examType || doc.examName),
      hasSchema: true,
      isSchemaLoaded: true,
      schema: doc.parsedJson,
      source: 'parsed-document',
      requiredDocuments: doc.parsedJson?.documents?.map((d: any) => d.type) || [],
      documentCount: doc.documentCount || doc.parsedJson?.documents?.length || 0,
      confidence: doc.confidence || 1,
      createdAt: doc.createdAt,
      originalText: doc.originalText
    }));
}