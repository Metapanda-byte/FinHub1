import { create } from 'zustand';

type ViewMode = 'summary' | 'detailed';
type Period = 'annual' | 'quarterly';

interface FinancialPeriodState {
  viewMode: ViewMode;
  period: Period;
  setViewMode: (mode: ViewMode) => void;
  setPeriod: (period: Period) => void;
}

export const useFinancialPeriodStore = create<FinancialPeriodState>((set) => ({
  viewMode: 'summary',
  period: 'annual',
  setViewMode: (mode) => set({ viewMode: mode }),
  setPeriod: (period) => set({ period }),
}));