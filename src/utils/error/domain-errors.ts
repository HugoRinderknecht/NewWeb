/**
 * 领域错误映射
 *
 * 将传输层错误（HttpError）和业务码（BusinessCode）转换为领域错误（DomainError）。
 * 提供用户可读消息和用户感知决策。
 *
 * @module utils/error/domain-errors
 */
import { HttpError, isHttpError } from '@/utils/http/error'
import { BusinessCode, getBusinessErrorMessage } from '@/utils/http/status'
import { DomainError, ErrorLayer } from './types'

// ============================================================
// 可静默处理的业务码集合
// ============================================================

/**
 * 可静默处理的业务码
 *
 * 这些错误不需要主动向用户展示 toast，通常由 UI 状态自身处理
 * （如空状态、已读标记等）。
 */
const SILENT_BUSINESS_CODES: ReadonlySet<number> = new Set([
  BusinessCode.NOTIFICATION_ALREADY_READ,
  BusinessCode.NOTIFICATION_ALREADY_STARRED,
  BusinessCode.NOTIFICATION_NOT_STARRED,
  BusinessCode.TEAM_ALREADY_MEMBER,
  BusinessCode.STORYBOARD_ALREADY_SUBMITTED,
  BusinessCode.REVIEW_ALREADY_CLAIMED,
  BusinessCode.REVIEW_ALREADY_DECIDED,
  BusinessCode.REVIEW_ALREADY_ARCHIVED,
  BusinessCode.REVIEW_ALREADY_DISPATCHED,
  BusinessCode.PROJECT_ALREADY_ARCHIVED,
  BusinessCode.ASSET_DUPLICATE_UPLOAD,
  BusinessCode.ASSET_PROCESSING_IN_PROGRESS,
  BusinessCode.STORYBOARD_DECOMPOSE_IN_PROGRESS,
  BusinessCode.STORYBOARD_REBUILD_IN_PROGRESS
])

// ============================================================
// 领域错误映射配置
// ============================================================

/**
 * 领域错误映射条目
 *
 * 为特定业务码提供更精确的领域错误信息，
 * 覆盖 getBusinessErrorMessage 的通用映射。
 */
interface DomainErrorMapping {
  /** 用户可读消息 */
  userMessage: string
  /** 是否需要用户感知（默认 true） */
  userFacing: boolean
}

/**
 * 特定业务码的领域错误映射
 *
 * 仅映射需要覆盖默认行为的业务码。
 * 未在此映射中的业务码将使用 getBusinessErrorMessage 的结果。
 */
const DOMAIN_ERROR_MAP: Readonly<Record<number, DomainErrorMapping>> = {
  // 认证类 - 需要用户感知，引导重新操作
  [BusinessCode.AUTH_TOKEN_EXPIRED]: {
    userMessage: '登录已过期，请重新登录',
    userFacing: true
  },
  [BusinessCode.AUTH_TOKEN_INVALID]: {
    userMessage: '登录凭证无效，请重新登录',
    userFacing: true
  },
  [BusinessCode.AUTH_REFRESH_TOKEN_EXPIRED]: {
    userMessage: '会话已过期，请重新登录',
    userFacing: true
  },
  [BusinessCode.AUTH_INVALID_CREDENTIALS]: {
    userMessage: '账号或密码错误，请重新输入',
    userFacing: true
  },
  [BusinessCode.AUTH_ACCOUNT_LOCKED]: {
    userMessage: '账号已被锁定，请联系管理员或稍后重试',
    userFacing: true
  },

  // 权限类 - 需要用户感知
  [BusinessCode.TEAM_PERMISSION_DENIED]: {
    userMessage: '您没有权限执行此操作，请联系团队管理员',
    userFacing: true
  },
  [BusinessCode.PROJECT_PERMISSION_DENIED]: {
    userMessage: '您没有权限执行此操作，请联系项目管理员',
    userFacing: true
  },
  [BusinessCode.ASSET_PERMISSION_DENIED]: {
    userMessage: '您没有权限操作此资产',
    userFacing: true
  },

  // 配额类 - 需要用户感知，引导升级
  [BusinessCode.TEAM_MAX_MEMBERS_REACHED]: {
    userMessage: '团队成员数已达上限，如需扩容请联系管理员',
    userFacing: true
  },
  [BusinessCode.TEAM_MEMBER_QUOTA_EXCEEDED]: {
    userMessage: '团队成员配额超限，如需扩容请联系管理员',
    userFacing: true
  },
  [BusinessCode.PROJECT_QUOTA_EXCEEDED]: {
    userMessage: '项目数量已达上限，如需扩容请联系管理员',
    userFacing: true
  },
  [BusinessCode.ASSET_STORAGE_QUOTA_EXCEEDED]: {
    userMessage: '存储空间不足，请清理资产或联系管理员扩容',
    userFacing: true
  },

  // 静默处理类 - 不需要 toast 提示
  [BusinessCode.NOTIFICATION_ALREADY_READ]: {
    userMessage: '通知已读',
    userFacing: false
  },
  [BusinessCode.NOTIFICATION_ALREADY_STARRED]: {
    userMessage: '通知已收藏',
    userFacing: false
  },
  [BusinessCode.TEAM_ALREADY_MEMBER]: {
    userMessage: '已是团队成员',
    userFacing: false
  },
  [BusinessCode.STORYBOARD_ALREADY_SUBMITTED]: {
    userMessage: '分镜已提交',
    userFacing: false
  },
  [BusinessCode.REVIEW_ALREADY_CLAIMED]: {
    userMessage: '审核任务已被认领',
    userFacing: false
  },
  [BusinessCode.REVIEW_ALREADY_DECIDED]: {
    userMessage: '审核已处理',
    userFacing: false
  },
  [BusinessCode.ASSET_DUPLICATE_UPLOAD]: {
    userMessage: '资产已存在，无需重复上传',
    userFacing: false
  },
  [BusinessCode.ASSET_PROCESSING_IN_PROGRESS]: {
    userMessage: '资产处理中',
    userFacing: false
  },
  [BusinessCode.STORYBOARD_DECOMPOSE_IN_PROGRESS]: {
    userMessage: '分镜拆解进行中',
    userFacing: false
  },
  [BusinessCode.STORYBOARD_REBUILD_IN_PROGRESS]: {
    userMessage: '分镜重构进行中',
    userFacing: false
  }
}

