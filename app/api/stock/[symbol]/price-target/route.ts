import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    // Placeholder - price target data not yet implemented
    return NextResponse.json({ priceTarget: null });
  } catch (error) {
    console.error('Price target API error:', error);
    return NextResponse.json(
      { error: 'Price target data not available' },
      { status: 501 }
    );
  }
} 