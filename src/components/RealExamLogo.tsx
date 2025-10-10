/**
 * Hybrid Exam Logo System
 * Real logos with performance optimization
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Real logo URLs for authentic branding
const realLogoUrls: Record<string, {
  primary: string;
  fallback?: string[];
  local?: string;
}> = {
  // Government Exams - Official logos
  'upsc': {
    primary: '/exam-logos/upsc-logo.svg',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/en/5/5d/Union_Public_Service_Commission_logo.svg',
      'https://www.upsc.gov.in/sites/all/themes/upsc/logo.png'
    ],
    local: '/exam-logos/upsc-logo.svg'
  },
  'upsc-cse': {
    primary: '/exam-logos/upsc-logo.svg',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/en/5/5d/Union_Public_Service_Commission_logo.svg'
    ],
    local: '/exam-logos/upsc-logo.svg'
  },
  'ssc': {
    primary: '/exam-logos/ssc-logo.svg',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/en/2/2c/Staff_Selection_Commission_logo.png',
      'https://ssc.nic.in/SSCFileServer/PortalManagement/UploadedFiles/SSC_LOGO.png'
    ],
    local: '/exam-logos/ssc-logo.svg'
  },
  'ssc-cgl': {
    primary: '/exam-logos/ssc-logo.svg',
    local: '/exam-logos/ssc-logo.svg'
  },
  'ielts': {
    primary: '/exam-logos/ielts-logo.svg',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/commons/7/75/IELTS_logo.svg',
      'https://www.ielts.org/-/media/images/ielts-logos/ielts-logo.ashx'
    ],
    local: '/exam-logos/ielts-logo.svg'
  },
  
  // Banking Exams
  'sbi-po': {
    primary: '/exam-logos/sbi-po-logo.svg',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg',
      'https://bank.sbi/documents/16012/1400784/logo.jpg'
    ],
    local: '/exam-logos/sbi-po-logo.svg'
  },
  'sbi-clerk': {
    primary: '/exam-logos/sbi-po-logo.svg',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg'
    ],
    local: '/exam-logos/sbi-po-logo.svg'
  },
  'ibps-po': {
    primary: 'https://www.ibps.in/assets/img/logo.png',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/IBPS_Logo.png/200px-IBPS_Logo.png'
    ]
  },
  'ibps-clerk': {
    primary: 'https://www.ibps.in/assets/img/logo.png'
  },
  'rbi-grade-b': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Reserve_Bank_of_India_Logo.svg',
    fallback: [
      'https://www.rbi.org.in/commonman/English/images/RBI_Logo.jpg'
    ]
  },
  
  // Entrance Exams
  'jee-main': {
    primary: '/exam-logos/jee-main-logo.svg',
    fallback: [
      'https://jeemain.nta.nic.in/frontend/assets/images/logo/jeemain-logo.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/JEE_Main_Logo.png/200px-JEE_Main_Logo.png'
    ],
    local: '/exam-logos/jee-main-logo.svg'
  },
  'jee-advanced': {
    primary: 'https://jeeadv.ac.in/images/logo.png',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/JEE_Advanced_logo.png/200px-JEE_Advanced_logo.png'
    ]
  },
  'neet-ug': {
    primary: '/exam-logos/neet-ug-logo.svg',
    fallback: [
      'https://neet.nta.nic.in/frontend/assets/images/logo/neet-ug-logo.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/NEET-UG_Logo.png/200px-NEET-UG_Logo.png'
    ],
    local: '/exam-logos/neet-ug-logo.svg'
  },
  'cat': {
    primary: '/exam-logos/cat-logo.svg',
    fallback: [
      'https://iimcat.ac.in/images/CAT_logo.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/CAT_exam_logo.png/200px-CAT_exam_logo.png'
    ],
    local: '/exam-logos/cat-logo.svg'
  },
  'gate': {
    primary: 'https://gate.iitd.ac.in/img/gate-logo.png',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/GATE_logo.png/200px-GATE_logo.png'
    ]
  },
  
  // International Exams
  'toefl': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/TOEFL_logo.svg/200px-TOEFL_logo.svg.png',
    fallback: [
      'https://www.ets.org/content/dam/ets-org/toefl/toefl-logo.png'
    ]
  },
  'gre': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/GRE_logo.svg/200px-GRE_logo.svg.png',
    fallback: [
      'https://www.ets.org/content/dam/ets-org/gre/gre-logo.png'
    ]
  },
  'gmat': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/GMAT_logo.svg/200px-GMAT_logo.svg.png',
    fallback: [
      'https://www.mba.com/content/dam/mba/gmat-logo.png'
    ]
  },
  'sat': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/SAT_logo.svg/200px-SAT_logo.svg.png',
    fallback: [
      'https://collegereadiness.collegeboard.org/sat/logo'
    ]
  },
  
  // Professional Exams
  'ca-foundation': {
    primary: 'https://www.icai.org/images/icai-logo.png',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/ICAI_Logo.png/200px-ICAI_Logo.png'
    ]
  },
  'cfa-level1': {
    primary: 'https://www.cfainstitute.org/-/media/cfa/images/cfa-institute-logo.ashx',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/CFA_Institute_logo.svg/200px-CFA_Institute_logo.svg.png'
    ]
  },
  'frm-part1': {
    primary: 'https://www.garp.org/images/garp-logo.png',
    fallback: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/GARP_logo.png/200px-GARP_logo.png'
    ]
  }
};

// Optimized symbol fallbacks (instant render)
const examSymbols: Record<string, string> = {
  'upsc': '🏛️', 'upsc-cse': '🏛️', 'ssc': '📋', 'ssc-cgl': '📋',
  'sbi-po': '🏦', 'sbi-clerk': '🏦', 'ibps-po': '🏦', 'ibps-clerk': '🏦', 'rbi-grade-b': '🏦',
  'jee-main': '⚙️', 'jee-advanced': '⚡', 'neet-ug': '🩺', 'cat': '📊', 'gate': '🎓',
  'ielts': '🌍', 'toefl': '🗣️', 'gre': '🎯', 'gmat': '💼', 'sat': '📝',
  'ca-foundation': '📊', 'cfa-level1': '💰', 'frm-part1': '⚖️'
};

interface RealExamLogoProps {
  examId: string;
  examName: string;
  size?: number;
  className?: string;
  variant?: 'icon' | 'card' | 'list';
  showFallback?: boolean;
  priority?: boolean;
}

/**
 * Real Exam Logo Component with Performance Optimization
 * Shows actual logos with instant symbol fallbacks
 */
