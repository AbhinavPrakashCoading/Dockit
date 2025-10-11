import React from 'react';
import { Clock } from 'lucide-react';

const ClockTest = () => {
  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2>Clock Icon Test</h2>
      
      {/* Test 1: Simple Clock */}
      <div style={{ margin: '10px 0' }}>
        <p>Simple Clock:</p>
        <Clock className="w-8 h-8 text-yellow-600" />
      </div>
      
      {/* Test 2: Clock in Circle (like Analytics) */}
      <div style={{ margin: '10px 0' }}>
        <p>Clock in Yellow Circle:</p>
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100">
          <Clock className="w-5 h-5 text-yellow-600" />
        </div>
      </div>
      
      {/* Test 3: Inline SVG Clock */}
      <div style={{ margin: '10px 0' }}>
        <p>Inline SVG Clock:</p>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      </div>
    </div>
  );
};

export default ClockTest;