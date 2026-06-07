import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetProjectAssets,
  fetchGetAssetDetail,
  fetchUploadAsset,
  fetchUpdateAsset,
  fetchDeleteAsset,
  fetchBatchDeleteAssets,
  fetchGetAssetVersions,
  fetchRollbackAsset,
  fetchBatchAddTags,
  fetchBatchRemoveTags,
  fetchBatchMoveCategory,
  fetchAiGenerateAsset,
  fetchGetReferenceImages,
  fetchUploadReferenceImage,
  fetchDeleteReferenceImage,
  fetchImportFromTeam,
  fetchGetTeamAssets,
  fetchGetTeamAssetCategories
} from '@/api/asset'

import { assetKeys } from './keys'

// ==================== 项目资产 ====================

/** 项目资产列表（分页，后端分页） */
export function useAssetList(
  projectId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Asset.AssetSearchParams | undefined>
) {
  return useQuery({
    queryKey: assetKeys.list(projectId, params),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectAssets(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(projectId),
    staleTime: 30 * 1000
  })
}

/** 资产详情 */
export function useAssetDetail(
  projectId: MaybeRefOrGetter<string | undefined>,
  assetId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: assetKeys.detail(projectId, assetId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const aid = toValue(assetId)
      if (!pid || !aid) return null
      return await fetchGetAssetDetail(pid, aid)
    },
    enabled: () => !!toValue(projectId) && !!toValue(assetId),
    staleTime: 60 * 1000
  })
}

/** 资产版本历史 */
export function useAssetVersions(
  projectId: MaybeRefOrGetter<string | undefined>,
  assetId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: assetKeys.versions(projectId, assetId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const aid = toValue(assetId)
      if (!pid || !aid) return []
      return await fetchGetAssetVersions(pid, aid)
    },
    enabled: () => !!toValue(projectId) && !!toValue(assetId),
    staleTime: 60 * 1000
  })
}

// ==================== 资产管理 Mutations ====================

/** 上传资产 */
export function useUploadAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Asset.UploadAssetParams }) =>
      fetchUploadAsset(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.listByProject(variables.projectId) })
    }
  })
}

/** 更新资产 */
export function useUpdateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      assetId: string
      params: Api.Asset.UpdateAssetParams
    }) => fetchUpdateAsset(payload.projectId, payload.assetId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assetKeys.detail(variables.projectId, variables.assetId)
      })
      queryClient.invalidateQueries({ queryKey: assetKeys.listByProject(variables.projectId) })
    }
  })
}

/** 删除资产 */
export function useDeleteAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; assetId: string }) =>
      fetchDeleteAsset(payload.projectId, payload.assetId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(variables.projectId, variables.assetId) })
      queryClient.invalidateQueries({ queryKey: assetKeys.listByProject(variables.projectId) })
    }
  })
}

/** 批量删除资产 */
export function useBatchDeleteAssets() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; assetIds: string[] }) =>
      fetchBatchDeleteAssets(payload.projectId, payload.assetIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.listByProject(variables.projectId) })
    }
  })
}

/** 回滚资产版本 */
export function useRollbackAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; assetId: string; versionId: string }) =>
      fetchRollbackAsset(payload.projectId, payload.assetId, payload.versionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assetKeys.detail(variables.projectId, variables.assetId)
      })
      queryClient.invalidateQueries({
        queryKey: assetKeys.versions(variables.projectId, variables.assetId)
      })
    }
  })
}

/** 批量添加标签 */
export function useBatchAddTags() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Asset.BatchTagParams }) =>
      fetchBatchAddTags(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.listByProject(variables.projectId) })
    }
  })
}

/** 批量移除标签 */
export function useBatchRemoveTags() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Asset.BatchTagParams }) =>
      fetchBatchRemoveTags(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.listByProject(variables.projectId) })
    }
  })
}

/** 批量移动分类 */
export function useBatchMoveCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Asset.BatchMoveParams }) =>
      fetchBatchMoveCategory(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.listByProject(variables.projectId) })
    }
  })
}

/** AI 生成资产 */
export function useAiGenerateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Asset.AiGenerateParams }) =>
      fetchAiGenerateAsset(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.listByProject(variables.projectId) })
    }
  })
}

/** 从团队导入资产 */
export function useImportFromTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; teamAssetIds: string[] }) =>
      fetchImportFromTeam(payload.projectId, payload.teamAssetIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.listByProject(variables.projectId) })
    }
  })
}

// ==================== 参考图 ====================

/** 参考图列表 */
export function useReferenceImages(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: assetKeys.referenceImages(projectId),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return []
      return await fetchGetReferenceImages(id)
    },
    enabled: () => !!toValue(projectId),
    staleTime: 60 * 1000
  })
}

/** 上传参考图 */
export function useUploadReferenceImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; file: File; assetName?: string }) =>
      fetchUploadReferenceImage(payload.projectId, payload.file, payload.assetName),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.referenceImages(variables.projectId) })
    }
  })
}

/** 删除参考图 */
export function useDeleteReferenceImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; assetId: string }) =>
      fetchDeleteReferenceImage(payload.projectId, payload.assetId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.referenceImages(variables.projectId) })
    }
  })
}

// ==================== 团队资产 ====================

/** 团队资产列表（分页） */
export function useTeamAssetList(
  teamId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Asset.TeamAssetSearchParams | undefined>
) {
  return useQuery({
    queryKey: assetKeys.teamList(teamId, params),
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return null
      const res = await fetchGetTeamAssets(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(teamId),
    staleTime: 30 * 1000
  })
}

/** 团队资产分类 */
export function useTeamAssetCategories(teamId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: assetKeys.teamCategories(teamId),
    queryFn: async () => {
      const id = toValue(teamId)
      if (!id) return []
      return await fetchGetTeamAssetCategories(id)
    },
    enabled: () => !!toValue(teamId),
    staleTime: 5 * 60 * 1000
  })
}
