import request from '@/utils/http'

/**
 * 获取通知列表
 * @param params 查询参数
 */
export function fetchGetNotificationList(params?: Api.Notification.NotificationSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Notification.NotificationItem>>({
    url: '/api/notifications',
    params
  })
}

/**
 * 获取通知详情
 * @param id 通知ID
 */
export function fetchGetNotificationDetail(id: string) {
  return request.get<Api.Notification.NotificationItem>({
    url: `/api/notifications/${id}`
  })
}

/**
 * 获取未读通知数量
 */
export function fetchGetUnreadCount() {
  return request.get<number>({
    url: '/api/notifications/unread-count'
  })
}

/**
 * 标记已读
 * @param id 通知ID
 */
export function fetchMarkAsRead(id: string) {
  return request.post<void>({
    url: `/api/notifications/${id}/read`
  })
}

/**
 * 标记未读
 * @param id 通知ID
 */
export function fetchMarkAsUnread(id: string) {
  return request.post<void>({
    url: `/api/notifications/${id}/unread`
  })
}

/**
 * 全部已读
 */
export function fetchMarkAllAsRead() {
  return request.post<void>({
    url: '/api/notifications/read-all'
  })
}

/**
 * 批量已读
 * @param ids 通知ID列表
 */
export function fetchBatchMarkAsRead(ids: string[]) {
  return request.post<void>({
    url: '/api/notifications/batch-read',
    params: { ids }
  })
}

/**
 * 删除通知
 * @param id 通知ID
 */
export function fetchDeleteNotification(id: string) {
  return request.del<void>({
    url: `/api/notifications/${id}`
  })
}

/**
 * 批量删除通知
 * @param ids 通知ID列表
 */
export function fetchBatchDeleteNotifications(ids: string[]) {
  return request.del<void>({
    url: '/api/notifications/batch-delete',
    data: { ids }
  })
}

/**
 * 清空已读通知
 */
export function fetchClearReadNotifications() {
  return request.post<void>({
    url: '/api/notifications/clear-read'
  })
}

/**
 * 收藏通知
 * @param id 通知ID
 */
export function fetchStarNotification(id: string) {
  return request.post<void>({
    url: `/api/notifications/${id}/star`
  })
}

/**
 * 获取收藏列表
 * @param params 查询参数
 */
export function fetchGetStarredNotifications(params?: Api.Common.CommonSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Notification.NotificationItem>>({
    url: '/api/notifications/starred',
    params
  })
}

/**
 * 搜索通知
 * @param keyword 关键词
 * @param params 分页参数
 */
export function fetchSearchNotifications(keyword: string, params?: Api.Common.CommonSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Notification.NotificationItem>>({
    url: '/api/notifications/search',
    params: { ...params, keyword }
  })
}

/**
 * 导出通知
 */
export function fetchExportNotifications() {
  return request.get<Blob>({
    url: '/api/notifications/export',
    responseType: 'blob'
  } as any)
}

/**
 * 获取通知偏好设置
 */
export function fetchGetNotificationPreference() {
  return request.get<Api.Notification.NotificationPreference>({
    url: '/api/notifications/preference'
  })
}

/**
 * 更新通知偏好设置
 * @param params 偏好参数
 */
export function fetchUpdateNotificationPreference(params: Api.Notification.NotificationPreference) {
  return request.put<void>({
    url: '/api/notifications/preference',
    params
  })
}

/**
 * 获取免打扰设置
 */
export function fetchGetDndSettings() {
  return request.get<Api.Notification.DndSettings>({
    url: '/api/notifications/dnd'
  })
}

/**
 * 更新免打扰设置
 * @param params 免打扰参数
 */
export function fetchUpdateDndSettings(params: Api.Notification.DndSettings) {
  return request.put<void>({
    url: '/api/notifications/dnd',
    params
  })
}

/**
 * 获取订阅列表
 */
export function fetchGetSubscriptions() {
  return request.get<Api.Notification.SubscriptionItem[]>({
    url: '/api/notifications/subscribe'
  })
}

/**
 * 新增订阅
 * @param params 订阅参数
 */
export function fetchAddSubscription(params: Api.Notification.SubscriptionParams) {
  return request.post<Api.Notification.SubscriptionItem>({
    url: '/api/notifications/subscribe',
    params
  })
}

/**
 * 取消订阅
 * @param id 订阅ID
 */
export function fetchCancelSubscription(id: string) {
  return request.del<void>({
    url: `/api/notifications/subscribe/${id}`
  })
}

/**
 * 获取WebSocket Token
 */
export function fetchGetWsToken() {
  return request.post<string>({
    url: '/api/notifications/ws-token'
  })
}
