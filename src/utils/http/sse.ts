import { useUserStore } from '@/store/modules/user'
import { showError, HttpError } from '@/utils/http/error'
import { ApiStatus } from './status'
import { extractResponseMessage } from '@/types'

interface SSEOptions {
  url: string
  body?: Record<string, any>
  onMessage: (data: any) => void
  onError?: (error: HttpError) => void
  onComplete?: () => void
  signal?: AbortSignal
}

/**
 * 创建 SSE 错误对象
 * 统一使用 HttpError 保持与 HTTP 层错误处理一致
 */
function createSSEError(message: string, code: number = ApiStatus.error): HttpError {
  return new HttpError(message, code)
}

/** 业务事件 data 行也可能包含 code 字段（错误事件），用于触发错误处理 */
function processSSEDataLine(dataStr: string): { event: string; data: any } | { error: HttpError } {
  try {
    const parsed = JSON.parse(dataStr)
    // 如果 data 中包含 code 字段且不是 200，视为错误事件
    if (parsed && typeof parsed === 'object' && 'code' in parsed && parsed.code !== ApiStatus.success) {
      return {
        error: createSSEError(
          extractResponseMessage(parsed) || 'SSE 业务错误',
          typeof parsed.code === 'number' ? parsed.code : ApiStatus.error
        )
      }
    }
    return { event: '', data: parsed }
  } catch {
    return { event: '', data: dataStr }
  }
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

  // 累积的错误数组：流结束后统一提示
  const sseErrors: HttpError[] = []

  const reportError = (error: HttpError, silent: boolean = false) => {
    sseErrors.push(error)
    options.onError?.(error)
    if (!silent) showError(error, true)
  }

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
      // 401 与 HTTP 层一致：触发登出
      if (response.status === ApiStatus.unauthorized) {
        userStore.logOut()
        return controller
      }
      throw createSSEError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      )
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw createSSEError('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    const processChunk = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            // 流正常结束，避免重复 onComplete
            if (sseErrors.length === 0) {
              options.onComplete?.()
            }
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
                const result = processSSEDataLine(dataStr)
                if ('error' in result) {
                  // 业务错误：仅记录不立即弹错，避免在长连接中频繁打扰
                  reportError(result.error, true)
                } else {
                  try {
                    options.onMessage({ event: currentEvent, data: result.data })
                  } catch (cbErr) {
                    reportError(
                      createSSEError(
                        cbErr instanceof Error ? cbErr.message : 'SSE 回调执行失败',
                        ApiStatus.error
                      ),
                      true
                    )
                  }
                }
              }
              currentEvent = ''
            }
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // 用户主动取消
          if (sseErrors.length === 0) options.onComplete?.()
        } else {
          reportError(
            createSSEError(
              error?.message || 'SSE 流处理失败',
              ApiStatus.internalServerError
            )
          )
        }
      }
    }

    processChunk()
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      // 静默
    } else if (error instanceof HttpError) {
      reportError(error)
    } else {
      reportError(
        createSSEError(error?.message || 'SSE 连接失败', ApiStatus.internalServerError)
      )
    }
  }

  return controller
}
