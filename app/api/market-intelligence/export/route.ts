import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { marketData, statistics, marketConditions, keyTrends, filters } = body

    if (!marketData || !statistics) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Create PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Market Intelligence Report', margin, 30)

    // Subtitle
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`Region: ${filters.region} | Product: ${filters.product} | Timeframe: ${filters.timeframe}`, margin, 45)
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 55)

    // Market Overview
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Market Overview', margin, 75)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Market Size: $${(statistics.totalMarketSize / 1000000000).toFixed(1)}B`, margin, 90)
    doc.text(`Active Markets: ${statistics.activeMarkets}`, margin, 100)
    doc.text(`Average Growth Rate: ${statistics.avgGrowthRate.toFixed(1)}%`, margin, 110)
    doc.text(`High Opportunity Markets: ${statistics.highOpportunityMarkets}`, margin, 120)

    // Market Conditions
    if (marketConditions) {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Current Market Conditions', margin, 140)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Global Inflation: ${marketConditions.globalInflation.toFixed(1)}%`, margin, 155)
      doc.text(`Oil Price: $${marketConditions.oilPrice.toFixed(0)}`, margin, 165)
      doc.text(`USD Index: ${marketConditions.usdIndex.toFixed(1)}`, margin, 175)
      doc.text(`VIX Index: ${marketConditions.vixIndex.toFixed(1)}`, margin, 185)
      doc.text(`Global GDP Growth: ${marketConditions.globalGdpGrowth.toFixed(1)}%`, margin, 195)
    }

    // Key Trends
    if (keyTrends && keyTrends.length > 0) {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Key Market Trends', margin, 215)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      let yPos = 225
      keyTrends.forEach((trend: string, index: number) => {
        const lines = doc.splitTextToSize(`• ${trend}`, pageWidth - 2 * margin)
        doc.text(lines, margin, yPos)
        yPos += lines.length * 5
      })
    }

    // Add new page for market data
    doc.addPage()
    
    // Market Data Table
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Top Market Opportunities', margin, 30)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // Table headers
    let yPos = 50
    doc.text('Country', margin, yPos)
    doc.text('Product', margin + 40, yPos)
    doc.text('Market Size', margin + 80, yPos)
    doc.text('Growth Rate', margin + 120, yPos)
    doc.text('Opportunity', margin + 160, yPos)
    
    yPos += 10
    
    // Table data (top 20 markets)
    const topMarkets = marketData
      .sort((a: any, b: any) => b.opportunity - a.opportunity)
      .slice(0, 20)
    
    topMarkets.forEach((market: any) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 30
      }
      
      doc.text(market.country.substring(0, 12), margin, yPos)
      doc.text(market.product.substring(0, 12), margin + 40, yPos)
      doc.text(`$${market.marketSize}M`, margin + 80, yPos)
      doc.text(`${market.growthRate.toFixed(1)}%`, margin + 120, yPos)
      doc.text(`${market.opportunity}%`, margin + 160, yPos)
      
      yPos += 8
    })

    // Generate PDF as base64
    const pdfBase64 = doc.output('datauristring')
    const filename = `market-intelligence-${filters.region}-${filters.product}-${Date.now()}.pdf`

    return NextResponse.json({
      success: true,
      data: {
        pdf: pdfBase64,
        filename: filename
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate market intelligence report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
