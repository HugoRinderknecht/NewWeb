import { getApiAdapter } from '../adapter'

/** 用户列表（管理后台） */
export function fetchAdminUserList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
}) {
  return getApiAdapter().get<any>('/api/admin/users', params)
}

/** 用户详情（管理后台） */
export function fetchAdminUserDetail(id: string) {
  return getApiAdapter().get<any>(`/api/admin/users/${id}`)
}

/** 启用/禁用用户 */
export function fetchToggleUserStatus(id: string, status: number) {
  return getApiAdapter().put<void>(`/api/admin/users/${id}/status`, undefined, {
    params: { status }
  })
}
