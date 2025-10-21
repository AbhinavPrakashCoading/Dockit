/**
 * 🎯 Quality Preview Handler for Document Processing
 * 
 * Handles user notifications and preview requirements when 
 * document quality is reduced for size compliance.
 */

export interface QualityPreviewData {
  quality: number;
  sizeKB: number;
  maxSizeKB: number;
  previewRequired: boolean;
  previewPDF?: File;
}

export interface QualityPreviewResult {
  approved: boolean;
  continueWithQuality?: boolean;
  increaseSizeLimit?: boolean;
  useOriginalFormat?: boolean;
}

/**
 * Parse quality preview error message
 */
export function parseQualityPreviewError(error: Error): QualityPreviewData | null {
  const message = error.message;
  
  if (message.startsWith('MANDATORY_PREVIEW_REQUIRED|') || message.startsWith('QUALITY_CAUTION|')) {
    const parts = message.split('|');
    if (parts.length >= 5) {
      return {
        quality: parseFloat(parts[1]),
        sizeKB: parseInt(parts[2]),
        maxSizeKB: parseInt(parts[3]),
        previewRequired: message.startsWith('MANDATORY_PREVIEW_REQUIRED'),
        previewPDF: (error as any).previewPDF
      };
    }
  }
  
  return null;
}

/**
 * Generate user-friendly quality messages
 */
export function getQualityMessage(data: QualityPreviewData): {
  title: string;
  message: string;
  severity: 'warning' | 'error';
  icon: string;
} {
  const { quality, sizeKB, maxSizeKB, previewRequired } = data;
  
  if (previewRequired) {
    // Quality below 50% - mandatory preview
    return {
      title: 'Document Quality Significantly Reduced',
      message: `To meet the ${maxSizeKB}KB size requirement, your document quality has been reduced to ${quality.toFixed(0)}%. This may affect readability. Please preview the document before proceeding.`,
      severity: 'error',
      icon: '🔴'
    };
  } else {
    // Quality below 90% - caution message
    return {
      title: 'Document Quality Reduced',
      message: `To meet the ${maxSizeKB}KB size requirement, your document quality has been reduced to ${quality.toFixed(0)}%. The document should still be readable, but you may want to preview it.`,
      severity: 'warning',
      icon: '🟡'
    };
  }
}

/**
 * Get quality-based recommendations
 */
export function getQualityRecommendations(data: QualityPreviewData): string[] {
  const recommendations: string[] = [];
  
  if (data.quality < 50) {
    recommendations.push('📋 Consider using a higher resolution image');
    recommendations.push('📏 Ask administrator to increase size limit if possible');
    recommendations.push('🖼️ Try using a simpler image with less detail');
    recommendations.push('📄 Consider keeping as image format instead of PDF');
  } else if (data.quality < 70) {
    recommendations.push('📋 Preview document to ensure text is still readable');
    recommendations.push('📏 Consider asking administrator about size limit flexibility');
    recommendations.push('🖼️ Original image could be optimized before upload');
  } else {
    recommendations.push('📋 Quality reduction is minimal - document should look good');
    recommendations.push('✅ This level of compression is generally acceptable');
  }
  
  return recommendations;
}

/**
 * Create preview URL for PDF
 */
export function createPreviewURL(pdfFile: File): string {
  return URL.createObjectURL(pdfFile);
}

/**
 * Clean up preview URL
 */
export function cleanupPreviewURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Sample React component usage (for reference)
 */
export const SAMPLE_REACT_USAGE = `
// In your React component:
import { parseQualityPreviewError, getQualityMessage, getQualityRecommendations, createPreviewURL } from './qualityPreviewHandler';

function DocumentUpload() {
  const [previewData, setPreviewData] = useState<QualityPreviewData | null>(null);
  
  const handleTransformError = (error: Error) => {
    const qualityData = parseQualityPreviewError(error);
    if (qualityData) {
      setPreviewData(qualityData);
      // Show quality preview modal
    } else {
      // Handle other errors
    }
  };
  
  const handleQualityApproval = (approved: boolean) => {
    if (approved && previewData?.previewPDF) {
      // User approved the quality - use the preview PDF
      onFileTransformed(previewData.previewPDF);
    }
    setPreviewData(null);
  };
  
  return (
    <div>
      {previewData && (
        <QualityPreviewModal 
          data={previewData}
          onApprove={() => handleQualityApproval(true)}
          onReject={() => handleQualityApproval(false)}
        />
      )}
    </div>
  );
}
`;

/**
 * Sample quality statistics for different document types
 */
export const QUALITY_BENCHMARKS = {
  'id-proof': {
    excellent: 90,
    good: 70,
    acceptable: 50,
    poor: 30
  },
  'marksheet': {
    excellent: 85,
    good: 65,
    acceptable: 45,
    poor: 25
  },
  'signature': {
    excellent: 95,
    good: 80,
    acceptable: 60,
    poor: 40
  }
} as const;