/**
 * Mutation 统一错误处理工具
 * 为 useMutation 提供默认 onError 行为：提取业务错误消息、显示提示、记录日志
 *
 * 使用方式：
 * 1. 在 useMutation 的 onError 中调用 handleMutationError
 * 2. 或者通过包装的 useApiMutation 自动应用
 */
import { HttpError, showError } from '@/utils/http/error'
import { getBusinessErrorMessage } from '@/utils/http/status'

/** Mutation 错误处理配置 */
export interface MutationErrorOptions {
  /** 是否显示错误提示（默认 true） */
  showMessage?: boolean
  /** 自定义错误处理函数，返回 false 可阻止默认行为 */
  customHandler?: (error: unknown, variables: unknown) => boolean | void
  /** 错误前缀，用于上下文识别 */
  context?: string
}

/**
 * 提取可读的错误消息
 * 优先从 HttpError 提取，然后是业务码映射，最后是兜底文案
 */
export function extractErrorMessage(error: unknown, fallback = '操作失败'): string {
  if (error instanceof HttpError) {
    if (error.message && error.message !== '请求失败') return error.message
    if (error.code && error.code !== 0) {
      const msg = getBusinessErrorMessage(error.code)
      if (msg && msg !== '未知错误') return msg
    }
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

/**
 * 统一处理 mutation 错误
 * - 自动从错误中提取业务消息
 * - 默认显示 ElMessage 错误提示
 * - 记录详细错误到控制台
 * - 支持自定义处理器和上下文前缀
 */
export function handleMutationError(
  error: unknown,
  variables: unknown,
  options: MutationErrorOptions = {}
): void {
  const { showMessage = true, customHandler, context } = options

  // 让自定义处理器优先，false 可阻止默认行为
  if (customHandler) {
    const result = customHandler(error, variables)
    if (result === false) return
  }

  // 输出到控制台便于调试
  const contextPrefix = context ? `[${context}] ` : ''
  // eslint-disable-next-line no-console
  console.error(`${contextPrefix}Mutation 错误:`, error)

  if (showMessage) {
    const message = extractErrorMessage(error)
    showError(new HttpError(message, 0), true)
  }
}

/**
 * 创建一个带默认错误处理的 onError 回调
 * 用法：
 *   useMutation({
 *     mutationFn: ...,
 *     onSuccess: ...,
 *     onError: createDefaultOnError({ context: '创建剧本' })
 *   })
 */
export function createDefaultOnError(
  options: MutationErrorOptions = {}
): (error: unknown, variables: unknown) => void {
  return (error: unknown, variables: unknown) => {
    handleMutationError(error, variables, options)
  }
}
