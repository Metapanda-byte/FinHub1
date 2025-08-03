"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Prevent aggressive revalidation that causes infinite loops
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        
        // Longer cache times for financial data
        dedupingInterval: 60000, // 1 minute
        refreshInterval: 0, // Disable auto refresh
        
        // Error handling
        shouldRetryOnError: false,
        errorRetryCount: 1,
        
        // Focus handling
        focusThrottleInterval: 5000,
        
        // More conservative fetching
        fetcher: (url: string) => fetch(url).then(res => res.json())
      }}
    >
      {children}
    </SWRConfig>
  );
}