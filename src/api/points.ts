import { getApiAdapter } from './adapter'

export function fetchGetMyCredits() {
  return getApiAdapter().get<Api.Points.CreditInfo>('/api/credits/me')
}

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
