"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, StarOff, ExternalLink } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/charts/revenue-chart";
import { EbitdaChart } from "@/components/dashboard/charts/ebitda-chart";
import { PieChart } from "@/components/dashboard/charts/pie-chart";
import { StockChart } from "@/components/dashboard/charts/stock-chart";

// Mock data for all layouts
const mockData = {
  symbol: "AAPL",
  companyName: "Apple Inc.",
  price: 211.99,
  change: 171.08,
  changePercent: 418.19,
  marketCap: 3200000000000,
  employees: 164000,
  ceo: "Tim Cook",
  sector: "Technology",
  industry: "Consumer Electronics",
  exchange: "NASDAQ",
  peRatio: 28.5,
  evEbitda: 22.1,
  revenue: 394.3,
  ebitda: 123.4,
  margin: 31.2,
  segments: [
    { name: "iPhone", value: 205.5, percentage: 52 },
    { name: "Services", value: 94.6, percentage: 24 },
    { name: "Mac", value: 43.4, percentage: 11 },
    { name: "iPad", value: 31.5, percentage: 8 },
    { name: "Other", value: 19.7, percentage: 5 }
  ],
  geography: [
    { name: "Americas", value: 177.4, percentage: 45 },
    { name: "Europe", value: 98.6, percentage: 25 },
    { name: "China", value: 71.0, percentage: 18 },
    { name: "Japan", value: 27.6, percentage: 7 },
    { name: "Rest of Asia", value: 19.7, percentage: 5 }
  ],
  revenueData: [
    { year: "FY19", value: 260.2, isLTM: false },
    { year: "FY20", value: 274.5, isLTM: false },
    { year: "FY21", value: 365.8, isLTM: false },
    { year: "FY22", value: 394.3, isLTM: false },
    { year: "FY23", value: 383.3, isLTM: false },
    { year: "LTM", value: 394.3, isLTM: true }
  ],
  ebitdaData: [
    { year: "FY19", value: 81.8, margin: 31.4 },
    { year: "FY20", value: 86.2, margin: 31.4 },
    { year: "FY21", value: 123.1, margin: 33.7 },
    { year: "FY22", value: 130.6, margin: 33.1 },
    { year: "FY23", value: 123.7, margin: 32.3 },
    { year: "LTM", value: 123.4, margin: 31.2 }
  ]
};

const layouts = [
  { id: "executive", name: "Executive Summary" },
  { id: "grid", name: "Grid Analytics" },
  { id: "cards", name: "Modern Cards" },
  { id: "bloomberg", name: "Bloomberg Style" },
  { id: "minimal", name: "Minimalist" },
  { id: "sidebar", name: "Side Panel" }
];

export default function DashboardLayoutsPage() {
  const [selectedLayout, setSelectedLayout] = useState("executive");

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Layout Options</h1>
          <p className="text-muted-foreground">Preview different layout concepts for the financial dashboard</p>
        </div>

        {/* Layout Selector */}
        <div className="flex flex-wrap gap-2 mb-8 p-4 bg-muted/30 rounded-lg">
          {layouts.map((layout) => (
            <Button
              key={layout.id}
              variant={selectedLayout === layout.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLayout(layout.id)}
            >
              {layout.name}
            </Button>
          ))}
        </div>

        {/* Layout Content */}
        <div className="space-y-8">
          {selectedLayout === "executive" && (
            <ExecutiveSummaryLayout data={mockData} />
          )}
          {selectedLayout === "grid" && (
            <GridAnalyticsLayout data={mockData} />
          )}
          {selectedLayout === "cards" && (
            <ModernCardsLayout data={mockData} />
          )}
          {selectedLayout === "bloomberg" && (
            <BloombergStyleLayout data={mockData} />
          )}
          {selectedLayout === "minimal" && (
            <MinimalistLayout data={mockData} />
          )}
          {selectedLayout === "sidebar" && (
            <SidePanelLayout data={mockData} />
          )}
        </div>
      </div>
    </div>
  );
}

