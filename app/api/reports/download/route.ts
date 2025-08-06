import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, analysis } = body

    if (type !== 'risk-analysis' || !analysis) {
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
    doc.text('Risk Analysis Report', margin, 30)

    // Subtitle
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`${analysis.country} - ${analysis.product}`, margin, 45)
    doc.text(`Generated: ${new Date(analysis.lastUpdated).toLocaleString()}`, margin, 55)

    // Overall Risk
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Overall Risk Assessment', margin, 75)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Risk Score: ${analysis.overallRisk}% (${analysis.riskLevel})`, margin, 90)
    doc.text(`Export Value: $${analysis.exportValue.toLocaleString()}`, margin, 100)
    doc.text(`Timeline: ${analysis.timeline}`, margin, 110)
    doc.text(`Tariff Rate: ${analysis.tariffRate}`, margin, 120)
    doc.text(`Market Size: ${analysis.marketSize}`, margin, 130)

    // Risk Breakdown
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Risk Breakdown', margin, 150)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Political Risk: ${analysis.politicalRisk}%`, margin, 165)
    doc.text(`Economic Risk: ${analysis.economicRisk}%`, margin, 175)
    doc.text(`Compliance Risk: ${analysis.complianceRisk}%`, margin, 185)
    doc.text(`Market Risk: ${analysis.marketRisk}%`, margin, 195)

    // Opportunities
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Opportunities', margin, 215)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    let yPos = 225
    analysis.opportunities.forEach((opportunity: string, index: number) => {
      const lines = doc.splitTextToSize(`• ${opportunity}`, pageWidth - 2 * margin)
      doc.text(lines, margin, yPos)
      yPos += lines.length * 5
    })

    // Warnings
    yPos += 10
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Warnings', margin, yPos)
    
    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    analysis.warnings.forEach((warning: string, index: number) => {
      const lines = doc.splitTextToSize(`• ${warning}`, pageWidth - 2 * margin)
      doc.text(lines, margin, yPos)
      yPos += lines.length * 5
    })

    // Generate PDF as base64
    const pdfBase64 = doc.output('datauristring')
    const filename = `risk-analysis-${analysis.country.toLowerCase()}-${analysis.product.toLowerCase()}-${Date.now()}.pdf`

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
        error: 'Failed to generate PDF report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
