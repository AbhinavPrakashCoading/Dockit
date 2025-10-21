// Custom hook for dashboard data management
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, ProcessingJob, Notification, DraftData, User } from '../types';

export const useDashboardData = (user: User) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [drafts, setDrafts] = useState<DraftData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!user.isAuthenticated || !user.email) {
      setLoading(false);
      return;
    }
    
    // Fast path: set loading to false immediately for better UX
    setLoading(false);
    
    // Initialize with empty data - no placeholders
    setDocuments([]);
    setProcessingJobs([]);
    setNotifications([]);
    setDrafts([]);

    // Background data loading can be added here later
    try {
      // Future: Load real user data from API
      // const userData = await fetch('/api/user/dashboard-data');
      // Process and set real data
    } catch (error) {
      console.error('Background data loading failed:', error);
    }
  }, [user.email, user.isAuthenticated]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ));
  }, []);

  return {
    documents,
    setDocuments,
    processingJobs,
    setProcessingJobs,
    notifications,
    addNotification,
    removeNotification,
    drafts,
    setDrafts,
    loading,
    updateDocument,
    refetch: loadUserData
  };
};