import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBalanceSheets } from "@/lib/api/financial"
import { useIncomeStatements } from "@/lib/api/financial"
import { useStockQuote } from "@/lib/api/stock"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { financialMonitor } from "@/lib/utils/financial-calculation-validator"
import { useEffect } from "react"

interface ValuationMetricsProps {
  symbol: string
}

export function ValuationMetrics({ symbol }: ValuationMetricsProps) {
  const { statements: balanceSheets, isLoading: balanceSheetsLoading } = useBalanceSheets(symbol)
  const { statements: incomeStatements, isLoading: incomeStatementsLoading } = useIncomeStatements(symbol)
  const { quote, loading: quoteLoading } = useStockQuote(symbol)

  if (!symbol || balanceSheetsLoading || incomeStatementsLoading || quoteLoading) {
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

  if (!balanceSheets?.length || !incomeStatements?.length || !quote) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Valuation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to fetch valuation metrics for this company.
          </p>
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
  
  // Calculate P/E ratio correctly: Price per share / Earnings per share
  const eps = sharesOutstanding > 0 ? (latestIncomeStatement?.netIncome || 0) / sharesOutstanding : 0
  const peRatio = eps > 0 ? currentPrice / eps : null
  
  const evEbitda = (latestIncomeStatement?.ebitda || 0) > 0 ? enterpriseValue / (latestIncomeStatement?.ebitda || 0) : null
  
  // P/B ratio should use book value per share, not total assets
  const bookValue = latestBalanceSheet?.totalEquity || 0
  const bookValuePerShare = sharesOutstanding > 0 ? bookValue / sharesOutstanding : 0
  const pbRatio = bookValuePerShare > 0 ? currentPrice / bookValuePerShare : null
  
  // P/S ratio should use revenue per share
  const revenuePerShare = sharesOutstanding > 0 ? (latestIncomeStatement?.revenue || 0) / sharesOutstanding : 0
  const psRatio = revenuePerShare > 0 ? currentPrice / revenuePerShare : null

  // Validate financial calculations
  useEffect(() => {
    if (latestBalanceSheet && latestIncomeStatement && quote) {
      const validationData = {
        price: currentPrice,
        earnings: latestIncomeStatement.netIncome || 0,
        sharesOutstanding,
        marketCap,
        totalDebt: latestBalanceSheet.totalDebt || 0,
        cashAndEquivalents: latestBalanceSheet.cashAndCashEquivalents || 0,
        ratios: {
          peRatio,
          pbRatio,
          psRatio,
          currentRatio: latestBalanceSheet.currentAssets && latestBalanceSheet.currentLiabilities 
            ? latestBalanceSheet.currentAssets / latestBalanceSheet.currentLiabilities 
            : undefined,
          debtToEquity: latestBalanceSheet.totalEquity 
            ? (latestBalanceSheet.totalDebt || 0) / latestBalanceSheet.totalEquity 
            : undefined,
          roe: latestIncomeStatement.netIncome && latestBalanceSheet.totalEquity
            ? (latestIncomeStatement.netIncome / latestBalanceSheet.totalEquity) * 100
            : undefined,
          grossMargin: latestIncomeStatement.revenue && latestIncomeStatement.grossProfit
            ? (latestIncomeStatement.grossProfit / latestIncomeStatement.revenue) * 100
            : undefined,
          operatingMargin: latestIncomeStatement.revenue && latestIncomeStatement.operatingIncome
            ? (latestIncomeStatement.operatingIncome / latestIncomeStatement.revenue) * 100
            : undefined,
          netMargin: latestIncomeStatement.revenue && latestIncomeStatement.netIncome
            ? (latestIncomeStatement.netIncome / latestIncomeStatement.revenue) * 100
            : undefined
        },
        balanceSheet: {
          totalAssets: latestBalanceSheet.totalAssets || 0,
          totalLiabilities: latestBalanceSheet.totalLiabilities || 0,
          totalEquity: latestBalanceSheet.totalEquity || 0,
          currentAssets: latestBalanceSheet.currentAssets || 0,
          currentLiabilities: latestBalanceSheet.currentLiabilities || 0
        }
      };

      financialMonitor.validateAndLog(validationData, `ValuationMetrics-${symbol}`);
    }
  }, [latestBalanceSheet, latestIncomeStatement, quote, symbol, currentPrice, sharesOutstanding, marketCap, peRatio, pbRatio, psRatio]);

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