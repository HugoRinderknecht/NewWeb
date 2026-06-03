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
    { assets: data }
  )
}

/** 获取创意资产详情 */
export function fetchGetScriptAssetDetail(assetId: string) {
  return getApiAdapter().get<Api.ScriptAsset.ScriptAssetDetail>(`/api/script-assets/${assetId}`)
}

/** 更新创意资产 */
export function fetchUpdateScriptAsset(
  assetId: string,
  data: Api.ScriptAsset.UpdateScriptAssetParams
) {
  return getApiAdapter().put<Api.ScriptAsset.ScriptAssetDetail>(
    `/api/script-assets/${assetId}`,
    data
  )
}

/** 删除创意资产 */
export function fetchDeleteScriptAsset(assetId: string) {
  return getApiAdapter().del<void>(`/api/script-assets/${assetId}`)
}

/** 上传资产参考图 */
export function fetchUploadScriptAssetImage(assetId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return getApiAdapter().post<Api.ScriptAsset.UploadImageResult>(
    `/api/script-assets/${assetId}/upload-image`,
    formData
  )
}
