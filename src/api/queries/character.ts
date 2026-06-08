import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetCharacterList,
  fetchGetCharacterDetail,
  fetchCreateCharacter,
  fetchUpdateCharacter,
  fetchDeleteCharacter,
  fetchLinkCharacterToStoryboard,
  fetchUnlinkCharacterFromStoryboard,
  fetchGetCharactersByStoryboard
} from '@/api/character'

import { characterKeys } from './keys'

export function useCharacterList(
  projectId: MaybeRefOrGetter<string | undefined>,
  params?: MaybeRefOrGetter<{ page?: number; pageSize?: number } | undefined>
) {
  return useQuery({
    queryKey: characterKeys.list(projectId, params),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return null
      const res = await fetchGetCharacterList(id, toValue(params))
      return res ?? null
    },
    enabled: () => !!toValue(projectId),
    staleTime: 30 * 1000
  })
}

export function useCharacterDetail(
  projectId: MaybeRefOrGetter<string | undefined>,
  characterId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: characterKeys.detail(projectId, characterId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const cid = toValue(characterId)
      if (!pid || !cid) return null
      const res = await fetchGetCharacterDetail(pid, cid)
      return res ?? null
    },
    enabled: () => !!toValue(projectId) && !!toValue(characterId),
    staleTime: 60 * 1000
  })
}

export function useCreateCharacter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; data: Api.Character.CreateCharacterParams }) =>
      fetchCreateCharacter(payload.projectId, payload.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: characterKeys.list(variables.projectId) })
    }
  })
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      characterId: string
      data: Api.Character.UpdateCharacterParams
    }) => fetchUpdateCharacter(payload.projectId, payload.characterId, payload.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: characterKeys.list(variables.projectId) })
      queryClient.invalidateQueries({
        queryKey: characterKeys.detail(variables.projectId, variables.characterId)
      })
    }
  })
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; characterId: string }) =>
      fetchDeleteCharacter(payload.projectId, payload.characterId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: characterKeys.list(variables.projectId) })
    }
  })
}

/** 获取分镜关联角色列表（文档 §6：GET .../characters/by-storyboard/{storyboardId}） */
export function useCharactersByStoryboard(
  projectId: MaybeRefOrGetter<string | undefined>,
  storyboardId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: characterKeys.byStoryboard(projectId, storyboardId),
    queryFn: async () => {
      const pid = toValue(projectId)
      const sid = toValue(storyboardId)
      if (!pid || !sid) return []
      const res = await fetchGetCharactersByStoryboard(pid, sid)
      return res ?? []
    },
    enabled: () => !!toValue(projectId) && !!toValue(storyboardId),
    staleTime: 30 * 1000
  })
}

/** 关联角色到分镜（文档 §6：POST .../characters/{characterId}/link/{storyboardId}） */
export function useLinkCharacterToStoryboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; characterId: string; storyboardId: string }) =>
      fetchLinkCharacterToStoryboard(payload.projectId, payload.characterId, payload.storyboardId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: characterKeys.byStoryboard(variables.projectId, variables.storyboardId)
      })
    }
  })
}

/** 解绑角色与分镜（文档 §6：DELETE .../characters/{characterId}/unlink/{storyboardId}） */
export function useUnlinkCharacterFromStoryboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; characterId: string; storyboardId: string }) =>
      fetchUnlinkCharacterFromStoryboard(
        payload.projectId,
        payload.characterId,
        payload.storyboardId
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: characterKeys.byStoryboard(variables.projectId, variables.storyboardId)
      })
    }
  })
}
