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

import { notificationKeys } from './keys'

// ==================== 查询 ====================

/** 通知列表（分页） */
export function useNotificationList(
  params?: MaybeRefOrGetter<Api.Notification.NotificationSearchParams | undefined>
) {
  return useQuery({
    queryKey: notificationKeys.list(params),
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
    queryKey: notificationKeys.detail(id),
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
    queryKey: notificationKeys.unreadCount(),
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
    queryKey: notificationKeys.starred(params),
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
    queryKey: notificationKeys.search(keyword, params),
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
    queryKey: notificationKeys.preference(),
    queryFn: async () => await fetchGetNotificationPreference(),
    staleTime: 5 * 60 * 1000
  })
}

/** 免打扰设置 */
export function useDndSettings() {
  return useQuery({
    queryKey: notificationKeys.dnd(),
    queryFn: async () => await fetchGetDndSettings(),
    staleTime: 5 * 60 * 1000
  })
}

/** 订阅列表 */
export function useSubscriptions() {
  return useQuery({
    queryKey: notificationKeys.subscriptions(),
    queryFn: async () => {
      const res = await fetchGetSubscriptions()
      return res ?? []
    },
    staleTime: 5 * 60 * 1000
  })
}

// ==================== Mutations ====================

/** 标记已读（带乐观更新） */
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchMarkAsRead(id),
    // 乐观更新：立即把该项标记为已读，无需等待服务端响应
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all() })
      await queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() })

      // 快照所有相关列表查询以便回滚
      const previousListEntries = queryClient.getQueriesData<any>({
        queryKey: notificationKeys.lists()
      })
      const previousUnread = queryClient.getQueryData<any>(notificationKeys.unreadCount())

      // 乐观更新列表：将目标项标记为已读
      queryClient.setQueriesData<any>({ queryKey: notificationKeys.lists() }, (old: any) => {
        if (!old) return old
        const markRead = (item: any) => (item?.id === id || item?.noticeId === id
          ? { ...item, read: true, isRead: true, readTime: Date.now() }
          : item)
        if (Array.isArray(old)) return old.map(markRead)
        if (old.records && Array.isArray(old.records)) {
          return { ...old, records: old.records.map(markRead) }
        }
        if (old.data && Array.isArray(old.data)) {
          return { ...old, data: old.data.map(markRead) }
        }
        return old
      })

      // 乐观更新未读数：减 1
      queryClient.setQueryData<any>(notificationKeys.unreadCount(), (old: any) => {
        if (!old) return old
        const cur = old.count ?? old.data?.count ?? old.unreadCount ?? old
        const next = Math.max(0, (typeof cur === 'number' ? cur : 0) - 1)
        if (typeof old === 'number') return next
        if (old.count !== undefined) return { ...old, count: next }
        if (old.data?.count !== undefined) return { ...old, data: { ...old.data, count: next } }
        if (old.unreadCount !== undefined) return { ...old, unreadCount: next }
        return next
      })

      return { previousListEntries, previousUnread }
    },
    onError: (_err, _id, context) => {
      // 失败回滚
      const ctx = context as { previousListEntries?: any[]; previousUnread?: any } | undefined
      if (ctx?.previousListEntries) {
        ctx.previousListEntries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
      if (ctx?.previousUnread !== undefined) {
        queryClient.setQueryData(notificationKeys.unreadCount(), ctx.previousUnread)
      }
    },
    onSettled: () => {
      // 无论成功失败都重新拉取以确保与服务端一致
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    }
  })
}

/** 标记未读 */
export function useMarkAsUnread() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchMarkAsUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    }
  })
}

/** 全部标记已读 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => fetchMarkAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    }
  })
}

/** 批量标记已读 */
export function useBatchMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => fetchBatchMarkAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    }
  })
}

/** 删除通知 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchDeleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
    }
  })
}

/** 批量删除通知 */
export function useBatchDeleteNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => fetchBatchDeleteNotifications(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
    }
  })
}

/** 清除已读通知 */
export function useClearReadNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => fetchClearReadNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
    }
  })
}

/** 收藏/取消收藏通知 */
export function useStarNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchStarNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
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
      queryClient.invalidateQueries({ queryKey: notificationKeys.preference() })
    }
  })
}

/** 更新免打扰设置 */
export function useUpdateDndSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Notification.DndSettings) => fetchUpdateDndSettings(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.dnd() })
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
      queryClient.invalidateQueries({ queryKey: notificationKeys.subscriptions() })
    }
  })
}

/** 取消订阅 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchCancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.subscriptions() })
    }
  })
}
