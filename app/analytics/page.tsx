"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BarChart3, TrendingUp, TrendingDown, Globe, DollarSign, ArrowLeft, Download, RefreshCw, Target, FileText, Users, Eye, Zap, Clock, Activity } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedRegion, setSelectedRegion] = useState("global")
  const [selectedProduct, setSelectedProduct] = useState("all")
  const [timeframe, setTimeframe] = useState("12m")
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [marketConditions, setMarketConditions] = useState<MarketConditions | null>(null)
  const [statistics, setStatistics] = useState<Statistics>({
    totalMarketSize: 0,
    activeMarkets: 0,
    avgGrowthRate: 0,
    highOpportunityMarkets: 0,
    growingMarkets: 0,
    decliningMarkets: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null)
  const [showDetailedReport, setShowDetailedReport] = useState(false)
  const [keyTrends, setKeyTrends] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
      loadMarketData()
    } else {
      router.push("/auth/signin")
    }
  }, [router])

  useEffect(() => {
    loadMarketData()
  }, [selectedRegion, selectedProduct, timeframe])

  // Auto-refresh every 30 seconds for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        loadMarketData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isLoading, selectedRegion, selectedProduct, timeframe])

  const loadMarketData = async () => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        region: selectedRegion,
        product: selectedProduct,
        timeframe: timeframe
      })

      const response = await fetch(`/api/market-intelligence/real-time?${params}`)
      const result = await response.json()

      if (result.success && result.data) {
        setMarketData(result.data.markets || [])
        setStatistics(result.data.statistics || statistics)
        setMarketConditions(result.data.marketConditions || null)
        setKeyTrends(result.data.keyTrends || [])
        setLastUpdated(result.timestamp || new Date().toISOString())
      } else {
        console.error('Market intelligence failed:', result.message)
        // Keep existing data if API fails
      }
    } catch (error) {
      console.error('Market intelligence error:', error)
      // Keep existing data if API fails
    }

    setIsLoading(false)
  }

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    } else {
      return `$${value}`
    }
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 5) return "text-green-600"
    if (growth > 0) return "text-blue-600"
    return "text-red-600"
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "Low":
        return "text-green-600"
      case "Medium":
        return "text-yellow-600"
      case "High":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getOpportunityColor = (opportunity: number) => {
    if (opportunity > 70) return "text-green-600"
    if (opportunity > 50) return "text-blue-600"
    return "text-yellow-600"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const viewDetailedReport = (market: MarketData) => {
    setSelectedMarket(market)
    setShowDetailedReport(true)
  }

  const findPartners = () => {
    router.push("/partners")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-purple-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-gold-600 bg-clip-text text-transparent">
                Market Analytics
              </h1>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Zap className="w-3 h-3 mr-1" />
                Real-time
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMarketData}
              disabled={isLoading}
              className="bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <Card className="border-purple-100 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Market Intelligence Dashboard
            </CardTitle>
            <CardDescription>
              Real-time trade data across 200+ countries
              {lastUpdated && (
                <span className="block text-xs text-gray-500 mt-1">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Region</label>
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
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Product Category</label>
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
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
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
              <div className="flex items-end">
                <Button
                  onClick={loadMarketData}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-gold-600 hover:from-purple-700 hover:to-gold-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Real-time Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Conditions */}
        {marketConditions && (
          <Card className="border-purple-100 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                Live Market Conditions
              </CardTitle>
              <CardDescription>Real-time global economic indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {marketConditions.globalInflation.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Global Inflation</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    ${marketConditions.oilPrice.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">Oil Price</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {marketConditions.usdIndex.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">USD Index</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {marketConditions.vixIndex.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">VIX Index</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {marketConditions.globalGdpGrowth.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">GDP Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">
                    {marketConditions.tradeVolumeIndex.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Trade Volume</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Market Size</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(statistics.totalMarketSize)}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Live Data
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Markets</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.activeMarkets}</p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Globe className="w-3 h-3 mr-1" />
                    Countries
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.avgGrowthRate.toFixed(1)}%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    YoY Growth
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Opportunity</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.highOpportunityMarkets}</p>
                  <p className="text-sm text-gold-600 flex items-center mt-1">
                    <Target className="w-3 h-3 mr-1" />
                    Markets
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gold-50">
                  <Target className="w-6 h-6 text-gold-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Trends */}
        {keyTrends.length > 0 && (
          <Card className="border-purple-100 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Key Market Trends
              </CardTitle>
              <CardDescription>Real-time insights from current market conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {keyTrends.map((trend, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{trend}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {marketData.slice(0, 20).map((market, index) => (
            <motion.div
              key={`${market.country}-${market.product}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <Card className="border-purple-100 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-purple-600" />
                      {market.country} - {market.product}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getOpportunityColor(market.opportunity)}>
                        {market.opportunity}% Opportunity
                      </Badge>
                      <Badge variant="outline" className="text-green-600">
                        <Zap className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Last updated: {new Date(market.lastUpdated).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Market Size</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(market.marketSize)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Growth Rate</p>
                      <p className={`text-lg font-bold ${getGrowthColor(market.growthRate)} flex items-center justify-center`}>
                        {getTrendIcon(market.trend)}
                        {market.growthRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Competition</p>
                      <p className={`text-lg font-bold ${getCompetitionColor(market.competition)}`}>
                        {market.competition}
                      </p>
                    </div>
                  </div>

                  {/* Volume and Opportunity */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Trade Volume:</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(market.volume)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Market Trend:</p>
                      <p className={`font-semibold flex items-center ${getGrowthColor(market.growthRate)}`}>
                        {getTrendIcon(market.trend)}
                        <span className="ml-1 capitalize">{market.trend}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => viewDetailedReport(market)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detailed Report
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-gold-600 hover:from-purple-700 hover:to-gold-700 text-white"
                      onClick={findPartners}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Find Partners
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {marketData.length === 0 && !isLoading && (
          <Card className="border-purple-100 py-12">
            <CardContent className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Market Data Available</h3>
              <p className="text-gray-500">
                Adjust your filters and try again
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={loadMarketData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Report Dialog */}
      <Dialog open={showDetailedReport} onOpenChange={setShowDetailedReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedMarket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-purple-600" />
                  Market Analysis Report: {selectedMarket.country} - {selectedMarket.product}
                </DialogTitle>
                <DialogDescription>
                  Comprehensive market intelligence and entry strategy
                  <Badge variant="outline" className="ml-2 text-green-600">
                    <Zap className="w-3 h-3 mr-1" />
                    Real-time Data
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Market Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Market Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Market Size:</span>
                        <span className="font-semibold">{formatCurrency(selectedMarket.marketSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Growth Rate:</span>
                        <span className={`font-semibold ${getGrowthColor(selectedMarket.growthRate)}`}>
                          {selectedMarket.growthRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Competition:</span>
                        <span className={`font-semibold ${getCompetitionColor(selectedMarket.competition)}`}>
                          {selectedMarket.competition}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trade Volume:</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(selectedMarket.volume)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Opportunity Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Opportunity Score:</span>
                        <span className={`font-semibold ${getOpportunityColor(selectedMarket.opportunity)}`}>
                          {selectedMarket.opportunity}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Market Trend:</span>
                        <span className={`font-semibold flex items-center ${getGrowthColor(selectedMarket.growthRate)}`}>
                          {getTrendIcon(selectedMarket.trend)}
                          <span className="ml-1 capitalize">{selectedMarket.trend}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Source:</span>
                        <span className="font-semibold text-green-600">{selectedMarket.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-semibold text-gray-800">
                          {new Date(selectedMarket.lastUpdated).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 border-t">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download Full Report
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-gold-600 hover:from-purple-700 hover:to-gold-700 text-white"
                    onClick={findPartners}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find Local Partners
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
