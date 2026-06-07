import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetMyTeams,
  fetchGetTeamDetail,
  fetchUpdateTeam,
  fetchSwitchTeam,
  fetchApplyJoinTeam,
  fetchJoinByCode,
  fetchLeaveTeam,
  fetchGetMyApplications,
  fetchGetTeamMembers,
  fetchImportMembers,
  fetchUpdateMemberRole,
  fetchUpdateMemberStatus,
  fetchRemoveMember,
  fetchGetMemberPermissions,
  fetchSetMemberPermissions,
  fetchTransferOwnership,
  fetchGetTeamRoles,
  fetchCreateTeamRole,
  fetchUpdateTeamRole,
  fetchDeleteTeamRole,
  fetchGetRolePermissions,
  fetchSetRolePermissions,
  fetchGetAvailablePermissions,
  fetchGetMyPermissions,
  fetchGetInviteCodes,
  fetchCreateInviteCode,
  fetchRevokeInviteCode,
  fetchGetJoinApplications,
  fetchApproveApplication,
  fetchRejectApplication
} from '@/api/team'

import { teamKeys } from './keys'

// ==================== 团队基础 ====================

/** 我的团队列表 */
export function useMyTeams() {
  return useQuery({
    queryKey: teamKeys.myTeams(),
    queryFn: async () => {
      const res = await fetchGetMyTeams()
      return res ?? []
    },
    staleTime: 5 * 60 * 1000
  })
}

/** 团队详情 */
export function useTeamDetail(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return null
      return await fetchGetTeamDetail(id)
    },
    enabled: () => !!toValue(teamId),
    staleTime: 60 * 1000
  })
}

/** 我的申请列表 */
export function useMyApplications() {
  return useQuery({
    queryKey: teamKeys.myApplications(),
    queryFn: async () => {
      const res = await fetchGetMyApplications()
      return res ?? []
    },
    staleTime: 30 * 1000
  })
}

/** 我的权限列表 */
export function useMyPermissions() {
  return useQuery({
    queryKey: teamKeys.myPermissions(),
    queryFn: async () => {
      const res = await fetchGetMyPermissions()
      return res ?? []
    },
    staleTime: 5 * 60 * 1000
  })
}

// ==================== 团队 Mutations ====================

/** 更新团队信息 */
export function useUpdateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; params: Api.Team.UpdateTeamParams }) =>
      fetchUpdateTeam(payload.teamId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) })
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams() })
    }
  })
}

/** 切换团队 */
export function useSwitchTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (teamId: string) => fetchSwitchTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams() })
      queryClient.invalidateQueries({ queryKey: teamKeys.myPermissions() })
    }
  })
}

/** 申请加入团队 */
export function useApplyJoinTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Team.JoinApplyParams) => fetchApplyJoinTeam(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.myApplications() })
    }
  })
}

/** 通过邀请码加入团队 */
export function useJoinByCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => fetchJoinByCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams() })
    }
  })
}

/** 离开团队 */
export function useLeaveTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (teamId: string) => fetchLeaveTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams() })
    }
  })
}

// ==================== 团队成员 ====================

/** 团队成员列表（分页） */
export function useTeamMembers(
  teamId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Team.MemberSearchParams | undefined>
) {
  return useQuery({
    queryKey: teamKeys.members(teamId, params),
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return null
      const res = await fetchGetTeamMembers(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(teamId),
    staleTime: 30 * 1000
  })
}

/** 成员权限详情 */
export function useMemberPermissions(
  teamId: MaybeRefOrGetter<string | undefined>,
  memberId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: teamKeys.memberPermissions(teamId, memberId),
    queryFn: async () => {
      const tid = toValue(teamId)
      const mid = toValue(memberId)
      if (!tid || !mid) return null
      return await fetchGetMemberPermissions(tid, mid)
    },
    enabled: () => !!toValue(teamId) && !!toValue(memberId),
    staleTime: 60 * 1000
  })
}

/** 成员 Mutations */
export function useImportMembers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; userIds: string[] }) =>
      fetchImportMembers(payload.teamId, payload.userIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.membersByTeam(variables.teamId) })
    }
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; params: Api.Team.UpdateMemberRoleParams }) =>
      fetchUpdateMemberRole(payload.teamId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.membersByTeam(variables.teamId) })
    }
  })
}

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; params: Api.Team.UpdateMemberStatusParams }) =>
      fetchUpdateMemberStatus(payload.teamId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.membersByTeam(variables.teamId) })
    }
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; memberId: string }) =>
      fetchRemoveMember(payload.teamId, payload.memberId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.membersByTeam(variables.teamId) })
    }
  })
}

