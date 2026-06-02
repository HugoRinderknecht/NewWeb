import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

/**
 * 获取用户列表（平台管理）
 * @param params 查询参数
 */
export function fetchGetUserList(params?: Api.SystemManage.AdminUserSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.AdminUserItem>>({
    url: '/api/admin/users',
    params
  })
}

/**
 * 获取用户详情（平台管理）
 * @param id 用户ID
 */
export function fetchGetUserDetail(id: string) {
  return request.get<Api.SystemManage.AdminUserItem>({
    url: `/api/admin/users/${id}`
  })
}

/**
 * 启用/禁用用户
 * @param id 用户ID
 * @param status 状态: 0=禁用, 1=启用
 */
export function fetchUpdateUserStatus(id: string, status: number) {
  return request.put<void>({
    url: `/api/admin/users/${id}/status`,
    params: { status }
  })
}

/**
 * 获取菜单列表
 */
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus/simple'
  })
}

/**
 * 获取角色列表
 */
export function fetchGetRoleList(params?: Record<string, unknown>) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemManage.RoleListItem>>({
    url: '/api/admin/roles',
    params
  })
}

export function fetchCreateRole(data: Record<string, unknown>) {
  return request.post<Api.SystemManage.RoleListItem>({
    url: '/api/admin/roles',
    data
  })
}

export function fetchUpdateRole(roleId: number, data: Record<string, unknown>) {
  return request.put<Api.SystemManage.RoleListItem>({
    url: `/api/admin/roles/${roleId}`,
    data
  })
}

export function fetchDeleteRole(roleId: number) {
  return request.del<void>({
    url: `/api/admin/roles/${roleId}`
  })
}

export function fetchCreateMenu(data: Record<string, unknown>) {
  return request.post<void>({
    url: '/api/admin/menus',
    data
  })
}

export function fetchUpdateMenu(menuId: number, data: Record<string, unknown>) {
  return request.put<void>({
    url: `/api/admin/menus/${menuId}`,
    data
  })
}

export function fetchDeleteMenu(menuId: number) {
  return request.del<void>({
    url: `/api/admin/menus/${menuId}`
  })
}
