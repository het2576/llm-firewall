import React from 'react'

interface FirewallBadgeProps {
  decision: string
  threatScore: number
  triggeredDetectors: string[]
}

export const FirewallBadge: React.FC<FirewallBadgeProps> = ({
  decision,
  threatScore,
  triggeredDetectors,
}) => {
  let badgeColor = 'bg-gray-500 text-white'
  let label = 'UNKNOWN'
  let icon = '❓'

  switch (decision) {
    case 'allow':
      badgeColor = 'bg-green-600/20 text-green-400 border-green-500/30'
      label = 'ALLOWED'
      icon = '🟢'
      break
    case 'warn':
      badgeColor = 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
      label = 'WARNED'
      icon = '🟡'
      break
    case 'sanitize':
      badgeColor = 'bg-orange-600/20 text-orange-400 border-orange-500/30'
      label = 'SANITIZED'
      icon = '🔧'
      break
    case 'block':
      badgeColor = 'bg-red-600/20 text-red-400 border-red-500/30'
      label = 'BLOCKED'
      icon = '🔴'
      break
  }

  return (
    <div 
      className={`group relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium cursor-help transition-colors mt-1 ${badgeColor}`}
    >
      <span>{icon}</span>
      <span>
        {label} ({threatScore}/100)
      </span>

      {triggeredDetectors.length > 0 && (
        <div className="absolute left-0 top-full z-10 mt-2 hidden w-max max-w-xs flex-col gap-1 rounded-md border border-gray-700 bg-gray-900 p-2 text-gray-300 shadow-xl group-hover:flex">
          <p className="font-semibold text-gray-400 mb-1">Detectors Fired:</p>
          {triggeredDetectors.map((detector) => (
            <span key={detector} className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-[10px]">
              {detector}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
