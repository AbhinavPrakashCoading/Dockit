// Exam Selector Modal Component
'use client';

import React from 'react';
import { X, Search, Plus, CheckCircle } from 'lucide-react';
import { ExamConfig } from '../../types';

interface ExamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamSelect: (exam: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  exams: ExamConfig[];
  popularExams: ExamConfig[];
  filteredExams: ExamConfig[];
  examsLoading: boolean;
}

const ExamSelectorModal: React.FC<ExamSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  onExamSelect,
  searchQuery,
  onSearchChange,
  exams,
  popularExams,
  filteredExams,
  examsLoading
}) => {
  if (!isOpen) return null;

  // Debug logging
  console.log('🎯 ExamSelectorModal rendering...');
  console.log('📊 Exams count:', exams.length);
  console.log('⭐ Popular exams count:', popularExams.length);
  console.log('🔍 Filtered exams count:', filteredExams.length);
  console.log('⏳ Loading:', examsLoading);
  console.log('🔧 onExamSelect function:', typeof onExamSelect);
  
  if (exams.length > 0) {
    console.log('📋 First exam:', exams[0]);
  }

  return (
    <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold">Choose Your Exam</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Popular Exams - only show when not searching */}
          {!searchQuery && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Popular Exams</h3>
              {examsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {popularExams.map(exam => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        console.log('🎯 Popular exam clicked:', exam.name);
                        console.log('📋 Exam data:', exam);
                        onExamSelect(exam);
                      }}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center"
                    >
                      <div className={`w-16 h-16 ${exam.color} rounded-full flex items-center justify-center mx-auto mb-2 relative`}>
                        <img 
                          src={exam.logo} 
                          alt={exam.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling!.textContent = exam.name.charAt(0);
                          }}
                        />
                        <span className="text-2xl font-bold text-white hidden">{exam.name.charAt(0)}</span>
                        {(exam.hasSchema || exam.schema) && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold">{exam.name}</p>
                      <p className="text-xs text-gray-500">{exam.category}</p>
                      {(exam.hasSchema || exam.schema) && (
                        <p className="text-xs text-green-600 mt-1">✓ Schema Available</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Exams */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'All Exams'}
            </h3>
            {examsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredExams.map(exam => (
                  <button
                    key={exam.id}
                    onClick={() => {
                      console.log('🎯 Filtered exam clicked:', exam.name);
                      console.log('📋 Exam data:', exam);
                      onExamSelect(exam);
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 ${exam.color} rounded-lg flex items-center justify-center flex-shrink-0 relative`}>
                      <img 
                        src={exam.logo} 
                        alt={exam.name}
                        className="w-8 h-8 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.textContent = exam.name.charAt(0);
                        }}
                      />
                      <span className="text-lg font-bold text-white hidden">{exam.name.charAt(0)}</span>
                      {(exam.hasSchema || exam.schema) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{exam.name}</p>
                      <p className="text-sm text-gray-500">{exam.category}</p>
                      {(exam.hasSchema || exam.schema) && (
                        <p className="text-xs text-green-600">✓ Schema Available</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No exams found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSelectorModal;