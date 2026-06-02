import request from '@/utils/http'

/**
 * 提交视频生成任务
 * @param params 生成参数
 */
export function fetchSubmitVideoGeneration(params: Api.Video.VideoGenerateParams) {
  return request.post<Api.Video.VideoTask>({
    url: '/api/seedance/generations',
    params
  })
}

/**
 * 预览视频生成参数
 * @param params 预览参数
 */
export function fetchPreviewVideoGeneration(params: Api.Video.VideoPreviewParams) {
  return request.post<Api.Video.VideoPreviewResult>({
    url: '/api/seedance/generations/preview',
    params
  })
}

/**
 * 查询任务列表
 * @param params 查询参数
 */
export function fetchGetVideoTaskList(params?: Api.Video.VideoTaskSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Video.VideoTask>>({
    url: '/api/seedance/tasks',
    params
  })
}

/**
 * 查询任务详情
 * @param taskId 任务ID
 */
export function fetchGetVideoTaskDetail(taskId: string) {
  return request.get<Api.Video.VideoTask>({
    url: `/api/seedance/tasks/${taskId}`
  })
}

/**
 * 获取任务结果
 * @param taskId 任务ID
 */
export function fetchGetVideoTaskResult(taskId: string) {
  return request.get<Api.Video.VideoTaskResult>({
    url: `/api/seedance/tasks/${taskId}/result`
  })
}

/**
 * 取消任务
 * @param taskId 任务ID
 */
export function fetchCancelVideoTask(taskId: string) {
  return request.post<void>({
    url: `/api/seedance/tasks/${taskId}/cancel`
  })
}

/**
 * 生成视频提示词
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param episodeId 分集ID
 */
export function fetchGenerateVideoPrompts(projectId: string, scriptId: string, episodeId: string) {
  return request.post<void>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/video-prompts`
  })
}

/**
 * 视频提示词违规检测
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param episodeId 分集ID
 */
export function fetchCheckVideoPromptViolation(projectId: string, scriptId: string, episodeId: string) {
  return request.post<Api.Video.ViolationCheckResult>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/video-prompts/violation-check`
  })
}

/**
 * 视频提示词修改
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param episodeId 分集ID
 * @param params 修改参数
 */
export function fetchFixVideoPrompt(
  projectId: string,
  scriptId: string,
  episodeId: string,
  params: Api.Video.FixPromptParams
) {
  return request.post<Api.Video.FixPromptResult>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/video-prompts/fix`,
    params
  })
}
