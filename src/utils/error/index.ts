/**
 * 错误处理分层策略 - 统一导出
 *
 * 提供错误分层类型系统、领域错误映射、统一 mutation 错误处理策略。
 *
 * ## 错误分层
 *
 * - TRANSPORT（传输层）：网络错误、HTTP 状态码错误
 * - DOMAIN（领域层）：业务逻辑错误，由 BusinessCode 标识
 * - PRESENTATION（呈现层）：UI 展示决策
 *
 * ## 使用方式
 *
 * ```ts
 * // 1. 在 mutation 中使用统一错误处理策略
 * import { createMutationOnError, ErrorDisplayStrategy } from '@/utils/error'
 *
 * useMutation({
 *   mutationFn: createProject,
 *   onError: createMutationOnError({ context: '创建项目' })
 * })
 *
 * // 2. 手动转换错误
 * import { toDomainError, getUserMessage } from '@/utils/error'
 *
 * const domainError = toDomainError(httpError)
 * const message = getUserMessage(domainError)
 *
 * // 3. 判断错误是否需要用户感知
 * import { isUserFacingError, isSilentError } from '@/utils/error'
 *
 * if (isUserFacingError(error)) {
 *   ElMessage.error(getUserMessage(error))
 * }
 * ```
 *
 * @module utils/error
 */

// 类型系统
export {
  ErrorLayer,
  ErrorDisplayStrategy,
  DomainError,
  PresentationError,
  isDomainError,
  isPresentationError
} from './types'

// 领域错误映射
export {
  toDomainError,
  getUserMessage,
  isUserFacingError,
  isSilentError
} from './domain-errors'

// Mutation 错误处理策略
export {
  createMutationOnError,
  createMutationOnSuccess,
  createMutationHandlers,
  type MutationErrorStrategyOptions
} from './mutation-error-strategy'
