import { NextRequest, NextResponse } from 'next/server'
import { getRealTimeDataService } from '@/lib/real-time-data-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country, product, filters, realTime = false } = body

    console.log('Risk analysis request:', { country, product, filters, realTime })

    const realTimeService = getRealTimeDataService()

    // Get real-time data
    const economicData = realTimeService.getEconomicData()
    const marketData = realTimeService.getMarketData()
    const newsData = realTimeService.getNewsData()
    const riskData = realTimeService.getRiskData()

    // Calculate risk scores based on various factors
    const politicalRisk = calculatePoliticalRisk(country, newsData)
    const economicRisk = calculateEconomicRisk(economicData, country)
    const currencyRisk = calculateCurrencyRisk(economicData, country)
    const operationalRisk = calculateOperationalRisk(country, product)

    // Calculate overall risk score
    const overallRisk = Math.round(
      (politicalRisk * 0.3 + economicRisk * 0.3 + currencyRisk * 0.2 + operationalRisk * 0.2)
    )

    // Determine risk level
    const riskLevel = overallRisk >= 75 ? "Critical" : 
                     overallRisk >= 60 ? "High" : 
                     overallRisk >= 40 ? "Medium" : "Low"

    // Generate comprehensive analysis
    const analysis = {
      summary: {
        overallRisk,
        riskLevel,
        keyFactors: generateKeyFactors(country, product, { politicalRisk, economicRisk, currencyRisk, operationalRisk }),
        recommendations: generateRecommendations(overallRisk, country, product),
        warnings: generateWarnings(country, product, newsData),
        opportunities: generateOpportunities(country, product, marketData)
      },
      countryRisks: generateCountryRisks(country, riskData),
      sectorAnalysis: generateSectorAnalysis(product, marketData),
      timeline: generateTimeline(country, product, newsData)
    }

    const response = {
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
      source: realTime ? 'real-time' : 'historical'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Risk analysis error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform risk analysis",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country") || "Global"
    const product = searchParams.get("product") || "General"

    // Return basic risk data for GET requests
    const basicRiskData = {
      success: true,
      data: {
        summary: {
          overallRisk: 55,
          riskLevel: "Medium",
          keyFactors: [
            "Market volatility",
            "Regulatory changes",
            "Currency fluctuations"
          ],
          recommendations: [
            "Monitor market conditions",
            "Diversify risk exposure",
            "Consider hedging strategies"
          ],
          warnings: [
            "Potential policy changes",
            "Economic uncertainty"
          ],
          opportunities: [
            "Growing market demand",
            "New trade partnerships"
          ]
        },
        countryRisks: [
          {
            country,
            overallRisk: 55,
            politicalRisk: 45,
            economicRisk: 60,
            operationalRisk: 50,
            factors: [
              {
                category: "Political",
                level: "Medium",
                score: 45,
                description: "Moderate political stability",
                impact: "Potential policy changes",
                mitigation: "Monitor political developments"
              }
            ],
            lastUpdated: new Date().toISOString()
          }
        ],
        sectorAnalysis: [
          {
            sector: product,
            risk: 55,
            trend: "stable",
            factors: ["Market conditions", "Regulatory environment"]
          }
        ],
        timeline: [
          {
            date: new Date().toISOString(),
            event: "Risk assessment updated",
            impact: "Moderate",
            riskChange: 0
          }
        ]
      },
      timestamp: new Date().toISOString(),
      source: 'basic'
    }

    return NextResponse.json(basicRiskData)

  } catch (error) {
    console.error("Risk analysis GET error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch risk analysis data",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Helper functions
function calculatePoliticalRisk(country: string, newsData: any[]): number {
  const baseRisk = getCountryPoliticalBaseScore(country)
  const newsImpact = newsData.filter(news => 
    news.title?.toLowerCase().includes(country?.toLowerCase() || '') ||
    news.summary?.toLowerCase().includes(country?.toLowerCase() || '')
  ).length * 5

  return Math.min(100, baseRisk + newsImpact)
}

function calculateEconomicRisk(economicData: any, country: string): number {
  const baseRisk = getCountryEconomicBaseScore(country)
  const inflationImpact = (economicData.inflation?.global || 3) > 5 ? 10 : 0
  const gdpImpact = (economicData.globalGDP?.growth || 3) < 2 ? 15 : 0

  return Math.min(100, baseRisk + inflationImpact + gdpImpact)
}

function calculateCurrencyRisk(economicData: any, country: string): number {
  const baseRisk = getCountryCurrencyBaseScore(country)
  const exchangeRateVolatility = Math.random() * 20 // Simulate volatility
  
  return Math.min(100, baseRisk + exchangeRateVolatility)
}

function calculateOperationalRisk(country: string, product: string): number {
  const countryRisk = getCountryOperationalBaseScore(country)
  const productRisk = getProductOperationalRisk(product)
  
  return Math.min(100, (countryRisk + productRisk) / 2)
}

function generateKeyFactors(country: string, product: string, risks: any): string[] {
  const factors = []
  
  if (risks.politicalRisk > 60) factors.push("High political instability")
  if (risks.economicRisk > 60) factors.push("Economic volatility concerns")
  if (risks.currencyRisk > 60) factors.push("Currency fluctuation risks")
  if (risks.operationalRisk > 60) factors.push("Operational challenges")
  
  if (factors.length === 0) {
    factors.push("Moderate market conditions", "Standard regulatory environment", "Normal operational risks")
  }
  
  return factors
}

function generateRecommendations(overallRisk: number, country: string, product: string): string[] {
  const recommendations = []
  
  if (overallRisk > 75) {
    recommendations.push("Consider postponing or restructuring operations")
    recommendations.push("Implement comprehensive risk management")
    recommendations.push("Secure political risk insurance")
  } else if (overallRisk > 50) {
    recommendations.push("Enhanced due diligence required")
    recommendations.push("Consider risk mitigation strategies")
    recommendations.push("Monitor market conditions closely")
  } else {
    recommendations.push("Standard risk monitoring procedures")
    recommendations.push("Regular market assessment")
    recommendations.push("Maintain operational flexibility")
  }
  
  return recommendations
}

function generateWarnings(country: string, product: string, newsData: any[]): string[] {
  const warnings = []
  
  const relevantNews = newsData.filter(news => 
    news.sentiment < 0 && (
      news.title?.toLowerCase().includes(country?.toLowerCase() || '') ||
      news.countries?.includes(country)
    )
  )
  
  if (relevantNews.length > 0) {
    warnings.push("Negative market sentiment detected")
  }
  
  warnings.push("Monitor regulatory changes")
  warnings.push("Currency volatility possible")
  
  return warnings
}

function generateOpportunities(country: string, product: string, marketData: any[]): string[] {
  const opportunities = []
  
  const relevantMarkets = marketData.filter(market => 
    market.country === country || market.product === product
  )
  
  if (relevantMarkets.some(market => market.growthRate > 5)) {
    opportunities.push("High growth market potential")
  }
  
  opportunities.push("Emerging market opportunities")
  opportunities.push("Potential for strategic partnerships")
  
  return opportunities
}

function generateCountryRisks(country: string, riskData: any[]): any[] {
  const countryRisk = riskData.find(risk => risk.country === country) || {
    country: country || "Unknown",
    politicalRisk: 45,
    economicRisk: 50,
    currencyRisk: 40,
    overallRisk: 45
  }

  return [{
    country: countryRisk.country,
    overallRisk: countryRisk.overallRisk,
    politicalRisk: countryRisk.politicalRisk,
    economicRisk: countryRisk.economicRisk,
    operationalRisk: (countryRisk.politicalRisk + countryRisk.economicRisk) / 2,
    factors: [
      {
        category: "Political",
        level: countryRisk.politicalRisk > 60 ? "High" : countryRisk.politicalRisk > 40 ? "Medium" : "Low",
        score: countryRisk.politicalRisk,
        description: "Political stability assessment",
        impact: "May affect trade policies and regulations",
        mitigation: "Monitor political developments and maintain government relations"
      },
      {
        category: "Economic",
        level: countryRisk.economicRisk > 60 ? "High" : countryRisk.economicRisk > 40 ? "Medium" : "Low",
        score: countryRisk.economicRisk,
        description: "Economic stability and growth prospects",
        impact: "Affects market demand and purchasing power",
        mitigation: "Diversify market exposure and monitor economic indicators"
      }
    ],
    lastUpdated: new Date().toISOString()
  }]
}

function generateSectorAnalysis(product: string, marketData: any[]): any[] {
  const sectorData = marketData.filter(market => market.product === product)
  
  if (sectorData.length === 0) {
    return [{
      sector: product || "General",
      risk: 50,
      trend: "stable",
      factors: ["Market conditions", "Regulatory environment", "Competition levels"]
    }]
  }
  
  return sectorData.slice(0, 3).map(sector => ({
    sector: sector.product,
    risk: Math.min(100, Math.max(0, 100 - sector.growthRate * 10)),
    trend: sector.growthRate > 5 ? "up" : sector.growthRate < 2 ? "down" : "stable",
    factors: [
      `Market size: $${(sector.marketSize / 1000000).toFixed(0)}M`,
      `Growth rate: ${sector.growthRate}%`,
      "Competitive landscape"
    ]
  }))
}

function generateTimeline(country: string, product: string, newsData: any[]): any[] {
  const relevantNews = newsData.filter(news => 
    news.title?.toLowerCase().includes(country?.toLowerCase() || '') ||
    news.countries?.includes(country)
  ).slice(0, 5)
  
  const timeline = relevantNews.map(news => ({
    date: news.publishedAt || new Date().toISOString(),
    event: news.title,
    impact: news.impact || "Moderate",
    riskChange: Math.round((news.sentiment || 0) * 10)
  }))
  
  if (timeline.length === 0) {
    timeline.push({
      date: new Date().toISOString(),
      event: "Risk assessment completed",
      impact: "Low",
      riskChange: 0
    })
  }
  
  return timeline
}

// Base score functions
function getCountryPoliticalBaseScore(country: string): number {
  const scores: { [key: string]: number } = {
    'united states': 30,
    'germany': 20,
    'japan': 25,
    'united kingdom': 35,
    'france': 25,
    'canada': 20,
    'australia': 25,
    'china': 60,
    'india': 45,
    'brazil': 55,
    'russia': 75,
    'turkey': 65,
    'mexico': 50,
    'south korea': 35
  }
  return scores[country?.toLowerCase()] || 45
}

function getCountryEconomicBaseScore(country: string): number {
  const scores: { [key: string]: number } = {
    'united states': 25,
    'germany': 20,
    'japan': 30,
    'united kingdom': 30,
    'france': 25,
    'canada': 25,
    'australia': 30,
    'china': 40,
    'india': 50,
    'brazil': 60,
    'russia': 70,
    'turkey': 65,
    'mexico': 45,
    'south korea': 35
  }
  return scores[country?.toLowerCase()] || 45
}

function getCountryCurrencyBaseScore(country: string): number {
  const scores: { [key: string]: number } = {
    'united states': 15,
    'germany': 20,
    'japan': 25,
    'united kingdom': 30,
    'france': 20,
    'canada': 25,
    'australia': 35,
    'china': 45,
    'india': 50,
    'brazil': 65,
    'russia': 75,
    'turkey': 70,
    'mexico': 55,
    'south korea': 40
  }
  return scores[country?.toLowerCase()] || 45
}

function getCountryOperationalBaseScore(country: string): number {
  const scores: { [key: string]: number } = {
    'united states': 20,
    'germany': 15,
    'japan': 20,
    'united kingdom': 25,
    'france': 20,
    'canada': 20,
    'australia': 25,
    'china': 45,
    'india': 55,
    'brazil': 50,
    'russia': 65,
    'turkey': 60,
    'mexico': 45,
    'south korea': 30
  }
  return scores[country?.toLowerCase()] || 40
}

function getProductOperationalRisk(product: string): number {
  const risks: { [key: string]: number } = {
    'electronics': 40,
    'textiles': 30,
    'automotive': 50,
    'machinery': 45,
    'chemicals': 55,
    'food & beverages': 35,
    'pharmaceuticals': 60,
    'energy': 65,
    'metals': 40,
    'agriculture': 35
  }
  return risks[product?.toLowerCase()] || 40
}
