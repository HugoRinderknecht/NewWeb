import request from '@/utils/http'

/**
 * 获取我的团队列表
 */
export function fetchGetMyTeams() {
  return request.get<Api.Team.UserTeamVO[]>({
    url: '/api/teams/member/teams'
  })
}

/**
 * 获取团队详情
 * @param teamId 团队ID
 */
export function fetchGetTeamDetail(teamId: string) {
  return request.get<Api.Team.TeamDetail>({
    url: `/api/teams/${teamId}`
  })
}

/**
 * 更新团队信息
 * @param teamId 团队ID
 * @param params 更新参数
 */
export function fetchUpdateTeam(teamId: string, params: Api.Team.UpdateTeamParams) {
  return request.put<Api.Team.TeamDetail>({
    url: `/api/teams/${teamId}`,
    params
  })
}

/**
 * 切换当前团队
 * @param teamId 目标团队ID
 */
export function fetchSwitchTeam(teamId: string) {
  return request.post<void>({
    url: '/api/teams/member/switch',
    params: { teamId }
  })
}

/**
 * 申请加入团队
 * @param params 申请参数
 */
export function fetchApplyJoinTeam(params: Api.Team.JoinApplyParams) {
  return request.post<void>({
    url: '/api/teams/member/apply',
    params
  })
}

/**
 * 通过邀请码加入团队
 * @param code 邀请码
 */
export function fetchJoinByCode(code: string) {
  return request.post<void>({
    url: '/api/teams/member/join-by-code',
    params: { code }
  })
}

/**
 * 退出团队
 * @param teamId 团队ID
 */
export function fetchLeaveTeam(teamId: string) {
  return request.post<void>({
    url: '/api/teams/member/leave',
    params: { teamId }
  })
}

/**
 * 获取我的申请记录
 */
export function fetchGetMyApplications() {
  return request.get<Api.Team.JoinApplicationVO[]>({
    url: '/api/teams/member/applications'
  })
}

/**
 * 获取团队成员列表
 * @param teamId 团队ID
 * @param params 查询参数
 */
export function fetchGetTeamMembers(teamId: string, params?: Api.Team.MemberSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Team.TeamMemberVO>>({
    url: `/api/teams/${teamId}/members`,
    params
  })
}

/**
 * 批量导入成员
 * @param teamId 团队ID
 * @param userIds 用户ID列表
 */
export function fetchImportMembers(teamId: string, userIds: string[]) {
  return request.post<void>({
    url: `/api/teams/${teamId}/members/import`,
    params: { userIds }
  })
}

/**
 * 更新成员角色
 * @param teamId 团队ID
 * @param params 角色更新参数
 */
export function fetchUpdateMemberRole(teamId: string, params: Api.Team.UpdateMemberRoleParams) {
  return request.put<void>({
    url: `/api/teams/${teamId}/members/role`,
    params
  })
}

/**
 * 更新成员状态
 * @param teamId 团队ID
 * @param params 状态更新参数
 */
export function fetchUpdateMemberStatus(teamId: string, params: Api.Team.UpdateMemberStatusParams) {
  return request.put<void>({
    url: `/api/teams/${teamId}/members/status`,
    params
  })
}

/**
 * 移除成员
 * @param teamId 团队ID
 * @param memberId 成员ID
 */
export function fetchRemoveMember(teamId: string, memberId: string) {
  return request.del<void>({
    url: `/api/teams/${teamId}/members/${memberId}`
  })
}

/**
 * 获取成员权限
 * @param teamId 团队ID
 * @param memberId 成员ID
 */
export function fetchGetMemberPermissions(teamId: string, memberId: string) {
  return request.get<Api.Team.MemberPermissionVO>({
    url: `/api/teams/${teamId}/members/${memberId}/permissions`
  })
}

/**
 * 设置成员权限
 * @param teamId 团队ID
 * @param memberId 成员ID
 * @param permissionCodes 权限码列表
 */
export function fetchSetMemberPermissions(teamId: string, memberId: string, permissionCodes: string[]) {
  return request.put<void>({
    url: `/api/teams/${teamId}/members/${memberId}/permissions`,
    params: { permissionCodes }
  })
}

/**
 * 转移团队所有权
 * @param teamId 团队ID
 * @param newOwnerId 新所有者成员ID
 */
export function fetchTransferOwnership(teamId: string, newOwnerId: string) {
  return request.put<void>({
    url: `/api/teams/${teamId}/owner`,
    params: { newOwnerId }
  })
}

