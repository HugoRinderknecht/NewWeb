import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchAuditLogList
} from './audit-log'
import {
  fetchGetStorageStats,
  fetchGetDashboardStats
} from './dashboard'
import {
  fetchBillingConfigList,
  fetchCreateBillingConfig,
  fetchBillingConfigDetail,
  fetchUpdateBillingConfig,
  fetchToggleBillingConfig,
  fetchBillingConfigHistory
} from './billing-config'
import {
  fetchGetAdminTeamList,
  fetchGetAdminTeamDetail
} from './team-manage'
import {
  fetchGetUserList,
  fetchGetUserDetail,
  fetchToggleUserStatus
} from './user-manage'

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
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof fetchUpdateBillingConfig>[1] }) =>
      fetchUpdateBillingConfig(id, data),
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
      return await fetchGetAdminTeamList(p as any)
    }
  })
}

/** 管理后台团队详情 */
export function useAdminTeamDetail(teamId: string) {
  return useQuery({
    queryKey: ['admin', 'team', 'detail', teamId] as const,
    queryFn: () => fetchGetAdminTeamDetail(teamId)
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
      return await fetchGetUserList(p as any)
    }
  })
}

/** 管理后台用户详情 */
export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'user', 'detail', id] as const,
    queryFn: () => fetchGetUserDetail(id)
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
