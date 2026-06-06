import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetImageModels,
  fetchGetImageModelDetail,
  fetchSubmitImageGeneration,
  fetchGetImageTaskStatus,
  fetchGetImageTaskResult
} from '@/api/image'

const QUERY_KEY = 'image' as const

// ==================== 查询 ====================

/** 图片模型列表 */
export function useImageModels() {
  return useQuery({
    queryKey: [QUERY_KEY, 'models'] as const,
    queryFn: async () => {
      const res = await fetchGetImageModels()
      return res ?? []
    },
    staleTime: 5 * 60 * 1000
  })
}

/** 图片模型详情 */
export function useImageModelDetail(modelCode: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'model-detail', modelCode] as const,
    queryFn: async () => {
      const id = toValue(modelCode)
      if (!id) return null
      return await fetchGetImageModelDetail(id)
    },
    enabled: () => !!toValue(modelCode)
  })
}

/** 图片任务状态（轮询） */
export function useImageTaskStatus(taskId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'task-status', taskId] as const,
    queryFn: async () => {
      const id = toValue(taskId)
      if (!id) return null
      return await fetchGetImageTaskStatus(id)
    },
    enabled: () => !!toValue(taskId),
    refetchInterval: 3000
  })
}

/** 图片任务结果 */
export function useImageTaskResult(taskId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'task-result', taskId] as const,
    queryFn: async () => {
      const id = toValue(taskId)
      if (!id) return null
      return await fetchGetImageTaskResult(id)
    },
    enabled: () => !!toValue(taskId)
  })
}

// ==================== Mutations ====================

/** 提交图片生成任务 */
export function useSubmitImageGeneration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Image.ImageGenerateParams) => fetchSubmitImageGeneration(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'task-status'] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'task-result'] })
    }
  })
}
