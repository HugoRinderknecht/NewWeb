import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetBillingList,
  fetchCreateBilling,
  fetchGetBillingDetail,
  fetchUpdateBilling,
  fetchToggleBilling,
  fetchGetBillingHistory
} from '@/api/billing'

import { pointsKeys } from './keys'

/** 计费方案列表 */
export function useBillingList() {
  return useQuery({
    queryKey: pointsKeys.pricing(),
    queryFn: () => fetchGetBillingList()
  })
}

/** 计费方案详情 */
export function useBillingDetail(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['billing', 'detail', id] as const,
    queryFn: async () => {
      const v = toValue(id)
      if (!v) return null
      return await fetchGetBillingDetail(v)
    },
    enabled: () => !!toValue(id)
  })
}

/** 创建计费方案 */
export function useCreateBilling() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof fetchCreateBilling>[0]) => fetchCreateBilling(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointsKeys.pricing() })
    }
  })
}

/** 更新计费方案 */
export function useUpdateBilling() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof fetchUpdateBilling>[1] }) =>
      fetchUpdateBilling(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: pointsKeys.pricing() })
      queryClient.invalidateQueries({ queryKey: ['billing', 'detail', id] })
    }
  })
}

/** 切换计费方案状态 */
export function useToggleBilling() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchToggleBilling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointsKeys.pricing() })
    }
  })
}

/** 计费历史 */
export function useBillingHistory(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['billing', 'history', id] as const,
    queryFn: async () => {
      const v = toValue(id)
      if (!v) return []
      return await fetchGetBillingHistory(v)
    },
    enabled: () => !!toValue(id)
  })
}
