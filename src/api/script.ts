import request from '@/utils/http'

/**
 * 获取剧本列表
 * @param projectId 项目ID
 * @param params 查询参数
 */
export function fetchGetScriptList(projectId: string, params?: Api.Script.ScriptSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Script.ScriptListItem>>({
    url: `/api/projects/${projectId}/scripts`,
    params
  })
}

/**
 * 获取剧本详情（含审核状态）
 * @param scriptId 剧本ID
 */
export function fetchGetScriptDetail(scriptId: string) {
  return request.get<Api.Script.ScriptDetail>({
    url: `/api/scripts/${scriptId}`
  })
}

/**
 * 创建剧本
 * @param projectId 项目ID
 * @param params 创建参数
 */
export function fetchCreateScript(projectId: string, params: Api.Script.CreateScriptParams) {
  return request.post<Api.Script.ScriptDetail>({
    url: `/api/projects/${projectId}/scripts`,
    params
  })
}

/**
 * 更新剧本
 * @param scriptId 剧本ID
 * @param params 更新参数
 */
export function fetchUpdateScript(scriptId: string, params: Api.Script.UpdateScriptParams) {
  return request.put<Api.Script.ScriptDetail>({
    url: `/api/scripts/${scriptId}`,
    params
  })
}

/**
 * 删除剧本
 * @param scriptId 剧本ID
 */
export function fetchDeleteScript(scriptId: string) {
  return request.del<void>({
    url: `/api/scripts/${scriptId}`
  })
}

/**
 * 提交剧本审核
 * @param scriptId 剧本ID
 */
export function fetchSubmitScriptReview(scriptId: string) {
  return request.post<void>({
    url: `/api/scripts/${scriptId}/submit-review`
  })
}

/**
 * 撤回剧本审核
 * @param scriptId 剧本ID
 */
export function fetchWithdrawScriptReview(scriptId: string) {
  return request.post<void>({
    url: `/api/scripts/${scriptId}/withdraw-review`
  })
}

/**
 * 获取剧本审核状态
 * @param scriptId 剧本ID
 */
export function fetchGetScriptReviewStatus(scriptId: string) {
  return request.get<Api.Script.ReviewStatusVO>({
    url: `/api/scripts/${scriptId}/review-status`
  })
}

/**
 * 拆解剧本为分集
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param force 是否强制重处理
 */
export function fetchDecomposeScript(projectId: string, scriptId: string, force?: boolean) {
  return request.post<Api.Script.DecomposeResult>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/decompose`,
    params: force !== undefined ? { force } : undefined
  })
}

/**
 * 查询剧本分集列表
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 */
export function fetchGetScriptEpisodes(projectId: string, scriptId: string) {
  return request.get<Api.Script.Episode[]>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/episodes`
  })
}

/**
 * 查询项目所有分集
 * @param projectId 项目ID
 */
export function fetchGetProjectEpisodes(projectId: string) {
  return request.get<Api.Script.Episode[]>({
    url: `/api/projects/${projectId}/episodes`
  })
}

/**
 * 查询分集详情
 * @param scriptId 剧本ID
 * @param episodeId 分集ID
 */
export function fetchGetEpisodeDetail(scriptId: string, episodeId: string) {
  return request.get<Api.Script.EpisodeDetail>({
    url: `/api/scripts/${scriptId}/episodes/${episodeId}`
  })
}

/**
 * 修改分集
 * @param scriptId 剧本ID
 * @param episodeId 分集ID
 * @param params 更新参数
 */
export function fetchUpdateEpisode(scriptId: string, episodeId: string, params: Api.Script.UpdateEpisodeParams) {
  return request.put<Api.Script.EpisodeDetail>({
    url: `/api/scripts/${scriptId}/episodes/${episodeId}`,
    params
  })
}

/**
 * 删除分集
 * @param scriptId 剧本ID
 * @param episodeId 分集ID
 */
export function fetchDeleteEpisode(scriptId: string, episodeId: string) {
  return request.del<void>({
    url: `/api/scripts/${scriptId}/episodes/${episodeId}`
  })
}

/**
 * 手动创建分集
 * @param projectId 项目ID
 * @param params 分集参数
 */
export function fetchCreateEpisode(projectId: string, params: Api.Script.CreateEpisodeParams) {
  return request.post<Api.Script.EpisodeDetail>({
    url: `/api/projects/${projectId}/episodes`,
    params
  })
}

