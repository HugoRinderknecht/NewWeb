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
}

export interface PaginatedResponse<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export interface IApiAdapter {
  request<T>(config: RequestConfig): Promise<T>
  get<T>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T>
  post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T>
  put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T>
  del<T>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T>
  patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T>
}
