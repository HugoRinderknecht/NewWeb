import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetEditProjectList,
  fetchGetEditProjectDetail,
  fetchCreateEditProject,
  fetchUpdateEditProject,
  fetchDeleteEditProject,
  fetchGetExportStatus,
  fetchExportVideo,
  fetchReorderSegments,
  fetchAddSegment,
  fetchDeleteSegment,
  fetchUpdateSegment
} from '@/api/editor'

import { editorKeys } from './keys'

// ==================== 查询 ====================

/** 编辑项目列表 */
export function useEditProjectList(
  params?: MaybeRefOrGetter<Api.Editor.EditProjectSearchParams | undefined>
) {
  return useQuery({
    queryKey: editorKeys.list(params),
    queryFn: async () => {
      const res = await fetchGetEditProjectList(toValue(params))
      return res ?? null
    },
    staleTime: 30 * 1000
  })
}

/** 编辑项目详情 */
export function useEditProjectDetail(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: editorKeys.detail(projectId),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      return await fetchGetEditProjectDetail(id)
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 导出状态 */
export function useExportStatus(taskId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: editorKeys.exportStatus(taskId),
    queryFn: async () => {
      const id = toValue(taskId)
      if (!id) return null
      return await fetchGetExportStatus(id)
    },
    enabled: () => !!toValue(taskId),
    staleTime: 5 * 1000
  })
}

// ==================== Mutations ====================

/** 创建编辑项目 */
export function useCreateEditProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Editor.CreateEditProjectParams) => fetchCreateEditProject(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: editorKeys.lists() })
    }
  })
}

/** 更新编辑项目 */
export function useUpdateEditProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, params }: { projectId: string; params: Api.Editor.UpdateEditProjectParams }) =>
      fetchUpdateEditProject(projectId, params),
    onSuccess: (_data, variables) => {
      // 精确失效：列表 + 当前项目详情（避免影响其他编辑项目）
      queryClient.invalidateQueries({ queryKey: editorKeys.lists() })
      queryClient.invalidateQueries({ queryKey: editorKeys.detail(variables.projectId) })
    }
  })
}

/** 删除编辑项目 */
export function useDeleteEditProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => fetchDeleteEditProject(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({ queryKey: editorKeys.lists() })
      // 移除被删除项目的详情缓存
      queryClient.removeQueries({ queryKey: editorKeys.detail(projectId) })
    }
  })
}

/** 导出视频 */
export function useExportVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, params }: { projectId: string; params: Api.Editor.ExportParams }) =>
      fetchExportVideo(projectId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: editorKeys.exportStatuses() })
    }
  })
}

/** 重新排序片段 */
export function useReorderSegments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, segmentIds }: { projectId: string; segmentIds: string[] }) =>
      fetchReorderSegments(projectId, segmentIds),
    onSuccess: (_data, variables) => {
      // 精确失效：仅失效当前项目详情，避免影响其他编辑项目
      queryClient.invalidateQueries({ queryKey: editorKeys.detail(variables.projectId) })
    }
  })
}

/** 添加片段 */
export function useAddSegment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, params }: { projectId: string; params: Api.Editor.AddSegmentParams }) =>
      fetchAddSegment(projectId, params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: editorKeys.detail(variables.projectId) })
    }
  })
}

/** 删除片段 */
export function useDeleteSegment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, segmentId }: { projectId: string; segmentId: string }) =>
      fetchDeleteSegment(projectId, segmentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: editorKeys.detail(variables.projectId) })
    }
  })
}

/** 更新片段 */
export function useUpdateSegment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      segmentId,
      params
    }: {
      projectId: string
      segmentId: string
      params: Api.Editor.UpdateSegmentParams
    }) => fetchUpdateSegment(projectId, segmentId, params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: editorKeys.detail(variables.projectId) })
    }
  })
}
