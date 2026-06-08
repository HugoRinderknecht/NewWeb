import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetAdminTeamList,
  fetchCreateAdminTeam,
  fetchGetAdminTeamDetail,
  fetchUpdateAdminTeam,
  fetchDeleteAdminTeam,
  fetchSetAdminTeamStatus,
  fetchTransferAdminTeamOwner,
  fetchGetAdminTeamMembers,
  fetchGetAdminInviteCodes,
  fetchCreateAdminInviteCode,
  fetchGetAdminApplications,
  fetchUpdateAdminMemberStatus,
  fetchApproveAdminApplication,
  fetchRejectAdminApplication,
  fetchRevokeAdminInviteCode
} from '@/api/platform-admin'

/** 平台管理员 - 团队列表 */
export function useAdminTeamList(params?: MaybeRefOrGetter<Record<string, unknown> | undefined>) {
  return useQuery({
    queryKey: ['platform-admin', 'team-list', params] as const,
    queryFn: async () => {
      const p = toValue(params)
      return await fetchGetAdminTeamList(p as any)
    }
  })
}

/** 平台管理员 - 团队详情 */
export function useAdminTeamDetail(teamId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['platform-admin', 'team-detail', teamId] as const,
    queryFn: async () => {
      const v = toValue(teamId)
      if (!v) return null
      return await fetchGetAdminTeamDetail(v)
    },
    enabled: () => !!toValue(teamId)
  })
}

/** 平台管理员 - 创建团队 */
export function useCreateAdminTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchCreateAdminTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'team-list'] })
    }
  })
}

/** 平台管理员 - 更新团队 */
export function useUpdateAdminTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      data
    }: {
      teamId: string
      data: Parameters<typeof fetchUpdateAdminTeam>[1]
    }) => fetchUpdateAdminTeam(teamId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'team-list'] })
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'team-detail', teamId] })
    }
  })
}

/** 平台管理员 - 删除团队 */
export function useDeleteAdminTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchDeleteAdminTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'team-list'] })
    }
  })
}

/** 平台管理员 - 设置团队状态 */
export function useSetAdminTeamStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      status
    }: {
      teamId: string
      status: number
    }) => fetchSetAdminTeamStatus(teamId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'team-list'] })
    }
  })
}

/** 平台管理员 - 转让团队所有权 */
export function useTransferAdminTeamOwner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      newOwnerId
    }: {
      teamId: string
      newOwnerId: string
    }) => fetchTransferAdminTeamOwner(teamId, newOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'team-list'] })
    }
  })
}

/** 平台管理员 - 团队成员列表 */
export function useAdminTeamMembers(
  teamId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<Record<string, unknown> | undefined>
) {
  return useQuery({
    queryKey: ['platform-admin', 'team-members', teamId, params] as const,
    queryFn: async () => {
      const v = toValue(teamId)
      const p = toValue(params)
      if (!v) return { list: [], total: 0 }
      return await fetchGetAdminTeamMembers(v, p as any)
    },
    enabled: () => !!toValue(teamId)
  })
}

/** 平台管理员 - 邀请码列表 */
export function useAdminInviteCodes(
  teamId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<Record<string, unknown> | undefined>
) {
  return useQuery({
    queryKey: ['platform-admin', 'invite-codes', teamId, params] as const,
    queryFn: async () => {
      const v = toValue(teamId)
      const p = toValue(params)
      if (!v) return { list: [], total: 0 }
      return await fetchGetAdminInviteCodes(v, p as any)
    },
    enabled: () => !!toValue(teamId)
  })
}

/** 平台管理员 - 创建邀请码 */
export function useCreateAdminInviteCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      data
    }: {
      teamId: string
      data?: Parameters<typeof fetchCreateAdminInviteCode>[1]
    }) => fetchCreateAdminInviteCode(teamId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'invite-codes', teamId] })
    }
  })
}

/** 平台管理员 - 申请列表 */
export function useAdminApplications(
  teamId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<Record<string, unknown> | undefined>
) {
  return useQuery({
    queryKey: ['platform-admin', 'applications', teamId, params] as const,
    queryFn: async () => {
      const v = toValue(teamId)
      const p = toValue(params)
      if (!v) return { list: [], total: 0 }
      return await fetchGetAdminApplications(v, p as any)
    },
    enabled: () => !!toValue(teamId)
  })
}

/** 平台管理员 - 审批申请 */
export function useApproveAdminApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchApproveAdminApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'applications'] })
    }
  })
}

/** 平台管理员 - 拒绝申请 */
export function useRejectAdminApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      reason
    }: {
      id: string
      reason?: string
    }) => fetchRejectAdminApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'applications'] })
    }
  })
}

/** 平台管理员 - 更新成员状态 */
export function useUpdateAdminMemberStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status
    }: {
      id: string
      status: number
    }) => fetchUpdateAdminMemberStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'team-members'] })
    }
  })
}

/** 平台管理员 - 撤销邀请码 */
export function useRevokeAdminInviteCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchRevokeAdminInviteCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'invite-codes'] })
    }
  })
}
