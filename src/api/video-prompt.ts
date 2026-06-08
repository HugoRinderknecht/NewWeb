import { getApiAdapter } from './adapter'

/** 生成视频提示词 */
export function generateVideoPrompts(
  projectId: string,
  scriptId: string,
  episodeId: string,
  data: { styleConfigId?: string; force?: boolean }
) {
  return getApiAdapter().post<Api.Script.VideoPromptResult>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/video-prompts`,
    data
  )
}

/** 检查视频提示词违规 */
export function checkVideoPromptViolations(
  projectId: string,
  scriptId: string,
  episodeId: string,
  data: { videoPromptId: string; force?: boolean }
) {
  return getApiAdapter().post<Api.Video.ViolationCheckResult>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/video-prompts/violation-check`,
    data
  )
}

/** 修复视频提示词 */
export function fixVideoPrompts(
  projectId: string,
  scriptId: string,
  episodeId: string,
  data: { videoPromptId: string; modifyInstructions: string; force?: boolean }
) {
  return getApiAdapter().post<Api.Video.FixPromptResult>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/video-prompts/fix`,
    data
  )
}

/** 更新视频提示词（文档 §4.10.4：PUT .../video-prompts/{promptId}） */
export function updateVideoPrompt(
  projectId: string,
  scriptId: string,
  episodeId: string,
  promptId: string,
  data: Api.Video.VideoPromptUpdateRequest
) {
  return getApiAdapter().put<void>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/video-prompts/${promptId}`,
    data
  )
}
