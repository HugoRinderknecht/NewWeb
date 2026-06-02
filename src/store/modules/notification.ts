import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchGetNotificationList,
  fetchGetUnreadCount,
  fetchMarkAsRead,
  fetchMarkAllAsRead,
  fetchUpdateNotificationPreference,
  fetchGetNotificationPreference
} from '@/api/notification'

export const useNotificationStore = defineStore(
  'notification',
  () => {
    const unreadCount = ref(0)
    const notifications = ref<any[]>([])
    const preference = ref<any>(null)
    const loading = ref(false)
    const wsConnected = ref(false)

    const hasUnread = computed(() => unreadCount.value > 0)

    const loadUnreadCount = async () => {
      try {
        const res = await fetchGetUnreadCount()
        unreadCount.value = typeof res === 'number' ? res : 0
      } catch {
        unreadCount.value = 0
      }
    }

    const loadNotifications = async (params?: any) => {
      loading.value = true
      try {
        const res = await fetchGetNotificationList(params)
        notifications.value = (res as any)?.records || res || []
      } catch {
        notifications.value = []
      } finally {
        loading.value = false
      }
    }

    const markAsRead = async (id: string) => {
      try {
        await fetchMarkAsRead(id)
        const notification = notifications.value.find((n: any) => n.id === id)
        if (notification && !notification.read) {
          notification.read = true
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
      } catch {}
    }

    const markAllAsRead = async () => {
      try {
        await fetchMarkAllAsRead()
        notifications.value.forEach((n: any) => {
          n.read = true
        })
        unreadCount.value = 0
      } catch {}
    }

    const loadPreference = async () => {
      try {
        const res = await fetchGetNotificationPreference()
        preference.value = res
      } catch {
        preference.value = null
      }
    }

    const updatePreference = async (params: any) => {
      try {
        await fetchUpdateNotificationPreference(params)
        preference.value = { ...preference.value, ...params }
      } catch {}
    }

    const incrementUnread = () => {
      unreadCount.value++
    }

    const setWsConnected = (connected: boolean) => {
      wsConnected.value = connected
    }

    const clearAll = () => {
      unreadCount.value = 0
      notifications.value = []
      preference.value = null
      wsConnected.value = false
    }

    return {
      unreadCount,
      notifications,
      preference,
      loading,
      wsConnected,
      hasUnread,
      loadUnreadCount,
      loadNotifications,
      markAsRead,
      markAllAsRead,
      loadPreference,
      updatePreference,
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
