/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 请求/响应拦截器（自动添加 Token、统一错误处理）
 * - 401 未授权自动登出（带防抖机制）
 * - 请求失败自动重试（可配置）
 * - 统一的成功/错误消息提示
 * - 支持 GET/POST/PUT/DELETE 等常用方法
 *
 * @module utils/http
 * @author Dreamcraft_Astra Team
 */

import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { BaseResponse, extractResponseMessage } from '@/types'
import { dataFlowMonitor } from '@/utils/data-flow'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 1
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000
/** 单次刷新请求最大等待时间，防止刷新 Promise 永久挂起 */
const REFRESH_TIMEOUT = 10000

/** 401防抖状态 */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

/** Token 刷新状态：保证并发 401 只触发一次刷新请求 */
let refreshingPromise: Promise<string> | null = null
/** 等待刷新成功后重发的请求队列 */
const pendingRetryRequests: Array<{
  config: ExtendedAxiosRequestConfig
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

/** 请求去重 Map */
const pendingRequests = new Map<string, Promise<any>>()

/** 响应缓存条目 */
interface CacheEntry<T> {
  data: T
  timestamp: number
}

/** LRU 缓存最大条目数（防止长时间运行后内存泄漏） */
const RESPONSE_CACHE_MAX_SIZE = 200

/**
 * LRU 响应缓存：按访问时间淘汰最久未使用的条目
 * - get: 获取并标记为最近使用
 * - set: 写入；超容量时淘汰最久未使用的条目
 */
class LRUResponseCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly maxSize: number

  constructor(maxSize: number = RESPONSE_CACHE_MAX_SIZE) {
    this.maxSize = Math.max(1, maxSize)
  }

  get(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    // 命中后重新插入到 Map 末尾，更新为"最近使用"
    this.cache.delete(key)
    this.cache.set(key, entry)
    return entry
  }

  set(key: string, entry: CacheEntry<T>): void {
    // 已存在则先删除再写入（更新为最近使用）
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    this.cache.set(key, entry)
    // 超容量时淘汰最久未使用的条目（Map 的第一个元素）
    while (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey === undefined) break
      this.cache.delete(oldestKey)
    }
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

const responseCache = new LRUResponseCache()

/** 生成请求唯一 key */
function getRequestKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
  dedup?: boolean
  cacheTTL?: number
  /** 内部标记：标记为刷新 Token 的请求，避免触发自动刷新逻辑 */
  _isRefreshRequest?: boolean
  /** 内部标记：标记为 Token 刷新后重试的请求，避免无限循环 */
  _isRetryAfterRefresh?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
    }

    return request
  },
  (error) => {
    showError(createHttpError('请求配置错误', ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const errorMessage = extractResponseMessage(response.data)
    if (response.data.code === ApiStatus.success) return response
    if (response.data.code === ApiStatus.unauthorized) {
      // 业务码 401 同样触发自动刷新
      const config = response.config as ExtendedAxiosRequestConfig
      throw tryHandleUnauthorized(config, errorMessage)
    }
    throw createHttpError(errorMessage || '请求失败', response.data.code)
  },
  (error) => {
    // HTTP 401 状态码也走自动刷新流程
    if (error.response?.status === ApiStatus.unauthorized) {
      const config = error.config as ExtendedAxiosRequestConfig | undefined
      if (config) {
        return tryHandleUnauthorized(config).catch((err) => Promise.reject(err))
      }
    }
    return Promise.reject(handleError(error))
  }
)

/** 统一创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/**
 * 401 错误处理：先尝试静默刷新 Token，失败后再登出
 * 通过返回 Promise.reject 让上层可以 catch 抛出错误
 */
function tryHandleUnauthorized(
  config: ExtendedAxiosRequestConfig,
  message?: string
): Promise<never> {
  // 刷新请求本身失败 或 已经是刷新后重试的请求 → 直接走登出流程
  if (config._isRefreshRequest || config._isRetryAfterRefresh) {
    return Promise.reject(handleUnauthorizedFinal(message))
  }

  return refreshAccessToken()
    .then((newToken) => {
      // 刷新成功：标记为重试请求并替换 Authorization 头后重发
      config._isRetryAfterRefresh = true
      if (config.headers) {
        const headers = config.headers as Record<string, string>
        headers['Authorization'] = `Bearer ${newToken}`
      } else {
        config.headers = { Authorization: `Bearer ${newToken}` } as any
      }
      return axiosInstance.request(config) as unknown as Promise<never>
    })
    .catch((refreshError) => {
      // 刷新失败：兜底走登出流程
      handleLogoutAfterRefreshFailure()
      return Promise.reject(
        refreshError instanceof HttpError
          ? refreshError
          : createHttpError(message || '登录已过期，请重新登录', ApiStatus.unauthorized)
      )
    })
}

/**
 * 刷新 accessToken：使用单例 Promise 保证并发请求只触发一次刷新
 * 刷新成功后自动重发队列中所有等待的请求
 */
function refreshAccessToken(): Promise<string> {
  if (refreshingPromise) return refreshingPromise

  const userStore = useUserStore()
  const refreshToken = userStore.refreshToken

  // 没有 refreshToken 时直接走登出
  if (!refreshToken) {
    handleLogoutAfterRefreshFailure()
    return Promise.reject(createHttpError('登录已过期，请重新登录', ApiStatus.unauthorized))
  }

  refreshingPromise = doRefresh(refreshToken)
    .then((newToken) => {
      // 刷新成功后，重发队列中所有等待的请求
      flushPendingRequests(newToken)
      return newToken
    })
    .catch((error) => {
      // 刷新失败：拒绝所有等待的请求
      rejectPendingRequests(error)
      throw error
    })
    .finally(() => {
      refreshingPromise = null
    })

  return refreshingPromise
}

/** 执行实际刷新请求（带超时保护，绕过应用层拦截器避免循环刷新） */
async function doRefresh(refreshToken: string): Promise<string> {
  const refreshTimer = new Promise<never>((_, reject) => {
    setTimeout(() => reject(createHttpError('刷新 Token 超时', ApiStatus.unauthorized)), REFRESH_TIMEOUT)
  })

  // 直接调用 axiosInstance，避免经过应用层 401 拦截器导致循环刷新
  const doAxiosRefresh = async (): Promise<string> => {
    const res = await axiosInstance.request<BaseResponse<Api.Auth.LoginResponse>>({
      url: '/api/auth/refresh-token',
      method: 'POST',
      data: { refreshToken },
      _isRefreshRequest: true
    })
    const payload = (res as AxiosResponse<BaseResponse<Api.Auth.LoginResponse>>).data
    if (payload?.code !== ApiStatus.success || !payload.data?.token) {
      throw createHttpError(payload?.message || payload?.msg || '刷新 Token 失败', ApiStatus.unauthorized)
    }
    return payload.data.token
  }

  try {
    const newToken = await Promise.race([doAxiosRefresh(), refreshTimer])
    const userStore = useUserStore()
    // 直接从最新响应中读取新 token 对应的 refreshToken 不可得，保留旧的
    userStore.setToken(newToken, refreshToken)
    return newToken
  } catch (error) {
    throw error instanceof HttpError
      ? error
      : createHttpError('刷新 Token 失败', ApiStatus.unauthorized)
  }
}

/** 重发队列中所有等待的请求 */
function flushPendingRequests(newToken: string) {
  while (pendingRetryRequests.length > 0) {
    const task = pendingRetryRequests.shift()!
    task.config._isRetryAfterRefresh = true
    const headers = task.config.headers as Record<string, string> | undefined
    if (headers) {
      headers['Authorization'] = `Bearer ${newToken}`
    } else {
      task.config.headers = { Authorization: `Bearer ${newToken}` } as any
    }
    axiosInstance
      .request(task.config)
      .then((res) => task.resolve(res))
      .catch((err) => task.reject(err))
  }
}

/** 拒绝队列中所有等待的请求 */
function rejectPendingRequests(error: unknown) {
  while (pendingRetryRequests.length > 0) {
    const task = pendingRetryRequests.shift()!
    task.reject(error)
  }
}

/** 刷新失败后的兜底登出 */
function handleLogoutAfterRefreshFailure() {
  if (isUnauthorizedErrorShown) return
  isUnauthorizedErrorShown = true
  setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)
  logOut()
}

