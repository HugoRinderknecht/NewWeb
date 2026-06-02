import { useUserStore } from '@/store/modules/user'
import { showError, HttpError } from '@/utils/http/error'

interface SSEOptions {
  url: string
  body?: Record<string, any>
  onMessage: (data: any) => void
  onError?: (error: Error) => void
  onComplete?: () => void
  signal?: AbortSignal
}

export async function createSSEConnection(options: SSEOptions): Promise<AbortController> {
  const controller = new AbortController()
  const { signal } = controller

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort())
  }

  const userStore = useUserStore()
  const token = userStore.accessToken

  const baseUrl = import.meta.env.VITE_API_URL || ''
  const fullUrl = `${baseUrl}${options.url}`

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal
    })

    if (!response.ok) {
      if (response.status === 401) {
        userStore.logOut()
        return controller
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    const processChunk = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            options.onComplete?.()
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          let currentEvent = ''
          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim()
            } else if (line.startsWith('data:')) {
              const dataStr = line.slice(5).trim()
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr)
                  options.onMessage({ event: currentEvent, data })
                } catch {
                  options.onMessage({ event: currentEvent, data: dataStr })
                }
              }
              currentEvent = ''
            }
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          options.onComplete?.()
        } else {
          options.onError?.(error)
          showError(new HttpError(error.message, 500))
        }
      }
    }

    processChunk()
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      options.onError?.(error)
    }
  }

  return controller
}
