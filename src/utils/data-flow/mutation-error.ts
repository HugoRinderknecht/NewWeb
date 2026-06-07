/**
 * Mutation 统一错误处理工具
 * 为 useMutation 提供默认 onError 行为：提取业务错误消息、显示提示、记录日志
 *
 * 使用方式：
 * 1. 在 useMutation 的 onError 中调用 handleMutationError
 * 2. 或者通过包装的 useApiMutation 自动应用
 *
 * 已集成错误分层系统：
 * - 传输错误自动 toast
 * - 领域错误使用用户友好消息
 * - 可配置静默处理
 */
import { HttpError, showError } from '@/utils/http/error'
import { getBusinessErrorMessage } from '@/utils/http/status'
import { toDomainError, getUserMessage, isUserFacingError } from '@/utils/error/domain-errors'
import { DomainError } from '@/utils/error/types'

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
 * 优先从 DomainError 提取，然后从 HttpError 提取，最后是兜底文案
 *
 * 已集成错误分层系统，优先使用 getUserMessage
 */
export function extractErrorMessage(error: unknown, fallback = '操作失败'): string {
  // 优先使用错误分层系统的消息提取
  return getUserMessage(error, fallback)
}

/**
 * 统一处理 mutation 错误
 * - 自动从错误中提取业务消息（通过错误分层系统）
 * - 传输错误自动 toast，领域错误使用用户友好消息
 * - 可通过 userFacing 判断是否需要用户感知
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

  // 转换为领域错误，获取分层信息
  const domainError = toDomainError(error)

  // 输出到控制台便于调试
  const contextPrefix = context ? `[${context}] ` : ''
  // eslint-disable-next-line no-console
  console.error(`${contextPrefix}Mutation 错误:`, domainError)

  if (showMessage) {
    // 使用错误分层系统判断是否需要用户感知
    if (!isUserFacingError(domainError)) return

    const message = domainError.userMessage
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

// 重新导出错误分层系统类型，方便从 data-flow 模块使用
export type { DomainError } from '@/utils/error/types'
export { isDomainError } from '@/utils/error/types'
