import { getApiAdapter } from './adapter'

export function fetchGetDataHistoryList(params: Api.DataHistory.HistorySearchParams) {
  return getApiAdapter().get<Api.DataHistory.HistoryVersion[]>('/api/data-history', params)
}

export function fetchGetDataHistoryDetail(historyId: string) {
  return getApiAdapter().get<Api.DataHistory.HistoryVersionDetail>(`/api/data-history/${historyId}`)
}

export function fetchRollbackDataHistory(params: Api.DataHistory.RollbackParams) {
  return getApiAdapter().post<void>('/api/data-history/rollback', params)
}
