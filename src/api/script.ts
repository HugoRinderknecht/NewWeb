import { getApiAdapter } from './adapter'

// ==================== 团队剧本 ====================

/** 查询团队剧本列表(分页) */
export function fetchGetTeamScripts(
  teamId: string,
  params?: { page?: number; pageSize?: number; [key: string]: any }
) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Script.ScriptListItem>>(
    `/api/teams/${teamId}/scripts`,
    params
  )
}

// ==================== 剧本管理 ====================

/** 查询剧本列表 */
export function fetchGetScriptList(projectId: string, params?: Api.Script.ScriptSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Script.ScriptListItem>>(
    `/api/projects/${projectId}/scripts`,
    params
  )
}

/** 获取剧本详情(含审核状态) */
export function fetchGetScriptDetail(scriptId: string) {
  return getApiAdapter().get<Api.Script.ScriptDetail>(`/api/scripts/${scriptId}`)
}

/** 创建剧本 */
export function fetchCreateScript(projectId: string, params: Api.Script.CreateScriptParams) {
  return getApiAdapter().post<Api.Script.ScriptDetail>(`/api/projects/${projectId}/scripts`, params)
}

/** 更新剧本 */
export function fetchUpdateScript(scriptId: string, params: Api.Script.UpdateScriptParams) {
  return getApiAdapter().put<Api.Script.ScriptDetail>(`/api/scripts/${scriptId}`, params)
}

/** 删除剧本 */
export function fetchDeleteScript(scriptId: string) {
  return getApiAdapter().del<void>(`/api/scripts/${scriptId}`)
}

/** 提交剧本审核 */
export function fetchSubmitScriptReview(scriptId: string) {
  return getApiAdapter().post<void>(`/api/scripts/${scriptId}/submit-review`)
}

/** 撤回剧本审核 */
export function fetchWithdrawScriptReview(scriptId: string) {
  return getApiAdapter().post<void>(`/api/scripts/${scriptId}/withdraw-review`)
}

/** 获取剧本审核状态 */
export function fetchGetScriptReviewStatus(scriptId: string) {
  return getApiAdapter().get<Api.Script.ScriptReviewStatusVO>(
    `/api/scripts/${scriptId}/review-status`
  )
}

/** 获取审核后资产生成进度 */
export function fetchGetPostApprovalStatus(scriptId: string) {
  return getApiAdapter().get<Api.Script.PostApprovalStatus>(
    `/api/scripts/${scriptId}/post-approval-status`
  )
}

// ==================== 剧本拆解(分集) ====================

/** 拆解剧本为分集 */
export function fetchDecomposeScript(projectId: string, scriptId: string, force?: boolean) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.DecomposeResult>>(
    `/api/projects/${projectId}/scripts/${scriptId}/decompose`,
    force !== undefined ? { force } : undefined
  )
}

