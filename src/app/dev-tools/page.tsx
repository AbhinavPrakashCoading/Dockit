'use client';

import { DevToolsNav } from '@/components/DevToolsNav';

export default function DevToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DevToolsNav />
      
      {/* Quick Access Banner */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">🚀 New: Schema Extraction Engine</h2>
          <p className="mb-4 opacity-90">
            Autonomous exam schema generation is now available! Enter any exam name and get structured JSON schemas automatically.
          </p>
          <a 
            href="/dev-tools/schema-extraction"
            className="inline-flex items-center bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            Try Schema Extraction →
          </a>
        </div>
      </div>
    </div>
  );
}