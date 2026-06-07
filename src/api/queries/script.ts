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
  fetchGetScriptEpisodes,
  fetchDecomposeScript,
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

import { scriptKeys } from './keys'

// ==================== 剧本列表 ====================

/** 剧本列表（分页） */
export function useScriptList(
  projectId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Script.ScriptSearchParams | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.list(projectId, params),
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
    queryKey: scriptKeys.detail(scriptId),
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
    queryKey: scriptKeys.reviewStatus(scriptId),
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
    queryKey: scriptKeys.postApproval(scriptId),
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
      queryClient.invalidateQueries({ queryKey: scriptKeys.listByProject(variables.projectId) })
    }
  })
}

/** 更新剧本 */
export function useUpdateScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      scriptId: string
      params: Api.Script.UpdateScriptParams
      projectId?: string
    }) => fetchUpdateScript(payload.scriptId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: scriptKeys.listByProject(variables.projectId) })
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
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: scriptKeys.listByProject(variables.projectId) })
      }
    }
  })
}

/** 提交剧本审核 */
export function useSubmitScriptReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { scriptId: string; note?: string; projectId?: string }) =>
      fetchSubmitScriptReview(payload.scriptId, payload.note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
      queryClient.invalidateQueries({ queryKey: scriptKeys.reviewStatus(variables.scriptId) })
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: scriptKeys.listByProject(variables.projectId) })
      }
    }
  })
}

/** 撤回剧本审核 */
export function useWithdrawScriptReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { scriptId: string; reason?: string; projectId?: string }) =>
      fetchWithdrawScriptReview(payload.scriptId, payload.reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
      queryClient.invalidateQueries({ queryKey: scriptKeys.reviewStatus(variables.scriptId) })
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: scriptKeys.listByProject(variables.projectId) })
      }
    }
  })
}

// ==================== 分集管理 ====================

/** 项目所有分集 */
export function useProjectEpisodes(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: scriptKeys.episodes(projectId),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return []
      return await fetchGetProjectEpisodes(id)
    },
    enabled: () => !!toValue(projectId),
    staleTime: 60 * 1000
  })
}

/** 剧本分集列表 */
export function useScriptEpisodes(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.scriptEpisodes(projectId, scriptId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const sid = toValue(scriptId)
      if (!pid || !sid) return []
      return await fetchGetScriptEpisodes(pid, sid)
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId),
    staleTime: 60 * 1000
  })
}

/** 拆解剧本为分集 */
export function useDecomposeScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; scriptId: string; force?: boolean }) =>
      fetchDecomposeScript(payload.projectId, payload.scriptId, payload.force),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: scriptKeys.scriptEpisodes(variables.projectId, variables.scriptId)
      })
      queryClient.invalidateQueries({ queryKey: scriptKeys.episodes(variables.projectId) })
    }
  })
}

/** 分集详情 */
export function useEpisodeDetail(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>,
  episodeId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.episode(projectId, scriptId, episodeId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const sid = toValue(scriptId)
      const eid = toValue(episodeId)
      if (!pid || !sid || !eid) return null
      return await fetchGetEpisodeDetail(pid, sid, eid)
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId) && !!toValue(episodeId),
    staleTime: 60 * 1000
  })
}

/** 创建分集 */
export function useCreateEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      params: Api.Script.EpisodeParams
    }) => fetchCreateEpisode(payload.projectId, payload.params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.episodes(variables.projectId) })
      queryClient.invalidateQueries({
        queryKey: scriptKeys.scriptEpisodes(variables.projectId, variables.scriptId)
      })

      if (data) {
        queryClient.setQueryData(
          scriptKeys.scriptEpisodes(variables.projectId, variables.scriptId),
          (old: Api.Script.Episode[] | undefined) => {
            if (!old) return old

            const createdEpisode: Api.Script.Episode = {
              ...data,
              id: data.id,
              projectId: data.projectId ?? variables.projectId,
              scriptId: data.scriptId ?? variables.scriptId,
              episodeName: data.episodeName ?? variables.params.episodeName ?? '',
              content: data.content ?? variables.params.content ?? '',
              episodeIndex: data.episodeIndex ?? variables.params.episodeIndex ?? 0,
              createTime: data.createTime ?? '',
              updateTime: data.updateTime ?? ''
            }

            return [...old, createdEpisode]
          }
        )
      }
    }
  })
}

