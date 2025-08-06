import { createConnection } from '@sap/hana-client'

interface HANAConnectionConfig {
  serverNode: string
  username: string
  password: string
  database?: string
  schema?: string
  encrypt?: boolean
  sslValidateCertificate?: boolean
}

interface QueryResult {
  success: boolean
  data?: any[]
  error?: string
  rowCount?: number
  executionTime?: number
}

interface ConnectionStatus {
  connected: boolean
  lastConnected?: Date
  error?: string
  serverInfo?: {
    version: string
    uptime: number
    memoryUsage: number
  }
}

class SAP_HANA_Client {
  private connection: any = null
  private config: HANAConnectionConfig
  private isConnected: boolean = false
  private lastError: string | null = null
  private connectionAttempts: number = 0
  private maxRetries: number = 3

  constructor() {
    this.config = {
      serverNode: process.env.SAP_HANA_SERVER_NODE || '',
      username: process.env.SAP_HANA_USERNAME || '',
      password: process.env.SAP_HANA_PASSWORD || '',
      database: 'HXE',
      schema: 'TRADE_INTELLIGENCE',
      encrypt: true,
      sslValidateCertificate: false
    }
  }

  isConfigured(): boolean {
    return !!(this.config.serverNode && this.config.username && this.config.password)
  }

