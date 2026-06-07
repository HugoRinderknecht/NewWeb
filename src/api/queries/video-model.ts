import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  fetchGetVideoModelList,
  fetchCreateVideoModel,
  fetchUpdateVideoModel,
  fetchDeleteVideoModel,
  fetchToggleVideoModelStatus
} from '@/api/video-model'

/** 视频模型列表 */
export function useVideoModelList() {
  return useQuery({
    queryKey: ['video-model', 'list'] as const,
    queryFn: () => fetchGetVideoModelList(),
    staleTime: 5 * 60 * 1000
  })
}

/** 创建视频模型 */
export function useCreateVideoModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchCreateVideoModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-model', 'list'] })
    }
  })
}

/** 更新视频模型 */
export function useUpdateVideoModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      modelId,
      data
    }: {
      modelId: string
      data: Parameters<typeof fetchUpdateVideoModel>[1]
    }) => fetchUpdateVideoModel(modelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-model', 'list'] })
    }
  })
}

/** 删除视频模型 */
export function useDeleteVideoModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchDeleteVideoModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-model', 'list'] })
    }
  })
}

/** 切换视频模型状态 */
export function useToggleVideoModelStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchToggleVideoModelStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-model', 'list'] })
    }
  })
}
