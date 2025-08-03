# Figma MCP Integration Setup Guide

This guide will help you set up Figma MCP (Model Context Protocol) integration with your FinHub application.

## Prerequisites

- Node.js 18+ installed
- A Figma account with access to design files
- Cursor IDE (for MCP integration)

## Step 1: Install Figma MCP Server

The Figma MCP server is already installed globally. If you need to reinstall:

```bash
npm install -g @sethdouglasford/mcp-figma
```

## Step 2: Get Your Figma Access Token

1. Go to [Figma Settings](https://www.figma.com/settings)
2. Navigate to "Personal access tokens"
3. Click "Create new token"
4. Give it a descriptive name (e.g., "FinHub MCP Integration")
5. Copy the token (you won't be able to see it again)

## Step 3: Configure Environment Variables

Add your Figma access token to your environment:

### Option A: .env.local file
Create or update your `.env.local` file:

```bash
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
```

### Option B: System Environment Variable
Add to your shell profile (~/.zshrc for zsh):

```bash
export FIGMA_ACCESS_TOKEN="your_figma_access_token_here"
```

Then reload your shell:
```bash
source ~/.zshrc
```

## Step 4: Configure MCP in Cursor

### Option A: Using mcp.json (Recommended)
The `mcp.json` file is already created in your project root. Update it with your token:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["@sethdouglasford/mcp-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_actual_token_here"
      }
    }
  }
}
```

### Option B: Cursor Settings
1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Search for "MCP" or "Model Context Protocol"
3. Add the Figma server configuration

## Step 5: Get Your Figma File Key

1. Open your Figma file in the browser
2. The file key is in the URL: `https://www.figma.com/file/FILE_KEY_HERE/...`
3. Copy the FILE_KEY part

## Step 6: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Visit the demo page: `http://localhost:3000/figma-demo`

3. Enter a component name and click "Fetch Design"

## Available Features

### 1. Design Data Fetching
- Retrieve components, styles, and design tokens
- Access component specifications and properties
- Get design system information

### 2. Asset Export
- Export images, icons, and other assets
- Download assets in various formats (PNG, SVG, etc.)
- Batch export multiple assets

### 3. Real-time Sync
- Keep components in sync with Figma updates
- Automatically update design tokens
- Maintain design consistency

## API Endpoints

### GET /api/figma-design
Fetch design data for a specific component.

**Query Parameters:**
- `component` (required): Component name to fetch
- `fileKey` (optional): Figma file key

**Example:**
```bash
curl "http://localhost:3000/api/figma-design?component=button&fileKey=your_file_key"
```

### POST /api/figma-design
Perform actions on Figma files.

**Body:**
```json
{
  "fileKey": "your_file_key",
  "nodeIds": ["node_id_1", "node_id_2"],
  "action": "exportAssets"
}
```

**Available Actions:**
- `getDesignData`: Fetch design data
- `getDesignTokens`: Get design tokens
- `exportAssets`: Export assets

## Usage in Components

```tsx
import { FigmaDesignViewer } from '@/components/ui/figma-design-viewer';

export function MyComponent() {
  return (
    <FigmaDesignViewer 
      defaultComponent="button"
      fileKey="your_figma_file_key"
    />
  );
}
```

## Troubleshooting

### Common Issues

1. **"Figma access token not configured"**
   - Make sure your `FIGMA_ACCESS_TOKEN` is set in environment variables
   - Check that the token is valid and has proper permissions

2. **"Failed to fetch design data"**
   - Verify your Figma file key is correct
   - Ensure the component name exists in your Figma file
   - Check that your token has access to the file

3. **MCP server not starting**
   - Reinstall the MCP server: `npm install -g @sethdouglasford/mcp-figma`
   - Check that Node.js version is 18+
   - Verify network connectivity

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=mcp:* npm run dev
```

## Security Considerations

1. **Token Security**: Never commit your Figma access token to version control
2. **File Access**: Only grant access to files that your application needs
3. **Rate Limiting**: Be mindful of Figma API rate limits
4. **Environment Variables**: Use `.env.local` for local development and proper environment variables for production

## Production Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Ensure the MCP server is available in your deployment environment
3. Configure proper CORS settings if needed
4. Set up monitoring for API usage and errors

## Additional Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review the server logs
3. Verify your Figma token permissions
4. Test with a simple component first

---

**Note**: This integration is designed to work with the FinHub application and follows the established patterns and styling conventions of the project. 