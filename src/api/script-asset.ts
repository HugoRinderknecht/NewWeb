import request from '@/utils/http'

export function fetchGetScriptAssetList(projectId: string, params?: Api.ScriptAsset.ScriptAssetSearchParams) {
  return request.get<Api.ScriptAsset.ScriptAssetListItem[]>({
    url: `/api/projects/${projectId}/script-assets`,
    params
  })
}

export function fetchCreateScriptAsset(projectId: string, data: Api.ScriptAsset.CreateScriptAssetParams) {
  return request.post<Api.ScriptAsset.ScriptAssetDetail>({
    url: `/api/projects/${projectId}/script-assets`,
    data
  })
}

export function fetchBatchCreateScriptAssets(projectId: string, data: Api.ScriptAsset.BatchCreateScriptAssetItem[]) {
  return request.post<Api.ScriptAsset.ScriptAssetDetail[]>({
    url: `/api/projects/${projectId}/script-assets/batch`,
    data
  })
}

export function fetchGetScriptAssetDetail(assetId: string) {
  return request.get<Api.ScriptAsset.ScriptAssetDetail>({
    url: `/api/script-assets/${assetId}`
  })
}

export function fetchUpdateScriptAsset(assetId: string, data: Api.ScriptAsset.UpdateScriptAssetParams) {
  return request.put<Api.ScriptAsset.ScriptAssetDetail>({
    url: `/api/script-assets/${assetId}`,
    data
  })
}

export function fetchDeleteScriptAsset(assetId: string) {
  return request.del<void>({
    url: `/api/script-assets/${assetId}`
  })
}

export function fetchUploadScriptAssetImage(assetId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<Api.ScriptAsset.UploadImageResult>({
    url: `/api/script-assets/${assetId}/upload-image`,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function fetchGenerateAssetPrompts(projectId: string, scriptId: string, data?: Api.ScriptAsset.GenerateAssetPromptsParams) {
  return request.post<Api.ScriptAsset.ScriptAssetDetail[]>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/assets/prompts`,
    data
  })
}

export function fetchGenerateAssetImages(projectId: string, scriptId: string, data?: Api.ScriptAsset.GenerateAssetImagesParams) {
  return request.post<Api.ScriptAsset.ScriptAssetDetail[]>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/assets/images/generate`,
    data
  })
}

export function fetchReviewAssetImages(projectId: string, scriptId: string, data: Api.ScriptAsset.ReviewAssetImagesParams) {
  return request.post<void>({
    url: `/api/projects/${projectId}/scripts/${scriptId}/assets/images/review`,
    data
  })
}
