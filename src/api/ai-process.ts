import { getApiAdapter } from './adapter'

/** 查询AI处理状态(按type+businessId，返回最新一条) — 轮询接口，关闭全局弹错 */
export function fetchGetAiProcessStatus(params: Api.AiProcess.StatusQueryParams) {
  return getApiAdapter().get<Api.AiProcess.AiProcessRecord>('/api/ai-process/status', params, {
    showErrorMessage: false
  })
}

/** 查询AI处理历史列表(最多5条，不含完整resultData) */
export function fetchGetAiProcessHistory(params: Api.AiProcess.HistoryQueryParams) {
  return getApiAdapter().get<Api.AiProcess.AiProcessHistoryItem[]>(
    '/api/ai-process/history',
    params
  )
}

/** 查询AI处理历史详情(含完整resultData) */
export function fetchGetAiProcessHistoryDetail(recordId: string) {
  return getApiAdapter().get<Api.AiProcess.AiProcessRecord>(`/api/ai-process/history/${recordId}`)
}
