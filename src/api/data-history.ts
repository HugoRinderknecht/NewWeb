import request from '@/utils/http'

/**
 * 查询历史版本列表
 * @param params 查询参数
 */
export function fetchGetDataHistoryList(params: Api.DataHistory.HistorySearchParams) {
  return request.get<Api.DataHistory.HistoryVersion[]>({
    url: '/api/data-history',
    params
  })
}

/**
 * 查询历史版本详情
 * @param historyId 历史版本ID
 */
export function fetchGetDataHistoryDetail(historyId: string) {
  return request.get<Api.DataHistory.HistoryVersionDetail>({
    url: `/api/data-history/${historyId}`
  })
}

/**
 * 回退数据到历史版本
 * @param params 回退参数
 */
export function fetchRollbackDataHistory(params: Api.DataHistory.RollbackParams) {
  return request.post<void>({
    url: '/api/data-history/rollback',
    params
  })
}
