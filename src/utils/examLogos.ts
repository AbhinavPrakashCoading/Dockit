/**
 * Exam Logo Service
 * Manages fetching and caching of exam logos
 */

import React from 'react';

interface ExamLogoConfig {
  id: string;
  name: string;
  officialUrl?: string;
  fallbackUrl?: string;
  localPath?: string;
}

// Configuration for exam logos with official sources
export const examLogoConfigs: ExamLogoConfig[] = [
  {
    id: 'upsc',
    name: 'UPSC',
    officialUrl: 'https://www.upsc.gov.in/sites/all/themes/upsc/logo.png',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Union_Public_Service_Commission_logo.svg/200px-Union_Public_Service_Commission_logo.svg.png',
    localPath: '/exam-logos/upsc-logo.png'
  },
  {
    id: 'ssc',
    name: 'SSC',
    officialUrl: 'https://ssc.nic.in/SSCFileServer/PortalManagement/UploadedFiles/SSC_LOGO.png',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Staff_Selection_Commission_logo.png/200px-Staff_Selection_Commission_logo.png',
    localPath: '/exam-logos/ssc-logo.png'
  },
  {
    id: 'ielts',
    name: 'IELTS',
    officialUrl: 'https://www.ielts.org/-/media/images/ielts-logos/ielts-logo.ashx',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/IELTS_logo.svg/200px-IELTS_logo.svg.png',
    localPath: '/exam-logos/ielts-logo.png'
  }
];

/**
 * Fetches an exam logo and saves it locally
 */
export async function fetchExamLogo(config: ExamLogoConfig): Promise<string> {
  // Try official URL first, then fallback
  const urls = [config.officialUrl, config.fallbackUrl].filter(Boolean) as string[];
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        
        // In a real application, you'd save this to the server
        // For now, we'll return the URL that worked
        console.log(`✅ Successfully fetched logo for ${config.name} from: ${url}`);
        return url;
      }
    } catch (error) {
      console.warn(`❌ Failed to fetch ${config.name} logo from ${url}:`, error);
    }
  }
  
  // Return local path as fallback
  return config.localPath || '';
}

/**
 * Gets the logo URL for an exam, with fallback handling
 */
export function getExamLogoUrl(examId: string): string {
  const config = examLogoConfigs.find(c => c.id === examId);
  if (!config) {
    return '';
  }
  
  // Check if local file exists, otherwise use fallback URL
  return config.localPath || config.fallbackUrl || '';
}

/**
 * Preloads all exam logos
 */
export async function preloadExamLogos(): Promise<void> {
  console.log('🔄 Preloading exam logos...');
  
  const results = await Promise.allSettled(
    examLogoConfigs.map(config => fetchExamLogo(config))
  );
  
  results.forEach((result, index) => {
    const config = examLogoConfigs[index];
    if (result.status === 'fulfilled') {
      console.log(`✅ ${config.name} logo loaded successfully`);
    } else {
      console.error(`❌ Failed to load ${config.name} logo:`, result.reason);
    }
  });
  
  console.log('✨ Exam logo preloading completed');
}

/**
 * React hook for exam logos
 */
export function useExamLogo(examId: string) {
  const [logoUrl, setLogoUrl] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const config = examLogoConfigs.find(c => c.id === examId);
    if (!config) {
      setError(`No logo configuration found for ${examId}`);
      setIsLoading(false);
      return;
    }
    
    // Start with fallback URL immediately
    setLogoUrl(config.fallbackUrl || config.localPath || '');
    setIsLoading(false);
    
    // Try to fetch better quality logo in background
    fetchExamLogo(config)
      .then(url => {
        setLogoUrl(url);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [examId]);
  
  return { logoUrl, isLoading, error };
}