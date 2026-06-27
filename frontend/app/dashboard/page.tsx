'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, MessageSquare, RefreshCw, ShieldAlert } from 'lucide-react'
import { MetricsCards } from '../../components/dashboard/MetricsCards'
import { ThreatChart } from '../../components/dashboard/ThreatChart'
import { LogsTable } from '../../components/dashboard/LogsTable'
import { getDashboard } from '../../services/api'
import { AnalyticsData } from '../../types'

const formatIST = (date: Date) =>
  date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getDashboard()
      setData(result)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#000', color: '#ededed' }}>
      {/* Vercel-style sticky navbar */}
      <header
        className="sticky top-0 z-20"
        style={{
          height: '60px',
          borderBottom: '1px solid #1a1a1a',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="h-full flex items-center justify-between mx-auto"
          style={{ maxWidth: 1280, padding: '0 24px' }}
        >
          {/* Left: logo + subtitle */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-md"
              style={{ width: 28, height: 28, background: '#0070f3', flexShrink: 0 }}
            >
              <Shield size={14} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#ededed', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Security Dashboard
              </p>
              <p style={{ fontSize: 11, color: '#555', lineHeight: 1.2, marginTop: 1 }}>
                {isLoading && !data
                  ? 'Loading…'
                  : lastUpdated
                  ? `IST ${formatIST(lastUpdated)} · auto-refreshes`
                  : 'Auto-refreshes every 30s'}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center" style={{ gap: 8 }}>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-1.5 transition-colors"
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                border: '1px solid #1a1a1a',
                background: 'transparent',
                color: isLoading ? '#333' : '#888',
                fontSize: 13,
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#333'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#ededed'
                }
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#1a1a1a'
                ;(e.currentTarget as HTMLButtonElement).style.color = isLoading ? '#333' : '#888'
              }}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 transition-colors"
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                border: '1px solid #0070f3',
                background: '#0070f3',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = '#0060df'
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#0060df'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = '#0070f3'
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#0070f3'
              }}
            >
              <MessageSquare size={13} />
              <span className="hidden sm:inline">Back to Chat</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>
        {isLoading && !data ? (
          <div className="flex flex-col items-center justify-center gap-4" style={{ height: 300 }}>
            <div className="relative" style={{ width: 36, height: 36 }}>
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid #1a1a1a' }}
              />
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{ border: '2px solid #0070f3', borderTopColor: 'transparent' }}
              />
            </div>
            <p style={{ fontSize: 13, color: '#555' }}>Loading security metrics…</p>
          </div>
        ) : error ? (
          <div
            className="flex flex-col items-center gap-4 text-center"
            style={{
              border: '1px solid #2a0a0a',
              borderRadius: 12,
              background: '#0a0000',
              padding: '48px 32px',
            }}
          >
            <ShieldAlert size={36} color="#e00" />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#ff4444', marginBottom: 4 }}>
                Failed to load dashboard
              </p>
              <p style={{ fontSize: 13, color: '#555' }}>{error}</p>
            </div>
            <button
              onClick={fetchData}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #2a0a0a',
                background: 'transparent',
                color: '#ff6666',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <MetricsCards data={data.summary} />
            <ThreatChart data={data} />
            <LogsTable logs={data.recent_blocked} />
          </div>
        ) : null}
      </main>
    </div>
  )
}
