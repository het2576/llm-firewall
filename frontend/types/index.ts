export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  firewallData?: FirewallData
}

export interface FirewallData {
  blocked: boolean
  decision: "allow" | "warn" | "sanitize" | "block"
  threatScore: number
  triggeredDetectors: string[]
  requestId: string
  warningMessage?: string
}

export interface AnalyticsData {
  summary: {
    total: number
    safe: number
    warned: number
    sanitized: number
    blocked: number
    avg_threat_score: number
    block_rate_percent: number
  }
  by_attack_type: Record<string, number>
  by_hour: Array<{ hour: string; count: number }>
  by_day: Array<{ date: string; count: number }>
  top_patterns: Array<{ pattern: string; count: number }>
  recent_blocked?: LogEntry[]
}

export interface Detection {
  id: string
  detector_name: string
  confidence: number | null
  score_contribution: number
  matched_pattern: string | null
  category: string
}

export interface LogEntry {
  id: string
  timestamp: string
  prompt: string
  threat_score: number
  decision: string
  processing_time: number
  detections?: Detection[]
  is_false_positive?: boolean
}

export interface PaginatedLogs {
  requests: LogEntry[]
  total: number
  page: number
}

export interface ChatRequest {
  prompt: string
  user_id?: string
}

export interface ChatResponse {
  response: string | null
  blocked: boolean
  decision: "allow" | "warn" | "sanitize" | "block"
  threat_score: number
  request_id: string
  triggered_detectors: string[]
  warning_message: string | null
}
