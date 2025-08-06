'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Globe, Package, Calendar, Download, RefreshCw, Users, BarChart3, AlertTriangle } from 'lucide-react'

interface MarketData {
  region: string
  product_category: string
  market_size_usd: number
  growth_rate_percent: number
  trade_volume_usd: number
  opportunity_score: number
  competition_level: string
  market_trend: string
  risk_factors?: string[]
  key_players?: string[]
  last_updated: string
}

interface RealTimeData {
  region: string
  product_category: string
  current_price: number
  price_change_24h: number
  price_change_percent: number
  trading_volume: number
  market_sentiment: string
  volatility_index: number
  support_level: number
  resistance_level: number
  last_updated: string
}

export default function AnalyticsPage() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [realTimeData, setRealTimeData] = useState<RealTimeData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('global')
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState('12m')
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null)

  const fetchMarketData = async () => {
    try {
      const params = new URLSearchParams({
        region: selectedRegion,
        product: selectedProduct,
        timeframe: selectedTimeframe
      })

      const [marketResponse, realTimeResponse] = await Promise.all([
        fetch(`/api/market-intelligence?${params}`),
        fetch(`/api/market-intelligence/real-time?${params}`)
      ])

      if (marketResponse.ok) {
        const marketResult = await marketResponse.json()
        setMarketData(marketResult.data || [])
      }

      if (realTimeResponse.ok) {
        const realTimeResult = await realTimeResponse.json()
        setRealTimeData(realTimeResult.data || [])
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMarketData()
  }

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        region: selectedRegion,
        product: selectedProduct
      })

      const response = await fetch(`/api/market-intelligence/export?${params}`)
      
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `market-intelligence-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `market-intelligence-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  useEffect(() => {
    fetchMarketData()
  }, [selectedRegion, selectedProduct, selectedTimeframe])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchMarketData()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [selectedRegion, selectedProduct, selectedTimeframe, refreshing])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'growing':
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining':
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-blue-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return 'bg-green-100 text-green-800'
      case 'bearish':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const chartData = marketData.map(item => ({
    name: item.region,
    marketSize: item.market_size_usd / 1000000000, // Convert to billions
    growthRate: item.growth_rate_percent,
    opportunityScore: item.opportunity_score
  }))

  const pieData = marketData.slice(0, 5).map((item, index) => ({
    name: item.product_category,
    value: item.market_size_usd / 1000000000,
    color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index]
  }))

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading market analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Market Analytics</h1>
          <p className="text-muted-foreground">Real-time market intelligence and trade analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleExport('json')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => handleExport('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                  <SelectItem value="Latin America">Latin America</SelectItem>
                  <SelectItem value="Middle East & Africa">Middle East & Africa</SelectItem>
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
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="Textiles">Textiles</SelectItem>
                  <SelectItem value="Machinery">Machinery</SelectItem>
                  <SelectItem value="Chemicals">Chemicals</SelectItem>
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
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="12m">Last 12 Months</SelectItem>
                  <SelectItem value="24m">Last 24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Market Size</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(marketData.reduce((sum, item) => sum + item.market_size_usd, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(marketData.reduce((sum, item) => sum + item.growth_rate_percent, 0) / marketData.length || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all markets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Markets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently tracked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-refresh: 30s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Data</TabsTrigger>
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Data Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Market Intelligence Overview</CardTitle>
                <CardDescription>
                  Comprehensive market data across regions and product categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData.map((market, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{market.region} - {market.product_category}</h3>
                          <p className="text-sm text-muted-foreground">
                            Market Size: {formatCurrency(market.market_size_usd)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(market.market_trend)}
                          <Badge variant="outline">{market.market_trend}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Growth Rate:</span>
                          <p className="font-medium">{market.growth_rate_percent}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Trade Volume:</span>
                          <p className="font-medium">{formatCurrency(market.trade_volume_usd)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Opportunity Score:</span>
                          <p className="font-medium">{market.opportunity_score}/10</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Competition:</span>
                          <p className="font-medium">{market.competition_level}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <Progress value={market.opportunity_score * 10} className="flex-1 mr-4" />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedMarket(market)}>
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{market.region} - {market.product_category}</DialogTitle>
                              <DialogDescription>
                                Detailed market analysis and insights
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Market Metrics</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Market Size:</span>
                                      <span className="font-medium">{formatCurrency(market.market_size_usd)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Growth Rate:</span>
                                      <span className="font-medium">{market.growth_rate_percent}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Trade Volume:</span>
                                      <span className="font-medium">{formatCurrency(market.trade_volume_usd)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Opportunity Score:</span>
                                      <span className="font-medium">{market.opportunity_score}/10</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Risk Factors</h4>
                                  <div className="space-y-1">
                                    {market.risk_factors?.map((risk, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm">
                                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                        {risk}
                                      </div>
                                    )) || <p className="text-sm text-muted-foreground">No specific risks identified</p>}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Key Market Players</h4>
                                <div className="flex flex-wrap gap-2">
                                  {market.key_players?.map((player, idx) => (
                                    <Badge key={idx} variant="secondary">{player}</Badge>
                                  )) || <p className="text-sm text-muted-foreground">Market players data not available</p>}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Market Data</CardTitle>
              <CardDescription>
                Live market prices and trading data (updates every 30 seconds)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {realTimeData.map((data, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{data.region}</CardTitle>
                      <CardDescription>{data.product_category}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">${data.current_price}</span>
                        <Badge className={getSentimentColor(data.market_sentiment)}>
                          {data.market_sentiment}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>24h Change:</span>
                        <span className={data.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {data.price_change_24h >= 0 ? '+' : ''}{data.price_change_24h} ({data.price_change_percent}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Volume:</span>
                        <span>{formatNumber(data.trading_volume)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Volatility:</span>
                        <span>{data.volatility_index}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Support: ${data.support_level}</span>
                          <span>Resistance: ${data.resistance_level}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Size Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Market Size by Region</CardTitle>
                <CardDescription>Market size comparison across regions (in billions USD)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
                    <Bar dataKey="marketSize" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Rate vs Opportunity Score</CardTitle>
                <CardDescription>Market growth potential analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="growthRate" stroke="#8884d8" name="Growth Rate %" />
                    <Line type="monotone" dataKey="opportunityScore" stroke="#82ca9d" name="Opportunity Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Market Share Pie Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Market Share Distribution</CardTitle>
                <CardDescription>Market size distribution by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
