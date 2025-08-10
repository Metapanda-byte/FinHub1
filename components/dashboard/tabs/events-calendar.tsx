"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEarningsCalendar } from '@/lib/api/financial';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Building2, Globe, Filter } from 'lucide-react';

function fmt(d: Date) {
  return d.toISOString().slice(0,10);
}

function startOfWeek(input?: Date) {
  const now = input ? new Date(input) : new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0,0,0,0);
  return monday;
}

function formatMarketCap(value: number | null) {
  if (!value) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${(value / 1e3).toFixed(2)}K`;
}

function getMarketCapCategory(value: number | null) {
  if (!value) return 'Unknown';
  if (value >= 200e9) return 'Mega Cap';
  if (value >= 10e9) return 'Large Cap';
  if (value >= 2e9) return 'Mid Cap';
  if (value >= 300e6) return 'Small Cap';
  if (value >= 50e6) return 'Micro Cap';
  return 'Nano Cap';
}

export default function EventsCalendar() {
  const [weekStart, setWeekStart] = React.useState<Date>(startOfWeek());
  const [marketCapFilter, setMarketCapFilter] = React.useState<string>('all');
  const [sectorFilter, setSectorFilter] = React.useState<string>('all');
  const [exchangeFilter, setExchangeFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [expandedDays, setExpandedDays] = React.useState<Set<string>>(new Set());

  const weekEnd = React.useMemo(() => { 
    const d = new Date(weekStart); 
    d.setDate(d.getDate()+6); 
    d.setHours(23,59,59,999); 
    return d; 
  }, [weekStart]);

  const { data, isLoading } = useEarningsCalendar({ from: fmt(weekStart), to: fmt(weekEnd) });

  // Extract unique sectors and exchanges for filter options
  const { sectors, exchanges } = React.useMemo(() => {
    const uniqueSectors = new Set<string>();
    const uniqueExchanges = new Set<string>();
    (data || []).forEach((r: any) => {
      if (r.sector) uniqueSectors.add(r.sector);
      if (r.exchange) uniqueExchanges.add(r.exchange);
    });
    return {
      sectors: Array.from(uniqueSectors).sort(),
      exchanges: Array.from(uniqueExchanges).sort()
    };
  }, [data]);

  // Filter and group data
  const grouped = React.useMemo(() => {
    let filtered = data || [];

    // Apply market cap filter
    if (marketCapFilter !== 'all') {
      filtered = filtered.filter((r: any) => {
        const category = getMarketCapCategory(r.marketCap);
        switch (marketCapFilter) {
          case 'mega': return category === 'Mega Cap';
          case 'large': return category === 'Large Cap';
          case 'mid': return category === 'Mid Cap';
          case 'small': return category === 'Small Cap';
          case 'micro': return category === 'Micro Cap';
          case 'nano': return category === 'Nano Cap';
          default: return true;
        }
      });
    }

    // Apply sector filter
    if (sectorFilter !== 'all') {
      filtered = filtered.filter((r: any) => r.sector === sectorFilter);
    }

    // Apply exchange filter
    if (exchangeFilter !== 'all') {
      filtered = filtered.filter((r: any) => r.exchange === exchangeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((r: any) => 
        r.symbol?.toLowerCase().includes(term) || 
        r.name?.toLowerCase().includes(term) ||
        r.sector?.toLowerCase().includes(term) ||
        r.industry?.toLowerCase().includes(term)
      );
    }

    // Group by date
    const map = new Map<string, any[]>();
    filtered.forEach((r: any) => {
      const key = r.date || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });

    // Sort entries by date and sort companies within each day by market cap
    const entries = Array.from(map.entries()).sort((a,b) => 
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    entries.forEach(([_, companies]) => {
      companies.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    });

    return entries;
  }, [data, marketCapFilter, sectorFilter, exchangeFilter, searchTerm]);

  const prevWeek = () => { 
    const d = new Date(weekStart); 
    d.setDate(d.getDate()-7); 
    setWeekStart(d); 
  };
  
  const nextWeek = () => { 
    const d = new Date(weekStart); 
    d.setDate(d.getDate()+7); 
    setWeekStart(d); 
  };

  const thisWeek = () => {
    setWeekStart(startOfWeek());
  };

  const toggleDay = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const isCurrentWeek = React.useMemo(() => {
    const current = startOfWeek();
    return Math.abs(current.getTime() - weekStart.getTime()) < 1000 * 60 * 60 * 24;
  }, [weekStart]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4"/> 
              Earnings Calendar
            </CardTitle>
            <CardDescription>Upcoming company earnings reports</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevWeek}
            >
              <ChevronLeft className="h-4 w-4"/>
            </Button>
            <Button 
              variant={isCurrentWeek ? "default" : "outline"} 
              size="sm" 
              onClick={thisWeek}
            >
              This Week
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextWeek}
            >
              <ChevronRight className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week display */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium">
            {weekStart.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} — {weekEnd.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground"/>
            <span className="text-sm font-medium">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Search</label>
              <Input
                placeholder="Symbol or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Market Cap</label>
              <Select value={marketCapFilter} onValueChange={setMarketCapFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="mega">Mega Cap ($200B+)</SelectItem>
                  <SelectItem value="large">Large Cap ($10B-$200B)</SelectItem>
                  <SelectItem value="mid">Mid Cap ($2B-$10B)</SelectItem>
                  <SelectItem value="small">Small Cap ($300M-$2B)</SelectItem>
                  <SelectItem value="micro">Micro Cap ($50M-$300M)</SelectItem>
                  <SelectItem value="nano">Nano Cap (&lt;$50M)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sector</label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Exchange</label>
              <Select value={exchangeFilter} onValueChange={setExchangeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exchanges</SelectItem>
                  {exchanges.map(exchange => (
                    <SelectItem key={exchange} value={exchange}>{exchange}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Loading earnings calendar...</div>
        ) : grouped.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No earnings found for the selected criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map(([day, companies]) => {
              const dayDate = new Date(day);
              const isToday = new Date().toDateString() === dayDate.toDateString();
              const isExpanded = expandedDays.has(day);
              const displayCount = isExpanded ? companies.length : 5;
              const hasMore = companies.length > 5;
              
              return (
                <div key={day} className={`border rounded-lg overflow-hidden ${isToday ? 'ring-2 ring-primary' : ''}`}>
                  <div className={`px-4 py-2.5 flex items-center justify-between ${isToday ? 'bg-primary/10' : 'bg-muted/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {dayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </div>
                      {isToday && <Badge variant="default" className="text-xs">Today</Badge>}
                      <Badge variant="secondary" className="text-xs">
                        {companies.length} {companies.length === 1 ? 'company' : 'companies'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    {companies.slice(0, displayCount).map((r: any, idx: number) => {
                      const epsChange = r.eps != null && r.epsEstimated != null 
                        ? ((r.eps - r.epsEstimated) / Math.abs(r.epsEstimated)) * 100 
                        : null;
                      const revChange = r.revenue != null && r.revenueEstimated != null 
                        ? ((r.revenue - r.revenueEstimated) / Math.abs(r.revenueEstimated)) * 100 
                        : null;
                      
                      return (
                        <div key={idx} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-mono font-semibold text-sm">{r.symbol}</span>
                                <span className="text-sm truncate">{r.name || 'Unknown Company'}</span>
                                {r.time && (
                                  <Badge variant="outline" className="text-xs">
                                    {r.time.toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Building2 className="h-3 w-3"/>
                                  <span>{formatMarketCap(r.marketCap)}</span>
                                  <Badge variant="secondary" className="text-xs ml-1">
                                    {getMarketCapCategory(r.marketCap)}
                                  </Badge>
                                </div>
                                
                                {r.sector && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <span>{r.sector}</span>
                                  </div>
                                )}
                                
                                {r.exchange && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Globe className="h-3 w-3"/>
                                    <span>{r.exchange}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1 text-right">
                              {r.epsEstimated != null && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">EPS Est:</span>
                                  <span className="ml-1 font-mono">${r.epsEstimated.toFixed(2)}</span>
                                  {r.eps != null && (
                                    <>
                                      <span className="mx-1">→</span>
                                      <span className="font-mono">${r.eps.toFixed(2)}</span>
                                      {epsChange != null && (
                                        <span className={`ml-1 inline-flex items-center ${epsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {epsChange >= 0 ? <TrendingUp className="h-3 w-3"/> : <TrendingDown className="h-3 w-3"/>}
                                          <span className="ml-0.5">{Math.abs(epsChange).toFixed(1)}%</span>
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {r.revenueEstimated != null && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">Rev Est:</span>
                                  <span className="ml-1 font-mono">${(r.revenueEstimated/1e9).toFixed(2)}B</span>
                                  {r.revenue != null && (
                                    <>
                                      <span className="mx-1">→</span>
                                      <span className="font-mono">${(r.revenue/1e9).toFixed(2)}B</span>
                                      {revChange != null && (
                                        <span className={`ml-1 inline-flex items-center ${revChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {revChange >= 0 ? <TrendingUp className="h-3 w-3"/> : <TrendingDown className="h-3 w-3"/>}
                                          <span className="ml-0.5">{Math.abs(revChange).toFixed(1)}%</span>
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {hasMore && (
                    <div className="px-4 py-2 border-t bg-muted/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => toggleDay(day)}
                      >
                        {isExpanded ? 'Show less' : `Show ${companies.length - 5} more`}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}