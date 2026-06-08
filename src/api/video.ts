import { getApiAdapter } from './adapter'

export function fetchPreviewVideoGeneration(params: Api.Video.VideoPreviewParams) {
  return getApiAdapter().post<Api.Video.VideoPreviewResult>(
    '/api/seedance/generations/preview',
    params
  )
}

export function fetchSubmitVideoGeneration(params: Api.Video.VideoGenerateParams) {
  return getApiAdapter().post<Api.Video.VideoSubmitResult>('/api/seedance/generations', params)
}

export function fetchGetVideoTaskList(params?: Api.Video.VideoTaskSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Video.VideoTask>>(
    '/api/seedance/tasks',
    params
  )
}

export function fetchGetVideoTaskDetail(taskId: string) {
  return getApiAdapter().get<Api.Video.VideoTask>(`/api/seedance/tasks/${taskId}`)
}

export function fetchGetVideoTaskResult(
  taskId: string,
  params?: { projectId: string; resolution?: string }
) {
  return getApiAdapter().get<Api.Video.VideoTaskResult>(
    `/api/seedance/tasks/${taskId}/result`,
    params
  )
}

export function fetchCancelVideoTask(taskId: string, projectId: string) {
  return getApiAdapter().post<void>(`/api/seedance/tasks/${taskId}/cancel`, undefined, {
    params: { projectId }
  })
}
