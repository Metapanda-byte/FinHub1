'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, Building } from 'lucide-react';
import { useEarningsTranscriptDates, useEarningsTranscript } from '@/lib/api/financial';

interface EarningsTranscriptsSectionProps {
  ticker: string;
}

export function EarningsTranscriptsSection({ ticker }: EarningsTranscriptsSectionProps) {
  const [selectedTranscript, setSelectedTranscript] = useState<{ quarter: number; year: number } | null>(null);
  
  const { data: transcriptDates, error: transcriptError, isLoading: transcriptLoading } = useEarningsTranscriptDates(ticker);
  const { transcript: transcriptContent, error: transcriptContentError, isLoading: transcriptContentLoading } = useEarningsTranscript(
    ticker,
    selectedTranscript?.quarter || 0,
    selectedTranscript?.year || 0
  );

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Earnings Call Transcripts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transcriptLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : transcriptError ? (
          <div className="text-red-600 text-sm">
            Error loading earnings transcripts: {transcriptError.message}
          </div>
        ) : !transcriptDates || transcriptDates.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No earnings transcripts available for {ticker}
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              Found {transcriptDates.length} earnings call transcripts
            </div>
            <div className="space-y-3">
              {transcriptDates.slice(0, 12).map((transcript, index) => transcript && (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100">
                      Q{transcript.quarter} {transcript.year}
                    </Badge>
                    <span className="text-sm font-medium">
                      {ticker} Earnings Call
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(transcript.date)}
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTranscript({ quarter: transcript.quarter, year: transcript.year })}
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      Read Transcript
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>
                        {ticker} Q{transcript.quarter} {transcript.year} Earnings Call Transcript
                      </DialogTitle>
                      <DialogDescription>
                        Earnings call from {formatDate(transcript.date)}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-full mt-4">
                      {transcriptContentLoading ? (
                        <div className="space-y-4">
                          {[...Array(10)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-full" />
                          ))}
                        </div>
                      ) : transcriptContentError ? (
                        <div className="text-red-600 text-sm">
                          Error loading transcript content: {transcriptContentError.message}
                        </div>
                      ) : transcriptContent ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                            {Array.isArray(transcriptContent) && transcriptContent.length > 0 ? transcriptContent[0]?.content : 'No transcript content available'}
                          </pre>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No transcript content available
                        </div>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 