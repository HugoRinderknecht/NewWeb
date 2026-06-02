import request from '@/utils/http'

/**
 * 提交图片生成任务
 * @param params 生成参数
 */
export function fetchSubmitImageGeneration(params: Api.Image.ImageGenerateParams) {
  return request.post<Api.Image.ImageTask>({
    url: '/api/gpt-image/generations',
    params
  })
}

/**
 * 查询任务状态
 * @param taskId 任务ID
 */
export function fetchGetImageTaskStatus(taskId: string) {
  return request.get<Api.Image.ImageTask>({
    url: `/api/gpt-image/tasks/${taskId}`
  })
}

/**
 * 查询图片审核状态
 * @param taskId 任务ID
 */
export function fetchGetImageReviewStatus(taskId: string) {
  return request.get<Api.Image.ImageReviewStatus>({
    url: `/api/gpt-image/tasks/${taskId}/review-status`
  })
}

/**
 * 获取任务结果
 * @param taskId 任务ID
 */
export function fetchGetImageTaskResult(taskId: string) {
  return request.get<Api.Image.ImageTaskResult>({
    url: `/api/gpt-image/tasks/${taskId}/result`
  })
}

/**
 * 获取模型列表
 */
export function fetchGetImageModels() {
  return request.get<Api.Image.ImageModel[]>({
    url: '/api/gpt-image/models'
  })
}

/**
 * 获取模型详情
 * @param modelCode 模型编码
 */
export function fetchGetImageModelDetail(modelCode: string) {
  return request.get<Api.Image.ImageModel>({
    url: `/api/gpt-image/models/${modelCode}`
  })
}