// ============================================================
// 转换函数
// ============================================================

/**
 * 将传输层错误转换为领域错误
 *
 * - HttpError → DomainError（提取业务码和用户消息）
 * - 已是 DomainError → 直接返回
 * - 其他 Error → 包装为通用领域错误
 * - 非 Error → 包装为未知领域错误
 */
export function toDomainError(error: unknown): DomainError {
  // 已经是领域错误，直接返回
  if (error instanceof DomainError) {
    return error
  }

  // HttpError → DomainError
  if (isHttpError(error)) {
    return httpErrorToDomainError(error)
  }

  // 其他 Error → 通用领域错误
  if (error instanceof Error) {
    return new DomainError({
      businessCode: BusinessCode.INTERNAL_ERROR,
      userMessage: error.message || '操作失败',
      cause: error,
      userFacing: true
    })
  }

  // 非错误类型 → 未知领域错误
  return new DomainError({
    businessCode: BusinessCode.INTERNAL_ERROR,
    userMessage: '未知错误',
    userFacing: false
  })
}

/**
 * 将 HttpError 转换为 DomainError
 */
function httpErrorToDomainError(error: HttpError): DomainError {
  const code = error.code

  // 检查是否有精确的领域映射
  const mapping = DOMAIN_ERROR_MAP[code]
  if (mapping) {
    return new DomainError({
      businessCode: code,
      userMessage: mapping.userMessage,
      cause: error,
      userFacing: mapping.userFacing
    })
  }

  // 检查是否在静默集合中
  if (SILENT_BUSINESS_CODES.has(code)) {
    return new DomainError({
      businessCode: code,
      userMessage: getBusinessErrorMessage(code),
      cause: error,
      userFacing: false
    })
  }

  // 使用 getBusinessErrorMessage 获取用户消息
  const userMessage = getBusinessErrorMessage(code)

  // HTTP 4xx/5xx 状态码（非业务码）视为传输错误
  const isTransportError =
    (code >= 400 && code < 600 && code < 1000) || code === 0

  return new DomainError({
    businessCode: code,
    userMessage: userMessage !== '未知错误' ? userMessage : error.message || '操作失败',
    cause: error,
    userFacing: !isTransportError || code === BusinessCode.UNAUTHORIZED,
    message: isTransportError
      ? `[${ErrorLayer.TRANSPORT}] ${error.message}`
      : undefined
  })
}

// ============================================================
// 用户消息获取
// ============================================================

/**
 * 获取用户可读消息
 *
 * 优先从 DomainError 获取 userMessage，
 * 否则从 HttpError 提取业务消息，
 * 最后使用兜底消息。
 */
export function getUserMessage(error: unknown, fallback = '操作失败'): string {
  if (error instanceof DomainError) {
    return error.userMessage
  }

  if (isHttpError(error)) {
    if (error.message && error.message !== '请求失败') return error.message
    const msg = getBusinessErrorMessage(error.code)
    if (msg && msg !== '未知错误') return msg
  }

  if (error instanceof Error && error.message) return error.message

  return fallback
}

/**
 * 判断错误是否需要用户感知
 *
 * 用于决定是否展示 toast、弹窗等用户提示。
 */
export function isUserFacingError(error: unknown): boolean {
  if (error instanceof DomainError) {
    return error.userFacing
  }
  // 非 DomainError 默认需要用户感知
  return true
}

/**
 * 判断错误是否可静默处理
 */
export function isSilentError(error: unknown): boolean {
  return !isUserFacingError(error)
}
