import { getApiAdapter } from '../adapter'

/** 审计日志列表 */
export function fetchAuditLogList(params?: {
  page?: number
  pageSize?: number
  operation?: string
}) {
  return getApiAdapter().get<any>('/api/admin/audit-logs', params)
}

/** 导出审计日志 */
export function fetchExportAuditLogs(params?: {
  userId?: string
  actionType?: string
  from?: string
  to?: string
  format?: 'csv' | 'xlsx'
}) {
  return getApiAdapter().get<Blob>('/api/admin/audit-logs/export', params, {
    responseType: 'blob'
  })
}
