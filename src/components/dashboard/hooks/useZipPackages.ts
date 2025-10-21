// Custom hook for ZIP packages management
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';

export interface ZipPackage {
  id: string;
  filename: string;
  fileSize: number;
  examType: string;
  rollNumber: string | null;
  generatedAt: string;
  downloadCount: number;
  storageType: 'cloud' | 'local';
}

export interface ZipPackagesResponse {
  success: boolean;
  zips: ZipPackage[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const useZipPackages = () => {
  const { data: session } = useSession();
  const [zipPackages, setZipPackages] = useState<ZipPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  // Fetch ZIP packages from API
  const fetchZipPackages = useCallback(async (examType?: string, limit = 20, offset = 0) => {
    if (!session?.user) {
      console.log('👤 No session found, skipping ZIP packages fetch');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (examType && examType !== 'all') {
        params.append('examType', examType);
      }
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/storage/zips?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ZIP packages: ${response.status}`);
      }

      const data: ZipPackagesResponse = await response.json();
      
      if (data.success) {
        setZipPackages(data.zips);
        console.log('📦 Fetched ZIP packages:', data.zips.length);
      } else {
        throw new Error('Failed to fetch ZIP packages');
      }
    } catch (error) {
      console.error('📦 Error fetching ZIP packages:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch ZIP packages');
      setZipPackages([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  // Filter ZIP packages based on search and exam type
  const filteredZipPackages = useMemo(() => {
    let filtered = zipPackages;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pkg => 
        pkg.filename.toLowerCase().includes(query) ||
        pkg.examType.toLowerCase().includes(query) ||
        (pkg.rollNumber && pkg.rollNumber.toLowerCase().includes(query))
      );
    }

    // Apply exam type filter
    if (selectedExamType !== 'all') {
      filtered = filtered.filter(pkg => pkg.examType === selectedExamType);
    }

    return filtered;
  }, [zipPackages, searchQuery, selectedExamType]);

  // Create a new ZIP package
  const createZipPackage = useCallback(async (
    documentIds: string[],
    examType: string,
    rollNumber?: string
  ) => {
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/storage/zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds,
          examType,
          rollNumber,
          usesMasters: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create ZIP package: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ ZIP package created:', result);

      // Refresh the list after creation
      await fetchZipPackages(selectedExamType);
      
      return result;
    } catch (error) {
      console.error('📦 Error creating ZIP package:', error);
      setError(error instanceof Error ? error.message : 'Failed to create ZIP package');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session?.user, selectedExamType, fetchZipPackages]);

  // Download a ZIP package
  const downloadZipPackage = useCallback(async (zipId: string) => {
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`/api/storage/zip/${zipId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to download ZIP package: ${response.status}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'download.zip';

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('📥 ZIP package downloaded:', filename);
    } catch (error) {
      console.error('📦 Error downloading ZIP package:', error);
      throw error;
    }
  }, [session?.user]);

  // Get unique exam types from packages
  const examTypes = useMemo(() => {
    const types = [...new Set(zipPackages.map(pkg => pkg.examType))];
    return ['all', ...types];
  }, [zipPackages]);

  // Initial fetch on mount
  useEffect(() => {
    if (session?.user) {
      fetchZipPackages();
    }
  }, [session?.user, fetchZipPackages]);

  return {
    zipPackages: filteredZipPackages,
    allZipPackages: zipPackages,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedExamType,
    setSelectedExamType,
    examTypes,
    fetchZipPackages,
    createZipPackage,
    downloadZipPackage,
    refetch: () => fetchZipPackages(selectedExamType)
  };
};