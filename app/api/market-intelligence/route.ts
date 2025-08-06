import { NextRequest, NextResponse } from "next/server"
import { getRealTimeDataService } from "@/lib/real-time-data-service"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region") || "global"
    const product = searchParams.get("product") || "all"
    const timeframe = searchParams.get("timeframe") || "1M"

    const realTimeService = getRealTimeDataService()

    // Get historical market data (simulated)
    const marketData = realTimeService.getMarketData()
    const economicData = realTimeService.getEconomicData()

    // Generate historical trends (simulated)
    const historicalTrends = marketData.map(item => ({
      ...item,
      historical: {
        '1M': { volume: (item.volume || 0) * 0.95, growthRate: (item.growthRate || 0) - 1 },
        '3M': { volume: (item.volume || 0) * 0.85, growthRate: (item.growthRate || 0) - 2 },
        '6M': { volume: (item.volume || 0) * 0.75, growthRate: (item.growthRate || 0) - 3 },
        '1Y': { volume: (item.volume || 0) * 0.65, growthRate: (item.growthRate || 0) - 5 }
      }
    }))

    // Filter data based on parameters
    let filteredData = historicalTrends

    if (region !== "global") {
      filteredData = historicalTrends.filter(item => 
        item.region?.toLowerCase().includes(region.toLowerCase()) ||
        item.country?.toLowerCase().includes(region.toLowerCase())
      )
    }

    if (product !== "all") {
      filteredData = filteredData.filter(item =>
        item.product?.toLowerCase().includes(product.toLowerCase()) ||
        item.category?.toLowerCase().includes(product.toLowerCase())
      )
    }

    // Calculate market insights
    const currentPeriod = filteredData.map(item => ({
      product: item.product,
      volume: item.marketSize || 0,
      growthRate: item.growthRate || 0
    }))

    const previousPeriod = filteredData.map(item => ({
      product: item.product,
      volume: (item.marketSize || 0) * 0.95, // 5% less than current
      growthRate: (item.growthRate || 0) - 1 // 1% less growth
    }))

    const marketComparison = {
      current: {
        totalVolume: currentPeriod.reduce((sum, item) => sum + (item.volume || 0), 0),
        avgGrowthRate: currentPeriod.length > 0 ? 
          currentPeriod.reduce((sum, item) => sum + (item.growthRate || 0), 0) / currentPeriod.length : 0
      },
      previous: {
        totalVolume: previousPeriod.reduce((sum, item) => sum + (item.volume || 0), 0),
        avgGrowthRate: previousPeriod.length > 0 ? 
          previousPeriod.reduce((sum, item) => sum + (item.growthRate || 0), 0) / previousPeriod.length : 0
      }
    }

    const response = {
      success: true,
      data: {
        summary: {
          totalMarkets: filteredData.length,
          timeframe,
          region,
          product,
          lastUpdated: new Date().toISOString()
        },
        marketComparison,
        historicalData: filteredData.slice(0, 20),
        economicIndicators: economicData,
        trends: {
          growing: filteredData.filter(item => (item.growthRate || 0) > 5).length,
          stable: filteredData.filter(item => (item.growthRate || 0) >= 0 && (item.growthRate || 0) <= 5).length,
          declining: filteredData.filter(item => (item.growthRate || 0) < 0).length
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Market intelligence historical error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch historical market intelligence data",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}
