import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    // Placeholder - analyst ratings data not yet implemented
    return NextResponse.json({ ratings: null });
  } catch (error) {
    console.error('Analyst ratings API error:', error);
    return NextResponse.json(
      { error: 'Analyst ratings data not available' },
      { status: 501 }
    );
  }
} 