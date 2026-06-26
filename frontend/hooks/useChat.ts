import { useState, useCallback } from 'react'
import { Message } from '../types'
import { sendChat } from '../services/api'

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      // In a real app we might pass a session-based user_id
      const response = await sendChat(content.trim(), 'demo_user')
      
      const assistantMessage: Message = {
        id: response.request_id,
        role: 'assistant',
        content: response.response || 'Message blocked by firewall.',
        timestamp: new Date(),
        firewallData: {
          blocked: response.blocked,
          decision: response.decision,
          threatScore: response.threat_score,
          triggeredDetectors: response.triggered_detectors,
          requestId: response.request_id,
          warningMessage: response.warning_message || undefined
        }
      }
      
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      console.error('Chat error:', err)
      setError(err.message || 'Failed to send message')
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `Error: ${err.message || 'Failed to communicate with the server.'}`,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  }
}
