import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBalanceSheets } from "@/lib/api/financial"
import { useIncomeStatements } from "@/lib/api/financial"
import { useStockQuote } from "@/lib/api/stock"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface ValuationMetricsProps {
  symbol: string
}

export function ValuationMetrics({ symbol }: ValuationMetricsProps) {
  const { statements: balanceSheets, loading: balanceSheetsLoading } = useBalanceSheets(symbol)
  const { statements: incomeStatements, loading: incomeStatementsLoading } = useIncomeStatements(symbol)
  const { quote, loading: quoteLoading } = useStockQuote(symbol)

  const loading = balanceSheetsLoading || incomeStatementsLoading || quoteLoading

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Valuation Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const latestBalanceSheet = balanceSheets?.[0]
  const latestIncomeStatement = incomeStatements?.[0]
  const currentPrice = quote?.price || 0
  const sharesOutstanding = quote?.sharesOutstanding || 0

  const marketCap = currentPrice * sharesOutstanding
  const enterpriseValue = marketCap + (latestBalanceSheet?.totalDebt || 0) - (latestBalanceSheet?.cashAndCashEquivalents || 0)
  const peRatio = currentPrice / (latestIncomeStatement?.netIncome || 0)
  const evEbitda = enterpriseValue / (latestIncomeStatement?.ebitda || 0)
  const pbRatio = currentPrice / (latestBalanceSheet?.totalAssets || 0)
  const psRatio = currentPrice / (latestIncomeStatement?.revenue || 0)

  const metrics = [
    { label: "Market Cap", value: formatCurrency(marketCap) },
    { label: "Enterprise Value", value: formatCurrency(enterpriseValue) },
    { label: "P/E Ratio", value: formatNumber(peRatio) },
    { label: "EV/EBITDA", value: formatNumber(evEbitda) },
    { label: "P/B Ratio", value: formatNumber(pbRatio) },
    { label: "P/S Ratio", value: formatNumber(psRatio) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valuation Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-bold">{metric.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 