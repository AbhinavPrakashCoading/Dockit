// Performance Monitor for Dashboard Loading
'use client';

import { useEffect } from 'react';

interface PerformanceMonitorProps {
  componentName: string;
  onLoadTime?: (time: number) => void;
}

export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      }
      
      // Report slow components
      if (loadTime > 100) {
        console.warn(`⚠️ Slow component: ${componentName} took ${loadTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  componentName, 
  onLoadTime 
}) => {
  usePerformanceMonitor(componentName);
  
  if (onLoadTime) {
    useEffect(() => {
      const loadTime = performance.now();
      onLoadTime(loadTime);
    }, [onLoadTime]);
  }
  
  return null;
};