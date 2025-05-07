
'use client';

import type React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoader = useCallback(() => {
    setLoadingCount((count) => count + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setLoadingCount((count) => Math.max(0, count - 1));
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading: loadingCount > 0, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
