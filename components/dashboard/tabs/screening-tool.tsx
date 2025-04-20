"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Search, ArrowUpDown } from "lucide-react";
import { screeningFilters, screeningResults } from "@/lib/mockData";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function ScreeningTool() {
  const [results, setResults] = useState(screeningResults);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortBy) return 0;
    
    const fieldA = a[sortBy as keyof typeof a];
    const fieldB = b[sortBy as keyof typeof b];
    
    if (typeof fieldA === "number" && typeof fieldB === "number") {
      return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
    }
    
    // For string fields
    const stringA = String(fieldA);
    const stringB = String(fieldB);
    return sortDirection === "asc" 
      ? stringA.localeCompare(stringB) 
      : stringB.localeCompare(stringA);
  });

  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * resultsPerPage, 
    currentPage * resultsPerPage
  );
  
  const totalPages = Math.ceil(results.length / resultsPerPage);

  const handleSearch = () => {
    // In a real app, this would query an API with the filter values
    setCurrentPage(1);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sortDirection === "asc" 
      ? <ArrowUpDown className="h-3 w-3 ml-1" /> 
      : <ArrowUpDown className="h-3 w-3 ml-1 rotate-180" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Filters</CardTitle>
          <CardDescription>Set parameters to screen companies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="marketCap">Market Cap Range</Label>
            <Select defaultValue="all">
              <SelectTrigger id="marketCap">
                <SelectValue placeholder="All Market Caps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Market Caps</SelectItem>
                {screeningFilters.marketCap.map((cap) => (
                  <SelectItem key={cap} value={cap.toLowerCase().replace(/\s+/g, '-')}>
                    {cap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select defaultValue="all">
              <SelectTrigger id="sector">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {screeningFilters.sector.map((sector) => (
                  <SelectItem key={sector} value={sector.toLowerCase().replace(/\s+/g, '-')}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>P/E Ratio Range</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm">0</span>
              <span className="text-sm">50</span>
              <span className="text-sm">100+</span>
            </div>
            <Slider defaultValue={[0, 100]} max={100} step={1} />
            <div className="flex space-x-2">
              <div className="grid flex-1 grid-cols-2">
                <Input className="rounded-r-none" placeholder="Min" />
                <Input className="rounded-l-none border-l-0" placeholder="Max" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Revenue Growth Range (%)</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm">-50%</span>
              <span className="text-sm">0%</span>
              <span className="text-sm">+50%</span>
            </div>
            <Slider defaultValue={[-50, 50]} min={-50} max={50} step={1} />
            <div className="flex space-x-2">
              <div className="grid flex-1 grid-cols-2">
                <Input className="rounded-r-none" placeholder="Min" />
                <Input className="rounded-l-none border-l-0" placeholder="Max" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Dividend Yield Range (%)</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm">0%</span>
              <span className="text-sm">2.5%</span>
              <span className="text-sm">5%+</span>
            </div>
            <Slider defaultValue={[0, 5]} max={5} step={0.1} />
            <div className="flex space-x-2">
              <div className="grid flex-1 grid-cols-2">
                <Input className="rounded-r-none" placeholder="Min" />
                <Input className="rounded-l-none border-l-0" placeholder="Max" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Additional Filters</Label>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <Checkbox id="positive-earnings" />
                <label
                  htmlFor="positive-earnings"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Positive Earnings
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pays-dividend" />
                <label
                  htmlFor="pays-dividend"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Pays Dividend
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="positive-free-cash-flow" />
                <label
                  htmlFor="positive-free-cash-flow"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Positive Free Cash Flow
                </label>
              </div>
            </div>
          </div>
          
          <Button className="w-full" onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Results</CardTitle>
            <CardDescription>Found {results.length} companies</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th 
                    className="text-left py-3 px-4 font-medium text-sm cursor-pointer"
                    onClick={() => handleSort('ticker')}
                  >
                    <div className="flex items-center">
                      Ticker
                      {renderSortIcon('ticker')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-sm cursor-pointer"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center">
                      Company
                      {renderSortIcon('company')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-sm cursor-pointer"
                    onClick={() => handleSort('sector')}
                  >
                    <div className="flex items-center">
                      Sector
                      {renderSortIcon('sector')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-medium text-sm cursor-pointer"
                    onClick={() => handleSort('marketCap')}
                  >
                    <div className="flex items-center justify-end">
                      Market Cap
                      {renderSortIcon('marketCap')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-medium text-sm cursor-pointer"
                    onClick={() => handleSort('peRatio')}
                  >
                    <div className="flex items-center justify-end">
                      P/E
                      {renderSortIcon('peRatio')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-medium text-sm cursor-pointer"
                    onClick={() => handleSort('dividendYield')}
                  >
                    <div className="flex items-center justify-end">
                      Div. Yield
                      {renderSortIcon('dividendYield')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-medium text-sm cursor-pointer"
                    onClick={() => handleSort('revenueGrowth')}
                  >
                    <div className="flex items-center justify-end">
                      Rev. Growth
                      {renderSortIcon('revenueGrowth')}
                    </div>
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-medium text-sm cursor-pointer"
                    onClick={() => handleSort('priceChange1Y')}
                  >
                    <div className="flex items-center justify-end">
                      1Y Return
                      {renderSortIcon('priceChange1Y')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((company) => (
                  <tr key={company.ticker} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{company.ticker}</td>
                    <td className="py-3 px-4 text-sm">{company.company}</td>
                    <td className="py-3 px-4 text-sm">{company.sector}</td>
                    <td className="text-right py-3 px-4 text-sm">{formatCurrency(company.marketCap)}B</td>
                    <td className="text-right py-3 px-4 text-sm">{company.peRatio.toFixed(1)}x</td>
                    <td className="text-right py-3 px-4 text-sm">{formatPercentage(company.dividendYield)}</td>
                    <td className={cn(
                      "text-right py-3 px-4 text-sm",
                      company.revenueGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {formatPercentage(company.revenueGrowth)}
                    </td>
                    <td className={cn(
                      "text-right py-3 px-4 text-sm",
                      company.priceChange1Y >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {formatPercentage(company.priceChange1Y)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}