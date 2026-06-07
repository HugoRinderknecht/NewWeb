import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetScriptAssetList,
  fetchCreateScriptAsset,
  fetchBatchCreateScriptAssets,
  fetchGetScriptAssetDetail,
  fetchUpdateScriptAsset,
  fetchDeleteScriptAsset,
  fetchUploadScriptAssetImage
} from '@/api/script-asset'

import { scriptAssetKeys } from './keys'

/** 剧本资产列表 */
export function useScriptAssetList(
  projectId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<Record<string, unknown> | undefined>
) {
  return useQuery({
    queryKey: scriptAssetKeys.list(projectId, params),
    queryFn: async () => {
      const v = toValue(projectId)
      const p = toValue(params)
      if (!v) return { list: [], total: 0 }
      return await fetchGetScriptAssetList(v, p as any)
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 剧本资产详情（projectId 为必填 query 参数） */
export function useScriptAssetDetail(
  assetId: MaybeRefOrGetter<string>,
  projectId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptAssetKeys.detail(assetId),
    queryFn: async () => {
      const v = toValue(assetId)
      const pid = toValue(projectId)
      if (!v || !pid) return null
      return await fetchGetScriptAssetDetail(v, pid)
    },
    enabled: () => !!toValue(assetId) && !!toValue(projectId)
  })
}

/** 创建剧本资产 */
export function useCreateScriptAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      data
    }: {
      projectId: string
      data: Parameters<typeof fetchCreateScriptAsset>[1]
    }) => fetchCreateScriptAsset(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scriptAssetKeys.lists() })
    }
  })
}

/** 批量创建剧本资产 */
export function useBatchCreateScriptAssets() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      data
    }: {
      projectId: string
      data: Parameters<typeof fetchBatchCreateScriptAssets>[1]
    }) => fetchBatchCreateScriptAssets(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scriptAssetKeys.lists() })
    }
  })
}

/** 更新剧本资产（projectId 为必填 query 参数） */
export function useUpdateScriptAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      assetId,
      data,
      projectId
    }: {
      assetId: string
      data: Parameters<typeof fetchUpdateScriptAsset>[1]
      projectId: string
    }) => fetchUpdateScriptAsset(assetId, data, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scriptAssetKeys.all() })
    }
  })
}

/** 删除剧本资产（projectId 为必填 query 参数） */
export function useDeleteScriptAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assetId, projectId }: { assetId: string; projectId: string }) =>
      fetchDeleteScriptAsset(assetId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scriptAssetKeys.all() })
    }
  })
}

/** 上传剧本资产参考图（projectId 为必填 query 参数） */
export function useUploadScriptAssetImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      assetId,
      file,
      projectId
    }: {
      assetId: string
      file: File
      projectId: string
    }) => fetchUploadScriptAssetImage(assetId, file, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scriptAssetKeys.all() })
    }
  })
}
