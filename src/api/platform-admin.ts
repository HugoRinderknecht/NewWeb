import { getApiAdapter } from './adapter'

export function fetchGetAdminTeamList(params?: Api.PlatformAdmin.AdminTeamSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.PlatformAdmin.AdminTeamListItem>>(
    '/api/admin/teams',
    params
  )
}

export function fetchCreateAdminTeam(data: Api.PlatformAdmin.CreateAdminTeamParams) {
  return getApiAdapter().post<Api.PlatformAdmin.AdminTeamDetail>('/api/admin/teams', data)
}

export function fetchGetAdminTeamDetail(teamId: string) {
  return getApiAdapter().get<Api.PlatformAdmin.AdminTeamDetail>(`/api/admin/teams/${teamId}`)
}

export function fetchUpdateAdminTeam(
  teamId: string,
  data: Api.PlatformAdmin.UpdateAdminTeamParams
) {
  return getApiAdapter().put<Api.PlatformAdmin.AdminTeamDetail>(`/api/admin/teams/${teamId}`, data)
}

export function fetchDeleteAdminTeam(teamId: string) {
  return getApiAdapter().del<void>(`/api/admin/teams/${teamId}`)
}

export function fetchSetAdminTeamStatus(
  teamId: string,
  data: Api.PlatformAdmin.SetTeamStatusParams
) {
  return getApiAdapter().put<void>(`/api/admin/teams/${teamId}/status`, data)
}

export function fetchTransferAdminTeamOwner(
  teamId: string,
  data: Api.PlatformAdmin.TransferOwnerParams
) {
  return getApiAdapter().put<void>(`/api/admin/teams/${teamId}/owner`, data)
}

export function fetchGetAdminTeamMembers(
  teamId: string,
  params?: Api.PlatformAdmin.AdminMemberSearchParams
) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.PlatformAdmin.AdminMemberListItem>>(
    `/api/admin/teams/${teamId}/members`,
    params
  )
}

export function fetchGetAdminInviteCodes(
  teamId: string,
  params?: Api.PlatformAdmin.AdminInviteCodeSearchParams
) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.PlatformAdmin.AdminInviteCodeItem>>(
    `/api/admin/teams/${teamId}/invite-codes`,
    params
  )
}

export function fetchCreateAdminInviteCode(
  teamId: string,
  data?: Api.PlatformAdmin.CreateAdminInviteCodeParams
) {
  return getApiAdapter().post<Api.PlatformAdmin.AdminInviteCodeItem>(
    `/api/admin/teams/${teamId}/invite-codes`,
    data
  )
}

export function fetchGetAdminApplications(
  teamId: string,
  params?: Api.PlatformAdmin.AdminApplicationSearchParams
) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.PlatformAdmin.AdminApplicationItem>>(
    `/api/admin/teams/${teamId}/applications`,
    params
  )
}

export function fetchUpdateAdminMemberStatus(
  id: string,
  data: Api.PlatformAdmin.UpdateMemberStatusParams
) {
  return getApiAdapter().put<void>(`/api/admin/members/${id}/status`, data)
}

export function fetchApproveAdminApplication(id: string) {
  return getApiAdapter().put<void>(`/api/admin/applications/${id}/approve`)
}

export function fetchRejectAdminApplication(
  id: string,
  data?: Api.PlatformAdmin.RejectApplicationParams
) {
  return getApiAdapter().put<void>(`/api/admin/applications/${id}/reject`, data)
}

export function fetchRevokeAdminInviteCode(id: string) {
  return getApiAdapter().del<void>(`/api/admin/invite-codes/${id}`)
}
