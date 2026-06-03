/**
 * 项目管理模块 vue-query 封装层
 *
 * 提供 query keys 工厂和 composable 函数，供 view 层直接使用。
 * 所有数据请求均通过此层，自动获得缓存、失效、重试、loading 等能力。
 *
 * @module api/queries/project
 */

import { computed, toValue, type Ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { logger } from '@/utils/logger'
import * as projectApi from '@/api/project'

const MODULE = 'project'

// ==================== Query Keys 工厂 ====================

export const projectKeys = {
  all: ['project'],
  lists: () => [...projectKeys.all, 'list'],
  list: (params?: Api.Project.ProjectSearchParams) => [...projectKeys.lists(), params],
  details: () => [...projectKeys.all, 'detail'],
  detail: (id: string) => [...projectKeys.details(), id],
  members: (projectId: string) => [...projectKeys.all, 'members', projectId],
  memberList: (projectId: string, params?: Api.Project.MemberSearchParams) => [
    ...projectKeys.members(projectId),
    params
  ],
  config: (projectId: string) => [...projectKeys.all, 'config', projectId],
  reviewConfig: (projectId: string) => [...projectKeys.all, 'review-config', projectId],
  statistics: (projectId: string) => [...projectKeys.all, 'statistics', projectId]
}

// ==================== Query Composables ====================

/** 项目列表查询 */
export function useProjectList(
  params?: Ref<Api.Project.ProjectSearchParams> | Api.Project.ProjectSearchParams
) {
  return useQuery({
    queryKey: computed(() => projectKeys.list(toValue(params))),
    queryFn: () => {
      const p = toValue(params)
      logger.apiRequest(MODULE, 'fetchGetProjectList', p)
      return projectApi.fetchGetProjectList(p)
    }
  })
}

/** 项目详情查询 */
export function useProjectDetail(projectId: Ref<string | undefined>) {
  return useQuery({
    queryKey: computed(() => projectKeys.detail(projectId.value ?? '')),
    queryFn: () => {
      if (!projectId.value) throw new Error('projectId is required')
      logger.apiRequest(MODULE, 'fetchGetProjectDetail', projectId.value)
      return projectApi.fetchGetProjectDetail(projectId.value)
    },
    enabled: computed(() => !!projectId.value)
  })
}

/** 项目成员列表查询 */
export function useProjectMembers(
  projectId: Ref<string | undefined>,
  params?: Ref<Api.Project.MemberSearchParams> | Api.Project.MemberSearchParams
) {
  return useQuery({
    queryKey: computed(() => projectKeys.memberList(projectId.value ?? '', toValue(params))),
    queryFn: () => {
      if (!projectId.value) throw new Error('projectId is required')
      logger.apiRequest(MODULE, 'fetchGetProjectMembers', projectId.value)
      return projectApi.fetchGetProjectMembers(projectId.value, toValue(params))
    },
    enabled: computed(() => !!projectId.value)
  })
}

/** 项目配置查询 */
export function useProjectConfig(projectId: Ref<string | undefined>) {
  return useQuery({
    queryKey: computed(() => projectKeys.config(projectId.value ?? '')),
    queryFn: () => {
      if (!projectId.value) throw new Error('projectId is required')
      logger.apiRequest(MODULE, 'fetchGetProjectConfig', projectId.value)
      return projectApi.fetchGetProjectConfig(projectId.value)
    },
    enabled: computed(() => !!projectId.value)
  })
}

/** 审核门禁配置查询 */
export function useReviewConfig(projectId: Ref<string | undefined>) {
  return useQuery({
    queryKey: computed(() => projectKeys.reviewConfig(projectId.value ?? '')),
    queryFn: () => {
      if (!projectId.value) throw new Error('projectId is required')
      logger.apiRequest(MODULE, 'fetchGetReviewConfig', projectId.value)
      return projectApi.fetchGetReviewConfig(projectId.value)
    },
    enabled: computed(() => !!projectId.value)
  })
}

/** 项目统计查询 */
export function useProjectStatistics(projectId: Ref<string | undefined>) {
  return useQuery({
    queryKey: computed(() => projectKeys.statistics(projectId.value ?? '')),
    queryFn: () => {
      if (!projectId.value) throw new Error('projectId is required')
      logger.apiRequest(MODULE, 'fetchGetProjectStatistics', projectId.value)
      return projectApi.fetchGetProjectStatistics(projectId.value)
    },
    enabled: computed(() => !!projectId.value)
  })
}

// ==================== Mutation Composables ====================

/** 创建项目 */
export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Project.CreateProjectParams) => {
      logger.apiRequest(MODULE, 'fetchCreateProject', params)
      return projectApi.fetchCreateProject(params)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      logger.apiSuccess(MODULE, 'fetchCreateProject')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchCreateProject', err)
  })
}

