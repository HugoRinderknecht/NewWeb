import type { IApiAdapter, RequestConfig } from './types'
import request from '@/utils/http'

export class HttpAdapter implements IApiAdapter {
  async request<T>(config: RequestConfig): Promise<T> {
    const { url, method, data, params, headers, signal, responseType } = config
    return request.request<T>({
      url,
      method,
      data,
      params,
      headers,
      signal,
      responseType
    })
  }

  get<T>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET', params })
  }

  post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  del<T>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE', params })
  }

  patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PATCH', data })
  }
}
