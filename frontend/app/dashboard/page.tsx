'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, MessageSquare, Loader2, RefreshCw } from 'lucide-react'
import { MetricsCards } from '../../components/dashboard/MetricsCards'
import { ThreatChart } from '../../components/dashboard/ThreatChart'
import { LogsTable } from '../../components/dashboard/LogsTable'
import { getDashboard } from '../../services/api'
import { AnalyticsData } from '../../types'

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getDashboard()
      setData(result)
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto refresh every 30s
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight text-white">Firewall Admin Dashboard</h1>
            <p className="text-sm text-gray-400">Security metrics and threat intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-sm font-medium rounded-lg transition-colors border border-gray-700 disabled:opacity-50 flex-1 md:flex-none"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex-1 md:flex-none shadow-lg shadow-blue-900/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Go to Chat</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      {isLoading && !data ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p>Loading security metrics...</p>
        </div>
      ) : error ? (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-center">
          <p className="text-red-400 font-medium mb-2">Error loading dashboard</p>
          <p className="text-sm text-red-500/80">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 text-sm rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6 max-w-7xl mx-auto">
          <MetricsCards data={data.summary} />
          <ThreatChart data={data} />
          <LogsTable logs={data.recent_blocked} />
        </div>
      ) : null}
    </div>
  )
}
