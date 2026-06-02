import request from '@/utils/http'

export function fetchGetCharacterList(projectId: string) {
  return request.get<Api.Character.CharacterListItem[]>({
    url: `/api/projects/${projectId}/characters`
  })
}

export function fetchCreateCharacter(projectId: string, data: Api.Character.CreateCharacterParams) {
  return request.post<Api.Character.CharacterDetail>({
    url: `/api/projects/${projectId}/characters`,
    data
  })
}

export function fetchGetCharacterDetail(projectId: string, characterId: string) {
  return request.get<Api.Character.CharacterDetail>({
    url: `/api/projects/${projectId}/characters/${characterId}`
  })
}

export function fetchUpdateCharacter(projectId: string, characterId: string, data: Api.Character.UpdateCharacterParams) {
  return request.put<Api.Character.CharacterDetail>({
    url: `/api/projects/${projectId}/characters/${characterId}`,
    data
  })
}

export function fetchDeleteCharacter(projectId: string, characterId: string) {
  return request.del<void>({
    url: `/api/projects/${projectId}/characters/${characterId}`
  })
}

export function fetchLinkCharacterToStoryboard(projectId: string, characterId: string, storyboardId: string) {
  return request.post<void>({
    url: `/api/projects/${projectId}/characters/${characterId}/link/${storyboardId}`
  })
}

export function fetchUnlinkCharacterFromStoryboard(projectId: string, characterId: string, storyboardId: string) {
  return request.del<void>({
    url: `/api/projects/${projectId}/characters/${characterId}/unlink/${storyboardId}`
  })
}

export function fetchGetCharactersByStoryboard(projectId: string, storyboardId: string) {
  return request.get<Api.Character.CharacterListItem[]>({
    url: `/api/projects/${projectId}/characters/by-storyboard/${storyboardId}`
  })
}
