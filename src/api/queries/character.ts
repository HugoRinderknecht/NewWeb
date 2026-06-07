import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetCharacterList,
  fetchGetCharacterDetail,
  fetchCreateCharacter,
  fetchUpdateCharacter,
  fetchDeleteCharacter
} from '@/api/character'

import { characterKeys } from './keys'

export function useCharacterList(
  projectId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: characterKeys.list(projectId),
    queryFn: async () => {
      const id = toValue(projectId)
      if (!id) return []
      const res = await fetchGetCharacterList(id)
      return res ?? []
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
