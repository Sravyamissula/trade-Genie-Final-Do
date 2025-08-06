import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const product = searchParams.get('product')

    // Generate real-time market data
    const marketData = generateRealTimeMarketData(region, product)

    return NextResponse.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString(),
      totalMarkets: marketData.length
    })

  } catch (error) {
    console.error('Market Intelligence API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch market intelligence data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

function generateRealTimeMarketData(region?: string | null, product?: string | null) {
  const now = Date.now()
  const minuteOfDay = Math.floor((now / 1000 / 60) % 1440)
  const secondOfMinute = Math.floor((now / 1000) % 60)

  // All countries with regional classification
  const allCountries = [
    // North America
    { name: 'United States', region: 'North America', multiplier: 1.0, gdpGrowth: 2.1 },
    { name: 'Canada', region: 'North America', multiplier: 0.12, gdpGrowth: 1.8 },
    { name: 'Mexico', region: 'North America', multiplier: 0.15, gdpGrowth: 3.2 },

    // Europe
    { name: 'Germany', region: 'Europe', multiplier: 0.45, gdpGrowth: 1.4 },
    { name: 'United Kingdom', region: 'Europe', multiplier: 0.32, gdpGrowth: 1.2 },
    { name: 'France', region: 'Europe', multiplier: 0.28, gdpGrowth: 1.3 },
    { name: 'Italy', region: 'Europe', multiplier: 0.22, gdpGrowth: 0.9 },
    { name: 'Spain', region: 'Europe', multiplier: 0.18, gdpGrowth: 2.4 },
    { name: 'Netherlands', region: 'Europe', multiplier: 0.11, gdpGrowth: 1.7 },
    { name: 'Belgium', region: 'Europe', multiplier: 0.06, gdpGrowth: 1.5 },
    { name: 'Switzerland', region: 'Europe', multiplier: 0.09, gdpGrowth: 1.1 },
    { name: 'Austria', region: 'Europe', multiplier: 0.05, gdpGrowth: 1.6 },
    { name: 'Poland', region: 'Europe', multiplier: 0.08, gdpGrowth: 4.1 },
    { name: 'Ireland', region: 'Europe', multiplier: 0.05, gdpGrowth: 5.2 },
    { name: 'Finland', region: 'Europe', multiplier: 0.03, gdpGrowth: 1.3 },
    { name: 'Romania', region: 'Europe', multiplier: 0.03, gdpGrowth: 4.8 },
    { name: 'Czech Republic', region: 'Europe', multiplier: 0.03, gdpGrowth: 2.9 },
    { name: 'Greece', region: 'Europe', multiplier: 0.02, gdpGrowth: 2.1 },
    { name: 'Portugal', region: 'Europe', multiplier: 0.03, gdpGrowth: 2.7 },
    { name: 'Hungary', region: 'Europe', multiplier: 0.02, gdpGrowth: 3.4 },
    { name: 'Slovakia', region: 'Europe', multiplier: 0.01, gdpGrowth: 3.1 },
    { name: 'Croatia', region: 'Europe', multiplier: 0.01, gdpGrowth: 2.8 },
    { name: 'Slovenia', region: 'Europe', multiplier: 0.01, gdpGrowth: 2.3 },
    { name: 'Ukraine', region: 'Europe', multiplier: 0.02, gdpGrowth: -6.4 },

    // Asia Pacific
    { name: 'China', region: 'Asia Pacific', multiplier: 0.85, gdpGrowth: 5.2 },
    { name: 'Japan', region: 'Asia Pacific', multiplier: 0.42, gdpGrowth: 1.0 },
    { name: 'South Korea', region: 'Asia Pacific', multiplier: 0.19, gdpGrowth: 2.6 },
    { name: 'India', region: 'Asia Pacific', multiplier: 0.38, gdpGrowth: 6.1 },
    { name: 'Indonesia', region: 'Asia Pacific', multiplier: 0.14, gdpGrowth: 5.0 },
    { name: 'Taiwan', region: 'Asia Pacific', multiplier: 0.08, gdpGrowth: 2.9 },
    { name: 'Australia', region: 'Asia Pacific', multiplier: 0.16, gdpGrowth: 1.9 },
    { name: 'Thailand', region: 'Asia Pacific', multiplier: 0.06, gdpGrowth: 3.4 },
    { name: 'Bangladesh', region: 'Asia Pacific', multiplier: 0.05, gdpGrowth: 5.8 },
    { name: 'Vietnam', region: 'Asia Pacific', multiplier: 0.04, gdpGrowth: 6.8 },
    { name: 'Philippines', region: 'Asia Pacific', multiplier: 0.04, gdpGrowth: 5.5 },
    { name: 'New Zealand', region: 'Asia Pacific', multiplier: 0.03, gdpGrowth: 2.1 },

    // Latin America
    { name: 'Brazil', region: 'Latin America', multiplier: 0.21, gdpGrowth: 2.9 },
    { name: 'Argentina', region: 'Latin America', multiplier: 0.05, gdpGrowth: -2.5 },
    { name: 'Chile', region: 'Latin America', multiplier: 0.04, gdpGrowth: 2.3 },
    { name: 'Peru', region: 'Latin America', multiplier: 0.03, gdpGrowth: 2.7 },

    // Middle East & Africa
    { name: 'Saudi Arabia', region: 'Middle East & Africa', multiplier: 0.08, gdpGrowth: 3.7 },
    { name: 'Turkey', region: 'Middle East & Africa', multiplier: 0.09, gdpGrowth: 4.5 },
    { name: 'Israel', region: 'Middle East & Africa', multiplier: 0.05, gdpGrowth: 3.1 },
    { name: 'Qatar', region: 'Middle East & Africa', multiplier: 0.02, gdpGrowth: 2.4 },
    { name: 'Kuwait', region: 'Middle East & Africa', multiplier: 0.02, gdpGrowth: 2.6 },
    { name: 'Nigeria', region: 'Middle East & Africa', multiplier: 0.05, gdpGrowth: 3.2 },
    { name: 'Egypt', region: 'Middle East & Africa', multiplier: 0.05, gdpGrowth: 4.2 },
    { name: 'Morocco', region: 'Middle East & Africa', multiplier: 0.01, gdpGrowth: 3.1 },
    { name: 'Kenya', region: 'Middle East & Africa', multiplier: 0.01, gdpGrowth: 5.4 },
    { name: 'Ethiopia', region: 'Middle East & Africa', multiplier: 0.01, gdpGrowth: 8.1 },
    { name: 'Ghana', region: 'Middle East & Africa', multiplier: 0.01, gdpGrowth: 4.8 }
  ]

  // Product categories with growth bonuses
  const productCategories = [
    { name: 'Electronics', growthBonus: 5.2 },
    { name: 'Software', growthBonus: 8.2 },
    { name: 'Pharmaceuticals', growthBonus: 6.8 },
    { name: 'Automotive', growthBonus: 3.1 },
    { name: 'Energy', growthBonus: 4.5 },
    { name: 'Agriculture', growthBonus: 2.8 },
    { name: 'Textiles', growthBonus: 2.1 },
    { name: 'Machinery', growthBonus: 4.2 },
    { name: 'Chemicals', growthBonus: 3.8 },
    { name: 'Food & Beverages', growthBonus: 3.2 },
    { name: 'Metals', growthBonus: 2.9 },
    { name: 'Telecommunications', growthBonus: 7.1 },
    { name: 'Construction', growthBonus: 3.5 },
    { name: 'Mining', growthBonus: 2.4 },
    { name: 'Forestry', growthBonus: 1.8 }
  ]

  // Filter countries by region if specified
  let countries = region && region !== 'All' 
    ? allCountries.filter(c => c.region === region)
    : allCountries

  // Generate market data for each country-product combination
  const marketData = []

  for (const country of countries) {
    for (const productCat of productCategories) {
      // Skip if specific product filter doesn't match
      if (product && product !== 'All' && productCat.name !== product) {
        continue
      }

      // Create unique seed for this country-product combination
      const seed = country.name.length + productCat.name.length + minuteOfDay + secondOfMinute

      // Calculate dynamic market size (changes every second)
      const baseSize = 50 + (Math.sin(seed / 100) * 30)
      const timeVariation = Math.sin((now / 10000) + seed) * 20
      const marketSize = Math.max(10, (baseSize + timeVariation) * country.multiplier)

      // Calculate dynamic growth rate
      const baseGrowth = country.gdpGrowth + productCat.growthBonus
      const growthVariation = Math.sin((now / 15000) + seed) * 2
      const growthRate = Math.max(-5, Math.min(15, baseGrowth + growthVariation))

      // Calculate market conditions
      const volatility = Math.abs(Math.sin((now / 8000) + seed)) * 100
      const opportunity = Math.max(20, 60 + Math.sin((now / 12000) + seed) * 40)

      // Determine market maturity
      let maturity = 'Growing'
      if (marketSize > 100) maturity = 'Mature'
      else if (marketSize < 30) maturity = 'Emerging'

      marketData.push({
        id: `${country.name}-${productCat.name}`.replace(/\s+/g, '-').toLowerCase(),
        country: country.name,
        region: country.region,
        product: productCat.name,
        marketSize: Math.round(marketSize * 10) / 10,
        growthRate: Math.round(growthRate * 10) / 10,
        opportunity: Math.round(opportunity),
        volatility: Math.round(volatility),
        maturity,
        lastUpdated: new Date().toISOString(),
        trends: {
          demand: Math.round((50 + Math.sin((now / 20000) + seed) * 30)),
          competition: Math.round((40 + Math.sin((now / 18000) + seed) * 25)),
          regulation: Math.round((30 + Math.sin((now / 22000) + seed) * 20))
        }
      })
    }
  }

  // Sort by market size descending
  return marketData.sort((a, b) => b.marketSize - a.marketSize)
}
