import request from '@/utils/http'

export function fetchGetAdminTeamList(params?: Api.PlatformAdmin.AdminTeamSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.PlatformAdmin.AdminTeamListItem>>({
    url: '/api/admin/teams',
    params
  })
}

export function fetchCreateAdminTeam(data: Api.PlatformAdmin.CreateAdminTeamParams) {
  return request.post<Api.PlatformAdmin.AdminTeamDetail>({
    url: '/api/admin/teams',
    data
  })
}

export function fetchGetAdminTeamDetail(teamId: string) {
  return request.get<Api.PlatformAdmin.AdminTeamDetail>({
    url: `/api/admin/teams/${teamId}`
  })
}

export function fetchUpdateAdminTeam(teamId: string, data: Api.PlatformAdmin.UpdateAdminTeamParams) {
  return request.put<Api.PlatformAdmin.AdminTeamDetail>({
    url: `/api/admin/teams/${teamId}`,
    data
  })
}

export function fetchDeleteAdminTeam(teamId: string) {
  return request.del<void>({
    url: `/api/admin/teams/${teamId}`
  })
}

export function fetchSetAdminTeamStatus(teamId: string, data: Api.PlatformAdmin.SetTeamStatusParams) {
  return request.put<void>({
    url: `/api/admin/teams/${teamId}/status`,
    data
  })
}

export function fetchTransferAdminTeamOwner(teamId: string, data: Api.PlatformAdmin.TransferOwnerParams) {
  return request.put<void>({
    url: `/api/admin/teams/${teamId}/owner`,
    data
  })
}

export function fetchGetAdminTeamMembers(teamId: string, params?: Api.PlatformAdmin.AdminMemberSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.PlatformAdmin.AdminMemberListItem>>({
    url: `/api/admin/teams/${teamId}/members`,
    params
  })
}

export function fetchGetAdminInviteCodes(teamId: string, params?: Api.PlatformAdmin.AdminInviteCodeSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.PlatformAdmin.AdminInviteCodeItem>>({
    url: `/api/admin/teams/${teamId}/invite-codes`,
    params
  })
}

export function fetchCreateAdminInviteCode(teamId: string, data?: Api.PlatformAdmin.CreateAdminInviteCodeParams) {
  return request.post<Api.PlatformAdmin.AdminInviteCodeItem>({
    url: `/api/admin/teams/${teamId}/invite-codes`,
    data
  })
}

export function fetchGetAdminApplications(teamId: string, params?: Api.PlatformAdmin.AdminApplicationSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.PlatformAdmin.AdminApplicationItem>>({
    url: `/api/admin/teams/${teamId}/applications`,
    params
  })
}

export function fetchUpdateAdminMemberStatus(id: string, data: Api.PlatformAdmin.UpdateMemberStatusParams) {
  return request.put<void>({
    url: `/api/admin/members/${id}/status`,
    data
  })
}

export function fetchApproveAdminApplication(id: string) {
  return request.put<void>({
    url: `/api/admin/applications/${id}/approve`
  })
}

export function fetchRejectAdminApplication(id: string, data?: Api.PlatformAdmin.RejectApplicationParams) {
  return request.put<void>({
    url: `/api/admin/applications/${id}/reject`,
    data
  })
}

export function fetchRevokeAdminInviteCode(id: string) {
  return request.del<void>({
    url: `/api/admin/invite-codes/${id}`
  })
}
