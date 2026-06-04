import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetScriptList,
  fetchGetScriptDetail,
  fetchCreateScript,
  fetchUpdateScript,
  fetchDeleteScript,
  fetchSubmitScriptReview,
  fetchWithdrawScriptReview,
  fetchGetScriptReviewStatus,
  fetchGetPostApprovalStatus,
  fetchGetProjectEpisodes,
  fetchGetEpisodeDetail,
  fetchUpdateEpisode,
  fetchDeleteEpisode,
  fetchCreateEpisode,
  fetchGenerateCharacterProfiles,
  fetchGetCharacterProfiles,
  fetchExtractAssets,
  fetchGetExtractedAssets,
  fetchReviewScriptContent,
  fetchGenerateStyleConfig,
  fetchGetStyleConfig,
  fetchRefAnalysis,
  fetchGetRefAnalysis,
  fetchGenerateVoicePrompts,
  fetchGetVoicePrompts,
  fetchGenerateAssetPrompts,
  fetchGetAssetPrompts,
  fetchGenerateAssetImages,
  fetchGetAssetImages,
  fetchReviewAssetImages,
  fetchGenerateVideoPrompts,
  fetchGetVideoPrompts
} from '@/api/script'

const QUERY_KEY = 'scripts' as const

// ==================== 剧本列表 ====================

/** 剧本列表（分页） */
export function useScriptList(
  projectId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Script.ScriptSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', projectId, params] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetScriptList(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 剧本详情 */
export function useScriptDetail(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return null
      return await fetchGetScriptDetail(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 60 * 1000
  })
}

/** 剧本审核状态 */
export function useScriptReviewStatus(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'review-status', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return null
      return await fetchGetScriptReviewStatus(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 30 * 1000
  })
}

/** 审核后资产生成进度 */
export function usePostApprovalStatus(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'post-approval', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return null
      return await fetchGetPostApprovalStatus(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 10 * 1000,
    refetchInterval: 5000
  })
}

// ==================== 剧本 CRUD ====================

/** 创建剧本 */
export function useCreateScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Script.CreateScriptParams }) =>
      fetchCreateScript(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list', variables.projectId] })
    }
  })
}

/** 更新剧本 */
export function useUpdateScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { scriptId: string; params: Api.Script.UpdateScriptParams; projectId?: string }) =>
      fetchUpdateScript(payload.scriptId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list', variables.projectId] })
      }
    }
  })
}

/** 删除剧本 */
export function useDeleteScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { scriptId: string; projectId?: string }) =>
      fetchDeleteScript(payload.scriptId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list', variables.projectId] })
      }
    }
  })
}

/** 提交剧本审核 */
export function useSubmitScriptReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { scriptId: string; projectId?: string }) =>
      fetchSubmitScriptReview(payload.scriptId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'review-status', variables.scriptId] })
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list', variables.projectId] })
      }
    }
  })
}

/** 撤回剧本审核 */
export function useWithdrawScriptReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { scriptId: string; projectId?: string }) =>
      fetchWithdrawScriptReview(payload.scriptId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'review-status', variables.scriptId] })
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'list', variables.projectId] })
      }
    }
  })
}

// ==================== 分集管理 ====================

/** 项目所有分集 */
export function useProjectEpisodes(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'episodes', projectId] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return []
      return await fetchGetProjectEpisodes(id)
    },
    enabled: () => !!toValue(projectId),
    staleTime: 60 * 1000
  })
}

/** 分集详情 */
export function useEpisodeDetail(
  scriptId: MaybeRefOrGetter<string | undefined>,
  episodeId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'episode', scriptId, episodeId] as const,
    queryFn: async () => {
      const sid = toValue(scriptId)
      const eid = toValue(episodeId)
      if (!sid || !eid) return null
      return await fetchGetEpisodeDetail(sid, eid)
    },
    enabled: () => !!toValue(scriptId) && !!toValue(episodeId),
    staleTime: 60 * 1000
  })
}

/** 创建分集 */
export function useCreateEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Script.EpisodeParams }) =>
      fetchCreateEpisode(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'episodes', variables.projectId] })
    }
  })
}

/** 更新分集 */
export function useUpdateEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { scriptId: string; episodeId: string; params: Api.Script.EpisodeParams; projectId?: string }) =>
      fetchUpdateEpisode(payload.scriptId, payload.episodeId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'episode', variables.scriptId, variables.episodeId] })
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'episodes', variables.projectId] })
      }
    }
  })
}

