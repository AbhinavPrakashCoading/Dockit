'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ExamLogoProps {
  examId: string;
  examName: string;
  fallbackEmoji?: string;
  className?: string;
  size?: number;
}

// Logo URLs for different exams
const logoUrls: Record<string, string[]> = {
  upsc: [
    '/exam-logos/upsc-logo.svg', // Local SVG first
    'https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Union_Public_Service_Commission_logo.svg/200px-Union_Public_Service_Commission_logo.svg.png',
    'https://www.upsc.gov.in/sites/all/themes/upsc/logo.png'
  ],
  ssc: [
    '/exam-logos/ssc-logo.svg', // Local SVG first
    'https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Staff_Selection_Commission_logo.png/200px-Staff_Selection_Commission_logo.png',
    'https://ssc.nic.in/SSCFileServer/PortalManagement/UploadedFiles/SSC_LOGO.png'
  ],
  ielts: [
    '/exam-logos/ielts-logo.svg', // Local SVG first
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/IELTS_logo.svg/200px-IELTS_logo.svg.png',
    'https://www.ielts.org/-/media/images/ielts-logos/ielts-logo.ashx'
  ]
};

export const ExamLogo: React.FC<ExamLogoProps> = ({ 
  examId, 
  examName, 
  fallbackEmoji = '📋', 
  className = '',
  size = 32 
}) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const urls = logoUrls[examId] || [];
  const currentUrl = urls[currentUrlIndex];

  // Reset when examId changes
  useEffect(() => {
    setCurrentUrlIndex(0);
    setImageError(false);
    setIsLoaded(false);
  }, [examId]);

  const handleImageError = () => {
    // Try next URL if available
    if (currentUrlIndex < urls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // If no URLs or all failed, show emoji fallback
  if (!currentUrl || imageError) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        title={`${examName} Logo`}
      >
        <span style={{ fontSize: size * 0.6 }}>{fallbackEmoji}</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Loading indicator */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded animate-pulse"
          style={{ fontSize: size * 0.4 }}
        >
          <span>📋</span>
        </div>
      )}
      
      {/* Actual image */}
      <Image
        src={currentUrl}
        alt={`${examName} Logo`}
        width={size}
        height={size}
        className={`object-contain transition-opacity duration-200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        unoptimized // Allow external URLs
      />
    </div>
  );
};

// Higher-order component for exam cards
export const withExamLogo = <P extends object>(
  Component: React.ComponentType<P & { logo: React.ReactNode }>
) => {
  return function ExamCardWithLogo(props: P & { examId: string; examName: string }) {
    const { examId, examName, ...rest } = props;
    
    const logo = (
      <ExamLogo 
        examId={examId} 
        examName={examName}
        size={24}
        className="rounded-md"
      />
    );
    
    return <Component {...(rest as P & { logo: React.ReactNode })} logo={logo} />;
  };
};