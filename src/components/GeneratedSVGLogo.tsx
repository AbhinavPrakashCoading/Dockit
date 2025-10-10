/**
 * SVG Logo Generator for 50+ Exams
 * Creates lightweight, consistent SVG logos programmatically
 */

'use client';

import React from 'react';

interface SVGLogoProps {
  examId: string;
  examName: string;
  size?: number;
  className?: string;
}

// Logo configurations for generating consistent SVGs
const logoConfigs: Record<string, {
  symbol: string;
  colors: { bg: string; text: string; accent?: string };
  pattern?: 'circle' | 'shield' | 'hexagon' | 'square';
}> = {
  // Government Exams
  'upsc-cse': { symbol: '🏛️', colors: { bg: '#dbeafe', text: '#2563eb' }, pattern: 'shield' },
  'ssc-cgl': { symbol: '📋', colors: { bg: '#dcfce7', text: '#16a34a' }, pattern: 'square' },
  'ibps-po': { symbol: '🏦', colors: { bg: '#e0e7ff', text: '#4f46e5' }, pattern: 'hexagon' },
  'sbi-po': { symbol: '🏛️', colors: { bg: '#dbeafe', text: '#2563eb', accent: '#fbbf24' }, pattern: 'shield' },
  'rrb-ntpc': { symbol: '🚂', colors: { bg: '#fecaca', text: '#dc2626' }, pattern: 'circle' },
  
  // Entrance Exams
  'jee-main': { symbol: '⚙️', colors: { bg: '#fed7aa', text: '#ea580c' }, pattern: 'hexagon' },
  'jee-advanced': { symbol: '⚡', colors: { bg: '#fef3c7', text: '#d97706' }, pattern: 'circle' },
  'neet-ug': { symbol: '🩺', colors: { bg: '#fce7f3', text: '#ec4899' }, pattern: 'circle' },
  'cat': { symbol: '📊', colors: { bg: '#f3e8ff', text: '#9333ea' }, pattern: 'square' },
  'gate': { symbol: '🎓', colors: { bg: '#ccfbf1', text: '#0d9488' }, pattern: 'shield' },
  
  // International Exams
  'ielts': { symbol: '🌍', colors: { bg: '#d1fae5', text: '#059669' }, pattern: 'circle' },
  'toefl': { symbol: '🗣️', colors: { bg: '#cffafe', text: '#0891b2' }, pattern: 'hexagon' },
  'gre': { symbol: '🎯', colors: { bg: '#ede9fe', text: '#7c3aed' }, pattern: 'circle' },
  'gmat': { symbol: '💼', colors: { bg: '#f1f5f9', text: '#475569' }, pattern: 'square' },
  'sat': { symbol: '📝', colors: { bg: '#fef3c7', text: '#d97706' }, pattern: 'square' },
  
  // Professional Exams
  'ca-foundation': { symbol: '📊', colors: { bg: '#ecfdf5', text: '#65a30d' }, pattern: 'shield' },
  'cfa-level1': { symbol: '💰', colors: { bg: '#d1fae5', text: '#059669' }, pattern: 'hexagon' },
  'frm-part1': { symbol: '⚖️', colors: { bg: '#fecaca', text: '#dc2626' }, pattern: 'shield' },
  
  // State Exams
  'mpsc': { symbol: '🏛️', colors: { bg: '#fed7aa', text: '#ea580c' }, pattern: 'shield' },
  'tnpsc': { symbol: '🏛️', colors: { bg: '#dbeafe', text: '#2563eb' }, pattern: 'shield' },
  'kpsc': { symbol: '🏛️', colors: { bg: '#fef3c7', text: '#d97706' }, pattern: 'shield' },
  'uppsc': { symbol: '🏛️', colors: { bg: '#dcfce7', text: '#16a34a' }, pattern: 'shield' },
  'bpsc': { symbol: '🏛️', colors: { bg: '#fce7f3', text: '#ec4899' }, pattern: 'shield' },
  
  // Banking Exams
  'ibps-clerk': { symbol: '📋', colors: { bg: '#e0e7ff', text: '#4f46e5' }, pattern: 'square' },
  'sbi-clerk': { symbol: '🏛️', colors: { bg: '#dbeafe', text: '#2563eb' }, pattern: 'square' },
  'rbi-grade-b': { symbol: '🏦', colors: { bg: '#f3e8ff', text: '#9333ea' }, pattern: 'hexagon' },
};

// SVG path generators for different patterns
const patterns = {
  circle: (size: number) => `
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="currentColor" opacity="0.1"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 8}" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>
  `,
  
  shield: (size: number) => `
    <path d="M${size/2} 4 L${size-4} ${size/3} L${size-4} ${size*2/3} L${size/2} ${size-4} L4 ${size*2/3} L4 ${size/3} Z" 
          fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1" opacity="0.3"/>
  `,
  
  hexagon: (size: number) => {
    const w = size - 8;
    const h = w * 0.866;
    const cx = size / 2;
    const cy = size / 2;
    return `
      <polygon points="${cx},${cy-h/2} ${cx+w/2},${cy-h/4} ${cx+w/2},${cy+h/4} ${cx},${cy+h/2} ${cx-w/2},${cy+h/4} ${cx-w/2},${cy-h/4}" 
               fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1" opacity="0.3"/>
    `;
  },
  
  square: (size: number) => `
    <rect x="4" y="4" width="${size-8}" height="${size-8}" rx="4" 
          fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1" opacity="0.3"/>
  `
};

/**
 * Generates SVG logos programmatically for consistent branding
 */
export const GeneratedSVGLogo: React.FC<SVGLogoProps> = ({
  examId,
  examName,
  size = 32,
  className = ''
}) => {
  const config = logoConfigs[examId];
  
  if (!config) {
    // Fallback for unknown exams
    return (
      <div 
        className={`flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.6 }}>📋</span>
      </div>
    );
  }

  const { symbol, colors, pattern = 'circle' } = config;
  const patternSVG = patterns[pattern](size);

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title={`${examName} Logo`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ backgroundColor: colors.bg, color: colors.text }}
        className="rounded-lg"
      >
        {/* Background pattern */}
        <g dangerouslySetInnerHTML={{ __html: patternSVG }} />
        
        {/* Accent elements for special exams */}
        {colors.accent && (
          <circle cx={size - 8} cy="8" r="3" fill={colors.accent} opacity="0.8" />
        )}
      </svg>
      
      {/* Emoji overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ fontSize: size * 0.4 }}
      >
        <span>{symbol}</span>
      </div>
    </div>
  );
};

/**
 * Bulk SVG generator for creating static files
 */
export const generateAllSVGLogos = () => {
  if (typeof window === 'undefined') return;
  
  Object.entries(logoConfigs).forEach(([examId, config]) => {
    const size = 64;
    const { symbol, colors, pattern = 'circle' } = config;
    const patternSVG = patterns[pattern](size);
    
    const svgContent = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${colors.bg}" rx="8"/>
        <g fill="${colors.text}">
          ${patternSVG}
        </g>
        ${colors.accent ? `<circle cx="${size - 8}" cy="8" r="3" fill="${colors.accent}" opacity="0.8"/>` : ''}
        <text x="${size/2}" y="${size/2 + 6}" font-size="${size * 0.4}" text-anchor="middle" font-family="system-ui">
          ${symbol}
        </text>
      </svg>
    `;
    
    console.log(`Generated SVG for ${examId}:`, svgContent);
  });
};

export default GeneratedSVGLogo;