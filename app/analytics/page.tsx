'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, Globe, DollarSign, BarChart3, Users, Download, RefreshCw, Activity, AlertTriangle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

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

interface ApiResponse {
  success: boolean
  data: {
    markets: MarketData[]
    statistics: Statistics
    marketConditions: MarketConditions
    keyTrends: string[]
  }
  timestamp: string
}

export default function AnalyticsPage() {
  const [selectedRegion, setSelectedRegion] = useState('global')
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState('12m')
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [marketConditions, setMarketConditions] = useState<MarketConditions | null>(null)
  const [keyTrends, setKeyTrends] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null)
  const [exporting, setExporting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchMarketData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)

    try {
      const params = new URLSearchParams({
        region: selectedRegion,
        product: selectedProduct,
        timeframe: selectedTimeframe
      })

      const response = await fetch(`/api/market-intelligence/real-time?${params}`)
      const data: ApiResponse = await response.json()

      if (data.success) {
        setMarketData(data.data.markets)
        setStatistics(data.data.statistics)
        setMarketConditions(data.data.marketConditions)
        setKeyTrends(data.data.keyTrends)
        setLastUpdated(data.timestamp)
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleExportReport = async (country?: string) => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        region: selectedRegion,
        product: selectedProduct,
        timeframe: selectedTimeframe
      })

      if (country) {
        params.append('country', country)
      }

      const response = await fetch(`/api/market-intelligence/export?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `market-intelligence-${selectedRegion}-${selectedProduct}-${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleFindPartners = () => {
    window.location.href = '/partners'
  }

  const handleRealTimeAnalysis = () => {
    fetchMarketData(true)
  }

  useEffect(() => {
    fetchMarketData()
  }, [selectedRegion, selectedProduct, selectedTimeframe])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketData(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [selectedRegion, selectedProduct, selectedTimeframe])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'Low':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'High':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading market intelligence...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Market Intelligence Analytics</h1>
          <p className="text-muted-foreground">
            Real-time market data and insights for global trade opportunities
          </p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMarketData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => handleExportReport()}
            disabled={exporting}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Generating...' : 'Export Full Report'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Filters</CardTitle>
          <CardDescription>
            Customize your market analysis by selecting region, product, and timeframe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="north-america">North America</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                  <SelectItem value="latin-america">Latin America</SelectItem>
                  <SelectItem value="middle-east">Middle East</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Category</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="textiles">Textiles</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="food-beverages">Food & Beverages</SelectItem>
                  <SelectItem value="machinery">Machinery</SelectItem>
                  <SelectItem value="chemicals">Chemicals</SelectItem>
                  <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="12m">12 Months</SelectItem>
                  <SelectItem value="24m">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button
                onClick={handleRealTimeAnalysis}
                disabled={refreshing}
                className="w-full"
              >
                <Activity className={`h-4 w-4 mr-2 ${refreshing ? 'animate-pulse' : ''}`} />
                {refreshing ? 'Analyzing...' : 'Real-time Analysis'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Conditions */}
      {marketConditions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Global Market Conditions
            </CardTitle>
            <CardDescription>
              Real-time economic indicators affecting global trade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {marketConditions.globalInflation.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Global Inflation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${marketConditions.oilPrice.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Oil Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {marketConditions.usdIndex.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">USD Index</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {marketConditions.vixIndex.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">VIX Index</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {marketConditions.globalGdpGrowth.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">GDP Growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {marketConditions.tradeVolumeIndex.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Trade Volume</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Market Size</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(statistics.totalMarketSize / 1000000000).toFixed(1)}B
              </div>
              <p className="text-xs text-muted-foreground">
                Across {statistics.activeMarkets} active markets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.avgGrowthRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.growingMarkets} growing markets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Opportunity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.highOpportunityMarkets}
              </div>
              <p className="text-xs text-muted-foreground">
                Markets with 70+ opportunity score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Trends</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-sm">{statistics.growingMarkets}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-sm">{statistics.decliningMarkets}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Growing vs declining markets
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Trends */}
      {keyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Key Market Trends
            </CardTitle>
            <CardDescription>
              Important trends and insights affecting your selected markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keyTrends.map((trend, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{trend}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Market Opportunities</CardTitle>
          <CardDescription>
            Detailed market data for {selectedRegion} region - {selectedProduct} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.slice(0, 10).map((market, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{market.country}</h3>
                      <p className="text-sm text-muted-foreground">{market.product}</p>
                    </div>
                    {getTrendIcon(market.trend)}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-sm">
                      <span className="font-medium">${market.marketSize}M</span>
                      <span className="text-muted-foreground"> market size</span>
                    </div>
                    <div className="text-sm">
                      <span className={`font-medium ${market.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {market.growthRate >= 0 ? '+' : ''}{market.growthRate}%
                      </span>
                      <span className="text-muted-foreground"> growth</span>
                    </div>
                    <Badge className={getCompetitionColor(market.competition)}>
                      {market.competition} Competition
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">Opportunity</div>
                    <div className="flex items-center gap-2">
                      <Progress value={market.opportunity} className="w-16" />
                      <span className="text-sm font-medium">{market.opportunity}%</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMarket(market)}
                      >
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Market Analysis: {market.country} - {market.product}</DialogTitle>
                        <DialogDescription>
                          Comprehensive market intelligence and opportunity assessment
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Market Overview */}
                        <div>
                          <h4 className="font-semibold mb-3">Market Overview</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Market Size</span>
                                <span className="font-medium">${market.marketSize}M USD</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Growth Rate</span>
                                <span className={`font-medium ${market.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {market.growthRate >= 0 ? '+' : ''}{market.growthRate}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Trade Volume</span>
                                <span className="font-medium">${market.volume}M USD</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Opportunity Score</span>
                                <span className="font-medium">{market.opportunity}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Competition Level</span>
                                <Badge className={getCompetitionColor(market.competition)}>
                                  {market.competition}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Market Trend</span>
                                <div className="flex items-center gap-1">
                                  {getTrendIcon(market.trend)}
                                  <span className="capitalize">{market.trend}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Opportunity Assessment */}
                        <div>
                          <h4 className="font-semibold mb-3">Opportunity Assessment</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Market Potential</span>
                                <span className="text-sm font-medium">{market.opportunity}%</span>
                              </div>
                              <Progress value={market.opportunity} />
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Strong market fundamentals</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Favorable regulatory environment</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Growing consumer demand</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleExportReport(market.country)}
                            disabled={exporting}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {exporting ? 'Generating...' : 'Download Full Report'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleFindPartners}
                            className="flex-1"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Find Partners
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            
            {marketData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No market data available for the selected filters.</p>
              </div>
            )}
            
            {marketData.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing top 10 markets. Export full report to see all {marketData.length} markets.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