/** 更新分集 */
export function useUpdateEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      episodeId: string
      params: Api.Script.EpisodeParams
    }) =>
      fetchUpdateEpisode(payload.projectId, payload.scriptId, payload.episodeId, payload.params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: scriptKeys.episode(variables.projectId, variables.scriptId, variables.episodeId)
      })
      queryClient.invalidateQueries({
        queryKey: scriptKeys.scriptEpisodes(variables.projectId, variables.scriptId)
      })
      queryClient.invalidateQueries({ queryKey: scriptKeys.episodes(variables.projectId) })

      if (data) {
        queryClient.setQueryData(
          scriptKeys.episode(variables.projectId, variables.scriptId, variables.episodeId),
          data
        )
        queryClient.setQueryData(
          scriptKeys.scriptEpisodes(variables.projectId, variables.scriptId),
          (old: Api.Script.Episode[] | undefined) =>
            old?.map((item) =>
              String(item.id) === String(variables.episodeId)
                ? {
                    ...item,
                    ...data,
                    id: item.id,
                    projectId: data.projectId ?? item.projectId,
                    scriptId: data.scriptId ?? item.scriptId,
                    episodeName: data.episodeName ?? item.episodeName,
                    content: data.content ?? item.content,
                    episodeIndex: data.episodeIndex ?? item.episodeIndex,
                    createTime: data.createTime ?? item.createTime,
                    updateTime: data.updateTime ?? item.updateTime
                  }
                : item
            ) ?? old
        )
      }
    }
  })
}

/** 删除分集 */
export function useDeleteEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; scriptId: string; episodeId: string }) =>
      fetchDeleteEpisode(payload.projectId, payload.scriptId, payload.episodeId),
    onSuccess: (_data, variables) => {
      // 失效分集列表
      queryClient.invalidateQueries({ queryKey: scriptKeys.episodes(variables.projectId) })
      queryClient.invalidateQueries({
        queryKey: scriptKeys.scriptEpisodes(variables.projectId, variables.scriptId)
      })
      // 失效分集详情
      queryClient.invalidateQueries({
        queryKey: scriptKeys.episode(variables.projectId, variables.scriptId, variables.episodeId)
      })
      queryClient.invalidateQueries({ queryKey: scriptKeys.episodeById(variables.episodeId) })
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
    }) =>
      fetchGenerateCharacterProfiles(
        payload.projectId,
        payload.scriptId,
        payload.episodeIds,
        payload.force
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
      // 生成完成后失效人物小传缓存，使列表自动刷新
      queryClient.invalidateQueries({
        queryKey: scriptKeys.characterProfiles(variables.projectId, variables.scriptId)
      })
    }
  })
}

/** 获取人物小传 */
export function useCharacterProfiles(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.characterProfiles(projectId, scriptId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const id = toValue(scriptId)
      if (!pid || !id) return null
      try {
        const res = await fetchGetCharacterProfiles(id)
        // Vue Query 不允许 queryFn 返回 undefined，统一 ?? null
        return res ?? null
      } catch (err: any) {
        // 后端 404 / 业务码 404 时降级为"无数据"，避免 query 进入 error 态导致 data 为 undefined
        if (err?.code === 404 || err?.response?.status === 404) return null
        throw err
      }
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId),
    staleTime: 30 * 1000,
    retry: false
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
    }) =>
      fetchExtractAssets(payload.projectId, payload.scriptId, payload.episodeIds, payload.force),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
    }
  })
}

