"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp, TrendingDown, Download, FileText, DollarSign } from "lucide-react";
import { useState } from "react";

export default function FinancialsLayoutsPage() {
  const [selectedLayout, setSelectedLayout] = useState<number>(1);

  const layouts = [
    { id: 1, name: "Investment Banking Classic", description: "Dense data tables with KPI highlights" },
    { id: 2, name: "Equity Research Format", description: "Summary metrics with detailed breakdowns" },
    { id: 3, name: "Hedge Fund Analytics", description: "Focus on trends and relative performance" },
    { id: 4, name: "Private Equity Dashboard", description: "LTM focus with operational metrics" },
    { id: 5, name: "Credit Analysis View", description: "Emphasis on debt metrics and coverage ratios" },
    { id: 6, name: "M&A Deal Book", description: "Transaction-ready financial summaries" }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Statement Layout Concepts</h1>
          <p className="text-muted-foreground">Professional investment banking style layouts for financial data presentation</p>
        </div>

        {/* Layout Selector */}
        <div className="flex gap-2 flex-wrap">
          {layouts.map((layout) => (
            <Button
              key={layout.id}
              variant={selectedLayout === layout.id ? "default" : "outline"}
              onClick={() => setSelectedLayout(layout.id)}
              className="flex-col h-auto py-3 px-4"
            >
              <span className="font-semibold">{layout.name}</span>
              <span className="text-xs text-muted-foreground">{layout.description}</span>
            </Button>
          ))}
        </div>

        {/* Layout 1: Investment Banking Classic */}
        {selectedLayout === 1 && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-slate-900 text-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">MSFT - Financial Summary</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/10">
                      <Download className="h-4 w-4 mr-1" /> Export
                    </Button>
                    <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/10">
                      <FileText className="h-4 w-4 mr-1" /> PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Key Metrics Strip */}
                <div className="grid grid-cols-6 divide-x bg-gray-50 dark:bg-gray-900">
                  <div className="p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase">Market Cap</div>
                    <div className="text-xl font-bold">$2.95T</div>
                    <div className="text-xs text-green-600">+12.4%</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase">EV/EBITDA</div>
                    <div className="text-xl font-bold">24.3x</div>
                    <div className="text-xs text-muted-foreground">LTM</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase">P/E Ratio</div>
                    <div className="text-xl font-bold">32.4x</div>
                    <div className="text-xs text-muted-foreground">TTM</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase">Revenue</div>
                    <div className="text-xl font-bold">$236.8B</div>
                    <div className="text-xs text-green-600">+15.2%</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase">EBITDA Margin</div>
                    <div className="text-xl font-bold">48.2%</div>
                    <div className="text-xs text-green-600">+230bps</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase">FCF Yield</div>
                    <div className="text-xl font-bold">3.5%</div>
                    <div className="text-xs text-muted-foreground">LTM</div>
                  </div>
                </div>

                {/* Financial Statements Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 border-y">
                      <tr>
                        <th className="text-left p-3 font-medium">USD in millions</th>
                        <th className="text-right p-3 font-medium">FY2020</th>
                        <th className="text-right p-3 font-medium">FY2021</th>
                        <th className="text-right p-3 font-medium">FY2022</th>
                        <th className="text-right p-3 font-medium">FY2023</th>
                        <th className="text-right p-3 font-medium">LTM</th>
                        <th className="text-right p-3 font-medium">CAGR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="font-semibold bg-blue-50 dark:bg-blue-950">
                        <td className="p-3">Revenue</td>
                        <td className="text-right p-3">143,015</td>
                        <td className="text-right p-3">168,088</td>
                        <td className="text-right p-3">198,270</td>
                        <td className="text-right p-3">211,915</td>
                        <td className="text-right p-3">236,800</td>
                        <td className="text-right p-3">13.4%</td>
                      </tr>
                      <tr>
                        <td className="p-3 pl-6">- Cloud Revenue</td>
                        <td className="text-right p-3">58,900</td>
                        <td className="text-right p-3">75,251</td>
                        <td className="text-right p-3">91,250</td>
                        <td className="text-right p-3">106,206</td>
                        <td className="text-right p-3">126,472</td>
                        <td className="text-right p-3">21.0%</td>
                      </tr>
                      <tr>
                        <td className="p-3 pl-6">- Office Products</td>
                        <td className="text-right p-3">35,316</td>
                        <td className="text-right p-3">39,872</td>
                        <td className="text-right p-3">44,862</td>
                        <td className="text-right p-3">48,517</td>
                        <td className="text-right p-3">53,919</td>
                        <td className="text-right p-3">11.1%</td>
                      </tr>
                      <tr className="font-semibold">
                        <td className="p-3">Gross Profit</td>
                        <td className="text-right p-3">96,937</td>
                        <td className="text-right p-3">115,856</td>
                        <td className="text-right p-3">135,620</td>
                        <td className="text-right p-3">146,052</td>
                        <td className="text-right p-3">166,684</td>
                        <td className="text-right p-3">14.5%</td>
                      </tr>
                      <tr className="text-muted-foreground italic">
                        <td className="p-3">% Margin</td>
                        <td className="text-right p-3">67.8%</td>
                        <td className="text-right p-3">68.9%</td>
                        <td className="text-right p-3">68.4%</td>
                        <td className="text-right p-3">68.9%</td>
                        <td className="text-right p-3">70.4%</td>
                        <td className="text-right p-3">-</td>
                      </tr>
                      <tr className="font-semibold bg-blue-50 dark:bg-blue-950">
                        <td className="p-3">EBITDA</td>
                        <td className="text-right p-3">66,746</td>
                        <td className="text-right p-3">81,613</td>
                        <td className="text-right p-3">96,269</td>
                        <td className="text-right p-3">105,358</td>
                        <td className="text-right p-3">114,219</td>
                        <td className="text-right p-3">14.4%</td>
                      </tr>
                      <tr className="text-muted-foreground italic">
                        <td className="p-3">% Margin</td>
                        <td className="text-right p-3">46.7%</td>
                        <td className="text-right p-3">48.6%</td>
                        <td className="text-right p-3">48.6%</td>
                        <td className="text-right p-3">49.7%</td>
                        <td className="text-right p-3">48.2%</td>
                        <td className="text-right p-3">-</td>
                      </tr>
                      <tr className="font-semibold border-t-2">
                        <td className="p-3">Net Income</td>
                        <td className="text-right p-3">44,281</td>
                        <td className="text-right p-3">61,271</td>
                        <td className="text-right p-3">72,738</td>
                        <td className="text-right p-3">72,361</td>
                        <td className="text-right p-3">87,985</td>
                        <td className="text-right p-3">18.7%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Layout 2: Equity Research Format */}
        {selectedLayout === 2 && (
          <div className="space-y-6">
            {/* Summary Box */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Financial Highlights - Microsoft Corporation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <div className="text-muted-foreground">Ticker</div>
                        <div className="font-semibold">NASDAQ: MSFT</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Sector</div>
                        <div className="font-semibold">Technology</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-muted-foreground">Price</div>
                        <div className="font-semibold">$408.46</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">52W Range</div>
                        <div className="font-semibold">$309.42 - $433.52</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-muted-foreground">Market Cap</div>
                        <div className="font-semibold">$2.95T</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Shares Out</div>
                        <div className="font-semibold">7.43B</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-muted-foreground">Dividend Yield</div>
                        <div className="font-semibold">0.66%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Beta</div>
                        <div className="font-semibold">0.92</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Investment Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">BUY</div>
                    <div className="text-sm text-muted-foreground mt-1">Strong Buy (23) | Buy (8) | Hold (2)</div>
                    <div className="mt-3">
                      <div className="text-sm text-muted-foreground">Price Target</div>
                      <div className="text-xl font-semibold">$465.00</div>
                      <div className="text-sm text-green-600">+13.8% Upside</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Financials */}
            <Tabs defaultValue="income" className="w-full">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                <TabsTrigger value="income">Income Statement</TabsTrigger>
                <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
                <TabsTrigger value="cash">Cash Flow</TabsTrigger>
                <TabsTrigger value="ratios">Key Ratios</TabsTrigger>
              </TabsList>

              <TabsContent value="income" className="mt-4">
                <Card>
                  <CardHeader className="pb-4 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Income Statement Analysis</CardTitle>
                      <div className="flex gap-2 text-sm">
                        <Button variant="ghost" size="sm">Annual</Button>
                        <Button variant="outline" size="sm">Quarterly</Button>
                        <Button variant="ghost" size="sm">TTM</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-6">
                      {/* Revenue Section */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          Revenue Breakdown
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </h4>
                        <div className="grid grid-cols-5 gap-2 text-sm">
                          <div className="font-medium">Total Revenue</div>
                          <div className="text-right">$168.1B</div>
                          <div className="text-right">$198.3B</div>
                          <div className="text-right">$211.9B</div>
                          <div className="text-right font-semibold">$236.8B</div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-sm text-muted-foreground italic">
                          <div>YoY Growth</div>
                          <div className="text-right">17.5%</div>
                          <div className="text-right">18.0%</div>
                          <div className="text-right">6.9%</div>
                          <div className="text-right text-green-600 font-medium">11.8%</div>
                        </div>
                      </div>

                      {/* Profitability Metrics */}
                      <div>
                        <h4 className="font-semibold mb-3">Profitability Metrics</h4>
                        <div className="space-y-2">
                          <div className="grid grid-cols-5 gap-2 text-sm">
                            <div>Gross Profit</div>
                            <div className="text-right">$115.9B</div>
                            <div className="text-right">$135.6B</div>
                            <div className="text-right">$146.1B</div>
                            <div className="text-right font-semibold">$166.7B</div>
                          </div>
                          <div className="grid grid-cols-5 gap-2 text-sm text-muted-foreground italic">
                            <div>% Margin</div>
                            <div className="text-right">68.9%</div>
                            <div className="text-right">68.4%</div>
                            <div className="text-right">68.9%</div>
                            <div className="text-right">70.4%</div>
                          </div>
                          <div className="grid grid-cols-5 gap-2 text-sm mt-3">
                            <div>Operating Income</div>
                            <div className="text-right">$69.9B</div>
                            <div className="text-right">$83.4B</div>
                            <div className="text-right">$88.5B</div>
                            <div className="text-right font-semibold">$109.4B</div>
                          </div>
                          <div className="grid grid-cols-5 gap-2 text-sm text-muted-foreground italic">
                            <div>% Margin</div>
                            <div className="text-right">41.6%</div>
                            <div className="text-right">42.1%</div>
                            <div className="text-right">41.8%</div>
                            <div className="text-right">46.2%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Layout 3: Hedge Fund Analytics */}
        {selectedLayout === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-12 gap-4">
              {/* Performance Metrics */}
              <Card className="col-span-8">
                <CardHeader className="pb-3 border-b bg-gray-50 dark:bg-gray-900">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Performance Analytics
                    <span className="text-sm font-normal text-muted-foreground">vs S&P 500 Tech</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Revenue Performance */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Revenue Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>3Y CAGR</span>
                          <span className="font-medium">13.4%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Peer Median</span>
                          <span className="text-muted-foreground">8.2%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Percentile</span>
                          <span className="font-medium text-green-600">87th</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Margin Analysis */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Margin Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>EBITDA Margin</span>
                          <span className="font-medium">48.2%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Peer Median</span>
                          <span className="text-muted-foreground">32.1%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Spread</span>
                          <span className="font-medium text-green-600">+16.1pp</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '48.2%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Capital Efficiency */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Capital Efficiency</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>ROIC</span>
                          <span className="font-medium">31.5%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>FCF Conversion</span>
                          <span className="font-medium">89.6%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Asset Turnover</span>
                          <span className="font-medium">0.58x</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trend Chart Area */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium mb-3">Quarterly Revenue Momentum</h4>
                    <div className="grid grid-cols-8 gap-1 items-end h-24">
                      <div className="bg-blue-200 dark:bg-blue-800 rounded" style={{ height: '70%' }}></div>
                      <div className="bg-blue-300 dark:bg-blue-700 rounded" style={{ height: '75%' }}></div>
                      <div className="bg-blue-400 dark:bg-blue-600 rounded" style={{ height: '82%' }}></div>
                      <div className="bg-blue-500 dark:bg-blue-500 rounded" style={{ height: '85%' }}></div>
                      <div className="bg-blue-600 dark:bg-blue-400 rounded" style={{ height: '88%' }}></div>
                      <div className="bg-blue-700 dark:bg-blue-300 rounded" style={{ height: '92%' }}></div>
                      <div className="bg-green-600 dark:bg-green-400 rounded" style={{ height: '95%' }}></div>
                      <div className="bg-green-700 dark:bg-green-300 rounded font-bold" style={{ height: '100%' }}></div>
                    </div>
                    <div className="grid grid-cols-8 gap-1 text-xs text-center mt-1 text-muted-foreground">
                      <div>Q1&apos;22</div>
                      <div>Q2&apos;22</div>
                      <div>Q3&apos;22</div>
                      <div>Q4&apos;22</div>
                      <div>Q1&apos;23</div>
                      <div>Q2&apos;23</div>
                      <div>Q3&apos;23</div>
                      <div>Q4&apos;23</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Factor Scores */}
              <Card className="col-span-4">
                <CardHeader className="pb-3 border-b bg-gray-50 dark:bg-gray-900">
                  <CardTitle className="text-lg">Factor Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Growth</span>
                      <span className="text-sm font-medium">9.2/10</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Quality</span>
                      <span className="text-sm font-medium">8.8/10</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Momentum</span>
                      <span className="text-sm font-medium">7.5/10</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="bg-yellow-600 h-3 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Value</span>
                      <span className="text-sm font-medium">4.2/10</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="bg-red-600 h-3 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Risk</span>
                      <span className="text-sm font-medium">8.1/10</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="bg-purple-600 h-3 rounded-full" style={{ width: '81%' }}></div>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Composite Score</span>
                      <span className="text-lg font-bold text-green-600">85/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Layout 4: Private Equity Dashboard */}
        {selectedLayout === 4 && (
          <div className="space-y-6">
            {/* LTM Summary Cards */}
            <div className="grid grid-cols-6 gap-3">
              <Card className="border-l-4 border-l-blue-600">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">LTM Revenue</div>
                  <div className="text-2xl font-bold">$236.8B</div>
                  <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +11.8% YoY
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-600">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">LTM EBITDA</div>
                  <div className="text-2xl font-bold">$114.2B</div>
                  <div className="text-xs">48.2% margin</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-600">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">LTM FCF</div>
                  <div className="text-2xl font-bold">$65.1B</div>
                  <div className="text-xs">57% conversion</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-600">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">Net Debt</div>
                  <div className="text-2xl font-bold">$46.8B</div>
                  <div className="text-xs">0.4x EBITDA</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-600">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">TEV/EBITDA</div>
                  <div className="text-2xl font-bold">26.0x</div>
                  <div className="text-xs text-muted-foreground">Peer: 18.5x</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-indigo-600">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">ROIC</div>
                  <div className="text-2xl font-bold">31.5%</div>
                  <div className="text-xs text-green-600">Top Quartile</div>
                </CardContent>
              </Card>
            </div>

            {/* Operating Metrics Dashboard */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Operating Performance - LTM Basis</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x">
                  {/* Left Side - P&L Walk */}
                  <div className="p-6">
                    <h4 className="font-semibold mb-4">P&L Bridge (LTM)</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Revenue</span>
                        <span className="font-bold">$236.8B</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="pl-4">(-) COGS</span>
                        <span className="text-red-600">($70.1B)</span>
                      </div>
                      <div className="flex justify-between items-center font-medium border-t pt-2">
                        <span>Gross Profit</span>
                        <span>$166.7B</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">70.4% margin</div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="pl-4">(-) Operating Expenses</span>
                        <span className="text-red-600">($57.3B)</span>
                      </div>
                      <div className="flex justify-between items-center font-medium border-t pt-2">
                        <span>Operating Income</span>
                        <span>$109.4B</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">46.2% margin</div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="pl-4">(+) D&A</span>
                        <span className="text-green-600">$4.8B</span>
                      </div>
                      <div className="flex justify-between items-center font-bold border-t pt-2 text-blue-600">
                        <span>EBITDA</span>
                        <span>$114.2B</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">48.2% margin</div>
                    </div>
                  </div>

                  {/* Right Side - Working Capital & Cash */}
                  <div className="p-6">
                    <h4 className="font-semibold mb-4">Cash Generation</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">EBITDA</span>
                        <span className="font-bold">$114.2B</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="pl-4">(-) Cash Taxes</span>
                        <span className="text-red-600">($19.3B)</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="pl-4">(+/-) Working Capital</span>
                        <span className="text-green-600">$2.1B</span>
                      </div>
                      <div className="flex justify-between items-center font-medium border-t pt-2">
                        <span>Operating Cash Flow</span>
                        <span>$97.0B</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="pl-4">(-) CapEx</span>
                        <span className="text-red-600">($31.9B)</span>
                      </div>
                      <div className="flex justify-between items-center font-bold border-t pt-2 text-green-600">
                        <span>Free Cash Flow</span>
                        <span>$65.1B</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">57% EBITDA conversion</div>
                      
                      <div className="pt-4 mt-4 border-t">
                        <div className="flex justify-between items-center text-sm">
                          <span>Days Sales Outstanding</span>
                          <span>68 days</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Inventory Turns</span>
                          <span>16.2x</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Cash Conversion Cycle</span>
                          <span>45 days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Layout 5: Credit Analysis View */}
        {selectedLayout === 5 && (
          <div className="space-y-6">
            {/* Credit Metrics Overview */}
            <div className="grid grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">Credit Rating</div>
                  <div className="text-2xl font-bold">AAA</div>
                  <div className="text-xs">Stable Outlook</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">Net Debt/EBITDA</div>
                  <div className="text-2xl font-bold">0.4x</div>
                  <div className="text-xs text-green-600">↓ from 0.8x</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">Interest Coverage</div>
                  <div className="text-2xl font-bold">52.3x</div>
                  <div className="text-xs">EBITDA/Interest</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">FCF/Debt</div>
                  <div className="text-2xl font-bold">68.4%</div>
                  <div className="text-xs">Strong</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase">Quick Ratio</div>
                  <div className="text-2xl font-bold">1.85x</div>
                  <div className="text-xs">Liquid</div>
                </CardContent>
              </Card>
            </div>

            {/* Debt Schedule */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Debt Maturity Schedule & Coverage Analysis</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Debt Schedule */}
                  <div>
                    <h4 className="font-semibold mb-4">Debt Maturities</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 text-sm font-medium border-b pb-2">
                        <div>Year</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Cumulative</div>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <div>2024</div>
                        <div className="text-right">$5.2B</div>
                        <div className="text-right">$5.2B</div>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <div>2025</div>
                        <div className="text-right">$8.0B</div>
                        <div className="text-right">$13.2B</div>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <div>2026</div>
                        <div className="text-right">$12.5B</div>
                        <div className="text-right">$25.7B</div>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <div>2027</div>
                        <div className="text-right">$7.8B</div>
                        <div className="text-right">$33.5B</div>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <div>2028+</div>
                        <div className="text-right">$61.5B</div>
                        <div className="text-right">$95.0B</div>
                      </div>
                      <div className="grid grid-cols-3 text-sm font-bold border-t pt-2 mt-2">
                        <div>Total Debt</div>
                        <div className="text-right">$95.0B</div>
                        <div className="text-right">-</div>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <div>(-) Cash</div>
                        <div className="text-right">($48.2B)</div>
                        <div className="text-right">-</div>
                      </div>
                      <div className="grid grid-cols-3 text-sm font-bold text-blue-600">
                        <div>Net Debt</div>
                        <div className="text-right">$46.8B</div>
                        <div className="text-right">-</div>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Ratios */}
                  <div>
                    <h4 className="font-semibold mb-4">Coverage Analysis</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>EBITDA/Interest Expense</span>
                          <span className="font-medium">52.3x</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Minimum covenant: 3.0x</div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Debt/Total Capital</span>
                          <span className="font-medium">29.1%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '29.1%' }}></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Maximum covenant: 65%</div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Fixed Charge Coverage</span>
                          <span className="font-medium">15.8x</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Minimum: 1.5x</div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h5 className="font-medium mb-2 text-sm">Liquidity Summary</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Cash & Equivalents</span>
                            <span>$48.2B</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Undrawn Revolver</span>
                            <span>$10.0B</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total Liquidity</span>
                            <span>$58.2B</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Layout 6: M&A Deal Book */}
        {selectedLayout === 6 && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <Card className="border-2 border-gray-300 dark:border-gray-700">
              <CardHeader className="bg-gray-100 dark:bg-gray-800 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Transaction Summary - Microsoft Corporation</CardTitle>
                  <div className="text-sm text-muted-foreground">Deal Book | Confidential</div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase">Valuation Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Enterprise Value</span>
                        <span className="font-medium">$2,997B</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equity Value</span>
                        <span className="font-medium">$2,950B</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Implied Share Price</span>
                        <span>$408.46</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span>EV/LTM Revenue</span>
                        <span className="font-medium">12.7x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EV/LTM EBITDA</span>
                        <span className="font-medium">26.2x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P/E (LTM)</span>
                        <span className="font-medium">33.5x</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase">LTM Financials</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue</span>
                        <span className="font-medium">$236.8B</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EBITDA</span>
                        <span className="font-medium">$114.2B</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Margin %</span>
                        <span>48.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EBIT</span>
                        <span className="font-medium">$109.4B</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Margin %</span>
                        <span>46.2%</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span>Net Income</span>
                        <span className="font-medium">$87.9B</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Free Cash Flow</span>
                        <span className="font-medium">$65.1B</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase">Balance Sheet</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cash & Equiv.</span>
                        <span className="font-medium">$48.2B</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Debt</span>
                        <span className="font-medium">$95.0B</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Net Debt</span>
                        <span>$46.8B</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Net Debt/EBITDA</span>
                        <span>0.4x</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span>Shareholders&apos; Equity</span>
                        <span className="font-medium">$244.1B</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Assets</span>
                        <span className="font-medium">$464.5B</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sources and Uses Table */}
                <div className="mt-8 border-t pt-6">
                  <h4 className="font-semibold mb-4">Illustrative Transaction Structure</h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h5 className="font-medium mb-3 text-sm">Sources of Funds</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between pb-1 border-b">
                          <span>Cash on Hand</span>
                          <span className="font-medium">$48.2B</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b">
                          <span>New Term Loan</span>
                          <span className="font-medium">$75.0B</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b">
                          <span>Senior Notes</span>
                          <span className="font-medium">$50.0B</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b">
                          <span>Equity Contribution</span>
                          <span className="font-medium">$100.0B</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2">
                          <span>Total Sources</span>
                          <span>$273.2B</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-3 text-sm">Uses of Funds</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between pb-1 border-b">
                          <span>Purchase Price</span>
                          <span className="font-medium">$250.0B</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b">
                          <span>Refinance Existing Debt</span>
                          <span className="font-medium">$15.0B</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b">
                          <span>Transaction Fees</span>
                          <span className="font-medium">$5.0B</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b">
                          <span>Cash to Balance Sheet</span>
                          <span className="font-medium">$3.2B</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2">
                          <span>Total Uses</span>
                          <span>$273.2B</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}