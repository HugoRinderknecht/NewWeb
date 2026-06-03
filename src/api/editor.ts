import { getApiAdapter } from './adapter'

export function fetchGetEditProjectList(params?: Api.Editor.EditProjectSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Editor.EditProject>>(
    '/api/edit/projects',
    params
  )
}

export function fetchGetEditProjectDetail(projectId: string) {
  return getApiAdapter().get<Api.Editor.EditProjectDetail>(`/api/edit/projects/${projectId}`)
}

export function fetchCreateEditProject(params: Api.Editor.CreateEditProjectParams) {
  return getApiAdapter().post<Api.Editor.EditProject>('/api/edit/projects', params)
}

export function fetchUpdateEditProject(
  projectId: string,
  params: Api.Editor.UpdateEditProjectParams
) {
  return getApiAdapter().put<Api.Editor.EditProject>(`/api/edit/projects/${projectId}`, params)
}

export function fetchDeleteEditProject(projectId: string) {
  return getApiAdapter().del<void>(`/api/edit/projects/${projectId}`)
}

export function fetchAddSegment(projectId: string, params: Api.Editor.AddSegmentParams) {
  return getApiAdapter().post<Api.Editor.Segment>(
    `/api/edit/projects/${projectId}/segments`,
    params
  )
}

export function fetchUpdateSegment(
  projectId: string,
  segmentId: string,
  params: Api.Editor.UpdateSegmentParams
) {
  return getApiAdapter().put<Api.Editor.Segment>(
    `/api/edit/projects/${projectId}/segments/${segmentId}`,
    params
  )
}

export function fetchDeleteSegment(projectId: string, segmentId: string) {
  return getApiAdapter().del<void>(`/api/edit/projects/${projectId}/segments/${segmentId}`)
}

export function fetchReorderSegments(projectId: string, segmentIds: string[]) {
  return getApiAdapter().put<void>(`/api/edit/projects/${projectId}/segments/reorder`, {
    segmentIds
  })
}

export function fetchExportVideo(projectId: string, params: Api.Editor.ExportParams) {
  return getApiAdapter().post<Api.Editor.ExportTask>(
    `/api/edit/projects/${projectId}/export`,
    params
  )
}

export function fetchGetExportStatus(exportId: string) {
  return getApiAdapter().get<Api.Editor.ExportTask>(`/api/edit/exports/${exportId}`)
}
