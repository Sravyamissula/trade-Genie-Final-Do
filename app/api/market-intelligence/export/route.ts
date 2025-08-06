import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const region = searchParams.get('region') || 'global';
    const product = searchParams.get('product') || 'all';

    // Generate comprehensive market intelligence report
    const reportData = generateMarketReport(region, product);

    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="market-intelligence-${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      report: reportData,
      metadata: {
        generated_at: new Date().toISOString(),
        format,
        region,
        product,
        total_records: reportData.market_data.length
      }
    });

  } catch (error) {
    console.error('Market intelligence export error:', error);
    
    return NextResponse.json({
      error: 'Failed to export market intelligence data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateMarketReport(region: string, product: string) {
  return {
    executive_summary: {
      total_market_size: '$2.5T',
      growth_rate: '4.2%',
      key_trends: ['Digital transformation', 'Sustainability focus', 'Supply chain resilience'],
      top_opportunities: ['Emerging markets', 'Green technology', 'E-commerce expansion']
    },
    market_data: [
      {
        region: region === 'global' ? 'North America' : region,
        product_category: product === 'all' ? 'Electronics' : product,
        market_size_usd: 450000000000,
        growth_rate_percent: 5.2,
        opportunity_score: 8.5,
        competition_level: 'High',
        market_trend: 'Growing'
      }
    ],
    risk_analysis: {
      political_risk: 'Medium',
      economic_risk: 'Low',
      currency_risk: 'Medium',
      overall_risk_score: 6.2
    },
    recommendations: [
      'Focus on digital channels for market entry',
      'Establish local partnerships in key regions',
      'Invest in sustainable product development',
      'Monitor regulatory changes closely'
    ]
  };
}

function convertToCSV(data: any): string {
  const headers = ['Region', 'Product', 'Market Size (USD)', 'Growth Rate (%)', 'Opportunity Score', 'Competition Level', 'Trend'];
  const rows = data.market_data.map((item: any) => [
    item.region,
    item.product_category,
    item.market_size_usd,
    item.growth_rate_percent,
    item.opportunity_score,
    item.competition_level,
    item.market_trend
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
