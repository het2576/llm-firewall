import React from 'react'
import { ShieldAlert, ShieldCheck, Filter, AlertTriangle, Activity } from 'lucide-react'
import { AnalyticsData } from '../../types'

interface MetricsCardsProps {
  data: AnalyticsData['summary']
}

interface CardProps {
  label: string
  value: number
  icon: React.ElementType
  iconColor: string
  accentColor: string
  subtitle?: string
}

const Card: React.FC<CardProps> = ({ label, value, icon: Icon, iconColor, accentColor, subtitle }) => (
  <div
    style={{
      background: '#111111',
      border: '1px solid #2a2a2a',
      borderRadius: 12,
      padding: '20px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
      <span style={{ fontSize: 12, color: '#888', fontWeight: 500, lineHeight: 1 }}>{label}</span>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: `${accentColor}15`,
          border: `1px solid ${accentColor}25`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={14} color={iconColor} />
      </div>
    </div>
    <p style={{ fontSize: 30, fontWeight: 700, color: '#ededed', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
      {value.toLocaleString()}
    </p>
    {subtitle && (
      <p style={{ fontSize: 11, color: accentColor, marginTop: 8, opacity: 0.7 }}>{subtitle}</p>
    )}
  </div>
)

export const MetricsCards: React.FC<MetricsCardsProps> = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
    <Card label="Total Requests"  value={data.total}     icon={Activity}      iconColor="#aaa"     accentColor="#aaa"     subtitle="All intercepted" />
    <Card label="Allowed"         value={data.safe}      icon={ShieldCheck}   iconColor="#22c55e"  accentColor="#22c55e"  subtitle="Clean requests" />
    <Card label="Warned"          value={data.warned}    icon={AlertTriangle} iconColor="#f59e0b"  accentColor="#f59e0b"  subtitle="Flagged & passed" />
    <Card label="Sanitized"       value={data.sanitized} icon={Filter}        iconColor="#f97316"  accentColor="#f97316"  subtitle="Modified before pass" />
    <Card label="Blocked"         value={data.blocked}   icon={ShieldAlert}   iconColor="#ef4444"  accentColor="#ef4444"  subtitle={`${data.block_rate_percent}% block rate`} />
  </div>
)
