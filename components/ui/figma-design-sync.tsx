'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, RefreshCw, Palette } from 'lucide-react';

interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'typography' | 'spacing' | 'borderRadius';
}

interface FigmaDesignSyncProps {
  fileKey: string;
  onTokensUpdate?: (tokens: DesignToken[]) => void;
}

export function FigmaDesignSync({ fileKey, onTokensUpdate }: FigmaDesignSyncProps) {
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchDesignTokens = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/figma-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey,
          action: 'getDesignTokens'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch design tokens');
      }

      // Transform Figma data to design tokens
      const designTokens = transformFigmaDataToTokens(data.result);
      setTokens(designTokens);
      setLastSync(new Date());
      
      if (onTokensUpdate) {
        onTokensUpdate(designTokens);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const transformFigmaDataToTokens = (figmaData: any): DesignToken[] => {
    const tokens: DesignToken[] = [];
    
    // Extract colors
    if (figmaData.colors) {
      Object.entries(figmaData.colors).forEach(([name, value]) => {
        tokens.push({
          name: `color-${name}`,
          value: value as string,
          type: 'color'
        });
      });
    }

    // Extract typography
    if (figmaData.typography) {
      Object.entries(figmaData.typography).forEach(([name, value]) => {
        tokens.push({
          name: `font-${name}`,
          value: JSON.stringify(value),
          type: 'typography'
        });
      });
    }

    return tokens;
  };

  const exportTokensToCSS = () => {
    const cssVariables = tokens.map(token => {
      const cssName = `--${token.name}`;
      return `${cssName}: ${token.value};`;
    }).join('\n');

    const cssContent = `:root {\n${cssVariables}\n}`;
    
    // Create and download CSS file
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finhub-design-tokens.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (fileKey) {
      fetchDesignTokens();
    }
  }, [fileKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Figma Design Sync
          <Badge variant="secondary">
            {tokens.length} tokens
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={fetchDesignTokens} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync from Figma
          </Button>
          
          <Button 
            onClick={exportTokensToCSS}
            variant="outline"
            disabled={tokens.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSS
          </Button>
        </div>

        {lastSync && (
          <p className="text-sm text-muted-foreground">
            Last synced: {lastSync.toLocaleString()}
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {tokens.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Design Tokens</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tokens.map((token, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{token.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {token.type}
                    </Badge>
                  </div>
                  <div className="mt-1">
                    {token.type === 'color' ? (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: token.value }}
                        />
                        <code className="text-xs">{token.value}</code>
                      </div>
                    ) : (
                      <code className="text-xs">{token.value}</code>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 