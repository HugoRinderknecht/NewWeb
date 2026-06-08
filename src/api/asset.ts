import { getApiAdapter } from './adapter'

export function fetchGetProjectAssets(projectId: string, params?: Api.Asset.AssetSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Asset.AssetListItem>>(
    `/api/projects/${projectId}/assets`,
    params
  )
}

export function fetchGetAssetDetail(projectId: string, assetId: string) {
  return getApiAdapter().get<Api.Asset.AssetDetail>(`/api/projects/${projectId}/assets/${assetId}`)
}

export function fetchUploadAsset(projectId: string, params: Api.Asset.UploadAssetParams) {
  const formData = new FormData()
  formData.append('file', params.file)
  if (params.assetName) formData.append('assetName', params.assetName)
  if (params.assetType) formData.append('assetType', params.assetType)
  if (params.categoryId) formData.append('categoryId', params.categoryId)
  if (params.description) formData.append('description', params.description)
  if (params.tags) formData.append('tags', JSON.stringify(params.tags))
  if (params.allowDuplicate !== undefined) formData.append('allowDuplicate', String(params.allowDuplicate))
  return getApiAdapter().post<Api.Asset.AssetDetail>(`/api/projects/${projectId}/assets`, formData)
}

export function fetchUpdateAsset(
  projectId: string,
  assetId: string,
  params: Api.Asset.UpdateAssetParams
) {
  return getApiAdapter().put<Api.Asset.AssetDetail>(
    `/api/projects/${projectId}/assets/${assetId}`,
    params
  )
}

export function fetchDeleteAsset(projectId: string, assetId: string) {
  return getApiAdapter().del<void>(`/api/projects/${projectId}/assets/${assetId}`)
}

export function fetchBatchDeleteAssets(projectId: string, assetIds: string[]) {
  return getApiAdapter().post<void>(`/api/projects/${projectId}/assets/batch-delete`, {
    assetIds
  })
}

export function fetchDownloadAsset(projectId: string, assetId: string) {
  return getApiAdapter().get<Blob>(
    `/api/projects/${projectId}/assets/${assetId}/download`,
    undefined,
    { responseType: 'blob' }
  )
}

export function fetchBatchDownloadAssets(projectId: string, assetIds: string[]) {
  return getApiAdapter().post<Blob>(`/api/projects/${projectId}/assets/batch-download`, { assetIds }, {
    responseType: 'blob'
  })
}

export function fetchGetAssetVersions(projectId: string, assetId: string) {
  return getApiAdapter().get<Api.Asset.AssetVersion[]>(
    `/api/projects/${projectId}/assets/${assetId}/versions`
  )
}

export function fetchRollbackAsset(projectId: string, assetId: string, targetVersion: number) {
  return getApiAdapter().post<void>(
    `/api/projects/${projectId}/assets/${assetId}/rollback`,
    { targetVersion }
  )
}

export function fetchInitChunkUpload(projectId: string, params: Api.Asset.ChunkInitParams) {
  return getApiAdapter().post<Api.Asset.ChunkInitResponse>(
    `/api/projects/${projectId}/assets/chunk-init`,
    params
  )
}

export function fetchUploadChunk(projectId: string, params: Api.Asset.ChunkUploadParams) {
  const formData = new FormData()
  formData.append('uploadId', params.uploadId)
  formData.append('chunkIndex', String(params.chunkIndex))
  formData.append('file', params.file)
  return getApiAdapter().post<void>(`/api/projects/${projectId}/assets/chunk-upload`, formData)
}

export function fetchCompleteChunkUpload(projectId: string, params: Api.Asset.ChunkCompleteParams) {
  return getApiAdapter().post<Api.Asset.AssetDetail>(
    `/api/projects/${projectId}/assets/chunk-complete`,
    params
  )
}

export function fetchCancelChunkUpload(projectId: string, uploadId: string) {
  return getApiAdapter().del<void>(`/api/projects/${projectId}/assets/chunk-cancel`, { uploadId })
}

