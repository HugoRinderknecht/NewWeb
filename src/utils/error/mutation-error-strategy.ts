/**
 * 统一 Mutation 错误处理策略
 *
 * 提供工厂函数 createMutationOnError，替代各页面中重复的 try/catch + toast 模式。
 * 基于错误分层系统，自动决定错误的展示方式。
 *
 * @module utils/error/mutation-error-strategy
 */
import { DomainError } from './types'
import { ErrorDisplayStrategy } from './types'
import { toDomainError, getUserMessage, isUserFacingError } from './domain-errors'

// ============================================================
// 配置类型
// ============================================================

/** Mutation 错误处理策略配置 */
export interface MutationErrorStrategyOptions {
  /** 操作成功时的提示消息（不传则不提示） */
  successMessage?: string
  /** 是否静默处理所有错误（默认 false） */
  silent?: boolean
  /** 错误展示策略（默认 TOAST） */
  displayStrategy?: ErrorDisplayStrategy
  /** 错误上下文（如操作名称），用于日志和调试 */
  context?: string
  /** 自定义错误处理函数，返回 false 可阻止默认行为 */
  customHandler?: (error: DomainError, variables: unknown) => boolean | void
  /** 兜底错误消息 */
  fallbackMessage?: string
}

// ============================================================
// 展示策略执行器
// ============================================================

/**
 * 根据展示策略执行对应的 UI 展示
 *
 * 目前主要实现 TOAST 策略，其他策略返回展示信息供页面消费。
 */
function executeDisplayStrategy(
  strategy: ErrorDisplayStrategy,
  userMessage: string,
  _context?: string
): void {
  switch (strategy) {
    case ErrorDisplayStrategy.TOAST: {
      ElMessage.error(userMessage)
      break
    }
    case ErrorDisplayStrategy.SILENT: {
      // 静默处理，不展示任何 UI
      break
    }
    // INLINE_ALERT / EMPTY_STATE / RETRY_BUTTON 需要页面组件配合，
    // 这里只记录日志，由页面层消费 DomainError 后自行处理
    case ErrorDisplayStrategy.INLINE_ALERT:
    case ErrorDisplayStrategy.EMPTY_STATE:
    case ErrorDisplayStrategy.RETRY_BUTTON: {
      // 这些策略需要页面组件配合，此处不做 UI 操作
      break
    }
  }
}

/**
 * 展示成功消息
 */
function executeSuccessDisplay(message: string): void {
  ElMessage.success(message)
}

// ============================================================
// 工厂函数
// ============================================================

/**
 * 创建带分层策略的 mutation onError 回调
 *
 * 替代各页面中重复的 try/catch + toast 模式。
 *
 * ## 默认行为
 * - 传输错误（网络/HTTP 错误）→ 自动 toast 提示
 * - 领域错误 → 使用用户友好消息，根据 userFacing 决定是否展示
 * - 静默错误 → 不展示任何 UI
 *
 * ## 使用示例
 *
 * ```ts
 * // 基本用法：自动 toast 错误
 * useMutation({
 *   mutationFn: createProject,
 *   onError: createMutationOnError({ context: '创建项目' })
 * })
 *
 * // 带成功提示
 * useMutation({
 *   mutationFn: deleteProject,
 *   onSuccess: () => { /* ... *\/ },
 *   onError: createMutationOnError({
 *     context: '删除项目',
 *     successMessage: '项目已删除'  // 需配合 onSuccess 使用
 *   })
 * })
 *
 * // 静默模式
 * useMutation({
 *   mutationFn: updatePreference,
 *   onError: createMutationOnError({ silent: true })
 * })
 *
 * // 自定义展示策略
 * useMutation({
 *   mutationFn: loadData,
 *   onError: createMutationOnError({
 *     displayStrategy: ErrorDisplayStrategy.EMPTY_STATE
 *   })
 * })
 * ```
 */
export function createMutationOnError(
  options: MutationErrorStrategyOptions = {}
): (error: unknown, variables: unknown) => void {
  const {
    silent = false,
    displayStrategy = ErrorDisplayStrategy.TOAST,
    context,
    customHandler,
    fallbackMessage = '操作失败'
  } = options

  return (error: unknown, variables: unknown): void => {
    // 1. 转换为领域错误
    const domainError = toDomainError(error)

    // 2. 自定义处理器优先
    if (customHandler) {
      const result = customHandler(domainError, variables)
      if (result === false) return
    }

    // 3. 记录日志
    const contextPrefix = context ? `[${context}] ` : ''
    // eslint-disable-next-line no-console
    console.error(`${contextPrefix}Mutation 错误:`, domainError)

    // 4. 静默模式：不展示任何 UI
    if (silent) return

    // 5. 根据领域错误的 userFacing 和展示策略决定是否展示
    const shouldDisplay = isUserFacingError(domainError)
    if (!shouldDisplay) return

    // 6. 获取用户消息并执行展示策略
    const userMessage = getUserMessage(domainError, fallbackMessage)
    executeDisplayStrategy(displayStrategy, userMessage, context)
  }
}

/**
 * 创建带成功提示的 mutation onSuccess 回调
 *
 * 配合 createMutationOnError 使用，在操作成功时展示成功消息。
 *
 * ## 使用示例
 *
 * ```ts
 * useMutation({
 *   mutationFn: createProject,
 *   onSuccess: createMutationOnSuccess({ successMessage: '项目创建成功' }),
 *   onError: createMutationOnError({ context: '创建项目' })
 * })
 * ```
 */
export function createMutationOnSuccess(
  options: { successMessage?: string } = {}
): () => void {
  return () => {
    if (options.successMessage) {
      executeSuccessDisplay(options.successMessage)
    }
  }
}

/**
 * 创建完整的 mutation 错误处理配置
 *
 * 一次性生成 onError 和 onSuccess 回调，简化 useMutation 配置。
 *
 * ## 使用示例
 *
 * ```ts
 * const { onError, onSuccess } = createMutationHandlers({
 *   context: '创建项目',
 *   successMessage: '项目创建成功'
 * })
 *
 * useMutation({
 *   mutationFn: createProject,
 *   onSuccess,
 *   onError
 * })
 * ```
 */
export function createMutationHandlers(options: MutationErrorStrategyOptions = {}) {
  return {
    onError: createMutationOnError(options),
    onSuccess: createMutationOnSuccess({ successMessage: options.successMessage })
  }
}