/**
 * 获取团队角色列表
 * @param teamId 团队ID
 */
export function fetchGetTeamRoles(teamId: string) {
  return request.get<Api.Team.TeamRoleVO[]>({
    url: `/api/teams/${teamId}/roles`
  })
}

/**
 * 创建团队角色
 * @param teamId 团队ID
 * @param params 角色参数
 */
export function fetchCreateTeamRole(teamId: string, params: Api.Team.CreateRoleParams) {
  return request.post<Api.Team.TeamRoleVO>({
    url: `/api/teams/${teamId}/roles`,
    params
  })
}

/**
 * 更新团队角色
 * @param teamId 团队ID
 * @param roleId 角色ID
 * @param params 更新参数
 */
export function fetchUpdateTeamRole(teamId: string, roleId: string, params: Api.Team.UpdateRoleParams) {
  return request.put<void>({
    url: `/api/teams/${teamId}/roles/${roleId}`,
    params
  })
}

/**
 * 删除团队角色
 * @param teamId 团队ID
 * @param roleId 角色ID
 */
export function fetchDeleteTeamRole(teamId: string, roleId: string) {
  return request.del<void>({
    url: `/api/teams/${teamId}/roles/${roleId}`
  })
}

/**
 * 获取角色权限详情
 * @param teamId 团队ID
 * @param roleId 角色ID
 */
export function fetchGetRolePermissions(teamId: string, roleId: string) {
  return request.get<Api.Team.TeamRoleDetailVO>({
    url: `/api/teams/${teamId}/roles/${roleId}/permissions`
  })
}

/**
 * 设置角色权限
 * @param teamId 团队ID
 * @param roleId 角色ID
 * @param permissionCodes 权限码列表
 */
export function fetchSetRolePermissions(teamId: string, roleId: string, permissionCodes: string[]) {
  return request.put<void>({
    url: `/api/teams/${teamId}/roles/${roleId}/permissions`,
    params: { permissionCodes }
  })
}

/**
 * 获取可分配权限列表
 * @param teamId 团队ID
 */
export function fetchGetAvailablePermissions(teamId: string) {
  return request.get<Api.Team.AvailablePermissionVO[]>({
    url: `/api/teams/${teamId}/available-permissions`
  })
}

/**
 * 获取我的权限
 */
export function fetchGetMyPermissions() {
  return request.get<string[]>({
    url: '/api/teams/member/permissions'
  })
}

/**
 * 获取邀请码列表
 * @param teamId 团队ID
 * @param params 查询参数
 */
export function fetchGetInviteCodes(teamId: string, params?: Api.Common.CommonSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Team.InviteCodeVO>>({
    url: `/api/teams/${teamId}/invite-codes`,
    params
  })
}

/**
 * 创建邀请码
 * @param teamId 团队ID
 * @param params 创建参数
 */
export function fetchCreateInviteCode(teamId: string, params?: Api.Team.CreateInviteCodeParams) {
  return request.post<Api.Team.InviteCodeVO>({
    url: `/api/teams/${teamId}/invite-codes`,
    params
  })
}

/**
 * 撤销邀请码
 * @param teamId 团队ID
 * @param id 邀请码ID
 */
export function fetchRevokeInviteCode(teamId: string, id: string) {
  return request.del<void>({
    url: `/api/teams/${teamId}/invite-codes/${id}`
  })
}

/**
 * 获取加入申请列表
 * @param teamId 团队ID
 * @param params 查询参数
 */
export function fetchGetJoinApplications(teamId: string, params?: Api.Team.ApplicationSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Team.JoinApplicationVO>>({
    url: `/api/teams/${teamId}/applications`,
    params
  })
}

/**
 * 审批通过
 * @param teamId 团队ID
 * @param id 申请ID
 */
export function fetchApproveApplication(teamId: string, id: string) {
  return request.put<void>({
    url: `/api/teams/${teamId}/applications/${id}/approve`
  })
}

/**
 * 审批拒绝
 * @param teamId 团队ID
 * @param id 申请ID
 * @param reason 拒绝原因
 */
export function fetchRejectApplication(teamId: string, id: string, reason?: string) {
  return request.put<void>({
    url: `/api/teams/${teamId}/applications/${id}/reject`,
    params: reason ? { rejectReason: reason } : undefined
  })
}