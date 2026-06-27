import axios from 'axios'
import type { 
  ChatResponse, 
  AnalyticsData, 
  PaginatedLogs 
} from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const sendChat = async (prompt: string, userId?: string): Promise<ChatResponse> => {
  const response = await api.post('/chat', { prompt, user_id: userId })
  return response.data
}

export const analyzePrompt = async (prompt: string) => {
  const response = await api.post('/analyze', { prompt })
  return response.data
}

export const getLogs = async (page = 1, decision?: string): Promise<PaginatedLogs> => {
  const params = new URLSearchParams({ page: page.toString() })
  if (decision && decision !== 'all') {
    params.append('decision', decision)
  }
  const response = await api.get(`/logs?${params.toString()}`)
  return response.data
}

export const getAnalytics = async (days = 7): Promise<AnalyticsData> => {
  const response = await api.get(`/analytics?days=${days}`)
  return response.data
}

export const getDashboard = async (): Promise<AnalyticsData> => {
  const response = await api.get('/dashboard')
  return response.data
}

export const submitFeedback = async (requestId: string, isFalsePositive: boolean): Promise<void> => {
  await api.post('/feedback', { request_id: requestId, is_false_positive: isFalsePositive })
}
