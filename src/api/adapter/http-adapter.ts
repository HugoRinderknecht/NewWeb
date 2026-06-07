import type { IApiAdapter, RequestConfig } from './types'
import request from '@/utils/http'

export class HttpAdapter implements IApiAdapter {
  async request<T>(config: RequestConfig): Promise<T> {
    const {
      url,
      method,
      data,
      params,
      headers,
      signal,
      responseType,
      showErrorMessage,
      withCredentials
    } = config
    return request.request<T>({
      url,
      method,
      data,
      params,
      headers,
      signal,
      responseType,
      showErrorMessage,
      withCredentials
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

  /**
   * DELETE：默认第二参数作为 query 参数
   * 若需要携带 body，请显式使用 request 或在 config.data 中传入
   */
  del<T>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE', params })
  }

  patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PATCH', data })
  }
}
