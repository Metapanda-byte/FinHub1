'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Building } from 'lucide-react';
import { SECFilingsSection } from './sec-filings-section';
import { EarningsTranscriptsSection } from './earnings-transcripts-section';

interface SECFilingsTranscriptsProps {
  ticker: string;
}

export default function SECFilingsTranscripts({ ticker }: SECFilingsTranscriptsProps) {
  const [activeSubTab, setActiveSubTab] = useState("sec-filings");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SEC Filings & Earnings Transcripts
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Access official SEC documents and earnings call transcripts for {ticker}
          </p>
        </CardHeader>
      </Card>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <div className="premium-tabs">
          <TabsList className="h-12 bg-transparent border-none p-0 gap-0 w-full justify-start">
            <TabsTrigger 
              value="sec-filings" 
              className="premium-tab-trigger h-12 px-6 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              SEC Filings
            </TabsTrigger>
            <TabsTrigger 
              value="earnings-transcripts" 
              className="premium-tab-trigger h-12 px-6 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              Earnings Transcripts
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sec-filings" className="mt-6">
          <SECFilingsSection ticker={ticker} />
        </TabsContent>

        <TabsContent value="earnings-transcripts" className="mt-6">
          <EarningsTranscriptsSection ticker={ticker} />
        </TabsContent>
      </Tabs>
    </div>
  );
}