/**
 * Development Tools Navigation
 * Quick access to schema discovery and debugging tools
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bug, FileText, Zap, ArrowRight, Settings, Database } from 'lucide-react';

export const DevToolsNav: React.FC = () => {
  const tools = [
    {
      id: 'schema-extraction',
      name: 'Schema Extraction Engine',
      description: 'Autonomous exam schema generation from exam names',
      href: '/dev-tools/schema-extraction',
      icon: Zap,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
      features: ['Auto web scraping', 'PDF content extraction', 'Pattern recognition', 'JSON schema builder']
    },
    {
      id: 'schema-management',
      name: 'Enhanced Schema Manager',
      description: 'Comprehensive schema CRUD operations and enhancements',
      href: '/schema-management',
      icon: Database,
      color: 'bg-indigo-100 text-indigo-600',
      features: ['Full CRUD operations', 'Schema enhancement', 'File system integration', 'Analytics dashboard']
    },
    {
      id: 'schema-discovery',
      name: 'Schema Auto-Discovery',
      description: 'Discover and compare exam requirements from official sources',
      href: '/schema-discovery',
      icon: Search,
      color: 'bg-purple-100 text-purple-600',
      features: ['Web scraping', 'Schema comparison', 'Auto-improvement suggestions']
    },
    {
      id: 'schema-debug',
      name: 'Schema Debug Tool',
      description: 'Test schema loading functionality and diagnose issues',
      href: '/schema-debug',
      icon: Bug,
      color: 'bg-blue-100 text-blue-600',
      features: ['Load testing', 'Error diagnosis', 'Performance metrics']
    },
    {
      id: 'dashboard',
      name: 'Main Dashboard',
      description: 'Test the improved upload modal with schema loading',
      href: '/',
      icon: FileText,
      color: 'bg-green-100 text-green-600',
      features: ['Schema-aware uploads', 'Real exam requirements', 'Debug info']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-gray-700" size={32} />
          <h1 className="text-3xl font-bold">Development Tools</h1>
        </div>
        <p className="text-gray-600">
          Tools for testing and improving the exam schema system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => {
          const IconComponent = tool.icon;
          return (
            <Link key={tool.id} href={tool.href}>
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 hover:border-gray-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${tool.color.includes('gradient') ? tool.color : `${tool.color}`} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <IconComponent size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
                    <p className="text-gray-600 text-sm">{tool.description}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {tool.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <Zap size={12} className="text-yellow-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Click to open</span>
                  <ArrowRight size={16} className="text-gray-400" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600">⚠️</span>
          </div>
          <h3 className="font-semibold text-yellow-800">Important Notes</h3>
        </div>
        <div className="text-yellow-700 text-sm space-y-2">
          <div>• These tools are for development and testing purposes</div>
          <div>• Schema discovery uses simulated data for demo purposes</div>
          <div>• Debug information is only shown in development mode</div>
          <div>• Use these tools to verify schema loading is working correctly</div>
        </div>
      </div>
    </div>
  );
};