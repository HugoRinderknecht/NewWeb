import { getApiAdapter } from '../adapter'

/** 菜单列表（树形结构） */
export function fetchMenuList() {
  return getApiAdapter().get<Api.Admin.SysMenuVO[]>('/api/admin/menus')
}

/** 创建菜单 */
export function fetchCreateMenu(data: Api.Admin.SysMenuCreateRequest) {
  return getApiAdapter().post<Api.Admin.SysMenuVO>('/api/admin/menus', data)
}

/** 更新菜单 */
export function fetchUpdateMenu(menuId: string, data: Api.Admin.SysMenuUpdateRequest) {
  return getApiAdapter().put<Api.Admin.SysMenuVO>(`/api/admin/menus/${menuId}`, data)
}

/** 删除菜单 */
export function fetchDeleteMenu(menuId: string) {
  return getApiAdapter().del<void>(`/api/admin/menus/${menuId}`)
}

/** 切换菜单启用/禁用状态 */
export function fetchToggleMenuStatus(menuId: string) {
  return getApiAdapter().patch<void>(`/api/admin/menus/${menuId}/status`)
}

/** 菜单重排序 */
export function fetchReorderMenus(data: Api.Admin.SysMenuReorderRequest) {
  return getApiAdapter().put<void>('/api/admin/menus/reorder', data)
}
