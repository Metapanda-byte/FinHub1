import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  try {
    // Placeholder - institutional ownership data not yet implemented
    return NextResponse.json({ ownership: [] });
  } catch (error) {
    console.error('Institutional ownership API error:', error);
    return NextResponse.json(
      { error: 'Institutional ownership data not available' },
      { status: 501 }
    );
  }
} 