"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Info, X } from "lucide-react";
import { peerCompanies, peerValuationData, peerPerformanceData } from "@/lib/mockData";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function CompetitorAnalysis() {
  const [selectedPeers, setSelectedPeers] = useState(["AAPL", "MSFT", "GOOGL"]);
  const filteredValuationData = peerValuationData.filter(company => 
    selectedPeers.includes(company.ticker)
  );
  const filteredPerformanceData = peerPerformanceData.filter(company => 
    selectedPeers.includes(company.ticker)
  );

  const togglePeer = (peerId: string) => {
    if (selectedPeers.includes(peerId)) {
      // Only remove if we have more than one peer selected
      if (selectedPeers.length > 1) {
        setSelectedPeers(selectedPeers.filter(id => id !== peerId));
      }
    } else {
      setSelectedPeers([...selectedPeers, peerId]);
    }
  };

  const renderMetricTooltip = (title: string, description: string) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 inline-block ml-1 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium">{title}</p>
            <p className="text-sm">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-4">
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Peer Comparison</CardTitle>
              <CardDescription>Compare key metrics with industry peers</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {peerCompanies.map((company) => (
                <Badge
                  key={company.id}
                  variant={selectedPeers.includes(company.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1 transition-all",
                    selectedPeers.includes(company.id) ? "hover:bg-primary/80" : "hover:bg-secondary"
                  )}
                  onClick={() => togglePeer(company.id)}
                >
                  {company.id}
                  {selectedPeers.includes(company.id) && (
                    <X className="ml-1 h-3 w-3 inline-block" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="valuation" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="valuation">Valuation</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <TabsContent value="valuation" className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Company</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        Market Cap
                        {renderMetricTooltip("Market Capitalization", "The total value of all outstanding shares of a company.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        EV/EBITDA
                        {renderMetricTooltip("Enterprise Value to EBITDA", "Measures the value of a company compared to its earnings before interest, taxes, depreciation, and amortization.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        P/E Ratio
                        {renderMetricTooltip("Price to Earnings Ratio", "Measures a company's current share price relative to its earnings per share.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        P/S Ratio
                        {renderMetricTooltip("Price to Sales Ratio", "Compares a company's stock price to its revenues.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        P/B Ratio
                        {renderMetricTooltip("Price to Book Ratio", "Compares a company's market value to its book value.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        Div. Yield
                        {renderMetricTooltip("Dividend Yield", "The annual dividend payment divided by the stock price, expressed as a percentage.")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredValuationData.map((company) => (
                      <tr key={company.ticker} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium">{company.company} ({company.ticker})</td>
                        <td className="text-right py-3 px-4 text-sm">{formatCurrency(company.marketCap)}B</td>
                        <td className="text-right py-3 px-4 text-sm">{company.evToEbitda.toFixed(1)}x</td>
                        <td className="text-right py-3 px-4 text-sm">{company.peRatio.toFixed(1)}x</td>
                        <td className="text-right py-3 px-4 text-sm">{company.priceToSales.toFixed(1)}x</td>
                        <td className="text-right py-3 px-4 text-sm">{company.priceToBook.toFixed(1)}x</td>
                        <td className="text-right py-3 px-4 text-sm">{formatPercentage(company.dividendYield)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Company</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        Rev. Growth
                        {renderMetricTooltip("Revenue Growth", "Year-over-year percentage change in revenue.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        Gross Margin
                        {renderMetricTooltip("Gross Margin", "Gross profit divided by revenue, expressed as a percentage.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        Op. Margin
                        {renderMetricTooltip("Operating Margin", "Operating income divided by revenue, expressed as a percentage.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        Net Margin
                        {renderMetricTooltip("Net Margin", "Net income divided by revenue, expressed as a percentage.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        ROIC
                        {renderMetricTooltip("Return on Invested Capital", "Measures how efficiently a company uses capital to generate profits.")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        ROE
                        {renderMetricTooltip("Return on Equity", "Net income divided by shareholders' equity, expressed as a percentage.")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPerformanceData.map((company) => (
                      <tr key={company.ticker} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium">{company.company} ({company.ticker})</td>
                        <td className={cn(
                          "text-right py-3 px-4 text-sm",
                          company.revenueGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                          {formatPercentage(company.revenueGrowth)}
                        </td>
                        <td className="text-right py-3 px-4 text-sm">{formatPercentage(company.grossMargin)}</td>
                        <td className="text-right py-3 px-4 text-sm">{formatPercentage(company.operatingMargin)}</td>
                        <td className="text-right py-3 px-4 text-sm">{formatPercentage(company.netMargin)}</td>
                        <td className="text-right py-3 px-4 text-sm">{formatPercentage(company.roic)}</td>
                        <td className="text-right py-3 px-4 text-sm">{formatPercentage(company.roe)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Metrics Calculator</CardTitle>
          <CardDescription>Automatically calculate derived financial metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">
                  Enterprise Value (EV)
                  {renderMetricTooltip("Enterprise Value", "Market Cap + Total Debt - Cash & Equivalents")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$3.02T</p>
                <p className="text-xs text-muted-foreground mt-1">Market Cap + Total Debt - Cash</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">
                  EBITDA Margin
                  {renderMetricTooltip("EBITDA Margin", "EBITDA / Revenue, expressed as a percentage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">33.0%</p>
                <p className="text-xs text-muted-foreground mt-1">EBITDA / Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">
                  Free Cash Flow
                  {renderMetricTooltip("Free Cash Flow", "Operating Cash Flow - Capital Expenditures")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$102.5B</p>
                <p className="text-xs text-muted-foreground mt-1">Operating Cash Flow - CapEx</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">
                  FCF Yield
                  {renderMetricTooltip("Free Cash Flow Yield", "Free Cash Flow / Market Cap, expressed as a percentage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">3.5%</p>
                <p className="text-xs text-muted-foreground mt-1">FCF / Market Cap</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">
                  Price to FCF
                  {renderMetricTooltip("Price to Free Cash Flow", "Market Cap / Free Cash Flow")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">28.9x</p>
                <p className="text-xs text-muted-foreground mt-1">Market Cap / FCF</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">
                  Net Debt / EBITDA
                  {renderMetricTooltip("Net Debt to EBITDA", "Measures a company's ability to pay off its debt")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0.4x</p>
                <p className="text-xs text-muted-foreground mt-1">(Total Debt - Cash) / EBITDA</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}