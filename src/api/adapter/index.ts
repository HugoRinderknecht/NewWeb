import type { IApiAdapter, RequestConfig } from './types'
import { HttpAdapter } from './http-adapter'
import { MockAdapter } from './mock-adapter'

type AdapterMode = 'http' | 'mock' | 'hybrid'

interface HybridConfig {
  mockPatterns: RegExp[]
}

class HybridAdapter implements IApiAdapter {
  private httpAdapter: HttpAdapter
  private mockAdapter: MockAdapter
  private mockPatterns: RegExp[]

  constructor(config: HybridConfig) {
    this.httpAdapter = new HttpAdapter()
    this.mockAdapter = new MockAdapter()
    this.mockPatterns = config.mockPatterns
  }

  private shouldUseMock(url: string): boolean {
    return this.mockPatterns.some((pattern) => pattern.test(url))
  }

  async request<T>(config: RequestConfig): Promise<T> {
    if (this.shouldUseMock(config.url)) {
      return this.mockAdapter.request<T>(config)
    }
    return this.httpAdapter.request<T>(config)
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
}

let currentAdapter: IApiAdapter | null = null

export function getApiAdapter(): IApiAdapter {
  if (!currentAdapter) {
    currentAdapter = createAdapter()
  }
  return currentAdapter
}

function createAdapter(): IApiAdapter {
  const mode = (import.meta.env.VITE_API_MODE || 'http') as AdapterMode

  switch (mode) {
    case 'mock':
      return new MockAdapter()
    case 'hybrid':
      return new HybridAdapter({
        mockPatterns: parseMockPatterns(import.meta.env.VITE_MOCK_PATTERNS || '')
      })
    case 'http':
    default:
      return new HttpAdapter()
  }
}

function parseMockPatterns(patternsStr: string): RegExp[] {
  if (!patternsStr) return []
  return patternsStr.split(',').map((p) => new RegExp(p.trim()))
}

export function resetAdapter(): void {
  currentAdapter = null
}

export { HttpAdapter, MockAdapter, HybridAdapter }
