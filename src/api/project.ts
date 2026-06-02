import request from '@/utils/http'

/**
 * 获取项目列表
 * @param params 查询参数
 */
export function fetchGetProjectList(params?: Api.Project.ProjectSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Project.ProjectListItem>>({
    url: '/api/projects',
    params
  })
}

/**
 * 获取项目详情
 * @param projectId 项目ID
 */
export function fetchGetProjectDetail(projectId: string) {
  return request.get<Api.Project.ProjectDetail>({
    url: `/api/projects/${projectId}`
  })
}

/**
 * 创建项目
 * @param params 创建参数
 */
export function fetchCreateProject(params: Api.Project.CreateProjectParams) {
  return request.post<Api.Project.ProjectDetail>({
    url: '/api/projects',
    params
  })
}

/**
 * 更新项目
 * @param projectId 项目ID
 * @param params 更新参数
 */
export function fetchUpdateProject(projectId: string, params: Api.Project.UpdateProjectParams) {
  return request.put<Api.Project.ProjectDetail>({
    url: `/api/projects/${projectId}`,
    params
  })
}

/**
 * 删除项目
 * @param projectId 项目ID
 */
export function fetchDeleteProject(projectId: string) {
  return request.del<void>({
    url: `/api/projects/${projectId}`
  })
}

/**
 * 恢复项目
 * @param projectId 项目ID
 */
export function fetchRestoreProject(projectId: string) {
  return request.post<void>({
    url: `/api/projects/${projectId}/restore`
  })
}

/**
 * 归档项目
 * @param projectId 项目ID
 */
export function fetchArchiveProject(projectId: string) {
  return request.post<void>({
    url: `/api/projects/${projectId}/archive`
  })
}

/**
 * 解档项目
 * @param projectId 项目ID
 */
export function fetchUnarchiveProject(projectId: string) {
  return request.post<void>({
    url: `/api/projects/${projectId}/unarchive`
  })
}

/**
 * 更新项目状态
 * @param projectId 项目ID
 * @param status 目标状态
 */
export function fetchUpdateProjectStatus(projectId: string, status: number) {
  return request.put<void>({
    url: `/api/projects/${projectId}/status`,
    params: { status }
  })
}

/**
 * 复制项目
 * @param projectId 项目ID
 * @param projectName 新项目名称（可选）
 */
export function fetchCopyProject(projectId: string, projectName?: string) {
  return request.post<Api.Project.ProjectDetail>({
    url: `/api/projects/${projectId}/copy`,
    params: projectName ? { projectName } : undefined
  })
}

/**
 * 上传项目封面
 * @param projectId 项目ID
 * @param file 封面文件
 */
export function fetchUploadProjectCover(projectId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<Api.Project.CoverUploadResponse>({
    url: `/api/projects/${projectId}/cover`,
    params: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 获取项目成员列表
 * @param projectId 项目ID
 * @param params 查询参数
 */
export function fetchGetProjectMembers(projectId: string, params?: Api.Project.MemberSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Project.ProjectMemberVO>>({
    url: `/api/projects/${projectId}/members`,
    params
  })
}

/**
 * 添加项目成员
 * @param projectId 项目ID
 * @param params 成员参数
 */
export function fetchAddProjectMember(projectId: string, params: Api.Project.AddMemberParams) {
  return request.post<void>({
    url: `/api/projects/${projectId}/members`,
    params
  })
}

/**
 * 更新项目成员角色
 * @param projectId 项目ID
 * @param params 角色更新参数
 */
export function fetchUpdateProjectMemberRole(projectId: string, params: Api.Project.UpdateMemberRoleParams) {
  return request.put<void>({
    url: `/api/projects/${projectId}/members/role`,
    params
  })
}

/**
 * 移除项目成员
 * @param projectId 项目ID
 * @param memberId 成员ID
 */
export function fetchRemoveProjectMember(projectId: string, memberId: string) {
  return request.del<void>({
    url: `/api/projects/${projectId}/members/${memberId}`
  })
}

/**
 * 获取项目配置
 * @param projectId 项目ID
 */
export function fetchGetProjectConfig(projectId: string) {
  return request.get<Api.Project.ProjectConfigVO>({
    url: `/api/projects/${projectId}/config`
  })
}

/**
 * 更新项目配置
 * @param projectId 项目ID
 * @param configs 配置项
 */
export function fetchUpdateProjectConfig(projectId: string, configs: Record<string, string>) {
  return request.put<void>({
    url: `/api/projects/${projectId}/config`,
    params: configs
  })
}

/**
 * 获取审核门禁配置
 * @param projectId 项目ID
 */
export function fetchGetReviewConfig(projectId: string) {
  return request.get<Api.Project.ReviewConfigVO>({
    url: `/api/projects/${projectId}/review-config`
  })
}

/**
 * 更新审核门禁配置
 * @param projectId 项目ID
 * @param params 配置参数
 */
export function fetchUpdateReviewConfig(projectId: string, params: Api.Project.ReviewConfigParams) {
  return request.put<void>({
    url: `/api/projects/${projectId}/review-config`,
    params
  })
}

/**
 * 获取项目统计
 * @param projectId 项目ID
 */
export function fetchGetProjectStatistics(projectId: string) {
  return request.get<Record<string, any>>({
    url: `/api/projects/${projectId}/statistics`
  })
}