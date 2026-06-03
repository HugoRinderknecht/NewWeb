import { getApiAdapter } from './adapter'

export function fetchGetProjectList(params?: Api.Project.ProjectSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Project.ProjectListItem>>(
    '/api/projects',
    params
  )
}

export function fetchGetProjectDetail(projectId: string) {
  return getApiAdapter().get<Api.Project.ProjectDetail>(`/api/projects/${projectId}`)
}

export function fetchCreateProject(params: Api.Project.CreateProjectParams) {
  return getApiAdapter().post<Api.Project.ProjectDetail>('/api/projects', params)
}

export function fetchUpdateProject(projectId: string, params: Api.Project.UpdateProjectParams) {
  return getApiAdapter().put<Api.Project.ProjectDetail>(`/api/projects/${projectId}`, params)
}

export function fetchDeleteProject(projectId: string) {
  return getApiAdapter().del<void>(`/api/projects/${projectId}`)
}

export function fetchRestoreProject(projectId: string) {
  return getApiAdapter().post<void>(`/api/projects/${projectId}/restore`)
}

export function fetchArchiveProject(projectId: string) {
  return getApiAdapter().post<void>(`/api/projects/${projectId}/archive`)
}

export function fetchUnarchiveProject(projectId: string) {
  return getApiAdapter().post<void>(`/api/projects/${projectId}/unarchive`)
}

export function fetchUpdateProjectStatus(projectId: string, status: number) {
  return getApiAdapter().put<void>(`/api/projects/${projectId}/status`, { status })
}

export function fetchCopyProject(projectId: string, projectName?: string) {
  return getApiAdapter().post<Api.Project.ProjectDetail>(
    `/api/projects/${projectId}/copy`,
    projectName ? { projectName } : undefined
  )
}

export function fetchUploadProjectCover(projectId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return getApiAdapter().post<Api.Project.CoverUploadResponse>(
    `/api/projects/${projectId}/cover`,
    formData
  )
}

export function fetchGetProjectMembers(projectId: string, params?: Api.Project.MemberSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Project.ProjectMemberVO>>(
    `/api/projects/${projectId}/members`,
    params
  )
}

export function fetchAddProjectMember(projectId: string, params: Api.Project.AddMemberParams) {
  return getApiAdapter().post<void>(`/api/projects/${projectId}/members`, params)
}

export function fetchUpdateProjectMemberRole(
  projectId: string,
  params: Api.Project.UpdateMemberRoleParams
) {
  const query = new URLSearchParams({ memberId: params.memberId, role: params.role }).toString()
  return getApiAdapter().put<void>(`/api/projects/${projectId}/members/role?${query}`)
}

export function fetchRemoveProjectMember(projectId: string, memberId: string) {
  return getApiAdapter().del<void>(`/api/projects/${projectId}/members/${memberId}`)
}

export function fetchGetProjectConfig(projectId: string) {
  return getApiAdapter().get<Api.Project.ProjectConfigVO>(`/api/projects/${projectId}/config`)
}

export function fetchUpdateProjectConfig(projectId: string, configs: Record<string, string>) {
  return getApiAdapter().put<void>(`/api/projects/${projectId}/config`, configs)
}

export function fetchGetReviewConfig(projectId: string) {
  return getApiAdapter().get<Api.Project.ReviewConfigVO>(`/api/projects/${projectId}/review-config`)
}

export function fetchUpdateReviewConfig(projectId: string, params: Api.Project.ReviewConfigParams) {
  return getApiAdapter().put<void>(`/api/projects/${projectId}/review-config`, params)
}

export function fetchGetProjectStatistics(projectId: string) {
  return getApiAdapter().get<Record<string, any>>(`/api/projects/${projectId}/statistics`)
}
