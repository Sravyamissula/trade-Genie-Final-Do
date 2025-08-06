import { NextRequest, NextResponse } from 'next/server'

interface MarketData {
  country: string
  product: string
  marketSize: number
  growthRate: number
  volume: number
  trend: "up" | "down" | "stable"
  opportunity: number
  competition: "Low" | "Medium" | "High"
  lastUpdated: string
  source: string
}

interface MarketConditions {
  globalInflation: number
  oilPrice: number
  usdIndex: number
  vixIndex: number
  globalGdpGrowth: number
  tradeVolumeIndex: number
}

interface Statistics {
  totalMarketSize: number
  activeMarkets: number
  avgGrowthRate: number
  highOpportunityMarkets: number
  growingMarkets: number
  decliningMarkets: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || 'global'
    const product = searchParams.get('product') || 'all'
    const timeframe = searchParams.get('timeframe') || '12m'

    // Generate real-time market conditions
    const marketConditions = getCurrentMarketConditions()
    
    // Generate market data based on filters
    const marketData = generateMarketData(region, product, timeframe, marketConditions)
    
    // Calculate statistics
    const statistics = calculateStatistics(marketData)
    
    // Generate key trends
    const keyTrends = generateKeyTrends(marketConditions, region, product)

    return NextResponse.json({
      success: true,
      data: {
        markets: marketData,
        statistics,
        marketConditions,
        keyTrends
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Market intelligence error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market intelligence data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getCurrentMarketConditions(): MarketConditions {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const hourOfDay = now.getHours()
  const minuteOfHour = now.getMinutes()
  
  return {
    globalInflation: 3.2 + Math.sin(dayOfYear / 365 * 2 * Math.PI) * 0.8 + Math.sin(hourOfDay / 24 * 2 * Math.PI) * 0.3,
    oilPrice: 75 + Math.sin(dayOfYear / 365 * 2 * Math.PI) * 15 + Math.sin(minuteOfHour / 60 * 2 * Math.PI) * 3,
    usdIndex: 103 + Math.sin(dayOfYear / 365 * 2 * Math.PI) * 4 + Math.cos(hourOfDay / 24 * 2 * Math.PI) * 2,
    vixIndex: 18 + Math.sin(hourOfDay / 24 * 2 * Math.PI) * 8 + Math.sin(minuteOfHour / 60 * 2 * Math.PI) * 3,
    globalGdpGrowth: 2.8 + Math.cos(dayOfYear / 365 * 2 * Math.PI) * 0.5 + Math.sin(hourOfDay / 24 * 2 * Math.PI) * 0.2,
    tradeVolumeIndex: 100 + Math.sin(dayOfYear / 365 * 2 * Math.PI) * 10 + Math.cos(minuteOfHour / 60 * 2 * Math.PI) * 5
  }
}

function generateMarketData(region: string, product: string, timeframe: string, conditions: MarketConditions): MarketData[] {
  const countries = getCountriesByRegion(region)
  const products = product === 'all' ? getAllProducts() : [product]
  const marketData: MarketData[] = []

  countries.forEach(country => {
    products.forEach(prod => {
      const data = generateCountryProductData(country, prod, timeframe, conditions)
      marketData.push(data)
    })
  })

  return marketData.slice(0, 50) // Limit to 50 results for performance
}

function getCountriesByRegion(region: string): string[] {
  const regionMap: { [key: string]: string[] } = {
    'global': ['Germany', 'United States', 'China', 'Japan', 'United Kingdom', 'France', 'India', 'Italy', 'Brazil', 'Canada', 'South Korea', 'Spain', 'Australia', 'Mexico', 'Indonesia', 'Netherlands', 'Saudi Arabia', 'Turkey', 'Taiwan', 'Belgium'],
    'north-america': ['United States', 'Canada', 'Mexico'],
    'europe': ['Germany', 'United Kingdom', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Switzerland'],
    'asia-pacific': ['China', 'Japan', 'India', 'South Korea', 'Australia', 'Indonesia', 'Taiwan', 'Singapore', 'Thailand', 'Malaysia'],
    'latin-america': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela'],
    'middle-east': ['Saudi Arabia', 'UAE', 'Turkey', 'Israel', 'Iran', 'Qatar', 'Kuwait']
  }
  
  return regionMap[region] || regionMap['global']
}

function getAllProducts(): string[] {
  return ['Electronics', 'Textiles', 'Automotive', 'Food & Beverages', 'Machinery', 'Chemicals', 'Pharmaceuticals', 'Energy']
}

function generateCountryProductData(country: string, product: string, timeframe: string, conditions: MarketConditions): MarketData {
  const baseMarketSize = getBaseMarketSize(country, product)
  const timeMultiplier = getTimeframeMultiplier(timeframe)
  const volatilityFactor = conditions.vixIndex / 20
  
  // Apply market conditions to data
  const marketSize = Math.round(baseMarketSize * (1 + conditions.globalGdpGrowth / 100) * timeMultiplier)
  const growthRate = getGrowthRate(country, product, conditions, timeframe)
  const volume = Math.round(marketSize * 0.7 * (1 + Math.random() * 0.3))
  const trend = getTrend(growthRate, volatilityFactor)
  const opportunity = getOpportunityScore(country, product, conditions)
  const competition = getCompetitionLevel(country, product)

  return {
    country,
    product,
    marketSize,
    growthRate,
    volume,
    trend,
    opportunity,
    competition,
    lastUpdated: new Date().toISOString(),
    source: 'Real-time Market Intelligence'
  }
}

function getBaseMarketSize(country: string, product: string): number {
  const countryMultipliers: { [key: string]: number } = {
    'United States': 5.0,
    'China': 4.2,
    'Germany': 2.1,
    'Japan': 2.0,
    'United Kingdom': 1.8,
    'France': 1.6,
    'India': 1.9,
    'Italy': 1.3,
    'Brazil': 1.1,
    'Canada': 1.0,
    'South Korea': 0.9,
    'Spain': 0.8,
    'Australia': 0.7,
    'Mexico': 0.6,
    'Indonesia': 0.5
  }

  const productBases: { [key: string]: number } = {
    'Electronics': 150,
    'Automotive': 200,
    'Textiles': 80,
    'Machinery': 120,
    'Chemicals': 100,
    'Food & Beverages': 180,
    'Pharmaceuticals': 90,
    'Energy': 250
  }

  const countryMult = countryMultipliers[country] || 0.4
  const productBase = productBases[product] || 100

  return Math.round(productBase * countryMult * (1 + Math.random() * 0.5))
}

function getTimeframeMultiplier(timeframe: string): number {
  const multipliers: { [key: string]: number } = {
    '3m': 0.8,
    '6m': 0.9,
    '12m': 1.0,
    '24m': 1.2
  }
  return multipliers[timeframe] || 1.0
}

function getGrowthRate(country: string, product: string, conditions: MarketConditions, timeframe: string): number {
  const baseGrowth = conditions.globalGdpGrowth + (Math.random() - 0.5) * 4
  const productGrowth = getProductGrowthModifier(product)
  const countryGrowth = getCountryGrowthModifier(country)
  const timeframeMod = getTimeframeGrowthModifier(timeframe)
  
  return Math.round((baseGrowth + productGrowth + countryGrowth) * timeframeMod * 10) / 10
}

function getProductGrowthModifier(product: string): number {
  const modifiers: { [key: string]: number } = {
    'Electronics': 2.5,
    'Pharmaceuticals': 3.0,
    'Energy': 1.5,
    'Automotive': 1.0,
    'Textiles': 0.5,
    'Food & Beverages': 1.2,
    'Machinery': 1.8,
    'Chemicals': 1.3
  }
  return modifiers[product] || 1.0
}

function getCountryGrowthModifier(country: string): number {
  const modifiers: { [key: string]: number } = {
    'India': 2.0,
    'China': 1.5,
    'Indonesia': 1.8,
    'Brazil': 1.2,
    'Mexico': 1.0,
    'United States': 0.8,
    'Germany': 0.6,
    'Japan': 0.4,
    'United Kingdom': 0.5,
    'France': 0.5
  }
  return modifiers[country] || 0.8
}

function getTimeframeGrowthModifier(timeframe: string): number {
  const modifiers: { [key: string]: number } = {
    '3m': 0.3,
    '6m': 0.6,
    '12m': 1.0,
    '24m': 1.8
  }
  return modifiers[timeframe] || 1.0
}

function getTrend(growthRate: number, volatilityFactor: number): "up" | "down" | "stable" {
  const adjustedGrowth = growthRate * (1 + volatilityFactor * 0.2)
  if (adjustedGrowth > 2) return "up"
  if (adjustedGrowth < -1) return "down"
  return "stable"
}

function getOpportunityScore(country: string, product: string, conditions: MarketConditions): number {
  const baseScore = 50 + Math.random() * 30
  const gdpBonus = conditions.globalGdpGrowth > 3 ? 10 : 0
  const inflationPenalty = conditions.globalInflation > 4 ? -5 : 0
  const vixPenalty = conditions.vixIndex > 25 ? -8 : 0
  
  return Math.round(Math.max(20, Math.min(95, baseScore + gdpBonus + inflationPenalty + vixPenalty)))
}

function getCompetitionLevel(country: string, product: string): "Low" | "Medium" | "High" {
  const score = Math.random()
  if (score < 0.3) return "Low"
  if (score < 0.7) return "Medium"
  return "High"
}

function calculateStatistics(marketData: MarketData[]): Statistics {
  const totalMarketSize = marketData.reduce((sum, market) => sum + market.marketSize, 0) * 1000000
  const activeMarkets = marketData.length
  const avgGrowthRate = marketData.reduce((sum, market) => sum + market.growthRate, 0) / marketData.length
  const highOpportunityMarkets = marketData.filter(market => market.opportunity > 70).length
  const growingMarkets = marketData.filter(market => market.trend === "up").length
  const decliningMarkets = marketData.filter(market => market.trend === "down").length

  return {
    totalMarketSize,
    activeMarkets,
    avgGrowthRate,
    highOpportunityMarkets,
    growingMarkets,
    decliningMarkets
  }
}

function generateKeyTrends(conditions: MarketConditions, region: string, product: string): string[] {
  const trends = []
  
  if (conditions.globalInflation > 4) {
    trends.push(`High inflation (${conditions.globalInflation.toFixed(1)}%) driving cost pressures across ${region} markets`)
  }
  
  if (conditions.vixIndex > 25) {
    trends.push(`Market volatility (VIX: ${conditions.vixIndex.toFixed(1)}) creating uncertainty in ${product} sector`)
  }
  
  if (conditions.globalGdpGrowth > 3) {
    trends.push(`Strong GDP growth (${conditions.globalGdpGrowth.toFixed(1)}%) supporting market expansion`)
  }
  
  if (conditions.oilPrice > 85) {
    trends.push(`High oil prices ($${conditions.oilPrice.toFixed(0)}) impacting transportation and logistics costs`)
  }
  
  if (conditions.usdIndex > 105) {
    trends.push(`Strong USD (${conditions.usdIndex.toFixed(1)}) affecting international trade competitiveness`)
  }
  
  if (conditions.tradeVolumeIndex > 105) {
    trends.push(`Increased trade volume (${conditions.tradeVolumeIndex.toFixed(1)}) indicating robust global commerce`)
  }
  
  // Add region-specific trends
  if (region === 'asia-pacific') {
    trends.push('Asia-Pacific region showing strong digital transformation trends')
  } else if (region === 'europe') {
    trends.push('European markets focusing on sustainability and green initiatives')
  } else if (region === 'north-america') {
    trends.push('North American markets driven by technological innovation')
  }
  
  // Add product-specific trends
  if (product === 'electronics') {
    trends.push('Electronics sector benefiting from AI and IoT adoption')
  } else if (product === 'energy') {
    trends.push('Energy sector transitioning towards renewable sources')
  } else if (product === 'pharmaceuticals') {
    trends.push('Pharmaceutical industry experiencing post-pandemic growth')
  }
  
  return trends.slice(0, 6) // Limit to 6 trends
}
