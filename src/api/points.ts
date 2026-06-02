import request from '@/utils/http'

/**
 * 获取个人积分余额
 */
export function fetchGetMyCredits() {
  return request.get<Api.Points.CreditInfo>({
    url: '/api/credits/me'
  })
}

/**
 * 获取个人积分流水
 * @param params 查询参数
 */
export function fetchGetCreditTransactions(params?: Api.Common.CommonSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Points.TransactionRecord>>({
    url: '/api/credits/transactions',
    params
  })
}

/**
 * 获取项目积分余额
 * @param projectId 项目ID
 */
export function fetchGetProjectCredits(projectId: string) {
  return request.get<Api.Points.CreditInfo>({
    url: `/api/credits/project/${projectId}`
  })
}

/**
 * 获取模型定价列表
 */
export function fetchGetPricingList() {
  return request.get<Api.Points.PricingItem[]>({
    url: '/api/credits/pricing'
  })
}

/**
 * 获取个人Token用量统计
 */
export function fetchGetMyTokenUsage() {
  return request.get<Api.Points.TokenUsage>({
    url: '/api/token-usage/me'
  })
}

/**
 * 获取个人Token用量记录列表
 * @param params 查询参数
 */
export function fetchGetTokenUsageRecords(params?: Api.Common.CommonSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Points.TokenUsageRecord>>({
    url: '/api/token-usage/records',
    params
  })
}

/**
 * 获取项目Token用量统计
 * @param projectId 项目ID
 */
export function fetchGetProjectTokenUsage(projectId: string) {
  return request.get<Api.Points.TokenUsage>({
    url: `/api/token-usage/project/${projectId}`
  })
}

/**
 * 获取团队Token用量统计
 * @param teamId 团队ID
 */
export function fetchGetTeamTokenUsage(teamId: string) {
  return request.get<Api.Points.TokenUsage>({
    url: `/api/token-usage/team/${teamId}`
  })
}
