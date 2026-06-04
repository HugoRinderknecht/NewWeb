import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetCreditTransactions,
  fetchGetProjectCredits,
  fetchGetPricingList,
  fetchGetMyTokenUsage,
  fetchGetTokenUsageRecords,
  fetchGetProjectTokenUsage,
  fetchGetTeamTokenUsage
} from '@/api/points'

const QUERY_KEY = 'points' as const

// ==================== 积分/配额 ====================

// useMyCredits 和 useCreditTransactions 已由 statistics.ts 统一导出
export function useCreditTransactionList(
  params?: MaybeRefOrGetter<Api.Common.CommonSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'transactions', params] as const,
    queryFn: async () => {
      const res = await fetchGetCreditTransactions(toValue(params))
      return res ?? null
    },
    staleTime: 30 * 1000
  })
}

/** 项目积分余额 */
export function useProjectCredits(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-credits', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      return await fetchGetProjectCredits(id)
    },
    enabled: () => !!toValue(projectId),
    staleTime: 60 * 1000
  })
}

/** 积分定价列表 */
export function usePricingList() {
  return useQuery({
    queryKey: [QUERY_KEY, 'pricing'] as const,
    queryFn: async () => {
      const res = await fetchGetPricingList()
      return res ?? []
    },
    staleTime: 5 * 60 * 1000
  })
}

// ==================== Token 使用 ====================

/** 我的 Token 使用情况 */
export function useMyTokenUsage() {
  return useQuery({
    queryKey: [QUERY_KEY, 'token-usage'] as const,
    queryFn: async () => await fetchGetMyTokenUsage(),
    staleTime: 60 * 1000
  })
}

/** Token 使用记录（分页） */
export function useTokenUsageRecords(
  params?: MaybeRefOrGetter<Api.Common.CommonSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'token-records', params] as const,
    queryFn: async () => {
      const res = await fetchGetTokenUsageRecords(toValue(params))
      return res ?? null
    },
    staleTime: 30 * 1000
  })
}

/** 项目 Token 使用情况 */
export function useProjectTokenUsage(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project-token', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      return await fetchGetProjectTokenUsage(id)
    },
    enabled: () => !!toValue(projectId),
    staleTime: 60 * 1000
  })
}

/** 团队 Token 使用情况 */
export function useTeamTokenUsage(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'team-token', teamId] as const,
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return null
      return await fetchGetTeamTokenUsage(id)
    },
    enabled: () => !!toValue(teamId),
    staleTime: 60 * 1000
  })
}
