import { getApiAdapter } from './adapter'

export function fetchGetMyTeams() {
  return getApiAdapter().get<Api.Team.UserTeamVO[]>('/api/teams/member/teams')
}

export function fetchGetTeamDetail(teamId: string) {
  return getApiAdapter().get<Api.Team.TeamDetail>(`/api/teams/${teamId}`)
}

export function fetchUpdateTeam(teamId: string, params: Api.Team.UpdateTeamParams) {
  return getApiAdapter().put<Api.Team.TeamDetail>(`/api/teams/${teamId}`, params)
}

export function fetchSwitchTeam(teamId: string) {
  return getApiAdapter().post<void>('/api/teams/member/switch', { teamId })
}

export function fetchApplyJoinTeam(params: Api.Team.JoinApplyParams) {
  return getApiAdapter().post<void>('/api/teams/member/apply', params)
}

/** 通过邀请码加入团队（文档：code 为 query 参数） */
export function fetchJoinByCode(code: string) {
  return getApiAdapter().post<void>('/api/teams/member/join-by-code', undefined, {
    params: { code }
  })
}

/** 退出团队（文档：teamId 为 query 参数） */
export function fetchLeaveTeam(teamId: string) {
  return getApiAdapter().post<void>('/api/teams/member/leave', undefined, {
    params: { teamId }
  })
}

export function fetchGetMyApplications() {
  return getApiAdapter().get<Api.Team.JoinApplicationVO[]>('/api/teams/member/applications')
}

export function fetchGetTeamMembers(teamId: string, params?: Api.Team.MemberSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Team.TeamMemberVO>>(
    `/api/teams/${teamId}/members`,
    params
  )
}

export function fetchImportMembers(teamId: string, userIds: string[]) {
  return getApiAdapter().post<void>(`/api/teams/${teamId}/members/import`, { userIds })
}

export function fetchUpdateMemberRole(teamId: string, params: Api.Team.UpdateMemberRoleParams) {
  return getApiAdapter().put<void>(`/api/teams/${teamId}/members/role`, params)
}

/** 更新成员状态（文档：memberId/status 均为 query 参数） */
export function fetchUpdateMemberStatus(teamId: string, params: Api.Team.UpdateMemberStatusParams) {
  return getApiAdapter().put<void>(`/api/teams/${teamId}/members/status`, undefined, {
    params
  })
}

export function fetchRemoveMember(teamId: string, memberId: string) {
  return getApiAdapter().del<void>(`/api/teams/${teamId}/members/${memberId}`)
}

export function fetchGetMemberPermissions(teamId: string, memberId: string) {
  return getApiAdapter().get<Api.Team.MemberPermissionVO>(
    `/api/teams/${teamId}/members/${memberId}/permissions`
  )
}

/** 设置成员权限（文档：请求体为 List<String>，即裸字符串数组） */
export function fetchSetMemberPermissions(
  teamId: string,
  memberId: string,
  permissionCodes: string[]
) {
  return getApiAdapter().put<void>(
    `/api/teams/${teamId}/members/${memberId}/permissions`,
    permissionCodes
  )
}

/** 转移团队所有权（文档：newOwnerId 为 query 参数） */
export function fetchTransferOwnership(teamId: string, newOwnerId: string) {
  return getApiAdapter().put<void>(`/api/teams/${teamId}/owner`, undefined, {
    params: { newOwnerId }
  })
}

export function fetchGetTeamRoles(teamId: string) {
  return getApiAdapter().get<Api.Team.TeamRoleVO[]>(`/api/teams/${teamId}/roles`)
}

export function fetchCreateTeamRole(teamId: string, params: Api.Team.CreateRoleParams) {
  return getApiAdapter().post<Api.Team.TeamRoleVO>(`/api/teams/${teamId}/roles`, params)
}

export function fetchUpdateTeamRole(
  teamId: string,
  roleId: string,
  params: Api.Team.UpdateRoleParams
) {
  return getApiAdapter().put<void>(`/api/teams/${teamId}/roles/${roleId}`, params)
}

export function fetchDeleteTeamRole(teamId: string, roleId: string) {
  return getApiAdapter().del<void>(`/api/teams/${teamId}/roles/${roleId}`)
}

export function fetchGetRolePermissions(teamId: string, roleId: string) {
  return getApiAdapter().get<Api.Team.TeamRoleDetailVO>(
    `/api/teams/${teamId}/roles/${roleId}/permissions`
  )
}

/** 设置角色权限（文档：请求体为 List<String>，即裸字符串数组） */
export function fetchSetRolePermissions(teamId: string, roleId: string, permissionCodes: string[]) {
  return getApiAdapter().put<void>(
    `/api/teams/${teamId}/roles/${roleId}/permissions`,
    permissionCodes
  )
}

export function fetchGetAvailablePermissions(teamId: string) {
  return getApiAdapter().get<Api.Team.AvailablePermissionVO[]>(
    `/api/teams/${teamId}/available-permissions`
  )
}

export function fetchGetMyPermissions() {
  return getApiAdapter().get<string[]>('/api/teams/member/permissions')
}

export function fetchGetInviteCodes(teamId: string, params?: Api.Common.CommonSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Team.InviteCodeVO>>(
    `/api/teams/${teamId}/invite-codes`,
    params
  )
}

export function fetchCreateInviteCode(teamId: string, params?: Api.Team.CreateInviteCodeParams) {
  return getApiAdapter().post<Api.Team.InviteCodeVO>(`/api/teams/${teamId}/invite-codes`, params)
}

export function fetchRevokeInviteCode(teamId: string, id: string) {
  return getApiAdapter().del<void>(`/api/teams/${teamId}/invite-codes/${id}`)
}

export function fetchGetJoinApplications(
  teamId: string,
  params?: Api.Team.ApplicationSearchParams
) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Team.JoinApplicationVO>>(
    `/api/teams/${teamId}/applications`,
    params
  )
}

export function fetchApproveApplication(teamId: string, id: string) {
  return getApiAdapter().put<void>(`/api/teams/${teamId}/applications/${id}/approve`)
}

/** 拒绝团队加入申请（文档：reason 为 query 参数，字段名为 reason） */
export function fetchRejectApplication(teamId: string, id: string, reason?: string) {
  return getApiAdapter().put<void>(
    `/api/teams/${teamId}/applications/${id}/reject`,
    undefined,
    reason ? { params: { reason } } : undefined
  )
}
