import request from '@/utils/http'

/**
 * 获取剪辑项目列表
 * @param params 查询参数
 */
export function fetchGetEditProjectList(params?: Api.Editor.EditProjectSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Editor.EditProject>>({
    url: '/api/edit/projects',
    params
  })
}

/**
 * 获取剪辑项目详情
 * @param projectId 剪辑项目ID
 */
export function fetchGetEditProjectDetail(projectId: string) {
  return request.get<Api.Editor.EditProjectDetail>({
    url: `/api/edit/projects/${projectId}`
  })
}

/**
 * 创建剪辑项目
 * @param params 创建参数
 */
export function fetchCreateEditProject(params: Api.Editor.CreateEditProjectParams) {
  return request.post<Api.Editor.EditProject>({
    url: '/api/edit/projects',
    params
  })
}

/**
 * 更新剪辑项目
 * @param projectId 剪辑项目ID
 * @param params 更新参数
 */
export function fetchUpdateEditProject(projectId: string, params: Api.Editor.UpdateEditProjectParams) {
  return request.put<Api.Editor.EditProject>({
    url: `/api/edit/projects/${projectId}`,
    params
  })
}

/**
 * 删除剪辑项目
 * @param projectId 剪辑项目ID
 */
export function fetchDeleteEditProject(projectId: string) {
  return request.del<void>({
    url: `/api/edit/projects/${projectId}`
  })
}

/**
 * 添加片段
 * @param projectId 剪辑项目ID
 * @param params 片段参数
 */
export function fetchAddSegment(projectId: string, params: Api.Editor.AddSegmentParams) {
  return request.post<Api.Editor.Segment>({
    url: `/api/edit/projects/${projectId}/segments`,
    params
  })
}

/**
 * 更新片段
 * @param projectId 剪辑项目ID
 * @param segmentId 片段ID
 * @param params 更新参数
 */
export function fetchUpdateSegment(projectId: string, segmentId: string, params: Api.Editor.UpdateSegmentParams) {
  return request.put<Api.Editor.Segment>({
    url: `/api/edit/projects/${projectId}/segments/${segmentId}`,
    params
  })
}

/**
 * 删除片段
 * @param projectId 剪辑项目ID
 * @param segmentId 片段ID
 */
export function fetchDeleteSegment(projectId: string, segmentId: string) {
  return request.del<void>({
    url: `/api/edit/projects/${projectId}/segments/${segmentId}`
  })
}

/**
 * 片段重排序
 * @param projectId 剪辑项目ID
 * @param segmentIds 排序后的片段ID列表
 */
export function fetchReorderSegments(projectId: string, segmentIds: string[]) {
  return request.put<void>({
    url: `/api/edit/projects/${projectId}/segments/reorder`,
    params: { segmentIds }
  })
}

/**
 * 导出成片
 * @param projectId 剪辑项目ID
 * @param params 导出参数
 */
export function fetchExportVideo(projectId: string, params: Api.Editor.ExportParams) {
  return request.post<Api.Editor.ExportTask>({
    url: `/api/edit/projects/${projectId}/export`,
    params
  })
}

/**
 * 查询导出状态
 * @param exportId 导出任务ID
 */
export function fetchGetExportStatus(exportId: string) {
  return request.get<Api.Editor.ExportTask>({
    url: `/api/edit/exports/${exportId}`
  })
}
