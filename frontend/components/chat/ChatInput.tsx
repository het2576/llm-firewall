import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Shield } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSendMessage(trimmed)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  const canSend = input.trim().length > 0 && !isLoading

  return (
    <div
      style={{
        borderTop: '1px solid #1a1a1a',
        background: '#000',
        padding: '12px 20px 16px',
        flexShrink: 0,
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Input wrapper */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            background: '#0a0a0a',
            border: `1px solid ${focused ? '#333' : '#1a1a1a'}`,
            borderRadius: 12,
            transition: 'border-color 0.15s',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Message LLM Firewall…"
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              resize: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '14px 52px 14px 16px',
              fontSize: 14,
              color: '#ededed',
              lineHeight: 1.6,
              minHeight: 52,
              maxHeight: 200,
              fontFamily: 'inherit',
            }}
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canSend ? 'pointer' : 'not-allowed',
              background: canSend ? '#0070f3' : '#111',
              color: canSend ? '#fff' : '#333',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (canSend) (e.currentTarget as HTMLButtonElement).style.background = '#0060df'
            }}
            onMouseLeave={(e) => {
              if (canSend) (e.currentTarget as HTMLButtonElement).style.background = '#0070f3'
            }}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>

        {/* Footer hint */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: '#333',
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Shield size={11} color="#333" />
          Protected by LLM Security Firewall · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
