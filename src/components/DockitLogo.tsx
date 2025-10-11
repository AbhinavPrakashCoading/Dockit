/**
 * DocKit Brand Logo Component
 * 
 * Displays the official DocKit logo with proper sizing and fallbacks
 */

import React from 'react';
import Image from 'next/image';

interface DockitLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
  onLogoClick?: () => void;
  onTextClick?: () => void;
  showText?: boolean;
  textClassName?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8', 
  lg: 'w-10 h-10',
  xl: 'w-12 h-12'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl', 
  xl: 'text-2xl'
};

export const DockitLogo: React.FC<DockitLogoProps> = ({ 
  size = 'md', 
  variant = 'icon',
  className = '',
  onLogoClick,
  onTextClick,
  showText = false,
  textClassName = ''
}) => {
  const sizeClass = sizeClasses[size];
  const textSizeClass = textSizeClasses[size];

  if (variant === 'icon') {
    return (
      <div className={`${className} flex items-center gap-3`}>
        {/* Logo Icon */}
        <button
          onClick={onLogoClick}
          className={`${sizeClass} relative hover:shadow-md transition-shadow`}
          title="Toggle Menu"
        >
          <Image
            src="/logos/main/dockit-icon.png"
            alt="DocKit"
            fill
            className="object-contain"
            priority
            onError={(e) => {
              // Fallback to styled div with your brand colors if logo fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.className += ' bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center';
                target.parentElement.innerHTML = '<span class="text-white font-bold text-sm">D</span>';
              }
            }}
          />
        </button>
        
        {/* Text (when expanded) */}
        {showText && (
          <button
            onClick={onTextClick}
            className={`${textSizeClass} font-bold transition-all duration-200 ${textClassName}`}
            style={{
              background: 'linear-gradient(to right, #8B5CF6, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #7C3AED, #2563EB)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #8B5CF6, #3B82F6)';
            }}
            title="Go to Overview"
          >
            DocKit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} relative flex items-center`}>
      <div className={`${sizeClass} relative mr-3`}>
        <Image
          src="/logos/main/dockit-logo-full.png"
          alt="DocKit"
          fill
          className="object-contain"
          priority
          onError={(e) => {
            // Fallback to icon version if full logo fails
            const target = e.target as HTMLImageElement;
            target.src = '/logos/main/dockit-icon.png';
            target.onerror = () => {
              // Final fallback with your brand colors
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.className += ' bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center';
                target.parentElement.innerHTML = '<span class="text-white font-bold text-xs">D</span>';
              }
            };
          }}
        />
      </div>
      <span 
        className={`${textSizeClass} font-bold`}
        style={{
          background: 'linear-gradient(to right, #8B5CF6, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        DocKit
      </span>
    </div>
  );
};