/** 删除分集 */
export function useDeleteEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { scriptId: string; episodeId: string; projectId?: string }) =>
      fetchDeleteEpisode(payload.scriptId, payload.episodeId),
    onSuccess: (_data, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'episodes', variables.projectId] })
      }
    }
  })
}

// ==================== AI 内容生成 ====================

/** 生成人物小传 */
export function useGenerateCharacterProfiles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      episodeIds?: string[]
      force?: boolean
    }) => fetchGenerateCharacterProfiles(payload.projectId, payload.scriptId, payload.episodeIds, payload.force),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
    }
  })
}

/** 获取人物小传 */
export function useCharacterProfiles(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'character-profiles', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return null
      return await fetchGetCharacterProfiles(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 30 * 1000
  })
}

/** 提取资产表 */
export function useExtractAssets() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      episodeIds?: string[]
      force?: boolean
    }) => fetchExtractAssets(payload.projectId, payload.scriptId, payload.episodeIds, payload.force),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
    }
  })
}

/** 获取资产提取结果 */
export function useExtractedAssets(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'extracted-assets', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return null
      return await fetchGetExtractedAssets(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 30 * 1000
  })
}

/** 剧本内容审核 */
export function useReviewScriptContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      episodeIds?: string[]
      force?: boolean
    }) => fetchReviewScriptContent(payload.projectId, payload.scriptId, payload.episodeIds, payload.force),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
    }
  })
}

/** 生成风格配置 */
export function useGenerateStyleConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      params: Api.Script.StyleConfigParams
    }) => fetchGenerateStyleConfig(payload.projectId, payload.scriptId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
    }
  })
}

/** 获取风格配置 */
export function useStyleConfig(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'style-config', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return null
      return await fetchGetStyleConfig(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 60 * 1000
  })
}

/** 参考图风格反推 */
export function useRefAnalysis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      params: Api.Script.RefAnalysisParams
    }) => fetchRefAnalysis(payload.projectId, payload.scriptId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
    }
  })
}

/** 获取参考图分析结果 */
export function useRefAnalysisResult(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'ref-analysis', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return null
      return await fetchGetRefAnalysis(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 60 * 1000
  })
}

/** 生成音色提示词 */
export function useGenerateVoicePrompts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      characterProfileId?: string
      force?: boolean
    }) => fetchGenerateVoicePrompts(
      payload.projectId,
      payload.scriptId,
      payload.characterProfileId,
      payload.force
    ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
    }
  })
}

/** 获取音色提示词 */
export function useVoicePrompts(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'voice-prompts', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return null
      return await fetchGetVoicePrompts(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 60 * 1000
  })
}

/** 生成资产提示词 */
export function useGenerateAssetPrompts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      params?: Api.ScriptAsset.GenerateAssetPromptsParams
    }) => fetchGenerateAssetPrompts(payload.projectId, payload.scriptId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
    }
  })
}

/** 获取资产提示词 */
export function useAssetPrompts(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'asset-prompts', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return null
      return await fetchGetAssetPrompts(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 60 * 1000
  })
}

/** 生成资产图片 */
export function useGenerateAssetImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      params: Api.ScriptAsset.GenerateAssetImagesParams
    }) => fetchGenerateAssetImages(payload.projectId, payload.scriptId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.scriptId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'asset-images', variables.scriptId] })
    }
  })
}

/** 获取资产图片 */
export function useAssetImages(scriptId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'asset-images', scriptId] as const,
    queryFn: async () => {
      const id = toValue(scriptId)
      if (!id) return []
      return await fetchGetAssetImages(id)
    },
    enabled: () => !!toValue(scriptId),
    staleTime: 30 * 1000
  })
}

/** 审核资产图片 */
export function useReviewAssetImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      params: Api.ScriptAsset.ReviewAssetImagesParams
    }) => fetchReviewAssetImages(payload.projectId, payload.scriptId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'asset-images', variables.scriptId] })
    }
  })
}

/** 生成视频提示词 */
export function useGenerateVideoPrompts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      episodeId: string
      styleConfigId?: string
      force?: boolean
    }) => fetchGenerateVideoPrompts(
      payload.projectId,
      payload.scriptId,
      payload.episodeId,
      payload.styleConfigId,
      payload.force
    ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'episode', variables.scriptId, variables.episodeId]
      })
    }
  })
}

/** 获取视频提示词 */
export function useVideoPrompts(episodeId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'video-prompts', episodeId] as const,
    queryFn: async () => {
      const id = toValue(episodeId)
      if (!id) return null
      return await fetchGetVideoPrompts(id)
    },
    enabled: () => !!toValue(episodeId),
    staleTime: 60 * 1000
  })
}
