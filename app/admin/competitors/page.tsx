"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Download, Upload, Search, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface CompetitorRecord {
  symbol: string;
  name: string;
  peers: string[];
  sector: string;
  industry: string;
  updated_at: string;
}

interface BatchResult {
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

export default function CompetitorAdminPage() {
  const [competitors, setCompetitors] = useState<CompetitorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchProgress, setBatchProgress] = useState<BatchResult | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing competitor data
  const loadCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/competitors/manage');
      if (!response.ok) throw new Error('Failed to load competitors');
      const data = await response.json();
      setCompetitors(data.competitors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Bulk populate competitors
  const handleBulkPopulate = async (limit: number = 1000) => {
    setBatchLoading(true);
    setBatchProgress(null);
    setError(null);

    try {
      // First, get the list of companies
      const companiesResponse = await fetch(`/api/competitors/batch?limit=${limit}`);
      if (!companiesResponse.ok) throw new Error('Failed to fetch company list');
      const { symbols } = await companiesResponse.json();

      // Then process them in batches
      const batchResponse = await fetch('/api/competitors/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols, batchSize: 25 })
      });

      if (!batchResponse.ok) throw new Error('Batch processing failed');
      const result = await batchResponse.json();
      setBatchProgress(result.results);
      
      // Reload the competitors list
      await loadCompetitors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk populate failed');
    } finally {
      setBatchLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, []);

  const filteredCompetitors = competitors.filter(comp =>
    comp.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitor Database Admin</h1>
          <p className="text-muted-foreground">Manage competitor relationships for stock analysis</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {competitors.length} Companies
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manage">Manage Data</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{competitors.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Peers per Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {competitors.length > 0 
                    ? (competitors.reduce((sum, comp) => sum + comp.peers.length, 0) / competitors.length).toFixed(1)
                    : '0'
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unique Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(competitors.map(comp => comp.sector).filter(Boolean)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>Most recently updated competitor relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {competitors
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .slice(0, 5)
                  .map((comp) => (
                    <div key={comp.symbol} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <span className="font-medium">{comp.symbol}</span>
                        <span className="text-muted-foreground ml-2">{comp.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {comp.peers.length} peers • {new Date(comp.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Search & Browse</CardTitle>
              <CardDescription>Search and view competitor relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by symbol, name, sector, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={loadCompetitors} variant="outline" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Peers</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompetitors.slice(0, 50).map((comp) => (
                      <TableRow key={comp.symbol}>
                        <TableCell className="font-medium">{comp.symbol}</TableCell>
                        <TableCell>{comp.name}</TableCell>
                        <TableCell>{comp.sector || 'N/A'}</TableCell>
                        <TableCell>{comp.industry || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {comp.peers.slice(0, 3).map((peer) => (
                              <Badge key={peer} variant="outline" className="text-xs">
                                {peer}
                              </Badge>
                            ))}
                            {comp.peers.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{comp.peers.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(comp.updated_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredCompetitors.length > 50 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing first 50 of {filteredCompetitors.length} results
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Population</CardTitle>
                <CardDescription>
                  Automatically populate competitor data for top companies using FMP API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleBulkPopulate(100)}
                    disabled={batchLoading}
                    className="w-full"
                  >
                    {batchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Populate Top 100 Companies
                  </Button>
                  <Button 
                    onClick={() => handleBulkPopulate(1000)}
                    disabled={batchLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {batchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Populate Top 1,000 Companies
                  </Button>
                  <Button 
                    onClick={() => handleBulkPopulate(10000)}
                    disabled={batchLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {batchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Populate Top 10,000 Companies
                  </Button>
                </div>

                {batchProgress && (
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium">Last Batch Results</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        {batchProgress.successful} successful
                      </div>
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        {batchProgress.failed} failed
                      </div>
                      <div className="text-muted-foreground">
                        {batchProgress.processed} total
                      </div>
                    </div>
                    <Progress 
                      value={(batchProgress.successful / batchProgress.processed) * 100} 
                      className="h-2"
                    />
                    {batchProgress.errors.length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-red-600">
                          View errors ({batchProgress.errors.length})
                        </summary>
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          {batchProgress.errors.slice(0, 10).map((error, i) => (
                            <div key={i} className="text-red-600">{error}</div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Operations</CardTitle>
                <CardDescription>
                  Export data or run custom operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    For large-scale operations (10,000+ companies), consider using the command-line script:
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block mt-2">
                    node scripts/populate-competitors.js --limit=10000
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 