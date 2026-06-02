import WebSocketClient from '@/utils/socket'

let wsInstance: WebSocketClient | null = null

export async function initNotificationWebSocket() {
  try {
    const { fetchGetWsToken } = await import('@/api/notification')
    const token = await fetchGetWsToken()

    const wsUrl = buildWsUrl(token)

    wsInstance = WebSocketClient.getInstance({
      url: wsUrl,
      messageHandler: (event: MessageEvent) => {
        handleNotificationMessage(event)
      }
    })

    wsInstance.init()

    const { useNotificationStore } = await import('@/store/modules/notification')
    const notificationStore = useNotificationStore()
    notificationStore.setWsConnected(true)
  } catch (error) {
    console.warn('[NotificationWS] 初始化失败:', error)
  }
}

function buildWsUrl(token: string): string {
  const apiUrl = import.meta.env.VITE_API_URL || ''
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws'
  const host = apiUrl.replace(/^https?:\/\//, '')
  return `${wsProtocol}://${host}/ws/notifications?token=${token}`
}

async function handleNotificationMessage(event: MessageEvent) {
  try {
    const data = JSON.parse(event.data)
    const { useNotificationStore } = await import('@/store/modules/notification')
    const notificationStore = useNotificationStore()

    switch (data.type) {
      case 'notification':
        notificationStore.incrementUnread()
        break
      case 'review_status':
        break
      case 'ai_process':
        break
    }
  } catch {}
}

export async function disconnectNotificationWebSocket() {
  if (wsInstance) {
    wsInstance.close()
    wsInstance = null
    const { useNotificationStore } = await import('@/store/modules/notification')
    const notificationStore = useNotificationStore()
    notificationStore.setWsConnected(false)
  }
}

export function getNotificationWsStatus(): boolean {
  return wsInstance?.isWebSocketConnected || false
}
