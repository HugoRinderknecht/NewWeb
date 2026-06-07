import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetProjectList,
  fetchGetProjectDetail,
  fetchCreateProject,
  fetchUpdateProject,
  fetchDeleteProject,
  fetchArchiveProject,
  fetchRestoreProject,
  fetchCopyProject,
  fetchUploadProjectCover,
  fetchGetProjectMembers,
  fetchAddProjectMember,
  fetchUpdateProjectMemberRole,
  fetchRemoveProjectMember,
  fetchGetProjectConfig,
  fetchUpdateProjectConfig,
  fetchGetReviewConfig,
  fetchUpdateReviewConfig,
  fetchGetProjectStatistics
} from '@/api/project'
import { fetchGetProjectEpisodes } from '@/api/script'

import { projectKeys } from './keys'

export function useProjectList(
  params: MaybeRefOrGetter<Api.Project.ProjectSearchParams | undefined>
) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: async ({ queryKey }) => {
      const [, , searchParams] = queryKey
      const res = await fetchGetProjectList(searchParams as any)
      return res ?? null
    }
  })
}

export function useProjectDetail(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectDetail(id)
      return res ?? null
    },
    enabled: () => !!toValue(projectId),
    retry: false
  })
}

export function useProjectMembers(
  projectId: MaybeRefOrGetter<string | undefined>,
  params: MaybeRefOrGetter<Api.Project.MemberSearchParams | undefined>
) {
  return useQuery({
    queryKey: projectKeys.members(projectId, params),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectMembers(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

export function useProjectConfig(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: projectKeys.config(projectId),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectConfig(id)
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

export function useReviewConfig(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: projectKeys.reviewConfig(projectId),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetReviewConfig(id)
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

export function useProjectStatistics(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: projectKeys.statistics(projectId),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetProjectStatistics(id)
      return res ?? null
    },
    enabled: () => !!toValue(projectId)
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Project.CreateProjectParams) => fetchCreateProject(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all() })
    }
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Project.UpdateProjectParams }) =>
      fetchUpdateProject(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all() })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    }
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => fetchDeleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all() })
    }
  })
}

export function useArchiveProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => fetchArchiveProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all() })
    }
  })
}

export function useRestoreProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => fetchRestoreProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all() })
    }
  })
}

export function useCopyProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { projectId: string; projectName?: string }) =>
      fetchCopyProject(params.projectId, params.projectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all() })
    }
  })
}

export function useUploadProjectCover() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; file: File }) =>
      fetchUploadProjectCover(payload.projectId, payload.file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    }
  })
}

export function useAddProjectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Project.AddMemberParams }) =>
      fetchAddProjectMember(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.membersByProject(variables.projectId) })
    }
  })
}

export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Project.UpdateMemberRoleParams }) =>
      fetchUpdateProjectMemberRole(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.membersByProject(variables.projectId) })
    }
  })
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; memberId: string }) =>
      fetchRemoveProjectMember(payload.projectId, payload.memberId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.membersByProject(variables.projectId) })
    }
  })
}

export function useUpdateProjectConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; configs: Record<string, string> }) =>
      fetchUpdateProjectConfig(payload.projectId, payload.configs),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.config(variables.projectId) })
    }
  })
}

export function useUpdateReviewConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; params: Api.Project.ReviewConfigParams }) =>
      fetchUpdateReviewConfig(payload.projectId, payload.params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.reviewConfig(variables.projectId) })
    }
  })
}

/** 项目剧集列表 */
export function useProjectEpisodes(projectId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: projectKeys.episodes(projectId),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return []
      const res = await fetchGetProjectEpisodes(id)
      return res ?? []
    },
    enabled: () => !!toValue(projectId),
    staleTime: 60 * 1000
  })
}
