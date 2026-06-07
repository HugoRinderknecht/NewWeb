import { getApiAdapter } from './adapter'

export function fetchGetNotificationList(params?: Api.Notification.NotificationSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Notification.NotificationItem>>(
    '/api/notifications',
    params
  )
}

export function fetchGetNotificationDetail(id: string) {
  return getApiAdapter().get<Api.Notification.NotificationItem>(`/api/notifications/${id}`)
}

export function fetchGetUnreadCount() {
  return getApiAdapter().get<number>('/api/notifications/unread-count')
}

export function fetchMarkAsRead(id: string) {
  return getApiAdapter().post<void>(`/api/notifications/${id}/read`)
}

export function fetchMarkAsUnread(id: string) {
  return getApiAdapter().post<void>(`/api/notifications/${id}/unread`)
}

export function fetchMarkAllAsRead() {
  return getApiAdapter().post<void>('/api/notifications/read-all')
}

export function fetchBatchMarkAsRead(ids: string[]) {
  return getApiAdapter().post<void>('/api/notifications/batch-read', ids)
}

export function fetchDeleteNotification(id: string) {
  return getApiAdapter().del<void>(`/api/notifications/${id}`)
}

export function fetchBatchDeleteNotifications(ids: string[]) {
  return getApiAdapter().post<void>('/api/notifications/batch-delete', ids)
}

export function fetchClearReadNotifications() {
  return getApiAdapter().post<void>('/api/notifications/clear-read')
}

export function fetchStarNotification(id: string) {
  return getApiAdapter().post<void>(`/api/notifications/${id}/star`)
}

export function fetchGetStarredNotifications(params?: Api.Common.CommonSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Notification.NotificationItem>>(
    '/api/notifications/starred',
    params
  )
}

export function fetchSearchNotifications(keyword: string, params?: Api.Common.CommonSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Notification.NotificationItem>>(
    '/api/notifications/search',
    { ...params, keyword }
  )
}

// TODO: 需在类型定义中补充 Notification.ExportParams
export function fetchExportNotifications(params?: Record<string, unknown>) {
  return getApiAdapter().get<Blob>('/api/notifications/export', params, {
    responseType: 'blob'
  })
}

export function fetchGetNotificationPreference() {
  return getApiAdapter().get<Api.Notification.NotificationPreference>(
    '/api/notifications/preference'
  )
}

export function fetchUpdateNotificationPreference(params: Api.Notification.NotificationPreference) {
  return getApiAdapter().put<void>('/api/notifications/preference', params)
}

export function fetchGetDndSettings() {
  return getApiAdapter().get<Api.Notification.DndSettings>('/api/notifications/dnd')
}

export function fetchUpdateDndSettings(params: Api.Notification.DndSettings) {
  return getApiAdapter().put<void>('/api/notifications/dnd', params)
}

export function fetchGetSubscriptions() {
  return getApiAdapter().get<Api.Notification.SubscriptionItem[]>('/api/notifications/subscribe')
}

export function fetchAddSubscription(params: Api.Notification.SubscriptionParams) {
  return getApiAdapter().post<Api.Notification.SubscriptionItem>(
    '/api/notifications/subscribe',
    params
  )
}

export function fetchCancelSubscription(id: string) {
  return getApiAdapter().del<void>(`/api/notifications/subscribe/${id}`)
}

/** 创建通知 */
// TODO: 需在类型定义中补充 Notification.CreateNotificationParams
export function fetchCreateNotification(data: Record<string, unknown>) {
  return getApiAdapter().post<Api.Notification.NotificationItem>('/api/notifications', data)
}

export function fetchGetWsToken() {
  return getApiAdapter().post<{ token: string; expiresIn: string }>('/api/notifications/ws-token')
}
