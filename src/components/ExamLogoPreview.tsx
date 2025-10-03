'use client';

import React from 'react';
import { ExamLogo } from '@/components/ExamLogo';

/**
 * Logo Preview Component for testing and documentation
 */
export const ExamLogoPreview: React.FC = () => {
  const exams = [
    { id: 'upsc', name: 'UPSC', emoji: '🏛️' },
    { id: 'ssc', name: 'SSC', emoji: '📋' },
    { id: 'ielts', name: 'IELTS', emoji: '🌍' }
  ];

  const sizes = [24, 32, 48, 64];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Exam Logo Preview</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {exams.map(exam => (
          <div key={exam.id} className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">{exam.name} Logo</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sizes.map(size => (
                <div key={size} className="text-center">
                  <div className="mb-2">
                    <ExamLogo
                      examId={exam.id}
                      examName={exam.name}
                      fallbackEmoji={exam.emoji}
                      size={size}
                      className="mx-auto border-2 border-gray-200 rounded-lg p-2"
                    />
                  </div>
                  <p className="text-sm text-gray-600">{size}px</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
              <p><strong>Fallback Emoji:</strong> {exam.emoji}</p>
              <p><strong>Local SVG:</strong> /exam-logos/{exam.id}-logo.svg</p>
            </div>
          </div>
        ))}
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Integration Example</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-600 mb-2">In the dashboard exam selection:</p>
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white">
              <ExamLogo
                examId="upsc"
                examName="UPSC"
                fallbackEmoji="🏛️"
                size={48}
                className="rounded-full bg-blue-100 p-2"
              />
              <div>
                <p className="font-semibold">UPSC</p>
                <p className="text-sm text-gray-500">Civil Services</p>
                <p className="text-xs text-green-600">✓ Schema Available</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>Logos automatically fallback to emojis if images fail to load</p>
          <p>Local SVG files are prioritized for fastest loading</p>
        </div>
      </div>
    </div>
  );
};