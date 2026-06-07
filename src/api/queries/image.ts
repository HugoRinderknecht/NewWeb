import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetImageModels,
  fetchGetImageModelDetail,
  fetchSubmitImageGeneration,
  fetchGetImageTaskStatus,
  fetchGetImageTaskResult
} from '@/api/image'

import { imageKeys } from './keys'

// ==================== 查询 ====================

/** 图片模型列表 */
export function useImageModels() {
  return useQuery({
    queryKey: imageKeys.models(),
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
    queryKey: imageKeys.modelDetail(modelCode),
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
    queryKey: imageKeys.taskStatus(taskId),
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
    queryKey: imageKeys.taskResult(taskId),
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
      queryClient.invalidateQueries({ queryKey: imageKeys.taskStatuses() })
      queryClient.invalidateQueries({ queryKey: imageKeys.taskResults() })
    }
  })
}
