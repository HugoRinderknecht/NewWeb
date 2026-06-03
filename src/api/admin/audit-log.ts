import { getApiAdapter } from '../adapter'

/** 审计日志列表 */
export function fetchAuditLogList(params?: {
  page?: number
  pageSize?: number
  operation?: string
}) {
  return getApiAdapter().get<any>('/api/admin/audit-logs', params)
}
