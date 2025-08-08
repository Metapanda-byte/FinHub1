import { NextRequest, NextResponse } from 'next/server';

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  xAxis: string[];
  yAxis: {
    label: string;
    data: number[];
  }[];
  colors?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, financialData, symbol } = await req.json();

    if (!prompt || !financialData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract financial data for chart generation
    const incomeStatements = financialData.incomeStatements || [];
    const balanceSheets = financialData.balanceSheets || [];
    const stockPrices = financialData.stockPrices || [];
    const revenueSegments = financialData.revenueSegments || [];
    const geographicRevenue = financialData.geographicRevenue || [];

    // Generate chart based on the prompt
    let chartData: ChartData | null = null;

    if (prompt.toLowerCase().includes('revenue') || prompt.toLowerCase().includes('sales')) {
      if (incomeStatements.length > 0) {
        const revenueData = incomeStatements.slice(0, 5).map((stmt: any) => ({
          year: new Date(stmt.date).getFullYear(),
          revenue: stmt.revenue / 1e9 // Convert to billions
        }));

        chartData = {
          type: 'bar',
          title: `${symbol} Revenue Trend (Billions USD)`,
          xAxis: revenueData.map((d: any) => d.year.toString()),
          yAxis: [{
            label: 'Revenue (Billions USD)',
            data: revenueData.map((d: any) => d.revenue)
          }],
          colors: ['#3b82f6']
        };
      }
    } else if (prompt.toLowerCase().includes('profit') || prompt.toLowerCase().includes('margin')) {
      if (incomeStatements.length > 0) {
        const profitData = incomeStatements.slice(0, 5).map((stmt: any) => ({
          year: new Date(stmt.date).getFullYear(),
          operatingIncome: stmt.operatingIncome / 1e9,
          netIncome: stmt.netIncome / 1e9
        }));

        chartData = {
          type: 'line',
          title: `${symbol} Profitability Trend (Billions USD)`,
          xAxis: profitData.map((d: any) => d.year.toString()),
          yAxis: [
            {
              label: 'Operating Income (Billions USD)',
              data: profitData.map((d: any) => d.operatingIncome)
            },
            {
              label: 'Net Income (Billions USD)',
              data: profitData.map((d: any) => d.netIncome)
            }
          ],
          colors: ['#10b981', '#ef4444']
        };
      }
    } else if (prompt.toLowerCase().includes('segment') || prompt.toLowerCase().includes('business')) {
      if (revenueSegments.length > 0) {
        const segmentData = revenueSegments.slice(0, 6);
        
        chartData = {
          type: 'pie',
          title: `${symbol} Revenue by Segment`,
          xAxis: segmentData.map((s: any) => s.segment),
          yAxis: [{
            label: 'Revenue (Billions USD)',
            data: segmentData.map((s: any) => s.value / 1e9)
          }],
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
        };
      }
    } else if (prompt.toLowerCase().includes('geographic') || prompt.toLowerCase().includes('region')) {
      if (geographicRevenue.length > 0) {
        const geoData = geographicRevenue.slice(0, 5);
        
        chartData = {
          type: 'bar',
          title: `${symbol} Revenue by Geography`,
          xAxis: geoData.map((g: any) => g.region),
          yAxis: [{
            label: 'Revenue (Billions USD)',
            data: geoData.map((g: any) => g.value / 1e9)
          }],
          colors: ['#8b5cf6']
        };
      }
    } else if (prompt.toLowerCase().includes('stock') || prompt.toLowerCase().includes('price')) {
      if (stockPrices.length > 0) {
        const priceData = stockPrices.slice(-30); // Last 30 days
        
        chartData = {
          type: 'line',
          title: `${symbol} Stock Price (Last 30 Days)`,
          xAxis: priceData.map((p: any) => new Date(p.date).toLocaleDateString()),
          yAxis: [{
            label: 'Stock Price (USD)',
            data: priceData.map((p: any) => p.price)
          }],
          colors: ['#10b981']
        };
      }
    } else if (prompt.toLowerCase().includes('balance') || prompt.toLowerCase().includes('asset')) {
      if (balanceSheets.length > 0) {
        const balanceData = balanceSheets.slice(0, 5).map((stmt: any) => ({
          year: new Date(stmt.date).getFullYear(),
          totalAssets: stmt.totalAssets / 1e9,
          totalLiabilities: stmt.totalLiabilities / 1e9
        }));

        chartData = {
          type: 'area',
          title: `${symbol} Balance Sheet Trend (Billions USD)`,
          xAxis: balanceData.map((d: any) => d.year.toString()),
          yAxis: [
            {
              label: 'Total Assets (Billions USD)',
              data: balanceData.map((d: any) => d.totalAssets)
            },
            {
              label: 'Total Liabilities (Billions USD)',
              data: balanceData.map((d: any) => d.totalLiabilities)
            }
          ],
          colors: ['#3b82f6', '#ef4444']
        };
      }
    }

    if (!chartData) {
      return NextResponse.json({
        error: 'Unable to generate chart for this request. Try asking about revenue, profit, segments, geography, stock price, or balance sheet.'
      });
    }

    return NextResponse.json({ chartData });
  } catch (error) {
    console.error('Chart generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate chart' },
      { status: 500 }
    );
  }
} 