export const RealExamLogo: React.FC<RealExamLogoProps> = ({
  examId,
  examName,
  size = 32,
  className = '',
  variant = 'icon',
  showFallback = true,
  priority = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  const logoConfig = realLogoUrls[examId];
  const fallbackSymbol = examSymbols[examId] || '📋';

  // Reset state when examId changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setCurrentUrlIndex(0);
  }, [examId]);

  // If no logo config, show symbol immediately
  if (!logoConfig) {
    return (
      <div 
        className={`flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 ${className}`}
        style={{ width: size, height: size }}
        title={`${examName} Logo`}
      >
        <span style={{ fontSize: size * 0.6 }}>{fallbackSymbol}</span>
      </div>
    );
  }

  const handleImageError = () => {
    const allUrls = [logoConfig.primary, ...(logoConfig.fallback || [])];
    
    if (currentUrlIndex < allUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const getCurrentUrl = () => {
    const allUrls = [logoConfig.primary, ...(logoConfig.fallback || [])];
    return allUrls[currentUrlIndex];
  };

  const currentUrl = getCurrentUrl();

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title={`${examName} Logo`}
    >
      {/* Instant symbol background (renders immediately) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-opacity duration-200 ${
          imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span style={{ fontSize: size * 0.6 }}>{fallbackSymbol}</span>
      </div>
      
      {/* Real logo (progressive enhancement) */}
      {currentUrl && !imageError && (
        <Image
          src={currentUrl}
          alt={`${examName} Official Logo`}
          width={size}
          height={size}
          className={`relative z-10 object-contain transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          priority={priority || variant === 'card'}
          unoptimized={!currentUrl.startsWith('/')} // Allow external URLs
        />
      )}
    </div>
  );
};

/**
 * Preload critical exam logos for better UX
 */
export const preloadCriticalRealLogos = () => {
  if (typeof window === 'undefined') return;
  
  const criticalExams = ['upsc', 'ssc', 'ielts', 'jee-main', 'cat', 'sbi-po', 'neet-ug'];
  
  criticalExams.forEach(examId => {
    const logoConfig = realLogoUrls[examId];
    if (logoConfig?.local) {
      // Preload local logos
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = logoConfig.local;
      link.as = 'image';
      document.head.appendChild(link);
    }
  });
};

/**
 * Batch logo loader for better performance
 */
export const BatchLogoLoader: React.FC<{
  exams: Array<{ id: string; name: string }>;
  onExamClick?: (examId: string) => void;
  iconSize?: number;
}> = ({ exams, onExamClick, iconSize = 48 }) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {exams.map((exam, index) => (
        <button
          key={exam.id}
          onClick={() => onExamClick?.(exam.id)}
          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RealExamLogo
            examId={exam.id}
            examName={exam.name}
            size={iconSize}
            variant="card"
            priority={index < 6} // Prioritize first 6 logos
          />
          <span className="text-xs text-center font-medium truncate w-full">
            {exam.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default RealExamLogo;