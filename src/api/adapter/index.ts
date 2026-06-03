import { HttpAdapter } from './http-adapter'
import type { IApiAdapter } from './types'

let currentAdapter: IApiAdapter | null = null

export function getApiAdapter(): IApiAdapter {
  if (!currentAdapter) {
    currentAdapter = new HttpAdapter()
  }
  return currentAdapter
}

export function resetAdapter(): void {
  currentAdapter = null
}

export { HttpAdapter }
