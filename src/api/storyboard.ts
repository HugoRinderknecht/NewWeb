import { getApiAdapter } from './adapter'

export function fetchGetStoryboardList(
  projectId: string,
  params?: Api.Storyboard.StoryboardSearchParams
) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Storyboard.StoryboardListItem>>(
    `/api/projects/${projectId}/storyboards`,
    params
  )
}

export function fetchGetStoryboardDetail(storyboardId: string) {
  return getApiAdapter().get<Api.Storyboard.StoryboardDetail>(`/api/storyboards/${storyboardId}`)
}

export function fetchCreateStoryboard(
  projectId: string,
  params: Api.Storyboard.CreateStoryboardParams
) {
  return getApiAdapter().post<Api.Storyboard.StoryboardDetail>(
    `/api/projects/${projectId}/storyboards`,
    params
  )
}

export function fetchUpdateStoryboard(
  storyboardId: string,
  params: Api.Storyboard.UpdateStoryboardParams
) {
  return getApiAdapter().put<Api.Storyboard.StoryboardDetail>(
    `/api/storyboards/${storyboardId}`,
    params
  )
}

export function fetchDeleteStoryboard(storyboardId: string) {
  return getApiAdapter().del<void>(`/api/storyboards/${storyboardId}`)
}

/** 批量删除分镜（文档 §5.1：请求体为 StoryboardBatchOperationRequest，仅含 storyboardIds） */
export function fetchBatchDeleteStoryboards(storyboardIds: string[]) {
  return getApiAdapter().post<void>('/api/storyboards/batch-delete', {
    storyboardIds
  })
}

export function fetchSubmitStoryboardReview(storyboardId: string, note?: string) {
  return getApiAdapter().post<void>(
    `/api/storyboards/${storyboardId}/submit-review`,
    undefined,
    note !== undefined ? { params: { note } } : undefined
  )
}

/** 批量提交分镜审核（文档 §5.1：请求体为 StoryboardBatchOperationRequest，仅含 storyboardIds） */
export function fetchBatchSubmitStoryboardReview(storyboardIds: string[]) {
  return getApiAdapter().post<void>('/api/storyboards/batch-submit-review', {
    storyboardIds
  })
}

export function fetchWithdrawStoryboardReview(storyboardId: string, reason?: string) {
  return getApiAdapter().post<void>(
    `/api/storyboards/${storyboardId}/withdraw-review`,
    undefined,
    reason !== undefined ? { params: { reason } } : undefined
  )
}

export function fetchGetStoryboardReviewStatus(storyboardId: string) {
  return getApiAdapter().get<Api.Storyboard.ReviewStatusVO>(
    `/api/storyboards/${storyboardId}/review-status`
  )
}

export function fetchAddStoryboardImage(
  storyboardId: string,
  params: { imageUrl: string; imageType?: 'main' | 'reference' | 'thumbnail' }
) {
  return getApiAdapter().post<Api.Storyboard.StoryboardImage>(
    `/api/storyboards/${storyboardId}/images`,
    null,
    { params: { imageUrl: params.imageUrl, imageType: params.imageType || 'main' } }
  )
}

export function fetchDeleteStoryboardImage(imageId: string) {
  return getApiAdapter().del<void>(`/api/storyboards/images/${imageId}`)
}

export function fetchGetStoryboardImages(storyboardId: string) {
  return getApiAdapter().get<Api.Storyboard.StoryboardImage[]>(
    `/api/storyboards/${storyboardId}/images`
  )
}

export function fetchGetStoryboardAssets(storyboardId: string) {
  return getApiAdapter().get<Api.Storyboard.StoryboardAsset[]>(
    `/api/storyboards/${storyboardId}/assets`
  )
}

export function fetchLinkAssetToStoryboard(
  storyboardId: string,
  assetId: string,
  assetType: string
) {
  return getApiAdapter().post<void>(`/api/storyboards/${storyboardId}/assets`, undefined, {
    params: { assetId, assetType }
  })
}

export function fetchUnlinkAssetFromStoryboard(storyboardId: string, assetId: string) {
  return getApiAdapter().del<void>(`/api/storyboards/${storyboardId}/assets/${assetId}`)
}

export function fetchGetStoryboardVersions(storyboardId: string) {
  return getApiAdapter().get<Api.Storyboard.StoryboardVersion[]>(
    `/api/storyboards/${storyboardId}/versions`
  )
}

export function fetchRollbackStoryboardVersion(storyboardId: string, versionId: string) {
  return getApiAdapter().post<void>(
    `/api/storyboards/${storyboardId}/versions/${versionId}/rollback`
  )
}

/** 分镜排序（文档 §5.1：PUT /api/scenes/{sceneId}/storyboards/reorder，请求体 StoryboardReorderRequest） */
export function fetchReorderStoryboards(
  sceneId: string,
  items: Array<{ storyboardId: string; storyboardNo: number }>
) {
  return getApiAdapter().put<void>(`/api/scenes/${sceneId}/storyboards/reorder`, { items })
}

/** 获取镜头列表（文档 §5.2：GET /api/episodes/{episodeId}/scenes） */
export function fetchGetSceneList(episodeId: string) {
  return getApiAdapter().get<Api.Storyboard.Scene[]>(`/api/episodes/${episodeId}/scenes`)
}

/** 创建镜头（文档 §5.2：POST /api/scenes） */
export function fetchCreateScene(params: Api.Storyboard.CreateSceneParams) {
  return getApiAdapter().post<Api.Storyboard.Scene>('/api/scenes', params)
}

// 已删除文档未定义的端点: fetchDeleteScene (文档 §5.2 仅定义 GET 和 POST)
// 已删除文档未定义的端点: fetchUpdateScene (文档 §5.2 仅定义 GET 和 POST)

/** 分镜拆解（文档 §4.9：POST .../storyboard/decompose，请求体 StoryboardDecomposeRequest） */
export function fetchDecomposeStoryboard(
  projectId: string,
  scriptId: string,
  episodeId: string,
  params?: Api.Storyboard.StoryboardDecomposeRequest
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Storyboard.StoryboardDecomposeResultVO>>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/storyboard/decompose`,
    params
  )
}

/** 分镜重建（文档 §4.9：POST .../storyboard/rebuild，请求体 StoryboardRebuildRequest） */
export function fetchRebuildStoryboard(
  projectId: string,
  scriptId: string,
  episodeId: string,
  params: Api.Storyboard.StoryboardRebuildRequest
) {
  return getApiAdapter().post<Api.Script.AiProcessResult<Api.Storyboard.StoryboardRebuildResultVO>>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/storyboard/rebuild`,
    params
  )
}

/** 获取剧本分镜列表（文档 §4.9：GET .../storyboards，返回 List<ScriptStoryboardVO>） */
export function fetchGetScriptStoryboards(projectId: string, scriptId: string) {
  return getApiAdapter().get<Api.Storyboard.ScriptStoryboardVO[]>(
    `/api/projects/${projectId}/scripts/${scriptId}/storyboards`
  )
}

/** 获取项目分镜板列表 */
export function fetchGetStoryboardBoards(projectId: string) {
  return getApiAdapter().get<Api.Storyboard.StoryboardBoard[]>(
    `/api/projects/${projectId}/storyboard-boards`
  )
}
