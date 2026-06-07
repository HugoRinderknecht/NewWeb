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

/** ⚠️ hardDelete 参数文档未列出，需与后端确认 */
export function fetchBatchDeleteStoryboards(storyboardIds: string[], hardDelete?: boolean) {
  return getApiAdapter().post<void>('/api/storyboards/batch-delete', {
    storyboardIds,
    hardDelete: hardDelete ?? false
  })
}

export function fetchSubmitStoryboardReview(storyboardId: string, note?: string) {
  return getApiAdapter().post<void>(
    `/api/storyboards/${storyboardId}/submit-review`,
    undefined,
    note !== undefined ? { params: { note } } : undefined
  )
}

export function fetchBatchSubmitStoryboardReview(storyboardIds: string[], note?: string) {
  return getApiAdapter().post<void>('/api/storyboards/batch-submit-review', {
    storyboardIds,
    note
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

export function fetchReorderStoryboards(
  sceneId: string,
  items: Array<{ storyboardId: string; newOrder: number }>
) {
  return getApiAdapter().put<void>(`/api/scenes/${sceneId}/storyboards/reorder`, { items })
}

/** ⚠️ 此端点文档未列出，需与后端确认 */
export function fetchGetSceneList(episodeId: string) {
  return getApiAdapter().get<Api.Storyboard.Scene[]>(`/api/episodes/${episodeId}/scenes`)
}

/** ⚠️ 此端点文档未列出，需与后端确认 */
export function fetchCreateScene(params: Api.Storyboard.CreateSceneParams) {
  return getApiAdapter().post<Api.Storyboard.Scene>('/api/scenes', params)
}

/** ⚠️ 此端点文档未列出，需与后端确认 */
export function fetchDeleteScene(sceneId: string) {
  return getApiAdapter().del<void>(`/api/scenes/${sceneId}`)
}

/** ⚠️ 此端点文档未列出，需与后端确认 */
export function fetchUpdateScene(
  sceneId: string,
  params: Partial<Api.Storyboard.CreateSceneParams>
) {
  return getApiAdapter().put<Api.Storyboard.Scene>(`/api/scenes/${sceneId}`, params)
}

/** ⚠️ 此端点文档未列出，需与后端确认 */
export function fetchDecomposeStoryboard(
  projectId: string,
  scriptId: string,
  episodeId: string,
  styleConfigId?: string
) {
  return getApiAdapter().post<void>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/storyboard/decompose`,
    styleConfigId ? { styleConfigId } : undefined
  )
}

/** ⚠️ 此端点文档未列出，需与后端确认 */
export function fetchRebuildStoryboard(
  projectId: string,
  scriptId: string,
  episodeId: string,
  params: Api.Storyboard.RebuildParams
) {
  return getApiAdapter().post<void>(
    `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/storyboard/rebuild`,
    params
  )
}

/** ⚠️ 此端点文档未列出，需与后端确认 */
export function fetchGetScriptStoryboards(projectId: string, scriptId: string) {
  return getApiAdapter().get<Api.Storyboard.ScriptStoryboards>(
    `/api/projects/${projectId}/scripts/${scriptId}/storyboards`
  )
}

/** 获取项目分镜板列表 */
export function fetchGetStoryboardBoards(projectId: string) {
  return getApiAdapter().get<Api.Storyboard.StoryboardBoard[]>(
    `/api/projects/${projectId}/storyboard-boards`
  )
}
