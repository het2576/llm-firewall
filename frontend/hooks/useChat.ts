import { useState, useCallback, useEffect } from 'react'
import { Message } from '../types'
import { sendChat } from '../services/api'

const STORAGE_KEY = 'llm-firewall-chat'

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setMessages(
          parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        )
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever messages change
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          messages.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() }))
        )
      )
    } catch {}
  }, [messages, hydrated])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendChat(content.trim(), 'demo_user')

      const assistantMessage: Message = {
        id: response.request_id,
        role: 'assistant',
        content: response.response || 'This message was blocked by the security firewall.',
        timestamp: new Date(),
        firewallData: {
          blocked: response.blocked,
          decision: response.decision,
          threatScore: response.threat_score,
          triggeredDetectors: response.triggered_detectors,
          requestId: response.request_id,
          warningMessage: response.warning_message || undefined,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `Connection error: ${err.message || 'Failed to communicate with the server.'}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }, [])

  return { messages, isLoading, error, sendMessage, clearChat }
}
