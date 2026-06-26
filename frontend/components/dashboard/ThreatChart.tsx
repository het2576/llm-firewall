'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { AnalyticsData } from '../../types'

interface ThreatChartProps {
  data: AnalyticsData
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899']

export const ThreatChart: React.FC<ThreatChartProps> = ({ data }) => {
  // Format data for PieChart
  const pieData = Object.entries(data?.by_attack_type || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  })).sort((a, b) => b.value - a.value)

  // Format data for BarChart (Traffic by Hour)
  const barData = (data?.by_hour || []).map(item => ({
    name: item.hour,
    Requests: item.count
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attack Types Pie Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Detected Threats by Category</h3>
        {pieData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-gray-500">
            No threats detected in this period.
          </div>
        )}
      </div>

      {/* Traffic Bar Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Firewall Traffic (24h)</h3>
        {barData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                  cursor={{ fill: '#1f2937' }}
                />
                <Bar dataKey="Requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-gray-500">
            No traffic data available.
          </div>
        )}
      </div>
    </div>
  )
}
