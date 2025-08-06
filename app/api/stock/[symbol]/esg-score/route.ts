import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    // Placeholder - ESG score data not yet implemented
    return NextResponse.json({ esgScore: null });
  } catch (error) {
    console.error('ESG score API error:', error);
    return NextResponse.json(
      { error: 'ESG score data not available' },
      { status: 501 }
    );
  }
} 