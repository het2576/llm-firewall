'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, LayoutDashboard, Plus } from 'lucide-react'
import { ChatWindow } from '../components/chat/ChatWindow'
import { ChatInput } from '../components/chat/ChatInput'
import { useChat } from '../hooks/useChat'

export default function Home() {
  const { messages, isLoading, sendMessage, clearChat } = useChat()

  return (
    <div className="flex h-screen flex-col" style={{ background: '#000' }}>
      {/* Vercel-style navbar */}
      <header
        className="flex items-center justify-between shrink-0"
        style={{
          height: '60px',
          padding: '0 20px',
          borderBottom: '1px solid #1a1a1a',
          background: '#000',
        }}
      >
        {/* Left: logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-md"
            style={{ width: 28, height: 28, background: '#0070f3' }}
          >
            <Shield size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#ededed', letterSpacing: '-0.01em' }}>
            LLM Firewall
          </span>
          <span
            style={{
              fontSize: 11,
              color: '#444',
              background: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: 4,
              padding: '1px 6px',
              fontWeight: 500,
            }}
          >
            Protected
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center" style={{ gap: 8 }}>
          <button
            onClick={clearChat}
            disabled={messages.length === 0}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              height: 32,
              padding: '0 12px',
              borderRadius: 6,
              border: '1px solid #1a1a1a',
              background: 'transparent',
              color: messages.length === 0 ? '#333' : '#888',
              fontSize: 13,
              fontWeight: 500,
              cursor: messages.length === 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (messages.length > 0) {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#333'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#ededed'
              }
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#1a1a1a'
              ;(e.currentTarget as HTMLButtonElement).style.color = messages.length === 0 ? '#333' : '#888'
            }}
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 transition-colors"
            style={{
              height: 32,
              padding: '0 12px',
              borderRadius: 6,
              border: '1px solid #333',
              background: '#111',
              color: '#ededed',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.background = '#1a1a1a'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#444'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.background = '#111'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#333'
            }}
          >
            <LayoutDashboard size={13} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Chat */}
      <ChatWindow messages={messages} isLoading={isLoading} onSendMessage={sendMessage} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  )
}
