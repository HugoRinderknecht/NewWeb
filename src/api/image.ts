import { getApiAdapter } from './adapter'

export function fetchSubmitImageGeneration(params: Api.Image.ImageGenerateParams) {
  return getApiAdapter().post<Api.Image.ImageTask>('/api/gpt-image/generations', params)
}

export function fetchGetImageTaskStatus(taskId: string) {
  return getApiAdapter().get<Api.Image.ImageTask>(`/api/gpt-image/tasks/${taskId}`)
}

export function fetchGetImageReviewStatus(taskId: string) {
  return getApiAdapter().get<Api.Image.ImageReviewStatus>(
    `/api/gpt-image/tasks/${taskId}/review-status`
  )
}

export function fetchGetImageTaskResult(taskId: string) {
  return getApiAdapter().get<Api.Image.ImageTaskResult>(`/api/gpt-image/tasks/${taskId}/result`)
}

export function fetchGetImageModels() {
  return getApiAdapter().get<Api.Image.ImageModel[]>('/api/gpt-image/models')
}

export function fetchGetImageModelDetail(modelCode: string) {
  return getApiAdapter().get<Api.Image.ImageModel>(`/api/gpt-image/models/${modelCode}`)
}
