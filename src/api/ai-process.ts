import request from '@/utils/http'

/**
 * 查询当前处理状态
 * @param params 查询参数
 */
export function fetchGetAiProcessStatus(params?: Api.AiProcess.StatusSearchParams) {
  return request.get<Api.AiProcess.ProcessStatus>({
    url: '/api/ai-process/status',
    params
  })
}

/**
 * 查询AI处理历史列表
 * @param params 查询参数
 */
export function fetchGetAiProcessHistory(params?: Api.AiProcess.HistorySearchParams) {
  return request.get<Api.AiProcess.ProcessRecord[]>({
    url: '/api/ai-process/history',
    params
  })
}

/**
 * 查询AI处理历史详情
 * @param recordId 记录ID
 */
export function fetchGetAiProcessHistoryDetail(recordId: string) {
  return request.get<Api.AiProcess.ProcessRecordDetail>({
    url: `/api/ai-process/history/${recordId}`
  })
}