// Layout 1: Executive Summary
function ExecutiveSummaryLayout({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Header with watchlist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold">{data.symbol} - {data.companyName}</CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-3xl font-bold">${data.price}</span>
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-lg">+{data.change}</span>
                <span>(+{data.changePercent}%)</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Watch
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{data.symbol}</AvatarFallback>
            </Avatar>
            <div className="grid grid-cols-3 gap-8 flex-1">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="font-medium">${(data.marketCap / 1e12).toFixed(1)}T</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CEO</p>
                <p className="font-medium">{data.ceo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="font-medium">{(data.employees / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exchange</p>
                <p className="font-medium">{data.exchange}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sector</p>
                <p className="font-medium">{data.sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium">{data.industry}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance, Structure, Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Share Price Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <StockChart symbol={data.symbol} />
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Capital Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Market Cap</span>
                <span>${(data.marketCap / 1e12).toFixed(1)}T</span>
              </div>
              <div className="flex justify-between">
                <span>+ Total Debt</span>
                <span>$123B</span>
              </div>
              <div className="flex justify-between">
                <span>- Cash</span>
                <span>$67B</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Enterprise Value</span>
                <span>$3.3T</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>P/E Ratio</span>
                <span>{data.peRatio}x</span>
              </div>
              <div className="flex justify-between">
                <span>EV / EBITDA</span>
                <span>{data.evEbitda}x</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EBITDA</CardTitle>
          </CardHeader>
          <CardContent>
            <EbitdaChart data={data.ebitdaData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={data.segments} />
          </CardContent>
        </Card>
      </div>

      {/* Geography and News Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geography</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={data.geography} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Apple announces new AI features in iOS 18</h4>
                <p className="text-sm text-muted-foreground">Technology integration improves user experience</p>
              </div>
              <ExternalLink className="h-4 w-4" />
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Q3 earnings beat expectations with strong services growth</h4>
                <p className="text-sm text-muted-foreground">Revenue up 15% year-over-year</p>
              </div>
              <ExternalLink className="h-4 w-4" />
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Supply chain improvements noted in latest report</h4>
                <p className="text-sm text-muted-foreground">Manufacturing efficiency gains realized</p>
              </div>
              <ExternalLink className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Layout 2: Grid Analytics
function GridAnalyticsLayout({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{data.companyName} ({data.symbol})</CardTitle>
          <CardDescription className="text-lg">{data.sector} • {data.industry}</CardDescription>
        </CardHeader>
      </Card>

      {/* Price Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-3xl font-bold">${data.price}</div>
            <div className="text-muted-foreground">Current Price</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-3xl font-bold text-green-600">+${data.change}</div>
            <div className="text-muted-foreground">Change</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-3xl font-bold text-green-600">+{data.changePercent}%</div>
            <div className="text-muted-foreground">% Change</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart and Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Share Price Chart</CardTitle>
            <CardDescription>5Y Performance</CardDescription>
          </CardHeader>
          <CardContent>
            <StockChart symbol={data.symbol} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold">${data.revenue}B</div>
              <div className="text-sm text-muted-foreground">Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold">${data.ebitda}B</div>
              <div className="text-sm text-muted-foreground">EBITDA</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.margin}%</div>
              <div className="text-sm text-muted-foreground">Margin</div>
            </div>
            <hr />
            <div>
              <div className="text-2xl font-bold">${(data.marketCap / 1e12).toFixed(1)}T</div>
              <div className="text-sm text-muted-foreground">Market Cap</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.peRatio}x</div>
              <div className="text-sm text-muted-foreground">P/E</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.evEbitda}x</div>
              <div className="text-sm text-muted-foreground">EV/EBITDA</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Historical</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EBITDA</CardTitle>
            <CardDescription>Historical</CardDescription>
          </CardHeader>
          <CardContent>
            <EbitdaChart data={data.ebitdaData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.segments.map((segment: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{segment.name}</span>
                  <span>{segment.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Layout 3: Modern Cards
function ModernCardsLayout({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl">🍎</div>
              <div>
                <div className="text-2xl font-bold">{data.symbol}</div>
                <div className="text-muted-foreground">{data.companyName}</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Watchlist
            </Button>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{data.companyName}</span>
              <span>•</span>
              <span>{data.industry}</span>
              <span>•</span>
              <span>{data.exchange}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">${data.price}</span>
              <span className="text-lg text-green-600">+${data.change} (+{data.changePercent}%)</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {data.ceo}, CEO • {(data.employees / 1000).toFixed(0)},000 employees • Cupertino, CA
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance and Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StockChart symbol={data.symbol} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏢 Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="font-bold">${(data.marketCap / 1e12).toFixed(1)}T</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Enterprise Value</div>
                <div className="font-bold">$3.3T</div>
              </div>
            </div>
            <hr />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">P/E Ratio</div>
                <div className="font-bold">{data.peRatio}x</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">EV/EBITDA</div>
                <div className="font-bold">{data.evEbitda}x</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Profitability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Profitability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EbitdaChart data={data.ebitdaData} />
          </CardContent>
        </Card>
      </div>

      {/* Business Mix and Geographic Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏷️ Business Mix
            </CardTitle>
            <CardDescription>Revenue by Segment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <PieChart data={data.segments} />
              <div className="space-y-3">
                {data.segments.map((segment: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm">{segment.name}</span>
                    <span className="text-sm font-medium">{segment.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌍 Geographic Split
            </CardTitle>
            <CardDescription>Revenue by Region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <PieChart data={data.geography} />
              <div className="space-y-3">
                {data.geography.map((region: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm">{region.name}</span>
                    <span className="text-sm font-medium">{region.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Layout 4: Bloomberg Style
function BloombergStyleLayout({ data }: { data: any }) {
  return (
    <div className="space-y-4 bg-black text-green-400 p-6 rounded-lg font-mono">
      {/* Bloomberg Header */}
      <div className="border-b border-green-400 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold">{data.symbol} US EQUITY</div>
            <div>{data.companyName}</div>
            <div>{data.industry} • {data.sector}</div>
            <div>{data.exchange}</div>
          </div>
          <div className="text-right">
            <div className="text-red-500 font-bold">LIVE</div>
            <div>Last: {data.price}</div>
            <div>Chg: +{data.change}</div>
            <div>%Chg: +{data.changePercent}</div>
          </div>
        </div>
      </div>

      {/* Quote Data */}
      <div className="grid grid-cols-4 gap-4 border-b border-green-400 pb-4">
        <div>
          <div className="text-sm font-bold mb-2">QUOTE</div>
          <div>Bid: {(data.price - 0.5).toFixed(2)}</div>
          <div>Ask: {(data.price + 0.5).toFixed(2)}</div>
          <div>Vol: 45.2M</div>
          <div>Avg: 48.1M</div>
        </div>
        <div>
          <div className="text-sm font-bold mb-2">VALUATION</div>
          <div>P/E: {data.peRatio}x</div>
          <div>P/B: 45.2</div>
          <div>EV/EBITDA:</div>
          <div>{data.evEbitda}x</div>
        </div>
        <div>
          <div className="text-sm font-bold mb-2">FINANCIAL</div>
          <div>Rev: ${data.revenue}B</div>
          <div>EBITDA: {data.ebitda}B</div>
          <div>Margin: {data.margin}%</div>
          <div>ROE: 147%</div>
        </div>
        <div>
          <div className="text-sm font-bold mb-2">COMPANY</div>
          <div>CEO: {data.ceo.split(' ')[1]}</div>
          <div>Emp: {(data.employees / 1000).toFixed(0)}K</div>
          <div>Mkt: ${(data.marketCap / 1e12).toFixed(1)}T</div>
          <div>Sec: {data.sector.slice(0, 4)}</div>
        </div>
      </div>

      {/* Price Chart */}
      <div>
        <div className="text-center text-lg font-bold mb-4">PRICE CHART</div>
        <div className="bg-gray-900 p-4 rounded">
          <StockChart symbol={data.symbol} />
        </div>
      </div>

      {/* Bottom Data */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm font-bold mb-2">FUNDAMENTALS</div>
          <div className="space-y-1">
            <div>Revenue Trend</div>
            {data.revenueData.slice(-5).map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span>{'█'.repeat(Math.max(1, Math.floor(item.value / 50)))} {item.year}</span>
              </div>
            ))}
            <div className="mt-2">EBITDA & Margin</div>
            {data.ebitdaData.slice(-3).map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span>{'█'.repeat(Math.max(1, Math.floor(item.value / 20)))} {item.margin}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-sm font-bold mb-2">SEGMENTS</div>
          <div className="space-y-1">
            <div>Business Mix</div>
            {data.segments.map((segment: any, index: number) => (
              <div key={index}>
                {'█'.repeat(Math.max(1, Math.floor(segment.percentage / 10)))} {segment.name} {segment.percentage}%
              </div>
            ))}
            <div className="mt-2">Total: ${data.revenue}B</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold mb-2">GEOGRAPHY</div>
          <div className="space-y-1">
            <div>Regional</div>
            {data.geography.map((region: any, index: number) => (
              <div key={index}>
                {'█'.repeat(Math.max(1, Math.floor(region.percentage / 10)))} {region.name.slice(0, 5)}
              </div>
            ))}
            <div className="mt-2">${data.revenue}B</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Layout 5: Minimalist
function MinimalistLayout({ data }: { data: any }) {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Clean Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-light">{data.companyName}</h1>
        <div className="text-2xl text-muted-foreground">{data.symbol} • ${data.price}</div>
        <div className="text-lg text-green-600">+{data.change} (+{data.changePercent}%)</div>
      </div>

      {/* Clean Chart */}
      <Card className="border-0 shadow-none">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-light text-muted-foreground">SHARE PRICE</h2>
          </div>
          <StockChart symbol={data.symbol} />
        </CardContent>
      </Card>

      {/* Clean Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-sm text-muted-foreground">Market Cap</div>
          <div className="text-xl font-light">${(data.marketCap / 1e12).toFixed(1)}T</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Enterprise Value</div>
          <div className="text-xl font-light">$3.3T</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">P/E Ratio</div>
          <div className="text-xl font-light">{data.peRatio}x</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">EV/EBITDA</div>
          <div className="text-xl font-light">{data.evEbitda}x</div>
        </div>
      </div>

      {/* Clean Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-light text-muted-foreground mb-4">REVENUE</h3>
            <RevenueChart data={data.revenueData} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-light text-muted-foreground mb-4">EBITDA</h3>
            <EbitdaChart data={data.ebitdaData} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-light text-muted-foreground mb-4">SEGMENTS</h3>
            <PieChart data={data.segments} />
          </CardContent>
        </Card>
      </div>

      {/* Clean Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-light text-muted-foreground mb-4">GEOGRAPHY</h3>
            <PieChart data={data.geography} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-light text-muted-foreground mb-4 text-center">RECENT NEWS</h3>
            <div className="space-y-4">
              <div className="text-sm">• Apple announces new AI features in iOS 18</div>
              <div className="text-sm">• Q3 earnings beat expectations with strong services growth</div>
              <div className="text-sm">• Supply chain improvements noted in latest report</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Layout 6: Side Panel
function SidePanelLayout({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-screen">
      {/* Left Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Company Header */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{data.symbol}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{data.companyName}</h1>
                <div className="text-muted-foreground">{data.industry}</div>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-3xl font-bold">${data.price}</span>
                  <span className="text-lg text-green-600">+{data.change} (+{data.changePercent}%)</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Market Cap: ${(data.marketCap / 1e12).toFixed(1)}T • Employees: {(data.employees / 1000).toFixed(0)},000 • CEO: {data.ceo} • Exchange: {data.exchange}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Share Price Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <StockChart symbol={data.symbol} />
          </CardContent>
        </Card>

        {/* Financial Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Historical</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={data.revenueData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>EBITDA</CardTitle>
              <CardDescription>+ Margins</CardDescription>
            </CardHeader>
            <CardContent>
              <EbitdaChart data={data.ebitdaData} />
            </CardContent>
          </Card>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={data.segments} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geography</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={data.geography} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {data.companyName}
            <Badge variant="outline">{data.symbol}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Current Price</h3>
            <div className="text-2xl font-bold">${data.price}</div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Today's Change</h3>
            <div className="text-lg text-green-600">+${data.change}</div>
            <div className="text-lg text-green-600">+{data.changePercent}%</div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Key Metrics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>P/E</span>
                <span>{data.peRatio}x</span>
              </div>
              <div className="flex justify-between">
                <span>EV/EBITDA</span>
                <span>{data.evEbitda}x</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Fundamentals</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Revenue</span>
                <span>${data.revenue}B</span>
              </div>
              <div className="flex justify-between">
                <span>EBITDA</span>
                <span>${data.ebitda}B</span>
              </div>
              <div className="flex justify-between">
                <span>Margin</span>
                <span>{data.margin}%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Valuation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Market Cap</span>
                <span>${(data.marketCap / 1e12).toFixed(1)}T</span>
              </div>
              <div className="flex justify-between">
                <span>Enterprise</span>
                <span>$3.3T</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}