/** 直接走最终登出（用于刷新请求本身失败或重试后仍失败） */
function handleUnauthorizedFinal(message?: string): HttpError {
  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()
    setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)
    const error = createHttpError(message || '登录已过期，请重新登录', ApiStatus.unauthorized)
    showError(error, true)
    return error
  }
  return createHttpError(message || '登录已过期，请重新登录', ApiStatus.unauthorized)
}

/** 处理401错误（带防抖）—— 旧入口，保留兼容 */
function handleUnauthorizedError(message?: string): never {
  const error = handleUnauthorizedFinal(message)
  throw error
}

/** 重置401防抖状态 */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

/** 退出登录函数 */
function logOut() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  if (config.cacheTTL && config.cacheTTL > 0) {
    const key = getRequestKey(config)
    const cached = responseCache.get(key)
    if (cached && Date.now() - cached.timestamp < config.cacheTTL) {
      return cached.data as T
    }
  }

  const enableDedup = config.dedup !== false && config.method?.toUpperCase() === 'GET'

  if (enableDedup) {
    const key = getRequestKey(config)
    const existing = pendingRequests.get(key)
    if (existing) return existing as Promise<T>

    const promise = _doRequest<T>(config).finally(() => {
      pendingRequests.delete(key)
    })
    pendingRequests.set(key, promise)
    return promise
  }

  return _doRequest<T>(config)
}

async function _doRequest<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  const method = (config.method || 'GET').toUpperCase()
  const url = config.url || ''
  const channelId = `http:${method}:${url}`
  const startTime = Date.now()

  const buildRecord = (status: 'success' | 'error', error?: string) => ({
    id: `${channelId}:${startTime}`,
    channelId,
    status,
    inputSummary: { type: 'request', size: 0 },
    error,
    startTime,
    endTime: Date.now(),
    duration: Date.now() - startTime,
    transformed: false
  })

  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config)

    if (config.showSuccessMessage && extractResponseMessage(res.data)) {
      showSuccess(extractResponseMessage(res.data))
    }

    const result = res.data.data as T

    if (config.cacheTTL && config.cacheTTL > 0) {
      const key = getRequestKey(config)
      responseCache.set(key, { data: result, timestamp: Date.now() })
    }

    // 记录成功流转指标
    dataFlowMonitor.recordTransfer(buildRecord('success'))

    return result
  } catch (error) {
    // 记录失败流转指标
    dataFlowMonitor.recordTransfer(
      buildRecord('error', error instanceof Error ? error.message : String(error))
    )

    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  }
}

export function clearResponseCache(): void {
  responseCache.clear()
}

export function clearPendingRequests(): void {
  pendingRequests.clear()
}

export default api
