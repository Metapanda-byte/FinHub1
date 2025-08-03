import { NextRequest, NextResponse } from 'next/server';
import { getFigmaDesignForComponent } from '@/lib/figma-mcp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const componentName = searchParams.get('component');
    const fileKey = searchParams.get('fileKey');

    if (!componentName) {
      return NextResponse.json(
        { error: 'Component name is required' },
        { status: 400 }
      );
    }

    if (!process.env.FIGMA_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Figma access token not configured' },
        { status: 500 }
      );
    }

    const designData = await getFigmaDesignForComponent(componentName);

    return NextResponse.json({
      success: true,
      component: componentName,
      designData
    });

  } catch (error) {
    console.error('[Figma Design API Error]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch design data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileKey, nodeIds, action } = await request.json();

    if (!process.env.FIGMA_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Figma access token not configured' },
        { status: 500 }
      );
    }

    // Import the client dynamically to avoid issues
    const { FigmaMCPClient } = await import('@/lib/figma-mcp');
    const client = new FigmaMCPClient(process.env.FIGMA_ACCESS_TOKEN);
    await client.initialize();

    let result;
    switch (action) {
      case 'getDesignData':
        result = await client.getDesignData(fileKey);
        break;
      case 'getDesignTokens':
        result = await client.getDesignTokens(fileKey);
        break;
      case 'exportAssets':
        result = await client.exportAssets(fileKey, nodeIds);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    client.disconnect();

    return NextResponse.json({
      success: true,
      action,
      result
    });

  } catch (error) {
    console.error('[Figma Design API Error]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process Figma request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 