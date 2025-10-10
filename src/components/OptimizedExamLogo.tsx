/**
 * Optimized Exam Logo System
 * Performance-first approach with intelligent fallbacks
 */

'use client';

import React from 'react';
import Image from 'next/image';

// High-performance emoji/symbol mappings for instant rendering
const examSymbols: Record<string, string> = {
  // Government Exams
  'upsc': '🏛️',
  'upsc-cse': '🏛️',
  'ssc': '📋',
  'ssc-cgl': '📋',
  'ibps-po': '🏦',
  'sbi-po': '🏛️',
  'rrb-ntpc': '🚂',
  'ibps-clerk': '📋',
  'sbi-clerk': '🏛️',
  'rbi-grade-b': '🏦',
  
  // Entrance Exams
  'jee-main': '⚙️',
  'jee-advanced': '⚡',
  'neet-ug': '🩺',
  'cat': '📊',
  'gate': '🎓',
  'mat': '📈',
  'xat': '💼',
  'cmat': '📊',
  'snap': '⚡',
  'nmat': '📊',
  
  // International Exams
  'ielts': '🌍',
  'toefl': '🗣️',
  'gre': '🎯',
  'gmat': '💼',
  'sat': '📝',
  'act': '📚',
  'pte': '🌐',
  'duolingo': '🦉',
  
  // Professional Exams
  'ca-foundation': '📊',
  'cfa-level1': '💰',
  'frm-part1': '⚖️',
  'cs-executive': '📋',
  'cma-foundation': '📊',
  
  // State Exams
  'mpsc': '🏛️',
  'tnpsc': '🏛️',
  'kpsc': '🏛️',
  'uppsc': '🏛️',
  'bpsc': '🏛️',
  'gpsc': '🏛️',
  'wbpsc': '🏛️',
  'rpsc': '🏛️',
  'hpsc': '🏛️',
  'opsc': '🏛️',
  
  // Banking Exams
  'nabard': '🌾',
  'ibps-rrb': '🚜',
};

// Available local SVG logos (performance optimized)
const localLogos: Set<string> = new Set([
  'upsc',
  'ssc', 
  'ielts'
]);

// Color schemes for consistent branding
const examColors: Record<string, string> = {
  // Government - Blue tones
  'upsc': 'bg-blue-100 text-blue-600',
  'upsc-cse': 'bg-blue-100 text-blue-600',
  'ssc': 'bg-green-100 text-green-600',
  'ssc-cgl': 'bg-green-100 text-green-600',
  'ibps-po': 'bg-indigo-100 text-indigo-600',
  'sbi-po': 'bg-blue-100 text-blue-600',
  
  // Entrance - Warm tones
  'jee-main': 'bg-orange-100 text-orange-600',
  'jee-advanced': 'bg-yellow-100 text-yellow-600',
  'neet-ug': 'bg-pink-100 text-pink-600',
  'cat': 'bg-purple-100 text-purple-600',
  'gate': 'bg-teal-100 text-teal-600',
  
  // International - Cool tones
  'ielts': 'bg-emerald-100 text-emerald-600',
  'toefl': 'bg-cyan-100 text-cyan-600',
  'gre': 'bg-violet-100 text-violet-600',
  'gmat': 'bg-slate-100 text-slate-600',
  
  // Professional - Accent tones
  'ca-foundation': 'bg-lime-100 text-lime-600',
  'cfa-level1': 'bg-emerald-100 text-emerald-600',
  'frm-part1': 'bg-red-100 text-red-600',
  
  // State - Orange variations
  'mpsc': 'bg-orange-100 text-orange-600',
  'tnpsc': 'bg-blue-100 text-blue-600',
  'kpsc': 'bg-yellow-100 text-yellow-600',
  'uppsc': 'bg-green-100 text-green-600',
  
  // Banking - Professional tones
  'ibps-clerk': 'bg-indigo-100 text-indigo-600',
  'sbi-clerk': 'bg-blue-100 text-blue-600',
  'rbi-grade-b': 'bg-purple-100 text-purple-600',
};

interface OptimizedExamLogoProps {
  examId: string;
  examName: string;
  size?: number;
  className?: string;
  variant?: 'icon' | 'card' | 'list';
  showFallback?: boolean;
}

/**
 * High-Performance Exam Logo Component
 * Prioritizes speed and user experience
 */
export const OptimizedExamLogo: React.FC<OptimizedExamLogoProps> = ({
  examId,
  examName,
  size = 32,
  className = '',
  variant = 'icon',
  showFallback = true
}) => {
  const symbol = examSymbols[examId] || '📋';
  const colorClass = examColors[examId] || 'bg-gray-100 text-gray-600';
  const hasLocalLogo = localLogos.has(examId);

  // For performance: Always show symbol first, optionally enhance with local SVG
  if (!hasLocalLogo || !showFallback) {
    return (
      <div 
        className={`flex items-center justify-center rounded-lg ${colorClass} ${className}`}
        style={{ width: size, height: size }}
        title={`${examName} Logo`}
      >
        <span style={{ fontSize: size * 0.6 }}>{symbol}</span>
      </div>
    );
  }

  // Enhanced version with local SVG (only for available logos)
  return (
    <div 
      className={`relative flex items-center justify-center rounded-lg overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      title={`${examName} Logo`}
    >
      {/* Background with symbol (instant render) */}
      <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
        <span style={{ fontSize: size * 0.6 }}>{symbol}</span>
      </div>
      
      {/* SVG overlay (progressive enhancement) */}
      <Image
        src={`/exam-logos/${examId}-logo.svg`}
        alt={`${examName} Logo`}
        width={size}
        height={size}
        className="relative z-10 object-contain"
        onError={(e) => {
          // Hide SVG on error, show symbol background
          (e.target as HTMLImageElement).style.display = 'none';
        }}
        priority={variant === 'card'} // Prioritize card view logos
      />
    </div>
  );
};

/**
 * Grid-optimized component for exam lists
 */
export const ExamIconGrid: React.FC<{
  exams: Array<{ id: string; name: string }>;
  onExamClick?: (examId: string) => void;
  iconSize?: number;
}> = ({ exams, onExamClick, iconSize = 48 }) => {
  return (
    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {exams.map((exam) => (
        <button
          key={exam.id}
          onClick={() => onExamClick?.(exam.id)}
          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <OptimizedExamLogo
            examId={exam.id}
            examName={exam.name}
            size={iconSize}
            variant="card"
            showFallback={false} // Fast symbols only for grid
          />
          <span className="text-xs text-center font-medium truncate w-full">
            {exam.name}
          </span>
        </button>
      ))}
    </div>
  );
};

/**
 * Preload critical exam logos for better UX
 */
export const preloadCriticalLogos = () => {
  // Only preload the most common local logos
  const criticalLogos = ['upsc', 'ssc', 'ielts'];
  
  criticalLogos.forEach(examId => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = `/exam-logos/${examId}-logo.svg`;
      link.as = 'image';
      document.head.appendChild(link);
    }
  });
};

export default OptimizedExamLogo;