/**
 * 统一日志模块
 *
 * 提供结构化日志记录，便于跟踪数据请求和交互过程中的问题。
 * 生产环境仅输出 warn/error，开发环境输出全部级别。
 *
 * @module utils/logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

const currentLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'warn'

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel]
}

function formatMessage(module: string, action: string, detail?: string): string {
  const timestamp = new Date().toISOString()
  const base = `[${timestamp}][${module}] ${action}`
  return detail ? `${base} - ${detail}` : base
}

export const logger = {
  debug(module: string, action: string, detail?: string, data?: unknown) {
    if (shouldLog('debug')) {
      console.debug(formatMessage(module, action, detail), data ?? '')
    }
  },

  info(module: string, action: string, detail?: string, data?: unknown) {
    if (shouldLog('info')) {
      console.info(formatMessage(module, action, detail), data ?? '')
    }
  },

  warn(module: string, action: string, detail?: string, data?: unknown) {
    if (shouldLog('warn')) {
      console.warn(formatMessage(module, action, detail), data ?? '')
    }
  },

  error(module: string, action: string, detail?: string, error?: unknown) {
    if (shouldLog('error')) {
      console.error(formatMessage(module, action, detail), error ?? '')
    }
  },

  /** 记录 API 请求开始 */
  apiRequest(module: string, apiName: string, params?: unknown) {
    this.debug(module, `API→${apiName}`, '请求发起', params)
  },

  /** 记录 API 请求成功 */
  apiSuccess(module: string, apiName: string, detail?: string) {
    this.debug(module, `API✓${apiName}`, detail ?? '请求成功')
  },

  /** 记录 API 请求失败 */
  apiError(module: string, apiName: string, error?: unknown) {
    this.error(module, `API✗${apiName}`, '请求失败', error)
  }
}
