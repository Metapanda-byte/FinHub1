import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const search = searchParams.get("search") || "";

  try {
    let query = supabase
      .from('stock_peers')
      .select('*')
      .order('updated_at', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`symbol.ilike.%${search}%,name.ilike.%${search}%,sector.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: competitors, error } = await query;

    if (error) {
      console.error("Error fetching competitors:", error);
      return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
    }

    // Also get total count for pagination
    let countQuery = supabase
      .from('stock_peers')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`symbol.ilike.%${search}%,name.ilike.%${search}%,sector.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      competitors: competitors || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error("Error in manage API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { symbol, name, peers, sector, industry } = await request.json();

    if (!symbol || !name || !Array.isArray(peers)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('stock_peers')
      .upsert({
        symbol: symbol.toUpperCase(),
        name,
        peers,
        sector: sector || null,
        industry: industry || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating/updating competitor:", error);
      return NextResponse.json({ error: "Failed to save competitor data" }, { status: 500 });
    }

    return NextResponse.json({ competitor: data });

  } catch (error) {
    console.error("Error in manage POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('stock_peers')
      .delete()
      .eq('symbol', symbol.toUpperCase());

    if (error) {
      console.error("Error deleting competitor:", error);
      return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
    }

    return NextResponse.json({ message: "Competitor deleted successfully" });

  } catch (error) {
    console.error("Error in manage DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 