/** 更新项目 */
export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      params
    }: {
      projectId: string
      params: Api.Project.UpdateProjectParams
    }) => {
      logger.apiRequest(MODULE, 'fetchUpdateProject', projectId)
      return projectApi.fetchUpdateProject(projectId, params)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      logger.apiSuccess(MODULE, 'fetchUpdateProject')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchUpdateProject', err)
  })
}

/** 删除项目 */
export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => {
      logger.apiRequest(MODULE, 'fetchDeleteProject', projectId)
      return projectApi.fetchDeleteProject(projectId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      logger.apiSuccess(MODULE, 'fetchDeleteProject')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchDeleteProject', err)
  })
}

/** 恢复项目 */
export function useRestoreProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => {
      logger.apiRequest(MODULE, 'fetchRestoreProject', projectId)
      return projectApi.fetchRestoreProject(projectId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      logger.apiSuccess(MODULE, 'fetchRestoreProject')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchRestoreProject', err)
  })
}

/** 归档项目 */
export function useArchiveProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => {
      logger.apiRequest(MODULE, 'fetchArchiveProject', projectId)
      return projectApi.fetchArchiveProject(projectId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      logger.apiSuccess(MODULE, 'fetchArchiveProject')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchArchiveProject', err)
  })
}

/** 解档项目 */
export function useUnarchiveProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => {
      logger.apiRequest(MODULE, 'fetchUnarchiveProject', projectId)
      return projectApi.fetchUnarchiveProject(projectId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      logger.apiSuccess(MODULE, 'fetchUnarchiveProject')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchUnarchiveProject', err)
  })
}

/** 修改项目状态 */
export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: number }) => {
      logger.apiRequest(MODULE, 'fetchUpdateProjectStatus', projectId)
      return projectApi.fetchUpdateProjectStatus(projectId, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      logger.apiSuccess(MODULE, 'fetchUpdateProjectStatus')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchUpdateProjectStatus', err)
  })
}

/** 复制项目 */
export function useCopyProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, projectName }: { projectId: string; projectName?: string }) => {
      logger.apiRequest(MODULE, 'fetchCopyProject', projectId)
      return projectApi.fetchCopyProject(projectId, projectName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      logger.apiSuccess(MODULE, 'fetchCopyProject')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchCopyProject', err)
  })
}

/** 上传项目封面 */
export function useUploadProjectCover() {
  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) => {
      logger.apiRequest(MODULE, 'fetchUploadProjectCover', projectId)
      return projectApi.fetchUploadProjectCover(projectId, file)
    },
    onSuccess: () => logger.apiSuccess(MODULE, 'fetchUploadProjectCover'),
    onError: (err) => logger.apiError(MODULE, 'fetchUploadProjectCover', err)
  })
}

/** 添加项目成员 */
export function useAddProjectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      params
    }: {
      projectId: string
      params: Api.Project.AddMemberParams
    }) => {
      logger.apiRequest(MODULE, 'fetchAddProjectMember', projectId)
      return projectApi.fetchAddProjectMember(projectId, params)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) })
      logger.apiSuccess(MODULE, 'fetchAddProjectMember')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchAddProjectMember', err)
  })
}

/** 修改成员角色 */
export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      params
    }: {
      projectId: string
      params: Api.Project.UpdateMemberRoleParams
    }) => {
      logger.apiRequest(MODULE, 'fetchUpdateProjectMemberRole', projectId)
      return projectApi.fetchUpdateProjectMemberRole(projectId, params)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) })
      logger.apiSuccess(MODULE, 'fetchUpdateProjectMemberRole')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchUpdateProjectMemberRole', err)
  })
}

/** 移除项目成员 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) => {
      logger.apiRequest(MODULE, 'fetchRemoveProjectMember', projectId)
      return projectApi.fetchRemoveProjectMember(projectId, memberId)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) })
      logger.apiSuccess(MODULE, 'fetchRemoveProjectMember')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchRemoveProjectMember', err)
  })
}

/** 更新项目配置 */
export function useUpdateProjectConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      configs
    }: {
      projectId: string
      configs: Record<string, string>
    }) => {
      logger.apiRequest(MODULE, 'fetchUpdateProjectConfig', projectId)
      return projectApi.fetchUpdateProjectConfig(projectId, configs)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.config(projectId) })
      logger.apiSuccess(MODULE, 'fetchUpdateProjectConfig')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchUpdateProjectConfig', err)
  })
}

/** 更新审核门禁配置 */
export function useUpdateReviewConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      params
    }: {
      projectId: string
      params: Api.Project.ReviewConfigParams
    }) => {
      logger.apiRequest(MODULE, 'fetchUpdateReviewConfig', projectId)
      return projectApi.fetchUpdateReviewConfig(projectId, params)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.reviewConfig(projectId) })
      logger.apiSuccess(MODULE, 'fetchUpdateReviewConfig')
    },
    onError: (err) => logger.apiError(MODULE, 'fetchUpdateReviewConfig', err)
  })
}
