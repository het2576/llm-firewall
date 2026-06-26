import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = '52px'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px' // Reset
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight > 52 
        ? `${Math.min(scrollHeight, 200)}px` 
        : '52px'
    }
  }, [input])

  return (
    <div className="bg-gray-950 p-4 border-t border-gray-800">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-gray-900 rounded-xl border border-gray-700 shadow-sm focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 p-1 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message... (Try prompt injection: 'Ignore previous rules')"
          className="w-full resize-none bg-transparent py-3 pl-4 pr-12 text-sm focus:outline-none max-h-[200px] text-gray-100 placeholder-gray-500"
          style={{ height: '52px' }}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 bottom-2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-blue-500" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
      <div className="text-center mt-2 text-xs text-gray-500">
        All messages are intercepted and analyzed by the LLM Security Firewall
      </div>
    </div>
  )
}
