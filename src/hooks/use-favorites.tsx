
'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type AnimeId = string; // Assuming slug is used as ID

interface FavoritesContextType {
  favoriteIds: AnimeId[];
  addFavorite: (id: AnimeId) => void;
  removeFavorite: (id: AnimeId) => void;
  isFavorite: (id: AnimeId) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'favoriteAnimes';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<AnimeId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedFavorites) {
        setFavoriteIds(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage:", error);
      // Initialize with empty array if localStorage is not available or fails
      setFavoriteIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) { // Only save to localStorage after initial load
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favoriteIds));
      } catch (error) {
        console.error("Failed to save favorites to localStorage:", error);
      }
    }
  }, [favoriteIds, isLoading]);

  const addFavorite = useCallback((id: AnimeId) => {
    setFavoriteIds((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  const removeFavorite = useCallback((id: AnimeId) => {
    setFavoriteIds((prev) => prev.filter((favId) => favId !== id));
  }, []);

  const isFavorite = useCallback((id: AnimeId) => {
    return favoriteIds.includes(id);
  }, [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, addFavorite, removeFavorite, isFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
