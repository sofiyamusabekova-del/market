'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '@/types';

interface StoreContextType {
  favorites: string[]; // array of product slugs or IDs
  compareList: string[]; // array of product slugs or IDs (up to 4)
  toggleFavorite: (idOrSlug: string) => void;
  isFavorite: (idOrSlug: string) => boolean;
  toggleCompare: (idOrSlug: string) => void;
  isInCompare: (idOrSlug: string) => boolean;
  clearCompare: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const FAVORITES_KEY = 'voltstore_favorites';
const COMPARE_KEY = 'voltstore_compare';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem(FAVORITES_KEY);
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedCompare = localStorage.getItem(COMPARE_KEY);
      if (savedCompare) setCompareList(JSON.parse(savedCompare));
    } catch {
      // Ignore localStorage read errors
    }
    setMounted(true);
  }, []);

  const toggleFavorite = (idOrSlug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(idOrSlug)
        ? prev.filter((id) => id !== idOrSlug)
        : [...prev, idOrSlug];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isFavorite = (idOrSlug: string) => {
    return favorites.includes(idOrSlug);
  };

  const toggleCompare = (idOrSlug: string) => {
    setCompareList((prev) => {
      let next: string[];
      if (prev.includes(idOrSlug)) {
        next = prev.filter((id) => id !== idOrSlug);
      } else {
        // Max 4 items in comparison
        next = prev.length >= 4 ? [...prev.slice(1), idOrSlug] : [...prev, idOrSlug];
      }
      try {
        localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isInCompare = (idOrSlug: string) => {
    return compareList.includes(idOrSlug);
  };

  const clearCompare = () => {
    setCompareList([]);
    try {
      localStorage.removeItem(COMPARE_KEY);
    } catch {}
  };

  return (
    <StoreContext.Provider
      value={{
        favorites: mounted ? favorites : [],
        compareList: mounted ? compareList : [],
        toggleFavorite,
        isFavorite,
        toggleCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
