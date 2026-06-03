import { getApiAdapter } from './adapter'

export function fetchGetAiProcessStatus(params?: Api.AiProcess.StatusSearchParams) {
  return getApiAdapter().get<Api.AiProcess.ProcessStatus>('/api/ai-process/status', params)
}

export function fetchGetAiProcessHistory(params?: Api.AiProcess.HistorySearchParams) {
  return getApiAdapter().get<Api.AiProcess.ProcessRecord[]>('/api/ai-process/history', params)
}

export function fetchGetAiProcessHistoryDetail(recordId: string) {
  return getApiAdapter().get<Api.AiProcess.ProcessRecordDetail>(
    `/api/ai-process/history/${recordId}`
  )
}
