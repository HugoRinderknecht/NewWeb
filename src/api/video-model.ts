import request from '@/utils/http'

export function fetchGetVideoModelList() {
  return request.get<Api.VideoModel.VideoModelListItem[]>({
    url: '/api/admin/videos/models'
  })
}

export function fetchCreateVideoModel(data: Api.VideoModel.CreateVideoModelParams) {
  return request.post<Api.VideoModel.VideoModelDetail>({
    url: '/api/admin/videos/models',
    data
  })
}

export function fetchUpdateVideoModel(modelId: string, data: Api.VideoModel.UpdateVideoModelParams) {
  return request.put<Api.VideoModel.VideoModelDetail>({
    url: `/api/admin/videos/models/${modelId}`,
    data
  })
}

export function fetchDeleteVideoModel(modelId: string) {
  return request.del<void>({
    url: `/api/admin/videos/models/${modelId}`
  })
}

export function fetchToggleVideoModelStatus(modelId: string, data: Api.VideoModel.ToggleVideoModelStatusParams) {
  return request.request<void>({
    method: 'PATCH',
    url: `/api/admin/videos/models/${modelId}/status`,
    data
  })
}
