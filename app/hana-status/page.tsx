'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Server, Key } from 'lucide-react'

interface ConnectionStatus {
  connected: boolean
  database: string
  lastChecked: string
  error?: string
}

interface EnvironmentStatus {
  configured: boolean
  variables: Record<string, boolean>
  missing: string[]
  error?: string
}

interface StatusData {
  connection: ConnectionStatus
  environment: EnvironmentStatus
  dataSource: string
  timestamp: string
  recommendations: string[]
}

export default function HanaStatusPage() {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hana-status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      setTesting(true)
      const response = await fetch('/api/hana-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-connection' })
      })
      const data = await response.json()
      
      // Refresh status after test
      await fetchStatus()
    } catch (error) {
      console.error('Connection test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading status...</span>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load status information</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SAP HANA Cloud Status</h1>
          <p className="text-muted-foreground">Monitor your database connection and configuration</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchStatus} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={testConnection} disabled={testing}>
            <Database className={`h-4 w-4 mr-2 ${testing ? 'animate-pulse' : ''}`} />
            Test Connection
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>Current database connection information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <div className="flex items-center gap-2">
              {status.connection.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <Badge variant={status.connection.connected ? 'default' : 'destructive'}>
                {status.connection.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Database:</span>
            <Badge variant="outline">{status.connection.database}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Data Source:</span>
            <Badge variant={status.dataSource === 'SAP HANA Cloud' ? 'default' : 'secondary'}>
              {status.dataSource}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Last Checked:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(status.connection.lastChecked).toLocaleString()}
            </span>
          </div>

          {status.connection.error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{status.connection.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Environment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Environment Configuration
          </CardTitle>
          <CardDescription>Required environment variables for SAP HANA connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Configuration Status:</span>
            <Badge variant={status.environment.configured ? 'default' : 'destructive'}>
              {status.environment.configured ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>

          <div className="space-y-2">
            <span className="font-medium">Environment Variables:</span>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(status.environment.variables).map(([key, configured]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                  <code className="text-sm">{key}</code>
                  {configured ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {status.environment.missing.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Missing environment variables: {status.environment.missing.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Suggested actions to improve your setup</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {status.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {!status.environment.configured && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>How to configure SAP HANA Cloud connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Set Environment Variables</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
{`SAP_HANA_SERVER_NODE=your-server:443
SAP_HANA_USERNAME=your-username
SAP_HANA_PASSWORD=your-password`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Restart Application</h4>
              <p className="text-sm text-muted-foreground">
                After setting the environment variables, restart your application to apply the changes.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Test Connection</h4>
              <p className="text-sm text-muted-foreground">
                Use the "Test Connection" button above to verify your SAP HANA Cloud connection.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
