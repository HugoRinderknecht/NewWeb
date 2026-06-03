import { getApiAdapter } from './adapter'

export function fetchGetUserList(params?: Api.SystemManage.AdminUserSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.SystemManage.AdminUserItem>>(
    '/api/admin/users',
    params
  )
}

export function fetchGetUserDetail(id: string) {
  return getApiAdapter().get<Api.SystemManage.AdminUserItem>(`/api/admin/users/${id}`)
}

export function fetchUpdateUserStatus(id: string, status: number) {
  return getApiAdapter().put<void>(`/api/admin/users/${id}/status`, { status })
}

export function fetchGetMenuList() {
  return getApiAdapter().get<any[]>('/api/v3/system/menus/simple')
}

export function fetchGetRoleList(params?: Record<string, unknown>) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.SystemManage.RoleListItem>>(
    '/api/admin/roles',
    params as any
  )
}

export function fetchCreateRole(data: Record<string, unknown>) {
  return getApiAdapter().post<Api.SystemManage.RoleListItem>('/api/admin/roles', data)
}

export function fetchUpdateRole(roleId: number, data: Record<string, unknown>) {
  return getApiAdapter().put<Api.SystemManage.RoleListItem>(`/api/admin/roles/${roleId}`, data)
}

export function fetchDeleteRole(roleId: number) {
  return getApiAdapter().del<void>(`/api/admin/roles/${roleId}`)
}

export function fetchCreateMenu(data: Record<string, unknown>) {
  return getApiAdapter().post<void>('/api/admin/menus', data)
}

export function fetchUpdateMenu(menuId: number, data: Record<string, unknown>) {
  return getApiAdapter().put<void>(`/api/admin/menus/${menuId}`, data)
}

export function fetchDeleteMenu(menuId: number) {
  return getApiAdapter().del<void>(`/api/admin/menus/${menuId}`)
}
