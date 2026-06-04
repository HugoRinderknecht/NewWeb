import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetNotificationList,
  fetchGetNotificationDetail,
  fetchGetUnreadCount,
  fetchMarkAsRead,
  fetchMarkAsUnread,
  fetchMarkAllAsRead,
  fetchBatchMarkAsRead,
  fetchDeleteNotification,
  fetchBatchDeleteNotifications,
  fetchClearReadNotifications,
  fetchStarNotification,
  fetchGetStarredNotifications,
  fetchSearchNotifications,
  fetchGetNotificationPreference,
  fetchUpdateNotificationPreference,
  fetchGetDndSettings,
  fetchUpdateDndSettings,
  fetchGetSubscriptions,
  fetchAddSubscription,
  fetchCancelSubscription
} from '@/api/notification'

const QUERY_KEY = 'notifications' as const

// ==================== 查询 ====================

/** 通知列表（分页） */
export function useNotificationList(
  params?: MaybeRefOrGetter<Api.Notification.NotificationSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', params] as const,
    queryFn: async () => {
      const res = await fetchGetNotificationList(toValue(params))
      return res ?? null
    },
    staleTime: 30 * 1000
  })
}

/** 通知详情 */
export function useNotificationDetail(id: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', id] as const,
    queryFn: async () => {
      const nid = toValue(id)
      if (!nid) return null
      return await fetchGetNotificationDetail(nid)
    },
    enabled: () => !!toValue(id),
    staleTime: 60 * 1000
  })
}

/** 未读数量 */
export function useUnreadCount() {
  return useQuery({
    queryKey: [QUERY_KEY, 'unread-count'] as const,
    queryFn: async () => {
      const res = await fetchGetUnreadCount()
      return typeof res === 'number' ? res : 0
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000
  })
}

/** 星标通知列表（分页） */
export function useStarredNotifications(
  params?: MaybeRefOrGetter<Api.Common.CommonSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'starred', params] as const,
    queryFn: async () => {
      const res = await fetchGetStarredNotifications(toValue(params))
      return res ?? null
    },
    staleTime: 30 * 1000
  })
}

/** 搜索通知（分页） */
export function useSearchNotifications(
  keyword: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Common.CommonSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'search', keyword, params] as const,
    queryFn: async () => {
      const kw = toValue(keyword)
      if (!kw) return null
      const res = await fetchSearchNotifications(kw, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(keyword),
    staleTime: 30 * 1000
  })
}

/** 通知偏好设置 */
export function useNotificationPreference() {
  return useQuery({
    queryKey: [QUERY_KEY, 'preference'] as const,
    queryFn: async () => await fetchGetNotificationPreference(),
    staleTime: 5 * 60 * 1000
  })
}

/** 免打扰设置 */
export function useDndSettings() {
  return useQuery({
    queryKey: [QUERY_KEY, 'dnd'] as const,
    queryFn: async () => await fetchGetDndSettings(),
    staleTime: 5 * 60 * 1000
  })
}

/** 订阅列表 */
export function useSubscriptions() {
  return useQuery({
    queryKey: [QUERY_KEY, 'subscriptions'] as const,
    queryFn: async () => {
      const res = await fetchGetSubscriptions()
      return res ?? []
    },
    staleTime: 5 * 60 * 1000
  })
}

// ==================== Mutations ====================

/** 标记已读 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchMarkAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'unread-count'] })
    }
  })
}

/** 标记未读 */
export function useMarkAsUnread() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchMarkAsUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'unread-count'] })
    }
  })
}

/** 全部标记已读 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => fetchMarkAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'unread-count'] })
    }
  })
}

/** 批量标记已读 */
export function useBatchMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => fetchBatchMarkAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'unread-count'] })
    }
  })
}

/** 删除通知 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchDeleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    }
  })
}

/** 批量删除通知 */
export function useBatchDeleteNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => fetchBatchDeleteNotifications(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    }
  })
}

/** 清除已读通知 */
export function useClearReadNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => fetchClearReadNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    }
  })
}

/** 收藏/取消收藏通知 */
export function useStarNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchStarNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    }
  })
}

/** 更新通知偏好 */
export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Notification.NotificationPreference) =>
      fetchUpdateNotificationPreference(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'preference'] })
    }
  })
}

/** 更新免打扰设置 */
export function useUpdateDndSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Notification.DndSettings) => fetchUpdateDndSettings(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'dnd'] })
    }
  })
}

/** 添加订阅 */
export function useAddSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Notification.SubscriptionParams) =>
      fetchAddSubscription(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'subscriptions'] })
    }
  })
}

/** 取消订阅 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchCancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'subscriptions'] })
    }
  })
}
