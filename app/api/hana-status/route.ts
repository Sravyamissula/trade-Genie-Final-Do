import { NextResponse } from 'next/server';
import { getHanaClient } from '@/lib/sap-hana-client';

export async function GET() {
  const hanaClient = getHanaClient();
  
  try {
    // Check if SAP HANA is configured
    if (!hanaClient.isConfigured()) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'SAP HANA credentials not configured',
        configured: false,
        connected: false,
        tables: [],
        error: 'Missing SAP_HANA_SERVER_NODE, SAP_HANA_USERNAME, or SAP_HANA_PASSWORD environment variables'
      });
    }

    // Test connection
    const isConnected = await hanaClient.testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'connection_failed',
        message: 'Failed to connect to SAP HANA',
        configured: true,
        connected: false,
        tables: [],
        error: 'Unable to establish connection to SAP HANA database'
      });
    }

    // Get table information
    const tables = await hanaClient.getTableInfo();
    
    // Get some sample data counts
    const sampleQueries = [
      { name: 'Countries', query: 'SELECT COUNT(*) as count FROM COUNTRIES' },
      { name: 'Products', query: 'SELECT COUNT(*) as count FROM PRODUCTS' },
      { name: 'Tariff Data', query: 'SELECT COUNT(*) as count FROM TARIFF_DATA' },
      { name: 'Trade Risk Analytics', query: 'SELECT COUNT(*) as count FROM TRADE_RISK_ANALYTICS' },
      { name: 'Market Intelligence', query: 'SELECT COUNT(*) as count FROM MARKET_INTELLIGENCE' }
    ];

    const dataCounts: Record<string, number> = {};
    
    for (const { name, query } of sampleQueries) {
      try {
        const result = await hanaClient.execute(query);
        dataCounts[name] = result[0]?.COUNT || 0;
      } catch (error) {
        dataCounts[name] = 0;
      }
    }

    return NextResponse.json({
      status: 'connected',
      message: 'Successfully connected to SAP HANA',
      configured: true,
      connected: true,
      tables: tables,
      dataCounts: dataCounts,
      serverInfo: {
        serverNode: process.env.SAP_HANA_SERVER_NODE?.split('@')[1] || 'Unknown',
        username: process.env.SAP_HANA_USERNAME || 'Unknown'
      }
    });

  } catch (error) {
    console.error('SAP HANA status check error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error checking SAP HANA status',
      configured: hanaClient.isConfigured(),
      connected: false,
      tables: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