/** 查询剧本分集列表 */
export function fetchGetScriptEpisodes(projectId: string, scriptId: string) {
  return getApiAdapter().get<Api.Script.Episode[]>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes`
  )
}

/** 查询项目所有分集 */
export function fetchGetProjectEpisodes(projectId: string) {
  return getApiAdapter().get<Api.Script.Episode[]>(`/api/projects/${projectId}/episodes`)
}

/** 查询分集详情 */
export function fetchGetEpisodeDetail(scriptId: string, episodeId: string) {
  return getApiAdapter().get<Api.Script.EpisodeDetail>(
    `/api/scripts/${scriptId}/episodes/${episodeId}`
  )
}

/** 修改分集 */
export function fetchUpdateEpisode(
  scriptId: string,
  episodeId: string,
  params: Api.Script.EpisodeParams
) {
  return getApiAdapter().put<Api.Script.EpisodeDetail>(
    `/api/scripts/${scriptId}/episodes/${episodeId}`,
    params
  )
}

/** 删除分集 */
export function fetchDeleteEpisode(scriptId: string, episodeId: string) {
  return getApiAdapter().del<void>(`/api/scripts/${scriptId}/episodes/${episodeId}`)
}

/** 手动创建分集 */
export function fetchCreateEpisode(projectId: string, params: Api.Script.EpisodeParams) {
  return getApiAdapter().post<Api.Script.EpisodeDetail>(
    `/api/projects/${projectId}/episodes`,
    params
  )
}

// ==================== 内容生成 ====================

/** 生成人物小传 */
export function fetchGenerateCharacterProfiles(
  projectId: string,
  scriptId: string,
  episodeIds?: string[],
  force?: boolean
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.CharacterProfileResult>>(
    `/api/projects/${projectId}/scripts/${scriptId}/character-profiles`,
    { episodeIds, force }
  )
}

/** 获取人物小传结果 */
export function fetchGetCharacterProfiles(scriptId: string) {
  return getApiAdapter().get<Api.Script.CharacterProfileResult>(
    `/api/scripts/${scriptId}/character-profiles`
  )
}

/** 提取资产表 */
export function fetchExtractAssets(
  projectId: string,
  scriptId: string,
  episodeIds?: string[],
  force?: boolean
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.ExtractedAssets>>(
    `/api/projects/${projectId}/scripts/${scriptId}/extract-assets`,
    { episodeIds, force }
  )
}

/** 获取资产提取结果 */
export function fetchGetExtractedAssets(scriptId: string) {
  return getApiAdapter().get<Api.Script.ExtractedAssets>(
    `/api/scripts/${scriptId}/extracted-assets`
  )
}

/** 剧本违规审核 */
export function fetchReviewScriptContent(
  projectId: string,
  scriptId: string,
  episodeIds?: string[],
  force?: boolean
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.ReviewResult>>(
    `/api/projects/${projectId}/scripts/${scriptId}/review-content`,
    { episodeIds, force }
  )
}

/** 生成风格配置 */
export function fetchGenerateStyleConfig(
  projectId: string,
  scriptId: string,
  params: Api.Script.StyleConfigParams
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.StyleConfig>>(
    `/api/projects/${projectId}/scripts/${scriptId}/style-config`,
    params
  )
}

/** 获取风格配置结果 */
export function fetchGetStyleConfig(scriptId: string) {
  return getApiAdapter().get<Api.Script.StyleConfig>(`/api/scripts/${scriptId}/style-config`)
}

/** 参考图风格反推 */
export function fetchRefAnalysis(
  projectId: string,
  scriptId: string,
  params: Api.Script.RefAnalysisParams
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.RefAnalysisResult>>(
    `/api/projects/${projectId}/scripts/${scriptId}/ref-analysis`,
    params
  )
}

/** 获取参考图分析结果 */
export function fetchGetRefAnalysis(scriptId: string) {
  return getApiAdapter().get<Api.Script.RefAnalysisResult>(`/api/scripts/${scriptId}/ref-analysis`)
}

/** 生成音色提示词 */
export function fetchGenerateVoicePrompts(
  projectId: string,
  scriptId: string,
  characterProfileId?: string,
  force?: boolean
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.VoicePromptResult>>(
    `/api/projects/${projectId}/scripts/${scriptId}/voice-prompts`,
    { characterProfileId, force }
  )
}

/** 获取音色提示词结果 */
export function fetchGetVoicePrompts(scriptId: string) {
  return getApiAdapter().get<Api.Script.VoicePromptResult>(`/api/scripts/${scriptId}/voice-prompts`)
}

/** 生成资产提示词 */
export function fetchGenerateAssetPrompts(
  projectId: string,
  scriptId: string,
  params?: Api.ScriptAsset.GenerateAssetPromptsParams
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.AssetPromptsResult>>(
    `/api/projects/${projectId}/scripts/${scriptId}/assets/prompts`,
    params
  )
}

/** 获取资产提示词结果 */
export function fetchGetAssetPrompts(scriptId: string) {
  return getApiAdapter().get<Api.Script.AssetPromptsResult>(
    `/api/scripts/${scriptId}/asset-prompts`
  )
}

/** 生成资产图片 */
export function fetchGenerateAssetImages(
  projectId: string,
  scriptId: string,
  params: Api.ScriptAsset.GenerateAssetImagesParams
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.AssetImageResult>>(
    `/api/projects/${projectId}/scripts/${scriptId}/assets/images/generate`,
    params
  )
}

/** 获取资产图片结果 */
export function fetchGetAssetImages(scriptId: string) {
  return getApiAdapter().get<Api.Script.AssetImageItem[]>(`/api/scripts/${scriptId}/asset-images`)
}

/** 审核资产图片 */
export function fetchReviewAssetImages(
  projectId: string,
  scriptId: string,
  params: Api.ScriptAsset.ReviewAssetImagesParams
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<unknown>>(
    `/api/projects/${projectId}/scripts/${scriptId}/assets/images/review`,
    params
  )
}

/** 生成视频提示词 */
export function fetchGenerateVideoPrompts(
  projectId: string,
  scriptId: string,
  episodeId: string,
  styleConfigId?: string,
  force?: boolean
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.VideoPromptResult>>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/video-prompts`,
    { styleConfigId, force }
  )
}

/** 获取视频提示词结果 */
export function fetchGetVideoPrompts(episodeId: string) {
  return getApiAdapter().get<Api.Script.VideoPromptResult>(
    `/api/episodes/${episodeId}/video-prompts`
  )
}

// ==================== AI处理记录 ====================

/** 查询AI处理状态(按type+businessId，返回最新一条) */
export function fetchGetAiProcessStatus(params: Api.AiProcess.StatusQueryParams) {
  return getApiAdapter().get<Api.AiProcess.AiProcessRecord>('/api/ai-process/status', params)
}

/** 查询AI处理历史列表(最多5条，不含完整resultData) */
export function fetchGetAiProcessHistory(params: Api.AiProcess.StatusQueryParams) {
  return getApiAdapter().get<Api.AiProcess.AiProcessHistoryItem[]>(
    '/api/ai-process/history',
    params
  )
}

/** 查询AI处理历史详情(含完整resultData) */
export function fetchGetAiProcessDetail(recordId: string) {
  return getApiAdapter().get<Api.AiProcess.AiProcessRecord>(`/api/ai-process/history/${recordId}`)
}
