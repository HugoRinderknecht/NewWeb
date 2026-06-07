import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchPreviewVideoGeneration,
  fetchSubmitVideoGeneration,
  fetchGetVideoTaskList,
  fetchGetVideoTaskDetail,
  fetchGetVideoTaskResult,
  fetchCancelVideoTask
} from '@/api/video'

import { videoKeys } from './keys'

// ==================== 查询 ====================

/** 视频任务列表（分页） */
export function useVideoTaskList(
  params?: MaybeRefOrGetter<Api.Video.VideoTaskSearchParams | undefined>
) {
  return useQuery({
    queryKey: videoKeys.tasks(params),
    queryFn: async () => {
      const res = await fetchGetVideoTaskList(toValue(params))
      return res ?? null
    },
    staleTime: 30 * 1000
  })
}

/** 视频任务详情 */
export function useVideoTaskDetail(taskId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: videoKeys.detail(taskId),
    queryFn: async () => {
      const id = toValue(taskId)
      if (!id) return null
      return await fetchGetVideoTaskDetail(id)
    },
    enabled: () => !!toValue(taskId),
    staleTime: 10 * 1000
  })
}

/** 视频任务结果 */
export function useVideoTaskResult(
  taskId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<{ resolution?: string } | undefined>
) {
  return useQuery({
    queryKey: videoKeys.result(taskId, params),
    queryFn: async () => {
      const id = toValue(taskId)
      if (!id) return null
      return await fetchGetVideoTaskResult(id, toValue(params))
    },
    enabled: () => !!toValue(taskId),
    staleTime: 10 * 1000,
    refetchInterval: 5000
  })
}

// ==================== Mutations ====================

/** 预览视频生成 */
export function usePreviewVideoGeneration() {
  return useMutation({
    mutationFn: (params: Api.Video.VideoPreviewParams) => fetchPreviewVideoGeneration(params)
  })
}

/** 提交视频生成任务 */
export function useSubmitVideoGeneration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Video.VideoGenerateParams) => fetchSubmitVideoGeneration(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.taskLists() })
    }
  })
}

/** 取消视频任务 */
export function useCancelVideoTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => fetchCancelVideoTask(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(taskId) })
      queryClient.invalidateQueries({ queryKey: videoKeys.taskLists() })
    }
  })
}
