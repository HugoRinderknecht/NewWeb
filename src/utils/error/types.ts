/**
 * 错误分层类型系统
 *
 * 将错误分为三个层级：
 * - TRANSPORT（传输层）：网络错误、HTTP 状态码错误
 * - DOMAIN（领域层）：业务逻辑错误，由 BusinessCode 标识
 * - PRESENTATION（呈现层）：UI 展示决策，决定如何向用户展示错误
 *
 * @module utils/error/types
 */
import { BusinessCode } from '@/utils/http/status'

// ============================================================
// 错误层级枚举
// ============================================================

/**
 * 错误层级
 *
 * - TRANSPORT：传输层错误，如网络断开、HTTP 4xx/5xx
 * - DOMAIN：领域层错误，由业务码标识的业务逻辑错误
 * - PRESENTATION：呈现层错误，用于 UI 展示决策
 */
export enum ErrorLayer {
  TRANSPORT = 'TRANSPORT',
  DOMAIN = 'DOMAIN',
  PRESENTATION = 'PRESENTATION'
}

// ============================================================
// 错误展示策略
// ============================================================

/**
 * 错误展示策略
 *
 * - TOAST：使用 ElMessage 弹出提示
 * - INLINE_ALERT：在页面内联展示（如 Alert 组件）
 * - EMPTY_STATE：展示空状态占位
 * - RETRY_BUTTON：展示重试按钮
 * - SILENT：静默处理，不展示任何 UI
 */
export enum ErrorDisplayStrategy {
  TOAST = 'TOAST',
  INLINE_ALERT = 'INLINE_ALERT',
  EMPTY_STATE = 'EMPTY_STATE',
  RETRY_BUTTON = 'RETRY_BUTTON',
  SILENT = 'SILENT'
}

// ============================================================
// 领域错误类
// ============================================================

/**
 * 领域错误
 *
 * 封装业务逻辑错误，包含错误层级、业务码、用户可读消息等信息。
 * 由传输层错误（HttpError）或原始业务码转换而来。
 */
export class DomainError extends Error {
  /** 错误层级 */
  public readonly errorLayer: ErrorLayer = ErrorLayer.DOMAIN
  /** 业务码 */
  public readonly businessCode: BusinessCode | number
  /** 用户可读消息 */
  public readonly userMessage: string
  /** 原始错误 */
  public readonly cause?: Error
  /** 是否需要用户感知 */
  public readonly userFacing: boolean

  constructor(options: {
    businessCode: BusinessCode | number
    userMessage: string
    cause?: Error
    userFacing?: boolean
    message?: string
  }) {
    super(options.message || options.userMessage)
    this.name = 'DomainError'
    this.businessCode = options.businessCode
    this.userMessage = options.userMessage
    this.cause = options.cause
    this.userFacing = options.userFacing ?? true
  }
}

// ============================================================
// 呈现错误类
// ============================================================

/**
 * 呈现层错误
 *
 * 用于 UI 层错误展示决策，包含展示策略和展示上下文。
 * 由领域错误或传输错误转换而来，供页面组件消费。
 */
export class PresentationError extends Error {
  /** 错误层级 */
  public readonly errorLayer: ErrorLayer = ErrorLayer.PRESENTATION
  /** 展示策略 */
  public readonly displayStrategy: ErrorDisplayStrategy
  /** 用户可读消息 */
  public readonly userMessage: string
  /** 原始错误（可能是 DomainError 或其他 Error） */
  public readonly originalError: Error
  /** 展示上下文（如页面名称、操作名称） */
  public readonly context?: string

  constructor(options: {
    displayStrategy: ErrorDisplayStrategy
    userMessage: string
    originalError: Error
    context?: string
    message?: string
  }) {
    super(options.message || options.userMessage)
    this.name = 'PresentationError'
    this.displayStrategy = options.displayStrategy
    this.userMessage = options.userMessage
    this.originalError = options.originalError
    this.context = options.context
  }
}

// ============================================================
// 类型守卫
// ============================================================

/** 判断是否为 DomainError */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError
}

/** 判断是否为 PresentationError */
export function isPresentationError(error: unknown): error is PresentationError {
  return error instanceof PresentationError
}
