/**
 * Extended File interface that includes document type metadata
 * This allows proper requirement matching during transformation
 */

export interface ExtendedFile extends File {
  documentType?: string;
  matchedRequirement?: any;
}

/**
 * Type guard to check if a file has document type metadata
 */
export function hasDocumentType(file: File): file is ExtendedFile {
  return 'documentType' in file && typeof (file as any).documentType === 'string';
}

/**
 * Utility to create an extended file with document type metadata
 */
export function createExtendedFile(file: File, documentType: string, matchedRequirement?: any): ExtendedFile {
  const extendedFile = Object.assign(file, {
    documentType,
    matchedRequirement
  });
  return extendedFile;
}