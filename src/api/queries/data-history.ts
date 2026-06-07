import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetDataHistoryList,
  fetchGetDataHistoryDetail,
  fetchRollbackDataHistory
} from '@/api/data-history'

import { dataHistoryKeys } from './keys'

// ==================== 查询 ====================

/** 数据历史列表 */
export function useDataHistoryList(
  params?: MaybeRefOrGetter<Api.DataHistory.HistorySearchParams | undefined>
) {
  return useQuery({
    queryKey: dataHistoryKeys.list(params),
    // params 为空时不发起请求，避免非空断言运行时崩溃
    enabled: () => !!toValue(params),
    queryFn: async () => {
      const p = toValue(params)
      if (!p) return []
      const res = await fetchGetDataHistoryList(p)
      return res ?? []
    }
  })
}

/** 数据历史详情 */
export function useDataHistoryDetail(historyId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: dataHistoryKeys.detail(historyId),
    queryFn: async () => {
      const id = toValue(historyId)
      if (!id) return null
      return await fetchGetDataHistoryDetail(id)
    },
    enabled: () => !!toValue(historyId)
  })
}

// ==================== Mutations ====================

/** 回滚数据历史 */
export function useRollbackDataHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.DataHistory.RollbackParams) => fetchRollbackDataHistory(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dataHistoryKeys.all() })
    }
  })
}
