export interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: any
  headers?: Record<string, string>
  signal?: AbortSignal
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'text' | 'stream'
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
