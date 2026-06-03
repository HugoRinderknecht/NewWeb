import { getApiAdapter } from './adapter'

export function fetchGetVideoModelList() {
  return getApiAdapter().get<Api.VideoModel.VideoModelListItem[]>('/api/admin/videos/models')
}

export function fetchCreateVideoModel(data: Api.VideoModel.CreateVideoModelParams) {
  return getApiAdapter().post<Api.VideoModel.VideoModelDetail>('/api/admin/videos/models', data)
}

export function fetchUpdateVideoModel(
  modelId: string,
  data: Api.VideoModel.UpdateVideoModelParams
) {
  return getApiAdapter().put<Api.VideoModel.VideoModelDetail>(
    `/api/admin/videos/models/${modelId}`,
    data
  )
}

export function fetchDeleteVideoModel(modelId: string) {
  return getApiAdapter().del<void>(`/api/admin/videos/models/${modelId}`)
}

export function fetchToggleVideoModelStatus(
  modelId: string,
  data: Api.VideoModel.ToggleVideoModelStatusParams
) {
  return getApiAdapter().request<void>({
    method: 'PATCH',
    url: `/api/admin/videos/models/${modelId}/status`,
    data
  })
}
