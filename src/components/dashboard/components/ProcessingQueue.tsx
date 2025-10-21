// Processing Queue Component
'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { ProcessingJob } from '../types';

interface ProcessingQueueProps {
  processingJobs?: ProcessingJob[];
}

const ProcessingQueue: React.FC<ProcessingQueueProps> = ({ processingJobs = [] }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Processing Queue</h3>
        <Activity className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {processingJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active processing jobs</p>
          </div>
        ) : (
          processingJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{job.documentName}</span>
                <span className="text-xs text-gray-500">{job.estimatedTime} remaining</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 capitalize">{job.stage} stage</span>
                <span className="text-xs font-medium text-gray-900">{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProcessingQueue;