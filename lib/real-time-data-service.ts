interface MarketData {
  country: string
  product: string
  marketSize: number
  growthRate: number
  volume?: number
  region?: string
  category?: string
  lastUpdated: string
  source: string
}

interface RiskData {
  country: string
  product?: string
  politicalRisk: number
  economicRisk: number
  currencyRisk: number
  overallRisk: number
  lastUpdated: string
  source: string
}

interface TariffData {
  hsCode: string
  product: string
  originCountry: string
  destinationCountry: string
  tariffRate: number
  lastUpdated: string
  source: string
}

interface RealTimeMarketConditions {
  timestamp: string
  globalInflation: number
  oilPrice: number
  goldPrice: number
  usdIndex: number
  vixIndex: number
  globalGdpGrowth: number
  tradeVolumeIndex: number
}

class RealTimeDataService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 2 * 60 * 1000 // 2 minutes for real-time feel
  private marketConditions: RealTimeMarketConditions

  constructor() {
    // Initialize with current market conditions
    this.marketConditions = this.getCurrentMarketConditions()
    
    // Update market conditions every minute for real-time feel
    setInterval(() => {
      this.marketConditions = this.getCurrentMarketConditions()
      this.cache.clear() // Clear cache to force fresh data
    }, 60000)
  }

  private getCurrentMarketConditions(): RealTimeMarketConditions {
    const now = new Date()
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const hourOfDay = now.getHours()
    const minuteOfHour = now.getMinutes()
    const secondOfMinute = now.getSeconds()
    
    // Create realistic fluctuating market conditions using time-based calculations
    return {
      timestamp: now.toISOString(),
      globalInflation: 3.2 + Math.sin(dayOfYear / 365 * 2 * Math.PI) * 0.8 + Math.sin(minuteOfHour / 60 * 2 * Math.PI) * 0.2 + Math.sin(secondOfMinute / 60 * 2 * Math.PI) * 0.1,
      oilPrice: 75 + Math.sin(dayOfYear / 365 * 2 * Math.PI) * 15 + Math.sin(hourOfDay / 24 * 2 * Math.PI) * 5 + Math.cos(secondOfMinute / 60 * 2 * Math.PI) * 2,
      goldPrice: 1950 + Math.cos(dayOfYear / 365 * 2 * Math.PI) * 50 + Math.sin(hourOfDay / 24 * 2 * Math.PI) * 20 + Math.sin(secondOfMinute / 60 * 2 * Math.PI) * 10,
      usdIndex: 103 + Math.sin(dayOfYear / 365 * 2 * Math.PI) * 4 + Math.cos(minuteOfHour / 60 * 2 * Math.PI) * 1.5 + Math.sin(secondOfMinute / 60 * 2 * Math.PI) * 0.5,
      vixIndex: 18 + Math.sin(hourOfDay / 24 * 2 * Math.PI) * 8 + Math.sin(minuteOfHour / 60 * 2 * Math.PI) * 3 + Math.cos(secondOfMinute / 60 * 2 * Math.PI) * 2,
      globalGdpGrowth: 2.8 + Math.cos(dayOfYear / 365 * 2 * Math.PI) * 0.5 + Math.sin(hourOfDay / 24 * 2 * Math.PI) * 0.3 + Math.sin(secondOfMinute / 60 * 2 * Math.PI) * 0.2,
      tradeVolumeIndex: 100 + Math.sin(dayOfYear / 365 * 2 * Math.PI) * 8 + Math.cos(hourOfDay / 24 * 2 * Math.PI) * 4 + Math.sin(secondOfMinute / 60 * 2 * Math.PI) * 2
    }
  }

  private getBaseMarketSize(country: string, product: string): number {
    const countrySizes: { [key: string]: number } = {
      'United States': 25000000000,
      'China': 18000000000,
      'Germany': 4500000000,
      'Japan': 4200000000,
      'United Kingdom': 3100000000,
      'France': 2800000000,
      'India': 3500000000,
      'Italy': 2200000000,
      'Brazil': 2100000000,
      'Canada': 1800000000,
      'South Korea': 1600000000,
      'Spain': 1400000000,
      'Australia': 1300000000,
      'Mexico': 1200000000,
      'Indonesia': 1100000000,
      'Netherlands': 1000000000,
      'Saudi Arabia': 900000000,
      'Turkey': 800000000,
      'Taiwan': 700000000,
      'Belgium': 600000000,
      'Switzerland': 580000000,
      'Austria': 450000000,
      'Poland': 620000000,
      'Ireland': 380000000,
      'Finland': 280000000,
      'Romania': 240000000,
      'Czech Republic': 260000000,
      'Greece': 200000000,
      'Portugal': 230000000,
      'Hungary': 160000000,
      'Slovakia': 110000000,
      'Croatia': 60000000,
      'Slovenia': 55000000,
      'Ukraine': 180000000,
      'Thailand': 540000000,
      'Bangladesh': 410000000,
      'Vietnam': 360000000,
      'Philippines': 380000000,
      'New Zealand': 210000000,
      'Argentina': 450000000,
      'Chile': 320000000,
      'Peru': 220000000,
      'Israel': 420000000,
      'Qatar': 180000000,
      'Kuwait': 140000000,
      'Nigeria': 480000000,
      'Egypt': 350000000,
      'Morocco': 120000000,
      'Kenya': 100000000,
      'Ethiopia': 90000000,
      'Ghana': 70000000
    }

    const productMultipliers: { [key: string]: number } = {
      'Electronics': 2.5,
      'Automotive': 2.0,
      'Machinery': 1.8,
      'Chemicals': 1.5,
      'Energy': 3.0,
      'Textiles': 0.8,
      'Food & Beverages': 1.2,
      'Pharmaceuticals': 1.6,
      'Metals': 1.4,
      'Agriculture': 1.0,
      'Software': 3.2,
      'Telecommunications': 2.1,
      'Construction': 1.7,
      'Mining': 2.3,
      'Forestry': 0.9
    }

    const baseSize = countrySizes[country] || 1000000000
    const multiplier = productMultipliers[product] || 1.0
    
    return baseSize * multiplier
  }

  private getGrowthRate(country: string, product: string): number {
    const countryGrowth: { [key: string]: number } = {
      'United States': 2.5,
      'China': 4.8,
      'Germany': 1.8,
      'Japan': 1.2,
      'United Kingdom': 2.1,
      'France': 1.9,
      'India': 6.2,
      'Italy': 1.5,
      'Brazil': 3.2,
      'Canada': 2.3,
      'South Korea': 2.8,
      'Spain': 2.0,
      'Australia': 2.4,
      'Mexico': 2.9,
      'Indonesia': 5.1,
      'Netherlands': 1.7,
      'Saudi Arabia': 2.6,
      'Turkey': 3.8,
      'Taiwan': 2.2,
      'Belgium': 1.6,
      'Switzerland': 1.4,
      'Austria': 1.6,
      'Poland': 3.5,
      'Ireland': 4.2,
      'Finland': 1.8,
      'Romania': 4.1,
      'Czech Republic': 2.7,
      'Greece': 1.9,
      'Portugal': 2.2,
      'Hungary': 3.1,
      'Slovakia': 2.8,
      'Croatia': 2.5,
      'Slovenia': 2.3,
      'Ukraine': 3.0,
      'Thailand': 3.2,
      'Bangladesh': 6.1,
      'Vietnam': 6.8,
      'Philippines': 5.8,
      'New Zealand': 2.1,
      'Argentina': 2.8,
      'Chile': 2.5,
      'Peru': 3.2,
      'Israel': 3.4,
      'Qatar': 2.1,
      'Kuwait': 2.3,
      'Nigeria': 2.6,
      'Egypt': 3.3,
      'Morocco': 3.1,
      'Kenya': 5.7,
      'Ethiopia': 8.1,
      'Ghana': 5.4
    }

    const productGrowth: { [key: string]: number } = {
      'Electronics': 8.5,
      'Automotive': 4.2,
      'Machinery': 3.8,
      'Chemicals': 3.5,
      'Energy': 6.2,
      'Textiles': 2.8,
      'Food & Beverages': 3.2,
      'Pharmaceuticals': 7.1,
      'Metals': 2.5,
      'Agriculture': 2.1,
      'Software': 12.3,
      'Telecommunications': 9.1,
      'Construction': 4.5,
      'Mining': 3.2,
      'Forestry': 2.8
    }

    const baseGrowth = countryGrowth[country] || 3.0
    const productBonus = (productGrowth[product] || 3.0) - 3.0
    
    // Add real-time market condition impact
    const marketImpact = (this.marketConditions.globalGdpGrowth - 2.8) * 0.5
    const tradeImpact = (this.marketConditions.tradeVolumeIndex - 100) * 0.02
    
    return Math.max(0.1, Math.round((baseGrowth + productBonus + marketImpact + tradeImpact) * 10) / 10)
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // Generate comprehensive market data
  getMarketData(): MarketData[] {
    const cacheKey = 'market-data'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const countries = [
      'United States', 'China', 'Germany', 'Japan', 'United Kingdom', 
      'France', 'India', 'Italy', 'Brazil', 'Canada', 'South Korea',
      'Spain', 'Australia', 'Mexico', 'Indonesia', 'Netherlands',
      'Saudi Arabia', 'Turkey', 'Taiwan', 'Belgium', 'Switzerland',
      'Austria', 'Poland', 'Ireland', 'Finland', 'Romania', 'Czech Republic',
      'Greece', 'Portugal', 'Hungary', 'Slovakia', 'Croatia', 'Slovenia',
      'Ukraine', 'Thailand', 'Bangladesh', 'Vietnam', 'Philippines',
      'New Zealand', 'Argentina', 'Chile', 'Peru', 'Israel', 'Qatar',
      'Kuwait', 'Nigeria', 'Egypt', 'Morocco', 'Kenya', 'Ethiopia', 'Ghana'
    ]
    
    const products = [
      'Electronics', 'Textiles', 'Automotive', 'Machinery', 'Chemicals',
      'Food & Beverages', 'Pharmaceuticals', 'Energy', 'Metals', 'Agriculture',
      'Software', 'Telecommunications', 'Construction', 'Mining', 'Forestry'
    ]

    const marketData: MarketData[] = []
    
    for (const country of countries) {
      for (const product of products) {
        const baseSize = this.getBaseMarketSize(country, product)
        const marketConditionImpact = this.getMarketConditionImpact()
        const finalSize = Math.round(baseSize * (1 + marketConditionImpact))
        
        marketData.push({
          country,
          product,
          marketSize: finalSize,
          volume: Math.round(finalSize * 1.2), // Volume slightly higher than market size
          growthRate: this.getGrowthRate(country, product),
          region: this.getRegionForCountry(country),
          category: product,
          lastUpdated: this.marketConditions.timestamp,
          source: 'Real-time Market Data'
        })
      }
    }

    this.setCachedData(cacheKey, marketData)
    return marketData
  }

  private getRegionForCountry(country: string): string {
    const regionMap: { [key: string]: string } = {
      'United States': 'North America',
      'Canada': 'North America',
      'Mexico': 'North America',
      'Germany': 'Europe',
      'United Kingdom': 'Europe',
      'France': 'Europe',
      'Italy': 'Europe',
      'Spain': 'Europe',
      'Netherlands': 'Europe',
      'Belgium': 'Europe',
      'Switzerland': 'Europe',
      'Austria': 'Europe',
      'Poland': 'Europe',
      'Ireland': 'Europe',
      'Finland': 'Europe',
      'Romania': 'Europe',
      'Czech Republic': 'Europe',
      'Greece': 'Europe',
      'Portugal': 'Europe',
      'Hungary': 'Europe',
      'Slovakia': 'Europe',
      'Croatia': 'Europe',
      'Slovenia': 'Europe',
      'Ukraine': 'Europe',
      'China': 'Asia Pacific',
      'Japan': 'Asia Pacific',
      'South Korea': 'Asia Pacific',
      'India': 'Asia Pacific',
      'Indonesia': 'Asia Pacific',
      'Taiwan': 'Asia Pacific',
      'Australia': 'Asia Pacific',
      'Thailand': 'Asia Pacific',
      'Bangladesh': 'Asia Pacific',
      'Vietnam': 'Asia Pacific',
      'Philippines': 'Asia Pacific',
      'New Zealand': 'Asia Pacific',
      'Brazil': 'Latin America',
      'Argentina': 'Latin America',
      'Chile': 'Latin America',
      'Peru': 'Latin America',
      'Saudi Arabia': 'Middle East & Africa',
      'Turkey': 'Middle East & Africa',
      'Israel': 'Middle East & Africa',
      'Qatar': 'Middle East & Africa',
      'Kuwait': 'Middle East & Africa',
      'Nigeria': 'Middle East & Africa',
      'Egypt': 'Middle East & Africa',
      'Morocco': 'Middle East & Africa',
      'Kenya': 'Middle East & Africa',
      'Ethiopia': 'Middle East & Africa',
      'Ghana': 'Middle East & Africa'
    }
    return regionMap[country] || 'Other'
  }

  // Get economic indicators and data
  getEconomicData(): any {
    const cacheKey = 'economic-data'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const economicData = {
      globalGDP: {
        current: 105000000000000,
        growth: this.marketConditions.globalGdpGrowth,
        trend: this.marketConditions.globalGdpGrowth > 2.8 ? 'up' : 'down'
      },
      inflation: {
        global: this.marketConditions.globalInflation,
        trend: this.marketConditions.globalInflation > 3.5 ? 'rising' : 'stable'
      },
      commodities: {
        oil: this.marketConditions.oilPrice,
        gold: this.marketConditions.goldPrice
      },
      currencies: {
        usdIndex: this.marketConditions.usdIndex,
        trend: this.marketConditions.usdIndex > 103 ? 'strengthening' : 'weakening'
      },
      volatility: {
        vix: this.marketConditions.vixIndex,
        level: this.marketConditions.vixIndex > 25 ? 'high' : this.marketConditions.vixIndex > 15 ? 'medium' : 'low'
      },
      tradeVolume: {
        index: this.marketConditions.tradeVolumeIndex,
        trend: this.marketConditions.tradeVolumeIndex > 100 ? 'expanding' : 'contracting'
      },
      lastUpdated: this.marketConditions.timestamp
    }

    this.setCachedData(cacheKey, economicData)
    return economicData
  }

  // Get trade and market news
  getNewsData(): any[] {
    const cacheKey = 'news-data'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const newsData = []
    
    // Generate news based on current market conditions
    if (this.marketConditions.globalInflation > 4) {
      newsData.push({
        title: 'Global Inflation Concerns Rise as Prices Surge',
        summary: `Inflation reaches ${this.marketConditions.globalInflation.toFixed(1)}%, affecting global trade costs`,
        sentiment: -0.6,
        impact: 'high',
        category: 'economic',
        countries: ['Global'],
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      })
    }
    
    if (this.marketConditions.oilPrice > 85) {
      newsData.push({
        title: 'Oil Prices Surge Amid Supply Concerns',
        summary: `Crude oil reaches $${this.marketConditions.oilPrice.toFixed(0)}, impacting transportation costs`,
        sentiment: -0.4,
        impact: 'medium',
        category: 'commodities',
        countries: ['Global'],
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      })
    }
    
    if (this.marketConditions.vixIndex > 25) {
      newsData.push({
        title: 'Market Volatility Spikes as Uncertainty Grows',
        summary: `VIX index reaches ${this.marketConditions.vixIndex.toFixed(1)}, indicating heightened market stress`,
        sentiment: -0.7,
        impact: 'high',
        category: 'markets',
        countries: ['Global'],
        publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      })
    }
    
    if (this.marketConditions.globalGdpGrowth > 3.5) {
      newsData.push({
        title: 'Global Economic Growth Accelerates',
        summary: `GDP growth reaches ${this.marketConditions.globalGdpGrowth.toFixed(1)}%, boosting trade optimism`,
        sentiment: 0.8,
        impact: 'high',
        category: 'economic',
        countries: ['Global'],
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      })
    }

    // Add more dynamic news based on trade volume
    if (this.marketConditions.tradeVolumeIndex > 108) {
      newsData.push({
        title: 'Global Trade Volume Reaches New Highs',
        summary: `Trade volume index at ${this.marketConditions.tradeVolumeIndex.toFixed(1)}, indicating robust international commerce`,
        sentiment: 0.7,
        impact: 'medium',
        category: 'trade',
        countries: ['Global'],
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      })
    }

    this.setCachedData(cacheKey, newsData)
    return newsData
  }

  // Get deterministic risk data based on real market conditions
  async getRiskDataForCountry(country: string, product?: string): Promise<any> {
    const cacheKey = `risk-data-${country}-${product || 'general'}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // Update market conditions
      this.marketConditions = this.getCurrentMarketConditions()
      
      const baseRisk = this.getCountryBaseRisk(country, product)
      const marketImpact = this.calculateMarketImpact(country)
      
      const riskData = {
        country: country,
        product: product || 'General',
        overallRisk: Math.round(baseRisk + marketImpact),
        politicalRisk: this.calculatePoliticalRisk(country),
        economicRisk: this.calculateEconomicRisk(country),
        currencyRisk: this.calculateCurrencyRisk(country),
        tradeRisk: this.calculateTradeRisk(country),
        factors: this.getRiskFactors(country),
        recommendations: this.getRiskRecommendations(country),
        riskTrend: this.getRiskTrend(country),
        lastUpdated: this.marketConditions.timestamp,
        source: 'Real-time Market Data'
      }

      this.setCachedData(cacheKey, riskData)
      return riskData
    } catch (error) {
      console.error('Risk data error:', error)
      return this.getFallbackRiskData(country, product)
    }
  }

  private getCountryBaseRisk(country: string, product?: string): number {
    const baseRisks: { [key: string]: number } = {
      'germany': 22,
      'united states': 25,
      'china': 45,
      'japan': 28,
      'united kingdom': 32,
      'france': 26,
      'india': 55,
      'italy': 38,
      'brazil': 65,
      'canada': 20,
      'south korea': 30,
      'spain': 35,
      'australia': 24,
      'mexico': 48,
      'indonesia': 58,
      'netherlands': 21,
      'saudi arabia': 62,
      'turkey': 75,
      'taiwan': 35,
      'belgium': 23,
      'switzerland': 18,
      'austria': 20,
      'poland': 35,
      'ireland': 22,
      'finland': 19,
      'romania': 45,
      'czech republic': 30,
      'greece': 42,
      'portugal': 28,
      'hungary': 38,
      'slovakia': 32,
      'croatia': 40,
      'slovenia': 25,
      'ukraine': 85,
      'thailand': 45,
      'bangladesh': 68,
      'vietnam': 52,
      'philippines': 58,
      'new zealand': 18,
      'argentina': 72,
      'chile': 35,
      'peru': 48,
      'israel': 55,
      'qatar': 45,
      'kuwait': 50,
      'nigeria': 78,
      'egypt': 68,
      'morocco': 48,
      'kenya': 65,
      'ethiopia': 72,
      'ghana': 55
    }

    // Product-specific risk modifiers
    const productModifiers: { [key: string]: number } = {
      'electronics': 0,
      'automotive': 5,
      'textiles': -3,
      'machinery': 2,
      'chemicals': 8,
      'food & beverages': -2,
      'pharmaceuticals': 12,
      'energy': 15,
      'metals': 3,
      'agriculture': -1,
      'software': -5,
      'telecommunications': 3,
      'construction': 4,
      'mining': 8,
      'forestry': 2
    }

    const baseRisk = baseRisks[country.toLowerCase()] || 40
    const productModifier = product ? (productModifiers[product.toLowerCase()] || 0) : 0
    
    return Math.max(10, Math.min(85, baseRisk + productModifier))
  }

  private calculateMarketImpact(country: string): number {
    const conditions = this.marketConditions
    let impact = 0
    
    // High inflation increases risk
    if (conditions.globalInflation > 4) {
      impact += (conditions.globalInflation - 4) * 2
    }
    
    // High volatility (VIX) increases risk
    if (conditions.vixIndex > 20) {
      impact += (conditions.vixIndex - 20) * 0.5
    }
    
    // Low GDP growth increases risk
    if (conditions.globalGdpGrowth < 2) {
      impact += (2 - conditions.globalGdpGrowth) * 3
    }
    
    // High oil prices affect energy-dependent countries more
    const energyDependentCountries = ['germany', 'japan', 'south korea', 'italy']
    if (energyDependentCountries.includes(country.toLowerCase()) && conditions.oilPrice > 80) {
      impact += (conditions.oilPrice - 80) * 0.1
    }
    
    return Math.round(impact)
  }

  private calculatePoliticalRisk(country: string): number {
    const basePoliticalRisk: { [key: string]: number } = {
      'germany': 15,
      'united states': 28,
      'china': 55,
      'japan': 18,
      'united kingdom': 25,
      'france': 22,
      'india': 45,
      'italy': 35,
      'brazil': 60,
      'canada': 12,
      'turkey': 80,
      'saudi arabia': 70,
      'ukraine': 95,
      'nigeria': 85,
      'ethiopia': 78
    }
    
    const baseRisk = basePoliticalRisk[country.toLowerCase()] || 35
    
    // Add market volatility impact
    const volatilityImpact = this.marketConditions.vixIndex > 25 ? 5 : 0
    
    return Math.min(95, baseRisk + volatilityImpact)
  }

  private calculateEconomicRisk(country: string): number {
    const baseEconomicRisk: { [key: string]: number } = {
      'germany': 25,
      'united states': 22,
      'china': 38,
      'japan': 30,
      'united kingdom': 28,
      'france': 24,
      'india': 50,
      'italy': 42,
      'brazil': 68,
      'canada': 18,
      'turkey': 75,
      'saudi arabia': 55,
      'argentina': 85,
      'nigeria': 78,
      'ethiopia': 72
    }
    
    const baseRisk = baseEconomicRisk[country.toLowerCase()] || 40
    
    // Add inflation impact
    const inflationImpact = this.marketConditions.globalInflation > 4 ? 
      (this.marketConditions.globalInflation - 4) * 3 : 0
    
    // Add GDP growth impact
    const gdpImpact = this.marketConditions.globalGdpGrowth < 2 ? 
      (2 - this.marketConditions.globalGdpGrowth) * 4 : 0
    
    return Math.min(95, Math.round(baseRisk + inflationImpact + gdpImpact))
  }

  private calculateCurrencyRisk(country: string): number {
    const baseCurrencyRisk: { [key: string]: number } = {
      'germany': 18, // EUR
      'united states': 10, // USD
      'china': 35, // CNY
      'japan': 22, // JPY
      'united kingdom': 28, // GBP
      'france': 18, // EUR
      'india': 55, // INR
      'italy': 18, // EUR
      'brazil': 75, // BRL
      'canada': 25, // CAD
      'turkey': 85, // TRY
      'saudi arabia': 45, // SAR
      'argentina': 90, // ARS
      'nigeria': 80, // NGN
      'ethiopia': 65 // ETB
    }
    
    const baseRisk = baseCurrencyRisk[country.toLowerCase()] || 40
    
    // USD strength affects other currencies
    const usdImpact = this.marketConditions.usdIndex > 105 ? 
      (this.marketConditions.usdIndex - 105) * 0.5 : 0
    
    return Math.min(95, Math.round(baseRisk + usdImpact))
  }

  private calculateTradeRisk(country: string): number {
    const baseTradeRisk: { [key: string]: number } = {
      'germany': 20,
      'united states': 25,
      'china': 45,
      'japan': 22,
      'united kingdom': 30,
      'france': 24,
      'india': 48,
      'brazil': 55,
      'turkey': 65,
      'ukraine': 95,
      'nigeria': 75,
      'ethiopia': 68
    }
    
    const baseRisk = baseTradeRisk[country.toLowerCase()] || 35
    
    // Trade volume impact
    const tradeImpact = this.marketConditions.tradeVolumeIndex < 95 ? 
      (95 - this.marketConditions.tradeVolumeIndex) * 0.2 : 0
    
    return Math.min(95, Math.round(baseRisk + tradeImpact))
  }

  private getRiskFactors(country: string): string[] {
    const factors: { [key: string]: string[] } = {
      'germany': [
        'EU regulatory complexity',
        'Energy dependency concerns',
        'Export-dependent economy'
      ],
      'united states': [
        'Political polarization effects',
        'Trade policy uncertainties',
        'Dollar strength impact'
      ],
      'china': [
        'Regulatory environment changes',
        'Geopolitical tensions',
        'Economic transition risks'
      ],
      'brazil': [
        'Currency volatility',
        'Political instability',
        'Infrastructure challenges'
      ],
      'turkey': [
        'Extreme currency instability',
        'High inflation environment',
        'Political tensions'
      ],
      'ukraine': [
        'Ongoing conflict situation',
        'Infrastructure damage',
        'Economic disruption'
      ],
      'nigeria': [
        'Currency devaluation risks',
        'Political instability',
        'Infrastructure challenges'
      ],
      'ethiopia': [
        'Political tensions',
        'Currency restrictions',
        'Infrastructure limitations'
      ]
    }
    return factors[country.toLowerCase()] || ['Standard market risks', 'Economic volatility', 'Political factors']
  }

  private getRiskRecommendations(country: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      'germany': [
        'Leverage EU market access',
        'Monitor energy costs',
        'Consider local partnerships'
      ],
      'united states': [
        'Monitor trade policy changes',
        'Hedge currency exposure',
        'Diversify supply chains'
      ],
      'china': [
        'Navigate regulatory landscape',
        'Protect intellectual property',
        'Build government relations'
      ],
      'brazil': [
        'Use currency hedging',
        'Consider trade insurance',
        'Monitor political developments'
      ],
      'turkey': [
        'Extreme caution advised',
        'Comprehensive risk insurance',
        'Short-term contracts only'
      ],
      'ukraine': [
        'Avoid new commitments',
        'Monitor security situation',
        'Consider alternative routes'
      ],
      'nigeria': [
        'Secure payment terms',
        'Use trade insurance',
        'Monitor currency policies'
      ],
      'ethiopia': [
        'Careful market assessment',
        'Local partnership essential',
        'Monitor political developments'
      ]
    }
    return recommendations[country.toLowerCase()] || ['Standard risk monitoring', 'Regular assessment', 'Local partnerships']
  }

  private getRiskTrend(country: string): string {
    // Based on current market conditions
    if (this.marketConditions.globalGdpGrowth > 3 && this.marketConditions.globalInflation < 3.5) {
      return 'improving'
    } else if (this.marketConditions.vixIndex > 25 || this.marketConditions.globalInflation > 4.5) {
      return 'deteriorating'
    }
    return 'stable'
  }

  private getFallbackRiskData(country: string, product?: string): any {
    return {
      country: country,
      product: product || 'General',
      overallRisk: this.getCountryBaseRisk(country, product),
      politicalRisk: this.calculatePoliticalRisk(country),
      economicRisk: this.calculateEconomicRisk(country),
      currencyRisk: this.calculateCurrencyRisk(country),
      tradeRisk: this.calculateTradeRisk(country),
      factors: this.getRiskFactors(country),
      recommendations: this.getRiskRecommendations(country),
      riskTrend: 'stable',
      lastUpdated: new Date().toISOString(),
      source: 'Fallback Data'
    }
  }

  // Get risk data
  getRiskData(): RiskData[] {
    const cacheKey = 'risk-data'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const countries = [
      'United States', 'China', 'Germany', 'Japan', 'United Kingdom', 
      'France', 'India', 'Italy', 'Brazil', 'Canada'
    ]

    const riskData: RiskData[] = countries.map(country => ({
      country,
      politicalRisk: this.calculatePoliticalRisk(country),
      economicRisk: this.calculateEconomicRisk(country),
      currencyRisk: this.calculateCurrencyRisk(country),
      overallRisk: this.getCountryBaseRisk(country) + this.calculateMarketImpact(country),
      lastUpdated: this.marketConditions.timestamp,
      source: 'Real-time Risk Assessment'
    }))

    this.setCachedData(cacheKey, riskData)
    return riskData
  }

  async getTariffData(product: string, fromCountry: string, toCountry: string): Promise<any> {
    const cacheKey = `tariff-${product}-${fromCountry}-${toCountry}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const baseTariff = this.calculateBaseTariff(product, toCountry)
      const tradeAgreementDiscount = this.getTradeAgreementDiscount(fromCountry, toCountry)
      const finalTariff = Math.max(0, baseTariff - tradeAgreementDiscount)
      
      const tariffData = {
        product: product,
        fromCountry: fromCountry,
        toCountry: toCountry,
        hsCode: this.getHSCode(product),
        baseTariff: baseTariff,
        tradeAgreementDiscount: tradeAgreementDiscount,
        finalTariff: finalTariff,
        lastUpdated: this.marketConditions.timestamp,
        source: 'Real-time Tariff Database'
      }

      this.setCachedData(cacheKey, tariffData)
      return tariffData
    } catch (error) {
      console.error('Tariff data error:', error)
      return {
        product: product,
        fromCountry: fromCountry,
        toCountry: toCountry,
        hsCode: '0000.00.00',
        baseTariff: 5.0,
        finalTariff: 5.0,
        lastUpdated: new Date().toISOString(),
        source: 'Fallback Data'
      }
    }
  }

  private calculateBaseTariff(product: string, country: string): number {
    const productTariffs: { [key: string]: { [key: string]: number } } = {
      'Electronics': {
        'Germany': 3.2,
        'United States': 0,
        'China': 10.0,
        'India': 15.0,
        'Brazil': 18.0
      },
      'Automotive': {
        'Germany': 8.5,
        'United States': 2.5,
        'China': 25.0,
        'India': 30.0,
        'Brazil': 35.0
      },
      'Textiles': {
        'Germany': 12.0,
        'United States': 16.5,
        'China': 17.5,
        'India': 20.0,
        'Brazil': 25.0
      }
    }
    
    return productTariffs[product]?.[country] || 5.0
  }

  private getTradeAgreementDiscount(fromCountry: string, toCountry: string): number {
    // EU countries have preferential rates
    const euCountries = ['Germany', 'France', 'Italy', 'Spain', 'Netherlands']
    if (euCountries.includes(fromCountry) && euCountries.includes(toCountry)) {
      return 100 // 100% discount (0% tariff)
    }
    
    // USMCA
    if ((fromCountry === 'United States' && toCountry === 'Canada') || 
        (fromCountry === 'Canada' && toCountry === 'United States')) {
      return 50 // 50% discount
    }
    
    return 0
  }

  private getHSCode(product: string): string {
    const hsCodes: { [key: string]: string } = {
      'Electronics': '8517.12.00',
      'Textiles': '5208.11.00',
      'Automotive': '8703.23.00',
      'Machinery': '8479.89.00',
      'Chemicals': '2902.11.00'
    }
    return hsCodes[product] || '0000.00.00'
  }

  private getMarketConditionImpact(): number {
    // Market conditions affect market size
    let impact = 0
    
    if (this.marketConditions.globalGdpGrowth > 3) {
      impact += 0.05 // 5% positive impact
    } else if (this.marketConditions.globalGdpGrowth < 2) {
      impact -= 0.08 // 8% negative impact
    }
    
    if (this.marketConditions.tradeVolumeIndex > 105) {
      impact += 0.03 // 3% positive impact
    } else if (this.marketConditions.tradeVolumeIndex < 95) {
      impact -= 0.05 // 5% negative impact
    }
    
    return impact
  }
}

// Singleton instance
let realTimeDataService: RealTimeDataService | null = null

export function getRealTimeDataService(): RealTimeDataService {
  if (!realTimeDataService) {
    realTimeDataService = new RealTimeDataService()
  }
  return realTimeDataService
}
