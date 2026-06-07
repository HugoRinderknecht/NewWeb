import { getApiAdapter } from './adapter'

// ==================== 创意资产 CRUD ====================

/** 查询创意资产列表 */
export function fetchGetScriptAssetList(
  projectId: string,
  params?: Api.ScriptAsset.ScriptAssetSearchParams
) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.ScriptAsset.ScriptAssetListItem>>(
    `/api/projects/${projectId}/script-assets`,
    params
  )
}

/** 创建创意资产 */
export function fetchCreateScriptAsset(
  projectId: string,
  data: Api.ScriptAsset.CreateScriptAssetParams
) {
  return getApiAdapter().post<Api.ScriptAsset.ScriptAssetDetail>(
    `/api/projects/${projectId}/script-assets`,
    data
  )
}

/** 批量创建创意资产 */
export function fetchBatchCreateScriptAssets(
  projectId: string,
  data: Api.ScriptAsset.BatchCreateScriptAssetItem[]
) {
  return getApiAdapter().post<Api.ScriptAsset.ScriptAssetDetail[]>(
    `/api/projects/${projectId}/script-assets/batch`,
    data
  )
}

/**
 * 获取创意资产详情（文档：projectId 为必填 query 参数）
 * GET /api/script-assets/{assetId}?projectId={projectId}
 */
export function fetchGetScriptAssetDetail(assetId: string, projectId: string) {
  return getApiAdapter().get<Api.ScriptAsset.ScriptAssetDetail>(`/api/script-assets/${assetId}`, {
    projectId
  })
}

/**
 * 更新创意资产（文档：projectId 为必填 query 参数）
 * PUT /api/script-assets/{assetId}?projectId={projectId}
 */
export function fetchUpdateScriptAsset(
  assetId: string,
  data: Api.ScriptAsset.UpdateScriptAssetParams,
  projectId: string
) {
  return getApiAdapter().put<Api.ScriptAsset.ScriptAssetDetail>(
    `/api/script-assets/${assetId}`,
    data,
    { params: { projectId } }
  )
}

/**
 * 删除创意资产（文档：projectId 为必填 query 参数）
 * DELETE /api/script-assets/{assetId}?projectId={projectId}
 */
export function fetchDeleteScriptAsset(assetId: string, projectId: string) {
  return getApiAdapter().del<void>(`/api/script-assets/${assetId}`, { projectId })
}

/**
 * 上传资产参考图（文档：projectId 为必填 query 参数）
 * POST /api/script-assets/{assetId}/upload-image?projectId={projectId}
 */
export function fetchUploadScriptAssetImage(assetId: string, file: File, projectId: string) {
  const formData = new FormData()
  formData.append('file', file)
  return getApiAdapter().post<Api.ScriptAsset.UploadImageResult>(
    `/api/script-assets/${assetId}/upload-image`,
    formData,
    { params: { projectId } }
  )
}
