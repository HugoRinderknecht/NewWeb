import { getApiAdapter } from './adapter'

export function fetchGetCharacterList(
  projectId: string,
  params?: { page?: number; pageSize?: number }
) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Character.CharacterListItem>>(
    `/api/projects/${projectId}/characters`,
    params
  )
}

export function fetchCreateCharacter(projectId: string, data: Api.Character.CreateCharacterParams) {
  return getApiAdapter().post<Api.Character.CharacterDetail>(
    `/api/projects/${projectId}/characters`,
    data
  )
}

export function fetchGetCharacterDetail(projectId: string, characterId: string) {
  return getApiAdapter().get<Api.Character.CharacterDetail>(
    `/api/projects/${projectId}/characters/${characterId}`
  )
}

export function fetchUpdateCharacter(
  projectId: string,
  characterId: string,
  data: Api.Character.UpdateCharacterParams
) {
  return getApiAdapter().put<Api.Character.CharacterDetail>(
    `/api/projects/${projectId}/characters/${characterId}`,
    data
  )
}

export function fetchDeleteCharacter(projectId: string, characterId: string) {
  return getApiAdapter().del<void>(`/api/projects/${projectId}/characters/${characterId}`)
}

export function fetchLinkCharacterToStoryboard(
  projectId: string,
  characterId: string,
  storyboardId: string
) {
  return getApiAdapter().post<void>(
    `/api/projects/${projectId}/characters/${characterId}/link/${storyboardId}`
  )
}

export function fetchUnlinkCharacterFromStoryboard(
  projectId: string,
  characterId: string,
  storyboardId: string
) {
  return getApiAdapter().del<void>(
    `/api/projects/${projectId}/characters/${characterId}/unlink/${storyboardId}`
  )
}

export function fetchGetCharactersByStoryboard(projectId: string, storyboardId: string) {
  return getApiAdapter().get<Api.Character.CharacterListItem[]>(
    `/api/projects/${projectId}/characters/by-storyboard/${storyboardId}`
  )
}
