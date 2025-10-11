// Review Modal Component
'use client';

import React from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Placeholder - will be implemented when migrating
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Review Documents</h2>
        {/* Review modal content will be migrated here */}
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;