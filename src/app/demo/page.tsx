/**
 * Demo Index Page
 * Lists all available Dockit demos and their features
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Database, 
  Eye, 
  Brain, 
  Upload, 
  ArrowRight,
  Sparkles,
  Activity,
  Globe,
  Settings,
  FileText,
  Zap,
  Plus
} from 'lucide-react';

interface DemoCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  features: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Available' | 'Coming Soon';
}

const demos: DemoCard[] = [
  {
    title: 'Schema Engine Demo',
    description: 'Interactive demonstration of autonomous schema discovery and real-time fetching from exam portals',
    href: '/demo/schema-engine',
    icon: <Database className="w-6 h-6" />,
    features: [
      'Real-time schema discovery',
      'Multiple source monitoring',
      'Confidence scoring',
      'Manual schema generation',
      'Live activity logs'
    ],
    complexity: 'Advanced',
    status: 'Available'
  },
  {
    title: 'Visual Web Scraper Demo',
    description: 'Advanced web scraping with visual form analysis and intelligent field detection',
    href: '/demo/web-scraper',
    icon: <Globe className="w-6 h-6" />,
    features: [
      'Visual form detection',
      'Smart field extraction',
      'Real-time analysis',
      'Content mapping',
      'Schema generation'
    ],
    complexity: 'Advanced',
    status: 'Available'
  },
  {
    title: 'Exam Schema Addition Flow',
    description: 'Interactive demo for adding new exam schemas with field detection and document requirements',
    href: '/demo/exam-schema-addition',
    icon: <Plus className="w-6 h-6" />,
    features: [
      'URL analysis & field detection',
      'Document requirements setup',
      'Schema validation',
      'Step-by-step workflow',
      'Real-time preview'
    ],
    complexity: 'Intermediate',
    status: 'Available'
  },
  {
    title: 'Phase 1: Image Analysis',
    description: 'Teaching the system to "see" images with intelligent analysis capabilities',
    href: '/demo/phase1',
    icon: <Eye className="w-6 h-6" />,
    features: [
      'Image quality assessment',
      'Document type detection',
      'Visual analysis',
      'Quality feedback',
      'Batch processing'
    ],
    complexity: 'Beginner',
    status: 'Available'
  },
  {
    title: 'AI Document Verification',
    description: 'Advanced AI-powered document type verification and validation',
    href: '/demo/ai-verification',
    icon: <Brain className="w-6 h-6" />,
    features: [
      'Document type detection',
      'AI confidence scoring',
      'Verification feedback',
      'Multiple format support',
      'Real-time analysis'
    ],
    complexity: 'Intermediate',
    status: 'Available'
  }
];

const upcomingDemos: DemoCard[] = [
  {
    title: 'Autonomous Engine',
    description: 'Complete autonomous system with adaptive learning and predictive analytics',
    href: '/demo/autonomous-engine',
    icon: <Activity className="w-6 h-6" />,
    features: [
      'Adaptive learning system',
      'Predictive validation',
      'Automated workflows',
      'Performance monitoring',
      'Smart alerting'
    ],
    complexity: 'Advanced',
    status: 'Coming Soon'
  }
];

function DemoCard({ demo }: { demo: DemoCard }) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Available' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            {demo.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{demo.title}</h3>
            <div className="flex gap-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(demo.complexity)}`}>
                {demo.complexity}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(demo.status)}`}>
                {demo.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{demo.description}</p>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
        <ul className="space-y-1">
          {demo.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      {demo.status === 'Available' ? (
        <Link
          href={demo.href}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Try Demo
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
        >
          Coming Soon
          <Settings className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function DemoIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dockit Demo Center</h1>
              <p className="text-gray-600">Interactive demonstrations of autonomous document intelligence</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Available Demos */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Available Demos</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {demos.length} Ready
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demos.map((demo, index) => (
              <DemoCard key={index} demo={demo} />
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              {upcomingDemos.length} In Development
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingDemos.map((demo, index) => (
              <DemoCard key={index} demo={demo} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-sm border">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700">
              Powered by Dockit's Autonomous Intelligence Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}