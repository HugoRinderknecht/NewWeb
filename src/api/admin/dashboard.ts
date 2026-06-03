import { getApiAdapter } from '../adapter'

/** 获取存储统计 */
export function fetchGetStorageStats() {
  return getApiAdapter().get<Record<string, any>>('/api/admin/dashboard/storage')
}

/** 获取核心统计数据 */
export function fetchGetDashboardStats() {
  return getApiAdapter().get<Record<string, any>>('/api/admin/dashboard/stats')
}
