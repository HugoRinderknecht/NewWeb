import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 通知 Store（轻量版）
 *
 * 本 store 仅负责追踪未读数量、WebSocket 连接状态等 UI 相关状态。
 * 所有服务端数据（通知列表、偏好设置等）统一通过
 * `useNotificationList`、`useUnreadCount` 等 Vue Query Hook 获取。
 */
export const useNotificationStore = defineStore(
  'notification',
  () => {
    /** 未读数量（持久化用于即时展示，实际数据由 useUnreadCount 提供） */
    const unreadCount = ref(0)
    /** WebSocket 连接状态 */
    const wsConnected = ref(false)

    const hasUnread = computed(() => unreadCount.value > 0)

    /** 更新未读数量（由 Vue Query 数据同步调用） */
    const setUnreadCount = (count: number) => {
      unreadCount.value = count
    }

    /** WebSocket 推送新通知时递增未读数 */
    const incrementUnread = () => {
      unreadCount.value++
    }

    const setWsConnected = (connected: boolean) => {
      wsConnected.value = connected
    }

    const clearAll = () => {
      unreadCount.value = 0
      wsConnected.value = false
    }

    return {
      unreadCount,
      wsConnected,
      hasUnread,
      setUnreadCount,
      incrementUnread,
      setWsConnected,
      clearAll
    }
  },
  {
    persist: {
      key: 'notification',
      storage: sessionStorage,
      pick: ['unreadCount']
    }
  }
)
