import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetUserList,
  fetchGetUserDetail,
  fetchUpdateUserStatus,
  fetchGetRoleList,
  fetchCreateRole,
  fetchUpdateRole,
  fetchDeleteRole
} from '@/api/system-manage'

/** 管理后台用户列表 */
export function useAdminUserList(params?: MaybeRefOrGetter<Record<string, unknown> | undefined>) {
  return useQuery({
    queryKey: ['system-manage', 'user-list', params] as const,
    queryFn: async () => {
      const p = toValue(params)
      return await fetchGetUserList(p as any)
    }
  })
}

/** 管理后台用户详情 */
export function useAdminUserDetail(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['system-manage', 'user-detail', id] as const,
    queryFn: async () => {
      const v = toValue(id)
      if (!v) return null
      return await fetchGetUserDetail(v)
    },
    enabled: () => !!toValue(id)
  })
}

/** 更新用户状态 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      fetchUpdateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-manage', 'user-list'] })
    }
  })
}

/** 角色列表 */
export function useAdminRoleList(params?: MaybeRefOrGetter<Record<string, unknown> | undefined>) {
  return useQuery({
    queryKey: ['system-manage', 'role-list', params] as const,
    queryFn: async () => {
      const p = toValue(params)
      return await fetchGetRoleList(p as any)
    }
  })
}

/** 创建角色 */
export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchCreateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-manage', 'role-list'] })
    }
  })
}

/** 更新角色 */
export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      roleId,
      data
    }: {
      roleId: number
      data: Record<string, unknown>
    }) => fetchUpdateRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-manage', 'role-list'] })
    }
  })
}

/** 删除角色 */
export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchDeleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-manage', 'role-list'] })
    }
  })
}
