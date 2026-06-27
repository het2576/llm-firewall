import React from 'react'
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'

interface FirewallBadgeProps {
  decision: string
  threatScore: number
  triggeredDetectors: string[]
  warningMessage?: string
}

const CFG = {
  allow: {
    label: 'Allowed',
    Icon: ShieldCheck,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
    bar: '#22c55e',
  },
  warn: {
    label: 'Warning',
    Icon: AlertTriangle,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    bar: '#f59e0b',
  },
  sanitize: {
    label: 'Sanitized',
    Icon: Shield,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.25)',
    bar: '#f97316',
  },
  block: {
    label: 'Blocked',
    Icon: ShieldAlert,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    bar: '#ef4444',
  },
} as const

export const FirewallBadge: React.FC<FirewallBadgeProps> = ({
  decision,
  threatScore,
  triggeredDetectors,
  warningMessage,
}) => {
  const cfg = CFG[decision as keyof typeof CFG] ?? CFG.allow
  const { Icon } = cfg

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 8,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 10,
      padding: '10px 13px',
      minWidth: 200,
      maxWidth: 290,
    }}>
      {/* Label + score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={13} color={cfg.color} />
          <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {cfg.label}
          </span>
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: cfg.color, opacity: 0.65 }}>
          {threatScore}/100
        </span>
      </div>

      {/* Score bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(threatScore, 100)}%`,
          background: cfg.bar,
          borderRadius: 99,
        }} />
      </div>

      {/* Detectors */}
      {triggeredDetectors.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {triggeredDetectors.map((d) => (
            <span key={d} style={{
              fontSize: 9, fontFamily: 'monospace',
              color: cfg.color, opacity: 0.8,
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${cfg.border}`,
              borderRadius: 4,
              padding: '2px 6px',
            }}>
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Warning text */}
      {warningMessage && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 6,
          paddingTop: 8, borderTop: `1px solid ${cfg.border}`,
        }}>
          <AlertTriangle size={11} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11, color: cfg.color, opacity: 0.85, lineHeight: 1.45 }}>
            {warningMessage}
          </span>
        </div>
      )}
    </div>
  )
}
