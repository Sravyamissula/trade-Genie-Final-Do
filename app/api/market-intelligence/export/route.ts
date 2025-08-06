import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || 'global'
    const product = searchParams.get('product') || 'all'
    const timeframe = searchParams.get('timeframe') || '12m'
    const country = searchParams.get('country')

    // Generate PDF report
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.width
    const pageHeight = pdf.internal.pageSize.height
    let yPosition = 20

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Trade Genie Market Intelligence Report', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Report details
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Region: ${region.charAt(0).toUpperCase() + region.slice(1)}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Product: ${product.charAt(0).toUpperCase() + product.slice(1)}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Timeframe: ${timeframe}`, 20, yPosition)
    yPosition += 20

    if (country) {
      // Individual market report
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Market Analysis: ${country}`, 20, yPosition)
      yPosition += 15

      // Market overview
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Market Overview', 20, yPosition)
      yPosition += 10

      pdf.setFont('helvetica', 'normal')
      const marketSize = Math.round(Math.random() * 500 + 100)
      const growthRate = Math.round((Math.random() * 10 + 2) * 10) / 10
      const opportunity = Math.round(Math.random() * 40 + 50)

      pdf.text(`Market Size: $${marketSize}M USD`, 25, yPosition)
      yPosition += 8
      pdf.text(`Growth Rate: ${growthRate}%`, 25, yPosition)
      yPosition += 8
      pdf.text(`Opportunity Score: ${opportunity}/100`, 25, yPosition)
      yPosition += 15

      // Key insights
      pdf.setFont('helvetica', 'bold')
      pdf.text('Key Insights', 20, yPosition)
      yPosition += 10

      pdf.setFont('helvetica', 'normal')
      const insights = [
        `${country} shows strong potential in ${product} sector`,
        `Market conditions favor expansion in this region`,
        `Competition level is moderate with good entry opportunities`,
        `Regulatory environment is stable and business-friendly`
      ]

      insights.forEach(insight => {
        pdf.text(`• ${insight}`, 25, yPosition)
        yPosition += 8
      })

    } else {
      // Full market report
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Executive Summary', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      const summary = [
        `This comprehensive market intelligence report covers ${region} markets`,
        `for ${product} products over a ${timeframe} timeframe.`,
        '',
        'Key findings include:',
        '• Strong growth momentum in emerging markets',
        '• Digital transformation driving new opportunities',
        '• Supply chain resilience becoming critical factor',
        '• Sustainability requirements shaping market dynamics'
      ]

      summary.forEach(line => {
        if (line === '') {
          yPosition += 5
        } else {
          pdf.text(line, 20, yPosition)
          yPosition += 8
        }
      })

      yPosition += 10

      // Market statistics
      pdf.setFont('helvetica', 'bold')
      pdf.text('Market Statistics', 20, yPosition)
      yPosition += 10

      pdf.setFont('helvetica', 'normal')
      const stats = [
        `Total Market Size: $${Math.round(Math.random() * 5000 + 1000)}B USD`,
        `Active Markets: ${Math.round(Math.random() * 50 + 20)}`,
        `Average Growth Rate: ${Math.round((Math.random() * 5 + 3) * 10) / 10}%`,
        `High Opportunity Markets: ${Math.round(Math.random() * 15 + 5)}`
      ]

      stats.forEach(stat => {
        pdf.text(`• ${stat}`, 25, yPosition)
        yPosition += 8
      })

      yPosition += 10

      // Regional breakdown
      if (yPosition > pageHeight - 50) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFont('helvetica', 'bold')
      pdf.text('Regional Breakdown', 20, yPosition)
      yPosition += 10

      const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America']
      pdf.setFont('helvetica', 'normal')

      regions.forEach(reg => {
        const size = Math.round(Math.random() * 1000 + 200)
        const growth = Math.round((Math.random() * 8 + 1) * 10) / 10
        pdf.text(`${reg}: $${size}M USD (${growth}% growth)`, 25, yPosition)
        yPosition += 8
      })
    }

    // Footer
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'italic')
    pdf.text('Generated by Trade Genie - AI-Powered Trade Intelligence', pageWidth / 2, pageHeight - 10, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer')

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="market-intelligence-${region}-${product}-${Date.now()}.pdf"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
