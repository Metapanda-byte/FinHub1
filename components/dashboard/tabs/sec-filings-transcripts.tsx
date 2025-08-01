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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sec-filings" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            SEC Filings
          </TabsTrigger>
          <TabsTrigger value="earnings-transcripts" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Earnings Transcripts
          </TabsTrigger>
        </TabsList>

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