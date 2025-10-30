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

const sizeConfig = {
  sm: { logo: 24, text: 24, spacing: 12 }, // 24px logo, 24px text, 12px spacing (mobile small)
  md: { logo: 32, text: 32, spacing: 16 }, // 32px logo, 32px text, 16px spacing (mobile header)
  lg: { logo: 36, text: 36, spacing: 18 }, // 36px logo, 36px text, 18px spacing (tablet sidebar)
  xl: { logo: 36, text: 36, spacing: 18 }  // 36px logo, 36px text, 18px spacing (desktop - max size)
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
  const config = sizeConfig[size];

  if (variant === 'icon') {
    return (
      <div className={`${className} flex items-center`} style={{ gap: `${config.spacing}px` }}>
        {/* Logo Icon */}
        <button
          onClick={onLogoClick}
          className="relative hover:shadow-md transition-shadow"
          style={{ width: `${config.logo}px`, height: `${config.logo}px` }}
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
            className={`font-inter font-bold transition-all duration-200 md:block hidden ${textClassName}`}
            style={{
              fontSize: `${config.text}px`,
              color: '#7E22CE'
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
    <div className={`${className} relative flex items-center`} style={{ gap: `${config.spacing}px` }}>
      <div className="relative" style={{ width: `${config.logo}px`, height: `${config.logo}px` }}>
        <Image
          src="/logo.svg"
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
        className="font-inter font-bold md:block hidden"
        style={{
          fontSize: `${config.text}px`,
          color: '#7E22CE'
        }}
      >
        DocKit
      </span>
    </div>
  );
};