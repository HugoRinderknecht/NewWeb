import request from '@/utils/http'

/**
 * 获取项目资产列表
 * @param projectId 项目ID
 * @param params 查询参数
 */
export function fetchGetProjectAssets(projectId: string, params?: Api.Asset.AssetSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Asset.AssetListItem>>({
    url: `/api/projects/${projectId}/assets`,
    params
  })
}

/**
 * 获取资产详情
 * @param projectId 项目ID
 * @param assetId 资产ID
 */
export function fetchGetAssetDetail(projectId: string, assetId: string) {
  return request.get<Api.Asset.AssetDetail>({
    url: `/api/projects/${projectId}/assets/${assetId}`
  })
}

/**
 * 上传单文件到项目资产库
 * @param projectId 项目ID
 * @param params 上传参数
 */
export function fetchUploadAsset(projectId: string, params: Api.Asset.UploadAssetParams) {
  const formData = new FormData()
  formData.append('file', params.file)
  if (params.assetName) formData.append('assetName', params.assetName)
  if (params.assetType) formData.append('assetType', params.assetType)
  if (params.category) formData.append('category', params.category)
  if (params.tags) formData.append('tags', JSON.stringify(params.tags))
  return request.post<Api.Asset.AssetDetail>({
    url: `/api/projects/${projectId}/assets`,
    params: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 更新资产
 * @param projectId 项目ID
 * @param assetId 资产ID
 * @param params 更新参数
 */
export function fetchUpdateAsset(projectId: string, assetId: string, params: Api.Asset.UpdateAssetParams) {
  return request.put<Api.Asset.AssetDetail>({
    url: `/api/projects/${projectId}/assets/${assetId}`,
    params
  })
}

/**
 * 删除资产
 * @param projectId 项目ID
 * @param assetId 资产ID
 */
export function fetchDeleteAsset(projectId: string, assetId: string) {
  return request.del<void>({
    url: `/api/projects/${projectId}/assets/${assetId}`
  })
}

/**
 * 批量删除资产
 * @param projectId 项目ID
 * @param assetIds 资产ID列表
 */
export function fetchBatchDeleteAssets(projectId: string, assetIds: string[]) {
  return request.del<void>({
    url: `/api/projects/${projectId}/assets/batch-delete`,
    data: { assetIds }
  })
}

/**
 * 下载资产文件
 * @param projectId 项目ID
 * @param assetId 资产ID
 */
export function fetchDownloadAsset(projectId: string, assetId: string) {
  return request.get<Blob>({
    url: `/api/projects/${projectId}/assets/${assetId}/download`,
    responseType: 'blob'
  } as any)
}

/**
 * 批量下载资产
 * @param projectId 项目ID
 * @param assetIds 资产ID列表
 */
export function fetchBatchDownloadAssets(projectId: string, assetIds: string[]) {
  return request.post<Blob>({
    url: `/api/projects/${projectId}/assets/batch-download`,
    params: { assetIds },
    responseType: 'blob'
  } as any)
}

/**
 * 获取资产版本列表
 * @param projectId 项目ID
 * @param assetId 资产ID
 */
export function fetchGetAssetVersions(projectId: string, assetId: string) {
  return request.get<Api.Asset.AssetVersion[]>({
    url: `/api/projects/${projectId}/assets/${assetId}/versions`
  })
}

/**
 * 回滚资产版本
 * @param projectId 项目ID
 * @param assetId 资产ID
 * @param versionId 版本ID
 */
export function fetchRollbackAsset(projectId: string, assetId: string, versionId: string) {
  return request.post<Api.Asset.AssetDetail>({
    url: `/api/projects/${projectId}/assets/${assetId}/rollback`,
    params: { versionId }
  })
}

/**
 * 初始化分片上传
 * @param projectId 项目ID
 * @param params 初始化参数
 */
export function fetchInitChunkUpload(projectId: string, params: Api.Asset.ChunkInitParams) {
  return request.post<Api.Asset.ChunkInitResponse>({
    url: `/api/projects/${projectId}/assets/chunk-init`,
    params
  })
}

/**
 * 上传分片
 * @param projectId 项目ID
 * @param params 分片参数
 */
export function fetchUploadChunk(projectId: string, params: Api.Asset.ChunkUploadParams) {
  const formData = new FormData()
  formData.append('uploadId', params.uploadId)
  formData.append('chunkNumber', String(params.chunkNumber))
  formData.append('chunk', params.chunk)
  return request.post<void>({
    url: `/api/projects/${projectId}/assets/chunk-upload`,
    params: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 合并分片
 * @param projectId 项目ID
 * @param params 合并参数
 */
export function fetchCompleteChunkUpload(projectId: string, params: Api.Asset.ChunkCompleteParams) {
  return request.post<Api.Asset.AssetDetail>({
    url: `/api/projects/${projectId}/assets/chunk-complete`,
    params
  })
}

/**
 * 取消分片上传
 * @param projectId 项目ID
 * @param uploadId 上传会话ID
 */
export function fetchCancelChunkUpload(projectId: string, uploadId: string) {
  return request.del<void>({
    url: `/api/projects/${projectId}/assets/chunk-cancel`,
    params: { uploadId }
  })
}

/**
 * 批量上传资产
 * @param projectId 项目ID
 * @param params 批量上传参数
 */
export function fetchBatchUploadAssets(projectId: string, params: Api.Asset.BatchUploadParams) {
  return request.post<Api.Asset.AssetDetail[]>({
    url: `/api/projects/${projectId}/assets/batch`,
    params
  })
}

/**
 * 批量添加标签
 * @param projectId 项目ID
 * @param params 标签参数
 */
export function fetchBatchAddTags(projectId: string, params: Api.Asset.BatchTagParams) {
  return request.post<void>({
    url: `/api/projects/${projectId}/assets/batch-tags`,
    params
  })
}

/**
 * 批量移除标签
 * @param projectId 项目ID
 * @param params 标签参数
 */
export function fetchBatchRemoveTags(projectId: string, params: Api.Asset.BatchTagParams) {
  return request.del<void>({
    url: `/api/projects/${projectId}/assets/batch-tags`,
    params
  })
}

/**
 * 批量移动分类
 * @param projectId 项目ID
 * @param params 移动参数
 */
export function fetchBatchMoveCategory(projectId: string, params: Api.Asset.BatchMoveParams) {
  return request.post<void>({
    url: `/api/projects/${projectId}/assets/batch-move`,
    params
  })
}

/**
 * AI生成资产
 * @param projectId 项目ID
 * @param params 生成参数
 */
export function fetchAiGenerateAsset(projectId: string, params: Api.Asset.AiGenerateParams) {
  return request.post<Api.Asset.AssetDetail>({
    url: `/api/projects/${projectId}/assets/ai-generate`,
    params
  })
}

/**
 * 获取参考图列表
 * @param projectId 项目ID
 */
export function fetchGetReferenceImages(projectId: string) {
  return request.get<Api.Asset.AssetListItem[]>({
    url: `/api/projects/${projectId}/assets/reference-images`
  })
}

/**
 * 上传参考图
 * @param projectId 项目ID
 * @param file 图片文件
 * @param assetName 资产名称
 */
export function fetchUploadReferenceImage(projectId: string, file: File, assetName?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (assetName) formData.append('assetName', assetName)
  return request.post<Api.Asset.AssetDetail>({
    url: `/api/projects/${projectId}/assets/reference-images`,
    params: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 删除参考图
 * @param projectId 项目ID
 * @param assetId 资产ID
 */
export function fetchDeleteReferenceImage(projectId: string, assetId: string) {
  return request.del<void>({
    url: `/api/projects/${projectId}/assets/reference-images/${assetId}`
  })
}

/**
 * 从团队库导入资产
 * @param projectId 项目ID
 * @param teamAssetIds 团队资产ID列表
 */
export function fetchImportFromTeam(projectId: string, teamAssetIds: string[]) {
  return request.post<Api.Asset.AssetDetail[]>({
    url: `/api/projects/${projectId}/assets/import-from-team`,
    params: { teamAssetIds }
  })
}

/**
 * 获取团队资产列表
 * @param teamId 团队ID
 * @param params 查询参数
 */
export function fetchGetTeamAssets(teamId: string, params?: Api.Asset.TeamAssetSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Asset.TeamAssetItem>>({
    url: `/api/teams/${teamId}/assets`,
    params
  })
}

/**
 * 上传团队资产
 * @param teamId 团队ID
 * @param params 上传参数
 */
export function fetchUploadTeamAsset(teamId: string, params: Api.Asset.UploadTeamAssetParams) {
  const formData = new FormData()
  formData.append('file', params.file)
  if (params.assetName) formData.append('assetName', params.assetName)
  if (params.assetType) formData.append('assetType', params.assetType)
  if (params.tags) formData.append('tags', JSON.stringify(params.tags))
  return request.post<Api.Asset.TeamAssetItem>({
    url: `/api/teams/${teamId}/assets`,
    params: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 获取团队资产详情
 * @param teamId 团队ID
 * @param assetId 资产ID
 */
export function fetchGetTeamAssetDetail(teamId: string, assetId: string) {
  return request.get<Api.Asset.TeamAssetItem>({
    url: `/api/teams/${teamId}/assets/${assetId}`
  })
}

/**
 * 获取团队资产分类列表
 * @param teamId 团队ID
 */
export function fetchGetTeamAssetCategories(teamId: string) {
  return request.get<string[]>({
    url: `/api/teams/${teamId}/asset-categories`
  })
}