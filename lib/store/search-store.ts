import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchHistory {
  symbol: string;
  name: string;
  timestamp: number;
}

interface FavoriteStock {
  symbol: string;
  name: string;
  addedAt: number;
}

interface SearchState {
  recentSearches: SearchHistory[];
  favorites: FavoriteStock[];
  currentSymbol: string | null;
  addToRecent: (symbol: string, name: string) => void;
  toggleFavorite: (symbol: string, name: string) => void;
  isFavorite: (symbol: string) => boolean;
  setCurrentSymbol: (symbol: string | null) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      favorites: [],
      currentSymbol: null,
      addToRecent: (symbol, name) =>
        set((state) => ({
          recentSearches: [
            { symbol, name, timestamp: Date.now() },
            ...state.recentSearches.filter((s) => s.symbol !== symbol),
          ].slice(0, 10),
        })),
      toggleFavorite: (symbol, name) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.symbol === symbol)
            ? state.favorites.filter((f) => f.symbol !== symbol)
            : [...state.favorites, { symbol, name, addedAt: Date.now() }],
        })),
      isFavorite: (symbol) =>
        get().favorites.some((f) => f.symbol === symbol),
      setCurrentSymbol: (symbol) =>
        set({ currentSymbol: symbol }),
      clearHistory: () =>
        set({ recentSearches: [] }),
    }),
    {
      name: 'search-store',
    }
  )
);