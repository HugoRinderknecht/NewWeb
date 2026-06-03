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

export function fetchBatchDeleteStoryboards(storyboardIds: string[], hardDelete?: boolean) {
  return getApiAdapter().post<void>('/api/storyboards/batch-delete', {
    storyboardIds,
    hardDelete: hardDelete ?? false
  })
}

export function fetchSubmitStoryboardReview(storyboardId: string) {
  return getApiAdapter().post<void>(`/api/storyboards/${storyboardId}/submit-review`)
}

export function fetchBatchSubmitStoryboardReview(storyboardIds: string[], note?: string) {
  return getApiAdapter().post<void>('/api/storyboards/batch-submit-review', {
    storyboardIds,
    note
  })
}

export function fetchWithdrawStoryboardReview(storyboardId: string) {
  return getApiAdapter().post<void>(`/api/storyboards/${storyboardId}/withdraw-review`)
}

export function fetchGetStoryboardReviewStatus(storyboardId: string) {
  return getApiAdapter().get<Api.Storyboard.ReviewStatusVO>(
    `/api/storyboards/${storyboardId}/review-status`
  )
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

export function fetchGetStoryboardImages(storyboardId: string) {
  return getApiAdapter().get<Api.Storyboard.StoryboardImage[]>(
    `/api/storyboards/${storyboardId}/images`
  )
}

export function fetchAddStoryboardImage(
  storyboardId: string,
  params: Api.Storyboard.AddImageParams
) {
  return getApiAdapter().post<Api.Storyboard.StoryboardImage>(
    `/api/storyboards/${storyboardId}/images`,
    params
  )
}

export function fetchDeleteStoryboardImage(imageId: string) {
  return getApiAdapter().del<void>(`/api/storyboards/images/${imageId}`)
}

export function fetchGetStoryboardAssets(storyboardId: string) {
  return getApiAdapter().get<Api.Storyboard.StoryboardAsset[]>(
    `/api/storyboards/${storyboardId}/assets`
  )
}

export function fetchLinkAssetToStoryboard(storyboardId: string, assetId: string) {
  return getApiAdapter().post<void>(`/api/storyboards/${storyboardId}/assets`, { assetId })
}

export function fetchUnlinkAssetFromStoryboard(storyboardId: string, assetId: string) {
  return getApiAdapter().del<void>(`/api/storyboards/${storyboardId}/assets/${assetId}`)
}

export function fetchReorderStoryboards(
  sceneId: string,
  items: Array<{ storyboardId: string; newOrder: number }>
) {
  return getApiAdapter().put<void>(`/api/scenes/${sceneId}/storyboards/reorder`, { items })
}

export function fetchGetSceneList(episodeId: string) {
  return getApiAdapter().get<Api.Storyboard.Scene[]>(`/api/episodes/${episodeId}/scenes`)
}

export function fetchCreateScene(params: Api.Storyboard.CreateSceneParams) {
  return getApiAdapter().post<Api.Storyboard.Scene>('/api/scenes', params)
}

export function fetchDeleteScene(sceneId: string) {
  return getApiAdapter().del<void>(`/api/scenes/${sceneId}`)
}

export function fetchUpdateScene(
  sceneId: string,
  params: Partial<Api.Storyboard.CreateSceneParams>
) {
  return getApiAdapter().put<Api.Storyboard.Scene>(`/api/scenes/${sceneId}`, params)
}

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

export function fetchGetScriptStoryboards(projectId: string, scriptId: string) {
  return getApiAdapter().get<Api.Storyboard.ScriptStoryboards>(
    `/api/projects/${projectId}/scripts/${scriptId}/storyboards`
  )
}
