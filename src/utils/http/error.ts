/**
 * HTTP 错误处理模块
 *
 * 提供统一的 HTTP 请求错误处理机制
 *
 * ## 主要功能
 *
 * - 自定义 HttpError 错误类，封装错误信息、状态码、时间戳等
 * - 错误拦截和转换，将 Axios 错误转换为标准的 HttpError
 * - 错误消息国际化处理，根据状态码返回对应的多语言错误提示
 * - 错误日志记录，便于问题追踪和调试
 * - 错误和成功消息的统一展示
 * - 类型守卫函数，用于判断错误类型
 *
 * ## 使用场景
 *
 * - HTTP 请求拦截器中统一处理错误
 * - 业务代码中捕获和处理特定错误
 * - 错误日志收集和上报
 *
 * @module utils/http/error
 * @author Dreamcraft_Astra Team
 */
import { AxiosError } from 'axios'
import { ApiStatus } from './status'
import { extractResponseMessage, type BaseResponse } from '@/types'
import { getBusinessErrorMessage } from './status'

/**
 * 错误响应接口（兼容 message 与 msg 两种字段命名）
 * 文档规范字段为 `message`，`msg` 作为旧后端兼容字段保留
 */
export interface ErrorResponse {
  /** 错误状态码 */
  code: number
  /** 错误消息（文档规范字段） */
  message?: string
  /** @deprecated 旧字段，兼容存量后端 */
  msg?: string
  /** 错误附加数据 */
  data?: unknown
  /** 后端响应时间戳 */
  timestamp?: number
}

// 错误日志数据接口
export interface ErrorLogData {
  /** 错误状态码（业务码优先，HTTP 码兜底） */
  code: number
  /** 错误消息 */
  message: string
  /** 错误附加数据 */
  data?: unknown
  /** 错误发生时间戳（前端） */
  timestamp: string
  /** 后端响应时间戳 */
  serverTimestamp?: number
  /** 请求 URL */
  url?: string
  /** 请求方法 */
  method?: string
  /** 错误堆栈信息 */
  stack?: string
}

// 自定义 HttpError 类
export class HttpError extends Error {
  public readonly code: number
  public readonly data?: unknown
  public readonly timestamp: string
  public readonly serverTimestamp?: number
  public readonly url?: string
  public readonly method?: string

  constructor(
    message: string,
    code: number,
    options?: {
      data?: unknown
      url?: string
      method?: string
      serverTimestamp?: number
    }
  ) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.data = options?.data
    this.timestamp = new Date().toISOString()
    this.serverTimestamp = options?.serverTimestamp
    this.url = options?.url
    this.method = options?.method
  }

  public toLogData(): ErrorLogData {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      serverTimestamp: this.serverTimestamp,
      url: this.url,
      method: this.method,
      stack: this.stack
    }
  }
}

/**
 * 获取 HTTP 状态码对应的默认消息
 * @param status HTTP 状态码
 * @returns 错误消息
 */
const getErrorMessage = (status: number): string => {
  const errorMap: Record<number, string> = {
    [ApiStatus.unauthorized]: '登录已过期，请重新登录',
    [ApiStatus.forbidden]: '没有权限访问该资源',
    [ApiStatus.notFound]: '请求的资源不存在',
    [ApiStatus.methodNotAllowed]: '请求方法不被允许',
    [ApiStatus.requestTimeout]: '请求超时，请稍后重试',
    [ApiStatus.internalServerError]: '服务器内部错误',
    [ApiStatus.badGateway]: '网关错误',
    [ApiStatus.serviceUnavailable]: '服务不可用',
    [ApiStatus.gatewayTimeout]: '网关超时'
  }

  return errorMap[status] || '服务器内部错误'
}

/**
 * 处理 Axios 错误（HTTP 非 2xx 响应/网络错误）
 *
 * 优先级策略：
 * 1. 业务 code（response.data.code）> HTTP 状态码（作为 HttpError.code）
 * 2. 消息：后端 message > 后端 msg > 业务错误码映射 > HTTP 状态码默认文案 > error.message
 */
export function handleError(error: AxiosError<ErrorResponse>): never {
  // 处理取消的请求
  if (error.code === 'ERR_CANCELED') {
    console.warn('Request cancelled:', error.message)
    throw new HttpError('请求已取消', ApiStatus.error)
  }

  const statusCode = error.response?.status
  const responseData = error.response?.data
  const backendMessage = extractResponseMessage(responseData as Partial<BaseResponse>)
  const requestConfig = error.config

  // 处理网络错误
  if (!error.response) {
    throw new HttpError('网络错误，请检查网络连接', ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase()
    })
  }

  // 消息优先级：后端 message > 业务码映射 > HTTP 状态码文案 > error.message
  const businessCode = responseData?.code
  const message =
    backendMessage ||
    (businessCode ? getBusinessErrorMessage(businessCode) : '') ||
    (statusCode ? getErrorMessage(statusCode) : '') ||
    error.message ||
    '请求失败'

  // code 优先级：业务码 > HTTP 状态码（业务码可让上层做精细判定）
  const finalCode = businessCode ?? statusCode ?? ApiStatus.error

  throw new HttpError(message, finalCode, {
    data: responseData,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase(),
    serverTimestamp: responseData?.timestamp
  })
}

/**
 * 显示错误消息
 * @param error 错误对象
 * @param showMessage 是否显示错误消息
 */
export function showError(error: HttpError, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.error(error.message)
  }
  // 记录错误日志
  console.error('[HTTP Error]', error.toLogData())
}

/**
 * 显示成功消息
 * @param message 成功消息
 * @param showMessage 是否显示消息
 */
export function showSuccess(message: string, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.success(message)
  }
}

/**
 * 判断是否为 HttpError 类型
 * @param error 错误对象
 * @returns 是否为 HttpError 类型
 */
export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError
}