export function fetchBatchUploadAssets(projectId: string, params: Api.Asset.BatchUploadParams) {
  const formData = new FormData()
  params.files.forEach((file) => formData.append('files', file))
  if (params.metadataJson) formData.append('metadataJson', params.metadataJson)
  return getApiAdapter().post<Api.Asset.BatchUploadResultVO>(
    `/api/projects/${projectId}/assets/batch`,
    formData
  )
}

export function fetchBatchAddTags(projectId: string, params: Api.Asset.BatchTagParams) {
  return getApiAdapter().post<void>(`/api/projects/${projectId}/assets/batch-tags`, params)
}

export function fetchBatchRemoveTags(projectId: string, params: Api.Asset.BatchTagParams) {
  return getApiAdapter().del<void>(`/api/projects/${projectId}/assets/batch-tags`, undefined, {
    data: params
  })
}

export function fetchBatchMoveCategory(projectId: string, params: Api.Asset.BatchMoveParams) {
  return getApiAdapter().post<void>(`/api/projects/${projectId}/assets/batch-move`, params)
}

export function fetchAiGenerateAsset(projectId: string, params: Api.Asset.AiGenerateParams) {
  return getApiAdapter().post<Api.Asset.AssetDetail>(
    `/api/projects/${projectId}/assets/ai-generate`,
    params
  )
}

export function fetchGetReferenceImages(projectId: string, params?: Api.Common.PaginationParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Asset.AssetListItem>>(
    `/api/projects/${projectId}/assets/reference-images`,
    params
  )
}

export function fetchUploadReferenceImage(projectId: string, imageUrl: string, imageType: string = 'reference') {
  return getApiAdapter().post<Api.Asset.AssetDetail>(
    `/api/projects/${projectId}/assets/reference-images`,
    undefined,
    { params: { imageUrl, imageType } }
  )
}

export function fetchDeleteReferenceImage(projectId: string, assetId: string) {
  return getApiAdapter().del<void>(`/api/projects/${projectId}/assets/reference-images/${assetId}`)
}

export function fetchImportFromTeam(projectId: string, params: Api.Asset.AssetTransferRequest) {
  return getApiAdapter().post<void>(
    `/api/projects/${projectId}/assets/import-from-team`,
    params
  )
}

export function fetchImportFromProject(projectId: string, params: Api.Asset.AssetImportFromProjectRequest) {
  return getApiAdapter().post<Record<string, unknown>>(
    `/api/projects/${projectId}/assets/import-from-project`,
    params
  )
}

export function fetchGetTeamAssets(teamId: string, params?: Api.Asset.TeamAssetSearchParams) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Asset.TeamAssetItem>>(
    `/api/teams/${teamId}/assets`,
    params
  )
}

export function fetchUploadTeamAsset(teamId: string, params: Api.Asset.UploadTeamAssetParams) {
  const formData = new FormData()
  formData.append('file', params.file)
  if (params.assetName) formData.append('assetName', params.assetName)
  if (params.assetType) formData.append('assetType', params.assetType)
  if (params.categoryId) formData.append('categoryId', params.categoryId)
  if (params.description) formData.append('description', params.description)
  if (params.tags) formData.append('tags', params.tags.join(','))
  if (params.allowDuplicate !== undefined) formData.append('allowDuplicate', String(params.allowDuplicate))
  return getApiAdapter().post<Api.Asset.TeamAssetItem>(`/api/teams/${teamId}/assets`, formData)
}

export function fetchGetTeamAssetDetail(teamId: string, assetId: string) {
  return getApiAdapter().get<Api.Asset.TeamAssetItem>(`/api/teams/${teamId}/assets/${assetId}`)
}

export function fetchGetTeamAssetCategories(teamId: string) {
  return getApiAdapter().get<string[]>(`/api/teams/${teamId}/asset-categories`)
}
