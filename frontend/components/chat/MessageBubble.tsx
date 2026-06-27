import React from 'react'
import { Shield, AlertTriangle } from 'lucide-react'
import { Message } from '../../types'
import { FirewallBadge } from './FirewallBadge'

interface MessageBubbleProps {
  message: Message
}

const formatIST = (date: Date) =>
  date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: '#888',
          background: '#111', border: '1px solid #2a2a2a',
          borderRadius: 99, padding: '6px 14px',
        }}>
          <AlertTriangle size={12} color="#f59e0b" />
          <span>{message.content}</span>
        </div>
      </div>
    )
  }

  if (isUser) {
    return (
      <div className="group" style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 0' }}>
        <div style={{ maxWidth: '72%' }}>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '16px 16px 4px 16px',
            padding: '10px 14px',
            fontSize: 14,
            color: '#ededed',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {message.content}
          </div>
          <p className="opacity-0 group-hover:opacity-100 transition-opacity" style={{
            fontSize: 10, color: '#444', textAlign: 'right', marginTop: 4,
          }}>
            {formatIST(message.timestamp)} IST
          </p>
        </div>
      </div>
    )
  }

  const isBlocked = message.firewallData?.blocked

  return (
    <div className="group" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0' }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 2,
        background: isBlocked ? '#1a0808' : '#111',
        border: `1px solid ${isBlocked ? '#3a1010' : '#2a2a2a'}`,
      }}>
        <Shield size={13} color={isBlocked ? '#ef4444' : '#0070f3'} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, maxWidth: '88%' }}>
        <p style={{
          fontSize: 14,
          color: isBlocked ? '#f87171' : '#ededed',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          margin: 0,
        }}>
          {message.content}
        </p>

        {message.firewallData && (
          <div style={{ marginTop: 10 }}>
            <FirewallBadge
              decision={message.firewallData.decision}
              threatScore={message.firewallData.threatScore}
              triggeredDetectors={message.firewallData.triggeredDetectors}
              warningMessage={message.firewallData.warningMessage}
            />
          </div>
        )}

        <p className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: 10, color: '#444', marginTop: 4 }}>
          {formatIST(message.timestamp)} IST
        </p>
      </div>
    </div>
  )
}
