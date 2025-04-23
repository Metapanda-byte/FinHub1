import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface StockQuote {
  price: number
  sharesOutstanding: number
  marketCap: number
  volume: number
  avgVolume: number
  dayHigh: number
  dayLow: number
  yearHigh: number
  yearLow: number
  eps: number
  pe: number
  change: number
  changesPercentage: number
}

export function useStockQuote(symbol: string) {
  const { data, error, isLoading } = useSWR<StockQuote>(
    symbol ? `/api/stock/${symbol}/quote` : null,
    fetcher
  )

  return {
    quote: data,
    loading: isLoading,
    error,
  }
} 