/**
 * 生成人物小传
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param episodeIds 分集ID列表（可选）
 * @param force 是否强制重处理
 */
export function fetchGenerateCharacterProfiles(
  projectId: string,
  scriptId: string,
  episodeIds?: string[],
  force?: boolean
) {
  return request.post<void>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/character-profiles`,
    params: { episodeIds, force }
  })
}

/**
 * 获取人物小传结果
 * @param scriptId 剧本ID
 */
export function fetchGetCharacterProfiles(scriptId: string) {
  return request.get<Api.Script.CharacterProfile[]>({
    url: `/api/scripts/${scriptId}/character-profiles`
  })
}

/**
 * 提取资产表
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param episodeIds 分集ID列表（可选）
 * @param force 是否强制重处理
 */
export function fetchExtractAssets(projectId: string, scriptId: string, episodeIds?: string[], force?: boolean) {
  return request.post<void>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/extract-assets`,
    params: { episodeIds, force }
  })
}

/**
 * 获取资产提取结果
 * @param scriptId 剧本ID
 */
export function fetchGetExtractedAssets(scriptId: string) {
  return request.get<Api.Script.ExtractedAssets>({
    url: `/api/scripts/${scriptId}/extracted-assets`
  })
}

/**
 * 生成风格配置
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param params 风格参数
 */
export function fetchGenerateStyleConfig(projectId: string, scriptId: string, params?: Api.Script.StyleConfigParams) {
  return request.post<void>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/style-config`,
    params
  })
}

/**
 * 获取风格配置结果
 * @param scriptId 剧本ID
 */
export function fetchGetStyleConfig(scriptId: string) {
  return request.get<Api.Script.StyleConfig>({
    url: `/api/scripts/${scriptId}/style-config`
  })
}

/**
 * 参考图风格反推
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param params 参考图参数
 */
export function fetchRefAnalysis(projectId: string, scriptId: string, params: Api.Script.RefAnalysisParams) {
  return request.post<void>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/ref-analysis`,
    params
  })
}

/**
 * 获取参考图分析结果
 * @param scriptId 剧本ID
 */
export function fetchGetRefAnalysis(scriptId: string) {
  return request.get<Api.Script.RefAnalysisResult>({
    url: `/api/scripts/${scriptId}/ref-analysis`
  })
}

/**
 * 剧本违规审核
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param episodeIds 分集ID列表（可选）
 * @param force 是否强制重处理
 */
export function fetchReviewScriptContent(projectId: string, scriptId: string, episodeIds?: string[], force?: boolean) {
  return request.post<Api.Script.ReviewResult>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/review-content`,
    params: { episodeIds, force }
  })
}

/**
 * 生成音色提示词
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 */
export function fetchGenerateVoicePrompts(projectId: string, scriptId: string) {
  return request.post<void>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/voice-prompts`
  })
}

/**
 * 获取音色提示词结果
 * @param scriptId 剧本ID
 */
export function fetchGetVoicePrompts(scriptId: string) {
  return request.get<Api.Script.VoicePromptResult>({
    url: `/api/scripts/${scriptId}/voice-prompts`
  })
}

/**
 * 获取资产生成进度
 * @param scriptId 剧本ID
 */
export function fetchGetPostApprovalStatus(scriptId: string) {
  return request.get<Api.Script.PostApprovalStatus>({
    url: `/api/scripts/${scriptId}/post-approval-status`
  })
}

/**
 * 获取资产提示词结果
 * @param scriptId 剧本ID
 */
export function fetchGetAssetPrompts(scriptId: string) {
  return request.get<Api.Script.AssetPromptsResult>({
    url: `/api/scripts/${scriptId}/asset-prompts`
  })
}

/**
 * 获取资产图片结果
 * @param scriptId 剧本ID
 */
export function fetchGetAssetImages(scriptId: string) {
  return request.get<Api.Script.AssetImageItem[]>({
    url: `/api/scripts/${scriptId}/asset-images`
  })
}

/**
 * 获取视频提示词结果
 * @param episodeId 分集ID
 */
export function fetchGetVideoPrompts(episodeId: string) {
  return request.get<Api.Script.VideoPromptResult>({
    url: `/api/episodes/${episodeId}/video-prompts`
  })
}
