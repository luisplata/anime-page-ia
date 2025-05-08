
'use client';

import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoader = useCallback(() => {
    setLoadingCount((count) => {
      const newCount = count + 1;
      // console.log("LoadingContext: showLoader called, new count:", newCount);
      return newCount;
    });
  }, []);

  const hideLoader = useCallback(() => {
    setLoadingCount((count) => {
      const newCount = Math.max(0, count - 1);
      // console.log("LoadingContext: hideLoader called, new count:", newCount);
      return newCount;
    });
  }, []);

  const isLoading = loadingCount > 0;

  useEffect(() => {
    // console.log("LoadingContext: isLoading state changed to:", isLoading);
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
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

