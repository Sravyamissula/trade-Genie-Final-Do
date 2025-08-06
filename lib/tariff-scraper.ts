interface TariffData {
  hsCode: string
  product: string
  originCountry: string
  destinationCountry: string
  tariffRate: number
  additionalDuties: number
  totalRate: number
  lastUpdated: string
  source: string
}

interface TariffSearchParams {
  product?: string
  hsCode?: string
  originCountry?: string
  destinationCountry?: string
}

class TariffScraper {
  private cache: Map<string, { data: TariffData[]; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  private getCachedData(key: string): TariffData[] | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: TariffData[]): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async searchTariffs(params: TariffSearchParams): Promise<TariffData[]> {
    const cacheKey = JSON.stringify(params)
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // Generate mock tariff data based on parameters
      const tariffData = this.generateMockTariffData(params)
      this.setCachedData(cacheKey, tariffData)
      return tariffData
    } catch (error) {
      console.error('Tariff search error:', error)
      return []
    }
  }

  async getTariffByHSCode(hsCode: string, originCountry: string, destinationCountry: string): Promise<TariffData | null> {
    try {
      const results = await this.searchTariffs({
        hsCode,
        originCountry,
        destinationCountry
      })
      return results.length > 0 ? results[0] : null
    } catch (error) {
      console.error('HS Code tariff lookup error:', error)
      return null
    }
  }

  async getTariffsByProduct(product: string, destinationCountry: string): Promise<TariffData[]> {
    try {
      return await this.searchTariffs({
        product,
        destinationCountry
      })
    } catch (error) {
      console.error('Product tariff lookup error:', error)
      return []
    }
  }

  private generateMockTariffData(params: TariffSearchParams): TariffData[] {
    const products = [
      'Electronics', 'Textiles', 'Automotive', 'Machinery', 'Chemicals',
      'Food & Beverages', 'Pharmaceuticals', 'Energy', 'Metals', 'Agriculture'
    ]

    const countries = [
      'United States', 'China', 'Germany', 'Japan', 'United Kingdom',
      'France', 'India', 'Italy', 'Brazil', 'Canada'
    ]

    const hsCodes = {
      'Electronics': ['8517.12.00', '8471.30.00', '8528.72.00'],
      'Textiles': ['5208.11.00', '6109.10.00', '6203.42.00'],
      'Automotive': ['8703.23.00', '8708.29.00', '8711.20.00'],
      'Machinery': ['8479.89.00', '8414.80.00', '8421.23.00'],
      'Chemicals': ['2902.11.00', '3004.10.00', '2710.19.00'],
      'Food & Beverages': ['2009.11.00', '1701.14.00', '0406.90.00'],
      'Pharmaceuticals': ['3004.10.00', '3003.20.00', '3002.12.00']
    }

    const tariffData: TariffData[] = []
    const numResults = Math.min(10, Math.max(1, Math.floor(Math.random() * 8) + 3))

    for (let i = 0; i < numResults; i++) {
      const product = params.product || products[Math.floor(Math.random() * products.length)]
      const originCountry = params.originCountry || countries[Math.floor(Math.random() * countries.length)]
      const destinationCountry = params.destinationCountry || countries[Math.floor(Math.random() * countries.length)]
      
      const productHSCodes = hsCodes[product as keyof typeof hsCodes] || ['0000.00.00']
      const hsCode = params.hsCode || productHSCodes[Math.floor(Math.random() * productHSCodes.length)]

      const baseTariff = this.calculateBaseTariff(product, destinationCountry)
      const additionalDuties = Math.random() * 5 + 1 // 1-6%
      
      tariffData.push({
        hsCode,
        product,
        originCountry,
        destinationCountry,
        tariffRate: baseTariff,
        additionalDuties,
        totalRate: baseTariff + additionalDuties,
        lastUpdated: new Date().toISOString(),
        source: 'Mock Tariff Database'
      })
    }

    return tariffData
  }

  private calculateBaseTariff(product: string, destinationCountry: string): number {
    const tariffRates: { [key: string]: { [key: string]: number } } = {
      'Electronics': {
        'United States': 3.5,
        'China': 8.5,
        'Germany': 2.8,
        'Japan': 4.2,
        'India': 12.0,
        'Brazil': 15.2
      },
      'Textiles': {
        'United States': 8.2,
        'China': 12.8,
        'Germany': 6.5,
        'Japan': 7.1,
        'India': 18.5,
        'Brazil': 22.0
      },
      'Automotive': {
        'United States': 2.5,
        'China': 15.0,
        'Germany': 4.2,
        'Japan': 3.8,
        'India': 25.0,
        'Brazil': 35.0
      },
      'Machinery': {
        'United States': 1.8,
        'China': 6.5,
        'Germany': 2.1,
        'Japan': 2.8,
        'India': 8.5,
        'Brazil': 12.0
      },
      'Chemicals': {
        'United States': 4.2,
        'China': 9.8,
        'Germany': 3.5,
        'Japan': 4.8,
        'India': 15.2,
        'Brazil': 18.5
      }
    }

    const productRates = tariffRates[product]
    if (productRates && productRates[destinationCountry]) {
      return productRates[destinationCountry]
    }

    // Default rates by country if product-specific rate not found
    const defaultRates: { [key: string]: number } = {
      'United States': 4.5,
      'China': 10.2,
      'Germany': 3.8,
      'Japan': 4.5,
      'India': 12.5,
      'Brazil': 16.8,
      'United Kingdom': 5.2,
      'France': 4.1,
      'Italy': 4.8,
      'Canada': 3.2
    }

    return defaultRates[destinationCountry] || 6.0
  }

  // Utility methods
  getProductByHSCode(hsCode: string): string {
    const hsToProduct: { [key: string]: string } = {
      '8517': 'Electronics',
      '8471': 'Electronics',
      '8528': 'Electronics',
      '5208': 'Textiles',
      '6109': 'Textiles',
      '6203': 'Textiles',
      '8703': 'Automotive',
      '8708': 'Automotive',
      '8711': 'Automotive',
      '8479': 'Machinery',
      '8414': 'Machinery',
      '8421': 'Machinery',
      '2902': 'Chemicals',
      '3004': 'Pharmaceuticals',
      '2710': 'Chemicals',
      '2009': 'Food & Beverages',
      '1701': 'Food & Beverages',
      '0406': 'Food & Beverages'
    }

    const prefix = hsCode.substring(0, 4)
    return hsToProduct[prefix] || 'Unknown'
  }

  validateHSCode(hsCode: string): boolean {
    // Basic HS code validation (should be 6-10 digits with optional dots)
    const hsPattern = /^\d{4}\.?\d{2}\.?\d{0,4}$/
    return hsPattern.test(hsCode)
  }
}

// Singleton instance
let tariffScraper: TariffScraper | null = null

export function getTariffScraper(): TariffScraper {
  if (!tariffScraper) {
    tariffScraper = new TariffScraper()
  }
  return tariffScraper
}

export type { TariffData, TariffSearchParams }
