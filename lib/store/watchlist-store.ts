import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistStock {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  addedAt: string;
}

interface WatchlistStore {
  stocks: WatchlistStock[];
  addStock: (stock: Omit<WatchlistStock, 'addedAt'>) => void;
  removeStock: (symbol: string) => void;
  hasStock: (symbol: string) => boolean;
  updateStock: (symbol: string, data: Partial<WatchlistStock>) => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      stocks: [],
      addStock: (stock) => {
        if (!get().hasStock(stock.symbol)) {
          set((state) => ({
            stocks: [...state.stocks, { ...stock, addedAt: new Date().toISOString() }]
          }));
        }
      },
      removeStock: (symbol) => {
        set((state) => ({
          stocks: state.stocks.filter((stock) => stock.symbol !== symbol)
        }));
      },
      hasStock: (symbol) => {
        return get().stocks.some((stock) => stock.symbol === symbol);
      },
      updateStock: (symbol, data) => {
        set((state) => ({
          stocks: state.stocks.map((stock) =>
            stock.symbol === symbol ? { ...stock, ...data } : stock
          )
        }));
      }
    }),
    {
      name: 'watchlist-storage'
    }
  )
); 