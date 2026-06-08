import { getApiAdapter } from './adapter'

// 已删除文档未定义的端点: fetchGetTeamScripts (文档无 /api/teams/{teamId}/scripts 端点)

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

/** 提交剧本审核（文档：note 为 query 参数） */
export function fetchSubmitScriptReview(scriptId: string, note?: string) {
  return getApiAdapter().post<void>(
    `/api/scripts/${scriptId}/submit-review`,
    undefined,
    note ? { params: { note } } : undefined
  )
}

/** 撤回剧本审核（文档：reason 为 query 参数） */
export function fetchWithdrawScriptReview(scriptId: string, reason?: string) {
  return getApiAdapter().post<void>(
    `/api/scripts/${scriptId}/withdraw-review`,
    undefined,
    reason ? { params: { reason } } : undefined
  )
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

/** 查询项目所有分集 — 辅助请求，关闭全局弹错 */
export function fetchGetProjectEpisodes(projectId: string) {
  return getApiAdapter().get<Api.Script.Episode[]>(
    `/api/projects/${projectId}/episodes`,
    undefined,
    {
      showErrorMessage: false
    }
  )
}

/** 查询分集详情 — 次级请求，关闭全局弹错 */
export function fetchGetEpisodeDetail(projectId: string, scriptId: string, episodeId: string) {
  return getApiAdapter().get<Api.Script.EpisodeDetail>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}`,
    undefined,
    { showErrorMessage: false }
  )
}

/** 修改分集 */
export function fetchUpdateEpisode(
  projectId: string,
  scriptId: string,
  episodeId: string,
  params: Api.Script.EpisodeParams
) {
  return getApiAdapter().put<Api.Script.EpisodeDetail>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}`,
    params
  )
}