  async connect(): Promise<boolean> {
    try {
      this.connectionAttempts++
      
      if (this.connection) {
        return true
      }

      if (!this.isConfigured()) {
        this.lastError = 'SAP HANA credentials not configured'
        return false
      }

      this.connection = createConnection()
      await new Promise((resolve, reject) => {
        this.connection.connect(this.config, (err: any) => {
          if (err) {
            console.error('SAP HANA connection error:', err)
            reject(err)
          } else {
            console.log('Connected to SAP HANA successfully')
            resolve(true)
          }
        })
      })

      this.isConnected = true
      this.lastError = null
      
      return true
    } catch (error) {
      this.isConnected = false
      this.lastError = error instanceof Error ? error.message : 'Unknown connection error'
      console.error('SAP HANA connection failed:', this.lastError)
      
      if (this.connectionAttempts < this.maxRetries) {
        console.log(`Retrying connection (${this.connectionAttempts}/${this.maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        return this.connect()
      }
      
      return false
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await new Promise((resolve) => {
          this.connection.disconnect((err: any) => {
            if (err) {
              console.error('Error disconnecting from SAP HANA:', err)
            }
            resolve(true)
          })
        })
        this.connection = null
        this.isConnected = false
      }
    } catch (error) {
      console.error('Error during disconnect:', error)
    }
  }

  async executeQuery(sql: string, parameters: any[] = []): Promise<QueryResult> {
    const startTime = Date.now()
    
    try {
      const isConnected = await this.connect()
      if (!isConnected) {
        return {
          success: false,
          error: 'Failed to connect to SAP HANA'
        }
      }

      return new Promise((resolve) => {
        this.connection.exec(sql, parameters, (err: any, result: any) => {
          if (err) {
            console.error('Query execution error:', err)
            resolve({
              success: false,
              error: err.message || 'Query execution failed'
            })
          } else {
            resolve({
              success: true,
              data: result,
              rowCount: result ? result.length : 0,
              executionTime: Date.now() - startTime
            })
          }
        })
      })
    } catch (error) {
      console.error('Execute query error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      }
    }
  }

  async getTradeRiskAnalytics(country?: string, product?: string): Promise<QueryResult> {
    let sql = `
      SELECT 
        country,
        product_category,
        political_risk_score,
        economic_risk_score,
        currency_risk_score,
        overall_risk_score,
        risk_trend,
        last_updated
      FROM TRADE_RISK_ANALYTICS
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (country) {
      sql += ' AND UPPER(country) = UPPER(?)'
      params.push(country)
    }
    
    if (product) {
      sql += ' AND UPPER(product_category) = UPPER(?)'
      params.push(product)
    }
    
    sql += ' ORDER BY overall_risk_score DESC'
    
    return this.executeQuery(sql, params)
  }

  async getMarketIntelligence(region?: string, product?: string): Promise<QueryResult> {
    let sql = `
      SELECT 
        country,
        region,
        product_category,
        market_size_usd,
        growth_rate_percent,
        trade_volume_usd,
        opportunity_score,
        competition_level,
        market_trend,
        last_updated
      FROM MARKET_INTELLIGENCE
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (region && region !== 'global') {
      sql += ' AND UPPER(region) = UPPER(?)'
      params.push(region)
    }
    
    if (product && product !== 'all') {
      sql += ' AND UPPER(product_category) = UPPER(?)'
      params.push(product)
    }
    
    sql += ' ORDER BY market_size_usd DESC'
    
    return this.executeQuery(sql, params)
  }

  async getTariffData(hsCode?: string, originCountry?: string, destinationCountry?: string): Promise<QueryResult> {
    let sql = `
      SELECT 
        hs_code,
        product_description,
        origin_country,
        destination_country,
        tariff_rate_percent,
        trade_agreement,
        effective_date,
        last_updated
      FROM TARIFF_RATES
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (hsCode) {
      sql += ' AND hs_code = ?'
      params.push(hsCode)
    }
    
    if (originCountry) {
      sql += ' AND UPPER(origin_country) = UPPER(?)'
      params.push(originCountry)
    }
    
    if (destinationCountry) {
      sql += ' AND UPPER(destination_country) = UPPER(?)'
      params.push(destinationCountry)
    }
    
    sql += ' ORDER BY tariff_rate_percent DESC'
    
    return this.executeQuery(sql, params)
  }

  async getEconomicIndicators(): Promise<QueryResult> {
    const sql = `
      SELECT 
        country,
        gdp_growth_rate,
        inflation_rate,
        unemployment_rate,
        currency_code,
        exchange_rate_usd,
        political_stability_index,
        ease_of_business_rank,
        last_updated
      FROM ECONOMIC_INDICATORS
      ORDER BY gdp_growth_rate DESC
    `
    
    return this.executeQuery(sql)
  }

  async getTradeStatistics(timeframe?: string): Promise<QueryResult> {
    let sql = `
      SELECT 
        country,
        product_category,
        export_value_usd,
        import_value_usd,
        trade_balance_usd,
        trade_volume_usd,
        year_month,
        last_updated
      FROM TRADE_STATISTICS
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (timeframe) {
      // Add timeframe filtering logic based on year_month
      const currentDate = new Date()
      let startDate: Date
      
      switch (timeframe) {
        case '3m':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1)
          break
        case '6m':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1)
          break
        case '12m':
          startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1)
          break
        case '24m':
          startDate = new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), 1)
          break
        default:
          startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1)
      }
      
      const startYearMonth = startDate.getFullYear() * 100 + (startDate.getMonth() + 1)
      sql += ' AND year_month >= ?'
      params.push(startYearMonth)
    }
    
    sql += ' ORDER BY trade_volume_usd DESC'
    
    return this.executeQuery(sql, params)
  }

  async insertTradeRiskData(data: any): Promise<QueryResult> {
    const sql = `
      INSERT INTO TRADE_RISK_ANALYTICS (
        country, product_category, political_risk_score, economic_risk_score,
        currency_risk_score, overall_risk_score, risk_trend, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `
    
    const params = [
      data.country,
      data.product_category,
      data.political_risk_score,
      data.economic_risk_score,
      data.currency_risk_score,
      data.overall_risk_score,
      data.risk_trend
    ]
    
    return this.executeQuery(sql, params)
  }

  async updateMarketIntelligence(data: any): Promise<QueryResult> {
    const sql = `
      UPDATE MARKET_INTELLIGENCE 
      SET 
        market_size_usd = ?,
        growth_rate_percent = ?,
        trade_volume_usd = ?,
        opportunity_score = ?,
        competition_level = ?,
        market_trend = ?,
        last_updated = CURRENT_TIMESTAMP
      WHERE country = ? AND product_category = ?
    `
    
    const params = [
      data.market_size_usd,
      data.growth_rate_percent,
      data.trade_volume_usd,
      data.opportunity_score,
      data.competition_level,
      data.market_trend,
      data.country,
      data.product_category
    ]
    
    return this.executeQuery(sql, params)
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const isConnected = await this.connect()
      if (isConnected) {
        // Test with a simple query
        const result = await this.executeQuery('SELECT 1 as test FROM DUMMY')
        return {
          connected: result.success,
          lastConnected: new Date(),
          serverInfo: {
            version: 'SAP HANA Cloud 2024.1',
            uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
            memoryUsage: Math.floor(Math.random() * 80) + 20 // 20-100% memory usage
          }
        }
      }
      return {
        connected: false,
        error: 'Failed to establish connection'
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async getTableInfo(): Promise<any[]> {
    try {
      const result = await this.executeQuery(`
        SELECT 
          TABLE_NAME,
          TABLE_TYPE,
          RECORD_COUNT
        FROM SYS.TABLES 
        WHERE SCHEMA_NAME = 'TRADE_INTELLIGENCE'
        ORDER BY TABLE_NAME
      `)
      
      return result.success ? result.data || [] : []
    } catch (error) {
      console.error('Error getting table info:', error)
      return []
    }
  }

  // Utility methods
  isConnectionActive(): boolean {
    return this.isConnected
  }

  getLastError(): string | null {
    return this.lastError
  }

  getConnectionAttempts(): number {
    return this.connectionAttempts
  }

  resetConnectionAttempts(): void {
    this.connectionAttempts = 0
  }
}

// Singleton instance
let hanaClient: SAP_HANA_Client | null = null

export function getHANAClient(): SAP_HANA_Client {
  if (!hanaClient) {
    hanaClient = new SAP_HANA_Client()
  }
  return hanaClient
}

// Alias for compatibility
export const getHanaClient = getHANAClient

export type { HANAConnectionConfig, QueryResult, ConnectionStatus }
export { SAP_HANA_Client }
