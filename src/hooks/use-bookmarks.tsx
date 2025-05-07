
'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFavorites } from './use-favorites'; // To add to favorites when bookmarking

type AnimeId = string;
type EpisodeNumber = number;

interface Bookmarks {
  [animeId: AnimeId]: EpisodeNumber;
}

interface BookmarksContextType {
  bookmarks: Bookmarks;
  setBookmark: (animeId: AnimeId, episodeNumber: EpisodeNumber) => void;
  removeBookmark: (animeId: AnimeId) => void;
  getBookmarkForAnime: (animeId: AnimeId) => EpisodeNumber | null;
  isEpisodeBookmarked: (animeId: AnimeId, episodeNumber: EpisodeNumber) => boolean;
  isLoading: boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bookmarkedEpisodes';

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmarks>({});
  const [isLoading, setIsLoading] = useState(true);
  const { addFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (error) {
      console.error("Failed to load bookmarks from localStorage:", error);
      setBookmarks({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks to localStorage:", error);
      }
    }
  }, [bookmarks, isLoading]);

  const setBookmark = useCallback((animeId: AnimeId, episodeNumber: EpisodeNumber) => {
    setBookmarks((prev) => ({
      ...prev,
      [animeId]: episodeNumber,
    }));
    // If not already a favorite, add it
    if (!isFavorite(animeId)) {
      addFavorite(animeId);
    }
  }, [addFavorite, isFavorite]);

  const removeBookmark = useCallback((animeId: AnimeId) => {
    setBookmarks((prev) => {
      const newBookmarks = { ...prev };
      delete newBookmarks[animeId];
      return newBookmarks;
    });
  }, []);

  const getBookmarkForAnime = useCallback((animeId: AnimeId): EpisodeNumber | null => {
    return bookmarks[animeId] || null;
  }, [bookmarks]);

  const isEpisodeBookmarked = useCallback((animeId: AnimeId, episodeNumber: EpisodeNumber): boolean => {
    return bookmarks[animeId] === episodeNumber;
  }, [bookmarks]);

  return (
    <BookmarksContext.Provider value={{ bookmarks, setBookmark, removeBookmark, getBookmarkForAnime, isEpisodeBookmarked, isLoading }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}
