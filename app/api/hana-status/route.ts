import { NextResponse } from 'next/server';
import { getHanaClient } from '@/lib/sap-hana-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hanaClient = getHanaClient();
    
    if (!hanaClient.isConfigured()) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'SAP HANA credentials not configured',
        connected: false,
        error: 'Missing environment variables: SAP_HANA_SERVER_NODE, SAP_HANA_USERNAME, SAP_HANA_PASSWORD'
      }, { status: 503 });
    }

    const connectionStatus = await hanaClient.getConnectionStatus();
    
    if (connectionStatus.connected) {
      const tableInfo = await hanaClient.getTableInfo();
      
      return NextResponse.json({
        status: 'connected',
        message: 'SAP HANA connection successful',
        connected: true,
        connectionDetails: {
          serverNode: process.env.SAP_HANA_SERVER_NODE?.replace(/:.+/, ':****') || 'Not configured',
          username: process.env.SAP_HANA_USERNAME || 'Not configured',
          lastConnected: connectionStatus.lastConnected,
          serverInfo: connectionStatus.serverInfo
        },
        databaseInfo: {
          schema: 'TRADE_INTELLIGENCE',
          tables: tableInfo,
          totalTables: tableInfo.length
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'connection_failed',
        message: 'Failed to connect to SAP HANA',
        connected: false,
        error: connectionStatus.error,
        connectionAttempts: hanaClient.getConnectionAttempts(),
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

  } catch (error) {
    console.error('SAP HANA status check error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error checking SAP HANA status',
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
