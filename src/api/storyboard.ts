import request from '@/utils/http'

/**
 * 查询分镜列表
 * @param projectId 项目ID
 * @param params 查询参数
 */
export function fetchGetStoryboardList(projectId: string, params?: Api.Storyboard.StoryboardSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Storyboard.StoryboardListItem>>({
    url: `/api/projects/${projectId}/storyboards`,
    params
  })
}

/**
 * 获取分镜详情
 * @param storyboardId 分镜ID
 */
export function fetchGetStoryboardDetail(storyboardId: string) {
  return request.get<Api.Storyboard.StoryboardDetail>({
    url: `/api/storyboards/${storyboardId}`
  })
}

/**
 * 创建分镜
 * @param projectId 项目ID
 * @param params 创建参数
 */
export function fetchCreateStoryboard(projectId: string, params: Api.Storyboard.CreateStoryboardParams) {
  return request.post<Api.Storyboard.StoryboardDetail>({
    url: `/api/projects/${projectId}/storyboards`,
    params
  })
}

/**
 * 更新分镜
 * @param storyboardId 分镜ID
 * @param params 更新参数
 */
export function fetchUpdateStoryboard(storyboardId: string, params: Api.Storyboard.UpdateStoryboardParams) {
  return request.put<Api.Storyboard.StoryboardDetail>({
    url: `/api/storyboards/${storyboardId}`,
    params
  })
}

/**
 * 删除分镜
 * @param storyboardId 分镜ID
 */
export function fetchDeleteStoryboard(storyboardId: string) {
  return request.del<void>({
    url: `/api/storyboards/${storyboardId}`
  })
}

/**
 * 批量删除分镜
 * @param storyboardIds 分镜ID列表
 */
export function fetchBatchDeleteStoryboards(storyboardIds: string[]) {
  return request.del<void>({
    url: '/api/storyboards/batch-delete',
    data: { storyboardIds }
  })
}

/**
 * 提交分镜审核
 * @param storyboardId 分镜ID
 */
export function fetchSubmitStoryboardReview(storyboardId: string) {
  return request.post<void>({
    url: `/api/storyboards/${storyboardId}/submit-review`
  })
}

/**
 * 批量提交分镜审核
 * @param storyboardIds 分镜ID列表
 */
export function fetchBatchSubmitStoryboardReview(storyboardIds: string[]) {
  return request.post<void>({
    url: '/api/storyboards/batch-submit-review',
    params: { storyboardIds }
  })
}

/**
 * 撤回分镜审核
 * @param storyboardId 分镜ID
 */
export function fetchWithdrawStoryboardReview(storyboardId: string) {
  return request.post<void>({
    url: `/api/storyboards/${storyboardId}/withdraw-review`
  })
}

/**
 * 获取分镜审核状态
 * @param storyboardId 分镜ID
 */
export function fetchGetStoryboardReviewStatus(storyboardId: string) {
  return request.get<Api.Storyboard.ReviewStatusVO>({
    url: `/api/storyboards/${storyboardId}/review-status`
  })
}

/**
 * 获取版本历史
 * @param storyboardId 分镜ID
 */
export function fetchGetStoryboardVersions(storyboardId: string) {
  return request.get<Api.Storyboard.StoryboardVersion[]>({
    url: `/api/storyboards/${storyboardId}/versions`
  })
}

/**
 * 回滚版本
 * @param storyboardId 分镜ID
 * @param versionId 版本ID
 */
export function fetchRollbackStoryboardVersion(storyboardId: string, versionId: string) {
  return request.post<void>({
    url: `/api/storyboards/${storyboardId}/versions/${versionId}/rollback`
  })
}

/**
 * 获取分镜配图列表
 * @param storyboardId 分镜ID
 */
export function fetchGetStoryboardImages(storyboardId: string) {
  return request.get<Api.Storyboard.StoryboardImage[]>({
    url: `/api/storyboards/${storyboardId}/images`
  })
}

/**
 * 添加分镜配图
 * @param storyboardId 分镜ID
 * @param params 配图参数
 */
export function fetchAddStoryboardImage(storyboardId: string, params: Api.Storyboard.AddImageParams) {
  return request.post<Api.Storyboard.StoryboardImage>({
    url: `/api/storyboards/${storyboardId}/images`,
    params
  })
}

/**
 * 删除分镜配图
 * @param imageId 配图ID
 */
export function fetchDeleteStoryboardImage(imageId: string) {
  return request.del<void>({
    url: `/api/storyboards/images/${imageId}`
  })
}

/**
 * 获取分镜关联资产
 * @param storyboardId 分镜ID
 */
export function fetchGetStoryboardAssets(storyboardId: string) {
  return request.get<Api.Storyboard.StoryboardAsset[]>({
    url: `/api/storyboards/${storyboardId}/assets`
  })
}

/**
 * 关联资产到分镜
 * @param storyboardId 分镜ID
 * @param assetId 资产ID
 */
export function fetchLinkAssetToStoryboard(storyboardId: string, assetId: string) {
  return request.post<void>({
    url: `/api/storyboards/${storyboardId}/assets`,
    params: { assetId }
  })
}

/**
 * 解除资产关联
 * @param storyboardId 分镜ID
 * @param assetId 资产ID
 */
export function fetchUnlinkAssetFromStoryboard(storyboardId: string, assetId: string) {
  return request.del<void>({
    url: `/api/storyboards/${storyboardId}/assets/${assetId}`
  })
}

/**
 * 分镜重排序
 * @param sceneId 镜头ID
 * @param storyboardIds 排序后的分镜ID列表
 */
export function fetchReorderStoryboards(sceneId: string, storyboardIds: string[]) {
  return request.put<void>({
    url: `/api/scenes/${sceneId}/storyboards/reorder`,
    params: { storyboardIds }
  })
}

/**
 * 查询镜头列表
 * @param episodeId 分集ID
 */
export function fetchGetSceneList(episodeId: string) {
  return request.get<Api.Storyboard.Scene[]>({
    url: `/api/episodes/${episodeId}/scenes`
  })
}

/**
 * 创建镜头
 * @param params 镜头参数
 */
export function fetchCreateScene(params: Api.Storyboard.CreateSceneParams) {
  return request.post<Api.Storyboard.Scene>({
    url: '/api/scenes',
    params
  })
}

/**
 * 分镜拆解
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param episodeId 分集ID
 * @param styleConfigId 风格配置ID（可选）
 */
export function fetchDecomposeStoryboard(
  projectId: string,
  scriptId: string,
  episodeId: string,
  styleConfigId?: string
) {
  return request.post<void>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/storyboard/decompose`,
    params: styleConfigId ? { styleConfigId } : undefined
  })
}

/**
 * 分镜重建
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 * @param episodeId 分集ID
 * @param params 重建参数
 */
export function fetchRebuildStoryboard(
  projectId: string,
  scriptId: string,
  episodeId: string,
  params: Api.Storyboard.RebuildParams
) {
  return request.post<void>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/episodes/${episodeId}/storyboard/rebuild`,
    params
  })
}

/**
 * 获取剧本分镜列表
 * @param projectId 项目ID
 * @param scriptId 剧本ID
 */
export function fetchGetScriptStoryboards(projectId: string, scriptId: string) {
  return request.get<Api.Storyboard.ScriptStoryboards>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/storyboards`
  })
}
