import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetStoryboardList,
  fetchGetStoryboardDetail,
  fetchCreateStoryboard,
  fetchUpdateStoryboard,
  fetchDeleteStoryboard,
  fetchBatchDeleteStoryboards,
  fetchSubmitStoryboardReview,
  fetchBatchSubmitStoryboardReview,
  fetchWithdrawStoryboardReview,
  fetchGetStoryboardVersions,
  fetchRollbackStoryboardVersion,
  fetchGetStoryboardImages,
  fetchReorderStoryboards,
  fetchGetSceneList,
  fetchCreateScene,
  fetchDeleteScene,
  fetchUpdateScene,
  fetchDecomposeStoryboard,
  fetchRebuildStoryboard,
  fetchGetScriptStoryboards
} from '@/api/storyboard'

const QUERY_KEY = 'storyboard' as const

/** 分镜列表 */
export function useStoryboardList(
  projectId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<Api.Storyboard.StoryboardSearchParams | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', projectId, params] as const,
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetStoryboardList(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(projectId),
    staleTime: 30 * 1000
  })
}

/** 分镜详情 */
export function useStoryboardDetail(storyboardId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', storyboardId] as const,
    queryFn: async () => {
      const id = toValue(storyboardId)
      if (!id) return null
      const res = await fetchGetStoryboardDetail(id)
      return res ?? null
    },
    enabled: () => !!toValue(storyboardId),
    staleTime: 60 * 1000
  })
}

/** 创建分镜 */
export function useCreateStoryboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Storyboard.CreateStoryboardParams }) =>
      fetchCreateStoryboard(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'list', variables.projectId]
      })
    }
  })
}

/** 更新分镜 */
export function useUpdateStoryboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      storyboardId: string
      params: Api.Storyboard.UpdateStoryboardParams
      projectId?: string
    }) => fetchUpdateStoryboard(payload.storyboardId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'detail', variables.storyboardId]
      })
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'list', variables.projectId]
        })
      }
    }
  })
}

/** 删除分镜 */
export function useDeleteStoryboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { storyboardId: string; projectId?: string }) =>
      fetchDeleteStoryboard(payload.storyboardId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'list', variables.projectId]
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'detail', variables.storyboardId]
      })
    }
  })
}

/** 批量删除分镜 */
export function useBatchDeleteStoryboards() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { storyboardIds: string[]; projectId?: string }) =>
      fetchBatchDeleteStoryboards(payload.storyboardIds),
    onSuccess: (_data, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'list', variables.projectId]
        })
      }
    }
  })
}

/** 提交分镜审核 */
export function useSubmitStoryboardReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { storyboardId: string; projectId?: string }) =>
      fetchSubmitStoryboardReview(payload.storyboardId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'detail', variables.storyboardId]
      })
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'list', variables.projectId]
        })
      }
    }
  })
}

/** 批量提交分镜审核 */
export function useBatchSubmitStoryboardReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { storyboardIds: string[]; note?: string; projectId?: string }) =>
      fetchBatchSubmitStoryboardReview(payload.storyboardIds, payload.note),
    onSuccess: (_data, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'list', variables.projectId]
        })
      }
    }
  })
}

/** 撤回分镜审核 */
export function useWithdrawStoryboardReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { storyboardId: string; projectId?: string }) =>
      fetchWithdrawStoryboardReview(payload.storyboardId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'detail', variables.storyboardId]
      })
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'list', variables.projectId]
        })
      }
    }
  })
}

/** 分镜版本历史 */
export function useStoryboardVersions(storyboardId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'versions', storyboardId] as const,
    queryFn: async () => {
      const id = toValue(storyboardId)
      if (!id) return []
      const res = await fetchGetStoryboardVersions(id)
      return res ?? []
    },
    enabled: () => !!toValue(storyboardId),
    staleTime: 60 * 1000
  })
}

/** 回退分镜版本 */
export function useRollbackStoryboardVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { storyboardId: string; versionId: string; projectId?: string }) =>
      fetchRollbackStoryboardVersion(payload.storyboardId, payload.versionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'versions', variables.storyboardId]
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'detail', variables.storyboardId]
      })
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'list', variables.projectId]
        })
      }
    }
  })
}

/** 分镜图片列表 */
export function useStoryboardImages(storyboardId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'images', storyboardId] as const,
    queryFn: async () => {
      const id = toValue(storyboardId)
      if (!id) return []
      const res = await fetchGetStoryboardImages(id)
      return res ?? []
    },
    enabled: () => !!toValue(storyboardId),
    staleTime: 60 * 1000
  })
}

/** 场景列表 */
export function useSceneList(episodeId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'scenes', episodeId] as const,
    queryFn: async () => {
      const id = toValue(episodeId)
      if (!id) return []
      const res = await fetchGetSceneList(id)
      return res ?? []
    },
    enabled: () => !!toValue(episodeId),
    staleTime: 30 * 1000
  })
}

/** 创建场景 */
export function useCreateScene() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Storyboard.CreateSceneParams) => fetchCreateScene(params),
    onSuccess: (_data, variables) => {
      if (variables.episodeId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'scenes', variables.episodeId]
        })
      }
    }
  })
}

/** 更新场景 */
export function useUpdateScene() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { sceneId: string; params: Partial<Api.Storyboard.CreateSceneParams> }) =>
      fetchUpdateScene(payload.sceneId, payload.params),
    onSuccess: (_data, variables) => {
      if (variables.params.episodeId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'scenes', variables.params.episodeId]
        })
      }
    }
  })
}

/** 删除场景 */
export function useDeleteScene() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { sceneId: string; episodeId?: string }) =>
      fetchDeleteScene(payload.sceneId),
    onSuccess: (_data, variables) => {
      if (variables.episodeId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'scenes', variables.episodeId]
        })
      }
    }
  })
}

/** 分镜排序 */
export function useReorderStoryboards() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      sceneId: string
      items: Array<{ storyboardId: string; newOrder: number }>
      projectId?: string
    }) => fetchReorderStoryboards(payload.sceneId, payload.items),
    onSuccess: (_data, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, 'list', variables.projectId]
        })
      }
    }
  })
}

/** 剧本分镜拆解 */
export function useDecomposeStoryboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      episodeId: string
      styleConfigId?: string
    }) =>
      fetchDecomposeStoryboard(
        payload.projectId,
        payload.scriptId,
        payload.episodeId,
        payload.styleConfigId
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'list', variables.projectId]
      })
    }
  })
}

/** 剧本分镜重建 */
export function useRebuildStoryboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      scriptId: string
      episodeId: string
      params: Api.Storyboard.RebuildParams
    }) =>
      fetchRebuildStoryboard(
        payload.projectId,
        payload.scriptId,
        payload.episodeId,
        payload.params
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'list', variables.projectId]
      })
    }
  })
}

/** 获取剧本分镜 */
export function useScriptStoryboards(
  projectId: MaybeRefOrGetter<string | undefined>,
  scriptId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: [QUERY_KEY, 'script-storyboards', projectId, scriptId] as const,
    queryFn: async () => {
      const pid = toValue(projectId)
      const sid = toValue(scriptId)
      if (!pid || !sid) return null
      const res = await fetchGetScriptStoryboards(pid, sid)
      return res ?? null
    },
    enabled: () => !!toValue(projectId) && !!toValue(scriptId),
    staleTime: 60 * 1000
  })
}
