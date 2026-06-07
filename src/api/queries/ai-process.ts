import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetAiProcessStatus,
  fetchGetAiProcessHistory,
  fetchGetAiProcessHistoryDetail
} from '@/api/ai-process'

import { aiProcessKeys } from './keys'

/** AI 处理状态（轮询） */
export function useAiProcessStatus(
  params?: MaybeRefOrGetter<Api.AiProcess.StatusQueryParams | undefined>
) {
  return useQuery({
    queryKey: aiProcessKeys.status(params),
    queryFn: async () => {
      const p = toValue(params)
      if (!p?.type || !p?.businessId) return null
      const res = await fetchGetAiProcessStatus(p)
      return res ?? null
    },
    enabled: () => {
      const p = toValue(params)
      return !!(p?.type && p?.businessId)
    },
    staleTime: 10 * 1000,
    refetchInterval: 5000,
    retry: false
  })
}

/** AI 处理历史列表 */
export function useAiProcessHistory(
  params?: MaybeRefOrGetter<Api.AiProcess.HistoryQueryParams | undefined>
) {
  return useQuery({
    queryKey: aiProcessKeys.history(params),
    queryFn: async () => {
      const p = toValue(params)
      if (!p?.type || !p?.businessId) return []
      const res = await fetchGetAiProcessHistory(p)
      return res ?? []
    },
    enabled: () => {
      const p = toValue(params)
      return !!(p?.type && p?.businessId)
    },
    retry: false,
    staleTime: 30 * 1000
  })
}

/** AI 处理历史详情 */
export function useAiProcessDetail(recordId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: aiProcessKeys.detail(recordId),
    queryFn: async () => {
      const id = toValue(recordId)
      if (!id) return null
      return await fetchGetAiProcessHistoryDetail(id)
    },
    enabled: () => !!toValue(recordId),
    staleTime: 60 * 1000
  })
}
