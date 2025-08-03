import { FigmaDesignViewer } from '@/components/ui/figma-design-viewer';
import { FigmaDesignSync } from '@/components/ui/figma-design-sync';
import { FigmaAssetExport } from '@/components/ui/figma-asset-export';

export default function FigmaDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Figma MCP Integration Demo</h1>
        <p className="text-muted-foreground">
          This demo showcases the integration between FinHub and Figma using Model Context Protocol (MCP).
          You can fetch design data, components, and assets directly from your Figma files.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">How to Use</h2>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <strong>1.</strong> Get your Figma access token from{' '}
              <a href="https://www.figma.com/settings" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Figma Settings
              </a>
            </p>
            <p className="text-sm">
              <strong>2.</strong> Add your token to your environment variables:
            </p>
            <code className="block bg-background p-2 rounded text-xs">
              FIGMA_ACCESS_TOKEN=your_token_here
            </code>
            <p className="text-sm">
              <strong>3.</strong> Enter a component name and click &quot;Fetch Design&quot; to retrieve design data
            </p>
          </div>
        </div>

        <FigmaDesignViewer 
          defaultComponent="button"
          fileKey="your_figma_file_key_here"
        />

        <FigmaDesignSync 
          fileKey="your_figma_file_key_here"
        />

        <FigmaAssetExport 
          fileKey="your_figma_file_key_here"
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Design Data Fetching</h3>
              <p className="text-sm text-muted-foreground">
                Retrieve components, styles, and design tokens from your Figma files
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Asset Export</h3>
              <p className="text-sm text-muted-foreground">
                Export images, icons, and other assets directly from Figma
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Real-time Sync</h3>
              <p className="text-sm text-muted-foreground">
                Keep your FinHub components in sync with Figma design updates
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Integration Benefits</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Maintain design consistency across your FinHub application</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Automatically sync design tokens and component specifications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Export assets for use in your React components</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Bridge the gap between design and development workflows</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 