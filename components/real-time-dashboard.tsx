"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Wifi, WifiOff, RefreshCw } from 'lucide-react'

interface RealTimeDashboardProps {
  className?: string
}

export default function RealTimeDashboard({ className }: RealTimeDashboardProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [marketData, setMarketData] = useState<any>(null)
  const [economicData, setEconomicData] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize real-time data
    fetchInitialData()

    // Set up periodic updates
    const interval = setInterval(fetchInitialData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Simulate API calls to our real-time service
      const mockMarketData = {
        globalTradeVolume: {
          current: 28500000000000,
          change: 2.3,
          trend: 'up'
        },
        topTradingCountries: [
          { country: 'China', volume: 6400000000000, change: 3.1 },
          { country: 'United States', volume: 4200000000000, change: 1.8 },
          { country: 'Germany', volume: 2100000000000, change: 2.4 }
        ],
        commodityPrices: {
          oil: { price: 82.45, change: 1.2 },
          gold: { price: 2034.50, change: -0.8 },
          wheat: { price: 245.30, change: 2.1 }
        },
        exchangeRates: {
          USD: 1.0,
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110.0
        }
      }

      const mockEconomicData = {
        globalGDP: {
          current: 105000000000000,
          growth: 3.2,
          trend: 'up'
        },
        inflation: {
          global: 3.8
        },
        commodityIndex: 145.6
      }

      setMarketData(mockMarketData)
      setEconomicData(mockEconomicData)
      setLastUpdate(new Date().toLocaleString())
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to fetch real-time data:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000000) {
      return `$${(amount / 1000000000000).toFixed(1)}T`
    } else if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else {
      return `$${amount.toLocaleString()}`
    }
  }

  const getTrendIcon = (change: number) => {
    return change > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  const getTrendColor = (change: number) => {
    return change > 0 ? 'text-green-600' : 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading real-time data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Last update: {lastUpdate}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInitialData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Global Trade Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(marketData.globalTradeVolume.current)}
              </div>
              <div className={`flex items-center space-x-1 text-sm ${getTrendColor(marketData.globalTradeVolume.change)}`}>
                {getTrendIcon(marketData.globalTradeVolume.change)}
                <span>{marketData.globalTradeVolume.change > 0 ? '+' : ''}{marketData.globalTradeVolume.change}%</span>
              </div>
            </CardContent>
          </Card>

          {economicData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Global GDP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(economicData.globalGDP.current)}
                </div>
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(economicData.globalGDP.growth)}`}>
                  {getTrendIcon(economicData.globalGDP.growth)}
                  <span>{economicData.globalGDP.growth > 0 ? '+' : ''}{economicData.globalGDP.growth}% growth</span>
                </div>
              </CardContent>
            </Card>
          )}

          {economicData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Global Inflation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {economicData.inflation.global}%
                </div>
                <div className="text-sm text-gray-500">
                  Average across major economies
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top Trading Countries */}
      {marketData && (
        <Card>
          <CardHeader>
            <CardTitle>Top Trading Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketData.topTradingCountries.map((country: any, index: number) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(country.volume)}</div>
                    <div className={`flex items-center space-x-1 text-sm ${getTrendColor(country.change)}`}>
                      {getTrendIcon(country.change)}
                      <span>{country.change > 0 ? '+' : ''}{country.change}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commodity Prices */}
      {marketData && (
        <Card>
          <CardHeader>
            <CardTitle>Live Commodity Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(marketData.commodityPrices).map(([commodity, data]: [string, any]) => (
                <div key={commodity} className="text-center">
                  <div className="text-lg font-semibold capitalize">{commodity}</div>
                  <div className="text-2xl font-bold">${data.price}</div>
                  <div className={`flex items-center justify-center space-x-1 text-sm ${getTrendColor(data.change)}`}>
                    {getTrendIcon(data.change)}
                    <span>{data.change > 0 ? '+' : ''}{data.change}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exchange Rates */}
      {marketData && (
        <Card>
          <CardHeader>
            <CardTitle>Live Exchange Rates (USD Base)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(marketData.exchangeRates).map(([currency, rate]: [string, any]) => (
                <div key={currency} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">{currency}</div>
                  <div className="text-xl font-bold">{rate}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
