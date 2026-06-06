import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetAiProcessStatus,
  fetchGetAiProcessHistory,
  fetchGetAiProcessHistoryDetail
} from '@/api/ai-process'

const QUERY_KEY = 'ai-process' as const

/** AI 处理状态（轮询） */
export function useAiProcessStatus(
  params?: MaybeRefOrGetter<Api.AiProcess.StatusSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'status', params] as const,
    queryFn: async () => {
      const res = await fetchGetAiProcessStatus(toValue(params))
      return res ?? null
    },
    staleTime: 10 * 1000,
    refetchInterval: 5000
  })
}

/** AI 处理历史列表
 *  后端必填：projectId + type + businessId（项目级聚合时 businessId = projectId）
 */
export function useAiProcessHistory(
  params?: MaybeRefOrGetter<Api.AiProcess.HistorySearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'history', params] as const,
    queryFn: async () => {
      const p = toValue(params)
      if (!p?.projectId || !p?.type || !p?.businessId) return []
      const res = await fetchGetAiProcessHistory(p)
      return res ?? []
    },
    enabled: () => {
      const p = toValue(params)
      return !!(p?.projectId && p?.type && p?.businessId)
    },
    retry: false,
    staleTime: 30 * 1000
  })
}

/** AI 处理历史详情 */
export function useAiProcessDetail(recordId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', recordId] as const,
    queryFn: async () => {
      const id = toValue(recordId)
      if (!id) return null
      return await fetchGetAiProcessHistoryDetail(id)
    },
    enabled: () => !!toValue(recordId),
    staleTime: 60 * 1000
  })
}
