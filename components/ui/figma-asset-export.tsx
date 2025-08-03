'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Image, FileText } from 'lucide-react';

interface AssetExportProps {
  fileKey: string;
}

export function FigmaAssetExport({ fileKey }: AssetExportProps) {
  const [nodeIds, setNodeIds] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'jpg'>('png');
  const [loading, setLoading] = useState(false);
  const [exportedAssets, setExportedAssets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const exportAssets = async () => {
    if (!nodeIds.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const nodeIdArray = nodeIds.split(',').map(id => id.trim());
      
      const response = await fetch('/api/figma-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey,
          nodeIds: nodeIdArray,
          action: 'exportAssets',
          format: exportFormat
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to export assets');
      }

      setExportedAssets(data.result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsset = (asset: any) => {
    if (asset.url) {
      const a = document.createElement('a');
      a.href = asset.url;
      a.download = asset.name || `asset-${Date.now()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Asset Export
          {exportedAssets.length > 0 && (
            <Badge variant="secondary">
              {exportedAssets.length} assets
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="node-ids">Node IDs (comma-separated)</Label>
            <Input
              id="node-ids"
              value={nodeIds}
              onChange={(e) => setNodeIds(e.target.value)}
              placeholder="e.g., 1:2, 3:4, 5:6"
            />
          </div>

          <div>
            <Label htmlFor="export-format">Export Format</Label>
            <select
              id="export-format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'png' | 'svg' | 'jpg')}
              className="w-full p-2 border rounded-md"
            >
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
              <option value="jpg">JPG</option>
            </select>
          </div>

          <Button 
            onClick={exportAssets}
            disabled={loading || !nodeIds.trim()}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export Assets
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {exportedAssets.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Exported Assets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportedAssets.map((asset, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{asset.name || `Asset ${index + 1}`}</span>
                    <Badge variant="outline" className="text-xs">
                      {exportFormat.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {asset.url && (
                    <div className="space-y-2">
                      {exportFormat === 'svg' ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs">SVG File</span>
                        </div>
                      ) : (
                        <img 
                          src={asset.url} 
                          alt={asset.name}
                          className="w-full h-20 object-cover rounded border"
                        />
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadAsset(asset)}
                        className="w-full"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 