'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, LayoutDashboard, Trash2 } from 'lucide-react'
import { ChatWindow } from '../components/chat/ChatWindow'
import { ChatInput } from '../components/chat/ChatInput'
import { useChat } from '../hooks/useChat'

export default function Home() {
  const { messages, isLoading, sendMessage, clearChat } = useChat()

  return (
    <main className="flex h-screen flex-col bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">LLM Security Firewall</h1>
            <p className="text-xs text-gray-400">Protected Chat Interface</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            disabled={messages.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-gray-400"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-700"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Chat Area */}
      <ChatWindow messages={messages} />
      
      {/* Input Area */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </main>
  )
}
