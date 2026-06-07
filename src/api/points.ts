/** ⚠️ 文件命名 points.ts 与后端 credits/token 命名不对齐，建议后续重命名为 credits.ts */
import { getApiAdapter } from './adapter'

export function fetchGetMyCredits() {
  return getApiAdapter().get<Api.Points.CreditInfo>('/api/credits/me')
}

/** ⚠️ 分页参数需确认 CommonSearchParams 字段为 page/pageSize（非 current/size） */
export function fetchGetCreditTransactions(params?: Api.Common.CommonSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Points.TransactionRecord>>(
    '/api/credits/transactions',
    params
  )
}

export function fetchGetProjectCredits(projectId: string) {
  return getApiAdapter().get<Api.Points.CreditInfo>(`/api/credits/project/${projectId}`)
}

export function fetchGetPricingList() {
  return getApiAdapter().get<Api.Points.PricingItem[]>('/api/credits/pricing')
}

export function fetchGetMyTokenUsage() {
  return getApiAdapter().get<Api.Points.TokenUsage>('/api/token-usage/me')
}

/** ⚠️ 分页参数需确认 CommonSearchParams 字段为 page/pageSize（非 current/size） */
export function fetchGetTokenUsageRecords(params?: Api.Common.CommonSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Points.TokenUsageRecord>>(
    '/api/token-usage/records',
    params
  )
}

export function fetchGetProjectTokenUsage(projectId: string) {
  return getApiAdapter().get<Api.Points.TokenUsage>(`/api/token-usage/project/${projectId}`)
}

export function fetchGetTeamTokenUsage(teamId: string) {
  return getApiAdapter().get<Api.Points.TokenUsage>(`/api/token-usage/team/${teamId}`)
}

/** 更新积分预警阈值 */
export function fetchUpdateAlertThreshold(data: { threshold: number; enabled: boolean }) {
  return getApiAdapter().put<void>('/api/credits/alert-threshold', data)
}

/** 导出积分交易记录 */
export function fetchExportCreditTransactions(params?: Api.Common.CommonSearchParams) {
  return getApiAdapter().get<Blob>('/api/credits/transactions/export', params, {
    responseType: 'blob'
  })
}
