import { Server } from 'socket.io'
import { getRealTimeDataService } from './real-time-data-service'

let io: Server | null = null

export function initializeWebSocketServer(server: any) {
  if (io) return io

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  const dataService = getRealTimeDataService()

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Send initial data
    socket.emit('connection-status', { status: 'connected', timestamp: new Date().toISOString() })

    // Handle client requests for specific data
    socket.on('request-market-data', async () => {
      try {
        const marketData = await dataService.getMarketData()
        socket.emit('market-data-update', marketData)
      } catch (error) {
        console.error('Market data error:', error)
        socket.emit('error', { message: 'Failed to fetch market data' })
      }
    })

    socket.on('request-risk-data', async (country: string) => {
      try {
        const riskData = await dataService.getRiskData(country)
        socket.emit('risk-data-update', riskData)
      } catch (error) {
        console.error('Risk data error:', error)
        socket.emit('error', { message: 'Failed to fetch risk data' })
      }
    })

    socket.on('request-tariff-data', async (data: { product: string, fromCountry: string, toCountry: string }) => {
      try {
        const tariffData = await dataService.getTariffData(data.product, data.fromCountry, data.toCountry)
        socket.emit('tariff-data-update', tariffData)
      } catch (error) {
        console.error('Tariff data error:', error)
        socket.emit('error', { message: 'Failed to fetch tariff data' })
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  // Broadcast real-time updates every 30 seconds
  setInterval(async () => {
    try {
      const marketData = await dataService.getMarketData()
      const economicData = await dataService.getEconomicIndicators()
      
      io?.emit('real-time-update', {
        type: 'market-update',
        data: {
          marketData,
          economicData,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Real-time update error:', error)
    }
  }, 30000)

  return io
}

export function getWebSocketServer() {
  return io
}
