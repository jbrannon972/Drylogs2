import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

interface UploadQueueContextType {
  queue: UploadItem[];
  addToQueue: (files: File[]) => string[];
  updateProgress: (id: string, progress: number) => void;
  markSuccess: (id: string, url: string) => void;
  markError: (id: string, error: string) => void;
  removeFromQueue: (id: string) => void;
  clearCompleted: () => void;
}

const UploadQueueContext = createContext<UploadQueueContextType | undefined>(undefined);

export const UploadQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<UploadItem[]>([]);

  const addToQueue = useCallback((files: File[]): string[] => {
    const newItems: UploadItem[] = files.map(file => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      progress: 0,
    }));

    setQueue(prev => [...prev, ...newItems]);
    return newItems.map(item => item.id);
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setQueue(prev => prev.map(item =>
      item.id === id ? { ...item, progress, status: 'uploading' as const } : item
    ));
  }, []);

  const markSuccess = useCallback((id: string, url: string) => {
    setQueue(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'success' as const, progress: 100, url } : item
    ));
  }, []);

  const markError = useCallback((id: string, error: string) => {
    setQueue(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'error' as const, error } : item
    ));
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(item => item.status !== 'success'));
  }, []);

  return (
    <UploadQueueContext.Provider
      value={{
        queue,
        addToQueue,
        updateProgress,
        markSuccess,
        markError,
        removeFromQueue,
        clearCompleted,
      }}
    >
      {children}
    </UploadQueueContext.Provider>
  );
};

export const useUploadQueue = () => {
  const context = useContext(UploadQueueContext);
  if (!context) {
    throw new Error('useUploadQueue must be used within UploadQueueProvider');
  }
  return context;
};
