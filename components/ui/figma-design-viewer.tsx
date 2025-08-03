'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Download, Eye, Code } from 'lucide-react';

interface FigmaDesignData {
  fileKey: string;
  nodeId?: string;
  designTokens?: any;
  components?: any[];
  styles?: any[];
}

interface FigmaDesignViewerProps {
  defaultComponent?: string;
  fileKey?: string;
}

export function FigmaDesignViewer({ defaultComponent = '', fileKey }: FigmaDesignViewerProps) {
  const [componentName, setComponentName] = useState(defaultComponent);
  const [designData, setDesignData] = useState<FigmaDesignData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDesignData = async () => {
    if (!componentName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        component: componentName,
        ...(fileKey && { fileKey })
      });

      const response = await fetch(`/api/figma-design?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch design data');
      }

      setDesignData(data.designData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const exportAssets = async (nodeIds: string[]) => {
    if (!fileKey) return;

    setLoading(true);
    try {
      const response = await fetch('/api/figma-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey,
          nodeIds,
          action: 'exportAssets'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to export assets');
      }

      // Handle the exported assets (download, display, etc.)
      console.log('Exported assets:', data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export assets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Figma Design Viewer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="component-name">Component Name</Label>
              <Input
                id="component-name"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="Enter component name..."
                onKeyPress={(e) => e.key === 'Enter' && fetchDesignData()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchDesignData} 
                disabled={loading || !componentName.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Fetch Design
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {designData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Design Data</span>
              <Badge variant="secondary">
                {designData.components?.length || 0} components
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {designData.components && designData.components.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Components</h4>
                <div className="space-y-2">
                  {designData.components.map((component: any, index: number) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{component.name}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportAssets([component.id])}
                            disabled={loading}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Code className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {component.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {component.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {designData.designTokens && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Design Tokens</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(designData.designTokens, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {designData.styles && designData.styles.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Styles</h4>
                  <div className="space-y-2">
                    {designData.styles.map((style: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{style.name}</span>
                        <Badge variant="outline">{style.styleType}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 