/** 删除分集 */
export function fetchDeleteEpisode(projectId: string, scriptId: string, episodeId: string) {
  return getApiAdapter().del<void>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}`
  )
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
  return getApiAdapter().get<Api.Script.CharacterProfileResult | null>(
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
export function fetchGetExtractedAssets(projectId: string, scriptId: string) {
  return getApiAdapter().get<Api.Script.ExtractedAssets>(
    `/api/projects/${projectId}/scripts/${scriptId}/extracted-assets`
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

/** 获取风格配置结果（文档：GET 不含 projects 前缀） */
export function fetchGetStyleConfig(scriptId: string) {
  return getApiAdapter().get<Api.Script.StyleConfig>(`/api/scripts/${scriptId}/style-config`)
}

/**
 * 项目级：参考图风格反推（触发分析）
 * 文档：POST /api/projects/{projectId}/ref-analysis
 */
export function fetchRefAnalysis(projectId: string, params: Api.Script.RefAnalysisParams) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.RefAnalysisResult>>(
    `/api/projects/${projectId}/ref-analysis`,
    params
  )
}

/**
 * 项目级：查询项目参考图分析结果
 * 文档：GET /api/projects/{projectId}/ref-analysis
 */
export function fetchGetProjectRefAnalysis(projectId: string) {
  return getApiAdapter().get<Api.Script.RefAnalysisResult>(
    `/api/projects/${projectId}/ref-analysis`
  )
}

/**
 * 剧本级：查询剧本参考图分析结果
 * 文档：GET /api/scripts/{scriptId}/ref-analysis
 */
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

/** 获取音色提示词结果（文档：GET 不含 projects 前缀） */
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

/** 获取资产提示词结果（文档：GET 不含 projects 前缀） */
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

/** 获取资产图片结果（文档：GET 不含 projects 前缀） */
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

/** 获取视频提示词结果（文档：路径仅含 episodeId，与 projectId 无关） */
export function fetchGetVideoPrompts(episodeId: string) {
  return getApiAdapter().get<Api.Script.VideoPromptResult>(
    `/api/episodes/${episodeId}/video-prompts`
  )
}

// ==================== 文档补全：导出 / 推送美术 / 分集父子关系 ====================

/**
 * 导出剧集（文档 §4.1.20）
 * GET /api/projects/{projectId}/episodes/export?episodeIds={ids}&format={csv|xlsx}
 */
export function fetchExportEpisodes(
  projectId: string,
  params: { episodeIds?: string[]; format?: 'csv' | 'xlsx' }
) {
  return getApiAdapter().get<Blob>(`/api/projects/${projectId}/episodes/export`, params, {
    responseType: 'blob'
  })
}

/**
 * 导出资产数据（文档 §4.1.21）
 * GET /api/scripts/{scriptId}/extracted-assets/export?format={csv|xlsx}
 */
export function fetchExportExtractedAssets(scriptId: string, params?: { format?: 'csv' | 'xlsx' }) {
  return getApiAdapter().get<Blob>(`/api/scripts/${scriptId}/extracted-assets/export`, params, {
    responseType: 'blob'
  })
}

/**
 * 推送到美术团队（文档 §4.1.22）
 * POST /api/projects/{projectId}/scripts/{scriptId}/push-to-art
 */
export function fetchPushToArt(
  projectId: string,
  scriptId: string,
  params?: Api.Script.PushToArtParams
) {
  return getApiAdapter().post<{ success: boolean; notifiedCount: number }>(
    `/api/projects/${projectId}/scripts/${scriptId}/push-to-art`,
    params
  )
}

/**
 * 设置分集父子关系（文档 §4.2.8）
 * PATCH /api/projects/{projectId}/episodes/{episodeId}/child-of?childOf={childOf}
 */
export function fetchSetEpisodeChildOf(projectId: string, episodeId: string, childOf?: string) {
  return getApiAdapter().patch<Api.Script.EpisodeDetail>(
    `/api/projects/${projectId}/episodes/${episodeId}/child-of`,
    undefined,
    { params: childOf !== undefined ? { childOf } : undefined }
  )
}

// ==================== §4.6 全量描述（FullDesc） ====================

/** 生成角色全量描述（文档 §4.6：POST .../character-full-descriptions） */
export function fetchGenerateCharacterFullDescriptions(
  projectId: string,
  scriptId: string,
  params?: { episodeIds?: string[]; force?: boolean }
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.CharFullDescResultVO>>(
    `/api/projects/${projectId}/scripts/${scriptId}/character-full-descriptions`,
    params
  )
}

/** 生成场景全量描述（文档 §4.6：POST .../scene-full-descriptions） */
export function fetchGenerateSceneFullDescriptions(
  projectId: string,
  scriptId: string,
  params?: { episodeIds?: string[]; force?: boolean }
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.SceneFullDescResultVO>>(
    `/api/projects/${projectId}/scripts/${scriptId}/scene-full-descriptions`,
    params
  )
}

/** 生成道具全量描述（文档 §4.6：POST .../prop-full-descriptions） */
export function fetchGeneratePropFullDescriptions(
  projectId: string,
  scriptId: string,
  params?: { episodeIds?: string[]; force?: boolean }
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Script.PropFullDescResultVO>>(
    `/api/projects/${projectId}/scripts/${scriptId}/prop-full-descriptions`,
    params
  )
}

/** 获取场景全量描述列表（文档 §4.6：GET .../scene-full-descriptions） */
export function fetchGetSceneFullDescriptions(projectId: string, scriptId: string) {
  return getApiAdapter().get<Api.Script.SceneFullDescriptionVO[]>(
    `/api/projects/${projectId}/scripts/${scriptId}/scene-full-descriptions`
  )
}

/** 获取道具全量描述列表（文档 §4.6：GET .../prop-full-descriptions） */
export function fetchGetPropFullDescriptions(projectId: string, scriptId: string) {
  return getApiAdapter().get<Api.Script.PropFullDescriptionVO[]>(
    `/api/projects/${projectId}/scripts/${scriptId}/prop-full-descriptions`
  )
}
