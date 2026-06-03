import { getApiAdapter } from './adapter'

// ==================== 分集管理 ====================

/** 查询分集详情 */
export function getEpisodeDetail(scriptId: string, episodeId: string) {
  return getApiAdapter().get<Api.Script.EpisodeDetail>(
    `/api/scripts/${scriptId}/episodes/${episodeId}`
  )
}

/** 修改分集 */
export function updateEpisode(scriptId: string, episodeId: string, data: Api.Script.EpisodeParams) {
  return getApiAdapter().put<Api.Script.EpisodeDetail>(
    `/api/scripts/${scriptId}/episodes/${episodeId}`,
    data
  )
}

/** 删除分集 */
export function deleteEpisode(scriptId: string, episodeId: string) {
  return getApiAdapter().del<void>(`/api/scripts/${scriptId}/episodes/${episodeId}`)
}

/** 拆解剧本为分集 */
export function decomposeScript(projectId: string, scriptId: string, data?: { force?: boolean }) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.DecomposeResult>>(
    `/api/projects/${projectId}/scripts/${scriptId}/decompose`,
    data
  )
}

/** 查询项目所有分集 */
export function getProjectEpisodes(projectId: string) {
  return getApiAdapter().get<Api.Script.Episode[]>(`/api/projects/${projectId}/episodes`)
}

/** 手动创建分集 */
export function createEpisode(projectId: string, data: Api.Script.EpisodeParams) {
  return getApiAdapter().post<Api.Script.EpisodeDetail>(`/api/projects/${projectId}/episodes`, data)
}

/** 查询剧本分集列表 */
export function getScriptEpisodes(projectId: string, scriptId: string) {
  return getApiAdapter().get<Api.Script.Episode[]>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes`
  )
}

/** 获取分集视频提示词 */
export function getEpisodeVideoPrompts(episodeId: string) {
  return getApiAdapter().get<Api.Script.VideoPromptResult>(
    `/api/episodes/${episodeId}/video-prompts`
  )
}
