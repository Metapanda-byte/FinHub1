'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, MessageSquare, Brain, TrendingUp } from 'lucide-react';
import { useTranscriptAnalysis, useFilingContent } from '@/lib/api/financial';

interface ContentExtractionDemoProps {
  ticker: string;
}

export function ContentExtractionDemo({ ticker }: ContentExtractionDemoProps) {
  const [selectedFiling, setSelectedFiling] = useState<{url: string, type: string} | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<{quarter: number, year: number} | null>(null);

  // Example: Analyze most recent earnings call
  const { analysis: transcriptAnalysis, isLoading: transcriptLoading } = useTranscriptAnalysis(
    ticker, 
    selectedTranscript?.quarter || 0, 
    selectedTranscript?.year || 0
  );

  // Example: Extract content from selected filing
  const { content: filingContent, isLoading: filingLoading } = useFilingContent(
    ticker,
    selectedFiling?.url || '',
    selectedFiling?.type || ''
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Advanced AI Content Extraction Demo - {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transcript" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transcript">
              <MessageSquare className="h-4 w-4 mr-2" />
              Transcript Analysis
            </TabsTrigger>
            <TabsTrigger value="filing">
              <FileText className="h-4 w-4 mr-2" />
              Filing Extraction
            </TabsTrigger>
            <TabsTrigger value="integration">
              <TrendingUp className="h-4 w-4 mr-2" />
              AI Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transcript" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => setSelectedTranscript({quarter: 3, year: 2025})}
                variant={selectedTranscript?.quarter === 3 ? "default" : "outline"}
                size="sm"
              >
                Q3 2025
              </Button>
              <Button 
                onClick={() => setSelectedTranscript({quarter: 2, year: 2025})}
                variant={selectedTranscript?.quarter === 2 ? "default" : "outline"}
                size="sm"
              >
                Q2 2025
              </Button>
              <Button 
                onClick={() => setSelectedTranscript({quarter: 1, year: 2025})}
                variant={selectedTranscript?.quarter === 1 ? "default" : "outline"}
                size="sm"
              >
                Q1 2025
              </Button>
            </div>

            {transcriptLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Analyzing earnings transcript...
              </div>
            ) : transcriptAnalysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Management Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {transcriptAnalysis.analysis.managementHighlights.slice(0, 3).map((highlight: string, i: number) => (
                        <div key={i} className="p-2 bg-green-50 rounded text-xs">
                          {highlight}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Forward Guidance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {transcriptAnalysis.analysis.guidance.slice(0, 3).map((guidance: string, i: number) => (
                        <div key={i} className="p-2 bg-blue-50 rounded text-xs">
                          {guidance}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Strategic Updates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {transcriptAnalysis.analysis.strategicUpdates.slice(0, 3).map((update: string, i: number) => (
                        <div key={i} className="p-2 bg-purple-50 rounded text-xs">
                          {update}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Risk Discussions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {transcriptAnalysis.analysis.riskDiscussions.slice(0, 3).map((risk: string, i: number) => (
                        <div key={i} className="p-2 bg-orange-50 rounded text-xs">
                          {risk}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : selectedTranscript ? (
              <div className="text-center p-8 text-gray-500">
                No transcript analysis available for Q{selectedTranscript.quarter} {selectedTranscript.year}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                Select a quarter above to analyze earnings transcript
              </div>
            )}
          </TabsContent>

          <TabsContent value="filing" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => setSelectedFiling({
                  url: 'https://www.sec.gov/Archives/edgar/data/320193/000032019325000071/0000320193-25-000071-index.htm',
                  type: '10-Q'
                })}
                variant={selectedFiling?.type === '10-Q' ? "default" : "outline"}
                size="sm"
              >
                Latest 10-Q
              </Button>
              <Button 
                onClick={() => setSelectedFiling({
                  url: 'https://www.sec.gov/Archives/edgar/data/320193/000032019325000071/0000320193-25-000071-index.htm',
                  type: '10-K'
                })}
                variant={selectedFiling?.type === '10-K' ? "default" : "outline"}
                size="sm"
              >
                Latest 10-K
              </Button>
              <Button 
                onClick={() => setSelectedFiling({
                  url: 'https://www.sec.gov/Archives/edgar/data/320193/000032019325000071/0000320193-25-000071-index.htm',
                  type: '8-K'
                })}
                variant={selectedFiling?.type === '8-K' ? "default" : "outline"}
                size="sm"
              >
                Recent 8-K
              </Button>
            </div>

            {filingLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Extracting filing content...
              </div>
            ) : filingContent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{filingContent.filingType}</Badge>
                  <span className="text-xs text-gray-500">
                    Extracted: {new Date(filingContent.extractedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filingContent.extractedSections.managementDiscussion && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Management Discussion & Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 bg-gray-50 rounded text-xs max-h-32 overflow-y-auto">
                          {filingContent.extractedSections.managementDiscussion}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {filingContent.extractedSections.riskFactors && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Risk Factors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 bg-red-50 rounded text-xs max-h-32 overflow-y-auto">
                          {filingContent.extractedSections.riskFactors}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {filingContent.extractedSections.businessOverview && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Business Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 bg-blue-50 rounded text-xs max-h-32 overflow-y-auto">
                          {filingContent.extractedSections.businessOverview}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : selectedFiling ? (
              <div className="text-center p-8 text-gray-500">
                No content extracted for selected filing
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                Select a filing above to extract content
              </div>
            )}
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Integration Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">📊 Smart Analysis</h4>
                      <p className="text-sm text-gray-600">
                        AI automatically extracts and analyzes key sections from SEC filings and earnings transcripts.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">🔗 Cross-Referencing</h4>
                      <p className="text-sm text-gray-600">
                        Links financial data with management commentary and regulatory disclosures for complete context.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">📈 Trend Analysis</h4>
                      <p className="text-sm text-gray-600">
                        Tracks changes in guidance, risks, and strategic initiatives across multiple quarters.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">🎯 Specific Citations</h4>
                      <p className="text-sm text-gray-600">
                        Provides exact quotes and references from filings and transcripts to support analysis.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">💡 How it Works</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Extract structured content from SEC filings and earnings transcripts</li>
                      <li>Process and analyze text for key insights, guidance, and risks</li>
                      <li>Feed analyzed content to AI for intelligent cross-referencing</li>
                      <li>Generate comprehensive answers with specific document citations</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}