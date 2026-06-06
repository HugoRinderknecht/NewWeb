export interface BaseResponse<T = unknown> {
  code: number
  message: string
  msg?: string
  data: T
  timestamp?: number
}

/**
 * 统一从 BaseResponse 提取消息文本
 * 优先使用 message 字段，兜底使用 msg 字段
 */
export function extractResponseMessage(response: Partial<BaseResponse> | null | undefined): string {
  if (!response) return ''
  return response.message || response.msg || ''
}

