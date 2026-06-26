import React from 'react'
import { ShieldAlert, ShieldCheck, Filter, AlertTriangle } from 'lucide-react'
import { AnalyticsData } from '../../types'

interface MetricsCardsProps {
  data: AnalyticsData['summary']
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-400 text-sm font-medium">Total Prompts</p>
          <div className="p-2 bg-gray-800 rounded-lg"><Filter className="w-4 h-4 text-gray-400" /></div>
        </div>
        <h3 className="text-2xl font-bold text-white">{data.total}</h3>
      </div>
      
      <div className="bg-gray-900 border border-green-900/50 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <p className="text-green-400/80 text-sm font-medium">Allowed</p>
          <div className="p-2 bg-green-950/50 rounded-lg"><ShieldCheck className="w-4 h-4 text-green-500" /></div>
        </div>
        <h3 className="text-2xl font-bold text-white">{data.safe}</h3>
      </div>
      
      <div className="bg-gray-900 border border-yellow-900/50 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <p className="text-yellow-400/80 text-sm font-medium">Warned</p>
          <div className="p-2 bg-yellow-950/50 rounded-lg"><AlertTriangle className="w-4 h-4 text-yellow-500" /></div>
        </div>
        <h3 className="text-2xl font-bold text-white">{data.warned}</h3>
      </div>
      
      <div className="bg-gray-900 border border-orange-900/50 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <p className="text-orange-400/80 text-sm font-medium">Sanitized</p>
          <div className="p-2 bg-orange-950/50 rounded-lg"><Filter className="w-4 h-4 text-orange-500" /></div>
        </div>
        <h3 className="text-2xl font-bold text-white">{data.sanitized}</h3>
      </div>
      
      <div className="bg-gray-900 border border-red-900/50 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="flex justify-between items-start mb-2 relative z-10">
          <p className="text-red-400/80 text-sm font-medium">Blocked</p>
          <div className="p-2 bg-red-950/50 rounded-lg"><ShieldAlert className="w-4 h-4 text-red-500" /></div>
        </div>
        <div className="flex items-end gap-2 relative z-10">
          <h3 className="text-2xl font-bold text-white">{data.blocked}</h3>
          <span className="text-sm font-medium text-red-400 mb-1">({data.block_rate_percent}%)</span>
        </div>
      </div>
    </div>
  )
}
