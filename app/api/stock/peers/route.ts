import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    // Fetch peer data from the database
    const { data, error } = await supabase
      .from('stock_peers')
      .select('peers')
      .eq('symbol', symbol)
      .single();

    if (error) {
      console.error("Error fetching peer data:", error);
      return NextResponse.json({ error: "Failed to fetch peer data" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "No peer data found for symbol" }, { status: 404 });
    }

    // Return the peers array
    return NextResponse.json({ peers: data.peers });
  } catch (error) {
    console.error("Error in peers API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 