export function useSetMemberPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; memberId: string; permissionCodes: string[] }) =>
      fetchSetMemberPermissions(payload.teamId, payload.memberId, payload.permissionCodes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.memberPermissions(variables.teamId, variables.memberId)
      })
    }
  })
}

export function useTransferOwnership() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; newOwnerId: string }) =>
      fetchTransferOwnership(payload.teamId, payload.newOwnerId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) })
      queryClient.invalidateQueries({ queryKey: teamKeys.membersByTeam(variables.teamId) })
    }
  })
}

// ==================== 团队角色 ====================

/** 团队角色列表 */
export function useTeamRoles(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: teamKeys.roles(teamId),
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return []
      return await fetchGetTeamRoles(id)
    },
    enabled: () => !!toValue(teamId),
    staleTime: 5 * 60 * 1000
  })
}

/** 角色权限详情 */
export function useRolePermissions(
  teamId: MaybeRefOrGetter<string | undefined>,
  roleId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: teamKeys.rolePermissions(teamId, roleId),
    queryFn: async () => {
      const tid = toValue(teamId)
      const rid = toValue(roleId)
      if (!tid || !rid) return null
      return await fetchGetRolePermissions(tid, rid)
    },
    enabled: () => !!toValue(teamId) && !!toValue(roleId),
    staleTime: 60 * 1000
  })
}

/** 可用权限列表 */
export function useAvailablePermissions(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: teamKeys.availablePermissions(teamId),
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return []
      return await fetchGetAvailablePermissions(id)
    },
    enabled: () => !!toValue(teamId),
    staleTime: 5 * 60 * 1000
  })
}

/** 角色 Mutations */
export function useCreateTeamRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; params: Api.Team.CreateRoleParams }) =>
      fetchCreateTeamRole(payload.teamId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.roles(variables.teamId) })
    }
  })
}

export function useUpdateTeamRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; roleId: string; params: Api.Team.UpdateRoleParams }) =>
      fetchUpdateTeamRole(payload.teamId, payload.roleId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.roles(variables.teamId) })
    }
  })
}

export function useDeleteTeamRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; roleId: string }) =>
      fetchDeleteTeamRole(payload.teamId, payload.roleId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.roles(variables.teamId) })
    }
  })
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; roleId: string; permissionCodes: string[] }) =>
      fetchSetRolePermissions(payload.teamId, payload.roleId, payload.permissionCodes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.rolePermissions(variables.teamId, variables.roleId)
      })
    }
  })
}

// ==================== 邀请码 ====================

/** 邀请码列表（分页） */
export function useInviteCodes(
  teamId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Common.CommonSearchParams | undefined>
) {
  return useQuery({
    queryKey: teamKeys.inviteCodes(teamId, params),
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return null
      const res = await fetchGetInviteCodes(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(teamId),
    staleTime: 30 * 1000
  })
}

/** 创建邀请码 */
export function useCreateInviteCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; params?: Api.Team.CreateInviteCodeParams }) =>
      fetchCreateInviteCode(payload.teamId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.inviteCodesByTeam(variables.teamId) })
    }
  })
}

/** 撤销邀请码 */
export function useRevokeInviteCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; id: string }) =>
      fetchRevokeInviteCode(payload.teamId, payload.id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.inviteCodesByTeam(variables.teamId) })
    }
  })
}

// ==================== 申请审批 ====================

/** 加入申请列表（分页） */
export function useJoinApplications(
  teamId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Team.ApplicationSearchParams | undefined>
) {
  return useQuery({
    queryKey: teamKeys.applications(teamId, params),
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return null
      const res = await fetchGetJoinApplications(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(teamId),
    staleTime: 30 * 1000
  })
}

/** 同意申请 */
export function useApproveApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; id: string }) =>
      fetchApproveApplication(payload.teamId, payload.id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.applicationsByTeam(variables.teamId) })
      queryClient.invalidateQueries({ queryKey: teamKeys.membersByTeam(variables.teamId) })
    }
  })
}

/** 拒绝申请 */
export function useRejectApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { teamId: string; id: string; reason?: string }) =>
      fetchRejectApplication(payload.teamId, payload.id, payload.reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.applicationsByTeam(variables.teamId) })
    }
  })
}
