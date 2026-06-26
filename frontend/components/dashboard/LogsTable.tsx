import React from 'react'
import { AlertCircle, Clock, ShieldAlert } from 'lucide-react'
import { LogEntry } from '../../types'

interface LogsTableProps {
  logs?: LogEntry[]
}

export const LogsTable: React.FC<LogsTableProps> = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
        <ShieldAlert className="w-12 h-12 mx-auto text-gray-700 mb-3" />
        <p>No blocked requests recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Recent Blocked Threats
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950/50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-6 py-3 font-medium">Time</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3 font-medium">Prompt Snippet</th>
              <th className="px-6 py-3 font-medium">Detectors Fired</th>
              <th className="px-6 py-3 font-medium text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {logs.map((log) => {
              const date = new Date(log.timestamp)
              const timeString = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
              
              return (
                <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {timeString}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/50">
                      {log.threat_score}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md truncate font-mono text-xs text-gray-300" title={log.prompt}>
                      {log.prompt || "<empty>"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {log.detections && log.detections.length > 0 ? (
                        log.detections.map(det => (
                          <span key={det.id} className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-400 border border-gray-700">
                            {det.detector_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400 text-xs">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {log.processing_time ? `${Math.round(log.processing_time)}ms` : '-'}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