/** 获取资产提取结果 */
export function useExtractedAssets(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.extractedAssets(projectId, scriptId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const id = toValue(scriptId)
      if (!pid || !id) return null
      return await fetchGetExtractedAssets(pid, id)
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId),
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
    }) =>
      fetchReviewScriptContent(
        payload.projectId,
        payload.scriptId,
        payload.episodeIds,
        payload.force
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
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
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
    }
  })
}

/** 获取风格配置 */
export function useStyleConfig(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.styleConfig(projectId, scriptId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const id = toValue(scriptId)
      if (!pid || !id) return null
      // 文档：GET /api/scripts/{scriptId}/style-config（不含 projects 前缀）
      // projectId 仅作为 queryKey 缓存维度，不参与请求
      return await fetchGetStyleConfig(id)
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId),
    staleTime: 60 * 1000
  })
}

/**
 * 参考图风格反推
 * 文档：POST /api/projects/{projectId}/ref-analysis（项目级触发）
 */
export function useRefAnalysis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId?: string
      params: Api.Script.RefAnalysisParams
    }) => fetchRefAnalysis(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      if (variables.scriptId) {
        queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
        queryClient.invalidateQueries({
          queryKey: scriptKeys.refAnalysis(variables.projectId, variables.scriptId)
        })
      }
    }
  })
}

/**
 * 获取参考图分析结果（剧本级）
 * 文档：GET /api/scripts/{scriptId}/ref-analysis（不含 projects 前缀）
 */
export function useRefAnalysisResult(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.refAnalysis(projectId, scriptId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const id = toValue(scriptId)
      if (!pid || !id) return null
      return await fetchGetRefAnalysis(id)
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId),
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
    }) =>
      fetchGenerateVoicePrompts(
        payload.projectId,
        payload.scriptId,
        payload.characterProfileId,
        payload.force
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
    }
  })
}

/** 获取音色提示词（文档：GET /api/scripts/{id}/voice-prompts，projectId 仅作缓存维度） */
export function useVoicePrompts(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.voicePrompts(projectId, scriptId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const id = toValue(scriptId)
      if (!pid || !id) return null
      return await fetchGetVoicePrompts(id)
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId),
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
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
    }
  })
}

/** 获取资产提示词（文档：GET /api/scripts/{id}/asset-prompts，projectId 仅作缓存维度） */
export function useAssetPrompts(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.assetPrompts(projectId, scriptId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const id = toValue(scriptId)
      if (!pid || !id) return null
      return await fetchGetAssetPrompts(id)
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId),
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
      queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.scriptId) })
      queryClient.invalidateQueries({
        queryKey: scriptKeys.assetImages(variables.projectId, variables.scriptId)
      })
    }
  })
}

/** 获取资产图片（文档：GET /api/scripts/{id}/asset-images，projectId 仅作缓存维度） */
export function useAssetImages(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.assetImages(projectId, scriptId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const id = toValue(scriptId)
      if (!pid || !id) return []
      return await fetchGetAssetImages(id)
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId),
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
      queryClient.invalidateQueries({
        queryKey: scriptKeys.assetImages(variables.projectId, variables.scriptId)
      })
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
    }) =>
      fetchGenerateVideoPrompts(
        payload.projectId,
        payload.scriptId,
        payload.episodeId,
        payload.styleConfigId,
        payload.force
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: scriptKeys.episode(variables.projectId, variables.scriptId, variables.episodeId)
      })
    }
  })
}

/** 获取视频提示词 */
export function useVideoPrompts(
  projectId: MaybeRefOrGetter<string | undefined>,
  episodeId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: scriptKeys.videoPrompts(projectId, episodeId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const id = toValue(episodeId)
      if (!pid || !id) return null
      return await fetchGetVideoPrompts(id)
    },
    enabled: () => !!toValue(projectId) && !!toValue(episodeId),
    staleTime: 60 * 1000
  })
}
