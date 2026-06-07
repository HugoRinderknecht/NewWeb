export interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: any
  headers?: Record<string, string>
  signal?: AbortSignal
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'text' | 'stream'
  /** 是否在 HTTP 层全局弹错提示，默认 true；轮询/次级请求可设为 false 由页面局部处理 */
  showErrorMessage?: boolean
  /** 是否携带凭证（Cookie），用于管理后台 Cookie 认证场景 */
  withCredentials?: boolean
}

/**
 * 分页响应（与后端 PageResult 字段保持一致）
 * 严格按 docs/api-overview.md 规范：{total, page, pageSize, records}
 */
export interface PaginatedResponse<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 后端统一响应结构（与 src/types/common/response.ts 的 BaseResponse 对齐）
 * 规范：{code, message, data, timestamp}
 */
export interface ApiResponse<T> {
  code: number
  message: string
  /** @deprecated 旧字段，已替换为 message，仅兼容存量数据 */
  msg?: string
  data: T
  timestamp?: number
}

export interface IApiAdapter {
  /**
   * 通用请求方法
   * 返回值为后端 data 字段已解包的内容（不含 {code, message, data} 外壳）
   */
  request<T>(config: RequestConfig): Promise<T>
  /** GET：第二参数为 query 参数 */
  get<T>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T>
  /** POST：第二参数为请求体（body）；如需 query，请使用 config.params */
  post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T>
  /** PUT：第二参数为请求体（body）；如需 query，请使用 config.params */
  put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T>
  /** DELETE：默认第二参数为 query 参数；如需 body，请使用 config.data */
  del<T>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T>
  /** PATCH：第二参数为请求体（body）；如需 query，请使用 config.params */
  patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T>
}
