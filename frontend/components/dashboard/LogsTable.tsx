import React from 'react'
import { AlertCircle, Clock, ShieldOff } from 'lucide-react'
import { LogEntry } from '../../types'

interface LogsTableProps {
  logs?: LogEntry[]
}

const DECISION: Record<string, { label: string; color: string; bg: string; border: string }> = {
  block:    { label: 'Blocked',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)'   },
  warn:     { label: 'Warned',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)'  },
  sanitize: { label: 'Sanitized', color: '#f97316', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.25)'  },
  allow:    { label: 'Allowed',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.25)'   },
}

// Backend stores UTC; ensure JavaScript treats the string as UTC before converting
const parseUTC = (ts: string): Date => {
  if (!ts) return new Date()
  // If no timezone suffix, append Z to force UTC interpretation
  const normalized = /[Z+\-]\d*$/.test(ts.trim()) ? ts : ts + 'Z'
  return new Date(normalized)
}

const formatIST = (date: Date) =>
  date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })

const formatDateIST = (date: Date) =>
  date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })

export const LogsTable: React.FC<LogsTableProps> = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div style={{
        background: '#111', border: '1px solid #2a2a2a', borderRadius: 12,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 10, padding: '64px 32px', textAlign: 'center',
      }}>
        <ShieldOff size={32} color="#2a2a2a" />
        <p style={{ fontSize: 13, color: '#555', fontWeight: 500, margin: 0 }}>No blocked requests yet</p>
        <p style={{ fontSize: 12, color: '#333', margin: 0 }}>Blocked threats will appear here</p>
      </div>
    )
  }

  const TH: React.CSSProperties = {
    padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 600,
    color: '#444', textTransform: 'uppercase', letterSpacing: '0.07em',
    whiteSpace: 'nowrap', background: '#0a0a0a', borderBottom: '1px solid #1a1a1a',
  }

  return (
    <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderBottom: '1px solid #1a1a1a' }}>
        <AlertCircle size={14} color="#ef4444" />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#ededed' }}>Recent Blocked Threats</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#666', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 99, padding: '2px 8px' }}>
          {logs.length}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH}>Time (IST)</th>
              <th style={TH}>Decision</th>
              <th style={TH}>Score</th>
              <th style={TH}>Prompt</th>
              <th style={TH}>Detectors</th>
              <th style={{ ...TH, textAlign: 'right' }}>Latency</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => {
              const date = parseUTC(log.timestamp)
              const d = DECISION[log.decision] ?? DECISION.block
              const rowBg = i % 2 === 1 ? '#0d0d0d' : 'transparent'
              return (
                <tr
                  key={log.id}
                  style={{ borderBottom: '1px solid #1a1a1a', background: rowBg, transition: 'background 0.1s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#1a1a1a')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = rowBg)}
                >
                  <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>{formatDateIST(date)}</p>
                    <p style={{ fontSize: 11, color: '#555', margin: '2px 0 0' }}>{formatIST(date)}</p>
                  </td>

                  <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: d.color, background: d.bg, border: `1px solid ${d.border}`, borderRadius: 99, padding: '3px 9px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {d.label}
                    </span>
                  </td>

                  <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 56, height: 3, background: '#1a1a1a', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(log.threat_score, 100)}%`, background: '#ef4444', borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{log.threat_score}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 20px', maxWidth: 280 }}>
                    <p style={{ fontSize: 11, color: '#666', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }} title={log.prompt}>
                      {log.prompt || '<empty>'}
                    </p>
                  </td>

                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {log.detections && log.detections.length > 0 ? (
                        <>
                          {log.detections.slice(0, 2).map((det) => (
                            <span key={det.id} style={{ fontSize: 9, fontFamily: 'monospace', color: '#666', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '2px 6px' }}>
                              {det.detector_name}
                            </span>
                          ))}
                          {log.detections.length > 2 && (
                            <span style={{ fontSize: 10, color: '#444', alignSelf: 'center' }}>+{log.detections.length - 2}</span>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: '#333' }}>—</span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: '12px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#555' }}>
                      <Clock size={11} />
                      {log.processing_time ? `${Math.round(log.processing_time)}ms` : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
