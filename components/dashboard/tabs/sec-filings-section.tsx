'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, FileText, Filter } from 'lucide-react';
import { useSECFilings } from '@/lib/api/financial';

interface SECFilingsSectionProps {
  ticker: string;
}

export function SECFilingsSection({ ticker }: SECFilingsSectionProps) {
  const [filingTypeFilter, setFilingTypeFilter] = useState<string>('all');
  
  const { data: secFilings, error: secError, isLoading: secLoading } = useSECFilings(ticker);

  // Filter SEC filings by type
  const filteredFilings = useMemo(() => {
    if (!secFilings || filingTypeFilter === 'all') return secFilings;
    return secFilings.filter(filing => filing.type === filingTypeFilter);
  }, [secFilings, filingTypeFilter]);

  // Get unique filing types for filter dropdown
  const filingTypes = useMemo(() => {
    if (!secFilings) return [];
    const typeSet = new Set(secFilings.map(filing => filing.type));
    const types = Array.from(typeSet).sort();
    return types;
  }, [secFilings]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getFilingTypeColor = (type: string) => {
    switch (type) {
      case '10-K': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case '10-Q': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case '8-K': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'DEF 14A': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent SEC Filings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {secLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : secError ? (
          <div className="text-red-600 text-sm">
            Error loading SEC filings: {secError.message}
          </div>
        ) : !filteredFilings || filteredFilings.length === 0 ? (
          <div className="text-gray-500 text-sm">
            {filingTypeFilter === 'all' ? `No SEC filings available for ${ticker}` : `No ${filingTypeFilter} filings found for ${ticker}`}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by filing type:</span>
              </div>
              <Select value={filingTypeFilter} onValueChange={setFilingTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All filing types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All filing types ({secFilings?.length || 0})</SelectItem>
                  {filingTypes.map(type => {
                    const count = secFilings?.filter(f => f.type === type).length || 0;
                    return (
                      <SelectItem key={type} value={type}>
                        {type} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Showing {filteredFilings.length} filings from the last 3 years
              </div>
            </div>
            <div className="space-y-3">
              {filteredFilings.map((filing, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getFilingTypeColor(filing.type)}>
                      {filing.type}
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Filed: {formatDate(filing.fillingDate)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Accepted: {formatDate(filing.acceptedDate)} • CIK: {filing.cik}
                  </div>
                </div>
                <div className="flex gap-2">
                  {filing.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(filing.link, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                  )}
                  {filing.finalLink && filing.finalLink !== filing.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(filing.finalLink, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      Final
                    </Button>
                  )}
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 