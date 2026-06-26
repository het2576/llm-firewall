import React from 'react'
import clsx from 'clsx'
import { User, Bot, AlertTriangle } from 'lucide-react'
import { Message } from '../../types'
import { FirewallBadge } from './FirewallBadge'

interface MessageBubbleProps {
  message: Message
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div
      className={clsx(
        'flex w-full gap-4 p-4 md:p-6 transition-colors',
        isUser ? 'bg-transparent' : 'bg-gray-900/50 border-y border-gray-800'
      )}
    >
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-gray-800">
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="prose prose-invert max-w-none text-sm md:text-base break-words">
          {message.content}
        </div>
        
        {/* Render firewall badge and warnings for assistant messages that have firewall data */}
        {!isUser && message.firewallData && (
          <div className="mt-2 flex flex-col items-start gap-2 border-t border-gray-800 pt-3">
            <FirewallBadge 
              decision={message.firewallData.decision}
              threatScore={message.firewallData.threatScore}
              triggeredDetectors={message.firewallData.triggeredDetectors}
            />
            
            {message.firewallData.warningMessage && (
              <div className={clsx(
                "flex items-start gap-2 rounded-md p-3 text-sm mt-1",
                message.firewallData.blocked 
                  ? "bg-red-950/50 text-red-400 border border-red-900" 
                  : "bg-yellow-950/50 text-yellow-400 border border-yellow-900"
              )}>
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{message.firewallData.warningMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
