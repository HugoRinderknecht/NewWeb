import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { fetchAuditLogList, fetchExportAuditLogs } from './audit-log'
import { fetchGetStorageStats, fetchGetDashboardStats } from './dashboard'
import {
  fetchBillingConfigList,
  fetchCreateBillingConfig,
  fetchBillingConfigDetail,
  fetchUpdateBillingConfig,
  fetchToggleBillingConfig,
  fetchBillingConfigHistory
} from './billing-config'
import { fetchAdminTeamList, fetchAdminTeamDetail } from './team-manage'
import { fetchAdminUserList, fetchAdminUserDetail, fetchToggleUserStatus } from './user-manage'
import {
  fetchMenuList,
  fetchCreateMenu,
  fetchUpdateMenu,
  fetchDeleteMenu,
  fetchToggleMenuStatus,
  fetchReorderMenus
} from './menus'

// ============================================================
// 审计日志
// ============================================================

/** 审计日志列表 */
export function useAuditLogList(params?: MaybeRefOrGetter<Record<string, unknown> | undefined>) {
  return useQuery({
    queryKey: ['admin', 'audit-log', params] as const,
    queryFn: async () => {
      const p = toValue(params)
      return await fetchAuditLogList(p as any)
    }
  })
}

/** 导出审计日志 */
export function useExportAuditLogs() {
  return useMutation({
    mutationFn: fetchExportAuditLogs
  })
}

// ============================================================
// 管理后台仪表盘
// ============================================================

/** 存储统计 */
export function useAdminStorageStats() {
  return useQuery({
    queryKey: ['admin', 'storage-stats'] as const,
    queryFn: () => fetchGetStorageStats(),
    staleTime: 60 * 1000
  })
}

/** 核心统计数据 */
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'] as const,
    queryFn: () => fetchGetDashboardStats(),
    staleTime: 60 * 1000
  })
}

// ============================================================
// 计费配置
// ============================================================

/** 计费配置列表 */
export function useAdminBillingConfigList() {
  return useQuery({
    queryKey: ['admin', 'billing-config', 'list'] as const,
    queryFn: () => fetchBillingConfigList(),
    staleTime: 5 * 60 * 1000
  })
}

/** 计费配置详情 */
export function useAdminBillingConfigDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'billing-config', 'detail', id] as const,
    queryFn: () => fetchBillingConfigDetail(id)
  })
}

/** 创建计费配置 */
export function useCreateBillingConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchCreateBillingConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing-config'] })
    }
  })
}

/** 更新计费配置 */
export function useUpdateBillingConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: Parameters<typeof fetchUpdateBillingConfig>[1]
    }) => fetchUpdateBillingConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing-config'] })
    }
  })
}

/** 切换计费配置状态 */
export function useToggleBillingConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchToggleBillingConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing-config'] })
    }
  })
}

/** 计费配置历史 */
export function useBillingConfigHistory(id: string) {
  return useQuery({
    queryKey: ['admin', 'billing-config', 'history', id] as const,
    queryFn: () => fetchBillingConfigHistory(id)
  })
}

// ============================================================
// 团队管理（Admin）
// ============================================================

/** 管理后台团队列表 */
export function useAdminTeamList(params?: MaybeRefOrGetter<Record<string, unknown> | undefined>) {
  return useQuery({
    queryKey: ['admin', 'team', 'list', params] as const,
    queryFn: async () => {
      const p = toValue(params)
      return await fetchAdminTeamList(p as any)
    }
  })
}

/** 管理后台团队详情 */
export function useAdminTeamDetail(teamId: string) {
  return useQuery({
    queryKey: ['admin', 'team', 'detail', teamId] as const,
    queryFn: () => fetchAdminTeamDetail(teamId)
  })
}

// ============================================================
// 用户管理（Admin）
// ============================================================

/** 管理后台用户列表 */
export function useAdminUserList(params?: MaybeRefOrGetter<Record<string, unknown> | undefined>) {
  return useQuery({
    queryKey: ['admin', 'user', 'list', params] as const,
    queryFn: async () => {
      const p = toValue(params)
      return await fetchAdminUserList(p as any)
    }
  })
}

/** 管理后台用户详情 */
export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'user', 'detail', id] as const,
    queryFn: () => fetchAdminUserDetail(id)
  })
}

/** 切换用户状态 */
export function useToggleAdminUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      fetchToggleUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user'] })
    }
  })
}

// ============================================================
// 菜单管理（Admin）
// ============================================================

/** 菜单列表（树形结构） */
export function useMenuList() {
  return useQuery({
    queryKey: ['admin', 'menu', 'list'] as const,
    queryFn: () => fetchMenuList()
  })
}

/** 创建菜单 */
export function useCreateMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchCreateMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu'] })
    }
  })
}

/** 更新菜单 */
export function useUpdateMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, data }: { menuId: string; data: Api.Admin.SysMenuUpdateRequest }) =>
      fetchUpdateMenu(menuId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu'] })
    }
  })
}

/** 删除菜单 */
export function useDeleteMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchDeleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu'] })
    }
  })
}

/** 切换菜单启用/禁用状态 */
export function useToggleMenuStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchToggleMenuStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu'] })
    }
  })
}

/** 菜单重排序 */
export function useReorderMenus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchReorderMenus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu'] })
    }
  })
}
