'use client'

import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { AnalyticsData } from '../../types'

interface ThreatChartProps {
  data: AnalyticsData
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#0070f3', '#8b5cf6', '#ec4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.9)' }}>
      {label && <p style={{ color: '#666', margin: '0 0 4px' }}>{label} IST</p>}
      {payload.map((e: any, i: number) => (
        <p key={i} style={{ color: e.fill ?? '#ededed', fontWeight: 600, margin: 0 }}>
          {e.name}: <span style={{ color: '#ededed' }}>{e.value}</span>
        </p>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.9)' }}>
      <p style={{ color: '#ededed', fontWeight: 600, margin: 0 }}>
        {payload[0].name}: <span>{payload[0].value}</span>
      </p>
    </div>
  )
}

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// Fill every hour 00:00–23:00 with 0 if missing so the chart is never a spike
const fill24Hours = (byHour: Array<{ hour: string; count: number }>) => {
  const map = new Map(byHour.map((d) => [d.hour, d.count]))
  return Array.from({ length: 24 }, (_, h) => {
    const key = `${String(h).padStart(2, '0')}:00`
    return { name: key, Requests: map.get(key) ?? 0 }
  })
}

// Only show every 3rd hour label to avoid crowding
const hourTick = (value: string, index: number) =>
  index % 3 === 0 ? value : ''

const CARD: React.CSSProperties = {
  background: '#111111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px',
}

export const ThreatChart: React.FC<ThreatChartProps> = ({ data }) => {
  const pieData = Object.entries(data?.by_attack_type || {})
    .map(([k, v]) => ({ name: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: v }))
    .sort((a, b) => b.value - a.value)

  const barData = fill24Hours(data?.by_hour || [])
  const hasTraffic = barData.some((d) => d.Requests > 0)

  const EMPTY = (
    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#333' }}>
      No data yet.
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12 }}>
      {/* Bar chart — 24h traffic (IST hours) */}
      <div style={CARD}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ededed', margin: '0 0 4px' }}>Firewall Traffic (24h IST)</p>
        <p style={{ fontSize: 11, color: '#555', margin: 0 }}>Requests per hour in IST</p>

        {hasTraffic ? (
          <div style={{ marginTop: 20, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barSize={8}>
                <CartesianGrid strokeDasharray="1 4" stroke="#1a1a1a" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickFormatter={hourTick}
                  tick={{ fill: '#555', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Requests" fill="#0070f3" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : EMPTY}
      </div>

      {/* Donut chart — threat types */}
      <div style={CARD}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ededed', margin: '0 0 4px' }}>Threats by Category</p>
        <p style={{ fontSize: 11, color: '#555', margin: 0 }}>Attack type distribution</p>

        {pieData.length > 0 ? (
          <div style={{ marginTop: 4, height: 248 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="42%"
                  innerRadius={50} outerRadius={76}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={PieLabel}
                  strokeWidth={0}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle" iconSize={6}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(v: string) => <span style={{ color: '#666' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: 248, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#333' }}>
            No threats detected.
          </div>
        )}
      </div>
    </div>
  )
}
